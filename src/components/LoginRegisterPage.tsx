/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, MailQuestion, Eye, EyeOff } from "lucide-react";
import { API } from "../utils";

interface LoginRegisterPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigate: (page: string) => void;
}

export default function LoginRegisterPage({ onLoginSuccess, onNavigate }: LoginRegisterPageProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear states when shifting views
  const switchTab = (tab: "login" | "register" | "forgot") => {
    setActiveTab(tab);
    setErrorMsg("");
    setInfoMsg("");
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setInfoMsg("");
      const res = await API.login({ email, passwordStr: password });
      onLoginSuccess(res.user, res.token);
      onNavigate("chat"); // Navigate straight to the AI agent on login
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("All fields are required to register.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setInfoMsg("");
      const res = await API.register({ email, passwordStr: password, name });
      onLoginSuccess(res.user, res.token);
      onNavigate("chat");
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setInfoMsg("");
      const res = await API.forgotPassword(email);
      setInfoMsg(res.message || "Simulated password reset sent.");
    } catch (err: any) {
      setErrorMsg(err.message || "Specified email could not be located in database.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSocialSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      setInfoMsg("");
      // Google Auth Simulated callback
      const googleMockEmail = "rupanandpalakurthi@gmail.com";
      const res = await API.googleAuth({ email: googleMockEmail, name: "Rupanand Palakurthi" });
      onLoginSuccess(res.user, res.token);
      onNavigate("chat");
    } catch (err: any) {
      setErrorMsg("Simulated Google authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 md:py-20 animate-fade-in">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Branding */}
        <div className="p-6 text-center border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-500/10 border border-white/10 flex items-center justify-center text-indigo-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-medium text-white mb-1">ProductGPT Authentication</h2>
          <p className="text-slate-400 text-xs font-sans font-light">Secure full-stack database gateway</p>
        </div>

        {/* Auth Sub-nav tabs */}
        {activeTab !== "forgot" && (
          <div className="flex border-b border-white/10 bg-white/[0.01]">
            <button
               id="tab-auth-login"
               onClick={() => switchTab("login")}
               className={`flex-1 py-3 text-center text-xs font-sans font-medium transition-all ${activeTab === "login" ? "text-indigo-400 border-b border-indigo-500 bg-white/[0.03]" : "text-slate-400 hover:text-slate-200"}`}
            >
              Log In
            </button>
            <button
               id="tab-auth-register"
               onClick={() => switchTab("register")}
               className={`flex-1 py-3 text-center text-xs font-sans font-medium transition-all ${activeTab === "register" ? "text-indigo-400 border-b border-indigo-500 bg-white/[0.03]" : "text-slate-400 hover:text-slate-200"}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Forms Container */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Display Messages */}
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg font-sans">
              ❌ {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div className="p-4 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg leading-relaxed font-sans font-light">
              ✅ {infoMsg}
            </div>
          )}

          {/* 1. LOGIN */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-sans font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-100 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 font-sans font-medium">Password</label>
                  <button
                     id="btn-trigger-forgot"
                     type="button"
                     onClick={() => switchTab("forgot")}
                     className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-pass-input"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-slate-100 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm transition-all"
                  />
                  <button
                     id="btn-login-toggle-pass"
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 border border-white/10 active:scale-98 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer font-sans shadow-lg"
              >
                {loading ? "Authenticating..." : "Sign In to Account"}
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-400">Default Demo Credentials:</span>
                <div className="flex justify-center gap-4 mt-1">
                  <span onClick={() => { setEmail("rupanandpalakurthi@gmail.com"); setPassword("admin123"); }} className="text-[10px] text-indigo-300 hover:underline cursor-pointer">Admin (admin123)</span>
                  <span onClick={() => { setEmail("buyer@productgpt.ai"); setPassword("buyer123"); }} className="text-[10px] text-indigo-300 hover:underline cursor-pointer">Buyer (buyer123)</span>
                </div>
              </div>
            </form>
          )}

          {/* 2. REGISTER */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-sans font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="E.g., Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-100 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-sans font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-100 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-sans font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="register-pass-input"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-slate-100 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm transition-all"
                  />
                  <button
                     id="btn-register-toggle-pass"
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 border border-white/10 active:scale-98 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer font-sans shadow-lg"
              >
                {loading ? "Registering account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1 text-center pb-2">
                <div className="mx-auto w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-1.5">
                  <MailQuestion className="w-4 h-4" />
                </div>
                <h3 className="font-display font-medium text-slate-200 text-sm">Account Password Retrieval</h3>
                <p className="text-slate-400 text-xs font-sans font-light">Type your email address to reset</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-sans font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08080A]/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-100 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-forgot-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer font-sans shadow-lg"
              >
                {loading ? "Re-initiating..." : "Request Reset Instructions"}
              </button>

              <button
                id="btn-forgot-back"
                type="button"
                onClick={() => switchTab("login")}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-all font-sans"
              >
                Return to Login Page
              </button>
            </form>
          )}

          {/* Social Sign-in divider */}
          <div className="relative my-6 pb-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800/80"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-900/10 text-slate-400 font-sans text-[11px] font-medium uppercase tracking-wider backdrop-blur-3xl">Secure social gateway</span>
            </div>
          </div>

          {/* Google Sign in Trigger */}
          <button
            id="btn-google-social-oauth"
            type="button"
            disabled={loading}
            onClick={handleGoogleSocialSignIn}
            className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-sans font-semibold text-sm rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer border border-white/10 active:scale-[0.98]"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.67-5.17 3.67-8.45z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3a7.41 7.41 0 0 1-12 0L.19 12.18h-3.86v3a11.97 11.97 0 0 0 11.67 8.82z"
              />
              <path
                fill="#FBBC05"
                d="M4.07 14.12a7.18 7.18 0 0 1 0-4.24l-3.88-3a11.97 11.97 0 0 0 0 10.24l3.88-3z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.08 15.24 0 12 0a11.97 11.97 0 0 0-11.67 8.82-3.88-3l3.87 3a7.18 7.18 0 0 1 7.8-4.07z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
