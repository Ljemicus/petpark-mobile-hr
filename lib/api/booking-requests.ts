import { petParkApi } from './client';

export type BookingRequestStatus = 'pending' | 'contacted' | 'closed' | 'withdrawn';
export type BookingRequestActionStatus = 'contacted' | 'closed';

export type BookingRequestEventSummary = {
  id: string;
  type: 'created' | 'provider_contacted' | 'provider_closed' | 'owner_withdrawn';
  actorRole: 'owner' | 'provider' | 'admin' | 'system';
  summary: string;
  oldStatus: string | null;
  newStatus: string | null;
  createdAt: string;
  createdAtLabel: string;
};

export type OwnerBookingRequestSummary = {
  id: string;
  providerSlug: string;
  providerName: string;
  serviceLabel: string;
  priceSnapshot: string;
  responseTimeSnapshot: string;
  petName: string;
  petType: string;
  dateRange: string;
  notes: string;
  status: BookingRequestStatus;
  statusLabel: 'Poslano' | 'Kontaktiran' | 'Zatvoreno' | 'Povučen';
  submittedAt: string;
  contactMethod: {
    email: string | null;
    phone: string | null;
    consent: boolean;
  };
  conversationEnabled: boolean;
  unreadNotificationCount: number;
  events: BookingRequestEventSummary[];
};

export type ProviderBookingRequestSummary = {
  id: string;
  providerSlug: string;
  serviceLabel: string;
  priceSnapshot: string;
  responseTimeSnapshot: string;
  petName: string;
  petType: string;
  dateRange: string;
  notes: string;
  status: string;
  submittedAt: string;
  requesterName: string | null;
  requesterEmail: string | null;
  requesterPhone: string | null;
  contactConsent: boolean;
  conversationEnabled: boolean;
  unreadNotificationCount: number;
  events: BookingRequestEventSummary[];
};

export type BookingRequestMessage = {
  id: string;
  bookingRequestId: string;
  senderProfileId: string;
  senderRole: 'owner' | 'provider' | 'admin' | string;
  senderLabel: string;
  body: string;
  createdAt: string;
  createdAtLabel: string;
  isOwnMessage: boolean;
};

export type BookingRequestMessagesResponse = {
  ok: true;
  data: {
    role: 'owner' | 'provider' | 'admin';
    messages: BookingRequestMessage[];
  };
};

export type OwnerBookingRequestsResponse = {
  ok: true;
  data: {
    requests: OwnerBookingRequestSummary[];
  };
};

export type ProviderBookingRequestsResponse = {
  ok: true;
  data: {
    requests: ProviderBookingRequestSummary[];
  };
};

export type BookingRequestStatusResponse = {
  ok: true;
  data: {
    id: string;
    status: BookingRequestStatus;
  };
};

export type HealthResponse = {
  status: string;
  timestamp: string;
  version?: string;
  environment?: string;
  responseTime?: number;
  checks?: Record<string, unknown>;
};

export function getHealth() {
  return petParkApi<HealthResponse>('/api/health');
}

export async function getOwnerBookingRequests(): Promise<OwnerBookingRequestSummary[]> {
  const response = await petParkApi<OwnerBookingRequestsResponse>('/api/booking-requests/owner', { auth: true });
  return response.data.requests;
}

export async function getProviderBookingRequests(): Promise<ProviderBookingRequestSummary[]> {
  const response = await petParkApi<ProviderBookingRequestsResponse>('/api/booking-requests/provider', { auth: true });
  return response.data.requests;
}

export function withdrawBookingRequest(id: string) {
  return petParkApi<BookingRequestStatusResponse>(`/api/booking-requests/${encodeURIComponent(id)}/withdraw`, {
    method: 'PATCH',
    auth: true,
  });
}

export function updateBookingRequestStatus(id: string, status: BookingRequestActionStatus) {
  return petParkApi<BookingRequestStatusResponse>(`/api/booking-requests/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  });
}

export function getBookingRequestMessages(id: string) {
  return petParkApi<BookingRequestMessagesResponse>(`/api/booking-requests/${encodeURIComponent(id)}/messages`, {
    auth: true,
  });
}

export function sendBookingRequestMessage(id: string, body: string) {
  return petParkApi<BookingRequestMessagesResponse>(`/api/booking-requests/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ body }),
  });
}
