# MediPredict — REST API Documentation & Postman Collection

All REST APIs return consistent JSON responses:
- **Success Response**: `{ "success": true, "message": "...", "data": { ... } }`
- **Error Response**: `{ "success": false, "message": "...", "error": "..." }`

---

## 1. Authentication APIs (`/api/auth`)

### POST `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Patient@12345",
  "phone": "+1 555-9988",
  "dob": "1992-08-14",
  "gender": "Female",
  "bloodGroup": "B+"
}
```
- **Response**: `{ "success": true, "message": "User registered successfully as Patient", "data": { "token": "JWT_TOKEN", ... } }`

### POST `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@medipredict.com",
  "password": "Admin@12345"
}
```

### GET `/api/auth/me`
- **Access**: Private (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Appointment APIs (`/api/appointments`)

### POST `/api/appointments`
- **Access**: Private (Patient)
- **Request Body**:
```json
{
  "doctorId": "66ce00000000000000000002",
  "departmentId": "66ce00000000000000000001",
  "appointmentDate": "2026-08-28",
  "timeSlot": "10:30 AM",
  "reason": "Chest tightness and routine cardiology consultation"
}
```

### GET `/api/appointments/booked-slots`
- **Access**: Public
- **Query Params**: `?doctorId=...&date=2026-08-28`

---

## 3. Disease Risk Prediction APIs (`/api/predictions`)

### POST `/api/predictions/predict`
- **Access**: Private (Patient)
- **Request Body**:
```json
{
  "symptoms": ["Fever", "Cough", "Body Pain", "Headache"]
}
```
- **Response Payload**:
```json
{
  "success": true,
  "message": "Disease risk assessment calculated",
  "data": {
    "predictionId": "66ce99990000000000000001",
    "symptomsSelected": ["Fever", "Cough", "Body Pain", "Headache"],
    "results": [
      {
        "condition": "Viral Influenza (Flu)",
        "riskScore": 0.78,
        "matchedSymptoms": ["Fever", "Cough", "Body Pain", "Headache"],
        "explanation": "Matched 4 out of 5 symptoms associated with Viral Influenza (Flu). Recommended precautions include: Rest and hydration; Isolate to prevent spread; Take OTC antipyretics.",
        "riskLevel": "Moderate",
        "recommendedAction": "Consult a primary physician if fever persists beyond 3 days."
      }
    ],
    "disclaimer": "This prediction is for educational and decision-support purposes only and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice."
  }
}
```

---

## 4. Digital Prescription APIs (`/api/prescriptions`)

### POST `/api/prescriptions`
- **Access**: Private (Doctor)
- **Request Body**:
```json
{
  "patientId": "66ce00000000000000000005",
  "diagnosis": "Acute Bronchial Asthma",
  "medicines": [
    {
      "name": "Amoxicillin 500mg",
      "dosage": "500mg",
      "frequency": "1-0-1 (After Meals)",
      "duration": "5 days",
      "instructions": "Take with warm water"
    }
  ],
  "additionalNotes": "Avoid cold beverages and ensure adequate bed rest."
}
```

---

## 5. Admin Analytics APIs (`/api/admin`)

### GET `/api/admin/analytics`
- **Access**: Private (Admin)
- **Returns**: Executive metric counters, department workforce statistics, appointment status ratios, and monthly growth trends.
