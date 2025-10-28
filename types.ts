// Fix: Define the Language enum here to resolve a circular dependency.
export enum Language {
  FR = 'fr',
  EN = 'en',
  ES = 'es',
}

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  password?: string;
}

export interface Transfer {
  id: string;
  userId: number;
  amount: number;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  reason: string;
  status: 'pending' | 'blocked' | 'completed' | 'processing';
  blockedStep: number; // 0 if not blocked, 1-4 if blocked
  blockReason?: string; // Custom reason for the block from an admin
  createdAt: Date;
}

export interface CreditRequest {
  id: string;
  userId: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface UnlockCode {
  id: string;
  transferId: string;
  stepNumber: number;
  code: string;
  used: boolean;
  expiresAt: Date;
}

export enum ChatMessageSender {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
  ADMIN = 'admin',
}

export interface ChatMessage {
  sender: ChatMessageSender;
  text: string;
  file?: { name: string; type: string };
  isTyping?: boolean;
}