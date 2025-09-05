export interface MessageResponseDTO {
  id: number;
  senderId: number;
  receiverId: number;
  roomId: number;
  content: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  attachment?: any;
}

export interface WebSocketMessageDTO {
  senderId: number;
  receiverId: number;
  content: string;
  roomId?: number;
  tempMessageId?: number; // Add tempMessageId
}

export interface EditMessageRequest {
  messageId: number;
  newContent: string;
}

export interface EditMessageStatusRequest {
  messageId: number;
  newStatus: string;
}

export interface DeleteMessageRequest {
  messageId: number;
  roomId: number;
}
