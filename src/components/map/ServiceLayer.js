import React, {useEffect, useState} from 'react';
import {useMap, useMapEvent} from "react-leaflet";
import {OpenLocationCode} from "open-location-code";
import {isEqual} from "lodash";
import L from "leaflet";

import {fetchData} from "../../api/geo";
import GeoGSONLayer from "./GeoGSONLayer";

let refreshTimeout = null;
const REFRESH_TIMEOUT = 1000;

export default () => {
  const [isTileBased, setTileBased] = useState(false);
  const [currentBounds, setCurrentBounds] = useState({});
  const [currentLayer, setCurrentLayer] = useState({});
  const [placesCache, setPlacesCahe] = useState({
    "" : {
      data: {
        "type":"FeatureCollection",
        "features":[]
      }
    }
  });

  const map = useMap();
  const openLocationCode = new OpenLocationCode()
  let storage = window.localStorage;

  try {
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
  }
  catch(e) {
    console.warn("Your browser blocks access to localStorage");
    storage = null;
  }

  const onMapChange = async () => {
    if (!!storage) {
      const view = {
        lat: map.getCenter().lat,
        lng: map.getCenter().lng,
        zoom: map.getZoom()
      };

      storage.mapView = JSON.stringify(view);
    }

    if (isTileBased) {
      const bounds = map.getBounds();

      const lcodes = {};
      const INT_PR = 20;
      const tllat = Math.ceil(bounds.getNorth() * INT_PR);
      const tllon = Math.floor(bounds.getWest() * INT_PR);
      const brlat = Math.floor(bounds.getSouth() * INT_PR);
      const brlon = Math.ceil(bounds.getEast() * INT_PR);
      for (let lat = tllat; lat > brlat; lat--) {
        for (let lon = tllon; lon < brlon; lon++) {
          const clat = (lat - 0.5) / INT_PR ;
          const clon = (lon + 0.5) / INT_PR ;
          const tileId = openLocationCode.encode(clat, clon, 6).substring(0, 6);
          lcodes[tileId] = {};
        }
      }

      if (map.getZoom() <= 10) {
        console.log('zooming to get data');
      } else if (!isEqual(lcodes, currentBounds)) {
        const updatedPlaces = { ...placesCache };

        console.log("---------- map change ----------");
        console.log("currentBounds", lcodes);
        console.log("bounds equality", isEqual(lcodes, currentBounds));

        for(let tileId in lcodes) {
          if(!placesCache[tileId]) {
            updatedPlaces[tileId] = { "access": 1 };
            // on failure we can clear cache
            const { geo } = await fetchData({tileId});
            updatedPlaces[tileId].data = geo;
          } else {
            updatedPlaces[tileId].access = placesCache[tileId].access + 1;
          }
        }

        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
          setPlacesCahe(updatedPlaces);
        }, REFRESH_TIMEOUT);

        setCurrentBounds(lcodes);
      }
    }
  };

  useEffect(() => {
    const request = async () => {
      const {tileBased, geo: data} = await fetchData();
      setTileBased(tileBased);
      setPlacesCahe({ "": { data }});
    };

    const view = JSON.parse(storage.mapView || '');
    if (!!view) {
      map.setView(L.latLng(view.lat, view.lng), view.zoom);
    }

    request();
    onMapChange();
  }, []);

  useEffect(() => {

    let geoJson = {
      "type":"FeatureCollection",
      "features":[]
    };

    let msg;
    if (isTileBased) {
      let tiles = 0;
      let missing = 0;
      for (let k in currentBounds) {
        if (placesCache.hasOwnProperty(k)) {
          const {data: { features }} = placesCache[k];
          tiles++;
          geoJson.features = geoJson.features.concat(features);
          //TODO: filterVal !==all
        } else {
          missing++;
        }
      }
      msg = `${tiles} tiles have ${geoJson.features.length} places `;
      if (missing > 0) {
        msg += ` (${missing} tiles loading...) `;
      }
    } else {
      geoJson = placesCache[""].data;
      msg = `Loaded ${geoJson.features.length} places`;
    }

    //TODO: Show message
    console.log(msg);
    console.log("---------- refresh data ----------");
    setCurrentLayer(geoJson);

    if(Object.keys(placesCache).length >= 150) {
      const toDel = {};
      const updatedPlaces = { ...placesCache };

      for(let k in updatedPlaces) {
        if(!(k in currentBounds)) {
          toDel[k] = updatedPlaces[k].access;
        }
      }
      for(let k in toDel) {
        delete updatedPlaces[k];
      }

      setPlacesCahe(updatedPlaces);
    }
  }, [placesCache]);

  useMapEvent('moveend', () => {
    onMapChange();
  })

  return <GeoGSONLayer data={currentLayer}/>;
};
