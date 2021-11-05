import WebSocket from 'ws';

export interface SocketData {
  socket: WebSocket;
  password: string;
  googleRefreshToken?: string;
}

export const openSockets = <Record<string, SocketData>>{};
