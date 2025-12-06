import { useState, useEffect, useCallback } from 'react';
import { getConnections } from '../api';

export function useConnections({ enabled }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (force = false) => {
    if (!force && !enabled) return;
    setLoading(true);
    try {
      const data = await getConnections();
      setConnections(data.connections || []);
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { connections, loading, setConnections, refresh };
}
