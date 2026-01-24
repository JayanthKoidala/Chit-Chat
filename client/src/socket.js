import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_API_URL;
let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(ENDPOINT, {
      pingTimeout: 60000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
