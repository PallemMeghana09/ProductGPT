#  ProductGPT 🛍️🤖

An advanced, AI-powered product recommendation agent and conversational shopping assistant that helps users discover, compare, and choose the perfect products for their needs. 

ProductGPT leverages state-of-the-art Generative AI with the Google Gemini API to understand nuanced user queries, recommend fits, compare parameters, and maintain a personalized wishlist.

---

## 🚀 Key Features

* **💬 Gemini-Powered AI Chat**: Have natural conversations with a smart shopping assistant. Ask for guidance, state your constraints (budget, style, tech specs), and receive personalized, rich item recommendations.
* **🔍 Semantic Search & Filters**: Search through the catalog using natural queries, or filter items with granular constraints.
* **📊 Multi-Product Comparison**: Compare key attributes side-by-side to understand trade-offs and make confident buying decisions.
* **❤️ Interactive Wishlist (Personal Notebook)**: Save your top-match products to look at later.
* **📋 Dynamic Product Detail Sheets**: Access deep specifications, user feedback breakdowns, and key pros/cons.
* **🛡️ Admin & User Profiles**: Simulate real platform user features with customized profiles and an administrative control base.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, Motion (Animations), Lucide React (Icons)
* **Backend**: Express, Node.js (with TSX running TypeScript natively in dev)
* **AI engine**: Google Gemini API via official `@google/genai` TypeScript SDK
* **Build System**: `esbuild` fast bundle for the backend & Vite build for the client

---

## 📦 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# GEMINI_API_KEY: Required for Gemini AI API calls.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
APP_URL="http://localhost:3000"
```

### 3. Installation

Install all required package dependencies:

```bash
npm install
```

### 4. Development Server

Start the full-stack development server:

```bash
npm run dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

### 5. Production Build

To compile a highly optimized, single-bundle distribution of both frontend and backend:

```bash
npm run build
```

This compiles static assets into `dist/` and compiles the backend into `dist/server.cjs`.

### 6. Start Production Server

To start the production-ready server:

```bash
npm run start
```

---

## 📁 Project Structure

```text
├── index.html                # Main SPA root entry template
├── metadata.json             # AI Studio Applet Metadata
├── package.json              # Dependencies and build scripts
├── server.ts                 # Full-stack Express server with Vite middleware
├── server/
│   └── db.ts                 # In-memory database & custom mock store handlers
├── src/
│   ├── App.tsx               # Main React entry router
│   ├── index.css             # Global CSS with Tailwind CSS importer
│   ├── main.tsx              # React mounting root entry
│   ├── types.ts              # Shareable TypeScript definitions
│   ├── utils.ts              # Global client API helpers & utilities
│   └── components/           # UI Elements & Pages
│       ├── AIChatPage.tsx         # Conversation Agent Interface
│       ├── AdminDashboard.tsx     # Settings & Management panel
│       ├── ComparisonPage.tsx     # Interactive comparison matrix
│       ├── LandingPage.tsx        # Hero and call-to-actions page
│       ├── LoginRegisterPage.tsx  # User Auth interface
│       ├── ProductDetailsPage.tsx # Detailed view & specs sheet
│       ├── SearchPage.tsx         # Dynamic grid, search & categories
│       ├── UserProfilePage.tsx    # Personal customer dashboard
│       └── WishlistPage.tsx       # Saved products notebook
└── tsconfig.json             # TypeScript compiler settings
```

---

## 🎨 Visual Identity

ProductGPT uses a high-contrast **Cosmic Slate Theme** with glassmorphic visuals for modern premium interfaces:
* **Backgrounds**: Soft obsidian dark values (`#08080A` & `#111827`) set with custom glowing ambient lights.
* **Typography**: Clean *Inter* paired with high-impact modern heading fonts *Space Grotesk*, plus technical metrics in *JetBrains Mono*.
* **Elements**: Blur-backdropped glass panels styled directly using Tailwind v4.
