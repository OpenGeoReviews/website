import React, {useEffect, useState} from 'react';
import {usePromiseTracker} from "react-promise-tracker";

import {getTransaction} from "../../../api/data";
import Loader from "../blocks/Loader";
import BlocksHeader from "./blocks/BlocksHeader";
import SummaryBlock from "./blocks/SummaryBlock";
import Value from "./blocks/Value";
import JSONViewer from "./blocks/JSONViewer/JSONViewer";
import ObjectsSummary from "./blocks/ObjectsSummary";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles({
  jsonViewer: {
    marginBottom: "24px",
  },
});

export default function TransactionPage({match}) {
  const {promiseInProgress} = usePromiseTracker();
  const [error, setError] = useState(null);
  const [state, setState] = useState({
    block: null,
    loading: true,
  });
  const classes = useStyles();

  const {params: { hash }} = match;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const block = await getTransaction(hash);
        setState({
          block,
          loading: false,
        });
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, [hash]);

  if (error) {
    if (error.code === 404) {
      return <div>
        <BlocksHeader>Transaction</BlocksHeader>
        <p>Transaction deprecated or not found</p>
      </div>;
    }

    throw error;
  }

  const {loading, block} = state;
  if (loading || promiseInProgress) {
    return <Loader/>;
  }

  const {signedByStr, shortHash} = block.clientData;
  return <div>
    <BlocksHeader>Transaction {shortHash}</BlocksHeader>
    <SummaryBlock>
      <p>Hash: <Value>{block.hash}</Value></p>
      <ObjectsSummary op={block}/>
      <p>Signed by: <Value>#{signedByStr}</Value></p>
    </SummaryBlock>
    <JSONViewer open={true} json={block} className={classes.jsonViewer}/>
  </div>;
};
