import React, {useEffect, useState} from 'react';

import {getQueue} from "../../../../../api/data";

import SidebarItem from "./SidebarItem";
import QueueIcon from "../../assets/icons/QueueIcon";

export default function Queue() {
  const [opsCount, setCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count } = await getQueue();
        setCount(count);
      } catch (e) {
        console.warn('Network request failed');
      }
    }

    fetchData();
  }, []);

  return <SidebarItem count={opsCount} text="Queue" Icon={QueueIcon} to="/data/queue"/>;
}