"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Send,
  Search,
  Phone,
  Video,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const initialConversations: Conversation[] = [
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

  const initialMessages: Message[] = [
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

  const [conversations, setConversations] = useState(initialConversations);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(initialConversations[0]);
  const [conversationMessages, setConversationMessages] =
    useState<Message[]>(initialMessages);
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
      sender_id: 123,
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
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
      )
    );
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
          {selectedConversation && (
            <Card className="lg:col-span-2">
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {selectedConversation.participant_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
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
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Content */}
              <CardContent className="p-0 flex flex-col h-[450px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {conversationMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.is_me ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                          msg.is_me
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        {!msg.is_me && (
                          <span className="text-xs font-medium text-gray-600 block mb-1">
                            {msg.sender_name}
                          </span>
                        )}
                        <p className="text-sm whitespace-pre-line break-words">
                          {msg.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.is_me ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type your message..."
                      className="flex-1"
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
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
