'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';

const PostList = ({ onFollow, user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 5000; // 5 seconds cache

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const now = Date.now();
    if (now - lastFetchTime.current < CACHE_DURATION) {
      return; // Skip fetch if within cache duration
    }

    try {
      setLoading(true);
      console.log('Fetching posts...');
      
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched posts data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected an array of posts');
      }
      
      setPosts(data);
      lastFetchTime.current = now;
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = `Failed to fetch posts: ${err.message}`;
      setError(errorMessage);
      console.error('Error fetching posts:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen for custom event to refresh posts
  useEffect(() => {
    const handlePostCreated = () => {
      console.log('Post created, refreshing posts...');
      lastFetchTime.current = 0; // Reset cache when new post is created
      fetchPosts();
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div role="status" className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading posts: {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onFollow={onFollow}
          isFollowing={false} // TODO: Implement following state
          showFollowButton={true} // Always show follow button
        />
      ))}
      {posts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No posts yet. Be the first to post!
        </div>
      )}
    </motion.div>
  );
};

export default PostList;