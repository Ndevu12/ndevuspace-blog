export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  receivedAt: string;
  isRead: boolean;
}

export interface MessageFilters {
  search?: string;
  isRead?: boolean;
}

export interface MessageStats {
  total: number;
  unread: number;
  read: number;
}