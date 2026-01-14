
export type Role = 'MEMBER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  isMember: boolean;
  isPremium: boolean;
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
