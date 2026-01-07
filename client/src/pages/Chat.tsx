import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { connectSocket, getSocket } from '@/lib/socket';
import { supabase } from '@/lib/supabase';
import { Smile, Paperclip, Mic, Send, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Backend base URL (set VITE_API_URL in client/.env; falls back to localhost:5000)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to call the backend with the configured base URL (prevents blank page when frontend and API are on different origins)
const api = async (path: string, token: string, options: any = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

const Chat = () => {
  const { user } = useAuth();
  const token = user?.token || '';
  const toast = useToast().toast;
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showUserBrowser, setShowUserBrowser] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      await connectSocket(token);
    })();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Sync user to MySQL first (for chat functionality)
    api('/api/users/sync', token, { method: 'POST' }).then(() => {
      console.log('User synced to database');
    }).catch((err) => {
      console.log('User sync skipped or failed:', err.message);
    });

    // fetch convos
    api('/api/chats', token).then((data) => {
      console.log('Conversations loaded:', data);
      if (Array.isArray(data)) setConversations(data);
    }).catch((err) => {
      console.error('Failed to load conversations:', err);
      toast({ title: 'Failed to load conversations', description: err.message || 'Please ensure you are logged in', variant: 'destructive' });
    });

    const socket = getSocket();
    if (!socket) return;

    const onMessage = (message: any) => {
      if (selected && message.conversation_id === selected.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }

      // update last message timestamp in conversation list
      setConversations((prev) => prev.map((c) => c.id === message.conversation_id ? { ...c, last_message_at: message.created_at } : c));
    };

    const onUserStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        if (data.status === 'online') {
          updated.add(data.userId);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    };

    const onMessageEdited = ({ messageId, content, edited }: any) => {
      setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, content, edited } : msg));
    };

    const onMessageDeleted = ({ messageId }: any) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    socket.on('message', onMessage);
    socket.on('user_status', onUserStatus);
    socket.on('message_edited', onMessageEdited);
    socket.on('message_deleted', onMessageDeleted);

    return () => {
      socket.off('message', onMessage);
      socket.off('user_status', onUserStatus);
      socket.off('message_edited', onMessageEdited);
      socket.off('message_deleted', onMessageDeleted);
    };
  }, [token, selected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectConversation = async (convo: any) => {
    setSelected(convo);
    setMessages([]);

    // join room
    const socket = getSocket();
    socket?.emit('join_conversation', { conversationId: convo.id });

    // fetch messages
    try {
      const res = await api(`/api/chats/${convo.id}/messages`, token);
      if (Array.isArray(res)) setMessages(res);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to fetch messages', variant: 'destructive' });
    }
  };

  const handleSend = () => {
    if (!messageText.trim() || !selected) return;
    
    const socket = getSocket();
    if (!socket) {
      toast({ title: 'Connection error', description: 'Socket not connected', variant: 'destructive' });
      return;
    }

    const tempMessage = {
      id: Date.now(),
      content: messageText,
      contentType: 'text',
      sender_id: user?._id || user?.id,
      conversation_id: selected.id,
      created_at: new Date().toISOString(),
    };

    // Optimistically add message
    setMessages((prev) => [...prev, tempMessage]);
    const sentText = messageText;
    setMessageText('');
    scrollToBottom();

    socket.emit('send_message', { conversationId: selected.id, content: sentText, contentType: 'text' }, (ack: any) => {
      if (ack?.error) {
        // Remove temp message on error
        setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
        setMessageText(sentText); // Restore text
        toast({ title: 'Send failed', description: ack.error, variant: 'destructive' });
        return;
      }

      // Replace temp message with real one from server
      if (ack.message) {
        setMessages((prev) => prev.map(m => m.id === tempMessage.id ? ack.message : m));
      }
    });
  };

  const handleCreate = async () => {
    const participantEmail = prompt('Enter participant email to start a chat:');
    if (!participantEmail) return;

    try {
      // Find user by email
      const userRes = await api(`/api/users/find?email=${encodeURIComponent(participantEmail)}`, token);
      
      if (!userRes.success || !userRes.user) {
        toast({ title: 'User not found', description: 'No user found with that email', variant: 'destructive' });
        return;
      }

      // Create conversation with that user
      const otherUserId = userRes.user.id || userRes.user._id;
      const createRes = await api('/api/chats', token, { 
        method: 'POST', 
        body: JSON.stringify({ participantIds: [otherUserId], type: 'private' }) 
      });
      
      toast({ title: 'Conversation created', description: `Chat started with ${userRes.user.name || userRes.user.email}` });
      setConversations((prev) => [createRes, ...prev]);
    } catch (err: any) {
      console.error(err);
      // Check if it's a "user not found" error (404)
      if (err.message && err.message.includes('User not found')) {
        toast({ 
          title: 'User not found', 
          description: `No user registered with email: ${participantEmail}`, 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Failed to create conversation', 
          description: err.message || 'An error occurred', 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleBrowseUsers = async () => {
    setShowUserBrowser(true);
    console.log('Searching users with query:', searchQuery);
    try {
      const res = await api(`/api/users/list?search=${encodeURIComponent(searchQuery)}`, token);
      console.log('User search results:', res);
      if (res.success) {
        setAvailableUsers(res.users || []);
        if (res.users.length === 0) {
          toast({ title: 'No users found', description: 'Try a different search term' });
        }
      }
    } catch (err) {
      console.error('User search error:', err);
      toast({ title: 'Failed to load users', description: err.message || 'An error occurred', variant: 'destructive' });
    }
  };

  const handleStartChatWithUser = async (userId: string, userName: string) => {
    try {
      const createRes = await api('/api/chats', token, { 
        method: 'POST', 
        body: JSON.stringify({ participantIds: [userId], type: 'private' }) 
      });
      
      toast({ title: 'Conversation created', description: `Chat started with ${userName}` });
      setConversations((prev) => [createRes, ...prev]);
      setShowUserBrowser(false);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to create conversation', variant: 'destructive' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 10MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `chat_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('images').upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);

      // Send as message
      const socket = getSocket();
      socket?.emit('send_message', { conversationId: selected.id, content: 'Image', contentType: 'image', attachmentUrl: publicUrl }, (ack: any) => {
        if (ack?.error) {
          toast({ title: 'Send failed', variant: 'destructive' });
        } else if (ack.message) {
          setMessages((prev) => [...prev, ack.message]);
          scrollToBottom();
        }
      });

      toast({ title: 'Image uploaded' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to start recording', description: 'Check microphone permissions', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudio = async () => {
    if (!audioBlob || !selected) return;

    setUploading(true);
    try {
      const fileName = `audio_${Date.now()}.webm`;
      const { data, error } = await supabase.storage.from('images').upload(fileName, audioBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);

      const socket = getSocket();
      socket?.emit('send_message', { conversationId: selected.id, content: 'Voice message', contentType: 'audio', attachmentUrl: publicUrl }, (ack: any) => {
        if (ack?.error) {
          toast({ title: 'Send failed', variant: 'destructive' });
        } else if (ack.message) {
          setMessages((prev) => [...prev, ack.message]);
          scrollToBottom();
        }
      });

      setAudioBlob(null);
      toast({ title: 'Voice message sent' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };
  const startEdit = (msg: any) => {
    setEditingMessageId(msg.id);
    setEditText(msg.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveEdit = async () => {
    if (!editingMessageId || !editText.trim() || !selected) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/messages/${editingMessageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editText }),
      });

      if (!res.ok) throw new Error('Edit failed');

      const socket = getSocket();
      socket?.emit('edit_message', { messageId: editingMessageId, content: editText, conversationId: selected.id });
      
      setMessages((prev) => prev.map((msg) => msg.id === editingMessageId ? { ...msg, content: editText, edited: true } : msg));
      cancelEdit();
      toast({ 
        title: '✓ Message edited', 
        description: 'Your changes have been saved successfully',
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Edit failed', variant: 'destructive' });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selected) return;
    if (!confirm('🗑️ Are you sure you want to delete this message?\n\nThis action cannot be undone.')) return;

    try {
      const res = await fetch(`${API_BASE}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Delete failed');

      const socket = getSocket();
      socket?.emit('delete_message', { messageId, conversationId: selected.id });
      
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast({ 
        title: '✓ Message deleted', 
        description: 'The message has been removed from the conversation',
        className: 'bg-orange-50 border-orange-200 text-orange-900'
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button type="button" onClick={handleBack} className="mb-2 p-2 rounded-lg hover:bg-muted flex items-center gap-2 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold">Messages</h1>
            <p className="text-muted-foreground mt-1">Connect with property owners and tenants</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 bg-card rounded-2xl shadow-lg border border-border p-4 h-[calc(100vh-240px)] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Conversations
              </h3>
              <div className="flex gap-2">
                <button onClick={handleBrowseUsers} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                  Browse
                </button>
                <button onClick={handleCreate} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                  New
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {conversations.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <Send className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start chatting to connect with others</p>
                </div>
              )}
              {conversations.map((c) => {
                // Get other participants (not current user) to check online status
                const currentUserId = user?.id || user?._id;
                const otherParticipants = c.participants?.filter((p: any) => p.user_id !== currentUserId) || [];
                const hasOnlineUser = otherParticipants.some((p: any) => onlineUsers.has(p.user_id));
                
                return (
                  <div key={c.id} onClick={() => selectConversation(c)} className={`p-3 rounded-lg cursor-pointer hover:bg-muted ${selected?.id === c.id ? 'bg-muted' : ''}`}>
                    <div className="flex items-center gap-2">
                      {hasOnlineUser && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                      <div className="font-medium">{c.title || (c.type === 'property' ? `Property ${c.property_id}` : 'Private Chat')}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{c.last_message_at ? new Date(c.last_message_at).toLocaleString() : 'No messages yet'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card rounded-2xl shadow-lg border border-border h-[calc(100vh-240px)] flex flex-col">
            {!selected && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground text-sm">Choose a conversation from the left to start chatting</p>
              </div>
            )}

            {selected && (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                        {selected.title?.[0] || 'C'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selected.title || 'Chat'}</h3>
                        <p className="text-xs text-muted-foreground">{selected.participants?.length || 0} participants</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                  {messages.map((m) => {
                    const isOnline = m.sender_id && onlineUsers.has(m.sender_id);
                    const currentUserId = user?.id || user?._id;
                    const isMine = m.sender_id === currentUserId;
                    const isEditing = editingMessageId === m.id;
                    
                    return (
                      <div key={m.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''} group animate-in slide-in-from-bottom duration-300`}>
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold shadow-md">
                            {m.sender?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          {!isMine && isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 max-w-[75%]">
                          <div className={`p-3 rounded-2xl shadow-sm ${
                            isMine 
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-sm' 
                              : 'bg-card border border-border text-foreground rounded-bl-sm'
                          }`}>
                            {!isMine && <div className="text-xs font-semibold mb-1">{m.sender?.name || 'Unknown'}</div>}
                            {isEditing ? (
                              <div className="space-y-3 bg-white dark:bg-gray-900 p-3 rounded-lg border-2 border-primary/30">
                                <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                  <span>Editing message</span>
                                </div>
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg text-black dark:text-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                  autoFocus
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                />
                                <div className="flex gap-2">
                                  <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Save
                                  </button>
                                  <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-all shadow-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-sm">{m.content}</div>
                                {m.attachment_url && (
                                  <div className="mt-2">
                                    {m.content_type === 'image' && (
                                      <img src={m.attachment_url} alt="attachment" className="max-w-xs rounded-lg" />
                                    )}
                                    {m.content_type === 'audio' && (
                                      <audio controls src={m.attachment_url} className="max-w-xs" />
                                    )}
                                    {m.content_type === 'file' && (
                                      <a href={m.attachment_url} target="_blank" rel="noreferrer" className="underline text-sm">Download attachment</a>
                                    )}
                                  </div>
                                )}
                                {m.edited && (
                                  <div className="flex items-center gap-1 text-xs opacity-60 mt-2">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    <span className="italic">Edited</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          {isMine && !isEditing && m.content_type === 'text' && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button 
                                onClick={() => startEdit(m)} 
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-all font-medium shadow-sm hover:shadow"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteMessage(m.id)} 
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-all font-medium shadow-sm hover:shadow"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="mt-4">
                  {audioBlob && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <audio controls src={URL.createObjectURL(audioBlob)} className="flex-1" />
                      <button onClick={sendAudio} disabled={uploading} className="text-sm text-primary hover:underline">Send</button>
                      <button onClick={() => setAudioBlob(null)} className="text-sm text-destructive hover:underline">Cancel</button>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-muted rounded-lg">
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-14 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pick an emoji</span>
                            <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                            {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '👍', '👎', '👏', '🙌', '👌', '🤝', '❤️', '💕', '💖', '💗', '✨', '🎉', '🎊', '🔥', '💯'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setMessageText((prev) => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem]"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="p-2 hover:bg-muted rounded-lg cursor-pointer">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>

                    <button 
                      onClick={isRecording ? stopRecording : startRecording} 
                      className={`p-2 rounded-lg ${isRecording ? 'bg-red-500 text-white' : 'hover:bg-muted'}`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>

                    <input 
                      value={messageText} 
                      onChange={(e) => setMessageText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Write a message..." 
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                      disabled={uploading}
                    />
                    <button 
                      onClick={handleSend} 
                      disabled={uploading || !messageText.trim()} 
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Browser Modal */}
      {showUserBrowser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowUserBrowser(false)}>
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Start a Chat</h3>
              <button onClick={() => setShowUserBrowser(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBrowseUsers()}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            
            <button onClick={handleBrowseUsers} className="w-full bg-primary text-white py-2 rounded-lg mb-4 hover:bg-primary/90">
              Search
            </button>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableUsers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No users found. Try searching or leave blank to see all.</p>}
              {availableUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{u.name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{u.email} • {u.role}</div>
                  </div>
                  <button onClick={() => handleStartChatWithUser(u.id, u.name || u.email)} className="text-sm text-primary hover:underline">
                    Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;