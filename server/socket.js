import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Conversation, ConversationParticipant, Message, Attachment, User } from './models/index.js';

// Store online users: userId -> Set of socketIds
const onlineUsers = new Map();

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST'],
    },
  });

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

    // Track online status
    if (!onlineUsers.has(user.id)) {
      onlineUsers.set(user.id, new Set());
    }
    onlineUsers.get(user.id).add(socket.id);

    // Broadcast user online status
    io.emit('user_status', { userId: user.id, status: 'online' });

    socket.on('join_conversation', async ({ conversationId }) => {
      // verify participant
      const participant = await ConversationParticipant.findOne({ where: { conversation_id: conversationId, user_id: user.id } });
      if (!participant) return socket.emit('error', { message: 'Not a participant' });
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit('typing', { conversationId, userId: user.id, isTyping });
    });

    socket.on('send_message', async (payload, ack) => {
      // payload: { conversationId, content, contentType, attachmentUrl }
      try {
        const { conversationId, content, contentType = 'text', attachmentUrl } = payload;
        // verify participant
        const participant = await ConversationParticipant.findOne({ where: { conversation_id: conversationId, user_id: user.id } });
        if (!participant) return ack?.({ error: 'Not a participant' });

        const message = await Message.create({ conversation_id: conversationId, sender_id: user.id, content, content_type: contentType, attachment_url: attachmentUrl });

        // update conversation last_message_at
        await Conversation.update({ last_message_at: new Date() }, { where: { id: conversationId } });

        // increment unread_count for other participants
        const { Op } = (await import('sequelize'));
        await ConversationParticipant.increment('unread_count', { by: 1, where: { conversation_id: conversationId, user_id: { [Op.ne]: user.id } } });

        // include sender info
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
      
      // Remove socket from online users
      if (onlineUsers.has(user.id)) {
        onlineUsers.get(user.id).delete(socket.id);
        
        // If no more sockets for this user, mark as offline
        if (onlineUsers.get(user.id).size === 0) {
          onlineUsers.delete(user.id);
          io.emit('user_status', { userId: user.id, status: 'offline' });
        }
      }
    });
  });

  return io;
}