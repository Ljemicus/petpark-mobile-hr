export interface Sitter {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  bio: string;
  services: string[];
  avatar: string;
  verified: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  emoji: string;
  topicCount: number;
  description: string;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  author: string;
  replyCount: number;
  lastActivity: string;
  preview: string;
}

export interface ForumReply {
  id: string;
  author: string;
  text: string;
  time: string;
  isExpert: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'vlasnik' | 'sitter' | 'oboje' | 'owner' | 'groomer' | 'trainer' | 'breeder' | 'rescue';
  city: string;
}

export interface ChatContact {
  id: string;
  name: string;
  subtitle: string;
  avatar?: string;
  type: 'provider' | 'user';
}
