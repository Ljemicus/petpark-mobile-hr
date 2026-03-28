import { Alert } from 'react-native';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'message' | 'booking' | 'order' | 'lost_pet' | 'promo';
  read: boolean;
  timestamp: Date;
}

const mockNotifications: AppNotification[] = [
  {
    id: '1',
    title: 'Nova poruka',
    body: 'Ana Horvat vam je poslala poruku o čuvanju vašeg ljubimca.',
    type: 'message',
    read: false,
    timestamp: new Date(2026, 2, 27, 10, 30),
  },
  {
    id: '2',
    title: 'Rezervacija potvrđena',
    body: 'Vaša rezervacija kod sittera Maje Tomić je potvrđena za 29.03.',
    type: 'booking',
    read: false,
    timestamp: new Date(2026, 2, 27, 9, 15),
  },
  {
    id: '3',
    title: 'Narudžba poslana',
    body: 'Vaša narudžba #1042 je poslana! Očekivano vrijeme dostave: 2-3 radna dana.',
    type: 'order',
    read: true,
    timestamp: new Date(2026, 2, 26, 16, 0),
  },
  {
    id: '4',
    title: 'Izgubljen ljubimac u vašem području',
    body: 'Crni mačak Miki izgubljen u Zagrebu, Maksimir. Pomozite u potrazi!',
    type: 'lost_pet',
    read: false,
    timestamp: new Date(2026, 2, 26, 14, 20),
  },
  {
    id: '5',
    title: 'Posebna ponuda!',
    body: '20% popusta na sve proizvode za njegu ovaj vikend! Iskoristite kod: SAPICA20',
    type: 'promo',
    read: true,
    timestamp: new Date(2026, 2, 25, 12, 0),
  },
];

let notifications = [...mockNotifications];

export function getNotifications(): AppNotification[] {
  return notifications;
}

export function getUnreadCount(): number {
  return notifications.filter(n => !n.read).length;
}

export function markAsRead(id: string): void {
  notifications = notifications.map(n =>
    n.id === id ? { ...n, read: true } : n
  );
}

export function markAllAsRead(): void {
  notifications = notifications.map(n => ({ ...n, read: true }));
}

export function showMockNotification(
  title: string = 'PetPark',
  body: string = 'Imate novu obavijest! 🐾'
): void {
  Alert.alert(title, body, [{ text: 'U redu', style: 'default' }]);
}

export function scheduleLocalNotification(
  title: string,
  body: string,
  delayMs: number = 3000
): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    showMockNotification(title, body);
  }, delayMs);
}
