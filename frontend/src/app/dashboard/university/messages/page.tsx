"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  User,
  Building2,
  GraduationCap,
  Clock,
  Video,
  Phone,
  Users,
} from "lucide-react";
import React from "react";

export default function MessagesPage() {
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedConversation, setSelectedConversation] = React.useState<
    number | null
  >(1);
  const [newMessage, setNewMessage] = React.useState("");

  // Mock data
  const conversations = [
    {
      id: 1,
      participant: "Dr. Smith",
      role: "supervisor",
      lastMessage:
        "The student's progress report looks good. Any concerns from your end?",
      timestamp: "2 hours ago",
      unread: 2,
      avatar: "DS",
    },
    {
      id: 2,
      participant: "Tech Corp HR",
      role: "company",
      lastMessage: "We'd like to discuss the internship evaluation process.",
      timestamp: "1 day ago",
      unread: 0,
      avatar: "TC",
    },
    {
      id: 3,
      participant: "John Doe",
      role: "student",
      lastMessage: "Thank you for approving my leave request.",
      timestamp: "2 days ago",
      unread: 1,
      avatar: "JD",
    },
    {
      id: 4,
      participant: "Dr. Johnson",
      role: "supervisor",
      lastMessage: "Can we schedule a meeting to discuss the new curriculum?",
      timestamp: "3 days ago",
      unread: 0,
      avatar: "DJ",
    },
  ];

  const messages = [
    {
      id: 1,
      conversationId: 1,
      sender: "Dr. Smith",
      content: "Hello, I wanted to discuss John's progress in his internship.",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      conversationId: 1,
      sender: "You",
      content:
        "Hi Dr. Smith, yes I'd be happy to discuss. How has he been performing?",
      timestamp: "10:35 AM",
      isOwn: true,
    },
    {
      id: 3,
      conversationId: 1,
      sender: "Dr. Smith",
      content:
        "He's doing very well. His technical skills are impressive and he's been very proactive.",
      timestamp: "10:40 AM",
      isOwn: false,
    },
    {
      id: 4,
      conversationId: 1,
      sender: "Dr. Smith",
      content:
        "The student's progress report looks good. Any concerns from your end?",
      timestamp: "2 hours ago",
      isOwn: false,
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedMessages = messages.filter(
    (msg) => msg.conversationId === selectedConversation
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "supervisor":
        return <GraduationCap className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "student":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      supervisor: "bg-purple-100 text-purple-800",
      company: "bg-green-100 text-green-800",
      student: "bg-blue-100 text-blue-800",
    };
    return (
      <Badge
        className={
          colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {role}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">
              Communicate with supervisors, students, and companies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {showSearch ? (
                  <Input
                    autoFocus
                    className="h-8 text-sm flex-1"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => setShowSearch(false)}
                  />
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
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500 transition-all ${
                      selectedConversation === conversation.id
                        ? "bg-blue-50 border-l-blue-500 border-l-4"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {conversation.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.participant}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.role}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">
                          {conversation.unread}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation !== null
                        ? conversations.find(
                            (c) => c.id === selectedConversation
                          )?.participant
                        : "Select a conversation"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation !== null
                        ? conversations.find(
                            (c) => c.id === selectedConversation
                          )?.role
                        : ""}
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
            <CardContent className="p-0 flex flex-col h-[450px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isOwn ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
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
        </div>
      </div>
    </DashboardLayout>
  );
}
