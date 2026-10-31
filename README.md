# VisionInsight AI 👁️⚡

**VisionInsight AI** is an enterprise-grade Computer Vision & Visual Intelligence platform built with a modern **3-Tier Multi-Cloud Architecture**:
- **Client System (`client/`)**: React 18 + Vite SPA configured for seamless **Vercel** deployment link up.
- **Server System (`server/`)**: Modular Node.js/Express API service with **Render** deployment blueprint (`render.yaml`).
- **Backend System (`backend/`)**: Relational PostgreSQL database & storage hosted on **Supabase**, with Row Level Security (RLS), `@supabase/supabase-js` administration, and **Google Gemini 2.5 Flash** multimodal vision engine.

---

## 🏛️ 3-Tier Multi-Cloud Architecture Overview

```
                                  +-----------------------------+
                                  |         USER BROWSER        |
                                  +--------------+--------------+
                                                 |
                                                 v
                      [ TIER 1: CLIENT SYSTEM (VERCEL DEPLOYMENT) ]
                      +------------------------------------------+
                      | React 18 + Vite + Tailwind CSS           |
                      | client/vercel.json (SPA Routing)         |
                      | client/src/services/supabaseClient.js    |
                      | client/.env (VITE_SUPABASE_ANON_KEY)     |
                      +-------------------+----------------------+
                                          |
                                          | HTTPS REST API Calls
                                          v
                      [ TIER 2: SERVER SYSTEM (RENDER WEB SERVICE) ]
                      +------------------------------------------+
                      | Express.js API Gateway & Controllers     |
                      | server/render.yaml (Render Deployment)   |
                      | Authentication & Logical User Scoping    |
                      | Gemini 2.5 Flash AI Vision Engine        |
                      +-------------------+----------------------+
                                          |
                      +-------------------+----------------------+
                      |                                          |
                      v                                          v
[ TIER 3: BACKEND SYSTEM (SUPABASE CLOUD) ]     [ GOOGLE GENAI GEMINI 2.5 FLASH ]
+-----------------------------------------+     +-------------------------------+
| - PostgreSQL Relational Database        |     | - Multimodal Object & Flaw    |
| - Transaction & Session Pooler (pg)     |     |   Detection                   |
| - Supabase Storage (inspection-images)  |     | - Strict JSON Schema Outputs  |
| - Row Level Security (RLS) Policies     |     | - Domain Inspection Prompts   |
| - Service Role Key & Anon Key Admin     |     +-------------------------------+
+-----------------------------------------+
```

---

## 📁 The 3 Distinct Systems

| System | Directory | Purpose | Deployment Target | Key Config Files |
|---|---|---|---|---|
| **Client** | `client/` | Frontend UI, inspection studio, interactive dashboard | **Vercel** | `client/vercel.json`<br/>`client/.env`<br/>`client/.env.supabase`<br/>`client/src/services/supabaseClient.js` |
| **Server** | `server/` | Express REST API server, routing, controllers, JWT auth | **Render** | `server/render.yaml`<br/>`server/.env`<br/>`server/server.js` |
| **Backend** | `backend/` | Supabase schema DDL, RLS policies, connection pooler, storage | **Supabase** & **Render** | `backend/supabase_schema.sql`<br/>`backend/config/supabase.js`<br/>`backend/.env.supabase`<br/>`backend/render.yaml` |

---

## ⚙️ Environment Variables (Separate per System)

### 1. Client Environment (`client/.env`) — Prepared for Vercel
```env
# 1. Render Backend URL (Connects Client to Render Web Service)
VITE_API_BASE_URL=https://visioninsight-backend.onrender.com/api

# 2. Supabase Client Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key_here
```

### 2. Server & Backend Environment (`server/.env` & `backend/.env`) — Prepared for Render
```env
PORT=5000
NODE_ENV=production

# 1. Supabase Service URL & Keys
SUPABASE_SERVICE_URL=https://your-project-id.supabase.co
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_role_key_here

# 2. Supabase PostgreSQL Connection Pooler (Port 6543) or Direct (Port 5432)
DATABASE_URL=postgresql://postgres.yourprojectid:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres

# 3. AI & Security Secrets
GEMINI_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=visioninsight_jwt_super_secret_key_2026_secure
FRONTEND_URL=https://visioninsight-client.vercel.app
CLIENT_URL=https://visioninsight-client.vercel.app
```

> **Where to find Supabase details:**
> See `backend/.env.supabase` or `client/.env.supabase` for exact step-by-step guidance on copying your **Project URL**, **Anon Key**, **Service Role Key**, and **Database Connection URI** from the Supabase Dashboard.

---

## 🚀 Step-by-Step Deployment Guide

### A. Setup Supabase Database (5 Minutes)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** tab from the left sidebar.
3. Open [`backend/supabase_schema.sql`](file:///c:/Users/aakas/New%20folder/backend/supabase_schema.sql) from this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
   - This creates `users`, `scans`, and `anomalies` tables.
   - Enables Row Level Security (RLS) with policies.
   - Creates the `inspection-images` public storage bucket.
4. Go to **Project Settings** -> **API**:
   - Copy **Project URL** -> `SUPABASE_SERVICE_URL` / `VITE_SUPABASE_URL`
   - Copy **anon public key** -> `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - Copy **service_role secret key** -> `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Project Settings** -> **Database**:
   - Copy the Connection String (URI format) -> `DATABASE_URL`

---

### B. Deploy Server / Backend to Render (3 Minutes)
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/):
   - Click **New +** -> **Blueprint**.
   - Select your GitHub repository.
   - Render will automatically detect [`render.yaml`](file:///c:/Users/aakas/New%20folder/render.yaml) or [`backend/render.yaml`](file:///c:/Users/aakas/New%20folder/backend/render.yaml).
3. Fill in your environment variables:
   - `DATABASE_URL` (Supabase connection string)
   - `SUPABASE_SERVICE_URL` (Supabase Project URL)
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (your Vercel URL, e.g. `https://visioninsight-client.vercel.app`)
4. Click **Apply**. Render will build and deploy your service at `https://visioninsight-backend.onrender.com`.

---

### C. Deploy Client to Vercel (2 Minutes)
1. In [Vercel Dashboard](https://vercel.com/dashboard):
   - Click **Add New...** -> **Project**.
   - Import your GitHub repository.
   - In **Root Directory**, click "Edit" and choose `client`.
2. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://visioninsight-backend.onrender.com/api` (your Render backend URL)
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
3. Click **Deploy**. Vercel will build the Vite app using [`client/vercel.json`](file:///c:/Users/aakas/New%20folder/client/vercel.json) with SPA clean URL rewrites!

---

## 💻 Local Development Commands

From the root directory:

The local Vite client defaults to `http://localhost:5000/api`; set `VITE_API_BASE_URL` to override it and restart Vite after changing the value. Authentication uses a bearer token in the `Authorization` header, not cross-origin cookies.

```bash
# 1. Run Client System (Vite)
npm run client
# Accessible on http://localhost:5173

# 2. Run Server System (Render target)
npm run server
# Accessible on http://localhost:5000

# 3. Run Backend System (Supabase target)
npm run backend
# Accessible on http://localhost:5000

# 4. Run Automated Integration Verification
npm test
```

---

## 📡 REST API & Health Check

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | `GET` | Returns status, Render hosting detection, Gemini model, and Supabase config status |
| `/api/health/supabase` | `GET` | Actively probes connectivity to the Supabase database |
| `/api/auth/register` | `POST` | Registers new operator with bcrypt password hash |
| `/api/auth/login` | `POST` | Authenticates and returns signed JWT token |
| `/api/auth/me` | `GET` | Returns authenticated user profile |
| `/api/scans/analyze` | `POST` | Multimodal AI vision analysis with Gemini 2.5 Flash & Supabase storage |
| `/api/scans` | `GET` | Paginated scans for authenticated user (isolated via JWT `user_id`) |
| `/api/scans/:id` | `GET` | Detailed scan analysis and categorized anomalies |
| `/api/scans/:id` | `DELETE` | Cascade delete scan and associated anomalies |
| `/api/dashboard/metrics` | `GET` | Aggregate KPIs (Total Scans, Critical Threats, Domain breakdown) |
