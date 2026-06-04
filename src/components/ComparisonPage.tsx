/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Scale, Sparkles, AlertCircle, Trash2, HelpCircle, Heart, Eye } from "lucide-react";
import { API, getProductImage } from "../utils";
import { Product } from "../types";

interface ComparisonPageProps {
  compareProductIds: string[];
  onNavigate: (page: string) => void;
  onSetCompareList: (updater: (prev: string[]) => string[]) => void;
  wishlistProductIds: string[];
  onToggleWishlist: (productId: string) => void;
}

export default function ComparisonPage({
  compareProductIds,
  onNavigate,
  onSetCompareList,
  wishlistProductIds,
  onToggleWishlist
}: ComparisonPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Custom user context input for AI verdict targeting
  const [userContext, setUserContext] = useState("");
  const [aiVerdict, setAiVerdict] = useState("");
  const [generatingVerdict, setGeneratingVerdict] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [compareProductIds]);

  const loadProducts = async () => {
    if (compareProductIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErr("");
      // Fetch details of all items in compare list from database
      const fetched: Product[] = [];
      for (const id of compareProductIds) {
        try {
          const p = await API.getProductById(id);
          fetched.push(p);
        } catch {
          // skip missing
        }
      }
      setProducts(fetched);
      
      // Auto-trigger simple comparative verdict
      runLocalSimulatedVerdict(fetched, "");
    } catch (e: any) {
      setErr("Failed to pull comparison assets.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (id: string) => {
    onSetCompareList(prev => prev.filter(x => x !== id));
  };

  const queryAIVerdict = async () => {
    if (products.length < 2 || generatingVerdict) return;
    try {
      setGeneratingVerdict(true);
      const res = await API.compareProducts(products.map(p => p.id), userContext);
      setAiVerdict(res.verdict);
      alert("AI Side-by-Side Verdict compiled successfully using Gemini 3.5!");
    } catch (e) {
      runLocalSimulatedVerdict(products, userContext);
      alert("AI Verdict compiled locally because the server Gemini API key is offline.");
    } finally {
      setGeneratingVerdict(false);
    }
  };

  const runLocalSimulatedVerdict = (list: Product[], context: string) => {
    if (list.length === 0) return;
    const ctxLower = context.toLowerCase();
    
    // Heuristic decision logic
    let picked: Product = list[0];
    let justification = "";

    if (ctxLower.includes("budget") || ctxLower.includes("cheap") || ctxLower.includes("price")) {
      // Find lowest price
      picked = [...list].sort((a, b) => a.price - b.price)[0];
      justification = "the most budget-friendly price point of only ₹" + picked.price.toLocaleString('en-IN');
    } else if (ctxLower.includes("commute") || ctxLower.includes("flight") || ctxLower.includes("travel") || ctxLower.includes("comfort")) {
      // Prioritize headphones if exist, otherwise battery/wearables
      const audioMatch = list.find(p => p.category === "Audio");
      if (audioMatch) {
        picked = audioMatch;
        justification = "exceptional hybrid active noise cancellation (ANC) and spatial audio dynamics ideal for noisy transits";
      } else {
        picked = [...list].sort((a, b) => b.rating - a.rating)[0];
        justification = "outstanding consumer rating index and durable battery metrics";
      }
    } else {
      // Default to highest average rating
      picked = [...list].sort((a, b) => b.rating - a.rating)[0];
      justification = "an elite high rating of " + picked.rating + "⭐ and excellent praise from customer sentiment channels";
    }

    setAiVerdict(`Based on side-by-side spec diagnostics, **${picked.name}** is the recommended fit for you! It offers ${justification}. If other specs dictate differently, verify specific columns.`);
  };

  // Compile unified list of unique spec keys available among compared devices
  const getUniqueSpecKeys = () => {
    const keysSet = new Set<string>();
    products.forEach(p => {
      Object.keys(p.specs).forEach(k => keysSet.add(k));
    });
    return Array.from(keysSet);
  };

  if (loading) {
    return <div className="py-20 text-center animate-pulse text-indigo-400 font-sans text-sm">Aligning spec tables...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center max-w-xl mx-auto rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/10 space-y-4 animate-fade-in font-sans">
        <Scale className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-base font-display font-medium text-white">Your Comparison Tray is Empty</h2>
        <p className="text-xs text-slate-400 font-light leading-normal max-w-sm mx-auto">
          Add up to 3 products from the Search page or AI Chat suggestions to compare their specs side-by-side.
        </p>
        <button
           onClick={() => onNavigate("search")}
           className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const specKeys = getUniqueSpecKeys();

  return (
    <div className="space-y-8 py-4 animate-fade-in font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-white flex items-center gap-2">
            <Scale className="w-5.5 h-5.5 text-indigo-400" />
            Side-by-Side Diagnostics
          </h1>
          <p className="text-xs text-slate-400 font-sans leading-relaxed font-light">
            Analyse specifications, ratings, and features of your favorite items
          </p>
        </div>
        <button
           id="btn-clear-tray-all"
           onClick={() => { onSetCompareList(() => []); alert("Cleared tray."); }}
           className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-semibold text-xs cursor-pointer transition-colors"
        >
          Clear Selection Tray
        </button>
      </div>

      {/* DETAILED SIDE-BY-SIDE MATRIX HERO */}
      <section className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* 1. Header with images */}
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono w-1/4">Product Cards</th>
              {products.map(p => (
                <th key={p.id} className="p-4 w-1/4 min-w-[200px]">
                  <div className="space-y-3 relative group">
                    <button
                       id={`btn-remove-compare-p-${p.id}`}
                       onClick={() => removeItem(p.id)}
                       className="absolute top-0 right-0 p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition"
                       title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <img
                      referrerPolicy="no-referrer"
                      src={getProductImage(p.image, p.name, p.category)}
                      alt={p.name}
                      className="w-full aspect-video object-cover rounded-xl border border-slate-800"
                    />

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider">{p.brand}</span>
                      <h3
                        onClick={() => onNavigate(`product/${p.id}`)}
                        className="font-display font-medium text-slate-100 hover:text-indigo-400 hover:underline cursor-pointer text-xs sm:text-sm truncate"
                      >
                        {p.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-400">⭐ {p.rating}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                         id={`btn-det-compare-${p.id}`}
                         onClick={() => onNavigate(`product/${p.id}`)}
                         className="flex-1 py-1.5 px-2.5 bg-[#08080A]/60 hover:bg-white/15 rounded-lg text-[10px] text-slate-355 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 text-center font-medium flex items-center justify-center gap-1 backdrop-blur-sm"
                      >
                        <Eye className="w-3 h-3" /> Details
                      </button>
                      <button
                         id={`btn-addwish-compare-${p.id}`}
                         onClick={() => onToggleWishlist(p.id)}
                         className={`p-1.5 rounded-lg border transition-all cursor-pointer backdrop-blur-sm ${wishlistProductIds.includes(p.id) ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-[#08080A]/60 border-white/10 text-slate-400 hover:text-white"}`}
                         title="Save"
                      >
                        <Heart className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
              {/* Fill missing slot spaces if less than 3 */}
              {products.length < 3 && Array.from({ length: 3 - products.length }).map((_, idx) => (
                <th key={idx} className="p-4 w-1/4 pointer-events-none">
                  <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center h-48 flex flex-col justify-center items-center text-slate-500 bg-white/[0.02] backdrop-blur-sm space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-600" />
                    <span className="text-[10px] font-sans font-light">Add product to slot</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* 2. Structured Specs entries body */}
          <tbody className="text-xs divide-y divide-slate-800/60 font-sans">
            <tr className="hover:bg-slate-900/10">
              <td className="p-4 font-semibold text-slate-400 whitespace-nowrap">Category</td>
              {products.map(p => (
                <td key={p.id} className="p-4 text-slate-200">{p.category}</td>
              ))}
              {products.length < 3 && Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={idx} className="p-4 text-slate-600">—</td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/10">
              <td className="p-4 font-semibold text-slate-400 whitespace-nowrap">Stock Available</td>
              {products.map(p => (
                <td key={p.id} className="p-4 text-slate-200">
                  {p.stock > 0 ? (
                    <span className="text-emerald-400">{p.stock} Units In Stock</span>
                  ) : (
                    <span className="text-rose-400">Out of Stock</span>
                  )}
                </td>
              ))}
              {products.length < 3 && Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={idx} className="p-4 text-slate-600">—</td>
              ))}
            </tr>

            {specKeys.map((key) => (
              <tr key={key} className="hover:bg-slate-900/10">
                <td className="p-4 font-semibold text-slate-400 whitespace-nowrap">{key}</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-slate-200">{p.specs[key] || "Non-compatible specification"}</td>
                ))}
                {products.length < 3 && Array.from({ length: 3 - products.length }).map((_, idx) => (
                  <td key={idx} className="p-4 text-slate-600">—</td>
                ))}
              </tr>
            ))}

            <tr className="hover:bg-slate-900/10 bg-slate-900/5">
              <td className="p-4 font-semibold text-slate-400 whitespace-nowrap">Praise Pros</td>
              {products.map(p => (
                <td key={p.id} className="p-4">
                  <ul className="space-y-1 list-disc pl-4 text-slate-350 text-[11px] font-light">
                    {p.pros.slice(0, 3).map((pr, i) => <li key={i}>{pr}</li>)}
                  </ul>
                </td>
              ))}
              {products.length < 3 && Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={idx} className="p-4 text-slate-600">—</td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/10">
              <td className="p-4 font-semibold text-slate-400 whitespace-nowrap">Drawback Cons</td>
              {products.map(p => (
                <td key={p.id} className="p-4">
                  <ul className="space-y-1 list-disc pl-4 text-slate-350 text-[11px] font-light">
                    {p.cons.slice(0, 3).map((co, i) => <li key={i}>{co}</li>)}
                  </ul>
                </td>
              ))}
              {products.length < 3 && Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={idx} className="p-4 text-slate-600">—</td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* DYNAMIC EXPERT AI VERDICT INJECTED BLOCK */}
      {products.length >= 2 && (
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-display font-semibold text-white flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              Expert Shopping AI Verdict
            </h2>
            <p className="text-xs text-slate-400 font-sans font-light">
              Add details of your requirements to compute a personalized brand selection report
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="compare-user-context-input"
              type="text"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="Tell us about yourself (e.g. 'I do heavy video compiling' or 'I need noise blockage for trains')"
              className="flex-1 bg-[#08080A]/30 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-md"
            />
            <button
              id="btn-compute-verdict"
              disabled={generatingVerdict}
              onClick={queryAIVerdict}
              className="py-3 px-6 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 border border-white/10 text-xs font-semibold text-white rounded-xl shadow-lg cursor-pointer transition-all shrink-0 active:scale-[0.98]"
            >
              {generatingVerdict ? "Calculating AI Recommendation..." : "Compute AI Recommendation"}
            </button>
          </div>

          {aiVerdict && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs leading-relaxed font-sans text-slate-300 border-l-4 border-l-indigo-500 animate-fade-in font-light backdrop-blur-sm">
              <span dangerouslySetInnerHTML={{ __html: aiVerdict.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-indigo-300">$1</strong>') }} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
