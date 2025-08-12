export interface Service {
  _id: string;
  title: string;
  description: string;
  requesterId: {
    _id: string;
    name: string;
    email: string;
  };
  category: string[];
  budget: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applicants: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  selectedApplicant?: {
    _id: string;
    name: string;
    email: string;
  };
  isUrgent: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  title: string;
  description: string;
  category: string[];
  budget: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isUrgent?: boolean;
  tags?: string[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export interface ServiceFilters {
  category?: string[];
  minBudget?: number;
  maxBudget?: number;
  status?: string;
  tags?: string[];
  search?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  interestCategories: string[];
  desiredBudget?: number | null;
  locationRange: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  interestCategories?: string[];
  desiredBudget?: number | null;
  locationRange?: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
    isActive: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Chat {
  _id: string;
  serviceOwnerId: {
    _id: string;
    name: string;
    email: string;
  };
  interestedUserId: {
    _id: string;
    name: string;
    email: string;
  };
  serviceId: {
    _id: string;
    title: string;
    description: string;
  };
  messages: Array<{
    message: string;
    senderId: {
      _id: string;
      name: string;
      email: string;
    };
    timestamp: string;
  }> | string[];
  status: 'active' | 'closed' | 'archived';
  lastMessageAt: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatData {
  serviceId: string;
  interestedUserId: string;
}

export interface SendMessageData {
  chatId: string;
  message: string;
}
