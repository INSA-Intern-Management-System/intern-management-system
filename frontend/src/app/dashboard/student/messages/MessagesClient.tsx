// app/dashboard/student/messages/MessagesClient.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  MoreVertical,
  ImageIcon,
  Paperclip,
  Smile,
  Mic,
} from "lucide-react";
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
  RoomUserUnreadDTO,
  Message as MessageType,
  SearchUser,
} from "@/types/entities";
import { webSocketService } from "@/app/services/websocketService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/ui/emoji-picker";

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
  onSearchUsers: (
    name: string
  ) => Promise<{ success: boolean; data?: SearchUser[]; error?: string }>;
}

export default function MessagesClient({
  initialRooms,
  initialMessages,
  pagination,
  userId,
  accessToken,
  initialRoomId,
  onSearchUsers,
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
        handleIncomingMessage(message);
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

  const handleIncomingMessage = useCallback(
    (message: any) => {
      // Handle typing indicators
      if (message.type === "TYPING_START") {
        setTypingUsers((prev) => new Set(prev).add(message.userId));
        return;
      }

      if (message.type === "TYPING_STOP") {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(message.userId);
          return newSet;
        });
        return;
      }

      // Handle room creation response
      if (message.type === "ROOM_CREATED") {
        const newRoom: RoomUserUnreadDTO = {
          room: message.room,
          user: message.otherUser,
          unreadCount: 0,
        };

        setRooms((prev) => [newRoom, ...prev]);
        setSelectedRoom(newRoom);

        // Update URL with new roomId
        const params = new URLSearchParams(searchParams.toString());
        params.set("roomId", newRoom.room.id.toString());
        router.push(`/dashboard/student/messages?${params.toString()}`);

        toast({
          title: "Success",
          description: `Started conversation with ${message.otherUser.firstName} ${message.otherUser.lastName}`,
        });
        return;
      }

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
        // type: message.type,
        // attachment: message.attachment,
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
                  lastMessageContent: message.content,
                },
                unreadCount:
                  room.room.id === selectedRoom?.room.id
                    ? 0
                    : room.unreadCount + 1,
              }
            : room
        )
      );
    },
    [selectedRoom, searchParams, router]
  );

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
  }, [messages, typingUsers]);

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

    // Send typing stop indicator
    if (isWebSocketConnected) {
      webSocketService.sendTypingIndicator(selectedRoom.room.id, userId, false);
    }

    // Try to send via WebSocket
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
                    lastMessageContent: newMessage,
                  },
                  unreadCount: 0,
                }
              : room
          )
        );
        return;
      }
    }

    // If WebSocket fails, show error
    toast({
      title: "Error",
      description: "Failed to send message. Please check your connection.",
      variant: "destructive",
    });
  };

  const handleTyping = (isTyping: boolean) => {
    if (!selectedRoom || !isWebSocketConnected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    webSocketService.sendTypingIndicator(
      selectedRoom.room.id,
      userId,
      isTyping
    );

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        webSocketService.sendTypingIndicator(
          selectedRoom.room.id,
          userId,
          false
        );
      }, 3000);
    }
  };

  const handleRoomSelect = async (room: RoomUserUnreadDTO) => {
    setSelectedRoom(room);

    // Update URL with roomId
    const params = new URLSearchParams(searchParams.toString());
    params.set("roomId", room.room.id.toString());
    router.push(`/dashboard/student/messages?${params.toString()}`);

    // Mark messages as read via WebSocket if needed
    if (room.unreadCount > 0 && isWebSocketConnected) {
      // You might need to implement a WebSocket endpoint for marking as read
      // For now, we'll just update the UI
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.room.id === room.room.id ? { ...r, unreadCount: 0 } : r
        )
      );
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

      // Create new room via WebSocket
      if (isWebSocketConnected) {
        const success = webSocketService.createRoom({
          userId: userId,
          otherUserId: parseInt(user.id),
        });

        if (success) {
          setSearchResults([]);
          setSearchValue("");
          setShowSearch(false);

          // The room will be created and we'll receive it via WebSocket
          toast({
            title: "Creating conversation...",
            description: `Starting conversation with ${user.firstName} ${user.lastName}`,
          });
        } else {
          throw new Error("Failed to create conversation");
        }
      } else {
        throw new Error("WebSocket not connected");
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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle file upload logic here
    const file = files[0];
    toast({
      title: "File selected",
      description: `Selected file: ${file.name}`,
    });

    // Reset the input
    e.target.value = "";
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.user.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
      room.user.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
      room.user.role.toLowerCase().includes(searchValue.toLowerCase())
    // room.room.lastMessageContent
    //   ?.toLowerCase()
    //   .includes(searchValue.toLowerCase())
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

  const isUserTyping = selectedRoom && typingUsers.size > 0;

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
              <span className="text-sm">Online</span>
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
                    placeholder="Search users or messages..."
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
                    {/* <p className="text-xs text-gray-600 truncate">
                      {room.room.lastMessageContent || "No messages yet"}
                    </p> */}
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
          <Card className="lg:col-span-2 flex flex-col">
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
                      {isUserTyping && (
                        <span className="text-blue-500 ml-2">typing...</span>
                      )}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {/* Chat Content */}
            <CardContent className="p-0 flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start a conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === userId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm",
                          msg.senderId === userId
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        )}
                      >
                        {msg.senderId !== userId && (
                          <span className="text-xs font-medium text-gray-600 block mb-1">
                            {selectedRoom.user.firstName}
                          </span>
                        )}
                        <p className="text-sm whitespace-pre-line break-words">
                          {msg.content}
                        </p>
                        {/* {msg.attachment && (
                          <div className="mt-2 p-2 bg-black/10 rounded">
                            <div className="flex items-center">
                              <Paperclip className="h-3 w-3 mr-1" />
                              <span className="text-xs truncate">
                                {msg.attachment.name}
                              </span>
                            </div>
                          </div>
                        )} */}
                        <p
                          className={cn(
                            "text-xs mt-1 text-right",
                            msg.senderId === userId
                              ? "text-blue-100"
                              : "text-gray-500"
                          )}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-white relative">
                <form
                  className="flex items-center gap-2"
                  onSubmit={handleSendMessage}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*, .pdf, .doc, .docx"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleFileUpload}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type your message..."
                      className="pr-10"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping(e.target.value.length > 0);
                      }}
                      onBlur={() => handleTyping(false)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  {newMessage.trim() ? (
                    <Button type="submit" size="icon">
                      <Send className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button type="button" variant="ghost" size="icon">
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                </form>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-10">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 flex items-center justify-center">
            <CardContent className="text-center text-gray-500 p-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
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
