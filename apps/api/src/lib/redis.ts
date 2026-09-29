import Redis from 'ioredis';

// ponytail: single client for session/cache use only
// Socket.IO adapter uses its own clients in index.ts
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on('error', (err) => {
  if (!err.message.includes('ECONNREFUSED')) {
    console.warn('Redis error:', err.message);
  }
});
