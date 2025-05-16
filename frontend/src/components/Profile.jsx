'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import { Card } from '@/components/ui/card';
import Button from './ui/Button';
import PostCard from './PostCard';
import { getStockQuote, getCompanyProfile, searchStocks } from '@/config/finnhubClient';
import { motion } from 'framer-motion';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [investedStocks, setInvestedStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('stocks');

  // Fetch actual user data
  useEffect(() => {
    const updatedStocks = [];
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setProfile(profileData);
          setFollowersCount(Math.floor(Math.random() * 50) + 5);
          setFollowingCount(Math.floor(Math.random() * 30) + 3);
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
          
        if (stocksError) {
          console.error('Error fetching stocks:', stocksError);
        } else if (userStocks && userStocks.length > 0) {
          await Promise.all(userStocks.map(async (userStock) => {
            const symbol = userStock.stock.tick;

            try {
              const [quote, profile] = await Promise.all([
                getStockQuote(symbol),
                getCompanyProfile(symbol),
              ]);
          
              updatedStocks.push({
                symbol,
                quote,
                profile,
                amt_bought: userStock.amt_bought,
                total_spent: userStock.total_spent,
                stock_info: userStock.stock,
              });
            } catch (err) {
              console.error(`Failed to fetch data for ${symbol}:`, err);
            }
          }));
        }
        setInvestedStocks(updatedStocks);

        // Fetch watchlist
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('watchlist')
          .select('symbol')
          .eq('user_id', user.id);

        if (watchlistError) {
          console.error('Error fetching watchlist:', watchlistError);
        } else if (watchlistData) {
          // Fetch current prices for watchlist items
          const watchlistWithPrices = await Promise.all(
            watchlistData.map(async (item) => {
              try {
                const [quote, profile] = await Promise.all([
                  getStockQuote(item.symbol),
                  getCompanyProfile(item.symbol),
                ]);
                return {
                  symbol: item.symbol,
                  quote,
                  profile,
                };
              } catch (err) {
                console.error(`Failed to fetch data for ${item.symbol}:`, err);
                return null;
              }
            })
          );
          setWatchlist(watchlistWithPrices.filter(Boolean));
        }
         
        // Fetch transaction history
        const {data: transactionHistory, error: transactionError} = await supabase
          .from('transactionhistory')
          .select(`
            stock (tick, name),
            type,
            quantity,
            price_per_share,
            total_amount,
            created_at
          `)
          .eq('user_id', user.id);

        if (transactionError) {
          console.error('Error fetching trade history:', transactionError);
        } else {
          setTradeHistory(transactionHistory);
        }

        // Fetch user posts
        const {data: posts, error: postsError} = await supabase
          .from('posts')
          .select(`
            author,
            created_at,
            body,
            id
          `)
          .eq('author', user.id);

        if (postsError) {
          console.error('Error fetching user posts:', postsError);
        } else {
          setUserPosts(posts);
        }
        
      } catch (error) {
        console.error('Error in fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (tab) => {
    console.log("Changing tab to:", tab);
    setActiveTab(tab);
  };

  const fetchUserPosts = async (userId) => {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('author, created_at, body, id')
      .eq('author', userId);
  
    if (error) {
      console.error('Error fetching user posts:', error);
    } else {
      setUserPosts(posts);
    }
  };

  
  const handleDeletePost = async (postId) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      console.error('Error deleting post:', error);
    } else {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
         await fetchUserPosts(user.id);
       }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-red-500">Profile not found</h2>
        <p className="mt-2">Please sign in to view your profile</p>
        <Button className="mt-4" onClick={() => window.location.href = '/login'}>
          Sign In
        </Button>
      </div>
    );
  }
  console.log(investedStocks);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-white">
          {profile.user_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold">{profile.user_name || 'User'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Member since {new Date(profile.created_at || Date.now()).toLocaleDateString()}</p>
          
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
            <div className="text-center">
              <p className="font-semibold text-xl">${Number(profile.wallet_amt)?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-xl">{followersCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-xl">{followingCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-xl">{investedStocks.length + watchlist.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stocks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'stocks'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Stocks
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'watchlist'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Watchlist
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Trade History
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'posts'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Posts
        </button>
      </div>

      {/* Content */}
      {activeTab === 'stocks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investedStocks.map((stock) => (
            <Card key={stock.symbol} className="p-4">
              <h3 className="font-bold text-lg mb-2">{stock.profile.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {stock.symbol}
              </p>
              <p className="text-lg font-semibold">
                ${stock.quote.c.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quantity: {stock.amt_bought}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Value: ${(stock.quote.c * stock.amt_bought).toFixed(2)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'watchlist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((stock) => (
            <Card key={stock.symbol} className="p-4">
              <h3 className="font-bold text-lg mb-2">{stock.profile.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {stock.symbol}
              </p>
              <p className="text-lg font-semibold">
                ${stock.quote.c.toFixed(2)}
              </p>
              <p className={`text-sm ${
                stock.quote.d >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stock.quote.d >= 0 ? '+' : ''}{stock.quote.d.toFixed(2)} ({stock.quote.dp.toFixed(2)}%)
              </p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="trades-tab">
          <h2 className="text-2xl font-bold mb-4">Trade History</h2>
          {tradeHistory.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">You haven't made any trades yet.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {tradeHistory.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{formatTime(trade.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{trade.stock.tick}</td>
                      <td className={`px-4 py-3 whitespace-nowrap capitalize ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{trade.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap">${Number(trade.price_per_share).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">${(trade.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Posts</h2>
          {
            userPosts.map((posts) => (
              <>
               <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                  >
              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {profile.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{profile.user_name}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(posts.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-lg leading-relaxed pl-13">
              {posts.body}
            </div>
            <button
            onClick={() => handleDeletePost(posts.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
            </motion.div>
            </>
            ))
          }
        </div>
      )}
    </div>
  );
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  // Convert UTC to local time
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

export default Profile;