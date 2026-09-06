# 🏫 PM SHRI Kendriya Vidyalaya Web Portal & Administration CMS

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Supabase Ready](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Automated-222222?logo=github&logoColor=white)](https://pages.github.com)
[![Pure Vanilla](https://img.shields.io/badge/Vanilla-JS%20%7C%20CSS%20%7C%20HTML-F7DF1E?logo=javascript&logoColor=black)](#)

A modern, accessible, and high-performance Web Portal and Content Management System (CMS) designed for **PM SHRI Kendriya Vidyalayas** and Kendriya Vidyalayas across India.

Features a **hybrid local-first cloud architecture**: runs instantly out-of-the-box with zero configuration using browser storage, and seamlessly synchronizes with **Supabase PostgreSQL & Realtime** for multi-device collaboration, cloud persistence, and live visitor inquiry management.

---

## 🌟 Key Features

- 🏛️ **Official PM SHRI & Kendriya Vidyalaya Branding**: Tri-color identity, PM SHRI emblem styling, official fonts, and responsive layout.
- ⚡ **Local-First & Zero Latency**: Instantaneous page loads and edits via browser cache with zero lag.
- ☁️ **Supabase Cloud Database & Realtime Sync**:
  - Live PostgreSQL database storage with Row-Level Security (RLS).
  - Instant WebSocket real-time broadcast across all open devices and tabs.
  - Automatic cloud capture of public contact queries and admission inquiries.
- 🔐 **Built-In Admin CMS Portal**:
  - Direct WYSIWYG management of School Info, Hero Stats, Principal Message, Announcements, Staff Directory, Gallery, and Downloadable Resources.
  - Granular website attribution controls (*"Website managed by..."* in footer).
  - Instant JSON backup download and seed data restore.
- 🖼️ **Native Google Drive Media Converter**:
  - Paste any standard Google Drive share link for photos or circular PDFs.
  - Automatically transforms links into high-speed direct embeds and responsive PDF lightbox viewers.
- 🌓 **Day / Dark Mode**: Seamless theme switching with persistent user preference.
- 📱 **100% Responsive**: Tailored for smartphones, tablets, laptops, and large interactive school boards.

---

## 🚀 1-Click Cloud Deployment

### Option 1: Deploy on Render (Free Static Site)

Deploy the portal to Render's global CDN in less than 60 seconds:

1. Fork or push this repository to your **GitHub** account.
2. Sign in to [Render.com](https://render.com).
3. Click **New +** &gt; **Blueprint** (or **Static Site**).
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Runtime**: Static
   - **Publish Directory**: `.`
   - **Single-Page Rewrites**: Enabled
6. Click **Apply** — your website is now live worldwide with free SSL!

---

### Option 2: Deploy to GitHub Pages (Automated)

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. Go to your repository on GitHub.
2. Navigate to **Settings** &gt; **Pages**.
3. Under **Build and deployment** &gt; **Source**, select **GitHub Actions**.
4. Push any commit to the `main` or `master` branch.
5. GitHub Actions will automatically publish the website to:
   ```
   https://<your-github-username>.github.io/<repository-name>/
   ```

---

## 🗄️ Supabase Setup (3 Quick Steps)

## 🚀 GitHub Upload & 1-Click Render Deployment

### Step 1: Upload to GitHub

Push this project to your GitHub account (sensitive credentials are automatically protected by `.gitignore`):

```bash
git init
git add .
git commit -m "feat: PM SHRI Kendriya Vidyalaya Portal with Supabase & Render integration"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

### Step 2: Set Up Free Supabase Database

1. Create a free account at [supabase.com](https://supabase.com) and click **New Project**.
2. Go to the **SQL Editor** from the left navigation bar, click **New Query**.
3. Copy and paste the complete contents of [`supabase_schema.sql`](supabase_schema.sql) and click **Run**.
4. Go to **Project Settings** &gt; **API** to copy:
   - **Project URL**: `https://<your-project-id>.supabase.co`
   - **anon public API Key**: `eyJhbGciOi...`

---

### Step 3: Deploy on Render with Environment Variables

Deploy the portal to Render with your credentials securely injected through environment variables:

1. Sign in to [Render.com](https://render.com).
2. Click **New +** &gt; **Web Service** (or **Blueprint** using `render.yaml`).
3. Connect your GitHub repository.
4. Render will automatically detect settings from `render.yaml` or you can set:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. In the **Environment Variables** section, add the following variables:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `SUPABASE_URL` | `https://<your-project-id>.supabase.co` | Your Supabase Project URL |
   | `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` | Your Supabase Anon Public API Key |
   | `ADMIN_USERNAME` | `admin` *(or custom username)* | Administrator login ID |
   | `ADMIN_PASSWORD` | `<your-secure-password>` | Master administrator password |

6. Click **Deploy Web Service**.
   - During build, Render automatically runs `build.js` which injects your configuration.
   - On boot, `server.js` starts the production HTTP server with SSL enabled worldwide!
   - Your portal is now live with zero manual browser setup required!

---

## 💻 Running Locally

### With PowerShell (Windows built-in — zero setup required)
Double-click `run_locally.bat` or run:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Open your browser at `http://localhost:8089`.

### With Local Environment Variables (.env)
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your Supabase URL, Anon Key, and Admin Password.
3. Run:
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Administrator Authentication

- **Master Credentials**: Configured securely via Render Environment Variables (`ADMIN_USERNAME` and `ADMIN_PASSWORD`).
- **Default Local Credentials**: `admin` / `kvs@2024` (when running locally without environment variables).
- **Security**: The admin password is never committed to GitHub.

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automated GitHub Pages CI/CD workflow
├── assets/
│   └── images/               # Logos, campus imagery, icons, banners
├── css/
│   └── style.css             # Main responsive stylesheet & design system
├── js/
│   ├── app.js                # UI controllers, dynamic renders & admin logic
│   ├── auth.js               # Admin authentication & session management
│   ├── config.js             # Optional global Supabase cloud config
│   ├── db.js                 # Local-first database layer & Supabase sync
│   └── seed-data.js          # Official default school seed content
├── .gitignore                # Git exclusions (OS files, cache, temp)
├── index.html                # Main semantic single-page application & CMS
├── LICENSE                   # MIT open-source license
├── package.json              # Scripts for Node.js / Render hosting
├── README.md                 # Complete documentation & deployment guide
├── render.yaml               # Render Infrastructure Blueprint specification
├── run_locally.bat           # 1-click Windows local launcher
├── server.ps1                # Lightweight PowerShell local HTTP server
└── supabase_schema.sql       # Production PostgreSQL schema & RLS policies
```

---

## 📄 License

Distributed under the [MIT License](LICENSE). Free for all Kendriya Vidyalayas, educational institutions, teachers, and developers to use, adapt, and deploy.
