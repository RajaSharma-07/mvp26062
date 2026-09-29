import { Server } from 'socket.io';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join role-specific rooms
    socket.on('join:room', (room: string) => {
      socket.join(room);
      console.log(`  └─ ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}
