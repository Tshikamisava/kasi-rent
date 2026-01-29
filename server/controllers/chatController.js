import { Conversation, ConversationParticipant, Message, Attachment, User } from '../models/index.js';

export const listConversations = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const convos = await Conversation.findAll({
      include: [
        { 
          model: ConversationParticipant, 
          as: 'participants',
          required: true,
          separate: true,
        }
      ],
      order: [['last_message_at', 'DESC']],
    });

    // Filter conversations where user is a participant
    const filtered = convos.filter((c) => c.participants?.some((p) => p.user_id === userId));

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list conversations' });
  }
};

export const createConversation = async (req, res) => {
  const { participantIds = [], type = 'private', title, property_id } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const convo = await Conversation.create({ type, title, property_id });

    // Add current user as participant
    await ConversationParticipant.create({ conversation_id: convo.id, user_id: userId, role: 'participant' });

    // Add other participants
    for (const pid of participantIds) {
      if (pid !== userId) {
        await ConversationParticipant.findOrCreate({ where: { conversation_id: convo.id, user_id: pid }, defaults: { role: 'participant' } });
      }
    }

    res.status(201).json(convo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
};

export const getMessages = async (req, res) => {
  const convoId = req.params.id;
  const limit = parseInt(req.query.limit) || 30;
  const cursor = req.query.cursor || null;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Check participant
    const participant = await ConversationParticipant.findOne({ where: { conversation_id: convoId, user_id: userId } });
    if (!participant) return res.status(403).json({ message: 'Forbidden' });

    const where = { conversation_id: convoId };
    if (cursor) {
      // fetch messages older than cursor (cursor should be timestamp)
      const { Op } = (await import('sequelize'));
      where.created_at = { [Op.lt]: cursor };
    }

    const messages = await Message.findAll({
      where,
      include: [ { model: Attachment, as: 'attachments' }, { model: User, as: 'sender', attributes: ['id', 'name', 'email'] } ],
      order: [['created_at', 'DESC']],
      limit,
    });

    res.json(messages.reverse()); // return chronologically
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const markRead = async (req, res) => {
  const convoId = req.params.id;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await ConversationParticipant.update({ last_read_at: new Date(), unread_count: 0 }, { where: { conversation_id: convoId, user_id: userId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark read' });
  }
};

export const editMessage = async (req, res) => {
  const messageId = req.params.messageId;
  const userId = req.user?.id;
  const { content } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!content || !content.trim()) return res.status(400).json({ message: 'Content required' });

  try {
    const message = await Message.findByPk(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender_id !== userId) return res.status(403).json({ message: 'Not authorized to edit this message' });

    message.content = content;
    message.edited = true;
    await message.save();

    const updatedMessage = await Message.findByPk(messageId, { include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }] });
    res.json({ success: true, message: updatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

export const deleteMessage = async (req, res) => {
  const messageId = req.params.messageId;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const message = await Message.findByPk(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender_id !== userId) return res.status(403).json({ message: 'Not authorized to delete this message' });

    await message.destroy();
    res.json({ success: true, messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};