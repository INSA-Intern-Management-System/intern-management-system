"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MessageSquare, Send, Search, Plus, User, Video, Phone } from "lucide-react"
import React from "react";

export default function MessagesPage() {
  const conversations = [
    {
      id: 1,
      name: "Sarah Wilson",
      role: "Mentor",
      company: "Tech Corp",
      lastMessage: "Great work on the project! Let's schedule a review meeting.",
      time: "2 hours ago",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Dr. Martin",
      role: "Academic Supervisor",
      company: "INSA Lyon",
      lastMessage: "Please submit your mid-term evaluation by Friday.",
      time: "1 day ago",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "HR Team",
      role: "Company HR",
      company: "Tech Corp",
      lastMessage: "Welcome to the team! Here's your onboarding checklist.",
      time: "3 days ago",
      unread: 1,
      online: true,
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "Sarah Wilson",
      message: "Hi! How are you settling into the internship?",
      time: "10:30 AM",
      isMe: false,
    },
    {
      id: 2,
      sender: "You",
      message: "Hi Sarah! Everything is going well. I'm really enjoying the projects.",
      time: "10:35 AM",
      isMe: true,
    },
    {
      id: 3,
      sender: "Sarah Wilson",
      message: "That's great to hear! I saw your latest report - excellent progress on the React components.",
      time: "10:40 AM",
      isMe: false,
    },
    {
      id: 4,
      sender: "You",
      message: "Thank you! I've been learning a lot about state management and hooks.",
      time: "10:42 AM",
      isMe: true,
    },
    {
      id: 5,
      sender: "Sarah Wilson",
      message: "Great work on the project! Let's schedule a review meeting.",
      time: "2:15 PM",
      isMe: false,
    },
  ]

  const [showSearch, setShowSearch] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Communicate with mentors and supervisors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]" style={{height: 'calc(100vh - 220px)'}}>
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
                      placeholder="Search..."
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                      onBlur={() => setShowSearch(false)}
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-lg flex-1">Conversations</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500 transition-all group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      {conv.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate text-gray-900">{conv.name}</h4>
                        <span className="text-xs text-gray-500">{conv.time}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {conv.role} 2 {conv.company}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="bg-white rounded-lg lg:col-span-2 p-0 border-0 shadow-none h-full">
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sarah Wilson</h3>
                    <p className="text-sm text-gray-600">Mentor 2 Tech Corp</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="border border-gray-200">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border border-gray-200">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 space-y-4 bg-white">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`relative max-w-[70%] px-4 py-2 rounded-[10px] shadow-sm flex flex-col ${
                        msg.isMe ? "bg-blue-600 text-white items-end" : "bg-gray-100 text-gray-900 items-start"
                      }`}
                      style={{ minWidth: '80px' }}
                    >
                      <span className="text-sm whitespace-pre-line break-words">{msg.message}</span>
                      <span className={`text-xs mt-2 ${msg.isMe ? "text-blue-100" : "text-gray-500"} self-end`}>{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Message Input (fixed at bottom) */}
              <div className="p-4 bg-white">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Type your message..." className="flex-1 rounded-md border border-gray-200 bg-white h-10" />
                  <Button className="bg-black text-white hover:bg-gray-900 h-10 w-10 p-0 flex items-center justify-center">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Communication Guidelines */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6">
          <CardHeader>
            <CardTitle>Communication Guidelines</CardTitle>
            <CardDescription>Best practices for effective communication with mentors and supervisors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Professional Communication:</h4>
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
  )
}
