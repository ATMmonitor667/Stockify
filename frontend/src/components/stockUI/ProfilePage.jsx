'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import { Card } from '@/components/ui/card';
import Button from '../ui/Button';
import { getStockQuote, getCompanyProfile } from '@/config/finnhubClient';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaChartLine, FaWallet, FaStar, FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investedStocks, setInvestedStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [totalGainLoss, setTotalGainLoss] = useState(0);
  const [gainLossPercentage, setGainLossPercentage] = useState(0);
  const [user, setUser] = useState(null);
  const [stockData, setStockData] = useState({});
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/";
        return;
      }
      setUser(session.user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchInvestedStocks = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("userstock")
          .select(`
            stock_id,
            amt_bought,
            total_spent,
            stock:stock (
              tick
            )
          `)
          .eq("user_id", user.id);

        if (error) throw error;
        setInvestedStocks(data);
      } catch (error) {
        console.error("Error fetching invested stocks:", error);
      }
    };

    fetchInvestedStocks();
  }, [user]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("watchlist")
          .select("symbol")
          .eq("user_id", user.id);

        if (error) throw error;
        setWatchlist(data.map(item => item.symbol));
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    fetchWatchlist();
  }, [user]);

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("transactionhistory")
          .select(`
            *,
            stock:stock (
              tick
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTradeHistory(data);
      } catch (error) {
        console.error("Error fetching trade history:", error);
      }
    };

    fetchTradeHistory();
  }, [user]);

  // Fetch stock data for watchlist items
  useEffect(() => {
    const fetchStockData = async () => {
      if (watchlist.length === 0) {
        setIsLoadingStocks(false);
        return;
      }

      setIsLoadingStocks(true);
      try {
        const stockDataPromises = watchlist.map(async (symbol) => {
          try {
            const [quote, profile] = await Promise.all([
              getStockQuote(symbol),
              getCompanyProfile(symbol),
            ]);
            return { symbol, quote, profile };
          } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return null;
          }
        });

        const results = await Promise.all(stockDataPromises);
        const validResults = results.filter(Boolean);
        
        const newStockData = {};
        validResults.forEach(({ symbol, quote, profile }) => {
          newStockData[symbol] = { quote, profile };
        });

        setStockData(newStockData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setIsLoadingStocks(false);
      }
    };

    fetchStockData();
  }, [watchlist]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Profile not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your profile</p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const portfolioChartData = {
    labels: portfolioHistory.map(item => item.date),
    datasets: [
      {
        label: 'Portfolio Value',
        data: portfolioHistory.map(item => item.value),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Portfolio Value History',
        color: 'rgb(17, 24, 39)',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.raw.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transform transition-all hover:scale-[1.01] border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg transform transition-all hover:scale-105">
              {profile.user_name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {profile.user_name || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/50 p-6 rounded-xl shadow-md transform transition-all hover:scale-105 border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center gap-3 mb-2">
                    <FaChartLine className="text-indigo-600 dark:text-indigo-400 text-xl" />
                    <p className="font-semibold text-xl">${portfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 p-6 rounded-xl shadow-md transform transition-all hover:scale-105 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <FaWallet className="text-green-600 dark:text-green-400 text-xl" />
                    <p className="font-semibold text-xl">${Number(profile.wallet_amt).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 p-6 rounded-xl shadow-md transform transition-all hover:scale-105 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-2">
                    <FaStar className="text-purple-600 dark:text-purple-400 text-xl" />
                    <p className="font-semibold text-xl">{investedStocks.length}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invested Stocks</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/50 dark:to-pink-800/50 p-6 rounded-xl shadow-md transform transition-all hover:scale-105 border border-pink-100 dark:border-pink-800">
                  <div className="flex items-center gap-3 mb-2">
                    <FaHistory className="text-pink-600 dark:text-pink-400 text-xl" />
                    <p className="font-semibold text-xl">{watchlist.length}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Watchlist</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transform transition-all hover:scale-[1.01] border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Portfolio Summary
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Gain/Loss</p>
                <p className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Gain/Loss %</p>
                <p className={`text-xl font-bold ${gainLossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <Line data={portfolioChartData} options={chartOptions} />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FaChartLine />
            <span>Portfolio</span>
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'watchlist'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FaStar />
            <span>Watchlist</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FaHistory />
            <span>Trade History</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Portfolio
              </h2>
              {investedStocks.map((stock) => {
                const stockValue = stock.quote.c * stock.amt_bought;
                const gainLoss = stockValue - stock.total_spent;
                const gainLossPercent = (gainLoss / stock.total_spent) * 100;
                const isPositive = gainLoss >= 0;

                return (
                  <div key={stock.symbol}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-md transform transition-all hover:scale-[1.02] border border-gray-100 dark:border-gray-600">
                    <div>
                      <h3 className="font-bold text-xl">{stock.symbol}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stock.stock_info.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {stock.amt_bought} shares
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">
                        ${stockValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        {isPositive ? <FaArrowUp className="text-green-500" /> : <FaArrowDown className="text-red-500" />}
                        <p className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        ${stock.quote.c.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} per share
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingStocks ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : watchlist.length === 0 ? (
                <div className="col-span-full">
                  <Card className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Your watchlist is empty</p>
                    <Button onClick={() => window.location.href = '/explore'}>
                      Explore Stocks
                    </Button>
                  </Card>
                </div>
              ) : (
                watchlist.map((symbol) => {
                  const stock = stockData[symbol];
                  if (!stock) return null;

                  const priceChange = stock.quote.d || 0;
                  const percentChange = stock.quote.dp || 0;
                  const isPositive = percentChange >= 0;

                  return (
                    <Card key={symbol} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{stock.profile.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{symbol}</p>
                        </div>
                        <div className={`text-right ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <p className="text-lg font-semibold">${stock.quote.c.toFixed(2)}</p>
                          <p className="text-sm">
                            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                          <p className="font-medium">${(stock.quote.c * 1000000).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
                          <p className="font-medium">{stock.quote.v?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Trade History
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tradeHistory.map((trade) => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {trade.stock.tick}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              trade.type === "buy"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {trade.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${trade.price_per_share.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${trade.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(trade.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 