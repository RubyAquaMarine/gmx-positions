import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Dexie from 'dexie';
import { fetchLongAndShortPositions } from './helpers';
import { format } from 'date-fns';

interface ChartData {
    timestamp: number;
    longAmount: number;
    shortAmount: number;
}

interface OptionsData {
  id?: number;
  timestamp: number;
  longAmount: number;
  shortAmount: number;
}


const OptionsChart = () => {
  const [chartData, setChartData] = useState<Array<ChartData>>([]);
  const db = new Dexie('optionsData') as Dexie & { data: Dexie.Table<OptionsData, number> };

  db.version(1).stores({
    data: '++id, timestamp, longAmount, shortAmount',
  });

  const fetchData = async () => {
    // Use the provided code to fetch long and short positions
    const { availableLongAmountParsed, availableShortAmountParsed } = await fetchLongAndShortPositions();

    // Save fetched data to IndexedDB with timestamp
    await db.data.add({
      timestamp: Date.now(),
      longAmount: availableLongAmountParsed,
      shortAmount: availableShortAmountParsed,
    });

    // Update chart data
    setChartData((prevData) => [
      ...prevData,
      {
        timestamp: Date.now(),
        longAmount: availableLongAmountParsed,
        shortAmount: availableShortAmountParsed,
      } as ChartData
    ]);
  };

  useEffect(() => {
    // Fetch initial data
    fetchData();

    // Set up an interval to fetch data every 3 minutes
    const interval = setInterval(() => {
      fetchData();
    }, 180000);

    // Clean up the interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Format chart data
  const formattedData = chartData.map((item) => ({
    timestamp: format(new Date(item.timestamp), 'MMM d, h:mm a'),
    longAmount: item.longAmount,
    shortAmount: item.shortAmount,
  }));

  return (
    // <ResponsiveContainer width={1000}>
      <LineChart
        width={1200}
        height={700}
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" label={{ value: 'Timestamp', position: 'bottom' }} />
        <YAxis label={{ value: 'Amount', angle: -90, position: 'bottom' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="longAmount" stroke="green" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="shortAmount" stroke="red" />
      </LineChart>
    // </ResponsiveContainer>
  );
};

export default OptionsChart;
