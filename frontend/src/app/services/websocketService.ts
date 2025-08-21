// app/services/websocketService.ts
import { Client } from "@stomp/stompjs";

interface WebSocketCallbacks {
  onConnect?: () => void;
  onError?: (error: any) => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<number, any> = new Map();
  private callbacks: WebSocketCallbacks = {};
  private isConnected = false;

  connect(token: string, callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;

    // Disconnect if already connected
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
    };

    this.client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      this.isConnected = false;
      this.callbacks.onError?.(frame);
    };

    this.client.onWebSocketClose = (event) => {
      console.log("WebSocket closed:", event);
      this.isConnected = false;
      this.callbacks.onDisconnect?.();
    };

    this.client.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
      this.isConnected = false;
      this.callbacks.onError?.(error);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      // Unsubscribe from all rooms
      this.subscriptions.forEach((subscription, roomId) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.callbacks.onDisconnect?.();
    }
  }

  subscribeToRoom(roomId: number, callback: (message: any) => void) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return false;
    }

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(roomId)) {
      this.unsubscribeFromRoom(roomId);
    }

    const destination = `/topic/rooms/${roomId}`;
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    });

    this.subscriptions.set(roomId, subscription);
    console.log(`Subscribed to room ${roomId}`);
    return true;
  }

  unsubscribeFromRoom(roomId: number) {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
      console.log(`Unsubscribed from room ${roomId}`);
    }
  }

  sendMessage(message: {
    senderId: number;
    receiverId: number;
    content: string;
    roomId?: number;
  }): boolean {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return false;
    }

    try {
      this.client.publish({
        destination: "/app/send-message",
        body: JSON.stringify(message),
      });
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
