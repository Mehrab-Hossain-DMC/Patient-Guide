import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Stethoscope, Info, ArrowLeft, Navigation, 
  Activity, ChevronRight, X, Building, DollarSign, FileText,
  Phone, BedDouble, Droplet, Heart, AlertCircle,
  Moon, Sun, Loader2, MicOff, Mic, Target, ChevronDown, LogOut,
  Home, Receipt, Settings as SettingsIcon, Bug, HelpCircle, Send, CheckCircle2,
  FileSearch, Sparkles, HeartHandshake, ExternalLink
} from 'lucide-react';

// --- FALLBACK DATABASE ---
const FALLBACK_SERVICES_DB = [
  { id: 1001, name_en: 'X-Ray Chest', name_bn: 'বুকের এক্স-রে', cost: 200, department: 'CR Digital X-Ray', building: 'Radiology and Imaging Department', room: '101', floor: 'Ground', color: 'border-blue-500' },
  { id: 2004, name_en: 'Therapeutic Exercise', name_bn: 'ব্যায়াম থেরাপি', cost: 35, department: 'Exercise Therapy', building: 'Physical Medicine and Rehabilitation', room: 'Physio Hall', floor: '1st', color: 'border-emerald-500' },
  { id: 3001, name_en: 'TC, DC, ESR, HB% (Combinedly)', name_bn: 'সি.বি.সি (রক্ত পরীক্ষা)', cost: 150, department: 'Hematology', building: 'Clinical Pathology Department', room: 'Sample Collection', floor: '2nd', color: 'border-purple-500' },
  { id: 4001, name_en: 'Large Tissue Biopsy', name_bn: 'টিস্যু বায়োপসি', cost: 300, department: 'Pathology', building: 'College Building', room: 'Lab 201', floor: '2nd', color: 'border-orange-500' },
  { id: 5001, name_en: 'Thyroid Scan (TC-99m)', name_bn: 'থাইরয়েড স্ক্যান', cost: 500, department: 'Scintigraphy', building: 'INMAS Dhaka (Nuclear Building)', room: 'Nuclear Med', floor: 'Ground', color: 'border-red-500' },
];

const DEPARTMENTS_DB = [
  { 
    id: 'dep1', name_en: 'Medicine', name_bn: 'মেডিসিন বিভাগ', keywords: ['fever', 'headache', 'pain', 'weakness', 'vomiting', 'জ্বর', 'মাথা ব্যথা', 'ব্যথা'], 
    room: '301', floor: '3rd', ward: 'Ward 10, 11', contact: '01711-000000',
    admission_instr: 'Buy a ticket from counter 5 (Tk 10). Go to Room 301 for primary assessment. If admission is advised, get signature from Registrar.',
    admission_instr_bn: 'কাউন্টার ৫ থেকে ১০ টাকার টিকেট কিনুন। রুম ৩০১ এ যান। ডাক্তার ভর্তি দিলে রেজিস্ট্রারের স্বাক্ষর নিন।'
  },
  { 
    id: 'dep2', name_en: 'Surgery', name_bn: 'সার্জারি বিভাগ', keywords: ['cut', 'blood', 'accident', 'appendicitis', 'injury', 'কাটা', 'রক্ত', 'দুর্ঘটনা'], 
    room: '401', floor: '4th', ward: 'Ward 21, 22', contact: '01811-000000',
    admission_instr: 'Emergency cases go directly to OT/Emergency Ward. Routine cases need OPD ticket from Counter 2.',
    admission_instr_bn: 'জরুরি রোগীরা সরাসরি ওটি/ইমার্জেন্সি ওয়ার্ডে যান। সাধারণ রোগীরা কাউন্টার ২ থেকে টিকেট নিন।'
  },
  { 
    id: 'dep3', name_en: 'Cardiology', name_bn: 'হৃদরোগ বিভাগ (Cardiology)', keywords: ['chest pain', 'heart', 'breath', 'pressure', 'বুক ব্যথা', 'শ্বাসকষ্ট'], 
    room: '202', floor: '2nd', ward: 'CCU / Ward 5', contact: '01911-000000',
    admission_instr: 'Go to CCU Ground Floor immediately for Chest Pain. For regular checkup, visit Room 202.',
    admission_instr_bn: 'বুকে ব্যথা হলে দ্রুত নিচ তলায় CCU তে যান। সাধারণ চেকআপের জন্য ২০২ নং রুমে যান।'
  },
  { 
    id: 'dep4', name_en: 'Pediatrics (Child)', name_bn: 'শিশু বিভাগ', keywords: ['baby', 'child', 'kids', 'fever', 'cold', 'বাচ্চা', 'শিশু'], 
    room: '105', floor: '1st', ward: 'Ward 8', contact: '01611-000000',
    admission_instr: 'Pediatric Emergency is on Ground Floor. General OPD in Room 105.',
    admission_instr_bn: 'শিশু জরুরি বিভাগ নিচ তলায়। সাধারণ আউটডোর ১০৫ নং রুমে।'
  },
  { 
    id: 'dep_ent', name_en: 'ENT (Ear, Nose, Throat)', name_bn: 'নাক, কান ও গলা বিভাগ', keywords: ['ear', 'nose', 'throat', 'cold', 'sneeze', 'কান', 'নাক', 'গলা', 'সর্দি'], 
    room: 'ENT Complex', floor: 'Ground', ward: 'Ward 30', contact: '01511-000000',
    admission_instr: 'Visit Room 6 for admission paperwork. Doctor sits in Room 4 & 5.',
    admission_instr_bn: 'ভর্তির কাগজপত্রের জন্য ৬ নং রুমে যান। ডাক্তার বসেন ৪ ও ৫ নং রুমে।'
  },
];

const ENT_MAP_URL = "https://i.ibb.co.com/jv4WhdTQ/image.png";
const GENERAL_MAP_URL = null; 
const APP_LOGO_URL = "https://i.ibb.co.com/q3BdjK5F/Morogram-of-Dhaka-Medical-College-svg.png";

const MAP_LOCATIONS = {
  'dep_ent': {
    image: ENT_MAP_URL,
    default_pin: { x: 50, y: 50 },
    sub_locations: {
      'room_3': { x: 16, y: 22, label: 'Room 3 (Store)' },
    }
  }
};

const BLOOD_AGENCIES = [
  { id: 1, name_en: 'Sandhani DMCH Unit', name_bn: 'সন্ধানী ডিএমসিএইচ ইউনিট', phone: '01811-111111', address: 'TSC, DMCH Campus', website: 'https://sandhani.org' },
  { id: 2, name_en: 'Quantum Lab', name_bn: 'কোয়ান্টাম ল্যাব', phone: '01714-000000', address: 'Shantinagar, Dhaka', website: 'http://quantummethod.org.bd' },
  { id: 3, name_en: 'Red Crescent Blood Bank', name_bn: 'রেড ক্রিসেন্ট ব্লাড ব্যাংক', phone: '02-999999', address: '7/5, Aurangzeb Road, Dhaka', website: 'http://bdrcs.org' },
  { id: 4, name_en: 'Badhan (TSC)', name_bn: 'বাঁধন (টিএসসি)', phone: '01511-222222', address: 'TSC, Dhaka University', website: 'https://badhan.org' },
];

const TRANSLATIONS = {
  en: {
    appTitle: 'DMCH Patient Guide', searchPlaceholder: 'Search for a test (e.g. CBC)...', quickAccess: 'Quick Access', findLab: 'Find Lab/Test', aiHelp: 'Symptom Guide', hospitalMap: 'Hospital Map', adminGuide: 'Admission Info', bloodBank: 'Blood Bank', cost: 'Cost', location: 'Location', instructions: 'Instructions', floor: 'Floor', room: 'Room', back: 'Back', aiPrompt: 'Describe your problem (e.g., "High fever")', aiButton: 'Get Advice', aiResult: 'Suggested Department:', showMap: 'Show on Map', welcome: 'Patient Guide', emergency: 'Emergency', emergencySub: 'Gate Location & Nav', admissionTitle: 'Admission Guide', admissionSub: 'Wards & Procedures', dept: 'Department', map: 'Map', close: 'Close', comingSoon: 'Coming Soon', selectDept: 'Select Department to Admit', wardNo: 'Ward No', contactStaff: 'Contact Staff', erLocation: 'Emergency Gate Location', erGate: 'DMCH Emergency Gate', navigate: 'Navigate Now', searchDeptPlaceholder: 'Type or select department...', donorAgencies: 'Donor Agencies', callNow: 'Call Now', aiLoading: 'Analyzing...', aiDisclaimer: 'Disclaimer: AI suggestions are for guidance only. Consult a doctor for professional advice.', viewOnMap: 'View on Floor Plan', exitTitle: 'Exit App?', exitDesc: 'Are you sure you want to close the application?', yes: 'Yes', no: 'No',
    billing: 'Billing & Tickets', settings: 'Settings', home: 'Home', reportBug: 'Report a Bug', requestService: 'Request Service', bloodRequest: 'Request Blood', bloodFormName: 'Patient Name', bloodFormGroup: 'Blood Group', bloodFormUnits: 'Units Needed', bloodFormContact: 'Contact No.', submitRequest: 'Submit Request', reqSuccess: 'Request submitted successfully!', viewDetails: 'View Details',
    reportAi: 'Report Explainer', reportPrompt: 'Paste your lab report or prescription details here to understand what it means...', explainBtn: 'Explain with AI ✨', reportResultTitle: 'AI Analysis ✨', reportDisclaimer: 'AI explanation is for educational purposes only. Always consult your doctor.',
    helpingHand: 'Helping Hand', reqHelp: 'Request Help', orgsTitle: 'Support Organizations', facebookPage: 'Facebook Page', hhnDesc: 'Providing medical support and financial aid for underprivileged patients.'
  },
  bn: {
    appTitle: 'ডিএমসিএইচ রোগী নির্দেশিকা', searchPlaceholder: 'পরীক্ষার নাম দিয়ে খুঁজুন (যেমন: CBC)...', quickAccess: 'দ্রুত সেবা', findLab: 'পরীক্ষা/ল্যাব', aiHelp: 'লক্ষণ ও পরামর্শ', hospitalMap: 'হসপিটাল ম্যাপ', adminGuide: 'ভর্তি তথ্য', bloodBank: 'ব্লাড ব্যাংক', cost: 'খরচ', location: 'অবস্থান', instructions: 'নির্দেশনা', floor: 'তলা', room: 'রুম', back: 'ফিরে যান', aiPrompt: 'আপনার সমস্যা লিখুন (যেমন: "প্রচণ্ড জ্বর")', aiButton: 'পরামর্শ নিন', aiResult: 'পরামর্শকৃত বিভাগ:', showMap: 'ম্যাপে দেখুন', welcome: 'রোগী নির্দেশিকা', emergency: 'জরুরি বিভাগ', emergencySub: 'গেইট লোকেশন ও ম্যাপ', admissionTitle: 'ভর্তি তথ্য', admissionSub: 'ওয়ার্ড ও নিয়মাবলী', dept: 'বিভাগ', map: 'ম্যাপ', close: 'বন্ধ করুন', comingSoon: 'শীঘ্রই আসছে', selectDept: 'ভর্তির জন্য বিভাগ বাছাই করুন', wardNo: 'ওয়ার্ড নং', contactStaff: 'যোগাযোগ', erLocation: 'জরুরি বিভাগের লোকেশন', erGate: 'ডিএমসিএইচ ইমার্জেন্সি গেইট', navigate: 'ম্যাপে দেখুন', searchDeptPlaceholder: 'বিভাগের নাম লিখুন বা বাছাই করুন...', donorAgencies: 'ডোনার সংস্থা', callNow: 'কল করুন', aiLoading: 'বিশ্লেষণ করা হচ্ছে...', aiDisclaimer: 'সতর্কতা: এআই পরামর্শ শুধুমাত্র নির্দেশনার জন্য। সঠিক চিকিৎসার জন্য ডাক্তারের পরামর্শ নিন।', viewOnMap: 'ফ্লোর ম্যাপে দেখুন', exitTitle: 'অ্যাপ থেকে বের হতে চান?', exitDesc: 'আপনি কি নিশ্চিত যে আপনি অ্যাপ্লিকেশনটি বন্ধ করতে চান?', yes: 'হ্যাঁ', no: 'না',
    billing: 'বিলিং ও টিকেট', settings: 'সেটিংস', home: 'হোম', reportBug: 'বাগ রিপোর্ট করুন', requestService: 'সেবা অনুরোধ', bloodRequest: 'রক্তের অনুরোধ', bloodFormName: 'রোগীর নাম', bloodFormGroup: 'রক্তের গ্রুপ', bloodFormUnits: 'কয় ব্যাগ প্রয়োজন', bloodFormContact: 'যোগাযোগ নম্বর', submitRequest: 'অনুরোধ জমা দিন', reqSuccess: 'সফলভাবে জমা হয়েছে!', viewDetails: 'বিস্তারিত দেখুন',
    reportAi: 'রিপোর্ট বুঝুন', reportPrompt: 'আপনার ল্যাব রিপোর্ট বা প্রেসক্রিপশনের লেখা এখানে পেস্ট করুন...', explainBtn: 'এআই দিয়ে বিশ্লেষণ করুন ✨', reportResultTitle: 'এআই বিশ্লেষণ ✨', reportDisclaimer: 'এআই বিশ্লেষণ শুধুমাত্র বোঝার সুবিধার্থে। সর্বদা ডাক্তারের পরামর্শ নিন।',
    helpingHand: 'সাহায্যের হাত', reqHelp: 'সাহায্য নিন', orgsTitle: 'সহায়তা প্রদানকারী সংস্থা', facebookPage: 'ফেসবুক পেইজ', hhnDesc: 'সুবিধাবঞ্চিত রোগীদের জন্য চিকিৎসা সহায়তা এবং আর্থিক অনুদান প্রদান করে।'
  }
};

export default function App() {
  const [lang, setLang] = useState('bn');
  const [screen, setScreen] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [services, setServices] = useState(FALLBACK_SERVICES_DB);
  const [activeMapPin, setActiveMapPin] = useState(null); 
  const [admissionDeptSearch, setAdmissionDeptSearch] = useState('');
  const [selectedAdmissionDept, setSelectedAdmissionDept] = useState(null);
  const [showAdmissionDetails, setShowAdmissionDetails] = useState(false);
  
  const [expandedAgency, setExpandedAgency] = useState(null);
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [isAppLoaded, setIsAppLoaded] = useState(true); 
  const [showExitModal, setShowExitModal] = useState(false);
  
  const [bloodTab, setBloodTab] = useState('agencies');
  const [bloodForm, setBloodForm] = useState({ name: '', group: '', units: '', contact: '', urgency: 'Normal' });
  const [isSubmittingBlood, setIsSubmittingBlood] = useState(false);
  const [bloodSubmitSuccess, setBloodSubmitSuccess] = useState(false);

  // AI Report Explainer State
  const [reportInput, setReportInput] = useState('');
  const [reportResponse, setReportResponse] = useState('');
  const [isReportLoading, setIsReportLoading] = useState(false);

  // LIVE DATE & TIME STATE
  const [currentTime, setCurrentTime] = useState(new Date());

  const t = TRANSLATIONS[lang];

  // Refs for access inside native listeners
  const screenRef = useRef(screen);
  const showExitModalRef = useRef(showExitModal);

  useEffect(() => {
    screenRef.current = screen;
    showExitModalRef.current = showExitModal;
  }, [screen, showExitModal]);

  // --- CURRENT TIME CLOCK (DHAKA TIMEZONE) ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDhakaTime = (date) => {
    try {
      return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'bn-BD', {
        timeZone: 'Asia/Dhaka',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      return date.toLocaleTimeString(); // Fallback
    }
  };

  // --- NAVIGATION & HARDWARE BACK BUTTON LOGIC ---
  const navigateTo = (newScreen) => {
    if (screen === newScreen) {
      return;
    }
    window.history.pushState({ screen: newScreen }, '', '');
    setScreen(newScreen);
    setShowExitModal(false); 
  };

  const handleBackClick = () => {
    if (screen === 'home') {
       setShowExitModal(true);
    } else {
       window.history.back();
    }
  };

  const confirmExit = () => {
    // For Native Android Capacitor
    if (window.Capacitor && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else {
      // Fallback for web preview
      window.close();
      setShowExitModal(false);
    }
  };

  useEffect(() => {
    // 1. Standard Web History Configuration (Clean Navigation)
    window.history.replaceState({ screen: 'home' }, '', '');
    
    const handlePopState = (e) => {
      if (e.state && e.state.screen) {
        setScreen(e.state.screen);
        setShowExitModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);

    // 2. Android Native Back Button Trap (Capacitor)
    let backListener;
    if (window.Capacitor && window.Capacitor.Plugins.App) {
      backListener = window.Capacitor.Plugins.App.addListener('backButton', () => {
        if (showExitModalRef.current) {
          setShowExitModal(false); // Close modal if already open
        } else if (screenRef.current === 'home') {
          setShowExitModal(true); // Trigger Exit App Prompt strictly on Home screen
        } else {
          window.history.back(); // Normal back navigation otherwise
        }
      });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (backListener) {
        backListener.then(listener => listener.remove());
      }
    };
  }, []);

  // --- APP ICON & THEME SYNC ---
  useEffect(() => {
    // Dynamically inject App Icon into document head (Web Only)
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = APP_LOGO_URL;

    // Status bar theme color sync
    let color = darkMode ? '#0f172a' : '#ffffff'; 
    if (screen === 'home') color = '#2563eb'; 
    else if (screen === 'admission') color = '#4f46e5'; 
    else if (screen === 'emergency' || screen === 'bloodBank') color = '#e11d48'; 
    else if (screen === 'ai' || screen === 'reportExplainer') color = '#059669'; 
    else if (screen === 'helpingHand') color = '#0d9488'; // Teal color for Helping Hand
    
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = color;
  }, [screen, darkMode]);

  // --- BACKGROUND CSV FETCH (Doesn't block UI) ---
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDfmZ4PZS-FwgEGEAagp0GLGqhdVpbyohTGp3FNw-0FAXgXMRNSBHpWgMM9JHT2kiP0Gds7ZoiMr6f/pub?output=csv";
        const response = await fetch(CSV_URL);
        const csvData = await response.text();
        
        const lines = csvData.split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const parsedResults = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            let val = '', inQuotes = false, values = [];
            for (let char of lines[i]) {
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) { values.push(val); val = ''; }
                else val += char;
            }
            values.push(val);
            
            let obj = {};
            headers.forEach((h, idx) => {
                let cleanVal = values[idx] ? values[idx].replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';
                obj[h] = cleanVal;
            });
            
            if (obj.name_en || obj.name_bn) {
                obj.id = obj.id || `live_${i}`;
                obj.color = obj.color || 'border-blue-500';
                parsedResults.push(obj);
            }
        }
        if (parsedResults.length > 0) setServices(parsedResults); 
      } catch(e) {
         console.error("Failed to fetch live CSV. Using fallback.");
      }
    };
    fetchLiveData();
  }, []);

  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'bn' : 'en');
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const handleSearch = (e) => setSearchQuery(e.target.value);
  
  const filteredServices = services.filter(s => 
    (s.name_en && s.name_en.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (s.name_bn && s.name_bn.includes(searchQuery))
  );

  const getGroupedServices = () => {
    const grouped = {};
    services.forEach(service => {
      const bldg = service.building || 'Other Facilities';
      const dept = service.department || 'General';
      if (!grouped[bldg]) grouped[bldg] = {};
      if (!grouped[bldg][dept]) grouped[bldg][dept] = [];
      grouped[bldg][dept].push(service);
    });
    return grouped;
  };

  const groupedServices = getGroupedServices();

  const startListening = (setInputFunc) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        setInputFunc(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("Voice recognition is not supported in this browser.");
    }
  };

  // --- FIXED AI INTEGRATION WITH BACKOFF & SCHEMA ---
  const handleAiCheck = async () => {
    if (!aiInput) return;
    
    setIsAiLoading(true);
    const systemPrompt = `You are an empathetic medical assistant at DMCH.
    Context - Available Departments: ${JSON.stringify(DEPARTMENTS_DB.map(d => ({id: d.id, name: d.name_en, keywords: d.keywords}))) }.
    Task: Analyze the patient's symptom and recommend the best matching department ID from the context. Provide short, compassionate advice. If no exact match, suggest going to the Information Desk and leave matched_id empty. Output JSON matching the schema precisely.`;
    const apiKey = ""; // Keep empty for native Canvas injection

    const payload = {
      contents: [{ parts: [{ text: aiInput }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            matched_id: { type: "STRING" },
            advice_bn: { type: "STRING" },
            advice_en: { type: "STRING" },
            fallback_dept_name: { type: "STRING" }
          }
        }
      }
    };

    // Exponential Backoff Fetch
    const fetchWithBackoff = async (retries = 5) => {
      const delays = [1000, 2000, 4000, 8000, 16000];
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Network response was not ok');
          return await res.json();
        } catch (error) {
          if (i === retries) throw error;
          await new Promise(r => setTimeout(r, delays[i]));
        }
      }
    };

    try {
      const data = await fetchWithBackoff();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const result = JSON.parse(text || "{}");

      if (result.matched_id) {
        const dept = DEPARTMENTS_DB.find(d => d.id === result.matched_id);
        let pin = MAP_LOCATIONS[result.matched_id] ? MAP_LOCATIONS[result.matched_id].default_pin : null;
        setAiResponse({ ...dept, advice_bn: result.advice_bn, advice_en: result.advice_en, pin_data: pin });
      } else {
        setAiResponse({ name_en: result.fallback_dept_name || 'Information Desk', name_bn: result.fallback_dept_name || 'তথ্য কেন্দ্র', room: 'G', floor: 'G', advice_bn: result.advice_bn || 'দয়া করে তথ্য কেন্দ্রে যোগাযোগ করুন।', advice_en: result.advice_en || 'Please visit the information desk.', pin_data: null });
      }
    } catch (error) { 
        console.error("AI Error:", error); 
        setAiResponse({ name_en: 'General Error', name_bn: 'সার্ভার সমস্যা', room: 'G', floor: 'G', advice_bn: 'দুঃখিত, এই মুহূর্তে এআই কাজ করছে না। দয়া করে তথ্য কেন্দ্রে যোগাযোগ করুন।', advice_en: 'Sorry, AI is unreachable. Please visit the info desk.', pin_data: null });
    } finally { 
        setIsAiLoading(false); 
    }
  };

  // --- NEW GEMINI API: LAB REPORT EXPLAINER ---
  const handleReportExplain = async () => {
    if (!reportInput) return;
    setIsReportLoading(true);
    
    const targetLanguage = lang === 'bn' ? 'Bengali (বাংলা)' : 'English';
    const systemPrompt = `You are a helpful, highly knowledgeable medical assistant helping a patient understand their lab test report or medical notes. 
    Task: 
    1. Read the provided text.
    2. Summarize the findings in extremely simple, non-medical terms.
    3. Highlight any values that seem abnormal and explain what they typically mean.
    4. MUST respond entirely in ${targetLanguage}.
    5. Keep the tone empathetic and calm. Use bullet points for readability.`;
    
    const apiKey = ""; // Keep empty for native Canvas injection

    const payload = {
      contents: [{ parts: [{ text: reportInput }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const fetchWithBackoff = async (retries = 5) => {
      const delays = [1000, 2000, 4000, 8000, 16000];
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Network response was not ok');
          return await res.json();
        } catch (error) {
          if (i === retries) throw error;
          await new Promise(r => setTimeout(r, delays[i]));
        }
      }
    };

    try {
      const data = await fetchWithBackoff();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setReportResponse(text || (lang === 'bn' ? "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।" : "Sorry, no response generated."));
    } catch (error) { 
      console.error("Report AI Error:", error); 
      setReportResponse(lang === 'bn' ? 'সার্ভার সমস্যা, আবার চেষ্টা করুন।' : 'Server error, please try again.');
    } finally { 
      setIsReportLoading(false); 
    }
  };

  const handleViewDeptDetails = (deptId) => {
    const dept = DEPARTMENTS_DB.find(d => d.id === deptId);
    if (dept) {
      setSelectedService({ 
        id: dept.id, name_en: dept.name_en, name_bn: dept.name_bn, cost: '10 (Ticket)', 
        department: dept.name_en, building: dept.ward, room: dept.room, floor: dept.floor, 
        admission_instr: dept.admission_instr, admission_instr_bn: dept.admission_instr_bn 
      });
    }
  };

  const handleNavigateToMap = (dept, pin) => {
    setSelectedService({ name_en: dept.name_en, name_bn: dept.name_bn, room: dept.room, instructions: lang === 'bn' ? dept.admission_instr_bn : dept.admission_instr, id: dept.id });
    setActiveMapPin(pin);
    navigateTo('map');
  };

  const getThemeClass = (type) => {
    const themes = {
      bg: darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-blue-50/50',
      card: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]',
      text: darkMode ? 'text-slate-100' : 'text-slate-800',
      textSec: darkMode ? 'text-slate-400' : 'text-slate-500',
      input: darkMode ? 'bg-slate-700 text-white placeholder-slate-400 border-slate-600' : 'bg-slate-100 text-slate-800 border-slate-200',
      border: darkMode ? 'border-slate-700' : 'border-slate-100',
    };
    return themes[type] || '';
  };

  const TestDetailModal = ({ service, onClose }) => {
    if (!service) return null;
    const mapData = MAP_LOCATIONS[service.id];
    const hasMapImage = mapData && mapData.image;

    return (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative ${getThemeClass('card')}`}>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
            <h2 className="text-2xl font-bold text-white pr-8">{lang === 'bn' && service.name_bn ? service.name_bn : service.name_en}</h2>
            <p className="text-blue-100 text-sm mt-1 opacity-90">{service.name_en}</p>
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className={`flex items-center p-3 rounded-xl border ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'}`}>
              <div className={`p-2.5 rounded-full mr-3 ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}><DollarSign className="text-green-600" size={20} /></div>
              <div><p className="text-xs text-green-600 font-bold uppercase tracking-wider">{t.cost}</p><p className={`text-xl font-bold ${getThemeClass('text')}`}>৳ {service.cost || (service.keywords ? 'Ticket: 10' : 'Unknown')}</p></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
               <div className="flex items-start"><Building className="text-gray-400 mt-1 mr-3 flex-shrink-0" size={20} /><div><p className="text-xs text-gray-400 font-bold uppercase">{t.dept}</p><p className={`font-medium ${getThemeClass('text')}`}>{service.department || (service.keywords ? 'Department' : 'General')}</p></div></div>
               <div className="flex items-start"><MapPin className="text-gray-400 mt-1 mr-3 flex-shrink-0" size={20} /><div><p className="text-xs text-gray-400 font-bold uppercase">{t.location}</p><p className={`font-medium ${getThemeClass('text')}`}>{t.room} {service.room}, {t.floor} {service.floor}</p><p className={`text-sm ${getThemeClass('textSec')}`}>{service.building || service.ward}</p></div></div>
               <div className="flex items-start"><FileText className="text-gray-400 mt-1 mr-3 flex-shrink-0" size={20} /><div><p className="text-xs text-gray-400 font-bold uppercase">{t.instructions}</p><p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} italic text-sm leading-relaxed`}>{lang === 'bn' && service.admission_instr_bn ? service.admission_instr_bn : (service.instructions || service.admission_instr || t.comingSoon)}</p></div></div>
            </div>
            <div className={`mt-4 border-t pt-4 ${getThemeClass('border')}`}>
              <p className="text-xs text-gray-400 font-bold uppercase mb-2">{t.map}</p>
              {hasMapImage ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                  <img src={mapData.image} alt="Map Location" className="w-full h-48 object-cover object-center" />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">{t.location}</div>
                </div>
              ) : (
                <div className={`h-32 rounded-xl flex flex-col items-center justify-center border-2 border-dashed ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}><MapPin className="text-slate-400 mb-2" size={32} /><p className={`text-sm font-medium ${getThemeClass('textSec')}`}>{service.map_status || t.comingSoon}</p></div>
              )}
            </div>
          </div>
          <div className={`p-4 border-t ${getThemeClass('border')} ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <button onClick={onClose} className={`w-full py-3.5 rounded-xl font-bold transition active:scale-95 ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>{t.close}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="pt-10 pb-8 px-6 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-b-[2.5rem] shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] relative z-10 transition-all duration-500">
        <div className="flex flex-row justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full p-1 shadow-lg mr-3 flex-shrink-0 flex items-center justify-center">
              <img src={APP_LOGO_URL} alt="DMCH Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{t.welcome}</h1>
              <p className="text-blue-100 opacity-90 text-sm font-medium">Dhaka Medical College</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex gap-2">
              <button onClick={toggleDarkMode} className="bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-full text-white hover:bg-white/30 transition shadow-sm">{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
              <button onClick={toggleLanguage} className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full text-white font-bold text-xs hover:bg-white/30 transition shadow-sm">{lang === 'en' ? 'বাংলা' : 'ENG'}</button>
            </div>
            <div className={`mt-2.5 px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-sm text-xs font-bold tracking-wide flex items-center bg-white/20 border-white/30 text-white`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse bg-white`}></div>
              {formatDhakaTime(currentTime)}
            </div>
          </div>
        </div>
        <button onClick={() => navigateTo('search')} className={`w-full p-3.5 rounded-2xl flex items-center shadow-lg transform active:scale-95 transition-all ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-400'}`}>
            <Search size={20} className="mr-3 text-blue-500"/>
            <span className="text-sm font-medium">{t.searchPlaceholder}</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        <button onClick={() => navigateTo('emergency')} className="group w-full bg-gradient-to-r from-rose-500 to-red-600 p-1 rounded-2xl shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all transform hover:-translate-y-1 active:scale-95 duration-300">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center h-full">
            <div className="bg-white/20 p-2.5 rounded-full mr-4 group-hover:bg-white/30 transition"><Activity size={24} className="text-white" /></div>
            <div className="text-left"><span className="block font-bold text-lg text-white leading-tight">{t.emergency}</span><span className="text-red-100 text-xs">{t.emergencySub}</span></div>
            <ChevronRight className="ml-auto text-white/70" size={20} />
          </div>
        </button>
        <button onClick={() => { navigateTo('admission'); setShowAdmissionDetails(false); setAdmissionDeptSearch(''); }} className="group w-full bg-gradient-to-r from-indigo-500 to-blue-600 p-1 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 active:scale-95 duration-300">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center h-full">
            <div className="bg-white/20 p-2.5 rounded-full mr-4 group-hover:bg-white/30 transition"><BedDouble size={24} className="text-white" /></div>
            <div className="text-left"><span className="block font-bold text-lg text-white leading-tight">{t.admissionTitle}</span><span className="text-indigo-100 text-xs">{t.admissionSub}</span></div>
            <ChevronRight className="ml-auto text-white/70" size={20} />
          </div>
        </button>

        <div className={`mt-3 py-2.5 px-3 rounded-xl border flex items-center overflow-hidden shadow-sm ${darkMode ? 'bg-red-950/40 border-red-900/50' : 'bg-red-50 border-red-100'}`}>
          <AlertCircle className="text-red-600 mr-2 flex-shrink-0 animate-pulse" size={18} />
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-crawler font-bold text-sm text-red-600">
              স্বাস্থ্যসেবাপ্রদানকারী ডাক্তার, নার্স ও অন্যান্যদের সাথে দুর্ব্যবহার, সহিংস আচরণ অথবা সহিংসতা আইনত দণ্ডনীয় অপরাধ।
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className={`text-lg font-bold ml-1 mb-4 flex items-center ${getThemeClass('text')}`}><span className="w-1.5 h-6 bg-cyan-500 rounded-full mr-2.5 shadow-sm shadow-cyan-500/50"></span>{t.quickAccess}</h2>
          <div className="grid grid-cols-2 gap-4 pb-6">
            <button onClick={() => navigateTo('search')} className={`group p-5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 duration-300 ${getThemeClass('card')} hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${darkMode ? 'bg-blue-900/30 group-hover:bg-blue-900/50' : 'bg-blue-50 group-hover:bg-blue-100'}`}><Search className="text-blue-600" size={26} /></div>
              <span className={`font-bold text-sm ${getThemeClass('text')}`}>{t.findLab}</span>
            </button>
            <button onClick={() => navigateTo('ai')} className={`group p-5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 duration-300 ${getThemeClass('card')} hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${darkMode ? 'bg-emerald-900/30 group-hover:bg-emerald-900/50' : 'bg-emerald-50 group-hover:bg-emerald-100'}`}><Stethoscope className="text-emerald-600" size={26} /></div>
              <span className={`font-bold text-sm ${getThemeClass('text')}`}>{t.aiHelp}</span>
            </button>
            <button onClick={() => { setSelectedService(null); navigateTo('map'); }} className={`group p-5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 duration-300 ${getThemeClass('card')} hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${darkMode ? 'bg-orange-900/30 group-hover:bg-orange-900/50' : 'bg-orange-50 group-hover:bg-orange-100'}`}><MapPin className="text-orange-600" size={26} /></div>
              <span className={`font-bold text-sm ${getThemeClass('text')}`}>{t.hospitalMap}</span>
            </button>
            <button onClick={() => { navigateTo('bloodBank'); }} className={`group p-5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 duration-300 ${getThemeClass('card')} hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/10`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${darkMode ? 'bg-rose-900/30 group-hover:bg-rose-900/50' : 'bg-rose-50 group-hover:bg-rose-100'}`}><Droplet className="text-rose-600" size={26} /></div>
              <span className={`font-bold text-sm ${getThemeClass('text')}`}>{t.bloodBank}</span>
            </button>
          </div>
          
          <h2 className={`text-lg font-bold ml-1 mb-4 mt-2 flex items-center ${getThemeClass('text')}`}><Sparkles className="text-purple-500 mr-2" size={20}/> AI Tools</h2>
          <div className="grid grid-cols-1 gap-4 pb-6">
            <button onClick={() => navigateTo('reportExplainer')} className={`group w-full bg-gradient-to-r from-purple-500 to-indigo-600 p-1 rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all transform active:scale-95 duration-300`}>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center h-full">
                <div className="bg-white/20 p-2.5 rounded-full mr-4 group-hover:bg-white/30 transition"><FileSearch size={24} className="text-white" /></div>
                <div className="text-left"><span className="block font-bold text-lg text-white leading-tight">{t.reportAi} ✨</span><span className="text-purple-100 text-xs">Understand medical jargon instantly</span></div>
                <ChevronRight className="ml-auto text-white/70" size={20} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className={`pt-10 pb-4 px-4 border-b flex flex-col shadow-sm z-10 sticky top-0 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center mb-3">
          <button onClick={handleBackClick} className={`mr-3 p-2 rounded-full transition ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}><ArrowLeft size={24} /></button>
          <div className="flex-1 relative">
             <Search className="absolute left-3 top-3 text-gray-400" size={18} />
             <input className={`w-full py-2.5 pl-10 pr-4 rounded-full text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner ${getThemeClass('input')}`} placeholder={t.searchPlaceholder} value={searchQuery} onChange={handleSearch} />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {searchQuery ? (
          filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <button key={service.id} onClick={() => setSelectedService(service)} className={`w-full text-left p-4 rounded-2xl border-l-4 ${service.color || 'border-gray-300'} shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${getThemeClass('card')}`}>
                <div className="flex justify-between items-start mb-2"><h3 className={`text-lg font-bold ${getThemeClass('text')}`}>{lang === 'bn' ? service.name_bn : service.name_en}</h3><span className={`font-bold px-2.5 py-0.5 rounded-full text-sm border ${darkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`}>৳{service.cost}</span></div>
                <div className={`flex items-center mb-1 text-sm font-medium ${getThemeClass('textSec')}`}><Building size={16} className="mr-1.5 opacity-70" /><span>{service.department} • {service.building}</span></div>
              </button>
            ))
          ) : ( <div className="text-center py-10 opacity-50"><Search size={40} className="mx-auto mb-3" /><p>{lang === 'bn' ? 'কোন টেস্ট পাওয়া যায়নি' : 'No tests found'}</p></div> )
        ) : (
          Object.entries(groupedServices).map(([buildingName, departments]) => {
            const isExpanded = expandedBuilding === buildingName;
            return (
              <div key={buildingName} className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${getThemeClass('card')}`}>
                <button onClick={() => setExpandedBuilding(isExpanded ? null : buildingName)} className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isExpanded ? (darkMode ? 'bg-slate-700/50' : 'bg-blue-50/50') : ''}`}>
                  <div className="flex items-center"><div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><Building size={20} /></div><span className={`font-bold text-base ${getThemeClass('text')}`}>{buildingName}</span></div>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                </button>
                {isExpanded && (
                  <div className={`border-t animate-in slide-in-from-top-2 ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                    {Object.entries(departments).map(([deptName, deptServices]) => (
                      <div key={deptName} className="px-4 py-3"><h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ml-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{deptName}</h4><div className="space-y-2">
                          {deptServices.map(service => (
                            <button key={service.id} onClick={() => setSelectedService(service)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md active:scale-[0.98] ${darkMode ? 'bg-slate-800 border-slate-600 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                              <span className={`text-sm font-medium text-left ${getThemeClass('text')}`}>{lang === 'bn' ? service.name_bn : service.name_en}</span><div className="flex items-center text-xs font-bold text-slate-500">৳{service.cost}<ChevronRight size={14} className="ml-1 opacity-50"/></div>
                            </button>
                          ))}
                        </div></div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderAI = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="pt-10 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center shadow-md">
        <button onClick={handleBackClick} className="mr-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white"><ArrowLeft size={24} /></button>
        <h2 className="text-lg font-bold text-white">{t.aiHelp}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 pb-32">
        <div className="flex gap-3 mb-6">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${darkMode ? 'bg-emerald-900' : 'bg-emerald-100'}`}><Stethoscope size={20} className="text-emerald-600" /></div>
           <div className={`p-4 rounded-2xl rounded-tl-none shadow-sm border max-w-[85%] ${getThemeClass('card')}`}><p className={`font-medium ${getThemeClass('text')}`}>{t.aiPrompt}</p></div>
        </div>
        {aiResponse && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="self-end bg-emerald-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-md"><p>{aiInput}</p></div>
            <div className={`p-1 rounded-2xl border shadow-lg mt-2 overflow-hidden ${darkMode ? 'bg-slate-800 border-emerald-900' : 'bg-white border-emerald-100'}`}>
              <div className={darkMode ? 'bg-emerald-900/20 p-5' : 'bg-emerald-50/50 p-5'}>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>{t.aiResult}</p>
                <h3 className={`text-2xl font-bold mb-1 ${getThemeClass('text')}`}>{lang === 'bn' ? aiResponse.name_bn : aiResponse.name_en}</h3>
                <p className={`text-lg mb-1 ${getThemeClass('textSec')}`}>{t.room} {aiResponse.room}, {t.floor} {aiResponse.floor}</p>
                <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-emerald-800' : 'border-emerald-200'}`}>
                   <p className={`text-sm italic ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{lang === 'bn' ? aiResponse.advice_bn : aiResponse.advice_en}</p>
                </div>
                {aiResponse.id && (
                  <button onClick={() => handleViewDeptDetails(aiResponse.id)} className={`w-full mt-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center border shadow-sm ${darkMode ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800 hover:bg-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                    <FileText size={18} className="mr-2" />{t.viewDetails}
                  </button>
                )}
                {aiResponse.pin_data && (
                  <button onClick={() => handleNavigateToMap(aiResponse, aiResponse.pin_data)} className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center shadow-lg"><Target size={18} className="mr-2 animate-pulse" />{t.viewOnMap}</button>
                )}
              </div>
            </div>
          </div>
        )}
        {isAiLoading && ( <div className="flex justify-center items-center mt-6"><Loader2 className="animate-spin text-emerald-500 mr-2" size={24}/><span className="text-emerald-500 font-bold">{t.aiLoading}</span></div> )}
      </div>
      <div className={`absolute bottom-0 w-full p-4 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
        <div className={`flex justify-center items-center mb-2 space-x-1 opacity-70 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}><Info size={12} /><p className="text-[10px] font-medium text-center">{t.aiDisclaimer}</p></div>
        <div className="relative">
          <textarea className={`w-full rounded-2xl pl-4 pr-14 py-4 text-base focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none h-16 font-medium shadow-inner ${getThemeClass('input')}`} placeholder={lang === 'en' ? "Type symptoms..." : "সমস্যা লিখুন..."} value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
          <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-between">
             <button onClick={() => startListening(setAiInput)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600'}`}> {isListening ? <MicOff size={20}/> : <Mic size={20}/>} </button>
             <button onClick={handleAiCheck} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${aiInput ? 'bg-emerald-600 text-white shadow-lg scale-95 hover:scale-100' : 'bg-gray-200 text-gray-400'}`}> <ArrowLeft className="rotate-180" size={20} /> </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmergency = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-gradient-to-r from-rose-600 to-red-500 pt-10 p-6 rounded-b-[2rem] shadow-xl shadow-red-500/20 z-10">
        <div className="flex items-center mb-4">
          <button onClick={handleBackClick} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition mr-3"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-bold text-white">{t.emergency}</h1>
        </div>
        <p className="text-rose-100 text-sm">{lang === 'bn' ? 'জরুরি বিভাগের অবস্থান এবং নির্দেশনা' : 'Emergency Gate Location & Guidance'}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 mt-2">
        <div className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b flex justify-between items-center ${getThemeClass('border')}`}>
            <div className="flex items-center text-rose-600 font-bold"><MapPin className="mr-2" size={20} /><span>{t.erLocation}</span></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="h-64 bg-slate-200 relative pointer-events-none">
             <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" title="DMCH Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.578672044837!2d90.39561831498144!3d23.726759984600963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8e90a449e4f%3A0xb7092a9c25197fa4!2sDhaka%20Medical%20College%20Hospital!5e0!3m2!1sen!2sbd!4v1625567890123!5m2!1sen!2sbd" style={{filter: 'grayscale(0.2) contrast(1.1)'}}></iframe>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4">
                <div className="flex flex-col items-center">
                  <div className="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">{t.erGate}</div>
                  <MapPin size={40} className="text-rose-600 fill-white drop-shadow-xl animate-bounce" />
                </div>
             </div>
          </div>
          <div className={`p-4 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
            <a href="https://www.google.com/maps/dir/?api=1&destination=Dhaka+Medical+College+Hospital" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-md shadow-blue-500/30 active:scale-95"><Navigation className="mr-2" size={20} />{t.navigate}</a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportExplainer = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="pt-10 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center shadow-md">
        <button onClick={handleBackClick} className="mr-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white"><ArrowLeft size={24} /></button>
        <h2 className="text-lg font-bold text-white flex items-center"><Sparkles size={18} className="mr-2"/> {t.reportAi}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 pb-8">
        <div className={`p-4 rounded-2xl border shadow-sm mb-6 ${getThemeClass('card')}`}>
          <label className={`block text-xs font-bold mb-2 ml-1 ${getThemeClass('textSec')}`}>{t.reportPrompt}</label>
          <textarea 
            className={`w-full rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none resize-none h-32 font-medium shadow-inner ${getThemeClass('input')}`} 
            placeholder={"HB%: 10.5 gm/dl\nESR: 45 mm in 1st hour\n..."} 
            value={reportInput} 
            onChange={(e) => setReportInput(e.target.value)} 
          />
          <button 
            onClick={handleReportExplain} 
            disabled={isReportLoading || !reportInput}
            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center shadow-md active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {isReportLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />}
            {t.explainBtn}
          </button>
        </div>

        {reportResponse && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-1 rounded-2xl border shadow-lg overflow-hidden ${darkMode ? 'bg-slate-800 border-purple-900' : 'bg-white border-purple-100'}`}>
              <div className={darkMode ? 'bg-purple-900/20 p-5' : 'bg-purple-50/50 p-5'}>
                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                  {t.reportResultTitle}
                </p>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${getThemeClass('text')}`}>
                  {reportResponse}
                </div>
              </div>
            </div>
            <div className={`flex items-center justify-center mt-4 space-x-1 opacity-70 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               <Info size={12} />
               <p className="text-[10px] font-medium text-center">{t.reportDisclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderBloodBank = () => {
    const handleBloodFormSubmit = (e) => {
      e.preventDefault();
      setIsSubmittingBlood(true);
      // Simulating Google Sheets API request
      setTimeout(() => {
        setIsSubmittingBlood(false);
        setBloodSubmitSuccess(true);
        setBloodForm({ name: '', group: '', units: '', contact: '', urgency: 'Normal' });
        setTimeout(() => setBloodSubmitSuccess(false), 3500);
      }, 1500);
    };

    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="p-6 pt-10 bg-gradient-to-r from-rose-500 to-pink-600 shadow-md shadow-rose-500/20">
           <div className="flex items-center mb-4">
            <button onClick={handleBackClick} className="mr-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white"><ArrowLeft size={24} /></button>
            <h2 className="text-2xl font-bold text-white">{t.bloodBank}</h2>
          </div>
          <div className="flex mt-4 bg-white/20 p-1 rounded-xl backdrop-blur-sm">
            <button onClick={() => setBloodTab('agencies')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${bloodTab === 'agencies' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-100 hover:bg-white/10'}`}>{t.donorAgencies}</button>
            <button onClick={() => setBloodTab('request')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${bloodTab === 'request' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-100 hover:bg-white/10'}`}>{t.bloodRequest}</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 mt-2">
          
          {bloodTab === 'agencies' ? (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">{t.donorAgencies}</h3>
              <div className="space-y-3">
                {BLOOD_AGENCIES.map(agency => {
                  const isExpanded = expandedAgency === agency.id;
                  return (
                    <div key={agency.id} className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${getThemeClass('card')}`}>
                      <button onClick={() => setExpandedAgency(isExpanded ? null : agency.id)} className="w-full flex items-center justify-between p-4 text-left">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-inner ${darkMode ? 'bg-rose-900/50' : 'bg-rose-50'}`}><Heart className="text-rose-500" size={18} /></div>
                          <span className={`font-bold ${getThemeClass('text')}`}>{lang === 'bn' ? agency.name_bn : agency.name_en}</span>
                        </div>
                        <ChevronRight size={18} className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className={`px-4 pb-4 pt-0 border-t animate-in slide-in-from-top-2 ${darkMode ? 'bg-slate-900/30 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className="pt-3 space-y-2">
                            <div className={`flex items-center text-sm ${getThemeClass('textSec')}`}><MapPin size={14} className="mr-2 text-rose-400" />{agency.address}</div>
                            <div className="flex gap-2 mt-3">
                               <a href={`tel:${agency.phone}`} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center transition active:scale-95 shadow-md shadow-green-500/20"><Phone size={12} className="mr-1.5" /> {t.callNow}</a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">{t.bloodRequest}</h3>
              <form onSubmit={handleBloodFormSubmit} className={`p-5 rounded-2xl border shadow-sm space-y-4 ${getThemeClass('card')}`}>
                {bloodSubmitSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-center mb-4">
                    <CheckCircle2 size={20} className="mr-2 text-emerald-600" />
                    <span className="font-bold text-sm">{t.reqSuccess}</span>
                  </div>
                )}
                <div>
                  <label className={`block text-xs font-bold mb-1 ml-1 ${getThemeClass('textSec')}`}>{t.bloodFormName}</label>
                  <input required className={`w-full py-3 px-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/50 transition-all border ${getThemeClass('input')}`} value={bloodForm.name} onChange={e => setBloodForm({...bloodForm, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ml-1 ${getThemeClass('textSec')}`}>{t.bloodFormGroup}</label>
                    <select required className={`w-full py-3 px-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/50 transition-all border ${getThemeClass('input')}`} value={bloodForm.group} onChange={e => setBloodForm({...bloodForm, group: e.target.value})}>
                      <option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ml-1 ${getThemeClass('textSec')}`}>{t.bloodFormUnits}</label>
                    <input required type="number" min="1" className={`w-full py-3 px-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/50 transition-all border ${getThemeClass('input')}`} value={bloodForm.units} onChange={e => setBloodForm({...bloodForm, units: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ml-1 ${getThemeClass('textSec')}`}>{t.bloodFormContact}</label>
                  <input required type="tel" className={`w-full py-3 px-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/50 transition-all border ${getThemeClass('input')}`} value={bloodForm.contact} onChange={e => setBloodForm({...bloodForm, contact: e.target.value})} />
                </div>
                <button type="submit" disabled={isSubmittingBlood} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center shadow-md active:scale-95 disabled:opacity-70">
                  {isSubmittingBlood ? <Loader2 size={20} className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                  {t.submitRequest}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBilling = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 pt-10 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <h2 className="text-2xl font-bold text-white mb-2">{t.billing}</h2>
        <p className="text-blue-100 text-sm">Manage tickets and payments</p>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center opacity-70">
        <div className={`p-6 rounded-full mb-4 ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
           <Receipt size={48} className="text-blue-500" />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${getThemeClass('text')}`}>{t.comingSoon}</h3>
        <p className={`${getThemeClass('textSec')} text-sm max-w-[250px]`}>Online ticketing and billing features are currently under development.</p>
      </div>
    </div>
  );

  const renderHelpingHand = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 pt-10 bg-gradient-to-r from-teal-500 to-emerald-600 shadow-md">
        <h2 className="text-2xl font-bold text-white mb-2">{t.helpingHand}</h2>
        <p className="text-teal-100 text-sm">Financial and medical assistance</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-6">
         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{t.orgsTitle}</h3>
         
         <div className={`p-5 rounded-2xl border shadow-sm ${getThemeClass('card')}`}>
           <div className="flex items-start justify-between mb-3">
             <div>
               <h4 className={`font-bold text-lg leading-tight ${getThemeClass('text')}`}>Helping Hand for Needy</h4>
               <p className={`text-xs mt-1.5 leading-relaxed ${getThemeClass('textSec')}`}>{t.hhnDesc}</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 ml-3 shadow-inner">
               <HeartHandshake size={24} />
             </div>
           </div>
           
           <div className="flex gap-3 mt-5">
             <a 
               href="https://www.facebook.com/HHFNBangladesh" 
               target="_blank" 
               rel="noopener noreferrer" 
               className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold border transition active:scale-95 ${darkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
             >
               <ExternalLink size={14} className="mr-2" /> {t.facebookPage}
             </a>
             <button 
               onClick={() => alert("Help Request Form coming soon!")} 
               className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-md shadow-teal-500/20"
             >
               {t.reqHelp}
             </button>
           </div>
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 pt-10 bg-gradient-to-r from-slate-700 to-slate-800 shadow-md">
        <h2 className="text-2xl font-bold text-white mb-2">{t.settings}</h2>
        <p className="text-slate-300 text-sm">App preferences and support</p>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
         <div className={`rounded-2xl border shadow-sm p-2 ${getThemeClass('card')}`}>
            <button onClick={() => alert("Bug report module coming soon")} className={`w-full flex items-center p-4 rounded-xl transition-all ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
               <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mr-4"><Bug size={20} /></div>
               <span className={`font-bold text-left flex-1 ${getThemeClass('text')}`}>{t.reportBug}</span>
               <ChevronRight size={20} className="text-slate-400" />
            </button>
            <div className={`h-px w-[85%] mx-auto ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
            <button onClick={() => alert("Service request module coming soon")} className={`w-full flex items-center p-4 rounded-xl transition-all ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4"><HelpCircle size={20} /></div>
               <span className={`font-bold text-left flex-1 ${getThemeClass('text')}`}>{t.requestService}</span>
               <ChevronRight size={20} className="text-slate-400" />
            </button>
         </div>
         
         <div className={`rounded-2xl border shadow-sm p-4 mt-6 ${getThemeClass('card')} text-center`}>
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${getThemeClass('textSec')}`}>Theme & Language</p>
            <div className="flex gap-2 justify-center">
              <button onClick={toggleDarkMode} className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold border transition ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>{darkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />} Theme</button>
              <button onClick={toggleLanguage} className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold border transition ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>{lang === 'en' ? 'বাংলা' : 'ENG'}</button>
            </div>
         </div>
      </div>
    </div>
  );

  const renderAdmission = () => {
    const filteredDepts = DEPARTMENTS_DB.filter(d => (d.name_en.toLowerCase().includes(admissionDeptSearch.toLowerCase()) || d.name_bn.includes(admissionDeptSearch)));
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="p-6 pt-10 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md shadow-indigo-500/20">
          <div className="flex items-center mb-4">
            <button onClick={handleBackClick} className="mr-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white"><ArrowLeft size={24} /></button>
            <h2 className="text-2xl font-bold text-white">{t.admissionTitle}</h2>
          </div>
          <div className="relative">
            <input className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition shadow-inner" placeholder={t.searchDeptPlaceholder} value={admissionDeptSearch} onChange={(e) => { setAdmissionDeptSearch(e.target.value); setShowAdmissionDetails(false); setSelectedAdmissionDept(null); }} />
            <Search className="absolute right-4 top-3.5 text-blue-200" size={20} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          {!showAdmissionDetails ? (
            <div className="space-y-2 mt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.selectDept}</p>
              {filteredDepts.map(dept => (
                <button key={dept.id} onClick={() => { setSelectedAdmissionDept(dept); setAdmissionDeptSearch(lang === 'bn' ? dept.name_bn : dept.name_en); setShowAdmissionDetails(true); }} className={`w-full text-left p-4 rounded-xl border shadow-sm hover:border-blue-300 transition flex justify-between items-center ${getThemeClass('card')}`}>
                  <span className={`font-bold ${getThemeClass('text')}`}>{lang === 'bn' ? dept.name_bn : dept.name_en}</span>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4 mt-2">
              {selectedAdmissionDept && (
                <>
                  <div className={`p-5 rounded-2xl border-l-4 border-indigo-500 shadow-md ${getThemeClass('card')}`}>
                    <h3 className={`text-xl font-bold mb-1 ${getThemeClass('text')}`}>{lang === 'bn' ? selectedAdmissionDept.name_bn : selectedAdmissionDept.name_en}</h3>
                    <div className={`flex items-center text-sm ${getThemeClass('textSec')}`}><Building size={14} className="mr-1" /><span>{t.room} {selectedAdmissionDept.room}, {t.floor} {selectedAdmissionDept.floor}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-indigo-900/20 border-indigo-900' : 'bg-indigo-50 border-indigo-100'}`}><p className="text-xs text-indigo-500 font-bold uppercase mb-1">{t.wardNo}</p><p className={`font-bold text-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>{selectedAdmissionDept.ward}</p></div>
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-teal-900/20 border-teal-900' : 'bg-teal-50 border-teal-100'}`}><p className="text-xs text-teal-600 font-bold uppercase mb-1">{t.contactStaff}</p><div className="flex items-center"><Phone size={14} className="text-teal-600 mr-1" /><p className={`font-bold text-sm ${darkMode ? 'text-teal-300' : 'text-teal-900'}`}>{selectedAdmissionDept.contact}</p></div></div>
                  </div>
                  <div className={`p-5 rounded-2xl border shadow-sm ${getThemeClass('card')}`}><div className="flex items-center mb-3"><FileText className="text-orange-500 mr-2" size={20} /><h4 className={`font-bold ${getThemeClass('text')}`}>{t.instructions}</h4></div><p className={`text-sm leading-relaxed ${getThemeClass('textSec')}`}>{lang === 'bn' ? selectedAdmissionDept.admission_instr_bn : selectedAdmissionDept.admission_instr}</p></div>
                  <button onClick={() => setShowAdmissionDetails(false)} className="w-full py-3 text-slate-400 text-sm font-medium hover:text-slate-500 transition">Change Department</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMap = () => {
    const mapData = selectedService && MAP_LOCATIONS[selectedService.id];
    const imageSrc = mapData ? mapData.image : GENERAL_MAP_URL; 

    return (
      <div className="flex-1 flex flex-col h-full">
         <div className={`p-4 pt-10 border-b flex items-center shadow-sm z-10 ${getThemeClass('card')}`}>
          <button onClick={handleBackClick} className={`mr-3 p-2 rounded-full transition ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}><ArrowLeft size={24} /></button>
          <div className="flex-1">
            <h2 className={`text-base font-bold truncate leading-tight ${getThemeClass('text')}`}>{selectedService ? (lang === 'bn' ? selectedService.name_bn : selectedService.name_en) : t.hospitalMap}</h2>
            {selectedService && <p className={`text-xs font-medium ${getThemeClass('textSec')}`}>{t.room} {selectedService.room}</p>}
          </div>
        </div>
        <div className="flex-1 bg-slate-200 relative overflow-hidden flex items-center justify-center">
          
          <button 
            onClick={() => {
               const entDept = DEPARTMENTS_DB.find(d => d.id === 'dep_ent');
               if (entDept) {
                 setSelectedService({
                   ...entDept, 
                   instructions: lang === 'bn' ? entDept.admission_instr_bn : entDept.admission_instr
                 });
                 setActiveMapPin(null);
               }
            }}
            className={`absolute top-6 left-6 z-30 pl-4 pr-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-rose-500/20 font-bold text-sm flex items-center transition-all duration-300 transform hover:-translate-y-1 active:scale-95 active:translate-y-0 border-2 ${darkMode ? 'bg-slate-800 text-white border-rose-500' : 'bg-white text-slate-800 border-rose-500'}`}
          >
            <div className={`mr-3 p-1.5 rounded-full ${darkMode ? 'bg-rose-500/20' : 'bg-rose-50'}`}>
              <MapPin size={18} className="text-rose-600" />
            </div>
            {lang === 'bn' ? 'ইএনটি ম্যাপ' : 'ENT Map'}
          </button>

          <div className={`w-[95%] h-[70%] rounded-lg border-2 shadow-2xl relative overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
            
            {imageSrc ? (
              <div className="relative w-full h-full">
                <img src={imageSrc} className="w-full h-full object-contain" alt="Department Map" />
              </div>
            ) : (
              <>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute bottom-4 right-4 text-slate-300 font-black text-3xl select-none opacity-50">DMCH</div>
              </>
            )}

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto h-[100dvh] overflow-hidden relative flex flex-col font-sans transition-colors duration-500 shadow-[0_0_50px_-15px_rgba(0,0,0,0.3)] border-x ${getThemeClass('border')} ${getThemeClass('bg')}`}>
      <style>{`
        @keyframes crawler { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .animate-crawler { display: inline-block; white-space: nowrap; padding-left: 100%; animation: crawler 15s linear infinite; }
      `}</style>

      {/* Screen Wrapper with Smooth Transition Animation */}
      <div 
        key={screen} 
        className={`w-full flex-1 min-h-0 flex flex-col transition-all duration-500 ease-in-out 
          ${isAppLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          animate-in fade-in slide-in-from-bottom-2 duration-500`
        }
      >
        {screen === 'home' && renderHome()}
        {screen === 'search' && renderSearch()}
        {screen === 'ai' && renderAI()}
        {screen === 'map' && renderMap()}
        {screen === 'emergency' && renderEmergency()}
        {screen === 'admission' && renderAdmission()}
        {screen === 'bloodBank' && renderBloodBank()}
        {screen === 'billing' && renderBilling()}
        {screen === 'helpingHand' && renderHelpingHand()}
        {screen === 'settings' && renderSettings()}
        {screen === 'reportExplainer' && renderReportExplainer()}
        {selectedService && (
          <TestDetailModal 
            service={selectedService} 
            onClose={() => setSelectedService(null)} 
          />
        )}
      </div>

      {/* BOTTOM NAVIGATION (Visible on Root Screens) */}
      {['home', 'billing', 'helpingHand', 'settings'].includes(screen) && (
        <div className={`flex-none border-t flex items-center justify-around pb-5 pt-3 px-2 z-20 transition-colors duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <button onClick={() => navigateTo('home')} className={`flex flex-col items-center justify-center w-20 transition-all duration-200 ${screen === 'home' ? 'text-[#d70f64] scale-105' : (darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-800')}`}>
             <Home size={24} strokeWidth={screen === 'home' ? 2.5 : 2} className="mb-1" />
             <span className="text-[11px] font-bold">{t.home}</span>
          </button>
          <button onClick={() => navigateTo('billing')} className={`flex flex-col items-center justify-center w-20 transition-all duration-200 ${screen === 'billing' ? 'text-[#d70f64] scale-105' : (darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-800')}`}>
             <Receipt size={24} strokeWidth={screen === 'billing' ? 2.5 : 2} className="mb-1" />
             <span className="text-[11px] font-bold truncate max-w-full px-1">{t.billing}</span>
          </button>
          <button onClick={() => navigateTo('helpingHand')} className={`flex flex-col items-center justify-center w-20 transition-all duration-200 ${screen === 'helpingHand' ? 'text-[#d70f64] scale-105' : (darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-800')}`}>
             <HeartHandshake size={24} strokeWidth={screen === 'helpingHand' ? 2.5 : 2} className="mb-1" />
             <span className="text-[11px] font-bold truncate max-w-full px-1">{t.helpingHand}</span>
          </button>
          <button onClick={() => navigateTo('settings')} className={`flex flex-col items-center justify-center w-20 transition-all duration-200 ${screen === 'settings' ? 'text-[#d70f64] scale-105' : (darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-800')}`}>
             <SettingsIcon size={24} strokeWidth={screen === 'settings' ? 2.5 : 2} className="mb-1" />
             <span className="text-[11px] font-bold">{t.settings}</span>
          </button>
        </div>
      )}

      {/* EXIT APP MODAL TRAP */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-[320px] p-6 rounded-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 ${getThemeClass('card')}`}>
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner"><LogOut size={28} className="ml-1"/></div>
                <h3 className={`text-xl font-bold mb-2 ${getThemeClass('text')}`}>{t.exitTitle}</h3>
                <p className={`text-sm mb-6 ${getThemeClass('textSec')}`}>{t.exitDesc}</p>
                <div className="flex gap-3 w-full">
                   <button onClick={() => setShowExitModal(false)} className={`flex-1 py-3 rounded-xl font-bold transition active:scale-95 ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>{t.no}</button>
                   <button onClick={confirmExit} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-md shadow-red-500/30 transition active:scale-95">{t.yes}</button>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}