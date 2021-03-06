import React, {useContext, useEffect, useState} from 'react';

import config from "../../../config";
import {getObjects, getObjectsById} from "../../../api/data";
import OperationsContext from "./providers/OperationsContext";

import {Box} from "@material-ui/core";
import Loader from "../blocks/Loader";
import BlocksList from "./blocks/BlocksList";
import BlocksHeader from "./blocks/BlocksHeader";
import ObjectItem from "./blocks/list-items/ObjectItem";
import Error404 from "../Error404";
import qs from "qs";

const BLOCKS_PER_PAGE = config.blockchain.blocksPageLimit;

export default function ObjectsPage({match}) {
  const [state, setState] = useState({
    objects: [],
    loading: true,
  });
  const [error, setError] = useState(null);
  const {loading, objects} = state;
  const {params} = match;
  const type = params.type.replace('_', '.');
  const {key} = qs.parse(location.search.substring(1));
  const {types, loading: opsLoading} = useContext(OperationsContext);
  const typenames = Object.keys(types);

  useEffect(() => {
    const fetchData = async () => {
      let results;
      try {
        if (key) {
          results = await getObjectsById(type, key);
        } else {
          results = await getObjects({
            limit: BLOCKS_PER_PAGE,
            type,
          });
        }
      } catch (error) {
        setError(error)
        return;
      }

      const {objects: newObjects} = results;

      const newState = { ...state };
      newState.objects = newObjects;
      newState.loading = false;

      setState(newState);
    };

    if (!error) {
        fetchData();
    }
  }, [type, key]);

  useEffect(() => {
    if (key) {
      window.scrollTo(0, 0);
    }
  }, [key]);

  if (error) {
    throw error;
  }

  let content
  if (!loading && !opsLoading) {
    if (!typenames.includes(type)) {
      return <Error404/>;
    } else if (objects.length) {
      content = objects.map((ob) => <ObjectItem key={ob.id} object={ob}/>)
    } else {
      content = (<Box display="flex" justifyContent="center"><p>No objects available</p></Box>);
    }
  } else {
    return <Loader/>;
  }

  return <BlocksList>
    <BlocksHeader>Objects {key && key.split(',').join(', ')}</BlocksHeader>
    {content}
  </BlocksList>;
};
