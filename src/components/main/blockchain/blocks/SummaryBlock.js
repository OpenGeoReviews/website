import React from 'react';
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles({
  block: {
    background: "#F0F1F4",
    border: "1px solid #F0F1F4",
    borderRadius: "5px",
    padding: "15px",
    margin: "10px 0 25px 0",
    color: "#6A7181",
    fontSize: "15px",
    lineHeight: "1.5em",
    "& p": {
      margin: "5px",
    },
    "& span": {
      color: "#000",
    },
  },

})

export default function SummaryBlock({children}) {
  const classes = useStyles();
  return <div className={classes.block}>
    {children}
  </div>;
};
