import { useState, useEffect, useCallback } from 'react';
import { getPosts, getConnectionsPosts } from '../api';

export function usePostsFeed({ enabled, query = '' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (force = false) => {
    if (!force && !enabled) return;
    setLoading(true);
    try {
      const data = await getPosts(query);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, query]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, setPosts, refresh: fetchPosts };
}

export function useConnectionsPosts({ enabled }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (force = false) => {
    if (!force && !enabled) return;
    setLoading(true);
    try {
      const data = await getConnectionsPosts();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, setPosts, refresh: fetchPosts };
}

export function useProfilePosts({ enabled, userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (force = false) => {
    if (!force && (!enabled || !userId)) return;
    setLoading(true);
    try {
      const data = await getPosts('');
      const ownPosts = (data.posts || []).filter(p => p.author.id === userId);
      setPosts(ownPosts);
    } catch (err) {
      console.error('Failed to load profile posts:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, setPosts, refresh: fetchPosts };
}
