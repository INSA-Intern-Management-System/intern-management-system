"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Search,
  Phone,
  Video,
  MessageSquare,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Room,
  User,
  SearchUser,
  RoomUserUnreadDTO,
  Message as MessageType,
} from "@/types/entities";
import { webSocketService } from "@/app/services/websocketService";

interface MessagesClientProps {
  initialRooms: RoomUserUnreadDTO[];
  initialMessages: MessageType[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  userId: number;
  accessToken: string;
  initialRoomId?: number;
  onSendMessage: (
    roomId: number,
    content: string,
    receiverId: number
  ) => Promise<{ success: boolean; data?: MessageType; error?: string }>;
  onMarkAsRead: (
    roomId: number
  ) => Promise<{ success: boolean; error?: string }>;
  onSearchUsers: (
    name: string
  ) => Promise<{ success: boolean; data?: SearchUser[]; error?: string }>;
  onCreateRoom: (
    otherUserId: number
  ) => Promise<{ success: boolean; data?: RoomUserUnreadDTO; error?: string }>;
}

export default function MessagesClient({
  initialRooms,
  initialMessages,
  pagination,
  userId,
  accessToken,
  initialRoomId,
  onSendMessage,
  onMarkAsRead,
  onSearchUsers,
  onCreateRoom,
}: MessagesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<RoomUserUnreadDTO[]>(initialRooms);
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<RoomUserUnreadDTO | null>(
    initialRoomId
      ? initialRooms.find((room) => room.room.id === initialRoomId) || null
      : null
  );
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!accessToken) {
      console.error("No access token provided for WebSocket connection");
      return;
    }

    webSocketService.connect(accessToken, {
      onConnect: () => {
        console.log("WebSocket connected successfully");
        setIsWebSocketConnected(true);
        toast({
          title: "Connected",
          description: "Real-time messaging is now active",
        });
      },
      onError: (error) => {
        console.error("WebSocket error:", error);
        setIsWebSocketConnected(false);
        toast({
          title: "Connection Error",
          description: "Real-time messaging is unavailable",
          variant: "destructive",
        });
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setIsWebSocketConnected(false);
        toast({
          title: "Disconnected",
          description: "Real-time messaging is offline",
          variant: "destructive",
        });
      },
      onMessage: (message) => {
        console.log("Received message:", message);
        // This will be handled by room-specific subscriptions
      },
    });

    return () => {
      webSocketService.disconnect();
    };
  }, [accessToken]);

  // Subscribe to room messages when selected room changes
  useEffect(() => {
    if (selectedRoom && isWebSocketConnected) {
      // Unsubscribe from previous room if any
      webSocketService.unsubscribeFromRoom(selectedRoom.room.id);

      // Subscribe to new room
      webSocketService.subscribeToRoom(selectedRoom.room.id, (message) => {
        handleIncomingMessage(message);
      });
    }

    return () => {
      if (selectedRoom) {
        webSocketService.unsubscribeFromRoom(selectedRoom.room.id);
      }
    };
  }, [selectedRoom, isWebSocketConnected]);

  const handleIncomingMessage = (message: any) => {
    // Check if this is a deleted message
    if (message.deletedMessageId) {
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== message.deletedMessageId)
      );
      return;
    }

    // Handle regular message
    const newMessage: MessageType = {
      id: message.id,
      senderId: message.senderId,
      roomId: message.roomId,
      receiverId: message.receiverId,
      content: message.content,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update room list with new message
    setRooms((prev) =>
      prev.map((room) =>
        room.room.id === message.roomId
          ? {
              ...room,
              room: {
                ...room.room,
                lastMessageAt: new Date().toISOString(),
              },
              unreadCount:
                room.room.id === selectedRoom?.room.id
                  ? 0
                  : room.unreadCount + 1,
            }
          : room
      )
    );
  };

  // Update rooms and messages when props change
  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-select first room if none selected
  useEffect(() => {
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    // Try to send via WebSocket first
    if (isWebSocketConnected) {
      const success = webSocketService.sendMessage({
        senderId: userId,
        receiverId: parseInt(selectedRoom.user.id),
        content: newMessage.trim(),
        roomId: selectedRoom.room.id,
      });

      if (success) {
        // Optimistically update UI
        const tempMessage: MessageType = {
          id: Date.now(), // Temporary ID
          senderId: userId,
          roomId: selectedRoom.room.id,
          receiverId: parseInt(selectedRoom.user.id),
          content: newMessage.trim(),
          status: "SENT",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage("");

        // Update room list
        setRooms((prev) =>
          prev.map((room) =>
            room.room.id === selectedRoom.room.id
              ? {
                  ...room,
                  room: {
                    ...room.room,
                    lastMessageAt: new Date().toISOString(),
                  },
                  unreadCount: 0,
                }
              : room
          )
        );
        return;
      }
    }

    // Fallback to HTTP if WebSocket fails
    try {
      const receiverId = parseInt(selectedRoom.user.id);
      const response = await onSendMessage(
        selectedRoom.room.id,
        newMessage,
        receiverId
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      setMessages([...messages, response.data!]);
      setNewMessage("");

      // Update the room's last message
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.room.id === selectedRoom.room.id
            ? {
                ...room,
                room: {
                  ...room.room,
                  lastMessageAt: new Date().toISOString(),
                },
                unreadCount: 0,
              }
            : room
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleRoomSelect = async (room: RoomUserUnreadDTO) => {
    setSelectedRoom(room);

    // Update URL with roomId
    const params = new URLSearchParams(searchParams.toString());
    params.set("roomId", room.room.id.toString());
    router.push(`/dashboard/student/messages?${params.toString()}`);

    // Mark messages as read
    if (room.unreadCount > 0) {
      try {
        const response = await onMarkAsRead(room.room.id);
        if (response.success) {
          setRooms((prevRooms) =>
            prevRooms.map((r) =>
              r.room.id === room.room.id ? { ...r, unreadCount: 0 } : r
            )
          );
        }
      } catch (error: any) {
        console.error("Failed to mark messages as read:", error);
      }
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await onSearchUsers(query);
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue) {
        handleSearch(searchValue);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const handleStartConversation = async (user: SearchUser) => {
    try {
      // Check if room already exists with this user
      const existingRoom = rooms.find((room) => room.user.id === user.id);

      if (existingRoom) {
        // Select existing room
        handleRoomSelect(existingRoom);
        setSearchResults([]);
        setSearchValue("");
        setShowSearch(false);
        return;
      }

      // Create new room
      const response = await onCreateRoom(parseInt(user.id));

      if (response.success && response.data) {
        // Add new room to the list and select it
        setRooms((prev) => [response.data!, ...prev]);
        setSelectedRoom(response.data);

        // Update URL with new roomId
        const params = new URLSearchParams(searchParams.toString());
        params.set("roomId", response.data.room.id.toString());
        router.push(`/dashboard/student/messages?${params.toString()}`);

        setSearchResults([]);
        setSearchValue("");
        setShowSearch(false);

        toast({
          title: "Success",
          description: `Started conversation with ${user.firstName} ${user.lastName}`,
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.user.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
      room.user.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
      room.user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getParticipantName = (room: RoomUserUnreadDTO) => {
    return `${room.user.firstName} ${room.user.lastName}`;
  };

  const getParticipantInitials = (room: RoomUserUnreadDTO) => {
    return `${room.user.firstName.charAt(0)}${room.user.lastName.charAt(0)}`;
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/student/messages?${params.toString()}`);
  };

  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage + 1;

    if (totalPages <= 1) return null;

    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          isActive={current === 1}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(0);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (current > 3) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    let start = Math.max(2, current - 1);
    let end = Math.min(totalPages - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={current === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i - 1);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    if (current < totalPages - 2) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={current === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages - 1);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">
            Communicate with mentors and supervisors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isWebSocketConnected ? (
            <div className="flex items-center text-green-600">
              <Wifi className="h-5 w-5 mr-1" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff className="h-5 w-5 mr-1" />
              <span className="text-sm">Offline</span>
            </div>
          )}
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
                    placeholder="Search users..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      if (searchValue === "") {
                        setShowSearch(false);
                        setSearchResults([]);
                      }
                    }}
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
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border-b">
                <div className="p-3 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700">
                    Search Results
                  </h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent transition-all"
                      onClick={() => handleStartConversation(user)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {user.role} • {user.university || "No university"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSearching && (
              <div className="p-4 text-center text-gray-500">
                <p>Searching...</p>
              </div>
            )}

            {/* Conversations List */}
            <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
              {filteredRooms.map((room) => (
                <div
                  key={room.room.id}
                  className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-all group ${
                    selectedRoom?.room.id === room.room.id
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-transparent hover:border-gray-200"
                  }`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {getParticipantInitials(room)}
                      </AvatarFallback>
                    </Avatar>
                    {room.user.status === "ONLINE" && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate text-gray-900">
                        {getParticipantName(room)}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(room.room.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {room.user.role} • {room.user.university}
                    </p>
                  </div>
                  {room.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">
                        {room.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        {selectedRoom ? (
          <Card className="lg:col-span-2">
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {getParticipantInitials(selectedRoom)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRoom.user.status === "ONLINE" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getParticipantName(selectedRoom)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedRoom.user.role} • {selectedRoom.user.university}
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === userId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        msg.senderId === userId
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      {msg.senderId !== userId && (
                        <span className="text-xs font-medium text-gray-600 block mb-1">
                          {selectedRoom.user.firstName}
                        </span>
                      )}
                      <p className="text-sm whitespace-pre-line break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === userId
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-white">
                <form
                  className="flex items-center gap-2"
                  onSubmit={handleSendMessage}
                >
                  <Input
                    placeholder="Type your message..."
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 flex items-center justify-center">
            <CardContent className="text-center text-gray-500 p-8">
              <p>Select a conversation to start messaging</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.currentPage > 0) {
                      handlePageChange(pagination.currentPage - 1);
                    }
                  }}
                  isActive={pagination.currentPage > 0}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.currentPage < pagination.totalPages - 1) {
                      handlePageChange(pagination.currentPage + 1);
                    }
                  }}
                  isActive={pagination.currentPage < pagination.totalPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
