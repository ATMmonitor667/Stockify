'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGlobalUser } from '@/config/UserContext';
import { useRouter } from 'next/navigation';

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useGlobalUser();
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login?redirect=/posts');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      setNewComment('');
      fetchComments();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading comments: {error}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          rows="3"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post Comment
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {comment.author_name}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(comment.created_at)}
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 ml-11">
              {comment.content}
            </p>
          </motion.div>
        ))}
        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments; 