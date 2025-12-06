import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getPosts } from '../api';

export function useUserSearch({ enabled, query }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (force = false) => {
    if (!force && !enabled) return;
    setLoading(true);
    try {
      const data = await getAllUsers(query);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { users, loading, setUsers, refresh };
}

export function usePostSearch({ enabled, query }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (force = false) => {
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
    refresh();
  }, [refresh]);

  return { posts, loading, setPosts, refresh };
}
