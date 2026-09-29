# Ann Real Estate — Ultra-Luxury Dubai Property Portal & Private CRM

An ultra-luxury real estate web application and advisory CRM designed for high-net-worth private clients and luxury property advisory in Dubai. Built with calm, minimal aesthetics, warm gold accents, Cormorant Garamond typography, and private CRM deal pipeline workflows. Prices are quoted exclusively in **AED**.

---

## 🏛️ Key Features

- **Luxury SPA Catalog**: Curated trophy ready residences across Palm Jumeirah, Downtown Dubai, Dubai Marina, Emirates Hills, and Dubai Hills Estate.
- **Visionary Off-Plan Showcase**: Handover timelines, projected net ROI metrics, and milestone payment plans (Escrow statutory protection).
- **Interactive Mortgage Calculator**: Dynamic sliders for property purchase price, down payment (minimum 20%), loan tenor, and interest rate with live AED monthly amortization breakdown.
- **Private Staff & Broker CRM**:
  - Direct email and password authentication with quick profile switcher.
  - Real-time deal pipeline Kanban board (New, Contacted, Viewing Scheduled, Offer Submitted, Deal Won, Lost/Archived).
  - Automated 2% statutory brokerage commission calculator upon closing deals.
  - Automated Lead Scoring (0–100) with HOT / WARM / COLD classification.
  - 60-second real-time notification sync with bell indicator.
  - Stale lead alert banner for inquiries uncontacted for 3+ days.
  - CSV / Excel export for client records.
- **Enterprise Anti-Spam Architecture**:
  - Hidden honeypot fields (`website_hp`) with zero client-side visibility.
  - Rate limiting (IP-based sliding window) preventing form abuse.
  - Zero third-party email dependencies (all submissions securely captured directly in PostgreSQL).
- **SEO & Google Search Indexing**:
  - Pre-configured `robots.txt` and `sitemap.xml`.
  - Comprehensive OpenGraph and Twitter card metadata for WhatsApp, LinkedIn, and social previews.
  - Schema.org `RealEstateAgent` JSON-LD structured data.
  - Private CRM area and APIs strictly protected with `X-Robots-Tag: noindex, nofollow, noarchive`.

---

## 🚀 How to Run the Website

### 1. Prerequisites
- **Node.js** (v18.0.0 or later installed on your system)
- Terminal (PowerShell on Windows, or Terminal on macOS/Linux)

### 2. Quick Start (Run Locally)

```bash
# 1. Install dependencies
npm install

# 2. Launch the local development server
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🗄️ Setting Up Your Neon Database

The application automatically connects to PostgreSQL / Neon. If no database is configured, an automated in-memory SQLite/Postgres fallback is initialized so the site is immediately testable.

### Where to Paste Your Neon Database Link:
1. Locate the file named `.env` in the root folder of this project (or copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set your `DATABASE_URL`:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://neondb_owner:YOUR_NEON_PASSWORD@ep-sample-pool-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Restart the server (`npm start`). The database tables and initial sample data (15 ready properties, 6 off-plan projects, 5 developers, 3 licensed agents, 40 sample leads) will seed automatically.

---

## 🔐 Private Staff & Broker CRM Logins

Click **ADMIN CRM** in the top navigation bar to open the private advisory authentication screen:

| Staff Member | Role | Email Address | Password |
|---|---|---|---|
| **Master Administrator** | Administrator | `admin@annrealestate.ae` | `admin123` |
| **Rashid Al-Falasi** | Managing Director | `rashid@annrealestate.ae` | `agent123` |
| **Helena Vance-Montgomery** | Europe Private Client Desk | `helena@annrealestate.ae` | `agent123` |
| **Kareem Mansoor** | Institutional & Sovereign Desk | `kareem@annrealestate.ae` | `agent123` |

*Tip: Quick one-click login chips are available on the login card for rapid testing.*

---

## 🛡️ Security & Privacy Commitments

- **Your `.env` file containing database passwords is strictly ignored** by `.gitignore` and is blocked from HTTP access (`403 Forbidden`).
- **No external email sending**: Inquiries are stored directly in your private database, eliminating SMTP relay leaks.

---

## 📤 Saving to GitHub (Step-by-Step)

To upload this project to your GitHub account:

### Step 1: Create a new repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Enter Repository name: `ann-real-estate-dubai`.
3. Choose **Private** or **Public**.
4. **Do not** initialize with a README, .gitignore, or license (we already have them).
5. Click **Create repository**.

### Step 2: Initialize Git and Push from your Terminal

```bash
# Navigate to project directory
cd "c:\Users\Anamika Menon\Ann29Real"

# Initialize git (if not already done)
git init

# Add all files (secrets in .env are automatically excluded by .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: Ann Real Estate Dubai luxury portal & CRM"

# Set default branch to main
git branch -M main

# Link your GitHub repository (replace USERNAME with your GitHub handle)
git remote add origin https://github.com/USERNAME/ann-real-estate-dubai.git

# Push everything to GitHub
git push -u origin main
```
