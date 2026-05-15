import { petParkApi } from './client';

export type BookingRequestNotificationType =
  | 'booking_request_created'
  | 'booking_request_contacted'
  | 'booking_request_closed'
  | 'booking_request_withdrawn'
  | 'booking_request_message';

export type BookingRequestNotificationSummary = {
  id: string;
  type: BookingRequestNotificationType;
  title: string;
  body: string;
  targetPath: string;
  readAt: string | null;
  createdAt: string;
  createdAtLabel: string;
};

export type NotificationReadResponse = {
  ok: true;
  data: {
    id: string;
    read: true;
  };
};

export type InAppNotificationsResponse = {
  ok: true;
  data: {
    notifications: BookingRequestNotificationSummary[];
  };
};

export async function getInAppNotifications(): Promise<BookingRequestNotificationSummary[]> {
  const response = await petParkApi<InAppNotificationsResponse>('/api/notifications/in-app', { auth: true });
  return response.data.notifications;
}

export function markNotificationRead(id: string) {
  return petParkApi<NotificationReadResponse>(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    auth: true,
  });
}

export function bookingRequestIdFromTargetPath(targetPath: string) {
  const match = targetPath.match(/[?&]request=([^&#]+)/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function roleHintFromTargetPath(targetPath: string): 'owner' | 'provider' | null {
  if (targetPath.startsWith('/moji-upiti')) return 'owner';
  if (targetPath.startsWith('/moje-usluge')) return 'provider';
  return null;
}
