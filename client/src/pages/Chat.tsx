import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { connectSocket, getSocket } from '@/lib/socket';
import { supabase } from '@/lib/supabase';
import EmojiPicker from 'emoji-picker-react';
import { Smile, Paperclip, Mic, Send, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix emoji-picker-react expecting global in browser
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

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

    // fetch convos
    api('/api/chats', token).then((data) => {
      if (Array.isArray(data)) setConversations(data);
    }).catch((err) => {
      console.error(err);
      toast({ title: 'Failed to load conversations', variant: 'destructive' });
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
    socket?.emit('send_message', { conversationId: selected.id, content: messageText, contentType: 'text' }, (ack: any) => {
      if (ack?.error) {
        toast({ title: 'Send failed', description: ack.error, variant: 'destructive' });
        return;
      }

      // append message from ack
      if (ack.message) setMessages((prev) => [...prev, ack.message]);
      setMessageText('');
      scrollToBottom();
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
      const createRes = await api('/api/chats', token, { 
        method: 'POST', 
        body: JSON.stringify({ participantIds: [userRes.user.id], type: 'private' }) 
      });
      
      toast({ title: 'Conversation created', description: `Chat started with ${userRes.user.name || userRes.user.email}` });
      setConversations((prev) => [createRes, ...prev]);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to create conversation', description: err.message || 'An error occurred', variant: 'destructive' });
    }
  };

  const handleBrowseUsers = async () => {
    setShowUserBrowser(true);
    try {
      const res = await api(`/api/users/list?search=${encodeURIComponent(searchQuery)}`, token);
      if (res.success) {
        setAvailableUsers(res.users || []);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to load users', variant: 'destructive' });
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
      toast({ title: 'Message edited' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Edit failed', variant: 'destructive' });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selected) return;
    if (!confirm('Delete this message?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Delete failed');

      const socket = getSocket();
      socket?.emit('delete_message', { messageId, conversationId: selected.id });
      
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast({ title: 'Message deleted' });
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-4 flex items-center gap-2">
          <button type="button" onClick={handleBack} className="p-2 rounded-lg hover:bg-muted flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 bg-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Conversations</h3>
              <div className="flex gap-2">
                <button onClick={handleBrowseUsers} className="text-sm text-primary hover:underline">Browse</button>
                <button onClick={handleCreate} className="text-sm text-primary hover:underline">Email</button>
              </div>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {conversations.length === 0 && <p className="text-sm text-muted-foreground">No conversations yet</p>}
              {conversations.map((c) => {
                // Get other participants (not current user) to check online status
                const otherParticipants = c.participants?.filter((p: any) => p.user_id !== user?.id) || [];
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

          <div className="md:col-span-3 bg-card rounded-2xl p-4 flex flex-col">
            {!selected && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start chatting</div>
            )}

            {selected && (
              <>
                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                  {messages.map((m) => {
                    const isOnline = m.sender_id && onlineUsers.has(m.sender_id);
                    const isMine = m.sender_id === user?.id;
                    const isEditing = editingMessageId === m.id;
                    
                    return (
                      <div key={m.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''} group`}>
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold">
                            {m.sender?.name?.[0] || 'U'}
                          </div>
                          {!isMine && isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className={`max-w-[70%] p-3 rounded-xl ${isMine ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {!isMine && <div className="text-xs font-semibold mb-1">{m.sender?.name || 'Unknown'}</div>}
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-black"
                                  autoFocus
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                />
                                <div className="flex gap-2">
                                  <button onClick={saveEdit} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                                    Save
                                  </button>
                                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500">
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
                                  <div className="text-xs opacity-70 italic mt-1">edited</div>
                                )}
                              </>
                            )}
                          </div>
                          {isMine && !isEditing && m.content_type === 'text' && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(m)} className="text-xs text-blue-500 hover:text-blue-700">
                                Edit
                              </button>
                              <button onClick={() => deleteMessage(m.id)} className="text-xs text-red-500 hover:text-red-700">
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
                        <div className="absolute bottom-12 left-0 z-50">
                          <EmojiPicker onEmojiClick={(emoji) => {
                            setMessageText((prev) => prev + emoji.emoji);
                            setShowEmojiPicker(false);
                          }} />
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
                      className="flex-1 px-4 py-2 border rounded-lg" 
                      disabled={uploading}
                    />
                    <button onClick={handleSend} disabled={uploading} className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90">
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