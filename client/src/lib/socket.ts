import { API_BASE_URL } from '@/lib/apiBase';

let socket = null;

export async function connectSocket(token: string) {
  if (socket) return socket;

  try {
    const mod = await import('socket.io-client');
    const io = mod.io || mod.default?.io || mod;
    socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return socket;
  } catch (err) {
    console.error('socket.io-client not available:', err);
    return null;
  }
}

export function getSocket() {
  return socket;
}
