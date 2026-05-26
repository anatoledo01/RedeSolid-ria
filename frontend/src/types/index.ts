export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DONOR' | 'VOLUNTEER' | 'RECEIVER';
  phone?: string;
  avatar?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  _count?: { donations: number };
}

export interface DonationImage {
  id: string;
  url: string;
  filename: string;
}

export interface Donation {
  id: string;
  title: string;
  description: string;
  quantity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  locationText?: string;
  createdAt: string;
  updatedAt: string;
  donorId: string;
  receiverId?: string;
  categoryId: string;
  donor: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  receiver?: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  category: Category;
  images: DonationImage[];
  _count?: { reviews: number; deliveries: number };
}

export interface DeliveryRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  acceptedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  donationId: string;
  volunteerId: string;
  donation: Donation;
  volunteer: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  authorId: string;
  targetId: string;
  donationId: string;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  target: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalDonations: number;
  deliveredDonations: number;
  activeVolunteers: number;
  totalDonors: number;
  totalReceivers: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentDonations: Donation[];
  donationsByStatus: { status: string; count: number }[];
  donationsByMonth: { month: string; count: number }[];
}
