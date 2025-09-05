"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
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
  Edit,
  Trash2,
  X,
  Check,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type {
  SearchUser,
  RoomUserUnreadDTO,
  Message as MessageType,
} from "@/types/entities";
import { webSocketService } from "@/app/services/websocketService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const tempMessageIdCounter = useRef(0); // Counter for unique temp message IDs
  // Track the last created real room id
  const [lastCreatedRoomId, setLastCreatedRoomId] = useState<number | null>(
    null
  );

  // When a new real room id arrives, navigate to that room and clear messages to trigger loading
  useEffect(() => {
    if (lastCreatedRoomId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("roomId", lastCreatedRoomId.toString());
      router.replace(`/dashboard/university/messages?${params.toString()}`);
      setMessages([]); // Optionally clear messages to show loading state
    }
  }, [lastCreatedRoomId, router, searchParams]);

  // Initialize WebSocket connection
  // When a new real room id arrives, navigate to that room and clear messages to trigger loading
  useEffect(() => {
    if (lastCreatedRoomId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("roomId", lastCreatedRoomId.toString());
      router.replace(`/dashboard/university/messages?${params.toString()}`);
      setMessages([]); // Optionally clear messages to show loading state
    }
  }, [lastCreatedRoomId, router, searchParams]);

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
      onRoomCreated: (tempRoomId, realRoomId) => {
        console.log(`Room created: temp=${tempRoomId}, real=${realRoomId}`);
        if (selectedRoom?.room.id === tempRoomId) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("roomId", realRoomId.toString());
          router.replace(`/dashboard/university/messages?${params.toString()}`);
        }
        setRooms((prev) =>
          prev.map((room) =>
            room.room.id === tempRoomId
              ? { ...room, room: { ...room.room, id: realRoomId } }
              : room
          )
        );

        if (selectedRoom?.room.id === tempRoomId) {
          setSelectedRoom((prev) =>
            prev ? { ...prev, room: { ...prev.room, id: realRoomId } } : null
          );
          setMessages([]); // Clear messages to show loading state
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.roomId === tempRoomId ? { ...msg, roomId: realRoomId } : msg
            )
          );
        }

        if (selectedRoom?.room.id === tempRoomId) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("roomId", realRoomId.toString());
          router.replace(
            `/dashboard/university/messages?${params.toString()}`,
            {
              scroll: false,
            }
          );
        }
      },
      onMessage: (message) => {
        handleIncomingMessage(message);
      },
    });

    return () => {
      webSocketService.disconnect();
    };
  }, [accessToken, router, searchParams, selectedRoom]);

  const handleIncomingMessage = (message: any) => {
    if (message.roomCreated) {
      const { tempRoomId, realRoomId, message: newMessage } = message;

      setRooms((prev) =>
        prev.map((room) =>
          room.room.id === tempRoomId
            ? { ...room, room: { ...room.room, id: realRoomId } }
            : room
        )
      );

      if (selectedRoom?.room.id === tempRoomId) {
        setSelectedRoom((prev) =>
          prev ? { ...prev, room: { ...prev.room, id: realRoomId } } : null
        );

        const params = new URLSearchParams(searchParams.toString());
        params.set("roomId", realRoomId.toString());
        router.replace(`/dashboard/university/messages?${params.toString()}`, {
          scroll: false,
        });
      }

      setMessages((prev) => {
        const filtered = prev.filter(
          (msg) => msg.id !== newMessage.tempMessageId
        );
        const updated = [...filtered, newMessage].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return updated;
      });

      return;
    }

    if (message.deletedMessageId) {
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== message.deletedMessageId)
      );
      return;
    }

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

    setMessages((prev) => {
      const filtered = prev.filter((msg) => msg.id !== message.tempMessageId);
      const updated = [...filtered, newMessage].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return updated;
    });

    setRooms((prev) =>
      prev.map((room) =>
        room.room.id === newMessage.roomId
          ? {
              ...room,
              room: { ...room.room, lastMessageAt: new Date().toISOString() },
              unreadCount:
                room.room.id === selectedRoom?.room.id
                  ? 0
                  : room.unreadCount + 1,
            }
          : room
      )
    );
  };

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  useEffect(() => {
    const sortedMessages = [...initialMessages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (selectedRoom && selectedRoom.room.id < 0) {
      setMessages([]);
    }
    setMessages(sortedMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

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
    if (!newMessage.trim() || !selectedRoom || isSending) return;
    setIsSending(true);

    if (isWebSocketConnected) {
      const tempMessageId = -++tempMessageIdCounter.current;
      const tempMessage: MessageType = {
        id: tempMessageId,
        senderId: userId,
        roomId: selectedRoom.room.id,
        receiverId: Number.parseInt(selectedRoom.user.id),
        content: newMessage.trim(),
        status: "SENT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      const success = webSocketService.sendMessage({
        senderId: userId,
        receiverId: Number.parseInt(selectedRoom.user.id),
        content: tempMessage.content,
        roomId: selectedRoom.room.id > 0 ? selectedRoom.room.id : undefined,
        tempMessageId: tempMessageId,
      });
      console.log("sendMessage success:", success);
      if (!success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
        setNewMessage(tempMessage.content);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
      setIsSending(false);

      const timer = setTimeout(() => {
        router.refresh();
        const params = new URLSearchParams(searchParams.toString());
        params.set("roomId", selectedRoom.room.id.toString());
        router.replace(`/dashboard/university/messages?${params.toString()}`);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      toast({
        title: "Connection Issue",
        description: "Unable to send message. Please check your connection.",
        variant: "destructive",
      });
      setIsSending(false);
    }
  };

  const handleMarkMessageAsRead = (messageId: number) => {
    if (!isWebSocketConnected) return;

    const success = webSocketService.editMessageStatus(messageId, "READ");
    if (success) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "READ" } : msg
        )
      );
    }
  };

  const handleRoomSelect = async (room: RoomUserUnreadDTO) => {
    setIsLoading(true);

    if (selectedRoom && selectedRoom.room.id > 0) {
      webSocketService.unsubscribeFromRoom(selectedRoom.room.id);
    }

    setMessages([]);
    setSelectedRoom(room);

    if (room.room.id > 0 && isWebSocketConnected) {
      webSocketService.subscribeToRoom(room.room.id, handleIncomingMessage);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("roomId", room.room.id.toString());
    router.push(`/dashboard/university/messages?${params.toString()}`);

    if (isWebSocketConnected) {
      messages
        .filter(
          (msg) =>
            msg.roomId === room.room.id &&
            msg.senderId !== userId &&
            msg.status !== "READ"
        )
        .forEach((msg) => {
          webSocketService.editMessageStatus(msg.id, "READ");
        });
    }

    setTimeout(() => setIsLoading(false), 300);
  };

  const handleEditMessage = (messageId: number, newContent: string) => {
    if (!selectedRoom) return;

    const success = webSocketService.editMessage(messageId, newContent);
    if (success) {
      setMessages((prev) =>
        prev
          .map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: newContent,
                  updatedAt: new Date().toISOString(),
                }
              : msg
          )
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
      );
      const timer = setTimeout(() => {
        router.refresh();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!selectedRoom) return;

    const success = webSocketService.deleteMessage(
      messageId,
      selectedRoom.room.id
    );
    if (success) {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      const timer = setTimeout(() => {
        router.refresh();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
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
    setMessages([]);
    const existingRoom = rooms.find((room) => room.user.id === user.id);

    if (existingRoom) {
      handleRoomSelect(existingRoom);
      setSearchResults([]);
      setSearchValue("");
      setShowSearch(false);
      return;
    }

    const tempRoom: RoomUserUnreadDTO = {
      room: {
        id: -1,
        user1Id: Number(userId),
        user2Id: Number(user.id),
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      user: {
        ...user,
        status: "OFFLINE",
      },
      unreadCount: 0,
    };
    setSelectedRoom(tempRoom);
    setRooms((prev) => [tempRoom, ...prev]);

    setSearchResults([]);
    setSearchValue("");
    setShowSearch(false);

    // const timer = setTimeout(() => {
    //   router.refresh();
    //   setMessages([]);
    // }, 5000);
    // return () => {
    //   clearTimeout(timer);
    // };

    toast({
      title: "Ready to chat",
      description: `Type your first message to start a conversation with ${user.firstName} ${user.lastName}`,
    });
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
    router.push(`/dashboard/university/messages?${params.toString()}`);
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

    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);

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

  useEffect(() => {
    if (!selectedRoom) return;

    const checkVisibleMessages = () => {
      const messageElements = document.querySelectorAll("[data-message-id]");
      messageElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
          const messageId = Number(element.getAttribute("data-message-id"));
          const message = messages.find((msg) => msg.id === messageId);

          if (
            message &&
            message.senderId !== userId &&
            message.status !== "READ"
          ) {
            handleMarkMessageAsRead(messageId);
          }
        }
      });
    };

    const chatContainer = document.querySelector(".overflow-y-auto");
    if (chatContainer) {
      chatContainer.addEventListener("scroll", checkVisibleMessages);
      checkVisibleMessages();

      return () => {
        chatContainer.removeEventListener("scroll", checkVisibleMessages);
      };
    }
  }, [messages, selectedRoom, userId, isWebSocketConnected]);

  // Debug duplicate message IDs
  useEffect(() => {
    const messageIds = messages.map((msg) => msg.id);
    const duplicates = messageIds.filter(
      (id, index) => messageIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      console.warn("Duplicate message IDs detected:", duplicates);
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-slate-600 mt-1">
            Connect with mentors and supervisors
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant={isWebSocketConnected ? "default" : "destructive"}
            className="flex items-center gap-1 px-3 py-1"
          >
            {isWebSocketConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Conversations List */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl shadow-lg lg:col-span-1">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              {showSearch ? (
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    autoFocus
                    className="h-10 text-sm pl-10 rounded-lg bg-white border-slate-200 focus:border-blue-300"
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchValue("");
                      setSearchResults([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Conversations
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-slate-200 hover:bg-slate-50"
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
              <div className="border-b border-slate-100">
                <div className="p-3 bg-slate-50/50">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Search Results
                  </h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-4 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group"
                      onClick={() => handleStartConversation(user)}
                    >
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate text-slate-800 group-hover:text-blue-700">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {user.role} • {user.university || "No university"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSearching && (
              <div className="p-6 text-center text-slate-500">
                <div className="animate-pulse flex flex-col items-center">
                  <Search className="h-6 w-6 mb-2" />
                  <p className="text-sm">Searching...</p>
                </div>
              </div>
            )}

            {/* Conversations List */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              {filteredRooms.map((room) => (
                <div
                  key={room.room.id}
                  className={`flex items-center space-x-3 p-4 hover:bg-slate-50/70 cursor-pointer border-l-4 transition-all duration-200 group ${
                    selectedRoom?.room.id === room.room.id
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-transparent hover:border-slate-200"
                  }`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white font-medium">
                        {getParticipantInitials(room)}
                      </AvatarFallback>
                    </Avatar>
                    {room.user.status === "ONLINE" && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate text-slate-800">
                        {getParticipantName(room)}
                      </h4>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(room.room.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">
                        {room.user.role} • {room.user.university}
                      </p>
                      {room.unreadCount > 0 && (
                        <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        {selectedRoom ? (
          <Card className="lg:col-span-2 border-slate-200/70 rounded-xl shadow-lg overflow-hidden">
            {/* Chat Header */}
            <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white font-medium">
                        {getParticipantInitials(selectedRoom)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRoom.user.status === "ONLINE" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {getParticipantName(selectedRoom)}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedRoom.user.role} • {selectedRoom.user.university}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-lg"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-lg"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Block User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {/* Chat Content */}
            <CardContent className="p-0 flex flex-col h-[600px]">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-blue-50/20">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No messages yet</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Start the conversation by sending a message.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          data-message-id={msg.id}
                          className={`flex ${
                            msg.senderId === userId
                              ? "justify-end"
                              : "justify-start"
                          } group relative`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
                              msg.senderId === userId
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                            } ${msg.id < 0 ? "opacity-70" : ""}`}
                          >
                            {editingMessageId === msg.id ? (
                              <div className="flex flex-col space-y-2">
                                <Input
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                  className="bg-white/10 border-white/20 text-white placeholder-white/70"
                                  autoFocus
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-white text-blue-600 hover:bg-white/90"
                                    onClick={() => {
                                      handleEditMessage(msg.id, editContent);
                                      setEditingMessageId(null);
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/30 text-white hover:bg-white/10"
                                    onClick={() => setEditingMessageId(null)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.senderId !== userId && (
                                  <span className="text-xs font-medium text-slate-600 block mb-1">
                                    {selectedRoom.user.firstName}
                                  </span>
                                )}
                                <p className="text-sm whitespace-pre-line break-words">
                                  {msg.content}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p
                                    className={`text-xs ${
                                      msg.senderId === userId
                                        ? "text-blue-100/80"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {formatTime(msg.createdAt)}
                                    {msg.updatedAt !== msg.createdAt &&
                                      " • Edited"}
                                  </p>
                                  {msg.senderId === userId && (
                                    <span className="text-xs opacity-80">
                                      {msg.status.toLowerCase()}
                                    </span>
                                  )}
                                </div>

                                {msg.senderId === userId && msg.id > 0 && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-800/90 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                      >
                                        <MoreVertical className="h-3 w-3 text-white" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-40 bg-white"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingMessageId(msg.id);
                                          setEditContent(msg.content);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteMessage(msg.id)
                                        }
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-slate-100 p-4 bg-white">
                    <form
                      className="flex items-center gap-2"
                      onSubmit={handleSendMessage}
                    >
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 rounded-xl border-slate-200 focus:border-blue-300 h-12"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        disabled={!newMessage.trim() || isSending}
                      >
                        {isSending ? (
                          <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full inline-block"></span>
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 flex items-center justify-center border-slate-200/70 rounded-xl shadow-lg">
            <CardContent className="text-center text-slate-500 p-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold mb-2">
                No conversation selected
              </h3>
              <p>Choose a conversation from the list to start messaging</p>
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
                  className="hover:bg-blue-100 hover:text-blue-700 rounded-lg"
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
                  className="hover:bg-blue-100 hover:text-blue-700 rounded-lg"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
