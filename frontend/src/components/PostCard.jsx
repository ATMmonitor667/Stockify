'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/config/supabaseClient';
import { useRouter } from 'next/navigation';
import { useGlobalUser } from '@/config/UserContext';
import Comments from './Comments';

const PostCard = ({ post, onFollow, isFollowing, showFollowButton = true }) => {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [followStatus, setFollowStatus] = useState(isFollowing);
  const [followersCount, setFollowersCount] = useState(0);
  const router = useRouter();
  const currentUser = useGlobalUser();

  useEffect(() => {
    setIsCurrentUser(currentUser?.id === post.author_id);
    fetchFollowCounts();
  }, [currentUser, post.author_id]);

  const fetchFollowCounts = async () => {
    try {
      const response = await fetch(`/api/follow?userId=${post.author_id}`);
      if (response.ok) {
        const data = await response.json();
        setFollowersCount(data.followers);
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
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

  const handleFollowClick = async () => {
    if (!currentUser) {
      router.push('/login?redirect=/posts');
      return;
    }

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: post.author_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow user');
      }

      const data = await response.json();
      setFollowStatus(data.action === 'followed');
      fetchFollowCounts();
      onFollow(post.author_id);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
            {post.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{post.author_name}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(post.created_at)}
            </p>
          </div>
        </div>
        {showFollowButton && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {followersCount} followers
            </span>
            <button
              onClick={handleFollowClick}
              disabled={isCurrentUser}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isCurrentUser
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : followStatus
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isCurrentUser ? 'Your Post' : followStatus ? 'Following' : 'Follow'}
            </button>
          </div>
        )}
      </div>
      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-lg leading-relaxed pl-13">
        {post.content}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>
        {showComments && <Comments postId={post.id} />}
      </div>
    </motion.div>
  );
};

export default PostCard; 