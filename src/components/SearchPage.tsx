/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal, Scale, Heart, Eye, ArrowUpDown, BadgePlus, Mic, AlertCircle } from "lucide-react";
import { API, getProductImage } from "../utils";
import { Product } from "../types";

interface SearchPageProps {
  onNavigate: (page: string) => void;
  onSetCompareList: (updater: (prev: string[]) => string[]) => void;
  compareList: string[];
  wishlistProductIds: string[];
  onToggleWishlist: (productId: string) => void;
  initialFilters?: { category?: string; search?: string };
}

export default function SearchPage({
  onNavigate,
  onSetCompareList,
  compareList,
  wishlistProductIds,
  onToggleWishlist,
  initialFilters = {}
}: SearchPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState<number>(150000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortOption, setSortOption] = useState("rating");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  
  // Voice capture simulation states
  const [isListening, setIsListening] = useState(false);

  // Retrieve distinct brands and categories from DB for dynamic sidebar listing
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, priceRange, minRating, sortOption]);

  const fetchProducts = async (overrideSearch?: string) => {
    try {
      setLoading(true);
      setErr("");
      const q = overrideSearch !== undefined ? overrideSearch : searchQuery;
      const data = await API.getProducts({
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        rating: minRating || undefined,
        maxPrice: priceRange || undefined,
        search: q || undefined,
        sort: sortOption
      });
      setProducts(data);

      // Extract unique categories & brands to build sidebar options
      const all = await API.getProducts({});
      const uniqueCats: string[] = Array.from(new Set(all.map((p: Product) => p.category)));
      const uniqueBrands: string[] = Array.from(new Set(all.map((p: Product) => p.brand)));
      setAvailableCategories(uniqueCats);
      setAvailableBrands(uniqueBrands);
    } catch (e: any) {
      setErr("Failed to query products from catalog database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange(150000);
    setMinRating(0);
    setSortOption("rating");
    setTimeout(() => {
      fetchProducts("");
    }, 50);
  };

  const handleToggleCompare = (id: string, name: string) => {
    onSetCompareList(prev => {
      if (prev.includes(id)) {
        alert("Removed from comparison list.");
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 products side-by-side.");
        return prev;
      }
      alert(`Added ${name} directly to comparison!`);
      return [...prev, id];
    });
  };

  // Simulated Speech-to-Text translation
  const triggerSpeechQuery = () => {
    if (isListening) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListening(true);
      setTimeout(() => {
        const triggers = ["AeroSound Pro X7", "SwiftBook Air", "wearables", "CafeGusto Brewer"];
        const phrase = triggers[Math.floor(Math.random() * triggers.length)];
        setSearchQuery(phrase);
        setIsListening(false);
        fetchProducts(phrase);
      }, 2500);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      
      rec.onstart = () => setIsListening(true);
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (text) {
          setSearchQuery(text);
          fetchProducts(text);
        }
      };
      
      rec.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-6 py-4 animate-fade-in font-sans">
      
      {/* HEADER SECTION WITH ADVANCED NATURAL SEARCH BAR */}
      <section className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-white">Smart Product Catalog</h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5 font-light">Natural search triggers or multi-faceted filters side column</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                id="catalog-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specs, brands, benefits (e.g. 'ANC memory foam', '45MP full frame', '16GB RAM Laptop')"
                className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-md"
              />
              <button
                id="btn-voice-search-loader"
                type="button"
                onClick={triggerSpeechQuery}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 ${isListening ? "text-indigo-400 animate-pulse bg-indigo-505/10" : ""}`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              id="search-btn-submit"
              type="submit"
              className="py-3 px-6 bg-indigo-500 hover:bg-indigo-600 border border-white/10 active:scale-[0.98] text-white font-medium text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg transition-all font-sans"
            >
              Search
            </button>
          </form>

          {isListening && (
            <div className="text-center text-[10px] text-indigo-300 font-mono animate-pulse">
              🎤 Listening to your voice query...
            </div>
          )}
        </div>
      </section>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDEBAR FILTERS COLUMN */}
        <aside className="lg:sticky lg:top-6 space-y-6 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
            <h3 className="font-display font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              Faceted Filters
            </h3>
            <button
               id="btn-clear-all"
               onClick={handleClearFilters}
               className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline tracking-wide font-sans cursor-pointer h-min"
            >
              Clear All
            </button>
          </div>

          {/* Categories select options list */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-sans font-semibold uppercase tracking-wider block">Category</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <button
                id="cat-select-all"
                onClick={() => setSelectedCategory("")}
                className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-sans transition-colors block ${!selectedCategory ? "bg-indigo-600/15 border border-indigo-500/20 text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
              >
                All Categories
              </button>
              {availableCategories.map((cat, idx) => (
                <button
                  id={`cat-select-${idx}`}
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-sans transition-colors block ${selectedCategory === cat ? "bg-indigo-600/15 border border-indigo-500/20 text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands selections list */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-sans font-semibold uppercase tracking-wider block">Brand</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <button
                id="brand-select-all"
                onClick={() => setSelectedBrand("")}
                className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-sans transition-colors block ${!selectedBrand ? "bg-indigo-600/15 border border-indigo-500/20 text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
              >
                All Brands
              </button>
              {availableBrands.map((b, idx) => (
                <button
                  id={`brand-select-${idx}`}
                  key={idx}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-sans transition-colors block ${selectedBrand === b ? "bg-indigo-600/15 border border-indigo-500/20 text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price ranges slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-400 font-sans font-semibold uppercase tracking-wider">Max Price</label>
              <span className="text-white font-medium font-sans font-bold">₹{priceRange.toLocaleString('en-IN')}</span>
            </div>
            <input
              id="slider-filter-price"
              type="range"
              min="2000"
              max="150000"
              step="2000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹2,000</span>
              <span>₹1,50,000</span>
            </div>
          </div>

          {/* Ratings filters */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-sans font-semibold uppercase tracking-wider block">Minimum Rating</label>
            <div className="grid grid-cols-5 gap-1">
              {[0, 4.0, 4.4, 4.6, 4.8].map((score, idx) => (
                <button
                  id={`rating-filter-b-${idx}`}
                  key={idx}
                  onClick={() => setMinRating(score)}
                  className={`py-1.5 rounded-lg border text-center text-[10px] font-sans transition-all cursor-pointer ${minRating === score ? "bg-indigo-600/15 border-indigo-500/30 text-white font-semibold" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"}`}
                >
                  {score === 0 ? "Any" : `${score}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting choices */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-sans font-semibold uppercase tracking-wider block">Sorting</label>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <select
                id="sort-selector-products"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 backdrop-blur-md appearance-none cursor-pointer font-sans"
              >
                <option value="rating">Sort by Best Ratings</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Dynamic counter totals */}
          <div className="text-[11px] text-slate-500 font-sans font-light border-t border-slate-800/60 pt-3 text-center">
            Found <span className="text-indigo-400 font-semibold">{products.length} matching items</span> in active index
          </div>
        </aside>

        {/* RESULTS CATALOG GRID COLUMN */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-80 bg-white/5 rounded-2xl border border-white/10 animate-pulse"></div>
              ))}
            </div>
          ) : err ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{err}</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/10 space-y-4">
              <p className="text-slate-400 text-sm font-sans font-light">No products match your custom filtrations list. Try clearing selectors!</p>
              <button
                 id="btn-notfound-clear"
                 onClick={handleClearFilters}
                 className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-150 text-xs font-semibold cursor-pointer border border-slate-700 transition"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item) => {
                const inCompare = compareList.includes(item.id);
                const isFavorite = wishlistProductIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col h-full bg-[#08080A]/40 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/25 hover:bg-white/5 backdrop-blur-sm transition-all group"
                  >
                    {/* Visual Card image body */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img
                        referrerPolicy="no-referrer"
                        src={getProductImage(item.image, item.name, item.category)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {item.stock < 20 && (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/15 border border-amber-500/30 font-semibold text-amber-300 uppercase tracking-wide">
                            Only {item.stock} left
                          </span>
                        )}
                        {item.originalPrice > item.price && (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/15 border border-emerald-500/30 font-semibold text-emerald-300 uppercase tracking-wide">
                            Sale
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#08080A]/85 backdrop-blur-md text-[10px] font-mono text-slate-200 border border-white/10">
                        ⭐ <span className="text-indigo-300 font-semibold">{item.rating}</span>
                      </div>
                    </div>

                    {/* Metadata summary info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold">{item.brand} · {item.category}</div>
                        <h3
                          onClick={() => onNavigate(`product/${item.id}`)}
                          className="font-display font-medium text-slate-200 hover:text-indigo-400 text-sm sm:text-base line-clamp-1 cursor-pointer transition-colors"
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans font-light">{item.description}</p>
                      </div>

                      {/* Dynamic price indices */}
                      <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between">
                        <div>
                          <span className="text-base font-display font-bold text-white">₹{item.price.toLocaleString('en-IN')}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-xs text-slate-500 line-through ml-2">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        
                        {/* Actions mapping tray */}
                        <div className="flex gap-1">
                          <button
                            id={`btn-search-wish-${item.id}`}
                            onClick={() => onToggleWishlist(item.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${isFavorite ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20" : "bg-[#08080A]/50 border-white/10 text-slate-400 hover:text-white backdrop-blur-sm"}`}
                            title="Save Favorite"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            id={`btn-search-comp-${item.id}`}
                            onClick={() => handleToggleCompare(item.id, item.name)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${inCompare ? "bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/15" : "bg-[#08080A]/50 border-white/10 text-slate-400 hover:text-indigo-300 backdrop-blur-sm"}`}
                            title="Compare Side-by-Side"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-search-view-${item.id}`}
                            onClick={() => onNavigate(`product/${item.id}`)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#08080A]/50 hover:bg-white/5 text-slate-300 text-xs border border-white/10 hover:text-indigo-300 transition-colors cursor-pointer backdrop-blur-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* FLOATING TOP-PANEL: COMPARE SELECTION STATUS LOG */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-lg shadow-2xl flex items-center gap-4 animate-bounce hover:bg-white/10 transition-all duration-300">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white font-sans flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-400" />
              Comparison Tray
            </div>
            <div className="text-[10px] text-slate-400 font-sans">{compareList.length} of 3 selected</div>
          </div>
          <div className="flex gap-2">
            <button
               id="btn-tray-clear"
               onClick={() => { onSetCompareList(() => []); alert("Cleared tray."); }}
               className="text-[10px] text-slate-400 hover:text-white hover:underline cursor-pointer"
            >
              Clear Tray
            </button>
            <button
               id="btn-compare-checkout"
               onClick={() => onNavigate("compare")}
               className="py-1.5 px-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg text-[11px] whitespace-nowrap cursor-pointer transition-colors shadow-lg border border-white/10"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
