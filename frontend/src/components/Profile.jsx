"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/config/supabaseClient";
import { Card } from "@/components/ui/card";
import Button from "./ui/Button";
import PostCard from "./PostCard";
import {
  getStockQuote,
  getCompanyProfile,
  searchStocks,
} from "@/config/finnhubClient";
import { motion } from "framer-motion";

// Dummy data for testing
const DUMMY_INVESTED_STOCKS = [
  {
    quantity: 10,
    purchase_price: 150,
    stocks: { symbol: "AAPL", name: "Apple Inc.", current_price: 175 },
  },
  {
    quantity: 5,
    purchase_price: 2750,
    stocks: { symbol: "GOOGL", name: "Alphabet Inc.", current_price: 2900 },
  },
];

const DUMMY_TRADE_HISTORY = [
  {
    id: 1,
    date: "2024-04-01",
    symbol: "AAPL",
    type: "buy",
    quantity: 5,
    price: 175.5,
  },
  {
    id: 2,
    date: "2024-04-03",
    symbol: "GOOGL",
    type: "buy",
    quantity: 2,
    price: 2850.75,
  },
  {
    id: 3,
    date: "2024-04-05",
    symbol: "MSFT",
    type: "sell",
    quantity: 3,
    price: 410.25,
  },
  {
    id: 4,
    date: "2024-04-08",
    symbol: "TSLA",
    type: "buy",
    quantity: 10,
    price: 172.35,
  },
  {
    id: 5,
    date: "2024-04-10",
    symbol: "NVDA",
    type: "buy",
    quantity: 2,
    price: 865.2,
  },
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [investedStocks, setInvestedStocks] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("stocks");
  const [useDummyData, setUseDummyData] = useState(false);
  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch actual user data
  useEffect(() => {
    const updatedStocks = [];
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // If not authenticated, show error state
          setLoading(false);
          return;
        }

        // Fetch profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setProfile(profileData);

          // Set some placeholder follower counts for now
          setFollowersCount(Math.floor(Math.random() * 50) + 5);
          setFollowingCount(Math.floor(Math.random() * 30) + 3);
        }

        let hasRealData = false;

        // // In a real implementation, you would fetch both invested and followed stocks
        // // This is just placeholder code - update with your actual database queries

        // Example: Fetch invested stocks

        const { data: userStocks, error: stocksError } = await supabase
          .from("userstock")
          .select(
            `
            amt_bought,
            total_spent,
            stock (tick, name, num_investors)
          `
          )
          .eq("user_id", user.id);
        //setInvestedStocks(userStocks);

        if (stocksError) {
          console.error("Error fetching stocks:", stocksError);
        } else if (userStocks && userStocks.length > 0) {
          //setInvestedStocks(userStocks);

          await Promise.all(
            userStocks.map(async (userStock) => {
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
            })
          );
          hasRealData = true;
        }
        console.log(updatedStocks);
        setInvestedStocks(updatedStocks);

        const { data: transactionHistory, error: transactionError } =
          await supabase
            .from("transactionhistory")
            .select(
              `
            id,
            stock (tick, name),
            type,
            quantity,
            price_per_share,
            total_amount,
            created_at
          `
            )
            .eq("user_id", user.id);

        if (transactionError) {
          console.error("Error fetching trade history:", transactionError);
        }
        console.log("TRANSACTION: ", transactionHistory);
        setTradeHistory(transactionHistory);

        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select(
            `
             author,
             created_at,
             body,
             id
           `
          )
          .eq("author", user.id);

        if (postsError) {
          console.error("Error fetching user posts:", postsError);
        }
        setUserPosts(posts);

        // // Example: Fetch followed stocks (replace with your actual query)
        // // Typically this would be a separate table for stocks the user follows but doesn't own
        // const { data: followedStocksData, error: followedStocksError } = await supabase
        //   .from('followed_stocks') // Replace with your actual table name
        //   .select(`
        //     stocks:stock_id (symbol, name, current_price)
        //   `)
        //   .eq('user_id', user.id);

        // if (!followedStocksError && followedStocksData?.length > 0) {
        //   // Format the data appropriately
        //   setFollowedStocks(followedStocksData.map(item => item.stocks));
        //   hasRealData = true;
        // }

        // // If no real data was found, use dummy data for demonstration
        // if (!hasRealData) {
        //   console.log("No real data found, using dummy data for UI demonstration");
        //   setUseDummyData(true);

        //   // Only set dummy data if real data wasn't found
        //   if (!userStocks || userStocks.length === 0) {
        //     setInvestedStocks(DUMMY_INVESTED_STOCKS);
        //   }

        //   if (!followedStocksData || followedStocksData.length === 0) {
        //     setFollowedStocks(DUMMY_FOLLOWED_STOCKS);
        //   }

        //   setTradeHistory(DUMMY_TRADE_HISTORY);
        // }
      } catch (error) {
        console.error("Error in fetch user data:", error);
        setUseDummyData(true);
        setInvestedStocks(DUMMY_INVESTED_STOCKS);
        setTradeHistory(DUMMY_TRADE_HISTORY);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatOpen]);

  const handleTabChange = (tab) => {
    console.log("Changing tab to:", tab);
    setActiveTab(tab);
  };

  const fetchUserPosts = async (userId) => {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("author, created_at, body, id")
      .eq("author", userId);

    if (error) {
      console.error("Error fetching user posts:", error);
    } else {
      setUserPosts(posts);
    }
  };

  const handleDeletePost = async (postId) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.error("Error deleting post:", error);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await fetchUserPosts(user.id);
      }
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I could not generate a response.",
          },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Error contacting chatbot." },
      ]);
    } finally {
      setChatLoading(false);
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
        <Button
          className="mt-4"
          onClick={() => (window.location.href = "/login")}
        >
          Sign In
        </Button>
      </div>
    );
  }
  console.log(investedStocks);
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Profile Header - Modern Card Design */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image with Gradient Border */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full blur-sm transform scale-105 opacity-70"></div>
              <div className="w-36 h-36 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-xl relative">
                {profile.user_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {profile.user_name || "User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                Member since{" "}
                {new Date(profile.created_at || Date.now()).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>

              {/* Stats Cards */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 shadow-sm">
                  <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                    $
                    {Number(profile.wallet_amt)?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "0.00"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Balance
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 shadow-sm">
                  <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                    {followersCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Followers
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 shadow-sm">
                  <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                    {followingCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Following
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 shadow-sm">
                  <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                    {investedStocks.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Stocks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {useDummyData && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-xl shadow border-l-4 border-yellow-500">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium">
                <span className="font-bold">Note:</span> Using demo data for
                display purposes. Connect to a real database to see your actual
                data.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation - Modern Style */}
        <div className="flex flex-wrap justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 mb-8">
          <button
            onClick={() => handleTabChange("stocks")}
            className={`py-3 px-8 font-semibold text-base rounded-lg transition-all duration-200 ${
              activeTab === "stocks"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
          >
            Stocks Portfolio
          </button>
          <button
            onClick={() => handleTabChange("trades")}
            className={`py-3 px-8 font-semibold text-base rounded-lg transition-all duration-200 ${
              activeTab === "trades"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
          >
            Trade History
          </button>
          <button
            onClick={() => handleTabChange("posts")}
            className={`py-3 px-8 font-semibold text-base rounded-lg transition-all duration-200 ${
              activeTab === "posts"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
          >
            Posts
          </button>
        </div>

        {/* Stock Portfolio Tab - Modern Design */}
        {activeTab === "stocks" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Invested Stocks
              </h2>
              <div className="text-sm font-medium text-gray-600">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {investedStocks.length}{" "}
                  {investedStocks.length === 1 ? "Stock" : "Stocks"}
                </span>
              </div>
            </div>

            {investedStocks.length === 0 ? (
              <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-blue-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                  You haven't invested in any stocks yet.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  Start Investing
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {investedStocks.map((stock, index) => {
                  const gainLoss = calculateGainLoss(
                    stock.total_spent / stock.amt_bought,
                    stock.quote.c
                  );
                  const profit = (
                    stock.quote.c * stock.amt_bought -
                    stock.total_spent
                  ).toFixed(2);
                  const isPositive = gainLoss >= 0;

                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md hover:shadow-xl p-5 border border-gray-100 dark:border-gray-700 transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                          <div className="mr-4 flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <span className="text-xl font-bold text-blue-800 dark:text-blue-400">
                              {stock.symbol}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                              {stock.stock_info.name}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
                                Quantity:{" "}
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                  {stock.amt_bought}
                                </span>
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Avg. Cost:{" "}
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                  $
                                  {(
                                    stock.total_spent / stock.amt_bought
                                  ).toFixed(2)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end">
                          <p className="font-bold text-2xl text-gray-900 dark:text-white">
                            ${Number(stock.quote.c).toFixed(2)}
                          </p>
                          <div className="flex items-center mt-1">
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                                isPositive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 mr-1 ${
                                  isPositive
                                    ? "transform rotate-0"
                                    : "transform rotate-180"
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {Math.abs(gainLoss).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Investment
                          </span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${Number(stock.total_spent).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Current Value
                          </span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${(stock.quote.c * stock.amt_bought).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Profit/Loss
                          </span>
                          <p
                            className={`font-semibold ${
                              profit >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}
                            {profit}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Trade History Tab - Modern Design */}
        {activeTab === "trades" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Trade History
              </h2>
              <div className="text-sm font-medium text-gray-600">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {tradeHistory.length}{" "}
                  {tradeHistory.length === 1 ? "Transaction" : "Transactions"}
                </span>
              </div>
            </div>

            {tradeHistory.length === 0 ? (
              <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-blue-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  You haven't made any trades yet.
                </p>
              </div>
            ) : (
              <div className="overflow-auto rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {tradeHistory.map((trade, index) => (
                      <tr
                        key={trade.id || `trade-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatTime(trade.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {trade.stock.tick}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {trade.stock.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trade.type === "buy"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {trade.type === "buy" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {trade.type.charAt(0).toUpperCase() +
                              trade.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {trade.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${Number(trade.price_per_share).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${trade.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab - Modern Design */}
        {activeTab === "posts" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Your Posts
              </h2>
              <div className="text-sm font-medium text-gray-600">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {userPosts.length} {userPosts.length === 1 ? "Post" : "Posts"}
                </span>
              </div>
            </div>

            {userPosts.length === 0 ? (
              <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-blue-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                  You haven't posted anything yet.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md hover:shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl shadow-md">
                          {profile.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                            {profile.user_name}
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatTime(post.created_at)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete post"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-lg leading-relaxed mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                      {post.body}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Like
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Comment
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chatbot Floating Widget - Modern Design */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50 }}>
        {chatOpen ? (
          <div className="w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[450px] overflow-hidden transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="font-bold text-lg">Stockify AI Advisor</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-900">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      How can I help you today?
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Ask me about stock recommendations, market insights, or
                      investing strategies.
                    </p>
                  </div>
                </div>
              )}

              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none"
                    }`}
                  >
                    <p
                      className={
                        msg.role === "user"
                          ? "text-white"
                          : "text-gray-800 dark:text-gray-200"
                      }
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={handleChatSend}
              className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2 items-center"
            >
              <input
                type="text"
                className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Ask about stocks, investments, or markets..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                autoFocus
              />
              <button
                type="submit"
                className={`rounded-full p-2 focus:outline-none transition-colors ${
                  chatLoading || !chatInput.trim()
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={chatLoading || !chatInput.trim()}
              >
                {chatLoading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
            title="Chat with Stockify AI"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};

// Helper function to calculate gain/loss percentage
function calculateGainLoss(purchasePrice, currentPrice) {
  if (!purchasePrice || !currentPrice) return 0;
  return ((currentPrice - purchasePrice) / purchasePrice) * 100;
}

const formatTime = (dateString) => {
  const date = new Date(dateString);
  // Convert UTC to local time
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export default Profile;
