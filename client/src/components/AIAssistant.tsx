import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  MoreVertical,
  Copy,
  Trash2,
  Download,
  RefreshCw,
  Sparkles,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = "kasi-rent-chatbot-conversations";
const QUICK_REPLIES = [
  "What properties are available?",
  "How do I search for apartments?",
  "What's the rental process?",
  "Tell me about your platform",
  "Help me find a property",
];

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message if no messages
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const welcomeMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Hello${user?.name ? `, ${user.name}` : ""}! I'm your AI assistant for Kasi-Rent. I can help you:
        
• Find rental properties
• Answer questions about our platform
• Guide you through the rental process
• Help with property searches and filters
• Provide rental advice

How can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setShowQuickReplies(true);
    }
  }, [isOpen, user]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadConversations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const conversations: Conversation[] = JSON.parse(stored);
        if (conversations.length > 0) {
          const latest = conversations[conversations.length - 1];
          setMessages(
            latest.messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
          setConversationId(latest.id);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const saveConversation = (msgs: Message[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
      
      const conversation: Conversation = {
        id: conversationId || `conv-${Date.now()}`,
        messages: msgs,
        createdAt: conversationId
          ? conversations.find((c) => c.id === conversationId)?.createdAt || new Date()
          : new Date(),
        updatedAt: new Date(),
      };

      const existingIndex = conversations.findIndex((c) => c.id === conversation.id);
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
        // Keep only last 10 conversations
        if (conversations.length > 10) {
          conversations.shift();
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      if (!conversationId) {
        setConversationId(conversation.id);
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
    setShowQuickReplies(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
    toast({
      title: "Conversation cleared",
      description: "Your chat history has been cleared.",
    });
  };

  const exportConversation = () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to export",
        description: "Start a conversation first.",
        variant: "destructive",
      });
      return;
    }

    const content = messages
      .map((msg) => {
        const time = msg.timestamp.toLocaleString();
        return `[${time}] ${msg.role === "user" ? "You" : "AI"}: ${msg.content}`;
      })
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kasi-rent-chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation exported",
      description: "Your chat has been downloaded.",
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message copied successfully.",
    });
  };

  const regenerateResponse = async (lastUserMessage: Message) => {
    setIsLoading(true);
    try {
      const conversationHistory = messages
        .filter((msg) => msg.id !== messages[messages.length - 1]?.id)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: lastUserMessage.content,
          conversationHistory: conversationHistory,
          userId: user?._id,
          userType: user?.userType,
        }),
      });

      if (!response.ok) {
        // Try to surface server-provided error message
        let errMsg = "Failed to get AI response";
        try {
          const errJson = await response.json();
          errMsg = errJson?.error || errJson?.message || errJson?.response || errMsg;
        } catch (e) {
          // ignore JSON parse errors
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== prev[prev.length - 1]?.id);
        const updated = [...filtered, assistantMessage];
        saveConversation(updated);
        return updated;
      });
    } catch (error: any) {
      console.error("Error regenerating response:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to regenerate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setShowQuickReplies(false);
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: conversationHistory,
          userId: user?._id,
          userType: user?.userType,
          userName: user?.name,
        }),
      });

      if (!response.ok) {
        let errMsg = "Failed to get AI response";
        try {
          const errJson = await response.json();
          errMsg = errJson?.error || errJson?.message || errJson?.response || errMsg;
        } catch (e) {
          // ignore JSON parse errors
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that request.",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorContent = error?.message || "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again.";
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
        error: true,
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveConversation(finalMessages);
      toast({
        title: "Connection error",
        description: errorContent,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform animate-pulse"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            "fixed right-6 shadow-2xl z-50 flex flex-col transition-all duration-300",
            isMinimized
              ? "bottom-6 w-96 h-16"
              : "bottom-6 w-96 h-[700px] md:h-[600px]"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-5 w-5 text-primary" />
                <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              {isLoading && (
                <div className="flex gap-1 ml-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
                <span className="sr-only">{isMinimized ? "Maximize" : "Minimize"}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportConversation}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={clearConversation}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1 max-w-[80%]">
                        <div
                          className={cn(
                            "rounded-lg px-4 py-2.5 relative group",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.error
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => copyMessage(message.content)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy
                                </DropdownMenuItem>
                                {message.role === "assistant" && messages[messages.length - 1]?.id === message.id && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const lastUserMsg = [...messages]
                                        .reverse()
                                        .find((m) => m.role === "user");
                                      if (lastUserMsg) {
                                        regenerateResponse(lastUserMsg);
                                      }
                                    }}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Regenerate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground px-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start animate-in fade-in">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex gap-1.5">
                          <div
                            className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              {showQuickReplies && messages.length <= 1 && (
                <div className="px-4 pb-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2 mt-2">Quick replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_REPLIES.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs h-8"
                        disabled={isLoading}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t p-4 bg-background">
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    disabled={isLoading}
                    className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  AI-powered assistance • Your conversations are saved locally
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
};

export default AIAssistant;
