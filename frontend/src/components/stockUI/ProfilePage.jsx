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

// Dummy data for demonstration
const DUMMY_PROFILE = {
  user_name: 'John Doe',
  created_at: '2024-01-01',
  wallet_amt: 25000.00
};

// Add realistic portfolio history data
const DUMMY_PORTFOLIO_HISTORY = [
  { date: '2024-03-11', value: 24500.00 },
  { date: '2024-03-12', value: 24800.00 },
  { date: '2024-03-13', value: 25100.00 },
  { date: '2024-03-14', value: 24900.00 },
  { date: '2024-03-15', value: 25200.00 },
  { date: '2024-03-16', value: 25500.00 },
  { date: '2024-03-17', value: 25800.00 }
];

const DUMMY_INVESTED_STOCKS = [
  {
    symbol: 'AAPL',
    quote: { c: 175.50, d: 2.5, dp: 1.45 },
    profile: { name: 'Apple Inc.' },
    amt_bought: 10,
    total_spent: 1500.00,
    stock_info: { name: 'Apple Inc.', num_investors: 1500 }
  },
  {
    symbol: 'GOOGL',
    quote: { c: 145.75, d: -1.25, dp: -0.85 },
    profile: { name: 'Alphabet Inc.' },
    amt_bought: 5,
    total_spent: 725.00,
    stock_info: { name: 'Alphabet Inc.', num_investors: 1200 }
  },
  {
    symbol: 'MSFT',
    quote: { c: 415.25, d: 5.75, dp: 1.40 },
    profile: { name: 'Microsoft Corporation' },
    amt_bought: 3,
    total_spent: 1200.00,
    stock_info: { name: 'Microsoft Corporation', num_investors: 1800 }
  }
];

const DUMMY_WATCHLIST = [
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    current_price: 175.21,
    change: 3.45,
    change_percent: 2.01
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    current_price: 178.75,
    change: -1.25,
    change_percent: -0.69
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    current_price: 865.20,
    change: 15.75,
    change_percent: 1.85
  }
];

const DUMMY_TRADE_HISTORY = [
  { id: 1, symbol: 'AAPL', type: 'buy', quantity: 5, price: 175.50, created_at: '2024-03-15T10:30:00' },
  { id: 2, symbol: 'GOOGL', type: 'buy', quantity: 2, price: 145.75, created_at: '2024-03-14T14:20:00' },
  { id: 3, symbol: 'MSFT', type: 'sell', quantity: 3, price: 415.25, created_at: '2024-03-13T09:15:00' },
  { id: 4, symbol: 'TSLA', type: 'buy', quantity: 10, price: 172.35, created_at: '2024-03-12T16:45:00' },
  { id: 5, symbol: 'NVDA', type: 'buy', quantity: 2, price: 865.20, created_at: '2024-03-11T11:30:00' }
];

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

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Use dummy data if not authenticated
          setProfile(DUMMY_PROFILE);
          setInvestedStocks(DUMMY_INVESTED_STOCKS);
          setWatchlist(DUMMY_WATCHLIST);
          setTradeHistory(DUMMY_TRADE_HISTORY);

          // Calculate portfolio value
          const totalValue = DUMMY_INVESTED_STOCKS.reduce((sum, stock) => {
            return sum + (stock.quote.c * stock.amt_bought);
          }, 0);
          setPortfolioValue(totalValue);

          // Use the dummy portfolio history
          setPortfolioHistory(DUMMY_PORTFOLIO_HISTORY);

          setLoading(false);
          return;
        }

        // Comment out actual data fetching
        /*
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch invested stocks
        const { data: userStocks, error: stocksError } = await supabase
          .from('userstock')
          .select(`
            amt_bought,
            total_spent,
            stock (tick, name, num_investors)
          `)
          .eq('user_id', user.id);

        if (userStocks) {
          const updatedStocks = await Promise.all(
            userStocks.map(async (userStock) => {
              const symbol = userStock.stock.tick;
              try {
                const [quote, profile] = await Promise.all([
                  getStockQuote(symbol),
                  getCompanyProfile(symbol),
                ]);
                return {
                  symbol,
                  quote,
                  profile,
                  amt_bought: userStock.amt_bought,
                  total_spent: userStock.total_spent,
                  stock_info: userStock.stock,
                };
              } catch (err) {
                console.error(`Failed to fetch data for ${symbol}:`, err);
                return null;
              }
            })
          );
          const validStocks = updatedStocks.filter(stock => stock !== null);
          setInvestedStocks(validStocks);

          // Calculate portfolio metrics
          const totalValue = validStocks.reduce((sum, stock) => {
            return sum + (stock.quote.c * stock.amt_bought);
          }, 0);
          setPortfolioValue(totalValue);

          const totalSpent = validStocks.reduce((sum, stock) => {
            return sum + stock.total_spent;
          }, 0);

          const gainLoss = totalValue - totalSpent;
          setTotalGainLoss(gainLoss);
          setGainLossPercentage((gainLoss / totalSpent) * 100);

          // Generate portfolio history (last 7 days)
          const history = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
              date: date.toISOString().split('T')[0],
              value: totalValue * (1 + (Math.random() * 0.1 - 0.05)) // Simulated daily change
            };
          }).reverse();
          setPortfolioHistory(history);
        }

        // Fetch watchlist
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('watchlist')
          .select(`
            stock (tick, name)
          `)
          .eq('user_id', user.id);

        if (watchlistData) {
          const watchlistStocks = await Promise.all(
            watchlistData.map(async (item) => {
              const symbol = item.stock.tick;
              try {
                const quote = await getStockQuote(symbol);
                return {
                  symbol,
                  name: item.stock.name,
                  current_price: quote.c,
                  change: quote.d,
                  change_percent: quote.dp,
                };
              } catch (err) {
                console.error(`Failed to fetch data for ${symbol}:`, err);
                return null;
              }
            })
          );
          setWatchlist(watchlistStocks.filter(stock => stock !== null));
        }

        // Fetch trade history
        const { data: trades, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (trades) {
          setTradeHistory(trades);
        }
        */

        // Use dummy data for authenticated users as well
        setProfile(DUMMY_PROFILE);
        setInvestedStocks(DUMMY_INVESTED_STOCKS);
        setWatchlist(DUMMY_WATCHLIST);
        setTradeHistory(DUMMY_TRADE_HISTORY);

        // Calculate portfolio value
        const totalValue = DUMMY_INVESTED_STOCKS.reduce((sum, stock) => {
          return sum + (stock.quote.c * stock.amt_bought);
        }, 0);
        setPortfolioValue(totalValue);

        // Calculate gain/loss
        const totalSpent = DUMMY_INVESTED_STOCKS.reduce((sum, stock) => {
          return sum + stock.total_spent;
        }, 0);
        const gainLoss = totalValue - totalSpent;
        setTotalGainLoss(gainLoss);
        setGainLossPercentage((gainLoss / totalSpent) * 100);

        // Use the dummy portfolio history
        setPortfolioHistory(DUMMY_PORTFOLIO_HISTORY);

      } catch (error) {
        console.error('Error in fetch user data:', error);
        // Use dummy data on error
        setProfile(DUMMY_PROFILE);
        setInvestedStocks(DUMMY_INVESTED_STOCKS);
        setWatchlist(DUMMY_WATCHLIST);
        setTradeHistory(DUMMY_TRADE_HISTORY);
        setPortfolioHistory(DUMMY_PORTFOLIO_HISTORY);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
        <div className="flex border-b mb-6 bg-white dark:bg-gray-800 rounded-t-xl p-4 border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('portfolio')}
            className={`py-3 px-8 font-semibold text-base rounded-lg transition-all ${
              activeTab === 'portfolio'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => handleTabChange('watchlist')}
            className={`py-3 px-8 font-semibold text-base rounded-lg transition-all ${
              activeTab === 'watchlist'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Watchlist
          </button>
          <button
            onClick={() => handleTabChange('trades')}
            className={`py-3 px-8 font-semibold text-base rounded-lg transition-all ${
              activeTab === 'trades'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Trade History
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
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Watchlist
              </h2>
              {watchlist.map((stock) => (
                <div key={stock.symbol}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-md transform transition-all hover:scale-[1.02] border border-gray-100 dark:border-gray-600">
                  <div>
                    <h3 className="font-bold text-xl">{stock.symbol}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">
                      ${stock.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      {stock.change >= 0 ? <FaArrowUp className="text-green-500" /> : <FaArrowDown className="text-red-500" />}
                      <p className={`text-sm font-semibold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Trade History
              </h2>
              {tradeHistory.map((trade) => (
                <div key={trade.id}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-md transform transition-all hover:scale-[1.02] border border-gray-100 dark:border-gray-600">
                  <div>
                    <h3 className="font-bold text-xl">{trade.symbol}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(trade.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-xl ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.type.toUpperCase()}
                    </p>
                    <p className="text-sm font-semibold">
                      {trade.quantity} shares
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      @ ${trade.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 