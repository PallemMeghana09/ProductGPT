/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { DB } from "./server/db";
import { Product, Message, ChatSession } from "./src/types";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize server-side Gemini client
const isGeminiAvailable = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
let ai: GoogleGenAI | null = null;

if (isGeminiAvailable) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized on port 3000.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No custom GEMINI_API_KEY specified. Using high-fidelity local rules fallback for AI features.");
}

// Helper middleware to log user interactions cleanly
function trackUserActivity(action: string, handler: (req: express.Request, res: express.Response) => Promise<any> | any) {
  return async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req.headers["x-user-id"] as string) || "u-1"; // Default to admin for robust fallback
      const user = DB.getUserById(userId) || DB.getUsers()[0];
      await handler(req, res);
      if (user) {
        let details = `Executed action: ${action}`;
        if (req.method === "POST" || req.method === "PUT") {
          details += ` on payload: ${JSON.stringify(req.body).substring(0, 100)}`;
        }
        DB.logActivity(user.id, user.email, action, details);
      }
    } catch (error: any) {
      console.error(`Error handling ${action}:`, error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  };
}

// API ENDPOINTS

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConnected: isGeminiAvailable });
});

// 2. Authentication Routing
app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Please enter your name, email and password." });
  }

  const existing = DB.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "A user with this email address already exists." });
  }

  const newUser = {
    id: "u-" + Date.now(),
    email,
    name,
    role: "user" as const,
    preferences: {
      budget: 1000,
      favoriteCategories: [],
      favoriteBrands: [],
      minRating: 4.0
    }
  };

  DB.createUser(newUser, password);
  DB.logActivity(newUser.id, newUser.email, "Registration", `Registered as dynamic user: ${name}`);
  res.status(201).json({ user: newUser, token: newUser.id });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = DB.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "No user found with this email." });
  }

  const valid = DB.verifyPassword(user.id, password);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect password. Please try again." });
  }

  DB.logActivity(user.id, user.email, "Login", "Authenticated via credentials successfully");
  res.json({ user, token: user.id });
});

app.post("/api/auth/google", (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google OAuth credential email is required." });
  }

  let user = DB.getUserByEmail(email);
  if (!user) {
    // Generate automated OAuth user account
    user = {
      id: "u-" + Date.now(),
      email,
      name: name || email.split("@")[0],
      role: email === "rupanandpalakurthi@gmail.com" ? "admin" : "user",
      preferences: {
        budget: 1200,
        favoriteCategories: [],
        favoriteBrands: [],
        minRating: 4.0
      }
    };
    DB.createUser(user, "social-google-auth-pass-" + Math.random());
    DB.logActivity(user.id, user.email, "Google Registration", `Signed up with Google Social Auth`);
  } else {
    DB.logActivity(user.id, user.email, "Google Login", `Logged in with Google Social Auth`);
  }

  res.json({ user, token: user.id });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const user = DB.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "Email address not found." });
  }

  // Set password to default reset string for demo
  DB.updatePassword(user.id, "welcome123");
  DB.logActivity(user.id, user.email, "Password Reset Requested", "Password reset requested. Temp greeting: welcome123");
  res.json({ message: "Check your email (simulated). Password has been temporarily set to 'welcome123'. Please type it in or log in with Google." });
});

// 3. User Preferences Modification
app.put("/api/user/preferences", (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "u-1";
  const { budget, favoriteCategories, favoriteBrands, minRating } = req.body;
  
  const updated = DB.updateUserPreferences(userId, {
    budget: Number(budget) || 1000,
    favoriteCategories: favoriteCategories || [],
    favoriteBrands: favoriteBrands || [],
    minRating: Number(minRating) || 4.0
  });

  if (!updated) {
    return res.status(404).json({ error: "User preferences not found" });
  }
  res.json({ user: updated });
});

app.get("/api/user/me", (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "u-1";
  const user = DB.getUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// 4. Products Listing
app.get("/api/products", (req, res) => {
  let list = DB.getProducts();
  const { category, brand, rating, maxPrice, search, sort } = req.query;

  // Apply filters
  if (category) {
    list = list.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (brand) {
    list = list.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
  }
  if (rating) {
    list = list.filter(p => p.rating >= Number(rating));
  }
  if (maxPrice) {
    list = list.filter(p => p.price <= Number(maxPrice));
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.features.some(f => f.toLowerCase().includes(q))
    );
  }

  // Dynamic sorting
  if (sort === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }

  res.json(list);
});

app.get("/api/products/:id", (req, res) => {
  const prod = DB.getProductById(req.params.id);
  if (!prod) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json(prod);
});

// 5. Wishlists Routing
app.get("/api/wishlist", (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "u-1";
  const items = DB.getWishlistByUserId(userId);
  const products = items.map(it => {
    const p = DB.getProductById(it.productId);
    return p ? { ...it, product: p } : null;
  }).filter(Boolean);
  res.json(products);
});

app.post("/api/wishlist", (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "u-1";
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }

  const product = DB.getProductById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const item = {
    id: "w-" + Date.now(),
    productId,
    userId,
    addedAt: new Date().toISOString(),
    originalPrice: product.originalPrice,
    currentPrice: product.price
  };

  DB.addToWishlist(item);
  res.status(201).json(item);
});

app.delete("/api/wishlist/:productId", (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "u-1";
  const removed = DB.removeFromWishlistByProduct(userId, req.params.productId);
  res.json({ success: removed });
});

// 6. Conversational AI Assistant & Recommendation Engine
app.post("/api/chat/message", trackUserActivity("AIChatMessage", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "u-1";
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message text is required" });
  }

  // Get active session
  let activeSessionId = sessionId || "session-default-" + userId;
  let session = DB.getChatSessionById(activeSessionId);
  if (!session) {
    session = {
      id: activeSessionId,
      userId,
      messages: [],
      title: "New Shopping Search"
    };
  }

  // Add User Message
  const userMsg: Message = {
    id: "msg-" + Date.now(),
    sender: "user",
    text: message,
    timestamp: new Date().toISOString()
  };
  session.messages.push(userMsg);

  // Retrieve user specifications & requirements
  const userObj = DB.getUserById(userId);
  const availableProducts = DB.getProducts();

  let assistantText = "";
  let recommendedProductIds: string[] = [];
  let suggestions: string[] = [
    "Compare headphones specs side-by-side?",
    "Show details of AeroSound Pro X7?",
    "Find more budget options in Audio?"
  ];

  if (ai) {
    try {
      // Setup detailed context in prompt
      const systemContext = `You are ProductGPT, an advanced AI shopping assistant.
Your main task is to help users find the perfect product from our active catalog.

ACTIVE PRODUCTS CATALOG IN DATABASE:
${JSON.stringify(availableProducts.map(p => ({ id: p.id, name: p.name, category: p.category, brand: p.brand, price: p.price, rating: p.rating, stock: p.stock })), null, 2)}

User Profile Specifications:
- Name: ${userObj?.name || "Shopper"}
- Target Budget: ₹${userObj?.preferences.budget || 80000}
- Preferred Categories: ${userObj?.preferences.favoriteCategories.join(", ") || "General"}
- Preferred Brands: ${userObj?.preferences.favoriteBrands.join(", ") || "Any"}

Conversation History:
${session.messages.slice(-6).map(m => `${m.sender}: ${m.text}`).join("\n")}

Respond elegantly using Markdown and highlight specific specs, pros/cons or deals. Provide recommendations of ACTUAL products in the active catalog if they fit the user's intent. Don't invent items not present in the list, unless you specifically preface it as an external suggestion.

You MUST write structured output following the JSON schema rules.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Process the latest user query: '" + message + "' and yield a response.",
        config: {
          systemInstruction: systemContext,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING, description: "Your conversational helpful response in Markdown format." },
              recommendedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of matching product IDs ONLY from the active catalog (e.g., ['prod-1', 'prod-2']) that you directly highlighted or recommend. Leave empty if none match perfectly."
              },
              suggestedFollowUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2 or 3 follow-up short question suggestions appropriate for the user."
              }
            },
            required: ["message", "recommendedProductIds"]
          }
        }
      });

      const rootText = response.text || "";
      const parsed = JSON.parse(rootText);
      assistantText = parsed.message;
      recommendedProductIds = parsed.recommendedProductIds || [];
      if (parsed.suggestedFollowUps && parsed.suggestedFollowUps.length > 0) {
        suggestions = parsed.suggestedFollowUps;
      }
    } catch (err: any) {
      const errStr = String(err).toLowerCase() + " " + JSON.stringify(err).toLowerCase();
      const isQuotaExceeded = errStr.includes("429") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("resource_exhausted") || errStr.includes("billing");
      
      if (isQuotaExceeded) {
        console.warn("Gemini chatbot query hit API limit or exceeded quota (429). Falling back gracefully.");
      } else {
        console.error("Gemini Assistant query error, falling back:", err);
      }
      
      const result = runLocalRuleAssistant(message, availableProducts);
      if (isQuotaExceeded) {
        assistantText = `> ⚠️ **Gemini API Limit Notice**: The free tier request quota has been reached for today, so ProductGPT is temporarily serving recommendations in **Adaptive Search Offline-Matching Mode**.\n\n` + result.message;
      } else {
        assistantText = result.message;
      }
      recommendedProductIds = result.recommendedProductIds;
    }
  } else {
    // Local processing fallback if key is missing
    const result = runLocalRuleAssistant(message, availableProducts);
    assistantText = result.message;
    recommendedProductIds = result.recommendedProductIds;
  }

  // Update session title based on conversation start
  if (session.messages.length === 2) {
    session.title = message.substring(0, 30) + (message.length > 30 ? "..." : "");
  }

  // Add Assistant Response
  const assistantMsg: Message = {
    id: "msg-" + (Date.now() + 1),
    sender: "assistant",
    text: assistantText,
    timestamp: new Date().toISOString(),
    recommendedProducts: recommendedProductIds
  };
  session.messages.push(assistantMsg);

  DB.saveChatSession(session);

  res.json({
    session,
    reply: assistantMsg,
    suggestions,
    fullProducts: recommendedProductIds.map(id => DB.getProductById(id)).filter(Boolean)
  });
}));

// Local search heuristics fallback if Gemini key is off or failed
function runLocalRuleAssistant(query: string, products: Product[]): { message: string, recommendedProductIds: string[] } {
  const normQuery = query.toLowerCase();
  let matches: Product[] = [];

  // 1. Simple category / keyword match rules
  if (normQuery.includes("audio") || normQuery.includes("headphone") || normQuery.includes("music") || normQuery.includes("earphone")) {
    matches = products.filter(p => p.category === "Audio");
  } else if (normQuery.includes("wearable") || normQuery.includes("watch") || normQuery.includes("smartwatch") || normQuery.includes("fitness watch")) {
    matches = products.filter(p => p.category === "Wearables" || p.category === "Fitness");
  } else if (normQuery.includes("laptop") || normQuery.includes("computer") || normQuery.includes("macbook") || normQuery.includes("pc")) {
    matches = products.filter(p => p.category === "Laptops");
  } else if (normQuery.includes("camera") || normQuery.includes("photo") || normQuery.includes("dslr") || normQuery.includes("video")) {
    matches = products.filter(p => p.category === "Cameras");
  } else if (normQuery.includes("coffee") || normQuery.includes("appliance") || normQuery.includes("kitchen") || normQuery.includes("brewer") || normQuery.includes("cafe")) {
    matches = products.filter(p => p.category === "Home Appliances");
  } else {
    // General keyword checking
    matches = products.filter(p => 
      p.name.toLowerCase().includes(normQuery) || 
      p.brand.toLowerCase().includes(normQuery) ||
      p.description.toLowerCase().includes(normQuery)
    ).slice(0, 2);
  }

  // Filter out any matches above budget queries if requested
  if (normQuery.includes("cheap") || normQuery.includes("budget") || normQuery.includes("under")) {
    const limits = normQuery.match(/\d+/g);
    if (limits && limits.length > 0) {
      const budgetCap = Number(limits[0]);
      matches = matches.filter(p => p.price <= budgetCap);
    } else {
      // Sort cheap products first
      matches.sort((a, b) => a.price - b.price);
    }
  }

  const ids = matches.map(m => m.id);

  let msg = `### Hello there! I am your locally powered ProductGPT Shopping Buddy.\n\n`;
  if (matches.length > 0) {
    msg += `I found some great options in our database matching your request:\n\n`;
    matches.forEach(p => {
      msg += `*   **${p.name}** (₹${p.price.toLocaleString('en-IN')}) — *Rating: ${p.rating}⭐*. Brand: ${p.brand}.\n    ${p.description}\n`;
    });
    msg += `\nI have attached interactive smart cards below so you can view, save, and compare them side-by-side! Does any of these sound right?`;
  } else {
    msg += `I examined our catalog but couldn't find a direct matches for your exact prompt. Let's widen the search! Try looking for things like "headphones", "laptops", "swim tracking watch", "DSLR cameras", or general kitchen appliances.`;
  }

  return {
    message: msg,
    recommendedProductIds: ids
  };
}

// 7. Get user's active session history
app.get("/api/chat/sessions", (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "u-1";
  const list = DB.getChatSessionsByUser(userId);
  res.json(list);
});

app.get("/api/chat/sessions/:id", (req, res) => {
  const session = DB.getChatSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found." });
  res.json(session);
});

app.delete("/api/chat/sessions/:id", (req, res) => {
  const success = DB.deleteChatSession(req.params.id);
  res.json({ success });
});

// 8. Product Reviews Deep Sentiment mining
app.post("/api/ai/analyze-reviews", async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });

  const product = DB.getProductById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  // Get local analytics calculations
  const localAnalysis = DB.getReviewSentimentAnalysis(productId);

  if (ai) {
    try {
      const prompt = `Perform a deep sentiment analysis and key insights extraction for the following consumer product:
Name: ${product.name}
Category: ${product.category}
Brand: ${product.brand}
Reviews: ${JSON.stringify(product.reviews)}

Your response MUST be formatted strictly according to JSON schema.
Ensure to summarize both positive opinions and major user complaints. Highlight what specs users praise the most.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              positiveRatio: { type: Type.INTEGER, description: "Percentage of positive feedback (e.g. 80)" },
              negativeRatio: { type: Type.INTEGER, description: "Percentage of negative feedback (e.g. 15)" },
              neutralRatio: { type: Type.INTEGER, description: "Percentage of neutral feedback (e.g. 5)" },
              positiveSummary: { type: Type.STRING, description: "Summarized positive highlights of materials, specs, or designs." },
              negativeSummary: { type: Type.STRING, description: "Summarized critical issues, drawbacks or user complaints." },
              extractedFeatures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of key features praised by customers in reviews."
              }
            },
            required: ["positiveRatio", "negativeRatio", "neutralRatio", "positiveSummary", "negativeSummary", "extractedFeatures"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        productId,
        positiveRatio: parsed.positiveRatio || localAnalysis.positiveRatio,
        negativeRatio: parsed.negativeRatio || localAnalysis.negativeRatio,
        neutralRatio: parsed.neutralRatio || localAnalysis.neutralRatio,
        positiveSummary: parsed.positiveSummary || localAnalysis.positiveSummary,
        negativeSummary: parsed.negativeSummary || localAnalysis.negativeSummary,
        features: parsed.extractedFeatures || localAnalysis.features
      });
    } catch (err: any) {
      const errStr = String(err).toLowerCase() + " " + JSON.stringify(err).toLowerCase();
      const isQuotaExceeded = errStr.includes("429") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("resource_exhausted") || errStr.includes("billing");
      
      if (isQuotaExceeded) {
        console.warn("Gemini review analysis hit API limit or exceeded quota (429). Falling back gracefully to local analysis.");
      } else {
        console.error("Gemini analysis error, falling back locally:", err);
      }
    }
  }

  // Return local backup structure
  res.json({
    productId,
    ...localAnalysis
  });
});

// 9. Side-by-side Product Comparison
app.post("/api/ai/compare", async (req, res) => {
  const { productIds, userDescription } = req.body;
  if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
    return res.status(400).json({ error: "Please select at least 2 products to compare side-by-side." });
  }

  const products: Product[] = productIds.map(id => DB.getProductById(id)).filter(Boolean) as Product[];
  if (products.length < 2) {
    return res.status(400).json({ error: "Selected products could not be retrieved from the database." });
  }

  const specsList = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    rating: p.rating,
    specs: p.specs,
    pros: p.pros,
    cons: p.cons
  }));

  let aiVerdict = `A side-by-side comparison reveals that **${products[0].name}** offers fantastic value for the budget, while **${products[1].name}** excels at specialized features. If you are focused on quality, the higher rating of ${products.find(p => p.rating === Math.max(...products.map(pr => pr.rating)))?.name} is recommended.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Compare these products side-by-side:
${JSON.stringify(specsList, null, 2)}

User Preference / Query: "${userDescription || "Looking for general comparison and best value recommendations."}"

Write a cohesive, 3-sentence expert verdict of which device is better suited for this specific user.`,
      });
      aiVerdict = response.text || aiVerdict;
    } catch (err: any) {
      const errStr = String(err).toLowerCase() + " " + JSON.stringify(err).toLowerCase();
      const isQuotaExceeded = errStr.includes("429") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("resource_exhausted") || errStr.includes("billing");
      
      if (isQuotaExceeded) {
        console.warn("Gemini compare hit API limit or exceeded quota (429). Falling back gracefully.");
        aiVerdict = `> ⚠️ **Gemini API Limit Notice**: The free tier request quota was reached, so ProductGPT is showing our **Standard Expert Verdict fallback** instead:\n\n` + aiVerdict;
      } else {
        console.error("Gemini compare failed:", err);
      }
    }
  }

  res.json({
    verdict: aiVerdict,
    products
  });
});

// 10. Admin Analytics Endpoint
app.get("/api/admin/analytics", (req, res) => {
  const products = DB.getProducts();
  const wishlists = DB.getUsers().map(u => DB.getWishlistByUserId(u.id)).flat();

  // Inventory stats
  const totalItemsCount = products.length;
  const criticalStockCount = products.filter(p => p.stock < 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Revenue analytics (simulated)
  const estimatedRevenue = products.reduce((acc, p) => acc + (p.price * (Math.floor(p.stock / 2) || 5)), 0);

  // Category splits
  const categories: Record<string, number> = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });

  // Hot trending wishlist metrics
  const wishlistHits: Record<string, number> = {};
  wishlists.forEach(w => {
    wishlistHits[w.productId] = (wishlistHits[w.productId] || 0) + 1;
  });

  const recommendationStats = Object.entries(categories).map(([category, count]) => ({
    category,
    recommendationsCount: count * 15 + Math.floor(Math.random() * 10),
    averageConversionRate: Math.round(70 + Math.random() * 25)
  }));

  res.json({
    inventory: {
      totalItemsCount,
      criticalStockCount,
      outOfStockCount
    },
    revenue: {
      totalSales: 450,
      estimatedRevenue,
      averageTicketSize: 312
    },
    categoryCounts: Object.entries(categories).map(([name, value]) => ({ name, value })),
    popularWishlistItems: Object.entries(wishlistHits).map(([id, clicks]) => {
      const p = DB.getProductById(id);
      return {
        name: p?.name || "Product " + id,
        count: clicks
      };
    }),
    recommendationStats
  });
});

app.get("/api/admin/activities", (req, res) => {
  res.json(DB.getActivities());
});

app.delete("/api/admin/activities", (req, res) => {
  DB.clearActivities();
  res.json({ success: true });
});

// 11. Admin Product Catalog Management APIs (CRUD)
app.post("/api/admin/products", trackUserActivity("CreateProduct", (req, res) => {
  const { name, category, brand, price, originalPrice, description, specs, features, pros, cons, stock } = req.body;
  if (!name || !category || !brand || !price) {
    return res.status(400).json({ error: "Name, category, brand and price are required." });
  }

  const newProd: Product = {
    id: "prod-" + Date.now(),
    name,
    category,
    brand,
    price: Number(price),
    originalPrice: Number(originalPrice) || Number(price),
    rating: 5.0, // initial rating
    image: req.body.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
    description,
    specs: specs || {},
    features: features || [],
    pros: pros || ["High performance", "Premium quality aesthetics"],
    cons: cons || ["No issues reported"],
    stock: Number(stock) || 10,
    trending: !!req.body.trending,
    newArrival: true,
    bestSeller: false,
    reviews: []
  };

  const created = DB.createProduct(newProd);
  res.status(201).json(created);
}));

app.put("/api/admin/products/:id", trackUserActivity("UpdateProduct", (req, res) => {
  const updated = DB.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(updated);
}));

app.delete("/api/admin/products/:id", trackUserActivity("DeleteProduct", (req, res) => {
  const deleted = DB.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Product not found under standard index" });
  }
  res.json({ success: true });
}));


// Vite / Production Build Pipeline configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ProductGPT backend server and routing running successfully on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
