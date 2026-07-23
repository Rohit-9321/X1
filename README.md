# X1 — Company Placement Preparation Platform

A production-ready full-stack placement prep platform built for 50,000+ Indian college students.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite · Tailwind CSS · Redux Toolkit · React Query · Framer Motion · Monaco Editor · Recharts |
| Backend | Node.js · Express.js · JWT · Passport.js (Google/GitHub OAuth) |
| Database | MongoDB Atlas · Mongoose |
| Storage | Cloudinary |
| Code Execution | Judge0 API (via RapidAPI) |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| AI | Groq (Llama 3.3 70B Versatile) |
| Deploy | Frontend → Vercel · Backend → Render/EC2 · DB → MongoDB Atlas |

---

## 📁 Project Structure

```
x1/
├── backend/
│   ├── config/          # Passport, Cloudinary config
│   ├── controllers/     # Auth, Company, Question, Coding, Payment, Analytics, AI
│   ├── middleware/      # Auth, Error, Subscription guard
│   ├── models/          # 14 Mongoose schemas
│   ├── routes/          # 14 route files
│   ├── utils/           # JWT, Email, Gamification helpers
│   └── server.js        # Express entry point
└── frontend/
    ├── src/
    │   ├── api/         # Axios instance + all API helpers
    │   ├── components/  # Layout (Student/Admin sidebar)
    │   ├── pages/
    │   │   ├── auth/    # Login, Signup, OAuth, Reset Password
    │   │   ├── student/ # Dashboard, Practice, Coding, Tests, Analytics, AI Coach, Leaderboard…
    │   │   └── admin/   # Dashboard, Companies, Questions, Coding, Tests, Notes, Users, Payments
    │   ├── store/       # Redux (authSlice)
    │   └── App.jsx      # Routes with role-based guards
    └── dist/            # Production build (ready to deploy)
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- RapidAPI account (Judge0)
- Razorpay account
- Groq API key

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env    # Fill in your credentials

# Frontend
cd ../frontend
npm install
cp .env.example .env    # Set VITE_API_URL
```

### 2. Configure `.env` (Backend)

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=...

GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

CLIENT_URL=http://localhost:5173
```

### 3. Configure `.env` (Frontend)

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit: http://localhost:5173

---

## 👤 User Roles

| Role | Access |
|---|---|
| **Student** | Browse companies, practice questions, code, take tests, view analytics, AI coach |
| **Admin** | All student access + manage companies, questions, coding problems, tests, notes, view users |
| **Super Admin** | All admin access + create/delete admins, full platform analytics, revenue data |

### Create First Super Admin

Use MongoDB Compass or Atlas to manually set a user's `role` to `superadmin`:
```js
db.users.updateOne({ email: "you@email.com" }, { $set: { role: "superadmin" } })
```

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/auth/verify-email/:token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
PUT    /api/auth/change-password
GET    /api/auth/google          (OAuth)
GET    /api/auth/github          (OAuth)
```

### Companies
```
GET    /api/companies
GET    /api/companies/:slug
POST   /api/companies            (admin)
PUT    /api/companies/:id        (admin)
DELETE /api/companies/:id        (admin)
```

### Questions / Practice
```
GET    /api/questions
GET    /api/questions/:id
POST   /api/questions/submit     (answer MCQ)
POST   /api/questions            (admin)
POST   /api/questions/bulk       (admin)
```

### Coding
```
GET    /api/coding
GET    /api/coding/:slug
POST   /api/coding/run
POST   /api/coding/submit
GET    /api/coding/:id/submissions
```

### Payments
```
POST   /api/payments/create-order
POST   /api/payments/verify
GET    /api/payments/my-payments
POST   /api/payments/webhook
```

### Analytics
```
GET    /api/analytics/me
GET    /api/analytics/admin      (admin)
```

### AI
```
POST   /api/ai/doubt
POST   /api/ai/study-plan
```

### Leaderboard
```
GET    /api/leaderboard?period=daily|weekly|monthly|alltime
```

---

## 💳 Subscription Plans

| Plan | Price | Access |
|---|---|---|
| Free | ₹0 | Limited questions + 1 mock/week |
| Single Company | ₹199–499 | One company's full track |
| 3-Company Bundle | ₹999 | Any 3 company packs |
| Premium | ₹1,999–4,999 | All companies + AI Coach + Coding platform |

---

## 🎮 Gamification

- **XP System**: Earn XP for solving questions (+10), coding accepted (+50), tests (+30), daily streak (+20)
- **Levels**: 1–100 based on cumulative XP
- **Streak**: Consecutive daily activity tracking
- **Placement Score**: 0–100 composite score based on aptitude, coding, communication, test performance

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend → Render
1. Connect GitHub repo
2. Set environment variables in Render dashboard
3. Build command: `npm install`
4. Start command: `node server.js`

### Backend → AWS EC2
```bash
# On EC2 (Ubuntu)
sudo apt update && sudo apt install nodejs npm nginx -y
cd /home/ubuntu && git clone your-repo
cd x1/backend && npm install
npm install -g pm2
pm2 start server.js --name x1-backend
pm2 startup && pm2 save

# Nginx config
sudo nano /etc/nginx/sites-available/x1
# proxy_pass http://localhost:5000;
sudo systemctl restart nginx
```

---

## 📊 Database Models

| Model | Purpose |
|---|---|
| User | Auth, roles, subscription, XP, stats |
| Company | Company tracks with pricing |
| Topic | Topics within company tracks |
| Question | MCQ with options, explanation, tags |
| CodingProblem | LeetCode-style problems with test cases |
| Submission | Code submission results via Judge0 |
| MockTest | Timed tests linked to companies |
| TestResult | Detailed test analysis per user |
| Note | PDFs, videos, YouTube resources |
| UserProgress | Per-topic accuracy tracking |
| DailyActivity | Streak and activity heatmap |
| Payment | Razorpay orders and verification |
| Bookmark | Saved questions/problems/notes |
| Badge | Gamification achievement system |

---

## 🔐 Security Features

- JWT + HttpOnly cookies
- Bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min)
- Helmet security headers
- CORS with allowlist
- Input validation via express-validator
- Role-based access control (RBAC)
- Razorpay webhook signature verification
- Subscription guard middleware

---

Built with ❤️ for India's placement warriors.
