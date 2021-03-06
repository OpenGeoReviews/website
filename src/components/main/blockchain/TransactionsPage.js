import React, {useEffect, useState} from 'react';

import {getBlock, getBlockTransactions} from "../../../api/data";
import {useParams} from "react-router";
import {usePromiseTracker} from "react-promise-tracker";
import {makeStyles} from "@material-ui/styles";

import {Box} from "@material-ui/core";
import Loader from "../blocks/Loader";
import OperationItem from "./blocks/list-items/OperationItem";
import BlockInfo from "./blocks/BlockInfo";
import BlocksList from "./blocks/BlocksList";
import BlocksHeader from "./blocks/BlocksHeader";
import Error404 from "../Error404";
import FilterOperations from "./blocks/FilterOperations";

const useStyles = makeStyles({
  header: {
    alignItems: "center",
    justifyContent: "space-between",
  }
});

export default function TransactionsPage() {
  const classes = useStyles()
  const { promiseInProgress } = usePromiseTracker();
  const {param} = useParams();
  const [state, setState] = useState({
    operations: [],
    block: null,
    loading: true,
  });
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const {loading, operations, block} = state;

  useEffect(() => {
    const fetchData = async () => {
      let block;
      let blockId = null;
      let hash = null;
      if (Number(param) > 0) {
        blockId = param;
      } else {
        hash = param;
      }

      try {
        block = await getBlock({blockId, hash});
      } catch(error) {
        setError(error);
        return;
      }

      setState({
        ...state,
        block,
        loading: false,
      });
    };

    fetchData();
  }, [param]);

  useEffect(() => {
    const fetchData = async () => {
      let operations;
      let count;
      try {
        const results = await getBlockTransactions({ blockId: block.block_id });
        operations = results.operations;
        count = results.count;
      } catch (error) {
        setError(error);
      }

      setState({
        ...state,
        operations,
        count,
      });
    };

    if (!loading) {
      fetchData();
    }
  }, [loading, block]);

  if (error) {
    if (error.code === 404) {
      return <Error404/>;
    }

    throw error;
  }

  const selectedOps = operations.filter((op) => {
    if (!filter) return true;
    return op.type === filter;
  });

  let content;
  if (!loading && !promiseInProgress) {
    if (selectedOps.length) {
      content = selectedOps.map((op) => <OperationItem key={op.hash} operation={op} blockId={block.block_id}/>)
    } else {
      content = (<Box display="flex" justifyContent="center"><p>No blocks available</p></Box>);
    }
  } else {
    return <Loader/>;
  }

  return <BlocksList>
    <Box display="flex" className={classes.header}>
      <BlocksHeader>{`Block#${block.block_id}`}</BlocksHeader>
      <FilterOperations onChange={setFilter} value={filter}/>
    </Box>
    <BlockInfo block={block}/>
    {content}
  </BlocksList>;
};
