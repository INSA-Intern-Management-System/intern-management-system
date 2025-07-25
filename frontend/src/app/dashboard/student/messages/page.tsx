"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  User,
  Video,
  Phone,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Conversation {
  id: number;
  user_id: number;
  participant_id: number;
  last_message_id: number;
  created_at: string;
  updated_at: string;
  participant_name: string;
  participant_role: string;
  participant_company: string;
  last_message_content: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name: string;
  is_me: boolean;
}

export default function MessagesPage() {
  const conversations: Conversation[] = [
    {
      id: 1,
      user_id: 123,
      participant_id: 456,
      last_message_id: 5,
      created_at: "2024-02-01T10:00:00Z",
      updated_at: "2024-02-10T14:15:00Z",
      participant_name: "Sarah Wilson",
      participant_role: "Mentor",
      participant_company: "Tech Corp",
      last_message_content:
        "Great work on the project! Let's schedule a review meeting.",
      last_message_time: "2024-02-10T14:15:00Z",
      unread_count: 2,
      is_online: true,
    },
    {
      id: 2,
      user_id: 123,
      participant_id: 789,
      last_message_id: 8,
      created_at: "2024-01-15T09:30:00Z",
      updated_at: "2024-02-09T11:45:00Z",
      participant_name: "Dr. Martin",
      participant_role: "Academic Supervisor",
      participant_company: "INSA Lyon",
      last_message_content: "Please submit your mid-term evaluation by Friday.",
      last_message_time: "2024-02-09T11:45:00Z",
      unread_count: 0,
      is_online: false,
    },
    {
      id: 3,
      user_id: 123,
      participant_id: 101,
      last_message_id: 12,
      created_at: "2024-02-05T16:20:00Z",
      updated_at: "2024-02-07T10:10:00Z",
      participant_name: "HR Team",
      participant_role: "Company HR",
      participant_company: "Tech Corp",
      last_message_content:
        "Welcome to the team! Here's your onboarding checklist.",
      last_message_time: "2024-02-07T10:10:00Z",
      unread_count: 1,
      is_online: true,
    },
  ];

  const messages: Message[] = [
    {
      id: 1,
      conversation_id: 1,
      sender_id: 456,
      content: "Hi! How are you settling into the internship?",
      created_at: "2024-02-10T10:30:00Z",
      is_read: true,
      sender_name: "Sarah Wilson",
      is_me: false,
    },
    {
      id: 2,
      conversation_id: 1,
      sender_id: 123,
      content:
        "Hi Sarah! Everything is going well. I'm really enjoying the projects.",
      created_at: "2024-02-10T10:35:00Z",
      is_read: true,
      sender_name: "You",
      is_me: true,
    },
    {
      id: 3,
      conversation_id: 1,
      sender_id: 456,
      content:
        "That's great to hear! I saw your latest report - excellent progress on the React components.",
      created_at: "2024-02-10T10:40:00Z",
      is_read: true,
      sender_name: "Sarah Wilson",
      is_me: false,
    },
    {
      id: 4,
      conversation_id: 1,
      sender_id: 123,
      content:
        "Thank you! I've been learning a lot about state management and hooks.",
      created_at: "2024-02-10T10:42:00Z",
      is_read: true,
      sender_name: "You",
      is_me: true,
    },
    {
      id: 5,
      conversation_id: 1,
      sender_id: 456,
      content: "Great work on the project! Let's schedule a review meeting.",
      created_at: "2024-02-10T14:15:00Z",
      is_read: false,
      sender_name: "Sarah Wilson",
      is_me: false,
    },
  ];

  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(conversations[0]);
  const [conversationMessages, setConversationMessages] =
    useState<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: conversationMessages.length + 1,
      conversation_id: selectedConversation.id,
      sender_id: 123, // Current user ID
      content: newMessage,
      created_at: new Date().toISOString(),
      is_read: false,
      sender_name: "You",
      is_me: true,
    };

    setConversationMessages([...conversationMessages, newMsg]);
    setNewMessage("");
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // In a real app, you would fetch messages for this conversation
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      conv.last_message_content
        .toLowerCase()
        .includes(searchValue.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">
              Communicate with mentors and supervisors
            </p>
          </div>
          <Button className="bg-black text-white hover:bg-gray-900">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ minHeight: "calc(100vh - 220px)" }}
        >
          {/* Conversations List */}
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {showSearch ? (
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      autoFocus
                      className="h-10 text-sm pl-10 rounded-md bg-white border border-gray-200"
                      placeholder="Search conversations..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onBlur={() => searchValue === "" && setShowSearch(false)}
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-lg flex-1">
                      Conversations
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSearch(true)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-all group ${
                      selectedConversation?.id === conv.id
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => handleConversationSelect(conv)}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {conv.participant_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate text-gray-900">
                          {conv.participant_name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(conv.last_message_time)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {conv.participant_role} • {conv.participant_company}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.last_message_content}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">
                          {conv.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          {selectedConversation ? (
            <Card className="bg-white rounded-lg lg:col-span-2 p-0 border-0 shadow-none flex flex-col h-full">
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {selectedConversation.participant_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.participant_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.participant_role} •{" "}
                        {selectedConversation.participant_company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border border-gray-200"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border border-gray-200"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                  {conversationMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.is_me ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`relative max-w-[70%] px-4 py-2 rounded-[10px] shadow-sm flex flex-col ${
                          msg.is_me
                            ? "bg-blue-600 text-white items-end"
                            : "bg-white border border-gray-200 text-gray-900 items-start"
                        }`}
                      >
                        {!msg.is_me && (
                          <span className="text-xs font-medium text-gray-600 mb-1">
                            {msg.sender_name}
                          </span>
                        )}
                        <span className="text-sm whitespace-pre-line break-words">
                          {msg.content}
                        </span>
                        <span
                          className={`text-xs mt-1 ${
                            msg.is_me ? "text-blue-100" : "text-gray-500"
                          } self-end`}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-gray-200 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      className="flex-1 rounded-md border border-gray-200 bg-white min-h-[40px] max-h-[120px] resize-none"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      className="bg-black text-white hover:bg-gray-900 h-10 w-10 p-0 flex items-center justify-center"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="lg:col-span-2 flex items-center justify-center bg-white rounded-lg">
              <div className="text-center p-6">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No conversation selected
                </h3>
                <p className="text-gray-600 mt-1">
                  Select a conversation or start a new one
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Communication Guidelines */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6">
          <CardHeader>
            <CardTitle>Communication Guidelines</CardTitle>
            <CardDescription>
              Best practices for effective communication with mentors and
              supervisors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">
                  Professional Communication:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Maintain professional tone while being approachable</li>
                  <li>• Respond to messages within 24 hours</li>
                  <li>• Use clear and specific language in questions</li>
                  <li>• Be respectful and constructive in feedback</li>
                  <li>• Schedule regular check-ins with mentors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Effective Messaging:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Keep messages concise and to the point</li>
                  <li>• Use subject lines for important topics</li>
                  <li>• Confirm receipt of important information</li>
                  <li>• Ask for clarification when needed</li>
                  <li>• Respect others' time and availability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
