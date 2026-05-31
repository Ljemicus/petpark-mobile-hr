// User type definition
interface User {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string | null;
  image_url: string | null;
  read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface ConversationState {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  messages: Message[];
  lastMessage: Message | null;
  unreadCount: number;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar_url: string | null;
  role: 'owner' | 'sitter' | 'admin';
}
