/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { Product, User, WishlistItem, ChatSession, UserActivity, Review } from "../src/types";

// DB Path setup - inside project directory
const DB_FILE = path.join(process.cwd(), "db_store.json");

// Define basic structural schema for JSON persistence
interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> password (stored plain for demo simplicity, but fully functional)
  products: Product[];
  wishlists: WishlistItem[];
  chatSessions: ChatSession[];
  activities: UserActivity[];
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "AeroSound Pro X7",
    category: "Audio",
    brand: "Aero",
    price: 19999,
    originalPrice: 23999,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
    description: "Premium over-ear wireless headphones with industry-leading Active Noise Cancellation (ANC), spatial audio, and up to 45 hours of battery life.",
    specs: {
      "Battery Life": "45 Hours (ANC off), 35 Hours (ANC on)",
      "ANC Level": "Dynamic Hybrid ANC (up to 40dB reduction)",
      "Bluetooth Version": "Bluetooth 5.3",
      "Drivers": "40mm Bio-Cellulose Drivers",
      "Charging": "USB-C Quick Charge (10 mins = 5 hours playback)"
    },
    features: [
      "Ultra-soft memory foam earcups",
      "Multipoint Bluetooth connection",
      "Adaptive ANC mode with transparency tuning",
      "Hands-free AI voice assistant trigger support"
    ],
    pros: ["Superb noise cancellation", "Extremely comfortable for long flights", "Crisp highs and warm midtones"],
    cons: ["Slightly bulky carrying case", "Companion app is laggy sometimes"],
    stock: 45,
    trending: true,
    newArrival: false,
    bestSeller: true,
    reviews: [
      {
        id: "r1-1",
        userName: "Sarah Jenkins",
        rating: 5,
        comment: "These headphones are a lifesaver on my weekly flights. The ANC blocks out every single decibel of jet engine hum. Battery lasts forever!",
        sentiment: "positive",
        date: "2026-05-15"
      },
      {
        id: "r1-2",
        userName: "David K.",
        rating: 4,
        comment: "Amazing sound quality, but the head band feels a little tight. After 3 hours of continuous coding, I have to take them off for a break.",
        sentiment: "neutral",
        date: "2026-05-20"
      },
      {
        id: "r1-3",
        userName: "Alex Rivera",
        rating: 5,
        comment: "Sound signature is incredibly flat and perfect for studio work. Heavy bass is punchy without distorting. Worth every single rupee.",
        sentiment: "positive",
        date: "2026-05-25"
      },
      {
        id: "r1-4",
        userName: "Marcus V.",
        rating: 2,
        comment: "Great sound, but the Bluetooth multipoint keeps dropping connections when switching between my MacBook and Samsung phone.",
        sentiment: "negative",
        date: "2026-05-28"
      }
    ]
  },
  {
    id: "prod-2",
    name: "SwiftBook Air 14",
    category: "Laptops",
    brand: "SwiftCorp",
    price: 79999,
    originalPrice: 87999,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&q=80&w=400",
    description: "Incredibly thin and light 14-inch professional laptop powered by the Swift Silicon Chip, yielding 20 hours of continuous productivity.",
    specs: {
      "Processor": "8-Core Swift-Silicon Ultra",
      "RAM": "16GB Unified LPDDR5",
      "Storage": "512GB PCIe NVMe SSD",
      "Display": "14-inch Liquid IPS (2560x1600, 400 nits)",
      "Battery Capacity": "68 Wh (up to 20 hrs Web Browsing)"
    },
    features: [
      "Silent fanless cooling design",
      "Full aluminium unibody chassis",
      "Backlit ergonomic layout keyboard",
      "Full HD 1080p web-camera with intelligence framing"
    ],
    pros: ["Absolutely silent operation", "Stellar battery life", "Stunning retina-grade display"],
    cons: ["Only 2 USB-C ports, no HDMI port", "Cannot upgrade RAM or storage after purchase"],
    stock: 22,
    trending: true,
    newArrival: true,
    bestSeller: false,
    reviews: [
      {
        id: "r2-1",
        userName: "Maya Ortiz",
        rating: 5,
        comment: "The speed and fluid performance on compile tasks is incredible. Fanless cooling is brilliant—dead silent even during heavy Docker compiles.",
        sentiment: "positive",
        date: "2026-04-10"
      },
      {
        id: "r2-2",
        userName: "Gregory Finch",
        rating: 3,
        comment: "Great laptop, but extremely annoying that you can't plug in a standard USB drive or HDMI cable directly without carrying a bunch of USB-C dongles.",
        sentiment: "negative",
        date: "2026-04-15"
      },
      {
        id: "r2-3",
        userName: "Liam Peters",
        rating: 5,
        comment: "Best laptop I have ever owned. I go to coffee shops and never even pack my charger. Battery lasts a full 10-hour day easily.",
        sentiment: "positive",
        date: "2026-05-02"
      }
    ]
  },
  {
    id: "prod-3",
    name: "PixelWatch Active 3",
    category: "Wearables",
    brand: "Google",
    price: 23999,
    originalPrice: 27999,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=400",
    description: "Sleek and sporty smartwatch featuring advanced health tracking, offline maps, blood oxygen monitoring, and deep Google Assistant integration.",
    specs: {
      "Operating System": "WearOS v4.2",
      "Screen Type": "AMOLED with Always-On Mode",
      "Water Resistance": "50m (5 ATM rating for swimming)",
      "Sensors": "Heart rate, ECG, SpO2, Skin Temp, Barometer"
    },
    features: [
      "Built-in absolute GPS navigation",
      "Automatic workout activity detection",
      "Premium stainless-steel housing options",
      "Up to 3 days battery with Smart Saver activated"
    ],
    pros: ["Vibrant screen that's bright outside", "Very precise fitness stats and activity tracking", "Quick pairing with Android ecosystem"],
    cons: ["Battery lasts barely 36 hours with normal wear", "Sleep tracking is occasionally inconsistent"],
    stock: 60,
    trending: false,
    newArrival: true,
    bestSeller: true,
    reviews: [
      {
        id: "r3-1",
        userName: "Tony Stark",
        rating: 4,
        comment: "Looks incredibly sharp on the wrist. Google Assistant responds instantly. It's basically a phone on your wrist. Rating it 4 stars because of battery lifespan.",
        sentiment: "positive",
        date: "2026-05-01"
      },
      {
        id: "r3-2",
        userName: "Emily Rose",
        rating: 5,
        comment: "The swim tracking software is brilliant. Accurate lap metrics, and the custom silicone band stays locked. Perfect sports wearable.",
        sentiment: "positive",
        date: "2026-05-18"
      },
      {
        id: "r3-3",
        userName: "Daniel Snyder",
        rating: 2,
        comment: "Charging it every single night is frustrating. If I wear it to track sleep, it is dead by the middle of my work day. Sleep tracking data also seems wildly exaggerated.",
        sentiment: "negative",
        date: "2026-05-24"
      }
    ]
  },
  {
    id: "prod-4",
    name: "Vantage DSLR Pro V",
    category: "Cameras",
    brand: "Lumix",
    price: 111999,
    originalPrice: 123999,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
    description: "For professionals seeking perfection: 45MP full-frame mirrorless camera with AI-based autofocus, Dual Native ISO, and cinematic 8K recording.",
    specs: {
      "Sensor Resolution": "45.7 Megapixel Full-Frame CMOS",
      "Autofocus System": "693-point Phase-detection with eye tracking",
      "Stabilization": "5-Axis In-Body Image Stabilization",
      "Video Specs": "8K RAW at 30fps, 4K at 120fps"
    },
    features: [
      "Weather-sealed hybrid alloy chassis",
      "Dual SD/CFexpress card slot configurations",
      "OLED electronic viewfinder (3.6m dots)",
      "High-speed wireless content transfer"
    ],
    pros: ["Stunning clarity even in ultra-low lighting", "Unbelievable subject-tracking speed", "Top-tier video customization logs"],
    cons: ["Heavy compared to typical entry-level cameras", "Complex settings menu is intimidating"],
    stock: 15,
    trending: true,
    newArrival: false,
    bestSeller: false,
    reviews: [
      {
        id: "r4-1",
        userName: "Diana Lens",
        rating: 5,
        comment: "Absolutely top-of-line. I shoot weddings and high-speed sports, and this camera hasn't missed focus a single time. Colors out-of-camera are gorgeous.",
        sentiment: "positive",
        date: "2026-04-29"
      },
      {
        id: "r4-2",
        userName: "Robert Miller",
        rating: 4,
        comment: "Amazing dynamic range. The menu system makes you want to tear your hair out initially, but once customized it is super fast. Exceptional video stabilizer.",
        sentiment: "positive",
        date: "2026-05-12"
      }
    ]
  },
  {
    id: "prod-5",
    name: "CafeGusto Intelligent Brewer",
    category: "Home Appliances",
    brand: "Gusto",
    price: 14399,
    originalPrice: 15999,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=400",
    description: "App-controlled intelligent coffee maker that precision-brews espresso, latte, and filter coffee. Features programmatic temperature control.",
    specs: {
      "Water Tank Volume": "1.8 Liters (60 oz)",
      "Pressure": "15 Bar Italian electromagnetic pump",
      "App Control": "Wi-Fi and Bluetooth automation",
      "Grinder": "Burr grinder integrated with 8 coarseness dials"
    },
    features: [
      "Custom temperature profile presets",
      "Auto self-cleaning system cycle",
      "Schedule feature: wake up to hot coffee",
      "Milk frother steamer integrated side attachment"
    ],
    pros: ["Amazing fresh ground coffee taste", "Saves money on coffee shop visits", "Scheduled brewing is magical"],
    cons: ["Water container is tricky to refill", "The app requires too many permissions"],
    stock: 50,
    trending: false,
    newArrival: false,
    bestSeller: true,
    reviews: [
      {
        id: "r5-1",
        userName: "Brenda Smith",
        rating: 5,
        comment: "My morning schedule is fully automated. I wake up at 7 AM and a perfect, piping-hot double espresso is waiting for me. Clean-up is a breeze too.",
        sentiment: "positive",
        date: "2026-05-10"
      },
      {
        id: "r5-2",
        userName: "James T.",
        rating: 3,
        comment: "Excellent espresso, but the app is frustrating. It disconnected twice from my Wi-Fi, and there's no way to schedule a brew without the app.",
        sentiment: "neutral",
        date: "2026-05-15"
      },
      {
        id: "r5-3",
        userName: "Carl Vance",
        rating: 5,
        comment: "This grinder is premium. Consistent grain size and fast. Milk foaming steam is very reliable.",
        sentiment: "positive",
        date: "2026-05-22"
      }
    ]
  },
  {
    id: "prod-6",
    name: "Apex Gaming Keyboard K3",
    category: "Accessories",
    brand: "Apex",
    price: 10399,
    originalPrice: 11999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400",
    description: "Mechanical sports gaming keyboard with hot-swappable linear yellow switches, ultra-low 1ms latency, and customizable dynamic per-key RGB backlighting.",
    specs: {
      "Switches": "Apex Linear Linear-Yellow Switches (hot-swappable)",
      "Key Layout": "Tenkeyless 80% Layout with volume roller",
      "Keycaps": "Double-shot PBT matte keycaps",
      "Latency": "1ms response polling over custom 2.4G wireless"
    },
    features: [
      "Magnetic ergonomic wrist mount rest",
      "Programmable macro controls directly on device",
      "Heavy-duty sandblasted aluminum plate top",
      "Compatible with Windows, macOS, Linux"
    ],
    pros: ["Crisp, ultra-smooth keypress feels", "Beautiful custom RGB lighting animations", "Compact size saves desk real-estate"],
    cons: ["Mechanical switches are loud in office settings", "Software utility is Windows-exclusive only"],
    stock: 80,
    trending: true,
    newArrival: true,
    bestSeller: false,
    reviews: [
      {
        id: "r6-1",
        userName: "Gamer99",
        rating: 5,
        comment: "Linear yellow switches are phenomenal. Instantaneous response. Plus, being hot-swappable means I can upgrade keys anytime.",
        sentiment: "positive",
        date: "2026-05-20"
      },
      {
        id: "r6-2",
        userName: "OfficeWorker",
        rating: 3,
        comment: "Very elegant build, but please do not take this to an office workspace. It makes deep clacking noises that my coworkers absolutely despises.",
        sentiment: "neutral",
        date: "2026-05-24"
      }
    ]
  },
  {
    id: "prod-7",
    name: "TitanFit Home Gym Gymbench",
    category: "Fitness",
    brand: "TitanFit",
    price: 27999,
    originalPrice: 31999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
    description: "Premium heavy-duty folding utility gym bench with 8 back positions, integrated handles, and wheels for full full-body home workouts.",
    specs: {
      "Weight Capacity": "850 lbs (385 kg) structural certified limit",
      "Positions": "8 backrest incline/decline angles, 3 seat angles",
      "Padding Cushion": "2.5-inch high-density hybrid leather padding",
      "Frame Material": "11-gauge thick industrial powder carbon steel"
    },
    features: [
      "Folding space saver flat dimensions configuration",
      "Detachable leg holder bar attachments included",
      "Heavy duty non-slip rubber stability floor caps",
      "Built-in transport handles and rollers design"
    ],
    pros: ["Incredibly solid, zero shaking under 300lbs", "Folds into a very compact space under the bed", "No assembly needed, unfolds directly in minutes"],
    cons: ["Heavy and hard to roll on carpets", "Vinyl leather holds onto sweat odor if not wiped instantly"],
    stock: 35,
    trending: false,
    newArrival: false,
    bestSeller: true,
    reviews: [
      {
        id: "r7-1",
        userName: "GymRat",
        rating: 5,
        comment: "This is as solid as commercial benches. I pack 250lb benches dumbbells all day, no wobble at all. Recommended heavily.",
        sentiment: "positive",
        date: "2026-04-12"
      },
      {
        id: "r7-2",
        userName: "Noreen",
        rating: 4,
        comment: "Saves a lot of space in my studio. It is quite heavy though, lifting it up to fold takes some serious arm work. Padding feels very supportive.",
        sentiment: "positive",
        date: "2026-05-02"
      }
    ]
  },
  {
    id: "prod-8",
    name: "OmniView Pro 4K Projector",
    category: "Audio",
    brand: "Omni",
    price: 63999,
    originalPrice: 71999,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=400",
    description: "Ultra short throw home theater smart projector featuring native 4K, 2400 ANSI lumens, HDR10, and AndroidTV built-in with streaming apps.",
    specs: {
      "Resolution": "3840x2160 Native 4K UHD",
      "Brightness": "2400 ANSI Lumens, 20,000 hrs lamp life",
      "Throw Ratio": "1.2:1 (100 inch screen at 2.6m)",
      "Audio": "Dual 10W Harman Kardon speakers integrated"
    },
    features: [
      "Automatic screen alignment and focus correction",
      "Intelligent obstacle avoidance software sensors",
      "Preloaded official streaming channels support",
      "Built-in Chromecasts for mobile projection"
    ],
    pros: ["Super bright, even works during daytime", "Astonishing built-in stereo quality sound", "Super lightweight design and sleek look"],
    cons: ["Fan can get noisy on turbo brightness", "No optical zoom, relies on digital screen adjustment"],
    stock: 12,
    trending: true,
    newArrival: true,
    bestSeller: false,
    reviews: [
      {
        id: "r8-1",
        userName: "MovieGeek",
        rating: 5,
        comment: "Transformed my living room into a direct cinema. The 4k crispness with HDR is marvelous. Dolby color matching is phenomenal.",
        sentiment: "positive",
        date: "2026-05-22"
      },
      {
        id: "r8-2",
        userName: "Gael B.",
        rating: 4,
        comment: "A perfect projector overall. Note that you need a very flat wall otherwise the digital keystone leaves a slight gray outline around the square content.",
        sentiment: "neutral",
        date: "2026-05-29"
      }
    ]
  },
  {
    id: "prod-9",
    name: "NeoPro Smart Watch X",
    category: "Wearables",
    brand: "Neo",
    price: 6999,
    originalPrice: 8999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400",
    description: "Sleek and highly stylish modern smartwatch featuring an elegant curved AMOLED display, dynamic health telemetry tracking, and long 10-day battery.",
    specs: {
      "Display": "1.43-inch Curved AMOLED Always-on",
      "Battery": "Up to 10 days (Standard usage)",
      "Sensors": "High-precision SpO2, Heart rate, sleep monitor",
      "Water Rating": "IP68 swim-proof certification"
    },
    features: [
      "Premium curved touch bezel layout",
      "Built-in dynamic voice assistant control",
      "Instant smart notifications sync",
      "100+ professional fitness workout modes"
    ],
    pros: ["Gorgeous high-brightness screen", "Excellent lightweight metal chassis", "Highly responsive touch system"],
    cons: ["No cellular LTE support", "Limited custom reply templates"],
    stock: 40,
    trending: true,
    newArrival: true,
    bestSeller: false,
    reviews: [
      {
        id: "r-neo-1",
        userName: "Arun Kumar",
        rating: 5,
        comment: "Fantastic smartwatch! The curved AMOLED screen is absolutely beautiful and incredibly bright even under direct sunlight. Battery easily lasts more than a week.",
        sentiment: "positive",
        date: "2026-05-18"
      },
      {
        id: "r-neo-2",
        userName: "Priya S.",
        rating: 4,
        comment: "Highly accurate heart-rate and sleep tracking features. The strap is super comfortable for all-day wear.",
        sentiment: "positive",
        date: "2026-05-25"
      }
    ]
  },
  {
    id: "prod-10",
    name: "SwiftCharge Wireless Hub",
    category: "Accessories",
    brand: "SwiftCorp",
    price: 3499,
    originalPrice: 4499,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=400",
    description: "Premium unified 3-in-1 magnetic wireless fast charging hub crafted in sandblasted structural aluminum alloys.",
    specs: {
      "Charging Outputs": "15W smartphone, 5W smartwatch, 5W wireless earbuds",
      "Fast Charge Protocol": "Qi-certified dynamic power delivery",
      "Input Connection": "30W USB-C PD input port",
      "Multi-Protection": "Over-current, thermal, surge safeguards"
    },
    features: [
      "3-in-1 unified space-saving layout structure",
      "Secure magnet auto-align positioning",
      "Soft atmospheric night ambient light",
      "Made of clean premium sandblasted alloy base"
    ],
    pros: ["Keeps the desk completely clutter-free", "Fast charging is reliable without over-heating", "Excellent premium metal weighted construction"],
    cons: ["Needs a 30W adapter (included in the premium starter packet)", "Watch charger is only compatible with popular models"],
    stock: 75,
    trending: true,
    newArrival: false,
    bestSeller: true,
    reviews: [
      {
        id: "r-sc-1",
        userName: "Vikram Malhotra",
        rating: 5,
        comment: "This Charger is a true savior. My nightstand was a complete mess of cables, and now I charge my phone, watch, and earbuds all on a single sleek stand. Very premium build!",
        sentiment: "positive",
        date: "2026-05-14"
      },
      {
        id: "r-sc-2",
        userName: "Rohan Das",
        rating: 4,
        comment: "Magnets are strong and hold the phone firmly. Highly recommended.",
        sentiment: "positive",
        date: "2026-05-21"
      }
    ]
  }
];

// Initialize Database Storage
function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      
      let products = parsed.products || [];
      let users = parsed.users || [];
      let wishlists = parsed.wishlists || [];

      // Check if DB is in USD format (if prod-1 has a very low price)
      const p1 = products.find((p: any) => p.id === "prod-1");
      if (!p1 || p1.price < 1000) {
        console.log("Migrating database storage from USD to INR (Rupees)...");
        
        // Define Indian prices
        const priceMap: Record<string, { price: number, original: number }> = {
          "prod-1": { price: 19999, original: 23999 },
          "prod-2": { price: 79999, original: 87999 },
          "prod-3": { price: 23999, original: 27999 },
          "prod-4": { price: 111999, original: 123999 },
          "prod-5": { price: 14399, original: 15999 },
          "prod-6": { price: 10399, original: 11999 },
          "prod-7": { price: 27999, original: 31999 },
          "prod-8": { price: 63999, original: 71999 }
        };

        // Convert existing loaded items
        products.forEach((p: any) => {
          if (priceMap[p.id]) {
            p.price = priceMap[p.id].price;
            p.originalPrice = priceMap[p.id].original;
          }
        });

        // Convert user budgets
        users.forEach((u: any) => {
          if (u.preferences) {
            if (u.id === "u-1") {
              u.preferences.budget = 100000;
            } else if (u.id === "u-2") {
              u.preferences.budget = 40000;
            } else if (u.preferences.budget < 5000) {
              u.preferences.budget = u.preferences.budget * 80;
            }
          }
        });

        // Convert wishlist records
        wishlists.forEach((w: any) => {
          if (priceMap[w.productId]) {
            w.currentPrice = priceMap[w.productId].price;
            w.originalPrice = priceMap[w.productId].original;
          }
        });
      }

      // Ensure the two new products prod-9 and prod-10 are explicitly present in the products list
      if (!products.some((p: any) => p.id === "prod-9")) {
        const item9 = INITIAL_PRODUCTS.find(p => p.id === "prod-9");
        if (item9) products.push(item9);
      }
      if (!products.some((p: any) => p.id === "prod-10")) {
        const item10 = INITIAL_PRODUCTS.find(p => p.id === "prod-10");
        if (item10) products.push(item10);
      }

      const mergedDB = {
        users,
        passwords: parsed.passwords || {},
        products,
        wishlists,
        chatSessions: parsed.chatSessions || [],
        activities: parsed.activities || []
      };

      saveToFile(mergedDB);
      return mergedDB;
    } catch (e) {
      console.error("Failed to read database file, restoring defaults.", e);
    }
  }

  // Set default configurations if file does not exist or crashed
  const defaultDB: DatabaseSchema = {
    users: [
      {
        id: "u-1",
        email: "rupanandpalakurthi@gmail.com",
        name: "Rupanand Palakurthi",
        role: "admin",
        preferences: {
          budget: 100000,
          favoriteCategories: ["Audio", "Laptops"],
          favoriteBrands: ["Aero", "SwiftCorp"],
          minRating: 4.5
        }
      },
      {
        id: "u-2",
        email: "buyer@productgpt.ai",
        name: "Jane Buyer",
        role: "user",
        preferences: {
          budget: 40000,
          favoriteCategories: ["Wearables", "Home Appliances"],
          favoriteBrands: ["Google", "Gusto"],
          minRating: 4.0
        }
      }
    ],
    passwords: {
      "u-1": "admin123",
      "u-2": "buyer123"
    },
    products: INITIAL_PRODUCTS,
    wishlists: [
      {
        id: "w-1",
        userId: "u-1",
        productId: "prod-1",
        addedAt: "2026-06-01T12:00:00Z",
        originalPrice: 23999,
        currentPrice: 19999
      },
      {
        id: "w-2",
        userId: "u-2",
        productId: "prod-3",
        addedAt: "2026-06-02T15:30:00Z",
        originalPrice: 27999,
        currentPrice: 23999
      }
    ],
    chatSessions: [],
    activities: [
      {
        id: "act-1",
        userId: "u-1",
        userEmail: "rupanandpalakurthi@gmail.com",
        action: "Login",
        details: "Logged into ProductGPT as Administrator",
        timestamp: "2026-06-03T09:12:00Z"
      }
    ]
  };

  saveToFile(defaultDB);
  return defaultDB;
}

function saveToFile(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write to DB store file:", e);
  }
}

// Global Memory Store instance
const db = initDatabase();

export const DB = {
  // Users APIs
  getUsers: (): User[] => db.users,
  getUserById: (id: string): User | undefined => db.users.find(u => u.id === id),
  getUserByEmail: (email: string): User | undefined => db.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User, passwordStr: string): User => {
    db.users.push(user);
    db.passwords[user.id] = passwordStr;
    saveToFile(db);
    return user;
  },
  updateUserPreferences: (userId: string, preferences: User['preferences']): User | undefined => {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.preferences = preferences;
      saveToFile(db);
    }
    return user;
  },
  verifyPassword: (userId: string, passwordStr: string): boolean => {
    return db.passwords[userId] === passwordStr;
  },
  updatePassword: (userId: string, newPasswordStr: string): void => {
    db.passwords[userId] = newPasswordStr;
    saveToFile(db);
  },

  // Products APIs
  getProducts: (): Product[] => db.products,
  getProductById: (id: string): Product | undefined => db.products.find(p => p.id === id),
  createProduct: (product: Product): Product => {
    db.products.push(product);
    saveToFile(db);
    return product;
  },
  updateProduct: (id: string, updatedFields: Partial<Product>): Product | undefined => {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...updatedFields };
      saveToFile(db);
      return db.products[idx];
    }
    return undefined;
  },
  deleteProduct: (id: string): boolean => {
    const beforeLen = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    if (db.products.length !== beforeLen) {
      // Clean up wishlist items pointing to deleted products
      db.wishlists = db.wishlists.filter(w => w.productId !== id);
      saveToFile(db);
      return true;
    }
    return false;
  },

  // Wishlists APIs
  getWishlistByUserId: (userId: string): WishlistItem[] => {
    return db.wishlists.filter(w => w.userId === userId);
  },
  addToWishlist: (item: WishlistItem): WishlistItem => {
    // Only add if not duplicates
    const exist = db.wishlists.find(w => w.userId === item.userId && w.productId === item.productId);
    if (exist) return exist;
    db.wishlists.push(item);
    saveToFile(db);
    return item;
  },
  removeFromWishlistByProduct: (userId: string, productId: string): boolean => {
    const beforeLen = db.wishlists.length;
    db.wishlists = db.wishlists.filter(w => !(w.userId === userId && w.productId === productId));
    if (db.wishlists.length !== beforeLen) {
      saveToFile(db);
      return true;
    }
    return false;
  },

  // Chat sessions APIs
  getChatSessionsByUser: (userId: string): ChatSession[] => {
    return db.chatSessions.filter(c => c.userId === userId);
  },
  getChatSessionById: (id: string): ChatSession | undefined => {
    return db.chatSessions.find(c => c.id === id);
  },
  saveChatSession: (session: ChatSession): ChatSession => {
    const idx = db.chatSessions.findIndex(c => c.id === session.id);
    if (idx !== -1) {
      db.chatSessions[idx] = session;
    } else {
      db.chatSessions.push(session);
    }
    saveToFile(db);
    return session;
  },
  deleteChatSession: (id: string): boolean => {
    const beforeLen = db.chatSessions.length;
    db.chatSessions = db.chatSessions.filter(c => c.id !== id);
    if (db.chatSessions.length !== beforeLen) {
      saveToFile(db);
      return true;
    }
    return false;
  },

  // Activity Log APIs
  logActivity: (userId: string, userEmail: string, action: string, details: string): UserActivity => {
    const activity: UserActivity = {
      id: "act-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      userId,
      userEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.activities.unshift(activity); // puts newest first
    // Limit to 100 logs keep database neat
    if (db.activities.length > 100) {
      db.activities = db.activities.slice(0, 100);
    }
    saveToFile(db);
    return activity;
  },
  getActivities: (): UserActivity[] => db.activities,
  clearActivities: (): void => {
    db.activities = [];
    saveToFile(db);
  },

  // Custom AI summary analysis cached outputs - helps when API key is missing or speed counts
  getReviewSentimentAnalysis: (productId: string): { positiveRatio: number; negativeRatio: number; neutralRatio: number; positiveSummary: string; negativeSummary: string; features: string[] } => {
    const product = db.products.find(p => p.id === productId);
    if (!product) {
      return { positiveRatio: 50, negativeRatio: 30, neutralRatio: 20, positiveSummary: "", negativeSummary: "", features: [] };
    }

    const reviews = product.reviews;
    if (reviews.length === 0) {
      return {
        positiveRatio: 70, negativeRatio: 10, neutralRatio: 20,
        positiveSummary: "The details point to exceptional layout and design aesthetics.",
        negativeSummary: "No critical flaws have been raised by reviewers yet.",
        features: product.features.slice(0, 2)
      };
    }

    const pos = reviews.filter(r => r.sentiment === "positive").length;
    const neg = reviews.filter(r => r.sentiment === "negative").length;
    const neu = reviews.filter(r => r.sentiment === "neutral").length;
    const total = reviews.length;

    // Direct features from reviews
    return {
      positiveRatio: Math.round((pos / total) * 100),
      negativeRatio: Math.round((neg / total) * 100),
      neutralRatio: Math.round((neu / total) * 100),
      positiveSummary: "Top praised elements include: " + product.pros.join(", "),
      negativeSummary: "Areas for improvement include: " + product.cons.join(", "),
      features: product.features
    };
  }
};
