/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Scale, Heart, Search, Bot, User, Database, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { API } from "./utils";
import LandingPage from "./components/LandingPage";
import LoginRegisterPage from "./components/LoginRegisterPage";
import AIChatPage from "./components/AIChatPage";
import SearchPage from "./components/SearchPage";
import ProductDetailsPage from "./components/ProductDetailsPage";
import ComparisonPage from "./components/ComparisonPage";
import WishlistPage from "./components/WishlistPage";
import UserProfilePage from "./components/UserProfilePage";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    // Initial user authentication and preferences parsing
    bootstrapSession();
    checkHealth();
  }, []);

  const bootstrapSession = async () => {
    const storedToken = localStorage.getItem("productgpt_token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const currentUser = await API.getMe();
        setUser(currentUser);
        
        // Sync active wishlist items
        const wishData = await API.getWishlist();
        setWishlistIds(wishData.map((it: any) => it.productId));
      } catch (err) {
        console.error("Session bootstrap failed:", err);
        // Fallback or clear
        localStorage.removeItem("productgpt_token");
        setToken(null);
        setUser(null);
      }
    }
  };

  const checkHealth = async () => {
    const status = await API.checkHealth();
    setHealthStatus(status);
  };

  const handleLoginSuccess = async (loggedInUser: any, userToken: string) => {
    localStorage.setItem("productgpt_token", userToken);
    setToken(userToken);
    setUser(loggedInUser);
    
    // Sync wishlist
    try {
      const wishData = await API.getWishlist();
      setWishlistIds(wishData.map((it: any) => it.productId));
    } catch (e) {
      console.error("Wishlist sync fail:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("productgpt_token");
    setToken(null);
    setUser(null);
    setWishlistIds([]);
    setCompareIds([]);
    setCurrentPage("landing");
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!token) {
      alert("Please log in to save products to your personal notebook.");
      setCurrentPage("auth");
      return;
    }
    try {
      if (wishlistIds.includes(productId)) {
        await API.removeFromWishlist(productId);
        setWishlistIds(prev => prev.filter(id => id !== productId));
      } else {
        await API.addToWishlist(productId);
        setWishlistIds(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error("Failed toggle wishlist:", err);
    }
  };

  // Nav routing router
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Custom regex parsing for sub-pages like product details
  const renderPage = () => {
    if (currentPage === "landing") {
      return (
        <LandingPage
          onNavigate={(page) => {
            if (page === "chat" && !token) {
              setCurrentPage("auth");
            } else {
              setCurrentPage(page);
            }
          }}
        />
      );
    }
    if (currentPage === "auth") {
      return <LoginRegisterPage onLoginSuccess={handleLoginSuccess} onNavigate={navigateTo} />;
    }
    if (currentPage === "chat") {
      return (
        <AIChatPage
          onNavigate={navigateTo}
          onSetCompareList={setCompareIds}
          wishlistProductIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
        />
      );
    }
    if (currentPage === "search") {
      return (
        <SearchPage
          onNavigate={navigateTo}
          onSetCompareList={setCompareIds}
          compareList={compareIds}
          wishlistProductIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
        />
      );
    }
    if (currentPage === "compare") {
      return (
        <ComparisonPage
          compareProductIds={compareIds}
          onNavigate={navigateTo}
          onSetCompareList={setCompareIds}
          wishlistProductIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
        />
      );
    }
    if (currentPage === "wishlist") {
      return (
        <WishlistPage
          onNavigate={navigateTo}
          wishlistProductIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
        />
      );
    }
    if (currentPage === "profile") {
      return <UserProfilePage user={user} onUpdateUser={setUser} />;
    }
    if (currentPage === "admin") {
      return <AdminDashboard />;
    }

    // Product Details dynamically dissected
    if (currentPage.startsWith("product/")) {
      const pId = currentPage.split("/")[1];
      return (
        <ProductDetailsPage
          productId={pId}
          onNavigate={navigateTo}
          onSetCompareList={setCompareIds}
          compareList={compareIds}
          wishlistProductIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
        />
      );
    }

    // default fallback
    return <LandingPage onNavigate={setCurrentPage} />;
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-slate-200 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient gradient glows */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div
              onClick={() => navigateTo("landing")}
              className="flex items-center gap-2 cursor-pointer group shrink-0 select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display font-semibold text-white text-base sm:text-lg tracking-tight">ProductGPT</span>
            </div>

            {/* Desktop Navigation Linkages */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                id="nav-catalog"
                onClick={() => navigateTo("search")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition cursor-pointer select-none border ${currentPage === "search" ? "bg-white/10 border-white/15 text-white font-semibold shadow-inner" : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-white/5"}`}
              >
                <div id="nav-indicator-search" className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5" /> Catalog</div>
              </button>

              <button
                id="nav-chat-agent"
                onClick={() => {
                  if (!token) navigateTo("auth");
                  else navigateTo("chat");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition cursor-pointer select-none border ${currentPage === "chat" ? "bg-white/10 border-white/15 text-white font-semibold shadow-inner" : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> AI Assistant
                </div>
              </button>

              <button
                id="nav-comparison"
                onClick={() => navigateTo("compare")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition cursor-pointer select-none border ${currentPage === "compare" ? "bg-white/10 border-white/15 text-white font-semibold shadow-inner" : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Compare ({compareIds.length})
                </div>
              </button>

              <button
                id="nav-favorites"
                onClick={() => {
                  if (!token) navigateTo("auth");
                  else navigateTo("wishlist");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition cursor-pointer select-none border ${currentPage === "wishlist" ? "bg-white/10 border-white/15 text-white font-semibold shadow-inner" : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Saved ({wishlistIds.length})
                </div>
              </button>

              {user?.role === "admin" && (
                <button
                  id="nav-admin"
                  onClick={() => navigateTo("admin")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition cursor-pointer select-none border ${currentPage === "admin" ? "bg-indigo-500/10 border-indigo-500/35 text-indigo-300 font-semibold shadow-inner" : "border-transparent text-slate-400 hover:text-indigo-400 hover:bg-white/5"}`}
                >
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Admin Panel
                  </div>
                </button>
              )}
            </nav>

            {/* Right-most Session triggers */}
            <div className="hidden md:flex items-center gap-3">
              {token ? (
                <div className="flex items-center gap-3">
                  <button
                    id="nav-profile"
                    onClick={() => navigateTo("profile")}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-slate-300 hover:text-white transition"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium capitalize max-w-[100px] truncate">{user?.name || "Profile"}</span>
                  </button>

                  <button
                    id="nav-logout"
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-450 hover:bg-white/5 transition cursor-pointer"
                    title="Log Out Account"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="nav-login-trigger"
                  onClick={() => navigateTo("auth")}
                  className="py-2 px-4.5 bg-indigo-500 hover:bg-indigo-600 border border-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-500/20 transition-all duration-200 select-none hover:scale-[1.02]"
                >
                  Sign In Gateway
                </button>
              )}
            </div>

            {/* Mobile trigger hamburger button */}
            <button
              id="mobile-hamburger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white md:hidden hover:bg-white/5 transition cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* 2. MOBILE DROPDOWN LINKS */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#08080A]/95 p-4 space-y-2 animate-fade-in font-sans backdrop-blur-xl relative z-20">
            <button
              id="mob-nav-catalog"
              onClick={() => navigateTo("search")}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-xs text-slate-300 transition"
            >
              🔍 Explore Catalog Index
            </button>
            <button
              id="mob-nav-assistant"
              onClick={() => {
                if (!token) navigateTo("auth");
                else navigateTo("chat");
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-xs text-slate-300 transition"
            >
              🤖 Conversational AI Assistant
            </button>
            <button
              id="mob-nav-compare"
              onClick={() => navigateTo("compare")}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-xs text-slate-300 transition"
            >
              ⚖️ Side-by-Side Comparison ({compareIds.length})
            </button>
            <button
              id="mob-nav-wishlist"
              onClick={() => {
                if (!token) navigateTo("auth");
                else navigateTo("wishlist");
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-xs text-slate-300 transition"
            >
              ❤️ Saved & Favorites ({wishlistIds.length})
            </button>
            {user?.role === "admin" && (
              <button
                id="mob-nav-admin"
                onClick={() => navigateTo("admin")}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-white/5 text-xs text-indigo-400 transition"
              >
                ⚙️ Admin Operations Console
              </button>
            )}

            <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
              {token ? (
                <>
                  <button
                    id="mob-nav-profile"
                    onClick={() => navigateTo("profile")}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-xs text-slate-300 capitalize transition"
                  >
                    👤 Profile Details: {user?.name}
                  </button>
                  <button
                    id="mob-nav-logout"
                    onClick={handleLogout}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-rose-500/10 text-xs text-rose-400 transition"
                  >
                    🚪 Log Out Account
                  </button>
                </>
              ) : (
                <button
                  id="mob-nav-login"
                  onClick={() => navigateTo("auth")}
                  className="w-full py-2.5 bg-indigo-500 text-center rounded-xl text-xs font-semibold text-white transition hover:bg-indigo-600"
                >
                  Sign In Gateway
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. CORE WORKSPACE ROUTER VIEWPORT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {renderPage()}
      </main>

      {/* 3. HUMBLE, CRADLED FOOTER RAIL */}
      <footer className="border-t border-white/10 py-6 text-center text-[10px] text-slate-500 tracking-wider uppercase font-mono bg-[#08080A]/80 backdrop-blur-md relative z-10">
        <div>
          ProductGPT Shopping Advisor Portal · All metrics logged and protected
        </div>
        {healthStatus && (
          <div className="text-[9px] text-slate-400 mt-1.5 font-light flex items-center justify-center gap-1 bg-white/5 max-w-xs mx-auto py-1 px-2.5 rounded border border-white/10 backdrop-blur-sm">
            <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.geminiConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`}></span>
            Server: {healthStatus.status} · Gemini Client Connected
          </div>
        )}
      </footer>
    </div>
  );
}
