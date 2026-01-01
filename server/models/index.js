// Import models and setup associations
import User from './User.js';
import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';
import Message from './Message.js';
import Attachment from './Attachment.js';
import Reaction from './Reaction.js';

// Associations
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversation_id', as: 'participants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversation_id' });

User.hasMany(ConversationParticipant, { foreignKey: 'user_id', as: 'conversation_links' });
ConversationParticipant.belongsTo(User, { foreignKey: 'user_id' });

Message.hasMany(Attachment, { foreignKey: 'message_id', as: 'attachments' });
Attachment.belongsTo(Message, { foreignKey: 'message_id' });

Message.hasMany(Reaction, { foreignKey: 'message_id', as: 'reactions' });
Reaction.belongsTo(Message, { foreignKey: 'message_id' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

export {
  User,
  Conversation,
  ConversationParticipant,
  Message,
  Attachment,
  Reaction,
};