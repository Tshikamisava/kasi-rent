import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Conversation, ConversationParticipant, Message, Attachment, User } from './models/index.js';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

// If REDIS_URL is provided, we use Redis for shared adapter and presence store.
export async function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST'],
    },
  });

  let redisClient = null;
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      // Use a separate client for presence operations to keep semantics clear
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      console.log('✅ Socket.io Redis adapter ready');
    } catch (err) {
      console.error('❌ Failed to initialize Redis adapter:', err);
      redisClient = null;
    }
  }

  // middleware to authenticate sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication error: Missing token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return next(new Error('Authentication error: Invalid user'));
      socket.user = user;
      return next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`Socket connected: ${socket.id} (user ${user.id})`);

    (async () => {
      try {
        if (redisClient) {
          await redisClient.sAdd(`online:${user.id}`, socket.id);
          await redisClient.sAdd('online_users', user.id);
        }
        io.emit('user_status', { userId: user.id, status: 'online' });
      } catch (err) {
        console.error('Presence store error (connect):', err);
      }
    })();

    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        const participant = await ConversationParticipant.findOne({ where: { conversation_id: conversationId, user_id: user.id } });
        if (!participant) return socket.emit('error', { message: 'Not a participant' });
        socket.join(`conversation_${conversationId}`);
      } catch (err) {
        console.error('join_conversation error:', err);
      }
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit('typing', { conversationId, userId: user.id, isTyping });
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const { conversationId, content, contentType = 'text', attachmentUrl } = payload;
        const participant = await ConversationParticipant.findOne({ where: { conversation_id: conversationId, user_id: user.id } });
        if (!participant) return ack?.({ error: 'Not a participant' });

        const message = await Message.create({ conversation_id: conversationId, sender_id: user.id, content, content_type: contentType, attachment_url: attachmentUrl });
        await Conversation.update({ last_message_at: new Date() }, { where: { id: conversationId } });

        const { Op } = (await import('sequelize'));
        await ConversationParticipant.increment('unread_count', { by: 1, where: { conversation_id: conversationId, user_id: { [Op.ne]: user.id } } });

        const messageWithSender = await Message.findByPk(message.id, { include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }] });

        io.to(`conversation_${conversationId}`).emit('message', messageWithSender);

        ack?.({ success: true, message: messageWithSender });
      } catch (err) {
        console.error(err);
        ack?.({ error: 'Failed to send message' });
      }
    });

    socket.on('edit_message', async ({ messageId, content, conversationId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (!message || message.sender_id !== user.id) return;
        message.content = content;
        message.edited = true;
        await message.save();
        io.to(`conversation_${conversationId}`).emit('message_edited', { messageId, content, edited: true });
      } catch (err) {
        console.error('Edit message error:', err);
      }
    });

    socket.on('delete_message', async ({ messageId, conversationId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (!message || message.sender_id !== user.id) return;
        await message.destroy();
        io.to(`conversation_${conversationId}`).emit('message_deleted', { messageId });
      } catch (err) {
        console.error('Delete message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      (async () => {
        try {
          if (redisClient) {
            await redisClient.sRem(`online:${user.id}`, socket.id);
            const remaining = await redisClient.sCard(`online:${user.id}`);
            if (remaining === 0) {
              await redisClient.sRem('online_users', user.id);
              io.emit('user_status', { userId: user.id, status: 'offline' });
            }
          } else {
            // Best-effort: emit offline (single-process fallback)
            io.emit('user_status', { userId: user.id, status: 'offline' });
          }
        } catch (err) {
          console.error('Presence store error (disconnect):', err);
        }
      })();
    });
  });

  return io;
}