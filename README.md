# 🔐 Secure Cloud EHR Sharing System

A full-stack Electronic Health Record (EHR) platform that lets hospital staff securely upload, share, and access patient medical records — protected with JWT authentication, AES-256 encryption, and Attribute-Based Access Control (ABE).

**Live demo:** [ehr-tawny.vercel.app](https://ehr-tawny.vercel.app)

---

## ✨ Features

- **Role-based dashboards** for Admin, Doctor, Nurse, and Lab Technician
- **JWT authentication** — every API request requires a valid token
- **AES-256 encryption** for medical report files before storage
- **Attribute-Based Access Control (ABAC)** — records are gated by policies like `role=doctor AND department=Cardiology`
- **bcrypt password hashing** with salt rounds
- **Activity logging** for admin oversight

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js, Express |
| Database | MongoDB |
| Auth | JWT, bcrypt |
| Encryption | AES-256, Attribute-Based Access Control |

---

## 📁 Project Structure

```
EHR/
├── backend/          # Express API, auth, encryption, DB models
├── frontend/         # React (Vite) client
├── .gitignore
└── package-lock.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB running locally on port `27017` (or a MongoDB Atlas connection string)

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed      # Seeds demo users and patients
npm run dev       # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

### Environment Variables

Create a `.env` file inside `backend/` with at least:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ehr
JWT_SECRET=your_jwt_secret
AES_SECRET_KEY=your_aes_key
```

And in `frontend/`, point the client at your API:

```env
VITE_API_URL=http://localhost:5000
```

---

## 👤 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@hospital.com | admin123 |
| Doctor | doctor@hospital.com | doctor123 |
| Nurse | nurse@hospital.com | nurse123 |
| Lab Technician | lab@hospital.com | lab123 |

---

## 🔒 Security Features

- **JWT Authentication** — all API requests require a valid token
- **AES-256 Encryption** — medical report files are encrypted before storage
- **ABE Access Control** — attribute-based policies control record access
  - Example policy: `role=doctor AND department=Cardiology`
  - Mismatched attributes return: `Access Denied – Attribute Policy Not Satisfied`
- **Password Hashing** — bcrypt with salt rounds

---

## 🧑‍⚕️ Role Permissions

| Feature | Admin | Doctor | Nurse | Lab Tech |
|---|:---:|:---:|:---:|:---:|
| Upload Reports | ✅ | ❌ | ❌ | ✅ |
| View Reports | ✅ | ✅ | ❌ | ✅ |
| Download Reports | ✅ | ✅ | ❌ | ❌ |
| Add Diagnosis | ❌ | ✅ | ❌ | ❌ |
| View Medications | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| View Activity Logs | ✅ | ❌ | ❌ | ❌ |

---

## ☁️ Deployment

This project ships as two independent services:

- **Frontend (`frontend/`)** → deploy to **Vercel**
  - Set **Root Directory** to `frontend` in your Vercel project settings
  - Add a `vercel.json` inside `frontend/` for SPA routing:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```
  - Set `VITE_API_URL` as an environment variable pointing to your deployed backend

- **Backend (`backend/`)** → deploy to **Render** (or Railway/Fly.io)
  - Build command: `npm install`
  - Start command: `npm start` (or `npm run dev` equivalent for production)
  - Add environment variables: `MONGO_URI`, `JWT_SECRET`, `AES_SECRET_KEY`
  - Enable CORS for your Vercel frontend domain

- **Database** → use **MongoDB Atlas** (free tier) instead of a local instance for production

> Vercel is well suited for the static/React frontend, but the Express + MongoDB backend runs better as a persistent Node service on Render rather than Vercel's serverless functions — especially given file uploads and encryption workloads.

---

