import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StockGraph } from './ui';
import axios from 'axios';

const StockDetail = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [timeRange, setTimeRange] = useState('1D');
  const [loading, setLoading] = useState(true);

  const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Get current timestamp and calculate time range
        const end = Math.floor(Date.now() / 1000);
        const start = calculateStartTime(timeRange, end);

        // Fetch candlestick data
        const response = await axios.get(
          `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${getResolution(timeRange)}&from=${start}&to=${end}&token=${FINNHUB_API_KEY}`
        );

        // Transform data for the chart
        const formattedData = response.data.t.map((time, index) => ({
          time: new Date(time * 1000).toLocaleTimeString(),
          price: response.data.c[index],
          open: response.data.o[index],
          high: response.data.h[index],
          low: response.data.l[index],
          volume: response.data.v[index]
        }));

        setStockData(formattedData);

        // Fetch company info
        const companyResponse = await axios.get(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        setCompanyInfo(companyResponse.data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol, timeRange]);

  const calculateStartTime = (range, end) => {
    const ranges = {
      '1D': 24 * 60 * 60,
      '1W': 7 * 24 * 60 * 60,
      '1M': 30 * 24 * 60 * 60,
      '3M': 90 * 24 * 60 * 60,
      '1Y': 365 * 24 * 60 * 60
    };
    return end - ranges[range];
  };

  const getResolution = (range) => {
    const resolutions = {
      '1D': '5',
      '1W': '15',
      '1M': 'D',
      '3M': 'D',
      '1Y': 'W'
    };
    return resolutions[range];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{symbol}</h1>
        {companyInfo && (
          <div className="mt-4">
            <h2 className="text-xl">{companyInfo.name}</h2>
            <p className="text-gray-600">{companyInfo.finnhubIndustry}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StockGraph 
            data={stockData}
            type="line"
            height={500}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Stock Information</h3>
            {companyInfo && (
              <div className="space-y-2">
                <p><span className="font-medium">Market Cap:</span> ${companyInfo.marketCapitalization?.toLocaleString()}</p>
                <p><span className="font-medium">52 Week High:</span> ${companyInfo.fiftyTwoWeekHigh?.toFixed(2)}</p>
                <p><span className="font-medium">52 Week Low:</span> ${companyInfo.fiftyTwoWeekLow?.toFixed(2)}</p>
                <p><span className="font-medium">P/E Ratio:</span> {companyInfo.pe?.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Company Description</h3>
            <p className="text-gray-600">{companyInfo?.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail; 