/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Heart, Trash2, ArrowRight, Bot, BellRing, Sparkles, Eye, TrendingDown, RefreshCw } from "lucide-react";
import { API, getProductImage } from "../utils";
import { Product } from "../types";

interface WishlistPageProps {
  onNavigate: (page: string) => void;
  wishlistProductIds: string[];
  onToggleWishlist: (productId: string) => void;
}

export default function WishlistPage({ onNavigate, wishlistProductIds, onToggleWishlist }: WishlistPageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadWishlist();
  }, [wishlistProductIds]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await API.getWishlist();
      setItems(data);
    } catch (e: any) {
      setErr("Failed to load saved products.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await API.removeFromWishlist(productId);
      onToggleWishlist(productId); // sync parent state trigger
    } catch (err) {
      console.error("Remove from wishlist error:", err);
    }
  };

  const handleAskAboutProduct = (name: string) => {
    localStorage.setItem("productgpt_pending_query", `Hi, can you explain the main pros and cons of ${name}, and why should I buy it?`);
    onNavigate("chat");
  };

  if (loading) {
    return <div className="py-20 text-center animate-pulse text-indigo-400 font-sans text-sm">Loading your saved collection...</div>;
  }

  return (
    <div className="space-y-8 py-4 animate-fade-in font-sans">
      
      {/* HEADER INDEX */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-display font-semibold text-white flex items-center gap-2">
          <Heart className="w-5.5 h-5.5 text-rose-500 fill-current" />
          Saved & Favorites Bookmarks
        </h1>
        <p className="text-xs text-slate-400 leading-normal font-sans font-light">
          Track active price discounts, inventory stock updates, or talk to ProductGPT queries about saved items
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center max-w-xl mx-auto rounded-2xl border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm space-y-4 font-sans text-xs shadow-md animate-fade-in">
          <Heart className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-sm font-display font-medium text-white">Your Wishlist is Empty</h2>
          <p className="text-slate-400 font-light leading-normal max-w-sm mx-auto">
            Bookmark items from the catalog or AI chat streams to save them safely under your profile.
          </p>
          <button
             onClick={() => onNavigate("search")}
             className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 border border-white/10 text-white font-semibold cursor-pointer shadow-lg transition-all active:scale-[0.98]"
          >
            Explore Catalog Index
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => {
            const p: Product = it.product;
            if (!p) return null;
            const hadDiscount = p.originalPrice > p.price;
            
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#08080A]/40 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/15 hover:bg-white/5 shadow-xl group relative overflow-hidden backdrop-blur-sm transition-all duration-300"
              >
                {/* Visual price discount drop notifications alert */}
                {hadDiscount && (
                  <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/15 py-1 px-3 text-[9px] uppercase font-bold text-emerald-400 font-mono tracking-wider flex items-center gap-1 backdrop-blur-sm shadow animate-fade-in">
                    <BellRing className="w-3.5 h-3.5 animate-bounce" /> Price dropped!
                  </div>
                )}

                <div className="flex gap-4">
                  <img
                    referrerPolicy="no-referrer"
                    src={getProductImage(p.image, p.name, p.category)}
                    alt={p.name}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 font-sans space-y-1">
                    <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">{p.brand} · {p.category}</span>
                    <h3
                      onClick={() => onNavigate(`product/${p.id}`)}
                      className="text-xs sm:text-sm font-display font-medium text-white hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {p.name}
                    </h3>
                    
                    <div className="flex justify-between items-center text-xs pt-1">
                      <div className="space-x-1.5">
                        <span className="text-white font-bold font-sans">₹{p.price.toLocaleString('en-IN')}</span>
                        {hadDiscount && (
                          <span className="text-[10px] text-slate-500 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">⭐ {p.rating}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-light font-sans pt-1">
                      📄 Added on: {new Date(it.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Sub-actions mappings bar */}
                <div className="flex gap-2 pt-3 border-t border-slate-900/65">
                  <button
                     id={`btn-chat-item-wish-${p.id}`}
                     onClick={() => handleAskAboutProduct(p.name)}
                     className="flex-1 py-2 px-3 bg-[#08080A]/60 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-slate-300 hover:text-indigo-300 cursor-pointer transition-all inline-flex items-center justify-center gap-1 font-medium select-none backdrop-blur-sm"
                     title="Consult Shopping AI regarding specs"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    Ask AI Assistant
                  </button>
                  
                  <button
                     id={`btn-view-item-wish-${p.id}`}
                     onClick={() => onNavigate(`product/${p.id}`)}
                     className="p-2 bg-[#08080A]/60 hover:bg-white/10 text-slate-350 hover:text-white rounded-lg border border-white/10 select-none cursor-pointer text-xs backdrop-blur-sm transition-all"
                     title="Inspect Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                     id={`btn-del-item-wish-${p.id}`}
                     onClick={() => removeItem(p.id)}
                     className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg border border-transparent transition cursor-pointer text-xs"
                     title="Delete Bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
