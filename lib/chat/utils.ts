import { ConversationState, Message } from './types';

export function sortConversations(items: ConversationState[]): ConversationState[] {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export function upsertConversation(
  conversations: ConversationState[],
  partnerId: string,
  updater: (conversation: ConversationState | undefined) => ConversationState
): ConversationState[] {
  const existing = conversations.find(c => c.partnerId === partnerId);
  const nextConversation = updater(existing);
  const rest = conversations.filter(c => c.partnerId !== partnerId);
  return sortConversations([nextConversation, ...rest]);
}

export function appendMessageIfMissing(messages: Message[], message: Message): Message[] {
  if (messages.some(existing => existing.id === message.id)) {
    return messages;
  }
  return [...messages, message];
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    // Today - show time
    return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Jučer';
  } else if (days < 7) {
    return date.toLocaleDateString('hr-HR', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
  }
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isToday) return 'Danas';
  if (isYesterday) return 'Jučer';
  
  return date.toLocaleDateString('hr-HR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  
  for (const msg of messages) {
    const msgDate = new Date(msg.created_at).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: msg.created_at, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  }
  
  return groups;
}
