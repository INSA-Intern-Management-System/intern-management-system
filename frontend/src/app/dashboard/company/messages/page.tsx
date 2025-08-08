"use client";

import React, { useRef, useState, useEffect } from "react";
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
  // MessageSquare,
  Send,
  Search,
  // Plus,
  User,
  Video,
  Phone,
  Users,
} from "lucide-react";

type Conversation = {
  id: number;
  name: string;
  role: string;
  project: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: "individual" | "group";
};

type Message = {
  id: number;
  sender: string;
  message: string;
  time: string;
  isMe: boolean;
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Sophie Laurent",
    role: "UI/UX Designer Intern",
    project: "Mobile App Redesign",
    lastMessage:
      "I've completed the user authentication flow design. Could you review it?",
    time: "1 hour ago",
    unread: 2,
    online: true,
    type: "individual",
  },
  {
    id: 2,
    name: "Pierre Martin",
    role: "Data Analyst Intern",
    project: "Customer Analytics Dashboard",
    lastMessage:
      "The dashboard performance has improved significantly after optimization.",
    time: "3 hours ago",
    unread: 0,
    online: false,
    type: "individual",
  },
  {
    id: 3,
    name: "Mobile App Team",
    role: "Project Team",
    project: "Mobile App Redesign",
    lastMessage:
      "Sarah Wilson: Great progress everyone! Let's schedule a team review.",
    time: "1 day ago",
    unread: 1,
    online: true,
    type: "group",
  },
  {
    id: 4,
    name: "Marie Dubois",
    role: "Software Developer Intern",
    project: "E-commerce Platform",
    lastMessage:
      "I'm having some issues with the API integration. Could we schedule a call?",
    time: "2 days ago",
    unread: 0,
    online: true,
    type: "individual",
  },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: "Sophie Laurent",
      message: "Hi! I've finished the user authentication flow design.",
      time: "2:30 PM",
      isMe: false,
    },
    {
      id: 2,
      sender: "You",
      message: "That's great! Could you share the design files for review?",
      time: "2:35 PM",
      isMe: true,
    },
    {
      id: 3,
      sender: "Sophie Laurent",
      message:
        "I've uploaded them to the shared drive. The link is in the project folder.",
      time: "2:40 PM",
      isMe: false,
    },
    {
      id: 4,
      sender: "You",
      message:
        "Perfect. I'll review them and provide feedback by tomorrow morning.",
      time: "2:42 PM",
      isMe: true,
    },
    {
      id: 5,
      sender: "Sophie Laurent",
      message:
        "I've completed the user authentication flow design. Could you review it?",
      time: "3:15 PM",
      isMe: false,
    },
  ],
  2: [
    {
      id: 1,
      sender: "Pierre Martin",
      message:
        "The dashboard performance has improved significantly after optimization.",
      time: "10:00 AM",
      isMe: false,
    },
  ],
  3: [
    {
      id: 1,
      sender: "Sarah Wilson",
      message: "Great progress everyone! Let's schedule a team review.",
      time: "Yesterday",
      isMe: false,
    },
  ],
  4: [
    {
      id: 1,
      sender: "Marie Dubois",
      message:
        "I'm having some issues with the API integration. Could we schedule a call?",
      time: "2 days ago",
      isMe: false,
    },
  ],
};

export default function CompanyMessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<number>(conversations[0].id);
  const [messages, setMessages] = useState(initialMessages);
  const [messageInput, setMessageInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      conv.role.toLowerCase().includes(searchValue.toLowerCase()) ||
      (conv.project &&
        conv.project.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] || []),
        {
          id: Date.now(),
          sender: "You",
          message: messageInput,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: true,
        },
      ],
    }));
    setMessageInput("");
    // Update last message in conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedId
          ? { ...conv, lastMessage: messageInput, time: "now", unread: 0 }
          : conv
      )
    );
  };

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">
              Communicate with interns and team members
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
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center space-x-3 p-4 cursor-pointer border-l-4 transition-all ${
                      selectedId === conv.id
                        ? "bg-blue-50 border-l-blue-500"
                        : "hover:bg-gray-50 border-transparent hover:border-blue-500"
                    }`}
                    onClick={() => setSelectedId(conv.id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {conv.type === "group" ? (
                          <Users className="h-5 w-5 text-gray-600" />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      {conv.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {conv.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {conv.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conv.role}
                      </p>
                      <p className="text-xs text-blue-600 truncate">
                        {conv.project}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">
                          {conv.unread}
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
                    {selectedConversation?.type === "group" ? (
                      <Users className="h-5 w-5 text-gray-600" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation?.role}
                    </p>
                    <p className="text-xs text-blue-600">
                      {selectedConversation?.project}
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
                {(messages[selectedId] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isMe
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isMe ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <form
                  className="flex items-center space-x-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <Input
                    placeholder="Type your message..."
                    className="flex-1"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button type="submit" disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communication Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Guidelines</CardTitle>
            <CardDescription>
              Best practices for effective communication with interns
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
                  <li>• Respond to intern messages within 24 hours</li>
                  <li>• Use clear and specific language in instructions</li>
                  <li>• Provide constructive feedback regularly</li>
                  <li>• Schedule regular check-ins and one-on-ones</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Team Collaboration:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • Create project-specific group chats for team coordination
                  </li>
                  <li>• Share important updates and announcements</li>
                  <li>• Encourage peer-to-peer learning and support</li>
                  <li>• Use video calls for complex discussions</li>
                  <li>• Document important decisions and agreements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
