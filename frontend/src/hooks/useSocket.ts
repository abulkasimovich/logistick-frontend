import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

export function useSocket() {
  const queryClient = useQueryClient();
  const token = useAuthStore(s => s.token);
  const addNotification = useUiStore(s => s.addNotification);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.emit('subscribe:room', { room: 'loads' });
    socket.emit('subscribe:room', { room: 'stats' });

    socket.on('load:created', () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    });

    socket.on('load:delivered', (load: any) => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addNotification({
        title: `Load ${load.load_number} delivered`,
        body: `${load.driver?.name ?? 'Driver'} → ${load.destination}`,
        type: 'success',
      });
    });

    socket.on('stats:updated', (stats: any) => {
      queryClient.setQueryData(['stats', 'overview', '12M'], stats);
    });

    socket.on('notification:new', (n: any) => {
      addNotification({ title: n.title, body: n.body, type: n.type ?? 'info' });
    });

    return () => { socket.disconnect(); };
  }, [token]);
}
