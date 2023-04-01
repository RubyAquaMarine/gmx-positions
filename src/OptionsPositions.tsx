import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Dexie from "dexie";
import { fetchLongAndShortPositions } from "./helpers";
import { format } from "date-fns";

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
  const db = new Dexie("optionsData") as Dexie & {
    data: Dexie.Table<OptionsData, number>;
  };

  db.version(1).stores({
    data: "++id, timestamp, longAmount, shortAmount",
  });

  const fetchData = async () => {
    try {
      const { availableLongAmountParsed, availableShortAmountParsed } =
        await fetchLongAndShortPositions();
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
        } as ChartData,
      ]);
    } catch {
      console.error("Error Fetching Data");
      // Use Stored Data
      const chartData = await (
        await db.data.toArray()
      ).map(
        (item) =>
          ({
            timestamp: item.timestamp,
            longAmount: item.longAmount,
            shortAmount: item.shortAmount,
          } as ChartData)
      );
      setChartData(chartData);
    }
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
    timestamp: format(new Date(item.timestamp), "MMM d, h:mm a"),
    longAmount: item.longAmount,
    shortAmount: item.shortAmount,
  }));

  return (
    // <ResponsiveContainer width={1000}>
    <AreaChart
      width={1800}
      height={1000}
      data={formattedData}
      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="timestamp"
        label={{ value: "Timestamp", position: "bottom" }}
      />
      <YAxis label={{ value: "Amount", angle: -90, position: "bottom" }} />
      <Tooltip />
      <Legend />
      <Area
        type="monotone"
        dataKey="longAmount"
        fill="none"
        stroke="green"
        strokeWidth={8}
      />
      <Area
        type="monotone"
        dataKey="shortAmount"
        fill="none"
        stroke="red"
        strokeWidth={8}
      />
    </AreaChart>
    // </ResponsiveContainer
  );
};

export default OptionsChart;
