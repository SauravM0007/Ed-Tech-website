# Deploy Study Notion on Vercel

This project uses **two Vercel projects**: one for the React frontend (`client/`) and one for the Express API (`server/`).

## Prerequisites

1. [Vercel account](https://vercel.com)
2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)
3. [Cloudinary](https://cloudinary.com) account (required for file uploads on Vercel)
4. GitHub repo pushed with this code

---

## Step 1 — Deploy the backend

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. **Root Directory:** set to `server` (Project Settings → General → Root Directory).
3. **Framework Preset:** Other (Vercel detects `api/index.js` automatically).
4. Add **Environment Variables** (Settings → Environment Variables). Copy from `server/.env.example` and fill in real values:

   | Variable | Notes |
   |----------|--------|
   | `MONGODB_URL` | Atlas connection string |
   | `JWT_SECRET` | Strong random string |
   | `CLOUD_NAME`, `API_KEY`, `API_SECRET` | Cloudinary |
   | `RAZORPAY_KEY`, `RAZORPAY_SECRET` | If using payments |
   | `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` | For OTP / reset emails |
   | `CLIENT_URL` | Your frontend URL (add after Step 2) |
   | `BASE_URL` | This backend’s Vercel URL, e.g. `https://study-notion-api.vercel.app` |

5. Deploy. Copy the production URL (e.g. `https://study-notion-api.vercel.app`).
6. Test: open `https://<your-backend-url>/` — you should see the JSON “server is up” message.

---

## Step 2 — Deploy the frontend

1. Create a **second** Vercel project from the same repo.
2. **Root Directory:** set to `client`.
3. **Framework Preset:** Create React App (auto-detected).
4. Add environment variable:

   | Variable | Value |
   |----------|--------|
   | `REACT_APP_BASE_URL` | `https://<your-backend-url>/api/v1` |

5. Deploy. Copy the frontend URL (e.g. `https://study-notion.vercel.app`).

---

## Step 3 — Link frontend and backend

1. In the **backend** Vercel project, set `CLIENT_URL` to your frontend URL (e.g. `https://study-notion.vercel.app`).
2. Redeploy the backend so CORS and password-reset emails use the correct origin.
3. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (or Vercel’s IP ranges) so serverless functions can connect.

---

## Local development

**Backend** (`server/`):

```bash
cd server
cp .env.example .env
# Edit .env with local values
npm install
npm run dev
```

Runs on `http://localhost:4000`.

**Frontend** (`client/`):

```bash
cd client
cp .env.example .env
# REACT_APP_BASE_URL=http://localhost:4000/api/v1
npm install
npm start
```

Runs on `http://localhost:3000`.

---

## Important notes

- **File uploads:** Vercel serverless has no persistent disk. Configure Cloudinary; local `/uploads` only works locally.
- **Cookies / auth:** `withCredentials: true` is enabled; `CLIENT_URL` must exactly match your frontend origin (no trailing slash).
- **Razorpay:** Add your production frontend URL in the Razorpay dashboard allowed origins if required.

---

## Optional — deploy via CLI

```bash
npm i -g vercel

# Backend
cd server
vercel
vercel --prod

# Frontend
cd ../client
vercel
vercel --prod
```

Set environment variables in the Vercel dashboard or with `vercel env add`.
