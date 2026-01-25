
export type Role = 'MEMBER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  isMember: boolean;
  isPremium: boolean;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  bio?: string | null;
  membershipExpiresAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  pointsPrice?: number;
  imageUrl: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  sellerId: string;
  isPointsEligible: boolean;
  premiumOnly?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: number; // 28 days
  isPremium: boolean;
  features: string[];
}
