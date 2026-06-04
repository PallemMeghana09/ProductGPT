/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, ArrowRight, Bot, Search, Scale, Heart, TrendingUp, Layers, CheckCircle } from "lucide-react";
import { Product } from "../types";
import { getProductImage } from "../utils";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  trendingProducts?: Product[];
  theme?: "light" | "dark";
}

export default function LandingPage({ onNavigate, trendingProducts, theme }: LandingPageProps) {
  const [localTrending, setLocalTrending] = React.useState<Product[]>([]);

  React.useEffect(() => {
    if (!trendingProducts || trendingProducts.length === 0) {
      import("../utils").then(({ API }) => {
        API.getProducts({ sort: "rating" }).then(data => {
          setLocalTrending(data.slice(0, 4));
        }).catch(err => {
          console.error("Failed to load fallback trending products:", err);
        });
      });
    }
  }, [trendingProducts]);

  const activeTrending = trendingProducts && trendingProducts.length > 0 ? trendingProducts : localTrending;

  const categories = [
    { name: "Audio", count: "12 Products", icon: "🎧" },
    { name: "Laptops", count: "8 Products", icon: "💻" },
    { name: "Wearables", count: "15 Products", icon: "⌚" },
    { name: "Cameras", count: "6 Products", icon: "📷" },
    { name: "Home Appliances", count: "10 Products", icon: "☕" },
    { name: "Fitness", count: "14 Products", icon: "💪" }
  ];

  return (
    <div className="space-y-16 py-6 pb-20">
      {/* Hero Block */}
      <section className="relative overflow-hidden rounded-[32px] p-8 md:p-12 lg:p-16 text-center animate-fade-in bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Empowered by Google Gemini AI
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white leading-none">
            Find the perfect item with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 font-bold">ProductGPT</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-sans font-light">
            An advanced AI Shopping Assistant that understands your unique needs, analyzes complex customer reviews, compares options side-by-side, and finds the absolute best match for your lifestyle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
               id="btn-landmark-chat"
               onClick={() => onNavigate("chat")}
               className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all font-sans border border-white/10"
            >
               <Bot className="w-5 h-5" />
               Chat is Online — Connect Now
               <ArrowRight className="w-4 h-4" />
            </button>
            <button
               id="btn-landmark-search"
               onClick={() => onNavigate("search")}
               className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-100 font-medium rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all font-sans backdrop-blur-md"
            >
               <Search className="w-5 h-5 text-indigo-400" />
               Browse Entire Catalog
            </button>
          </div>
        </div>

        {/* Floating statistics cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto pt-8 border-t border-white/10">
          <div className="text-left p-4 rounded-2xl bg-[#08080a]/40 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">Gemini 3.5</div>
            <div className="text-xs text-slate-450 font-sans mt-1 text-slate-400 font-light">Underlying Neural Model</div>
          </div>
          <div className="text-left p-4 rounded-2xl bg-[#08080a]/40 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">4.8 ⭐</div>
            <div className="text-xs text-slate-450 font-sans mt-1 text-slate-400 font-light">Average Satisfaction Score</div>
          </div>
          <div className="text-left p-4 rounded-2xl bg-[#08080a]/40 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">Real-Time</div>
            <div className="text-xs text-slate-450 font-sans mt-1 text-slate-400 font-light">Review Sentiments Mining</div>
          </div>
          <div className="text-left p-4 rounded-2xl bg-[#08080a]/40 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">100% Secure</div>
            <div className="text-xs text-slate-450 font-sans mt-1 text-slate-400 font-light">Private Shopping Sessions</div>
          </div>
        </div>
      </section>

      {/* Core Architectural Features */}
      <section className="space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white">
            Next-Gen Shopping AI Capabilities
          </h2>
          <p className="text-slate-400 text-sm font-light">
            No regular keyword matching. ProductGPT uses deep behavioral intelligence to match specs with humans.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md shadow-xl space-y-4 hover:border-white/20 hover:bg-white/10 transition-all duration-305 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-400/10 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-all">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-semibold text-slate-100">Conversational Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
              Talk to our chatbot in natural wording. Describe your daily commutes, audio comfort needs, and physical budget lines, and it returns optimal fits.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md shadow-xl space-y-4 hover:border-white/20 hover:bg-white/10 transition-all duration-305 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-400/10 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-semibold text-slate-100">AI Comparison Side-by-Side</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
              Compare multiple products across detailed performance specs, pro/con analysis ratios, and pricing lines, along with an AI diagnostic synthesis verdict.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md shadow-xl space-y-4 hover:border-white/20 hover:bg-white/10 transition-all duration-305 group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-400/10 group-hover:bg-pink-500/20 group-hover:text-pink-300 transition-all">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-semibold text-slate-100">Review Sentiment Miner</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
              Runs deep neural sentiment analysis on multiple customer reviews, summarizing actual pros, cons, and providing detailed score charts.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md shadow-xl space-y-4 hover:border-white/20 hover:bg-white/10 transition-all duration-305 group">
            <div className="w-12 h-12 rounded-xl bg-[#22c55e]/15 flex items-center justify-center text-[#22c55e] border border-green-500/10 group-hover:bg-[#22c55e]/25 group-hover:text-green-300 transition-all">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-semibold text-slate-100">Personalized Insights AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
              Builds a customer profile over time based on category favorites, brand alignments, and budgets, offering proactive updates and dynamic lists.
            </p>
          </div>
        </div>
      </section>

      {/* Structured Hot Categories Selection list */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-semibold text-white">Dynamic Categories</h2>
            <p className="text-slate-400 text-xs font-light">Filtered search catalogs for tech and fitness enthusiast appliances.</p>
          </div>
          <button
            id="browse-catalog-all"
            onClick={() => onNavigate("search")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-sans tracking-wide hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            See All Catalog Items <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <button
               id={`cat-card-${idx}`}
               key={idx}
               onClick={() => onNavigate(`search?category=${encodeURIComponent(cat.name)}`)}
               className="p-5 rounded-[24px] text-left bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-500/30 cursor-pointer hover:bg-white/10 transition-all duration-300 space-y-3 shadow-md group"
            >
               <div className="text-3xl">{cat.icon}</div>
               <div>
                 <div className="font-display font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors text-sm">{cat.name}</div>
                 <div className="text-[10px] text-slate-400 mt-0.5">{cat.count}</div>
               </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trending / Bestselling section */}
      <section className="space-y-6 pb-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-semibold text-white">Trending Real-Time Products</h2>
            <p className="text-slate-400 text-xs font-light">Hot listings that are getting exceptional review score ratios today.</p>
          </div>
          <button
            id="trending-search-cta"
            onClick={() => onNavigate("search?sort=rating")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-sans tracking-wide hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Sort by High Rating <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTrending.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="group rounded-[24px] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 flex flex-col h-full shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-white/5">
                <img
                  referrerPolicy="no-referrer"
                  src={getProductImage(product.image, product.name, product.category)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 origin-center"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                  {product.trending && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-600 border border-indigo-400/25 font-semibold text-indigo-50 uppercase tracking-wider">Trending</span>
                  )}
                  {product.bestSeller && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-600 border border-amber-400/25 font-semibold text-amber-50 uppercase tracking-wider">Best Seller</span>
                  )}
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[11px] font-mono font-medium text-slate-100 flex items-center gap-1 z-10 border border-white/10">
                  ⭐ <span className="text-indigo-300">{product.rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-450 text-slate-400">{product.brand} · {product.category}</div>
                  <h3
                    onClick={() => onNavigate(`product/${product.id}`)}
                    className="font-display font-medium text-slate-200 hover:text-indigo-300 transition-colors cursor-pointer text-base line-clamp-1"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-450 text-slate-400 leading-normal line-clamp-2 font-sans font-light">{product.description}</p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/10">
                  <div>
                    <span className="text-lg font-display font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-slate-500 line-through ml-2">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <button
                    id={`view-detail-p-${product.id}`}
                    onClick={() => onNavigate(`product/${product.id}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500 hover:text-white text-slate-100 text-xs font-medium border border-white/10 inline-flex items-center gap-1 hover:scale-102 transition-all cursor-pointer"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
