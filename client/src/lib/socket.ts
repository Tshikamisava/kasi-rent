let socket = null;

export async function connectSocket(token: string) {
  if (socket) return socket;

  try {
    const mod = await import('socket.io-client');
    const io = mod.io || mod.default?.io || mod;
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
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
