# MediPredict — Hospital Management & Disease Risk Prediction System

**MediPredict** is an enterprise-grade, production-style MERN stack (MongoDB, Express.js, React + Vite, Node.js) web application projects. It integrates outpatient clinic workflows, electronic health records (EHR), automated appointment scheduling with double-booking prevention, digital printable prescriptions, laboratory test report tracking, and a modular educational disease risk prediction engine.

---

## 🌟 Key Features

### 👤 Role-Based Access Control (RBAC)
- **Patient Portal**: Profile management (allergies, DOB, emergency contacts, medical documents), doctor search & department filtering, appointment booking with visual slot availability, digital prescription viewing & printing, lab report downloads, educational symptom checker, and in-app notifications.
- **Doctor Portal**: Daily appointment queue, status workflow (Accept, Reject, Confirm, Mark Completed), patient clinical directory, EHR vitals entry (BP, HR, Temp, Weight, Height with auto-computed BMI), digital prescription generator, and lab test order requests.
- **Admin Dashboard**: Executive analytics (Recharts charts for monthly trends, department distribution, and appointment status ratios), full user management, doctor onboarding & schedule management, department catalog, pharmacy inventory management, disease & symptom knowledge base manager, and lab report publishing.

### 🧠 Educational Disease Risk Prediction Engine
- **Modular Architecture**: Isolated in `server/services/predictionService.js` to allow seamless future replacement with Python Machine Learning models (Scikit-Learn, PyTorch, FastAPI).
- **Weighted Rule & Scoring Algorithm**: Evaluates patient symptom inputs against symptom severity and disease knowledge bases. Calculates condition risk scores \(0.0 - 0.95\), matched symptoms, and clinical advice.
- **Decision-Support Disclaimer**: Displays mandatory warning: *"This prediction is for educational and decision-support purposes only and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice."*

### 🗓️ Double-Booking Prevention Engine
- Server-side validation enforcing that no doctor can be double-booked for the same date and time slot unless previous bookings were cancelled or rejected.

### 🖨️ Printable Digital Prescription (Rx)
- Dedicated print layout (`/prescriptions/:id/print`) featuring hospital branding, doctor credentials, patient demographics, vitals, itemized dosage instructions table, doctor advice, and browser print trigger (`window.print()`).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 with Vite |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons |
| **Data Visualization** | Recharts (Bar Charts, Pie Charts) |
| **API Client** | Axios (configured with Request Bearer Interceptor & Global Error Handler) |
| **Backend Framework** | Node.js with Express.js |
| **Database & ORM** | MongoDB with Mongoose Schema Models |
| **Security & Auth** | JWT (JSON Web Tokens), Bcryptjs Password Hashing, Helmet, CORS, Express Rate Limit |
| **File Storage** | Multer with Cloudinary integration & automatic Local Disk Fallback (`/uploads`) |

---

## 📂 Project Folder Structure

```
medipredict/
├── server/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection logic
│   │   └── cloudinary.js         # Multer file upload storage + fallback
│   ├── controllers/              # REST API controller handlers
│   │   ├── adminController.js
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── departmentController.js
│   │   ├── diseaseSymptomController.js
│   │   ├── doctorController.js
│   │   ├── labController.js
│   │   ├── medicalRecordController.js
│   │   ├── medicineController.js
│   │   ├── patientController.js
│   │   ├── predictionController.js
│   │   ├── prescriptionController.js
│   │   └── userController.js
│   ├── middleware/               # Auth verification, role authorization, error handling
│   ├── models/                   # 14 Mongoose Data Schemas
│   ├── routes/                   # Express REST route endpoints
│   ├── seed/                     # Seed data script (`seedData.js`)
│   ├── services/                 # Prediction service & notification engine
│   ├── utils/                    # JWT generator & API response formatters
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server application entry point
└── client/
    ├── public/
    ├── src/
    │   ├── components/           # Navbar, Sidebar, Footer, Modals, Badges, Charts, Spinners
    │   ├── context/              # AuthContext & NotificationContext
    │   ├── layouts/              # DashboardLayout & PublicLayout
    │   ├── pages/                # Landing, Auth, Patient, Doctor, Admin pages & Print view
    │   ├── services/             # Axios API client endpoints (`api.js`)
    │   ├── App.jsx               # React Router routes
    │   ├── index.css             # Tailwind imports & print styling
    │   └── main.jsx              # React app mounting
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB Community Edition (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.

---

### 2. Backend Setup
```bash
cd server

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Seed MongoDB database with demo dataset (Admin, Doctors, Patients, Departments, Medicines)
npm run seed

# Start development server
npm run dev
```
*Server will start running at `http://localhost:5000`*

---

### 3. Frontend Setup
```bash
cd client

# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev
```
*Frontend will start running at `http://localhost:5173`*

---

## 🔑 Demo Login Credentials

The login page (`/login`) includes **1-Click Quick Demo Login Buttons** for instant evaluation:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@medipredict.com` | `Admin@12345` | Complete system management, user control, analytics, department/pharmacy setup |
| **Doctor** | `doctor.sarah@medipredict.com` | `Doctor@12345` | Appointment queue, clinical encounters, EHR vitals, digital prescription, lab ordering |
| **Patient** | `john.doe@example.com` | `Patient@12345` | Appointment booking, symptom risk prediction, digital Rx viewing/printing, lab report downloads |

---

## 📖 B.Tech Final Year Viva & Architecture Guide

### 1. Database ER Relationship Explanation
- **User Model**: Primary identity table storing credentials, password hash (`bcrypt`), and role enum (`admin`, `doctor`, `patient`).
- **Patient & Doctor Models**: 1-to-1 extension references to `User`. Doctor belongs to a `Department`.
- **Appointment Model**: Relates `Patient`, `Doctor`, and `Department`. Uses compound indexing (`{ doctor: 1, appointmentDate: 1, timeSlot: 1 }`) for instant double-booking checks.
- **Medical Record & Prescription**: Linked to `Patient`, `Doctor`, and optionally `Appointment`.

### 2. Modular ML Engine Design
The prediction service (`server/services/predictionService.js`) exposes `predictDisease(symptomsSelected)`. It processes input vectors against weighted symptom matrices. To swap in a real Python Scikit-Learn/TensorFlow model:
1. Update `predictDisease()` to send an HTTP POST request to an external Python FastAPI endpoint (`http://localhost:8000/predict`).
2. Maintain the return payload schema (`condition`, `riskScore`, `matchedSymptoms`, `explanation`).
3. No changes will be required in the controller or frontend components!

---

## 🛠️ Troubleshooting & Common Fixes

1. **MongoDB Connection Refused**:
   - Ensure local MongoDB service is started (`net start MongoDB` on Windows or `mongod`).
   - Check `MONGO_URI` in `server/.env`.
2. **Cloudinary Upload Warning**:
   - If Cloudinary keys are empty in `.env`, the system automatically falls back to local disk storage (`server/uploads/`). Uploaded files will serve cleanly over HTTP.
3. **CORS Error**:
   - Verify `CLIENT_URL` in `server/.env` matches `http://localhost:5173`.
