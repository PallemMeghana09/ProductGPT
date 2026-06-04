/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Review, WishlistItem, Message, ChatSession, UserActivity, User } from "./types";

// Standard endpoint fetcher with automatic userId validation
const getAuthHeaders = () => {
  const token = localStorage.getItem("productgpt_token") || "u-1";
  return {
    "Content-Type": "application/json",
    "x-user-id": token
  };
};

export const API = {
  // Configured check
  checkHealth: async () => {
    try {
      const res = await fetch("/api/health");
      return await res.json();
    } catch (e) {
      return { status: "local_only", geminiConnected: false };
    }
  },

  // Auth Functions
  login: async (payload: { email: string; passwordStr: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email, password: payload.passwordStr })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login Failed.");
    }
    return await res.json();
  },

  register: async (payload: { email: string; passwordStr: string; name: string }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email, password: payload.passwordStr, name: payload.name })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Registration Failed.");
    }
    return await res.json();
  },

  googleAuth: async (payload: { email: string; name: string }) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Google Social Login Failed.");
    }
    return await res.json();
  },

  forgotPassword: async (email: string) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Password Reset failed.");
    }
    return await res.json();
  },

  getMe: async () => {
    const res = await fetch("/api/user/me", {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Could not load user profile");
    return await res.json();
  },

  updatePreferences: async (prefs: User["preferences"]) => {
    const res = await fetch("/api/user/preferences", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error("Preferences update failed.");
    return await res.json();
  },

  // Products CRUD & Query APIs
  getProducts: async (filters: { category?: string; brand?: string; search?: string; maxPrice?: number; rating?: number; sort?: string }) => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.search) params.append("search", filters.search);
    if (filters.maxPrice) params.append("maxPrice", String(filters.maxPrice));
    if (filters.rating) params.append("rating", String(filters.rating));
    if (filters.sort) params.append("sort", filters.sort);

    const res = await fetch(`/api/products?${params.toString()}`);
    return await res.json();
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("Product data not found");
    return await res.json();
  },

  // Wishlist Functions
  getWishlist: async () => {
    const res = await fetch("/api/wishlist", {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  addToWishlist: async (productId: string) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId })
    });
    if (!res.ok) throw new Error("Could not add item to wishlist");
    return await res.json();
  },

  removeFromWishlist: async (productId: string) => {
    const res = await fetch(`/api/wishlist/${productId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  // Chat APIs
  getChatSessions: async () => {
    const res = await fetch("/api/chat/sessions", {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  getChatSessionDetails: async (id: string) => {
    const res = await fetch(`/api/chat/sessions/${id}`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  sendMessage: async (messageText: string, sessionId?: string) => {
    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message: messageText, sessionId })
    });
    if (!res.ok) throw new Error("Failed to post message to AI Assistant");
    return await res.json();
  },

  deleteChatSession: async (id: string) => {
    const res = await fetch(`/api/chat/sessions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  // AI Reviews Sentiment analysis
  analyzeReviews: async (productId: string) => {
    const res = await fetch("/api/ai/analyze-reviews", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId })
    });
    if (!res.ok) throw new Error("Review analysis failed");
    return await res.json();
  },

  // AI Side by Side comparison
  compareProducts: async (productIds: string[], userDescription?: string) => {
    const res = await fetch("/api/ai/compare", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ productIds, userDescription })
    });
    if (!res.ok) throw new Error("Comparison failed");
    return await res.json();
  },

  // Admin Dashboard Services
  getAdminAnalytics: async () => {
    const res = await fetch("/api/admin/analytics", {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  getAdminActivities: async () => {
    const res = await fetch("/api/admin/activities", {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  clearAdminActivities: async () => {
    await fetch("/api/admin/activities", {
      method: "DELETE",
      headers: getAuthHeaders()
    });
  },

  // Admin Catalog Modification
  adminCreateProduct: async (productData: Partial<Product>) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error("Could not create product record");
    return await res.json();
  },

  adminUpdateProduct: async (id: string, productData: Partial<Product>) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error("Could not update product record");
    return await res.json();
  },

  adminDeleteProduct: async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Could not delete product record");
    return await res.json();
  }
};

/**
 * Resolves a reliable image URL, falling back to clean high-quality Unsplash images
 * when the product has no image or a placeholder or invalid value.
 */
export function getProductImage(image?: string, name?: string, category?: string): string {
  if (image && image.trim() !== "" && (image.startsWith("http://") || image.startsWith("https://"))) {
    return image;
  }

  const cat = (category || "").toLowerCase();
  const title = (name || "").toLowerCase();

  // Mapping to beautiful high-quality Unsplash product images
  if (cat.includes("audio") || title.includes("headphone") || title.includes("sound") || title.includes("earbud") || title.includes("speaker")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600";
  }
  if (cat.includes("laptop") || title.includes("book") || title.includes("macbook") || title.includes("pc") || title.includes("computer")) {
    return "https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&q=80&w=600";
  }
  if (cat.includes("wearable") || title.includes("watch") || title.includes("band") || title.includes("smartwatch") || title.includes("fitbit")) {
    return "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600";
  }
  if (cat.includes("camera") || title.includes("lens") || title.includes("dslr") || title.includes("shoot") || title.includes("photo")) {
    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600";
  }
  if (cat.includes("appliance") || cat.includes("home") || title.includes("coffee") || title.includes("grinder") || title.includes("brewer") || title.includes("machine") || title.includes("toaster") || title.includes("cook")) {
    return "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600";
  }
  if (cat.includes("accessory") || title.includes("keyboard") || title.includes("mouse") || title.includes("mount") || title.includes("cable") || title.includes("charge")) {
    return "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600";
  }
  if (cat.includes("fitness") || title.includes("gym") || title.includes("bench") || title.includes("train") || title.includes("yoga") || title.includes("sport")) {
    return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600";
  }

  // Fallback to professional generic tech/product placeholder
  return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600`;
}

