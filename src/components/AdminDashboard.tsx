/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Trash2, Edit2, BadgePlus, BarChart3, Database, History, RefreshCw, AlertTriangle, CheckCircle, Save, XCircle } from "lucide-react";
import { API, getProductImage } from "../utils";
import { Product } from "../types";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // CRUD States
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Custom Create form parameters
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Audio");
  const [newBrand, setNewBrand] = useState("");
  const [newPrice, setNewPrice] = useState<number>(199);
  const [newStock, setNewStock] = useState<number>(50);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErr("");
      const anal = await API.getAdminAnalytics();
      setAnalytics(anal);
      const pr = await API.getProducts({});
      setProducts(pr);
      const logs = await API.getAdminActivities();
      setActivities(logs);
    } catch {
      setErr("Failed to connect admin analytics systems.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBrand || !newPrice) {
      alert("Please fill in Name, Brand, and Price.");
      return;
    }

    try {
      setLoading(true);
      const createdProd = await API.adminCreateProduct({
        name: newName,
        category: newCategory,
        brand: newBrand,
        price: Number(newPrice),
        originalPrice: Number(newPrice),
        description: newDescription || "No detailed summary available yet.",
        stock: Number(newStock),
        trending: false
      });
      
      if (createdProd) {
        alert("New product successfully registered!");
        setShowAddForm(false);
        setNewName("");
        setNewBrand("");
        setNewDescription("");
        loadDashboard();
      }
    } catch (e) {
      alert("Product registration failed, verify logs.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProductItem = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${name} from our inventory? This will wipe associated client wishlists!`)) return;
    try {
      setLoading(true);
      const ok = await API.adminDeleteProduct(id);
      if (ok) {
        alert("Product record wiped successfully.");
        loadDashboard();
      }
    } catch {
      alert("Delete transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const triggerUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      setLoading(true);
      const updated = await API.adminUpdateProduct(editProduct.id, {
        name: editProduct.name,
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        description: editProduct.description
      });
      if (updated) {
        alert("Product updated!");
        setEditProduct(null);
        loadDashboard();
      }
    } catch {
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return <div className="py-20 text-center animate-pulse text-indigo-400 font-sans text-sm">Synchronizing Admin systems...</div>;
  }

  return (
    <div className="space-y-8 py-4 animate-fade-in font-sans text-xs">
      
      {/* HEADER FEED */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md shrink-0 shadow-xl">
        <div className="space-y-0.5">
          <h1 className="text-base sm:text-lg font-display font-semibold text-white tracking-wide uppercase flex items-center gap-1.5">
            <Database className="w-5 h-5 text-indigo-400" />
            Operations Console Portal
          </h1>
          <p className="text-[10px] text-slate-500 font-light">Inventory statistics audit logs</p>
        </div>
        <button
           onClick={loadDashboard}
           className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:text-white transition cursor-pointer"
           title="Sync logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* METRIC INDEX CARDS RATIOS */}
      {analytics && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-sm shadow-md transition-all hover:scale-[1.01] hover:border-white/15">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold uppercase">Total Estimated Revenue</span>
              <div className="text-xl font-display font-bold text-white">₹{(analytics.revenue?.estimatedRevenue || 0).toLocaleString('en-IN')}</div>
            </div>
            <span className="bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 font-mono text-sm font-semibold rounded p-1.5">+₹</span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-sm shadow-md transition-all hover:scale-[1.01] hover:border-white/15">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold uppercase">Average Ticket size</span>
              <div className="text-xl font-display font-bold text-white">₹{Math.round(analytics.revenue?.averageTicketSize || 0).toLocaleString('en-IN')}</div>
            </div>
            <span className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 font-mono text-sm font-semibold rounded p-1.5">Avg</span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-sm shadow-md transition-all hover:scale-[1.01] hover:border-white/15">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold uppercase">Critical Inventory Alerts</span>
              <div className="text-xl font-display font-bold text-white">{analytics.inventory?.criticalStockCount || 0} Items</div>
            </div>
            {analytics.inventory?.criticalStockCount > 0 ? (
              <span className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 font-mono text-xs font-semibold rounded p-1.5 animate-pulse">Low</span>
            ) : (
              <span className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 font-mono text-xs font-semibold rounded p-1.5">Fine</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-sm shadow-md transition-all hover:scale-[1.01] hover:border-white/15">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold uppercase">Total conversion sales</span>
              <div className="text-xl font-display font-bold text-white">{analytics.revenue?.totalSales || 0} Convert</div>
            </div>
            <span className="bg-blue-500/10 border border-blue-400/20 text-blue-400 font-mono text-sm font-semibold rounded p-1.5">Ok</span>
          </div>
        </section>
      )}

      {/* METRIC CHARTS AND AUDIT LOGGER SEGMENT */}
      {analytics && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Chart bar view */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
            <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider font-mono flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Category Inventory Shares
            </h3>
            
            <div className="space-y-3 pt-2">
              {analytics.categoryCounts?.map((cat: any, idx: number) => {
                const percentage = Math.min(100, Math.round((cat.value / products.length) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-sans">
                      <span className="text-slate-300">{cat.name}</span>
                      <span className="text-indigo-400 font-semibold">{cat.value} items ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Logs scroll panel */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col h-full max-h-[300px] overflow-hidden shadow-2xl">
            <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider font-mono flex items-center gap-1.5 shrink-0 pb-3">
              <History className="w-4 h-4 text-indigo-400" />
              Administrative Audit trails ({activities.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activities.map((act) => (
                <div key={act.id} className="p-2.5 bg-[#08080A]/40 border border-white/5 rounded-lg space-y-1 backdrop-blur-sm shadow-sm">
                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <span className="font-semibold text-emerald-450 text-indigo-400">{act.action} · {act.userEmail}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-light">{act.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CRUD MANAGEMENT FORM SHELL */}
      <section className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-3 shrink-0">
          <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
            <Database className="w-4.5 h-4.5 text-indigo-400" />
            Product Catalog Index Manager
          </h3>
          <button
             id="btn-toggle-add-product"
             onClick={() => { setShowAddForm(!showAddForm); setEditProduct(null); }}
             className="py-2 px-3.5 bg-indigo-500 hover:bg-indigo-600 border border-white/10 text-xs font-bold text-white rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0 active:scale-[0.98]"
          >
            <BadgePlus className="w-4 h-4" /> Add New Item to DB
          </button>
        </div>

        {/* 1. ADD NEW ITEM COMPILATION FORM CODE */}
        {showAddForm && (
          <form onSubmit={handleCreateProductSubmit} className="p-5 rounded-xl border border-white/10 bg-white/[0.02] grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-slate-300">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Product Name</label>
              <input
                id="addprod-name"
                type="text"
                required
                placeholder="E.g., SwiftBook Air"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.0 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Core Category</label>
              <select
                id="addprod-cat"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#08080A]/40 border border-white/10 rounded-lg p-2.0 text-white text-xs focus:outline-none appearance-none cursor-pointer backdrop-blur-sm"
              >
                <option value="Audio">Audio</option>
                <option value="Laptops">Laptops</option>
                <option value="Wearables">Wearables</option>
                <option value="Cameras">Cameras</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Fitness">Fitness</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Brand / Manufacturer</label>
              <input
                id="addprod-brand"
                type="text"
                required
                placeholder="E.g., Gusto"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.0 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Retail Price (₹ INR)</label>
              <input
                id="addprod-price"
                type="number"
                required
                min="5"
                placeholder="249"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.0 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Initial stock volume</label>
              <input
                id="addprod-stock"
                type="number"
                required
                min="0"
                placeholder="50"
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.0 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold">Description summary</label>
              <textarea
                id="addprod-desc"
                rows={3}
                placeholder="Enter detailed description, usage specifications etc..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.5 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2 md:col-span-2">
              <button id="addprod-cancel" type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
              <button id="addprod-submit" type="submit" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 border border-white/10 rounded-lg text-white font-semibold cursor-pointer active:scale-95 transition-all shadow-lg">Register Product Record</button>
            </div>
          </form>
        )}

        {/* 2. UPDATE ITEM PANEL SHEET */}
        {editProduct && (
          <form onSubmit={triggerUpdateSubmit} className="p-5 rounded-xl border border-white/10 bg-white/[0.02] grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-slate-300">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Edit Product Name</label>
              <input
                id="editprod-name"
                type="text"
                required
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.0 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Edit Retail Price (₹ INR)</label>
              <input
                id="editprod-price"
                type="number"
                required
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.0 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Edit Stock Level</label>
              <input
                id="editprod-stock"
                type="number"
                required
                value={editProduct.stock}
                onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.0 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold">Description summary</label>
              <textarea
                id="editprod-desc"
                rows={3}
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                className="w-full bg-[#08080A]/40 border border-white/10 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-sm rounded-lg p-2.5 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2 md:col-span-2">
              <button id="editprod-cancel" type="button" onClick={() => setEditProduct(null)} className="px-4 py-2 bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
              <button id="editprod-submit" type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-500 border border-white/10 rounded-lg text-white font-semibold cursor-pointer active:scale-95 transition-all shadow-lg">Save Changes</button>
            </div>
          </form>
        )}

        {/* 3. TABLE OF DB PRODUCTS */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.01] backdrop-blur-sm shadow-md">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-black/20 border-b border-white/10">
                <th className="p-3 text-slate-400 font-mono tracking-wider font-semibold uppercase text-[10px]">Product Info</th>
                <th className="p-3 text-slate-400 font-mono tracking-wider font-semibold uppercase text-[10px]">Category</th>
                <th className="p-3 text-slate-400 font-mono tracking-wider font-semibold uppercase text-[10px]">Brand</th>
                <th className="p-3 text-slate-400 font-mono tracking-wider font-semibold uppercase text-[10px]">Price</th>
                <th className="p-3 text-slate-400 font-mono tracking-wider font-semibold uppercase text-[10px]">Stock</th>
                <th className="p-3 text-slate-400 font-mono tracking-wider font-semibold uppercase text-[10px]">Rating</th>
                <th className="p-3 text-slate-400 font-mono tracking-wider font-semibold uppercase text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-[11px] font-sans">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.04] transition-all">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        referrerPolicy="no-referrer"
                        src={getProductImage(item.image, item.name, item.category)}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                      />
                      <span className="font-semibold text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-300">{item.category}</td>
                  <td className="p-3 text-slate-300">{item.brand}</td>
                  <td className="p-3 text-white font-semibold">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    {item.stock < 20 ? (
                      <span className="text-yellow-400 font-bold">{item.stock} left (Critical Alert)</span>
                    ) : (
                      <span className="text-slate-300 font-mono">{item.stock} units</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-300">⭐ {item.rating}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        id={`btn-edit-p-${item.id}`}
                        onClick={() => { setEditProduct(item); setShowAddForm(false); }}
                        className="p-1.5 hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 rounded transition cursor-pointer"
                        title="Edit entry fields"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-del-p-${item.id}`}
                        onClick={() => deleteProductItem(item.id, item.name)}
                        className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                        title="Delete product catalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
