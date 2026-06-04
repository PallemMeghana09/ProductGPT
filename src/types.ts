/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment: "positive" | "negative" | "neutral";
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  specs: Record<string, string>;
  description: string;
  features: string[];
  pros: string[];
  cons: string[];
  reviews: Review[];
  stock: number;
  trending: boolean;
  newArrival: boolean;
  bestSeller: boolean;
}

export interface UserPreferences {
  budget: number;
  favoriteCategories: string[];
  favoriteBrands: string[];
  minRating: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  preferences: UserPreferences;
}

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: string;
  originalPrice: number;
  currentPrice: number;
}

export interface Message {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  recommendedProducts?: string[]; // IDs of products linked as recomendations
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  title: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface RecommendationStat {
  category: string;
  recommendationsCount: number;
  averageConversionRate: number;
}
