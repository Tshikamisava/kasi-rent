// Import models and setup associations
import User from './User.js';
import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';
import Message from './Message.js';
import Attachment from './Attachment.js';
import Reaction from './Reaction.js';
import Property from './Property.js';
import Booking from './Booking.js';
import Review from './Review.js';
import Favorite from './Favorite.js';

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

// Booking associations - Properties are now in MySQL
Property.hasMany(Booking, { foreignKey: 'property_id', as: 'bookings' });
Booking.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Review associations - Properties are now in MySQL
Property.hasMany(Review, { foreignKey: 'property_id', as: 'reviews' });
Review.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Favorite associations
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Property.hasMany(Favorite, { foreignKey: 'property_id', as: 'favorites' });
Favorite.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

export {
  User,
  Conversation,
  ConversationParticipant,
  Message,
  Review,
  Attachment,
  Reaction,
  Property,
  Booking,
  Favorite,
};