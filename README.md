# Secure Cloud EHR Sharing System

JWT Authentication + AES Encryption + ABE Access Control

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

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

## Demo Credentials

| Role           | Email                  | Password   |
|----------------|------------------------|------------|
| Admin          | admin@hospital.com     | admin123   |
| Doctor         | doctor@hospital.com    | doctor123  |
| Nurse          | nurse@hospital.com     | nurse123   |
| Lab Technician | lab@hospital.com       | lab123     |

## Security Features

- **JWT Authentication** — All API requests require a valid JWT token
- **AES-256 Encryption** — Medical report files are encrypted before storage
- **ABE Access Control** — Attribute-based policies control record access
  - Example policy: `role=doctor AND department=Cardiology`
  - If attributes don't match: "Access Denied – Attribute Policy Not Satisfied"
- **Password Hashing** — bcrypt with salt rounds

## Role Permissions

| Feature              | Admin | Doctor | Nurse | Lab Tech |
|----------------------|-------|--------|-------|----------|
| Upload Reports       | ✓     | ✗      | ✗     | ✓        |
| View Reports         | ✓     | ✓      | ✗     | ✓        |
| Download Reports     | ✓     | ✓      | ✗     | ✗        |
| Add Diagnosis        | ✗     | ✓      | ✗     | ✗        |
| View Medications     | ✓     | ✓      | ✓     | ✗        |
| Manage Users         | ✓     | ✗      | ✗     | ✗        |
| View Activity Logs   | ✓     | ✗      | ✗     | ✗        |
