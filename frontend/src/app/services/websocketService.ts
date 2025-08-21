"use client";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface WebSocketMessage {
  senderId: number;
  receiverId: number;
  content: string;
  roomId?: number;
}

interface WebSocketConfig {
  onMessage: (message: any) => void;
  onConnect: () => void;
  onError: (error: any) => void;
  onDisconnect: () => void;
}

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string, config: WebSocketConfig) {
    try {
      // Create SockJS connection
      const socket = new SockJS("http://localhost:8084/ws");

      this.client = new Client({
        webSocketFactory: () => socket,
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
        console.log("Connected to WebSocket:", frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        config.onConnect();
      };

      this.client.onStompError = (frame) => {
        console.error("STOMP Error:", frame);
        config.onError(frame);
      };

      this.client.onWebSocketError = (event) => {
        console.error("WebSocket Error:", event);
        config.onError(event);
      };

      this.client.onWebSocketClose = (event) => {
        console.log("WebSocket Closed:", event);
        this.isConnected = false;
        config.onDisconnect();

        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            if (this.client) {
              this.client.activate();
            }
          }, 3000);
        }
      };

      this.client.activate();
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      config.onError(error);
    }
  }

  subscribeToRoom(roomId: number, callback: (message: any) => void) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return;
    }

    try {
      this.client.subscribe(`/topic/rooms/${roomId}`, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          callback(parsedMessage);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      });
    } catch (error) {
      console.error("Failed to subscribe to room:", error);
    }
  }

  unsubscribeFromRoom(roomId: number) {
    if (!this.client || !this.isConnected) return;

    try {
      this.client.unsubscribe(`/topic/rooms/${roomId}`);
    } catch (error) {
      console.error("Failed to unsubscribe from room:", error);
    }
  }

  sendMessage(message: WebSocketMessage) {
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

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  isConnectedNow() {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
