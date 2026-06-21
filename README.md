# Royal Pharmacy Management System 🧪

A premium MERN (MongoDB, Express.js, React, Node.js) stack web application designed for pharmaceutical distributors and retail pharmacies. The system facilitates role-based directory management, payment tracking, return ledgers, automated auditing reports, and secure email-based OTP recovery.

---

## 🎨 Design & Aesthetics
* **Glassmorphic UI**: Translucent panels (`backdrop-blur-xl`) with soft ring glows and responsive shadows.
* **Modern Themes**: High-contrast, brand-aligned emerald-slate palettes supporting instant **Light** and **Dark** modes.
* **Interactive Elements**: Micro-animations, ambient card hovers, and clean circular icon wrappers for action keys.
* **Custom Backgrounds**: Ultra-premium minimal slate-emerald gradient background grids.

---

## 🚀 Key Features

* **Product Returns Management**: A 9-column ledger tracking regular returned quantities (`QTY`) and bonus returned quantities (`BONUS`) side-by-side.
* **Clearance Ledgers**: Fully audited registers for **Cash Payments Collection** and **Cheques Clearance Management** (recording bank name, cheque number, status, and amounts).
* **Master Directories**: Complete CRUD directories for **Pharmacies** (enforcing strict 10-digit contact numbers), **Products** (inventory catalog and pricing), and **Reasons for Returns**.
* **Advanced Autocomplete Search**: Dynamic, pre-fetched multi-select and single-select autocomplete boxes for instant product, pharmacy, and reason selection.
* **Email OTP Recovery**: Secure password reset using a 6-digit OTP code sent directly to the user's registered email address via Mailersend transactional email API.
* **Document Exports & Reporting**: One-click generation of professional branded PDF reports, direct print views, and downloadable Excel spreadsheets.
* **Security & Isolation**: JWT token authorization, complete user-based data isolation, and cascading account deletion (automatically scrubs cash entries, cheques, returns, pharmacies, and products linked to a deleted profile).

---

## 💻 Tech Stack

### Frontend
- **React.js** (Vite bundler)
- **Tailwind CSS** (Carbon & Emerald theme configurations)
- **Lucide Icons** (UI vector indicators)
- **jsPDF & AutoTable** (Branded PDF exports and layouts)
- **SheetJS (xlsx)** (Structured Excel sheets)
- **Axios** (API requests with 401 interceptors)

### Backend
- **Node.js & Express.js** (REST API)
- **MongoDB & Mongoose** (NoSQL modeling & schemas)
- **JSON Web Tokens (JWT)** (Secure authentication sessions)
- **Mailersend** (Transactional email OTP delivery)
- **Multer** (Profile photo uploads)

---

## ⚙️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas URI)

### 1. Clone & Configure Environment
In the server directory, create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
MAILERSEND_API_KEY=your_mailersend_api_key
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Run Development Server
```bash
# Backend (from server folder)
npm run dev

# Frontend (from client folder)
npm run dev
```

Frontend runs on **`http://localhost:3050`** and backend API on **`http://localhost:5000`**.

---

## 🌐 Live Demo
- **Frontend**: [https://web-based-royal-pharmacy-system.vercel.app](https://web-based-royal-pharmacy-system.vercel.app)
- **Backend**: [https://web-based-royal-pharmacy-system.onrender.com](https://web-based-royal-pharmacy-system.onrender.com)

---

## 🧪 Testing
Run automated integration tests:
```bash
node test_delete_account.js
```
