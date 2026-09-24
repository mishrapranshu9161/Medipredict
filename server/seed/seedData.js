const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Medicine = require('../models/Medicine');
const Symptom = require('../models/Symptom');
const Disease = require('../models/Disease');
const LabTest = require('../models/LabTest');
const Appointment = require('../models/Appointment');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medipredict');
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Department.deleteMany();
    await Medicine.deleteMany();
    await Symptom.deleteMany();
    await Disease.deleteMany();
    await LabTest.deleteMany();
    await Appointment.deleteMany();

    console.log('Cleared existing collections...');

    // 1. Seed Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@medipredict.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      phone: '+1 800-555-0199',
      isActive: true
    });
    console.log(`Admin created: ${adminUser.email}`);

    // 2. Seed Departments
    const cardoDept = await Department.create({
      name: 'Cardiology',
      code: 'CARD',
      description: 'Comprehensive cardiovascular disease diagnosis, interventional cardiology, and heart care.',
      icon: 'Heart'
    });

    const neuroDept = await Department.create({
      name: 'Neurology',
      code: 'NEUR',
      description: 'Advanced brain, spine, nervous system treatment, and neuro-rehabilitation.',
      icon: 'Brain'
    });

    const pediaDept = await Department.create({
      name: 'Pediatrics',
      code: 'PED',
      description: 'Specialized healthcare and growth management for infants, children, and adolescents.',
      icon: 'Baby'
    });

    const genDept = await Department.create({
      name: 'General Medicine',
      code: 'GEN',
      description: 'Primary care, diagnostic evaluation, preventive healthcare, and chronic condition management.',
      icon: 'Activity'
    });

    console.log('Departments created...');

    // 3. Seed Doctors
    const doc1User = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'doctor.sarah@medipredict.com',
      password: 'Doctor@12345',
      role: 'doctor',
      phone: '+1 555-0101'
    });
    const doc1 = await Doctor.create({
      user: doc1User._id,
      department: cardoDept._id,
      qualification: 'MBBS, MD (Cardiology)',
      specialization: 'Senior Interventional Cardiologist',
      experienceYears: 14,
      consultationFee: 800,
      bio: 'Dr. Sarah Jenkins is a renowned cardiologist specializing in preventive heart health and arterial care.'
    });

    const doc2User = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'doctor.rajesh@medipredict.com',
      password: 'Doctor@12345',
      role: 'doctor',
      phone: '+1 555-0102'
    });
    const doc2 = await Doctor.create({
      user: doc2User._id,
      department: genDept._id,
      qualification: 'MBBS, MD (Internal Medicine)',
      specialization: 'General Physician & Infectious Disease Expert',
      experienceYears: 10,
      consultationFee: 500,
      bio: 'Dr. Rajesh Sharma specializes in diagnostic pathology, fever evaluation, and metabolic disorders.'
    });

    const doc3User = await User.create({
      name: 'Dr. Emily Carter',
      email: 'doctor.emily@medipredict.com',
      password: 'Doctor@12345',
      role: 'doctor',
      phone: '+1 555-0103'
    });
    const doc3 = await Doctor.create({
      user: doc3User._id,
      department: neuroDept._id,
      qualification: 'MBBS, DM (Neurology)',
      specialization: 'Neurologist & Migraine Consultant',
      experienceYears: 12,
      consultationFee: 750,
      bio: 'Specialist in headache disorders, epilepsy management, and cognitive neurology.'
    });

    // Update department head doctors
    cardoDept.headDoctor = doc1._id;
    await cardoDept.save();
    genDept.headDoctor = doc2._id;
    await genDept.save();
    neuroDept.headDoctor = doc3._id;
    await neuroDept.save();

    console.log('Doctors created...');

    // 4. Seed Patients
    const pat1User = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Patient@12345',
      role: 'patient',
      phone: '+1 555-0201'
    });
    const pat1 = await Patient.create({
      user: pat1User._id,
      dob: new Date('1990-05-15'),
      gender: 'Male',
      bloodGroup: 'O+',
      address: { street: '123 Health Ave', city: 'Metropolis', state: 'NY', zipCode: '10001' },
      allergies: ['Penicillin'],
      existingConditions: ['Mild Asthma']
    });

    const pat2User = await User.create({
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      password: 'Patient@12345',
      role: 'patient',
      phone: '+1 555-0202'
    });
    const pat2 = await Patient.create({
      user: pat2User._id,
      dob: new Date('1995-09-22'),
      gender: 'Female',
      bloodGroup: 'A+',
      address: { street: '456 Wellness Blvd', city: 'Star City', state: 'CA', zipCode: '90210' },
      allergies: ['Peanuts'],
      existingConditions: []
    });

    console.log('Patients created...');

    // 5. Seed Medicines
    await Medicine.create([
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Antipyretic', strength: '500mg', stock: 500, status: 'Available' },
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', strength: '500mg', stock: 250, status: 'Available' },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine Dihydrochloride', category: 'Antihistamine', strength: '10mg', stock: 400, status: 'Available' },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Analgesic', strength: '400mg', stock: 350, status: 'Available' },
      { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Antacid', strength: '40mg', stock: 300, status: 'Available' },
      { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Cardiovascular', strength: '10mg', stock: 200, status: 'Available' },
      { name: 'Multivitamin Complex', genericName: 'Vitamin A-Z + Zinc', category: 'Vitamin/Supplement', strength: '1 Tablet', stock: 600, status: 'Available' }
    ]);
    console.log('Medicines created...');

    // 6. Seed Symptoms
    const symptomsList = await Symptom.create([
      { name: 'Fever', category: 'General', severity: 'Moderate', description: 'Elevated body temperature above 98.6°F' },
      { name: 'Cough', category: 'Respiratory', severity: 'Moderate', description: 'Dry or productive chest cough' },
      { name: 'Fatigue', category: 'General', severity: 'Mild', description: 'Feeling over-tired or lacking energy' },
      { name: 'Headache', category: 'Neurological', severity: 'Moderate', description: 'Pain or throbbing in the head or temples' },
      { name: 'Body Pain', category: 'Musculoskeletal', severity: 'Moderate', description: 'Generalized muscle aches and soreness' },
      { name: 'Sore Throat', category: 'Respiratory', severity: 'Mild', description: 'Irritation or pain in the throat' },
      { name: 'Nausea', category: 'Gastrointestinal', severity: 'Mild', description: 'Feeling of sickness with an inclination to vomit' },
      { name: 'Vomiting', category: 'Gastrointestinal', severity: 'Severe', description: 'Involuntary ejection of stomach contents' },
      { name: 'Diarrhea', category: 'Gastrointestinal', severity: 'Moderate', description: 'Frequent, loose, or watery bowel movements' },
      { name: 'Shortness of Breath', category: 'Respiratory', severity: 'Severe', description: 'Difficulty breathing or feeling breathless' },
      { name: 'Chest Pain', category: 'Cardiovascular', severity: 'Severe', description: 'Pressure, tightness, or pain in the chest area' },
      { name: 'Skin Rash', category: 'Dermatological', severity: 'Mild', description: 'Noticeable change in skin color or texture' },
      { name: 'Dizziness', category: 'Neurological', severity: 'Moderate', description: 'Feeling lightheaded, unsteady, or faint' },
      { name: 'Abdominal Pain', category: 'Gastrointestinal', severity: 'Moderate', description: 'Cramping or pain in the stomach region' }
    ]);
    console.log('Symptoms created...');

    // Map symptoms by name for disease binding
    const symMap = {};
    symptomsList.forEach(s => { symMap[s.name] = s._id; });

    // 7. Seed Diseases
    await Disease.create([
      {
        name: 'Viral Influenza (Flu)',
        category: 'Respiratory Infection',
        riskLevel: 'Moderate',
        description: 'Contagious respiratory illness caused by influenza viruses.',
        symptoms: [
          { symptom: symMap['Fever'], name: 'Fever', weight: 1.5 },
          { symptom: symMap['Cough'], name: 'Cough', weight: 1.2 },
          { symptom: symMap['Fatigue'], name: 'Fatigue', weight: 1.0 },
          { symptom: symMap['Body Pain'], name: 'Body Pain', weight: 1.3 },
          { symptom: symMap['Headache'], name: 'Headache', weight: 1.0 }
        ],
        precautions: ['Rest and hydration', 'Isolate to prevent spread', 'Take OTC antipyretics'],
        recommendedAction: 'Consult a primary physician if fever persists beyond 3 days.'
      },
      {
        name: 'Acute Gastroenteritis',
        category: 'Gastrointestinal',
        riskLevel: 'Moderate',
        description: 'Inflammation of the stomach and intestines caused by viral or bacterial infection.',
        symptoms: [
          { symptom: symMap['Nausea'], name: 'Nausea', weight: 1.2 },
          { symptom: symMap['Vomiting'], name: 'Vomiting', weight: 1.5 },
          { symptom: symMap['Diarrhea'], name: 'Diarrhea', weight: 1.6 },
          { symptom: symMap['Abdominal Pain'], name: 'Abdominal Pain', weight: 1.3 }
        ],
        precautions: ['Oral Rehydration Solution (ORS)', 'Avoid solid dairy food', 'Maintain hygiene'],
        recommendedAction: 'Seek immediate care if signs of dehydration occur.'
      },
      {
        name: 'Hypertension / Cardiac Distress Risk',
        category: 'Cardiovascular',
        riskLevel: 'High',
        description: 'Elevated cardiovascular risk requiring immediate clinical evaluation.',
        symptoms: [
          { symptom: symMap['Chest Pain'], name: 'Chest Pain', weight: 2.0 },
          { symptom: symMap['Shortness of Breath'], name: 'Shortness of Breath', weight: 1.8 },
          { symptom: symMap['Dizziness'], name: 'Dizziness', weight: 1.4 },
          { symptom: symMap['Fatigue'], name: 'Fatigue', weight: 1.0 }
        ],
        precautions: ['Avoid physical exertion', 'Sit upright', 'Avoid salt and caffeine'],
        recommendedAction: 'URGENT: Consult a cardiologist or visit emergency department immediately.'
      },
      {
        name: 'Acute Migraine Headache',
        category: 'Neurological',
        riskLevel: 'Moderate',
        description: 'Neurological condition causing throbbing headache, sensitivity, and nausea.',
        symptoms: [
          { symptom: symMap['Headache'], name: 'Headache', weight: 2.0 },
          { symptom: symMap['Nausea'], name: 'Nausea', weight: 1.3 },
          { symptom: symMap['Dizziness'], name: 'Dizziness', weight: 1.2 }
        ],
        precautions: ['Rest in a quiet, dark room', 'Cold compress on forehead', 'Hydration'],
        recommendedAction: 'Consult a neurologist for chronic headache evaluation.'
      }
    ]);
    console.log('Diseases created...');

    // 8. Seed Lab Tests
    await LabTest.create([
      { testName: 'Complete Blood Count (CBC)', category: 'Hematology', description: 'Evaluates overall health and detects infection or anemia.', price: 450, normalRange: 'WBC: 4.5-11.0 k/uL, Hb: 13.5-17.5 g/dL', unit: 'Standard' },
      { testName: 'Lipid Profile Panel', category: 'Biochemistry', description: 'Measures cholesterol and triglyceride levels to assess heart health.', price: 750, normalRange: 'Total Chol: < 200 mg/dL', unit: 'mg/dL' },
      { testName: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', description: 'Measures blood glucose concentration after fasting.', price: 250, normalRange: '70 - 99 mg/dL', unit: 'mg/dL' },
      { testName: 'Thyroid Stimulating Hormone (TSH)', category: 'Immunology', description: 'Assesses thyroid gland activity and metabolic regulation.', price: 600, normalRange: '0.4 - 4.0 mIU/L', unit: 'mIU/L' }
    ]);
    console.log('Lab Tests created...');

    // 9. Seed Sample Appointment
    const todayStr = new Date().toISOString().split('T')[0];
    await Appointment.create({
      patient: pat1._id,
      doctor: doc2._id,
      department: genDept._id,
      appointmentDate: todayStr,
      timeSlot: '10:00 AM',
      status: 'Confirmed',
      reason: 'Routine health checkup and fever monitoring.'
    });

    console.log('\n=============================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Default Admin Account:');
    console.log(`Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@medipredict.com'}`);
    console.log(`Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345'}`);
    console.log('Demo Doctor Account: doctor.sarah@medipredict.com / Doctor@12345');
    console.log('Demo Patient Account: john.doe@example.com / Patient@12345');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
