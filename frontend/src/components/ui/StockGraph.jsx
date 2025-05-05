import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const StockGraph = ({ 
  data, 
  type = 'line', 
  height = 400,
  timeRange,
  onTimeRangeChange 
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-600">Price: ${payload[0].value.toFixed(2)}</p>
          {payload[0].payload.volume && (
            <p className="text-gray-600">Volume: {payload[0].payload.volume.toLocaleString()}</p>
          )}
          {payload[0].payload.open && (
            <p className="text-gray-600">Open: ${payload[0].payload.open.toFixed(2)}</p>
          )}
          {payload[0].payload.high && (
            <p className="text-gray-600">High: ${payload[0].payload.high.toFixed(2)}</p>
          )}
          {payload[0].payload.low && (
            <p className="text-gray-600">Low: ${payload[0].payload.low.toFixed(2)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (timeRange === '1D') return value;
                return new Date(value).toLocaleDateString();
              }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (timeRange === '1D') return value;
                return new Date(value).toLocaleDateString();
              }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.1}
            />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Stock Price</h3>
        <div className="flex space-x-2">
          {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 rounded ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockGraph; 