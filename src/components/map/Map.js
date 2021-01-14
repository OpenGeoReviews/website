import React, {useContext, useEffect, useState} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchData } from "../../api/geo";
import storage from "../../libs/storage";
import AuthContext from "../main/auth/providers/AuthContext";

import useExtractImages from "./hooks/useExtractImages";
import {usePromiseTracker} from "react-promise-tracker";

import OPRLayer from "./OPRLayer";
import MapSidebar from "./blocks/sidebar/MapSidebar";

import StatusBar from "./blocks/StatusBar";
import Filter from "./blocks/Filter";
import ViewTracker from "./ViewTracker";
import OPRAttributesBar from "./blocks/OPRAttributesBar";
import MapSidebarBlock from "./blocks/sidebar/MapSidebarBlock";
import ImagesCarousel from "./blocks/ImagesCarousel";
import Loader from "../main/blocks/Loader";
import ReviewImagesBlock from "./blocks/ReviewImagesBlock";
import OPRLink from "../main/blocks/OPRLink";

const OPRStatusBar = React.memo(StatusBar);
const OPRMarkersFilter = React.memo(Filter);

export default function Map() {
  let initialLatLng = [40, -35];
  let initialZoom = 4;

  try {
    const view = JSON.parse(storage.mapView || '');
    if (!!view) {
      initialZoom = view.zoom;
      initialLatLng = [view.lat, view.lng];
    }
  } catch (e) {
    console.warn('Error while decoding saved view');
  }

  const {authData} = useContext(AuthContext);

  const [placeTypes, setPlaceTypes] = useState({});
  const [status, setStatus] = useState('');
  const [filterVal, setFilter] = useState('all');
  const [isTileBased, setTileBased] = useState(false);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState('filter');
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleSelect = (marker) => {
    setMarker(marker);

    if (marker) {
      setExpanded('attributes');
    } else {
      setExpanded('filter');
    }
  };

  const { promiseInProgress } = usePromiseTracker();
  const {images, setImages} = useExtractImages(marker);

  useEffect(() => {
    const request = async () => {
      const {tileBased, placeTypes} = await fetchData();
      setTileBased(tileBased);
      setPlaceTypes(placeTypes);
    };

    request();
  }, []);

  let imagesSidebar;
  if (promiseInProgress) {
    imagesSidebar = <Loader position="relative"/>;
  } else {
    imagesSidebar = <React.Fragment>
      {images.review && <MapSidebarBlock header={`Photos - To review (${images.review.length})`} expanded={expanded} onChange={handleChange} name="review">
        {authData.token ? <ReviewImagesBlock images={images} setImages={setImages}/> : <p><OPRLink to="/login">Log in</OPRLink> to review photos</p>}
      </MapSidebarBlock>}

      {images.outdoor && <MapSidebarBlock header={`Photos - Outdoor (${images.outdoor.length})`} expanded={expanded} onChange={handleChange} name="outdoor">
        <ImagesCarousel items={images.outdoor}/>
      </MapSidebarBlock>}

      {images.indoor && <MapSidebarBlock header={`Photos - Indoor (${images.indoor.length})`} expanded={expanded} onChange={handleChange} name="indoor">
        <ImagesCarousel items={images.indoor}/>
      </MapSidebarBlock>}
    </React.Fragment>;
  }

  return <MapContainer center={initialLatLng} zoom={initialZoom} zoomControl={false} whenReady={() => setLoading(false)}>
    <TileLayer
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
        url="https://tile.osmand.net/{z}/{x}/{y}.png"
        id="tiles"
    />
    <ViewTracker/>
    <MapSidebar>
      <MapSidebarBlock header="Filter places" expanded={expanded} onChange={handleChange} name="filter">
        <OPRMarkersFilter placeTypes={placeTypes} onSelect={setFilter}/>
        <OPRStatusBar status={status}/>
      </MapSidebarBlock>

      <MapSidebarBlock header="Attributes" expanded={expanded} onChange={handleChange} name="attributes">
        {marker ? <OPRAttributesBar feature={marker} setMarker={handleSelect} setExpanded={handleChange}
                                    expanded={expanded}/> : "Select point to view details"}
      </MapSidebarBlock>

      {imagesSidebar}
    </MapSidebar>

    {!loading && <OPRLayer initialZoom={initialZoom} setStatus={setStatus} filterVal={filterVal} isTileBased={isTileBased} onSelect={handleSelect}/>}
  </MapContainer>;
}