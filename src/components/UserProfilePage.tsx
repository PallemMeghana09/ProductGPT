/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, Sliders, CheckSquare, Save, History, Sparkles, Activity } from "lucide-react";
import { API } from "../utils";

interface UserProfilePageProps {
  user: any;
  onUpdateUser: (user: any) => void;
}

export default function UserProfilePage({ user, onUpdateUser }: UserProfilePageProps) {
  const [budget, setBudget] = useState(user?.preferences?.budget || 1000);
  const [minRating, setMinRating] = useState(user?.preferences?.minRating || 4.0);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(user?.preferences?.favoriteCategories || []);
  const [favoriteBrands, setFavoriteBrands] = useState<string[]>(user?.preferences?.favoriteBrands || []);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const staticCategories = ["Audio", "Laptops", "Wearables", "Cameras", "Home Appliances", "Fitness", "Accessories"];
  const staticBrands = ["Aero", "SwiftCorp", "Google", "Lumix", "Gusto", "Apex", "TitanFit", "Omni"];

  useEffect(() => {
    loadUserLogs();
  }, []);

  const loadUserLogs = async () => {
    try {
      const logs = await API.getAdminActivities();
      // Filter for only user's logs if not administrator
      if (user?.role !== "admin") {
        setActivities(logs.filter((l: any) => l.userId === user?.id));
      } else {
        setActivities(logs);
      }
    } catch {
      // ignore
    }
  };

  const toggleCategory = (cat: string) => {
    setFavoriteCategories(prev => 
      prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (b: string) => {
    setFavoriteBrands(prev => 
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSuccessMsg("");
      const res = await API.updatePreferences({
        budget,
        minRating,
        favoriteCategories,
        favoriteBrands
      });
      onUpdateUser(res.user);
      setSuccessMsg("Shopping Preferences successfully updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Preferences error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 animate-fade-in font-sans text-xs sm:text-sm">
      
      {/* 1. LEFT COLUMN: PROFILE CARD AND PREFERENCES SUBMISSION FORM */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Core Profile specs */}
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 shadow-xl animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-indigo-400/10 border border-white/10 flex items-center justify-center text-indigo-400 font-bold text-xl shrink-0">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base font-display font-semibold text-white capitalize leading-tight flex items-center gap-1.5">
              {user?.name || "Shopper Name"}
              {user?.role === "admin" && (
                <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-600 border border-indigo-400/30 text-white font-mono uppercase tracking-wider font-bold">Admin Portal</span>
              )}
            </h2>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-light font-sans">
              <Mail className="w-3.5 h-3.5" /> {user?.email || "email@productgpt.ai"}
            </div>
          </div>
        </section>

        {/* Preferences modifier layout */}
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
          <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
            <Sliders className="w-4.5 h-4.5 text-indigo-400" />
            Interactive Preferences
          </h3>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handlePreferencesSubmit} className="space-y-6 text-xs text-slate-300">
            {/* Target budget adjustment */}
            <div className="space-y-2">
              <div className="flex justify-between font-sans text-xs">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Your Shopping Budget</label>
                <span className="text-white font-bold text-xs">₹{budget.toLocaleString('en-IN')} INR limit</span>
              </div>
              <input
                id="pref-budget-input"
                type="range"
                min="10000"
                max="150000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-black/40 border border-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Min ratings thresholds */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase tracking-wider block">Minimum Evaluation rating</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 3.5, 4.0, 4.5, 4.8].map((score, idx) => (
                  <button
                    id={`pref-rating-b-${idx}`}
                    key={idx}
                    type="button"
                    onClick={() => setMinRating(score)}
                    className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${minRating === score ? "bg-indigo-500 border-white/15 text-white font-semibold shadow-md shadow-indigo-500/10" : "bg-[#08080A]/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
                  >
                    {score === 0 ? "Any score" : `${score}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite categories select box lists */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase tracking-wider block">Target Specific Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {staticCategories.map((cat, idx) => {
                  const active = favoriteCategories.includes(cat);
                  return (
                    <button
                      id={`pref-cat-${idx}`}
                      key={idx}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg border text-left transition-all cursor-pointer backdrop-blur-sm hover:scale-[1.01] ${active ? "bg-indigo-500/10 border-indigo-500/25 text-white font-semibold" : "bg-[#08080A]/40 border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                    >
                      <CheckSquare className={`w-3.5 h-3.5 ${active ? "text-indigo-400" : "text-slate-600"}`} />
                      <span className="truncate">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite Brand list preferences */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase tracking-wider block">Preferred Technology Brands</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {staticBrands.map((b, idx) => {
                  const active = favoriteBrands.includes(b);
                  return (
                    <button
                      id={`pref-brand-${idx}`}
                      key={idx}
                      type="button"
                      onClick={() => toggleBrand(b)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg border text-left transition-all cursor-pointer backdrop-blur-sm hover:scale-[1.01] ${active ? "bg-indigo-500/10 border-indigo-500/25 text-white font-semibold" : "bg-[#08080A]/40 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"}`}
                    >
                      <CheckSquare className={`w-3.5 h-3.5 ${active ? "text-indigo-400" : "text-slate-600"}`} />
                      <span className="truncate">{b}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="pref-save-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 border border-white/10 active:scale-95 disabled:scale-100 disabled:opacity-45 text-white rounded-lg flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all shadow-lg"
            >
              <Save className="w-4 h-4" /> Save Shopping Profiles
            </button>
          </form>
        </section>
      </div>

      {/* 2. RIGHT COLUMN: GENERAL LOG LISTS AUDIT TRACE */}
      <div className="space-y-6">
        <section className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 shadow-2xl h-full max-h-[550px] flex flex-col overflow-hidden">
          <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
            <History className="w-4.5 h-4.5 text-indigo-400" />
            Audit History Traces
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activities.length === 0 ? (
              <div className="text-center font-sans font-light py-8 text-slate-500 text-xs">
                No recent activity records found.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-3.5 bg-[#08080A]/40 border border-white/5 rounded-xl space-y-1.5 text-[11px] font-sans backdrop-blur-sm shadow-sm">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-semibold text-indigo-400">{act.action}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 font-light leading-normal">{act.details}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
