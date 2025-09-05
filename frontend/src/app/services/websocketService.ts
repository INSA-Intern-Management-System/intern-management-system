import { Client } from "@stomp/stompjs";
import type {
  WebSocketMessageDTO,
  EditMessageRequest,
  EditMessageStatusRequest,
  DeleteMessageRequest,
} from "@/types/websocket";

interface WebSocketCallbacks {
  onConnect?: () => void;
  onError?: (error: any) => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onRoomCreated?: (tempRoomId: number, realRoomId: number) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<number, any> = new Map();
  private callbacks: WebSocketCallbacks = {};
  private isConnected = false;
  private pendingRoomMappings: Map<number, number> = new Map(); // tempRoomId -> realRoomId

  connect(token: string, callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;

    if (this.client && this.isConnected) {
      this.disconnect();
    }

    this.client = new Client({
      brokerURL: "ws://localhost:8084/ws",
      connectHeaders: {
        "access-token": token,
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log("WebSocket connected:", frame);
      this.isConnected = true;
      this.callbacks.onConnect?.();

      // Resubscribe to all previous rooms
      this.subscriptions.forEach((_, roomId) => {
        if (roomId > 0) {
          // Only resubscribe to real rooms
          this.subscribeToRoom(roomId, (message) => {
            this.callbacks.onMessage?.(message);
          });
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      this.callbacks.onError?.(frame);
    };

    this.client.onWebSocketClose = (event) => {
      console.log("WebSocket closed:", event);
      this.isConnected = false;
      this.callbacks.onDisconnect?.();
    };

    this.client.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
      this.callbacks.onError?.(error);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  subscribeToRoom(roomId: number, callback: (message: any) => void) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return false;
    }

    if (this.subscriptions.has(roomId)) {
      this.unsubscribeFromRoom(roomId);
    }

    const destination = `/topic/rooms/${roomId}`;
    console.log(`Subscribing to ${destination}`);
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);

        // Check if this is a room creation confirmation
        if (parsedMessage.roomCreated) {
          const { tempRoomId, realRoomId } = parsedMessage;
          this.pendingRoomMappings.set(tempRoomId, realRoomId);
          this.callbacks.onRoomCreated?.(tempRoomId, realRoomId);
          return;
        }

        console.log("Received message:", parsedMessage);

        callback(parsedMessage);
        this.callbacks.onMessage?.(parsedMessage);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    });

    this.subscriptions.set(roomId, subscription);
    return true;
  }

  unsubscribeFromRoom(roomId: number) {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  sendMessage(message: WebSocketMessageDTO): boolean {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return false;
    }

    try {
      this.client.publish({
        destination: "/app/send-message",
        body: JSON.stringify(message),
        headers: {
          "content-type": "application/json",
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  editMessage(messageId: number, newContent: string): boolean {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return false;
    }

    try {
      const request: EditMessageRequest = { messageId, newContent };
      this.client.publish({
        destination: "/app/edit-message",
        body: JSON.stringify(request),
        headers: {
          "content-type": "application/json",
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to edit message:", error);
      return false;
    }
  }

  editMessageStatus(messageId: number, newStatus: string): boolean {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return false;
    }

    try {
      const request: EditMessageStatusRequest = { messageId, newStatus };
      this.client.publish({
        destination: "/app/edit-message-status",
        body: JSON.stringify(request),
        headers: {
          "content-type": "application/json",
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to edit message status:", error);
      return false;
    }
  }

  deleteMessage(messageId: number, roomId: number): boolean {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return false;
    }

    try {
      const request: DeleteMessageRequest = { messageId, roomId };
      this.client.publish({
        destination: "/app/delete-message",
        body: JSON.stringify(request),
        headers: {
          "content-type": "application/json",
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to delete message:", error);
      return false;
    }
  }

  getRealRoomId(tempRoomId: number): number | undefined {
    return this.pendingRoomMappings.get(tempRoomId);
  }

  clearRoomMapping(tempRoomId: number) {
    this.pendingRoomMappings.delete(tempRoomId);
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
