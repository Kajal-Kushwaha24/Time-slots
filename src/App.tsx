import { useState, useEffect, useCallback, useMemo, createContext, useContext, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import L from "leaflet";

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
type View = "home" | "login" | "signup" | "dashboard" | "analytics" | "tracking" | "map" | "deliveries" | "admin" | "add-delivery" | "cargo" | "add-cargo" | "cargo-admin" | "chat" | "payment";
type Role = "user" | "admin";
type Lang = "en" | "hi" | "mr";
type Theme = "dark" | "light";
type DeliveryStatus = "Draft" | "Scheduled" | "Approved" | "In Transit" | "Out for Delivery" | "Completed" | "Cancelled" | "Pending Payment";
type CargoStatus = "Pending" | "Accepted" | "Loading" | "In Transit" | "Unloading" | "Delivered" | "Rejected" | "Pending Payment";
type TimeSlot = "06:00–09:00" | "09:00–11:00" | "12:00–14:00" | "15:00–17:00";

type Delivery = {
  id: string; createdBy: string; supplierName: string; transporterName: string;
  vehiclePlate: string; retailerName: string; pickupAddress: string; dropoffAddress: string;
  contactPhone: string; goodsType: string; weight: string; notes: string;
  slot: TimeSlot; date: string; status: DeliveryStatus; progress: number;
  route: [number, number][]; pos: [number, number];
};

type CargoItem = {
  id: string; createdBy: string; cargoName: string; cargoType: string;
  cargoCategory: string; quantity: string; weightPerUnit: string; totalWeight: string;
  dimensions: string; fragile: boolean; hazardous: boolean; perishable: boolean;
  requiresRefrigeration: boolean; senderName: string; senderPhone: string;
  senderAddress: string; receiverName: string; receiverPhone: string;
  receiverAddress: string; transporterName: string; vehicleType: string;
  vehiclePlate: string; slot: TimeSlot; date: string; specialInstructions: string;
  status: CargoStatus; progress: number; trackingCode: string;
  estimatedValue: string; insuranceRequired: boolean;
};

type Message = { id: string; sender: Role; text: string; time: string; userName: string };

/* ═══════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════ */
const AppCtx = createContext<{
  lang: Lang; setLang: (l: Lang) => void;
  theme: Theme; setTheme: (t: Theme) => void;
  t: typeof T["en"];
}>({ lang: "en", setLang: () => {}, theme: "dark", setTheme: () => {}, t: {} as typeof T["en"] });
const useApp = () => useContext(AppCtx);
const cs = (dark: string, light: string, theme: Theme) => theme === "dark" ? dark : light;

/* ═══════════════════════════════════════════
   TRANSLATIONS
═══════════════════════════════════════════ */
const T = {
  en: {
    appName: "Smart Delivery System", home: "Home", login: "Login", signup: "Sign Up", logout: "Logout",
    dashboard: "Dashboard", analytics: "Analytics", tracking: "Tracking", map: "Map View",
    deliveries: "Deliveries", admin: "Admin Panel", addDelivery: "Add Delivery",
    objectives: "Objectives", features: "Features",
    cargo: "Cargo", addCargo: "Add Cargo", cargoAdmin: "Cargo Admin",
    tagline: "Smart Scheduling for Efficient and Sustainable Urban Logistics",
    heroDesc: "An intelligent logistics platform enabling suppliers, transporters, retailers, and authorities to schedule deliveries within optimized time slots.",
    exploreFeatures: "Explore Features", getStarted: "Get Started Free",
    stakeholders: "Stakeholders", trafficReduction: "Traffic Reduction",
    emissionSavings: "Emission Savings", costEfficiency: "Cost Efficiency",
    welcomeBack: "Welcome back", loginSubtitle: "Login to access your smart delivery dashboard.",
    createAccount: "Create your account", signupSubtitle: "Register as a stakeholder and start smart scheduling.",
    email: "Email address", password: "Password", displayName: "Display name",
    organization: "Organization", stakeholderRole: "Stakeholder role",
    loginAs: "Login as", user: "User", adminRole: "Admin",
    rememberMe: "Remember me", forgotPassword: "Forgot password?",
    loginBtn: "Login to Dashboard", createBtn: "Create Stakeholder Account",
    noAccount: "Don't have an account?", haveAccount: "Already have an account?",
    signupHere: "Sign up here", loginHere: "Login here", backHome: "← Back to Homepage",
    activeDeliveries: "Active Deliveries", scheduledSlots: "Scheduled Slots",
    peakReduction: "Peak Hour Reduction", routeEfficiency: "Route Efficiency",
    co2Saved: "CO₂ Emissions Saved", costReduction: "Cost Reduction",
    recentDeliveries: "Recent Deliveries", supplier: "Supplier", destination: "Destination",
    slot: "Time Slot", status: "Status", progress: "Progress", actions: "Actions",
    searchDeliveries: "Search deliveries...", allStatus: "All",
    inTransit: "In Transit", scheduled: "Scheduled", outForDelivery: "Out for Delivery",
    completed: "Completed", approved: "Approved", draft: "Draft", cancelled: "Cancelled",
    addNewDelivery: "Add New Delivery", supplierName: "Supplier Name",
    transporterName: "Transporter Name", vehiclePlate: "Vehicle Plate No.",
    retailerName: "Retailer / Recipient Name", pickupAddress: "Pickup Address",
    dropoffAddress: "Dropoff Address", contactPhone: "Contact Phone",
    goodsType: "Type of Goods", weight: "Weight (kg)", notes: "Notes (optional)",
    deliveryDate: "Delivery Date", timeSlot: "Select Time Slot",
    submitDelivery: "Submit Delivery Request", resetForm: "Reset",
    deliveryAdded: "Delivery submitted successfully!",
    adminPanel: "Admin Panel", manageDeliveries: "Manage & update all deliveries",
    changeStatus: "Change Status", editDelivery: "Edit Delivery", save: "Save", cancel: "Cancel",
    totalDeliveries: "Total Deliveries", onTimeRate: "On-Time Rate",
    avgDeliveryTime: "Avg Delivery Time", fuelSaved: "Fuel Saved",
    slotDistribution: "Delivery Slot Distribution", weeklyVolume: "Weekly Delivery Volume",
    trafficImpact: "Traffic Impact Reduction", co2Chart: "CO₂ Emissions (Monthly)",
    liveMapView: "Live Map View", activeVehicles: "Active Vehicles",
    hubsOnline: "Hubs Online", hubNetwork: "Hub Network Status",
    capacity: "Capacity", language: "Language", theme: "Theme",
    darkMode: "Dark", lightMode: "Light",
    miraInit: "Mira Bhayandar Urban Logistics Initiative", scrollExplore: "Scroll to explore",
    agree: "I agree to the platform terms and stakeholder coordination policies.",
    formTitle: "New Delivery Request", formSubtitle: "Fill in the details to schedule a delivery time slot.",
    required: "required", transporter: "Transporter", retailer: "Retailer", authority: "Authority",
    viewDetails: "View", edit: "Edit", id: "ID", date: "Date", phone: "Phone", goods: "Goods",
    pickup: "Pickup", dropoff: "Dropoff", vehicle: "Vehicle",
    // Cargo translations
    cargoManagement: "Cargo Management", cargoBooking: "Cargo Booking",
    cargoName: "Cargo Name", cargoType: "Cargo Type", cargoCategory: "Cargo Category",
    quantity: "Quantity (Units)", weightPerUnit: "Weight per Unit (kg)", totalWeight: "Total Weight (kg)",
    dimensions: "Dimensions (L×W×H cm)", fragile: "Fragile", hazardous: "Hazardous",
    perishable: "Perishable", requiresRefrigeration: "Requires Refrigeration",
    senderName: "Sender Name", senderPhone: "Sender Phone", senderAddress: "Sender Address",
    receiverName: "Receiver Name", receiverPhone: "Receiver Phone", receiverAddress: "Receiver Address",
    vehicleType: "Vehicle Type", specialInstructions: "Special Instructions",
    estimatedValue: "Estimated Value (₹)", insuranceRequired: "Insurance Required",
    submitCargo: "Submit Cargo Booking", cargoAdded: "Cargo booked successfully!",
    trackingCode: "Tracking Code", cargoDetails: "Cargo Details",
    cargoProperties: "Cargo Properties", senderInfo: "Sender Information",
    receiverInfo: "Receiver Information", transportInfo: "Transport Information",
    manageCargo: "Manage & update all cargo bookings", totalCargo: "Total Cargo",
    activeCargo: "Active Cargo", deliveredCargo: "Delivered", pendingCargo: "Pending",
    cargoTypes: "Cargo Types", cargoAnalytics: "Cargo Analytics",
    searchCargo: "Search cargo...", addNewCargo: "Add New Cargo Booking",
    cargoWeight: "Total Weight", cargoValue: "Total Value",
    myCargoBookings: "My Cargo Bookings", allCargo: "All Cargo",
    cargoFormTitle: "New Cargo Booking", cargoFormSubtitle: "Book cargo with detailed specifications and scheduling.",
    chat: "Chat Support", payment: "Payment", payNow: "Pay Now", cardHolder: "Card Holder Name",
    cardNumber: "Card Number", expiry: "Expiry Date", cvv: "CVV", paymentSuccess: "Payment Successful!",
    typeMessage: "Type a message...", sendMessage: "Send", chatWithAdmin: "Chat with Admin", chatWithUser: "Chat with User",
  },
  hi: {
    appName: "स्मार्ट डिलीवरी सिस्टम", home: "होम", login: "लॉगिन", signup: "साइन अप", logout: "लॉगआउट",
    dashboard: "डैशबोर्ड", analytics: "विश्लेषण", tracking: "ट्रैकिंग", map: "मानचित्र",
    deliveries: "डिलीवरी", admin: "एडमिन पैनल", addDelivery: "डिलीवरी जोड़ें",
    objectives: "उद्देश्य", features: "सुविधाएँ",
    cargo: "कार्गो", addCargo: "कार्गो जोड़ें", cargoAdmin: "कार्गो एडमिन",
    tagline: "कुशल और टिकाऊ शहरी रसद के लिए स्मार्ट शेड्यूलिंग",
    heroDesc: "एक बुद्धिमान लॉजिस्टिक्स प्लेटफ़ॉर्म।",
    exploreFeatures: "सुविधाएँ देखें", getStarted: "निःशुल्क शुरू करें",
    stakeholders: "हितधारक", trafficReduction: "यातायात में कमी",
    emissionSavings: "उत्सर्जन बचत", costEfficiency: "लागत दक्षता",
    welcomeBack: "वापस स्वागत है", loginSubtitle: "अपने डैशबोर्ड तक पहुँचने के लिए लॉगिन करें।",
    createAccount: "अपना खाता बनाएँ", signupSubtitle: "हितधारक के रूप में पंजीकरण करें।",
    email: "ईमेल पता", password: "पासवर्ड", displayName: "प्रदर्शन नाम",
    organization: "संगठन", stakeholderRole: "हितधारक भूमिका",
    loginAs: "इस रूप में लॉगिन करें", user: "उपयोगकर्ता", adminRole: "एडमिन",
    rememberMe: "मुझे याद रखें", forgotPassword: "पासवर्ड भूल गए?",
    loginBtn: "डैशबोर्ड में लॉगिन करें", createBtn: "हितधारक खाता बनाएँ",
    noAccount: "खाता नहीं है?", haveAccount: "पहले से खाता है?",
    signupHere: "यहाँ साइन अप करें", loginHere: "यहाँ लॉगिन करें", backHome: "← होमपेज पर वापस",
    activeDeliveries: "सक्रिय डिलीवरी", scheduledSlots: "निर्धारित स्लॉट",
    peakReduction: "पीक ऑवर में कमी", routeEfficiency: "रूट दक्षता",
    co2Saved: "CO₂ बचत", costReduction: "लागत में कमी",
    recentDeliveries: "हालिया डिलीवरी", supplier: "आपूर्तिकर्ता", destination: "गंतव्य",
    slot: "समय स्लॉट", status: "स्थिति", progress: "प्रगति", actions: "क्रियाएँ",
    searchDeliveries: "डिलीवरी खोजें...", allStatus: "सभी",
    inTransit: "पारगमन में", scheduled: "निर्धारित", outForDelivery: "डिलीवरी के लिए निकला",
    completed: "पूर्ण", approved: "अनुमोदित", draft: "मसौदा", cancelled: "रद्द",
    addNewDelivery: "नई डिलीवरी जोड़ें", supplierName: "आपूर्तिकर्ता का नाम",
    transporterName: "परिवहनकर्ता का नाम", vehiclePlate: "वाहन नंबर प्लेट",
    retailerName: "खुदरा विक्रेता / प्राप्तकर्ता का नाम", pickupAddress: "पिकअप पता",
    dropoffAddress: "ड्रॉपऑफ पता", contactPhone: "संपर्क फ़ोन",
    goodsType: "माल का प्रकार", weight: "वजन (किलो)", notes: "नोट्स (वैकल्पिक)",
    deliveryDate: "डिलीवरी तिथि", timeSlot: "समय स्लॉट चुनें",
    submitDelivery: "डिलीवरी अनुरोध सबमिट करें", resetForm: "रीसेट",
    deliveryAdded: "डिलीवरी सफलतापूर्वक सबमिट की गई!",
    adminPanel: "एडमिन पैनल", manageDeliveries: "सभी डिलीवरी प्रबंधित करें",
    changeStatus: "स्थिति बदलें", editDelivery: "डिलीवरी संपादित करें", save: "सहेजें", cancel: "रद्द करें",
    totalDeliveries: "कुल डिलीवरी", onTimeRate: "समय पर दर",
    avgDeliveryTime: "औसत डिलीवरी समय", fuelSaved: "ईंधन बचत",
    slotDistribution: "डिलीवरी स्लॉट वितरण", weeklyVolume: "साप्ताहिक डिलीवरी मात्रा",
    trafficImpact: "यातायात प्रभाव में कमी", co2Chart: "CO₂ उत्सर्जन (मासिक)",
    liveMapView: "लाइव मानचित्र दृश्य", activeVehicles: "सक्रिय वाहन",
    hubsOnline: "हब ऑनलाइन", hubNetwork: "हब नेटवर्क स्थिति",
    capacity: "क्षमता", language: "भाषा", theme: "थीम", darkMode: "डार्क", lightMode: "लाइट",
    miraInit: "मीरा भायंदर शहरी रसद पहल", scrollExplore: "और जानने के लिए स्क्रॉल करें",
    agree: "मैं प्लेटफ़ॉर्म की शर्तों से सहमत हूँ।",
    formTitle: "नई डिलीवरी अनुरोध", formSubtitle: "डिलीवरी समय स्लॉट शेड्यूल करने के लिए विवरण भरें।",
    required: "आवश्यक", transporter: "परिवहनकर्ता", retailer: "खुदरा विक्रेता", authority: "प्राधिकरण",
    viewDetails: "देखें", edit: "संपादित करें", id: "आईडी", date: "तिथि", phone: "फ़ोन", goods: "माल",
    pickup: "पिकअप", dropoff: "ड्रॉपऑफ", vehicle: "वाहन",
    cargoManagement: "कार्गो प्रबंधन", cargoBooking: "कार्गो बुकिंग",
    cargoName: "कार्गो नाम", cargoType: "कार्गो प्रकार", cargoCategory: "कार्गो श्रेणी",
    quantity: "मात्रा (इकाई)", weightPerUnit: "प्रति इकाई वजन (किलो)", totalWeight: "कुल वजन (किलो)",
    dimensions: "आयाम (L×W×H सेमी)", fragile: "नाजुक", hazardous: "खतरनाक",
    perishable: "जल्दी खराब होने वाला", requiresRefrigeration: "प्रशीतन आवश्यक",
    senderName: "प्रेषक का नाम", senderPhone: "प्रेषक फ़ोन", senderAddress: "प्रेषक पता",
    receiverName: "प्राप्तकर्ता का नाम", receiverPhone: "प्राप्तकर्ता फ़ोन", receiverAddress: "प्राप्तकर्ता पता",
    vehicleType: "वाहन प्रकार", specialInstructions: "विशेष निर्देश",
    estimatedValue: "अनुमानित मूल्य (₹)", insuranceRequired: "बीमा आवश्यक",
    submitCargo: "कार्गो बुकिंग सबमिट करें", cargoAdded: "कार्गो सफलतापूर्वक बुक किया गया!",
    trackingCode: "ट्रैकिंग कोड", cargoDetails: "कार्गो विवरण",
    cargoProperties: "कार्गो गुण", senderInfo: "प्रेषक जानकारी",
    receiverInfo: "प्राप्तकर्ता जानकारी", transportInfo: "परिवहन जानकारी",
    manageCargo: "सभी कार्गो बुकिंग प्रबंधित करें", totalCargo: "कुल कार्गो",
    activeCargo: "सक्रिय कार्गो", deliveredCargo: "डिलीवर किया", pendingCargo: "लंबित",
    cargoTypes: "कार्गो प्रकार", cargoAnalytics: "कार्गो विश्लेषण",
    searchCargo: "कार्गो खोजें...", addNewCargo: "नई कार्गो बुकिंग जोड़ें",
    cargoWeight: "कुल वजन", cargoValue: "कुल मूल्य",
    myCargoBookings: "मेरी कार्गो बुकिंग", allCargo: "सभी कार्गो",
    cargoFormTitle: "नई कार्गो बुकिंग", cargoFormSubtitle: "विस्तृत विनिर्देशों के साथ कार्गो बुक करें।",
    chat: "चैट सहायता", payment: "भुगतान", payNow: "अभी भुगतान करें", cardHolder: "कार्डधारक का नाम",
    cardNumber: "कार्ड नंबर", expiry: "समाप्ति तिथि", cvv: "CVV", paymentSuccess: "भुगतान सफल!",
    typeMessage: "संदेश टाइप करें...", sendMessage: "भेजें", chatWithAdmin: "एडमिन से चैट करें", chatWithUser: "उपयोगकर्ता से चैट करें",
  },
  mr: {
    appName: "स्मार्ट डिलिव्हरी सिस्टम", home: "मुख्यपृष्ठ", login: "लॉगिन", signup: "साइन अप", logout: "लॉगआउट",
    dashboard: "डॅशबोर्ड", analytics: "विश्लेषण", tracking: "ट्रॅकिंग", map: "नकाशा",
    deliveries: "डिलिव्हरी", admin: "अॅडमिन पॅनेल", addDelivery: "डिलिव्हरी जोडा",
    objectives: "उद्दिष्टे", features: "वैशिष्ट्ये",
    cargo: "कार्गो", addCargo: "कार्गो जोडा", cargoAdmin: "कार्गो अॅडमिन",
    tagline: "कार्यक्षम आणि शाश्वत शहरी लॉजिस्टिक्ससाठी स्मार्ट शेड्युलिंग",
    heroDesc: "एक बुद्धिमान लॉजिस्टिक्स प्लॅटफॉर्म.",
    exploreFeatures: "वैशिष्ट्ये पहा", getStarted: "मोफत सुरुवात करा",
    stakeholders: "भागधारक", trafficReduction: "वाहतूक कमी",
    emissionSavings: "उत्सर्जन बचत", costEfficiency: "खर्च कार्यक्षमता",
    welcomeBack: "पुन्हा स्वागत आहे", loginSubtitle: "तुमच्या डॅशबोर्डमध्ये प्रवेश करण्यासाठी लॉगिन करा.",
    createAccount: "तुमचे खाते तयार करा", signupSubtitle: "भागधारक म्हणून नोंदणी करा.",
    email: "ईमेल पत्ता", password: "पासवर्ड", displayName: "प्रदर्शन नाव",
    organization: "संस्था", stakeholderRole: "भागधारक भूमिका",
    loginAs: "म्हणून लॉगिन करा", user: "वापरकर्ता", adminRole: "अॅडमिन",
    rememberMe: "मला आठव", forgotPassword: "पासवर्ड विसरलात?",
    loginBtn: "डॅशबोर्डमध्ये लॉगिन करा", createBtn: "भागधारक खाते तयार करा",
    noAccount: "खाते नाही?", haveAccount: "आधीच खाते आहे?",
    signupHere: "येथे साइन अप करा", loginHere: "येथे लॉगिन करा", backHome: "← मुख्यपृष्ठावर परत",
    activeDeliveries: "सक्रिय डिलिव्हरी", scheduledSlots: "नियोजित स्लॉट",
    peakReduction: "पीक तास कमी", routeEfficiency: "मार्ग कार्यक्षमता",
    co2Saved: "CO₂ बचत", costReduction: "खर्च कमी",
    recentDeliveries: "अलीकडील डिलिव्हरी", supplier: "पुरवठादार", destination: "गंतव्य",
    slot: "वेळ स्लॉट", status: "स्थिती", progress: "प्रगती", actions: "क्रिया",
    searchDeliveries: "डिलिव्हरी शोधा...", allStatus: "सर्व",
    inTransit: "पारगमनात", scheduled: "नियोजित", outForDelivery: "डिलिव्हरीसाठी निघाले",
    completed: "पूर्ण", approved: "मंजूर", draft: "मसुदा", cancelled: "रद्द",
    addNewDelivery: "नवीन डिलिव्हरी जोडा", supplierName: "पुरवठादाराचे नाव",
    transporterName: "वाहतूकदाराचे नाव", vehiclePlate: "वाहन क्रमांक प्लेट",
    retailerName: "किरकोळ विक्रेता / प्राप्तकर्त्याचे नाव", pickupAddress: "पिकअप पत्ता",
    dropoffAddress: "ड्रॉपऑफ पत्ता", contactPhone: "संपर्क फोन",
    goodsType: "मालाचा प्रकार", weight: "वजन (किलो)", notes: "नोट्स (पर्यायी)",
    deliveryDate: "डिलिव्हरी तारीख", timeSlot: "वेळ स्लॉट निवडा",
    submitDelivery: "डिलिव्हरी विनंती सबमिट करा", resetForm: "रीसेट",
    deliveryAdded: "डिलिव्हरी यशस्वीरित्या सबमिट केली!",
    adminPanel: "अॅडमिन पॅनेल", manageDeliveries: "सर्व डिलिव्हरी व्यवस्थापित करा",
    changeStatus: "स्थिती बदला", editDelivery: "डिलिव्हरी संपादित करा", save: "जतन करा", cancel: "रद्द करा",
    totalDeliveries: "एकूण डिलिव्हरी", onTimeRate: "वेळेवर दर",
    avgDeliveryTime: "सरासरी डिलिव्हरी वेळ", fuelSaved: "इंधन बचत",
    slotDistribution: "डिलिव्हरी स्लॉट वितरण", weeklyVolume: "साप्ताहिक डिलिव्हरी खंड",
    trafficImpact: "वाहतूक प्रभाव कमी", co2Chart: "CO₂ उत्सर्जन (मासिक)",
    liveMapView: "लाइव्ह नकाशा दृश्य", activeVehicles: "सक्रिय वाहने",
    hubsOnline: "हब ऑनलाइन", hubNetwork: "हब नेटवर्क स्थिती",
    capacity: "क्षमता", language: "भाषा", theme: "थीम", darkMode: "डार्क", lightMode: "लाइट",
    miraInit: "मीरा भायंदर शहरी लॉजिस्टिक्स उपक्रम", scrollExplore: "अधिक जाणून घेण्यासाठी स्क्रोल करा",
    agree: "मी प्लॅटफॉर्मच्या अटींशी सहमत आहे.",
    formTitle: "नवीन डिलिव्हरी विनंती", formSubtitle: "डिलिव्हरी वेळ स्लॉट शेड्युल करण्यासाठी तपशील भरा.",
    required: "आवश्यक", transporter: "वाहतूकदार", retailer: "किरकोळ विक्रेता", authority: "अधिकारी",
    viewDetails: "पहा", edit: "संपादित करा", id: "आयडी", date: "तारीख", phone: "फोन", goods: "माल",
    pickup: "पिकअप", dropoff: "ड्रॉपऑफ", vehicle: "वाहन",
    cargoManagement: "कार्गो व्यवस्थापन", cargoBooking: "कार्गो बुकिंग",
    cargoName: "कार्गो नाव", cargoType: "कार्गो प्रकार", cargoCategory: "कार्गो श्रेणी",
    quantity: "प्रमाण (युनिट)", weightPerUnit: "प्रति युनिट वजन (किलो)", totalWeight: "एकूण वजन (किलो)",
    dimensions: "परिमाण (L×W×H सेमी)", fragile: "नाजूक", hazardous: "धोकादायक",
    perishable: "लवकर खराब होणारे", requiresRefrigeration: "प्रशीतन आवश्यक",
    senderName: "प्रेषकाचे नाव", senderPhone: "प्रेषक फोन", senderAddress: "प्रेषक पत्ता",
    receiverName: "प्राप्तकर्त्याचे नाव", receiverPhone: "प्राप्तकर्ता फोन", receiverAddress: "प्राप्तकर्ता पत्ता",
    vehicleType: "वाहन प्रकार", specialInstructions: "विशेष सूचना",
    estimatedValue: "अंदाजे मूल्य (₹)", insuranceRequired: "विमा आवश्यक",
    submitCargo: "कार्गो बुकिंग सबमिट करा", cargoAdded: "कार्गो यशस्वीरित्या बुक केले!",
    trackingCode: "ट्रॅकिंग कोड", cargoDetails: "कार्गो तपशील",
    cargoProperties: "कार्गो गुणधर्म", senderInfo: "प्रेषक माहिती",
    receiverInfo: "प्राप्तकर्ता माहिती", transportInfo: "वाहतूक माहिती",
    manageCargo: "सर्व कार्गो बुकिंग व्यवस्थापित करा", totalCargo: "एकूण कार्गो",
    activeCargo: "सक्रिय कार्गो", deliveredCargo: "वितरित केले", pendingCargo: "प्रलंबित",
    cargoTypes: "कार्गो प्रकार", cargoAnalytics: "कार्गो विश्लेषण",
    searchCargo: "कार्गो शोधा...", addNewCargo: "नवीन कार्गो बुकिंग जोडा",
    cargoWeight: "एकूण वजन", cargoValue: "एकूण मूल्य",
    myCargoBookings: "माझ्या कार्गो बुकिंग", allCargo: "सर्व कार्गो",
    cargoFormTitle: "नवीन कार्गो बुकिंग", cargoFormSubtitle: "तपशीलवार वैशिष्ट्यांसह कार्गो बुक करा.",
    chat: "चॅट सपोर्ट", payment: "पेमेंट", payNow: "आत्ता पैसे द्या", cardHolder: "कार्डधारकाचे नाव",
    cardNumber: "कार्ड नंबर", expiry: "समाप्ती तारीख", cvv: "CVV", paymentSuccess: "पेमेंट यशस्वी!",
    typeMessage: "संदेश टाइप करा...", sendMessage: "पाठवा", chatWithAdmin: "अॅडमिनशी चॅट करा", chatWithUser: "वापरकर्त्याशी चॅट करा",
  },
};

/* ═══════════════════════════════════════════
   SAMPLE DATA
═══════════════════════════════════════════ */
const ROUTES: Record<string, [number,number][]> = {
  r1: [[19.2955,72.8535],[19.298,72.856],[19.301,72.859],[19.3045,72.8545],[19.307,72.851],[19.3145,72.858]],
  r2: [[19.2955,72.8535],[19.293,72.851],[19.289,72.849],[19.285,72.8505],[19.2735,72.852]],
  r3: [[19.3145,72.858],[19.308,72.862],[19.301,72.865],[19.296,72.869],[19.292,72.872]],
  r4: [[19.2735,72.852],[19.278,72.857],[19.283,72.862],[19.289,72.866],[19.295,72.862]],
  r5: [[19.292,72.872],[19.295,72.868],[19.298,72.863],[19.3,72.857],[19.2955,72.8535]],
  r6: [[19.295,72.862],[19.298,72.858],[19.3015,72.8545],[19.305,72.851],[19.307,72.848]],
};

const INIT_DELIVERIES: Delivery[] = [
  { id:"DLV-001", createdBy:"user", supplierName:"Ravi Traders", transporterName:"FastMove Logistics", vehiclePlate:"MH04 AB1234", retailerName:"Green Mart", pickupAddress:"MIDC, Mira Road", dropoffAddress:"Bhayandar East Market", contactPhone:"9876543210", goodsType:"FMCG", weight:"450", notes:"Handle with care", slot:"06:00–09:00", date:"2025-02-10", status:"In Transit", progress:65, route:ROUTES.r1, pos:ROUTES.r1[0] },
  { id:"DLV-002", createdBy:"user", supplierName:"Kumar Wholesale", transporterName:"CityCart Express", vehiclePlate:"MH04 CD5678", retailerName:"Daily Needs Store", pickupAddress:"Mira Road Station Area", dropoffAddress:"Navghar, Bhayandar", contactPhone:"9123456780", goodsType:"Groceries", weight:"320", notes:"", slot:"09:00–11:00", date:"2025-02-10", status:"Scheduled", progress:15, route:ROUTES.r2, pos:ROUTES.r2[0] },
  { id:"DLV-003", createdBy:"user", supplierName:"Metro Supplies", transporterName:"QuickHaul", vehiclePlate:"MH04 EF9012", retailerName:"City Superstore", pickupAddress:"North Hub Depot", dropoffAddress:"East Hub Zone", contactPhone:"9988776655", goodsType:"Electronics", weight:"180", notes:"Fragile electronics", slot:"06:00–09:00", date:"2025-02-10", status:"Out for Delivery", progress:82, route:ROUTES.r3, pos:ROUTES.r3[0] },
  { id:"DLV-004", createdBy:"user", supplierName:"Coastal Traders", transporterName:"BlueLine Transport", vehiclePlate:"MH04 GH3456", retailerName:"Harbor Retail", pickupAddress:"South Hub", dropoffAddress:"Main Depot", contactPhone:"8877665544", goodsType:"Textiles", weight:"600", notes:"", slot:"12:00–14:00", date:"2025-02-10", status:"Approved", progress:30, route:ROUTES.r4, pos:ROUTES.r4[0] },
  { id:"DLV-005", createdBy:"user", supplierName:"PrimePack Co.", transporterName:"SwiftCargo", vehiclePlate:"MH04 IJ7890", retailerName:"Prime Outlet", pickupAddress:"East Hub", dropoffAddress:"Central Hub", contactPhone:"7766554433", goodsType:"Packaged Food", weight:"250", notes:"Temperature sensitive", slot:"15:00–17:00", date:"2025-02-10", status:"Completed", progress:100, route:ROUTES.r5, pos:ROUTES.r5[ROUTES.r5.length-1] },
  { id:"DLV-006", createdBy:"user", supplierName:"AutoParts Hub", transporterName:"TruckZone", vehiclePlate:"MH04 KL2345", retailerName:"Mechanical World", pickupAddress:"Main Depot", dropoffAddress:"Workshop Area", contactPhone:"6655443322", goodsType:"Auto Parts", weight:"780", notes:"Heavy load", slot:"09:00–11:00", date:"2025-02-10", status:"Draft", progress:5, route:ROUTES.r6, pos:ROUTES.r6[0] },
];

const CARGO_CATEGORIES = ["General Goods","Perishables","Electronics","Pharmaceuticals","Chemicals","Textiles","Automotive Parts","Furniture","Construction Materials","Agricultural Products","Cold Chain","Hazardous Materials"];
const VEHICLE_TYPES = ["Mini Truck (1T)","Small Truck (2T)","Medium Truck (5T)","Large Truck (10T)","Container Truck (20T)","Refrigerated Van","Tanker","Flatbed Truck"];
const GOODS_TYPES = ["FMCG","Groceries","Electronics","Textiles","Pharmaceuticals","Auto Parts","Furniture","Chemicals","Agricultural Products","Packaged Food","Building Materials","Cold Storage Goods"];

const INIT_CARGO: CargoItem[] = [
  { id:"CRG-001", createdBy:"user", cargoName:"Pharmaceutical Batch A1", cargoType:"Pharmaceuticals", cargoCategory:"Pharmaceuticals", quantity:"500", weightPerUnit:"0.5", totalWeight:"250", dimensions:"60×40×30", fragile:true, hazardous:false, perishable:true, requiresRefrigeration:true, senderName:"MedCorp India", senderPhone:"9876543200", senderAddress:"MIDC, Mira Road", receiverName:"City Hospital", receiverPhone:"9988776600", receiverAddress:"Bhayandar East", transporterName:"ColdChain Express", vehicleType:"Refrigerated Van", vehiclePlate:"MH04 RF001", slot:"06:00–09:00", date:"2025-02-10", specialInstructions:"Keep at 2-8°C at all times", status:"In Transit", progress:70, trackingCode:"TRK-A1B2C3", estimatedValue:"150000", insuranceRequired:true },
  { id:"CRG-002", createdBy:"user", cargoName:"Consumer Electronics Batch", cargoType:"Electronics", cargoCategory:"Electronics", quantity:"200", weightPerUnit:"1.2", totalWeight:"240", dimensions:"80×60×50", fragile:true, hazardous:false, perishable:false, requiresRefrigeration:false, senderName:"TechWorld Distributors", senderPhone:"9123456700", senderAddress:"North Hub Area", receiverName:"Electronics Mart", receiverPhone:"9876500001", receiverAddress:"Navghar Market", transporterName:"SecureHaul", vehicleType:"Medium Truck (5T)", vehiclePlate:"MH04 ST002", slot:"09:00–11:00", date:"2025-02-10", specialInstructions:"Fragile - Do not stack more than 3 high", status:"Pending", progress:10, trackingCode:"TRK-D4E5F6", estimatedValue:"500000", insuranceRequired:true },
  { id:"CRG-003", createdBy:"user", cargoName:"Agricultural Produce", cargoType:"Agricultural Products", cargoCategory:"Perishables", quantity:"1000", weightPerUnit:"1.0", totalWeight:"1000", dimensions:"100×80×60", fragile:false, hazardous:false, perishable:true, requiresRefrigeration:false, senderName:"Fresh Farms Co.", senderPhone:"8877665500", senderAddress:"Rural Supply Depot", receiverName:"Wholesale Vegetable Market", receiverPhone:"7766554400", receiverAddress:"Bhayandar West", transporterName:"QuickDeliver", vehicleType:"Large Truck (10T)", vehiclePlate:"MH04 QD003", slot:"06:00–09:00", date:"2025-02-11", specialInstructions:"Deliver before 9 AM for freshness", status:"Accepted", progress:25, trackingCode:"TRK-G7H8I9", estimatedValue:"45000", insuranceRequired:false },
  { id:"CRG-004", createdBy:"user", cargoName:"Construction Steel Rods", cargoType:"Automotive Parts", cargoCategory:"Construction Materials", quantity:"50", weightPerUnit:"20", totalWeight:"1000", dimensions:"600×10×10", fragile:false, hazardous:false, perishable:false, requiresRefrigeration:false, senderName:"SteelMax Industries", senderPhone:"6655443300", senderAddress:"Industrial Zone", receiverName:"BuildRight Construction", receiverPhone:"5544332200", receiverAddress:"New Project Site", transporterName:"HeavyHaul Corp", vehicleType:"Flatbed Truck", vehiclePlate:"MH04 HH004", slot:"12:00–14:00", date:"2025-02-11", specialInstructions:"Use crane for unloading", status:"Delivered", progress:100, trackingCode:"TRK-J0K1L2", estimatedValue:"200000", insuranceRequired:true },
  { id:"CRG-005", createdBy:"user", cargoName:"Textile Fabric Rolls", cargoType:"Textiles", cargoCategory:"Textiles", quantity:"300", weightPerUnit:"3", totalWeight:"900", dimensions:"150×20×20", fragile:false, hazardous:false, perishable:false, requiresRefrigeration:false, senderName:"FabricHub Exports", senderPhone:"9900112233", senderAddress:"Textile Warehouse", receiverName:"Fashion Boutique Chain", receiverPhone:"8811223344", receiverAddress:"Commercial Area", transporterName:"TextileMover", vehicleType:"Small Truck (2T)", vehiclePlate:"MH04 TM005", slot:"15:00–17:00", date:"2025-02-12", specialInstructions:"Keep dry - protect from moisture", status:"Loading", progress:40, trackingCode:"TRK-M3N4O5", estimatedValue:"75000", insuranceRequired:false },
];

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [view, setView] = useState<View>("home");
  const [role, setRole] = useState<Role>("user");
  const [userName, setUserName] = useState("");
  const [deliveries, setDeliveries] = useState<Delivery[]>(INIT_DELIVERIES);
  const [cargoList, setCargoList] = useState<CargoItem[]>(INIT_CARGO);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "admin", userName: "System", text: "Welcome to SmartSlot support! How can we help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [toast, setToast] = useState("");
  const t = T[lang];

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const isLoggedIn = !!userName;

  const bg = cs("bg-slate-950 text-white", "bg-gray-50 text-gray-900", theme);
  const navBg = cs("bg-slate-950/95 border-slate-800", "bg-white/95 border-gray-200", theme);

  return (
    <AppCtx.Provider value={{ lang, setLang, theme, setTheme, t }}>
      <div className={`min-h-screen ${bg} transition-colors duration-300`}>
        {/* NAVBAR */}
        <Navbar view={view} setView={setView} isLoggedIn={isLoggedIn} role={role}
          userName={userName} onLogout={() => { setUserName(""); setRole("user"); setView("home"); }}
          navBg={navBg} />

        {/* TOAST */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-bounce">
            ✓ {toast}
          </div>
        )}

        {/* VIEWS */}
        {view === "home" && <HomePage setView={setView} />}
        {view === "login" && <LoginPage onBack={() => setView("home")} onSwitch={() => setView("signup")} onSuccess={(r, n) => { setRole(r); setUserName(n); setView("dashboard"); }} />}
        {view === "signup" && <SignupPage onBack={() => setView("home")} onSwitch={() => setView("login")} onSuccess={(r, n) => { setRole(r); setUserName(n); setView("dashboard"); }} />}
        {isLoggedIn && (
          <DashboardShell view={view} setView={setView} role={role} userName={userName}>
            {view === "dashboard" && <DashboardHome deliveries={deliveries} cargoList={cargoList} setView={setView} />}
            {view === "analytics" && <AnalyticsView deliveries={deliveries} cargoList={cargoList} />}
            {view === "tracking" && <TrackingView deliveries={deliveries} />}
            {view === "map" && <MapView deliveries={deliveries} />}
            {view === "deliveries" && <DeliveriesView deliveries={deliveries} setView={setView} role={role} userName={userName} />}
            {view === "add-delivery" && <AddDeliveryView onAdd={(d) => { setDeliveries(prev => [d, ...prev]); showToast(t.deliveryAdded); setView("deliveries"); }} />}
            {view === "admin" && role === "admin" && <AdminView deliveries={deliveries} setDeliveries={setDeliveries} />}
            {view === "cargo" && <CargoView cargoList={cargoList} setView={setView} role={role} userName={userName} />}
            {view === "add-cargo" && <AddCargoView onAdd={(c) => { setCargoList(prev => [c, ...prev]); showToast(t.cargoAdded); setView("cargo"); }} />}
            {view === "cargo-admin" && role === "admin" && <CargoAdminView cargoList={cargoList} setCargoList={setCargoList} />}
            {view === "chat" && <ChatView role={role} userName={userName} messages={messages} setMessages={setMessages} />}
          </DashboardShell>
        )}
      </div>
    </AppCtx.Provider>
  );
}

/* ═══════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
function Navbar({ view, setView, isLoggedIn, userName, onLogout, navBg }: {
  view: View; setView: (v: View) => void; isLoggedIn: boolean; role?: Role;
  userName: string; onLogout: () => void; navBg: string;
}) {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sub = cs("text-slate-400", "text-gray-500", theme);

  return (
    <nav className={`fixed top-0 inset-x-0 z-40 border-b backdrop-blur-md ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button onClick={() => setView(isLoggedIn ? "dashboard" : "home")} className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm">SD</span>
          <span className="hidden sm:block">{t.appName}</span>
        </button>

        {!isLoggedIn && (
          <div className="hidden md:flex items-center gap-6 text-sm">
            {(["home","objectives","features"] as const).map(s => (
              <button key={s} onClick={() => { setView("home"); setTimeout(() => document.getElementById(s)?.scrollIntoView({ behavior:"smooth" }), 100); }}
                className={`capitalize transition-colors ${cs("hover:text-cyan-400","hover:text-cyan-600",theme)}`}>
                {t[s as keyof typeof t] as string}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Language */}
          <select value={lang} onChange={e => setLang(e.target.value as Lang)}
            className={`text-xs rounded-lg border px-2 py-1.5 outline-none cursor-pointer ${cs("bg-slate-900 border-slate-700 text-slate-300","bg-white border-gray-200 text-gray-700",theme)}`}>
            <option value="en">EN</option>
            <option value="hi">हि</option>
            <option value="mr">म</option>
          </select>

          {/* Theme */}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {!isLoggedIn ? (
            <>
              <button onClick={() => setView("login")} className={`hidden sm:block text-sm px-3 py-1.5 rounded-lg border transition ${cs("border-slate-700 hover:bg-slate-800 text-slate-300","border-gray-200 hover:bg-gray-100 text-gray-700",theme)}`}>{t.login}</button>
              <button onClick={() => setView("signup")} className="text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition">{t.signup}</button>
            </>
          ) : (
            <>
              <span className={`hidden sm:block text-xs ${sub}`}>{userName}</span>
              <button onClick={onLogout} className={`text-sm px-3 py-1.5 rounded-lg border transition ${cs("border-slate-700 hover:bg-slate-800 text-slate-300","border-gray-200 hover:bg-gray-100 text-gray-700",theme)}`}>{t.logout}</button>
            </>
          )}

          <button className="md:hidden" onClick={() => setMobileOpen(o => !o)}>
            <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`md:hidden border-t px-4 py-3 space-y-2 ${cs("border-slate-800 bg-slate-950","border-gray-200 bg-white",theme)}`}>
          {!isLoggedIn && (["home","objectives","features"] as const).map(s => (
            <button key={s} onClick={() => { setMobileOpen(false); setView("home"); setTimeout(() => document.getElementById(s)?.scrollIntoView({ behavior:"smooth" }), 100); }}
              className={`block w-full text-left text-sm py-2 capitalize ${cs("text-slate-300","text-gray-700",theme)}`}>
              {t[s as keyof typeof t] as string}
            </button>
          ))}
          {isLoggedIn && [
            { v:"dashboard", label:t.dashboard }, { v:"analytics", label:t.analytics },
            { v:"tracking", label:t.tracking }, { v:"map", label:t.map },
            { v:"deliveries", label:t.deliveries }, { v:"cargo", label:t.cargo },
          ].map(i => (
            <button key={i.v} onClick={() => { setView(i.v as View); setMobileOpen(false); }}
              className={`block w-full text-left text-sm py-2 ${view===i.v?"text-cyan-400":cs("text-slate-300","text-gray-700",theme)}`}>{i.label}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD SHELL
═══════════════════════════════════════════ */
function DashboardShell({ view, setView, role, userName, children }: {
  view: View; setView: (v: View) => void; role: Role; userName: string; children: React.ReactNode;
}) {
  const { t, theme } = useApp();
  const sidebarBg = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);

  const tabs = [
    { v:"dashboard", icon:"🏠", label:t.dashboard },
    ...(role === "admin" ? [{ v:"analytics", icon:"📊", label:t.analytics }] : []),
    { v:"tracking", icon:"📍", label:t.tracking },
    { v:"map", icon:"🗺️", label:t.map },
    { v:"deliveries", icon:"🚚", label:t.deliveries },
    { v:"cargo", icon:"📦", label:t.cargo },
    { v:"chat", icon:"💬", label:t.chat },
    ...(role === "admin" ? [{ v:"admin", icon:"🛡️", label:t.admin }, { v:"cargo-admin", icon:"📋", label:t.cargoAdmin }] : []),
  ];

  return (
    <div className="flex pt-16 min-h-screen">
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col w-56 shrink-0 fixed top-16 bottom-0 border-r overflow-y-auto ${sidebarBg}`}>
        <div className={`p-4 border-b ${cs("border-slate-800","border-gray-200",theme)}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold truncate max-w-[100px]">{userName}</p>
              <p className={`text-xs ${sub}`}>{role === "admin" ? t.adminRole : t.user}</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {tabs.map(tab => (
            <button key={tab.v} onClick={() => setView(tab.v as View)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === tab.v
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                  : cs("text-slate-400 hover:bg-slate-800 hover:text-white","text-gray-600 hover:bg-gray-100 hover:text-gray-900",theme)
              }`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        <div className={`p-3 border-t ${cs("border-slate-800","border-gray-200",theme)}`}>
          <div className={`rounded-xl p-3 ${cs("bg-slate-800/50","bg-gray-50",theme)}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium">System Online</span>
            </div>
            <p className={`text-xs ${sub}`}>All services active</p>
          </div>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className={`lg:hidden fixed bottom-0 inset-x-0 z-30 border-t ${cs("bg-slate-950 border-slate-800","bg-white border-gray-200",theme)}`}>
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.v} onClick={() => setView(tab.v as View)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] text-xs transition-colors ${view===tab.v?"text-cyan-400":sub}`}>
              <span className="text-lg">{tab.icon}</span>
              <span className="truncate max-w-[52px] text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 lg:ml-56 pb-20 lg:pb-0 min-h-[calc(100vh-4rem)] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOMEPAGE
═══════════════════════════════════════════ */
function HomePage({ setView }: { setView: (v: View) => void }) {
  const { t, theme } = useApp();
  const sub = cs("text-slate-400", "text-gray-600", theme);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section id="home" className="relative min-h-[92vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-500/8 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-blue-600/8 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-6 text-cyan-400 text-xs font-medium uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> {t.miraInit}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 leading-tight">
            Time-Slot Based<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">Smart Delivery System</span>
          </h1>
          <p className={`text-lg mb-3 font-medium ${cs("text-slate-300","text-gray-700",theme)}`}>{t.tagline}</p>
          <p className={`text-sm max-w-2xl mx-auto mb-8 leading-relaxed ${sub}`}>{t.heroDesc}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button onClick={() => setView("signup")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-cyan-500/20">{t.getStarted}</button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior:"smooth" })} className={`px-6 py-3 rounded-xl border font-semibold transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>{t.exploreFeatures}</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[{label:t.stakeholders,value:"4+",icon:"👥",color:"from-cyan-500 to-blue-600"},{label:t.trafficReduction,value:"42%",icon:"🚦",color:"from-violet-500 to-purple-600"},{label:t.emissionSavings,value:"35%",icon:"🌿",color:"from-green-500 to-emerald-600"},{label:t.costEfficiency,value:"28%",icon:"💰",color:"from-amber-500 to-orange-600"}].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 text-center ${cs("border-slate-800 bg-slate-900/60","border-gray-200 bg-white shadow-sm",theme)}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mx-auto mb-2`}>{s.icon}</div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className={`text-xs mt-1 ${sub}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section id="objectives" className={`py-20 px-4 border-t ${cs("border-slate-800/50","border-gray-200",theme)}`}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader tag="Objectives" title="System Objectives" subtitle="Core goals driving the Smart Delivery System to transform urban logistics." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { n:"01", title:"Centralized Scheduling", desc:"Create a unified platform for scheduling delivery time slots across all stakeholders.", icon:"🗓️" },
              { n:"02", title:"Reduce Congestion", desc:"Cut peak-hour traffic congestion through optimized off-peak delivery windows.", icon:"🚦" },
              { n:"03", title:"Shared Scheduling", desc:"Enable collaborative delivery planning among suppliers and transporters.", icon:"🤝" },
              { n:"04", title:"AI Route Optimization", desc:"Optimize delivery routes using artificial intelligence for maximum efficiency.", icon:"🤖" },
              { n:"05", title:"Stakeholder Coordination", desc:"Improve coordination between logistics stakeholders and municipal authorities.", icon:"📡" },
              { n:"06", title:"Scalable Model", desc:"Develop a replicable system model deployable across other Indian cities.", icon:"🌍" },
            ].map(o => (
              <div key={o.n} className={`rounded-2xl border p-6 hover:border-cyan-500/40 transition-all group ${cs("border-slate-800 bg-slate-900/50","border-gray-200 bg-white shadow-sm",theme)}`}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{o.icon}</span>
                  <div>
                    <span className="text-xs text-cyan-400 font-mono font-bold">{o.n}</span>
                    <h3 className="font-semibold mt-1 mb-2">{o.title}</h3>
                    <p className={`text-sm leading-relaxed ${sub}`}>{o.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`py-20 px-4 border-t ${cs("border-slate-800/50","border-gray-200",theme)}`}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader tag="Features" title="System Features" subtitle="A comprehensive intelligent logistics platform built for modern urban delivery challenges." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon:"🕐", title:"Smart Time Slots", desc:"Schedule deliveries in 4 optimized daily time windows.", grad:"from-cyan-500 to-blue-600" },
              { icon:"📦", title:"Cargo Management", desc:"Full cargo lifecycle tracking from booking to delivery.", grad:"from-violet-500 to-purple-600" },
              { icon:"🤖", title:"AI Route Optimization", desc:"Machine learning powered route planning for efficiency.", grad:"from-blue-500 to-indigo-600" },
              { icon:"📍", title:"Real-time Tracking", desc:"Live GPS-based delivery status and location updates.", grad:"from-green-500 to-emerald-600" },
              { icon:"🗺️", title:"Interactive Map", desc:"Live delivery map with hub network visualization.", grad:"from-amber-500 to-orange-600" },
              { icon:"📊", title:"Analytics Dashboard", desc:"Comprehensive insights on deliveries and performance.", grad:"from-pink-500 to-rose-600" },
              { icon:"🌿", title:"Eco Sustainability", desc:"Reduced emissions through coordinated logistics.", grad:"from-teal-500 to-green-600" },
              { icon:"🛡️", title:"Admin Control", desc:"Full administrative control over all deliveries and cargo.", grad:"from-red-500 to-rose-600" },
            ].map(f => (
              <div key={f.title} className={`rounded-2xl border p-5 hover:border-cyan-500/30 transition-all ${cs("border-slate-800 bg-slate-900/50","border-gray-200 bg-white shadow-sm",theme)}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.grad} flex items-center justify-center text-xl mb-4`}>{f.icon}</div>
                <h3 className="font-semibold mb-2 text-sm">{f.title}</h3>
                <p className={`text-xs leading-relaxed ${sub}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-10 px-4 text-center ${cs("border-slate-800","border-gray-200",theme)}`}>
        <p className={`text-sm ${cs("text-slate-500","text-gray-500",theme)}`}>© 2025 Time-Slot Based Smart Delivery System — Mira Bhayandar Urban Logistics Initiative</p>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD HOME
═══════════════════════════════════════════ */
function DashboardHome({ deliveries, cargoList, setView }: { deliveries: Delivery[]; cargoList: CargoItem[]; setView: (v:View)=>void }) {
  const { t, theme } = useApp();
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);

  const activeDeliveries = deliveries.filter(d => d.status === "In Transit" || d.status === "Out for Delivery").length;
  const activeCargo = cargoList.filter(c => c.status === "In Transit" || c.status === "Loading").length;
  const totalCargoWeight = cargoList.reduce((s, c) => s + parseFloat(c.totalWeight || "0"), 0);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🏠 {t.dashboard}</h1>
          <p className={`text-sm mt-1 ${sub}`}>Mira Bhayandar Smart Delivery Operations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className={`text-xs ${sub}`}>Live</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:t.activeDeliveries, value:String(activeDeliveries), icon:"🚚", grad:"from-cyan-500 to-blue-600", change:"+3 today" },
          { label:t.activeCargo, value:String(activeCargo), icon:"📦", grad:"from-violet-500 to-purple-600", change:"+2 today" },
          { label:t.peakReduction, value:"42%", icon:"🚦", grad:"from-green-500 to-emerald-600", change:"↑ 5% vs last week" },
          { label:t.co2Saved, value:"2.4T", icon:"🌿", grad:"from-amber-500 to-orange-600", change:"This month" },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl p-5 ${card}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className={`text-xs mt-1 ${sub}`}>{s.label}</p>
            <p className="text-xs text-emerald-400 mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { v:"deliveries", icon:"🚚", label:t.deliveries, desc:`${deliveries.length} total deliveries`, color:"border-cyan-500/30 hover:bg-cyan-500/5" },
          { v:"cargo", icon:"📦", label:t.cargo, desc:`${cargoList.length} cargo bookings · ${totalCargoWeight.toFixed(0)}kg`, color:"border-violet-500/30 hover:bg-violet-500/5" },
          { v:"analytics", icon:"📊", label:t.analytics, desc:"Performance metrics & insights", color:"border-blue-500/30 hover:bg-blue-500/5" },
          { v:"map", icon:"🗺️", label:t.map, desc:"Live vehicle & route tracking", color:"border-green-500/30 hover:bg-green-500/5" },
        ].map(q => (
          <button key={q.v} onClick={() => setView(q.v as View)} className={`border rounded-2xl p-5 text-left transition-all ${card} ${q.color}`}>
            <span className="text-3xl mb-3 block">{q.icon}</span>
            <p className="font-semibold">{q.label}</p>
            <p className={`text-xs mt-1 ${sub}`}>{q.desc}</p>
          </button>
        ))}
      </div>

      {/* Recent Deliveries & Cargo */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`border rounded-2xl ${card}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${cs("border-slate-800","border-gray-200",theme)}`}>
            <h2 className="font-semibold text-sm">🚚 {t.recentDeliveries}</h2>
            <button onClick={() => setView("deliveries")} className="text-xs text-cyan-400 hover:text-cyan-300">{t.viewDetails}</button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {deliveries.slice(0, 4).map(d => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.id}</p>
                  <p className={`text-xs truncate ${sub}`}>{d.supplierName} → {d.retailerName}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        <div className={`border rounded-2xl ${card}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${cs("border-slate-800","border-gray-200",theme)}`}>
            <h2 className="font-semibold text-sm">📦 {t.allCargo}</h2>
            <button onClick={() => setView("cargo")} className="text-xs text-cyan-400 hover:text-cyan-300">{t.viewDetails}</button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {cargoList.slice(0, 4).map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.cargoName}</p>
                  <p className={`text-xs truncate ${sub}`}>{c.totalWeight}kg · {c.cargoType}</p>
                </div>
                <CargoStatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CARGO VIEW (User)
═══════════════════════════════════════════ */
function CargoView({ cargoList, setView, role }: { cargoList: CargoItem[]; setView: (v: View) => void; role: Role; userName?: string }) {
  const { t, theme } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500/60","bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500",theme);

  const userCargo = role === "admin" ? cargoList : cargoList.filter(c => c.createdBy === "user");
  const filtered = userCargo.filter(c => {
    const matchSearch = !search || c.cargoName.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()) || c.senderName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["All","Pending","Accepted","Loading","In Transit","Unloading","Delivered","Rejected"];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">📦 {t.cargo}</h1>
          <p className={`text-sm mt-1 ${sub}`}>{t.cargoManagement}</p>
        </div>
        <button onClick={() => setView("add-cargo")} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
          <span>+</span> {t.addNewCargo}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:t.totalCargo, value:String(userCargo.length), icon:"📦", grad:"from-violet-500 to-purple-600" },
          { label:t.activeCargo, value:String(userCargo.filter(c=>["Loading","In Transit","Unloading"].includes(c.status)).length), icon:"🚛", grad:"from-cyan-500 to-blue-600" },
          { label:t.deliveredCargo, value:String(userCargo.filter(c=>c.status==="Delivered").length), icon:"✅", grad:"from-green-500 to-emerald-600" },
          { label:t.cargoWeight, value:`${userCargo.reduce((s,c)=>s+parseFloat(c.totalWeight||"0"),0).toFixed(0)}kg`, icon:"⚖️", grad:"from-amber-500 to-orange-600" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${card}`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center text-base mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className={`text-xs mt-0.5 ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className={`border rounded-xl p-4 flex flex-wrap gap-3 ${card}`}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchCargo}
          className={`flex-1 min-w-48 rounded-lg border px-3 py-2 text-sm outline-none transition ${inputCls}`} />
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter===s?"bg-violet-500/20 text-violet-300 border border-violet-500/40":cs("border border-slate-700 text-slate-400 hover:bg-slate-800","border border-gray-200 text-gray-600 hover:bg-gray-50",theme)}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cargo Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(c => (
          <CargoCard key={c.id} cargo={c} theme={theme} />
        ))}
        {filtered.length === 0 && (
          <div className={`col-span-3 text-center py-16 border rounded-2xl ${card}`}>
            <p className="text-4xl mb-3">📦</p>
            <p className={`text-sm ${sub}`}>No cargo found. Try adjusting your filters.</p>
            <button onClick={() => setView("add-cargo")} className="mt-4 px-4 py-2 rounded-xl bg-violet-500/20 text-violet-300 text-sm border border-violet-500/30 hover:bg-violet-500/30 transition">
              + {t.addNewCargo}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CargoCard({ cargo: c, theme }: { cargo: CargoItem; theme: Theme }) {
  const { t } = useApp();
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const rowBg = cs("bg-slate-800/50", "bg-gray-50", theme);

  return (
    <div className={`border rounded-2xl p-5 hover:border-violet-500/40 transition-all ${card}`}>
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{c.cargoName}</p>
          <p className={`text-xs mt-0.5 font-mono ${sub}`}>{c.id}</p>
        </div>
        <CargoStatusBadge status={c.status} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {c.fragile && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] border border-amber-500/30">⚠️ Fragile</span>}
        {c.hazardous && <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] border border-red-500/30">☢️ Hazardous</span>}
        {c.perishable && <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] border border-orange-500/30">🕐 Perishable</span>}
        {c.requiresRefrigeration && <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] border border-blue-500/30">❄️ Cold Chain</span>}
        {c.insuranceRequired && <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] border border-green-500/30">🛡️ Insured</span>}
      </div>

      <div className={`rounded-xl p-3 space-y-1.5 mb-3 text-xs ${rowBg}`}>
        <div className="flex justify-between"><span className={sub}>{t.cargoType}</span><span className="font-medium">{c.cargoType}</span></div>
        <div className="flex justify-between"><span className={sub}>{t.totalWeight}</span><span className="font-medium">{c.totalWeight} kg</span></div>
        <div className="flex justify-between"><span className={sub}>{t.quantity}</span><span className="font-medium">{c.quantity} units</span></div>
        <div className="flex justify-between"><span className={sub}>{t.slot}</span><span className="font-medium text-cyan-400">{c.slot}</span></div>
        <div className="flex justify-between"><span className={sub}>{t.trackingCode}</span><span className="font-mono text-violet-400">{c.trackingCode}</span></div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className={sub}>{t.progress}</span>
          <span className="font-medium">{c.progress}%</span>
        </div>
        <div className={`h-1.5 rounded-full ${cs("bg-slate-800","bg-gray-200",theme)}`}>
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all" style={{ width:`${c.progress}%` }} />
        </div>
      </div>

      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2"><span className={sub}>From:</span><span className="truncate">{c.senderName}</span></div>
        <div className="flex items-center gap-2"><span className={sub}>To:</span><span className="truncate">{c.receiverName}</span></div>
        <div className="flex items-center gap-2"><span className={sub}>Vehicle:</span><span className="truncate">{c.vehicleType} · {c.vehiclePlate}</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADD CARGO VIEW
═══════════════════════════════════════════ */
function AddCargoView({ onAdd }: { onAdd: (c: CargoItem) => void }) {
  const { t, theme } = useApp();
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20","bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200",theme);
  const sectionHdr = cs("border-slate-700/50 bg-slate-800/30","border-gray-200 bg-gray-50",theme);

  const [form, setForm] = useState({
    cargoName:"", cargoType:"General Goods", cargoCategory:"General Goods",
    quantity:"", weightPerUnit:"", totalWeight:"", dimensions:"",
    fragile:false, hazardous:false, perishable:false, requiresRefrigeration:false,
    senderName:"", senderPhone:"", senderAddress:"",
    receiverName:"", receiverPhone:"", receiverAddress:"",
    transporterName:"", vehicleType:"Mini Truck (1T)", vehiclePlate:"",
    slot:"06:00–09:00" as TimeSlot, date:"", specialInstructions:"",
    estimatedValue:"", insuranceRequired:false,
  });

  const set = (k: string, v: string | boolean) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === "quantity" || k === "weightPerUnit") {
        const q = parseFloat(k === "quantity" ? v as string : f.quantity) || 0;
        const w = parseFloat(k === "weightPerUnit" ? v as string : f.weightPerUnit) || 0;
        updated.totalWeight = (q * w).toFixed(2);
      }
      return updated;
    });
  };

  const [step, setStep] = useState<"details" | "payment">("details");
  const [payForm, setPayForm] = useState({ cardHolder:"", cardNumber:"", expiry:"", cvv:"" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "details") {
      setStep("payment");
      return;
    }
    const cargo: CargoItem = {
      ...form, id:`CRG-${String(Date.now()).slice(-4)}`,
      createdBy:"user", status:"Accepted", progress:15,
      trackingCode:`TRK-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
    };
    onAdd(cargo);
  };

  const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div className="space-y-1.5">
      <label className={`text-xs font-semibold ${cs("text-slate-300","text-gray-700",theme)}`}>{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      {children}
    </div>
  );

  const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <div className={`-mx-6 px-6 py-3 border-y mb-4 flex items-center gap-2 ${sectionHdr}`}>
      <span>{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );

  const slots: TimeSlot[] = ["06:00–09:00","09:00–11:00","12:00–14:00","15:00–17:00"];
  const slotInfo = [{ label:"Early Morning", color:"from-blue-500 to-cyan-500" },{ label:"Morning", color:"from-cyan-500 to-teal-500" },{ label:"Afternoon", color:"from-amber-500 to-orange-500" },{ label:"Evening", color:"from-orange-500 to-red-500" }];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">📦 {t.cargoFormTitle}</h1>
        <p className={`text-sm mt-1 ${sub}`}>{t.cargoFormSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={`border rounded-2xl p-6 space-y-6 ${card}`}>

          {/* Cargo Details */}
          <SectionTitle icon="📦" title={t.cargoDetails} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label={t.cargoName} required><input value={form.cargoName} onChange={e=>set("cargoName",e.target.value)} required placeholder="e.g. Pharmaceutical Batch A" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.cargoType} required>
              <select value={form.cargoType} onChange={e=>set("cargoType",e.target.value)} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`}>
                {GOODS_TYPES.map(g=><option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label={t.cargoCategory} required>
              <select value={form.cargoCategory} onChange={e=>set("cargoCategory",e.target.value)} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`}>
                {CARGO_CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label={t.quantity} required><input type="number" min="1" value={form.quantity} onChange={e=>set("quantity",e.target.value)} required placeholder="e.g. 500" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.weightPerUnit} required><input type="number" min="0.01" step="0.01" value={form.weightPerUnit} onChange={e=>set("weightPerUnit",e.target.value)} required placeholder="e.g. 1.5" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.totalWeight}>
              <input value={form.totalWeight} readOnly placeholder="Auto-calculated" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition opacity-70 ${inputCls}`} />
            </Field>
            <Field label={t.dimensions}><input value={form.dimensions} onChange={e=>set("dimensions",e.target.value)} placeholder="e.g. 60×40×30" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.estimatedValue}><input type="number" value={form.estimatedValue} onChange={e=>set("estimatedValue",e.target.value)} placeholder="e.g. 50000" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
          </div>

          {/* Cargo Properties */}
          <SectionTitle icon="⚠️" title={t.cargoProperties} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key:"fragile", label:t.fragile, icon:"⚠️", color:"amber" },
              { key:"hazardous", label:t.hazardous, icon:"☢️", color:"red" },
              { key:"perishable", label:t.perishable, icon:"🕐", color:"orange" },
              { key:"requiresRefrigeration", label:t.requiresRefrigeration, icon:"❄️", color:"blue" },
              { key:"insuranceRequired", label:t.insuranceRequired, icon:"🛡️", color:"green" },
            ].map(p => (
              <button key={p.key} type="button" onClick={() => set(p.key, !form[p.key as keyof typeof form])}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  form[p.key as keyof typeof form]
                    ? `bg-${p.color}-500/15 border-${p.color}-500/40 text-${p.color}-400`
                    : cs("border-slate-700 text-slate-400 hover:bg-slate-800","border-gray-200 text-gray-600 hover:bg-gray-50",theme)
                }`}>
                <span>{p.icon}</span> {p.label}
                <span className="ml-auto">{form[p.key as keyof typeof form] ? "✓" : ""}</span>
              </button>
            ))}
          </div>

          {/* Sender */}
          <SectionTitle icon="📤" title={t.senderInfo} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label={t.senderName} required><input value={form.senderName} onChange={e=>set("senderName",e.target.value)} required placeholder="Sender full name" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.senderPhone} required><input type="tel" value={form.senderPhone} onChange={e=>set("senderPhone",e.target.value)} required placeholder="10-digit phone" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.senderAddress} required><input value={form.senderAddress} onChange={e=>set("senderAddress",e.target.value)} required placeholder="Full pickup address" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
          </div>

          {/* Receiver */}
          <SectionTitle icon="📥" title={t.receiverInfo} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label={t.receiverName} required><input value={form.receiverName} onChange={e=>set("receiverName",e.target.value)} required placeholder="Receiver full name" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.receiverPhone} required><input type="tel" value={form.receiverPhone} onChange={e=>set("receiverPhone",e.target.value)} required placeholder="10-digit phone" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.receiverAddress} required><input value={form.receiverAddress} onChange={e=>set("receiverAddress",e.target.value)} required placeholder="Full delivery address" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
          </div>

          {/* Transport */}
          <SectionTitle icon="🚛" title={t.transportInfo} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label={t.transporterName} required><input value={form.transporterName} onChange={e=>set("transporterName",e.target.value)} required placeholder="Transporter company" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.vehicleType} required>
              <select value={form.vehicleType} onChange={e=>set("vehicleType",e.target.value)} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`}>
                {VEHICLE_TYPES.map(v=><option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label={t.vehiclePlate} required><input value={form.vehiclePlate} onChange={e=>set("vehiclePlate",e.target.value)} required placeholder="e.g. MH04 AB1234" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
          </div>

          {/* Scheduling */}
          <SectionTitle icon="🕐" title={t.timeSlot} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {slots.map((s, i) => (
              <button key={s} type="button" onClick={() => set("slot", s)}
                className={`rounded-xl border p-3 text-center transition-all ${form.slot===s?`bg-gradient-to-br ${slotInfo[i].color} border-transparent text-white`:cs("border-slate-700 hover:border-violet-500/40","border-gray-200 hover:border-violet-500/40",theme)}`}>
                <p className="font-bold text-sm">{s}</p>
                <p className={`text-[10px] mt-1 ${form.slot===s?"text-white/80":sub}`}>{slotInfo[i].label}</p>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t.deliveryDate} required><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} required className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.specialInstructions}><input value={form.specialInstructions} onChange={e=>set("specialInstructions",e.target.value)} placeholder="e.g. Keep at 2-8°C" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            {step === "details" ? (
              <>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-violet-500/20 text-sm">Proceed to Payment</button>
                <button type="reset" onClick={() => setForm(f => ({ ...f, cargoName:"", quantity:"", weightPerUnit:"", totalWeight:"", senderName:"", senderPhone:"", senderAddress:"", receiverName:"", receiverPhone:"", receiverAddress:"", transporterName:"", vehiclePlate:"", dimensions:"", estimatedValue:"", specialInstructions:"", date:"" }))} className={`px-5 py-3 rounded-xl border text-sm font-medium transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>{t.resetForm}</button>
              </>
            ) : (
              <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-4 rounded-xl border ${cs("bg-slate-800/50 border-slate-700","bg-gray-50 border-gray-200",theme)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">💳 {t.payment}</h3>
                    <span className="text-xs font-mono text-violet-400">Total: ₹1,250.00</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t.cardHolder} required><input value={payForm.cardHolder} onChange={e=>setPayForm(f=>({...f,cardHolder:e.target.value}))} required placeholder="Name on card" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
                    <Field label={t.cardNumber} required><input value={payForm.cardNumber} onChange={e=>setPayForm(f=>({...f,cardNumber:e.target.value}))} required placeholder="0000 0000 0000 0000" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
                    <Field label={t.expiry} required><input value={payForm.expiry} onChange={e=>setPayForm(f=>({...f,expiry:e.target.value}))} required placeholder="MM/YY" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
                    <Field label={t.cvv} required><input value={payForm.cvv} onChange={e=>setPayForm(f=>({...f,cvv:e.target.value}))} required placeholder="123" maxLength={3} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-emerald-500/20 text-sm">{t.payNow} & Submit</button>
                  <button type="button" onClick={()=>setStep("details")} className={`px-5 py-3 rounded-xl border text-sm font-medium transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>Back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CARGO ADMIN VIEW
═══════════════════════════════════════════ */
function CargoAdminView({ cargoList, setCargoList }: { cargoList: CargoItem[]; setCargoList: React.Dispatch<React.SetStateAction<CargoItem[]>> }) {
  const { t, theme } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CargoItem>>({});
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white","bg-white border-gray-200 text-gray-900",theme);
  const rowBg = cs("bg-slate-800/40","bg-gray-50",theme);

  const statuses: CargoStatus[] = ["Pending","Accepted","Loading","In Transit","Unloading","Delivered","Rejected"];
  const progressMap: Record<CargoStatus, number> = { "Pending":5,"Accepted":20,"Loading":40,"In Transit":65,"Unloading":85,"Delivered":100,"Rejected":0 };

  const filtered = cargoList.filter(c => {
    const ms = !search || c.cargoName.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()) || c.senderName.toLowerCase().includes(search.toLowerCase()) || c.receiverName.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || c.status === statusFilter;
    return ms && mf;
  });

  const updateStatus = (id: string, status: CargoStatus) =>
    setCargoList(prev => prev.map(c => c.id === id ? { ...c, status, progress:progressMap[status] } : c));

  const deleteCargo = (id: string) => setCargoList(prev => prev.filter(c => c.id !== id));

  const startEdit = (c: CargoItem) => { setEditId(c.id); setEditForm({ ...c }); };
  const saveEdit = () => {
    setCargoList(prev => prev.map(c => c.id === editId ? { ...c, ...editForm } : c));
    setEditId(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📋 {t.cargoAdmin}</h1>
        <p className={`text-sm mt-1 ${sub}`}>{t.manageCargo}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:t.totalCargo, value:String(cargoList.length), grad:"from-violet-500 to-purple-600", icon:"📦" },
          { label:t.activeCargo, value:String(cargoList.filter(c=>["Loading","In Transit","Unloading"].includes(c.status)).length), grad:"from-cyan-500 to-blue-600", icon:"🚛" },
          { label:t.pendingCargo, value:String(cargoList.filter(c=>c.status==="Pending").length), grad:"from-amber-500 to-orange-600", icon:"⏳" },
          { label:t.deliveredCargo, value:String(cargoList.filter(c=>c.status==="Delivered").length), grad:"from-green-500 to-emerald-600", icon:"✅" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${card}`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center text-base mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className={`text-xs ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className={`border rounded-xl p-4 flex flex-wrap gap-3 ${card}`}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchCargo}
          className={`flex-1 min-w-48 rounded-lg border px-3 py-2 text-sm outline-none transition ${inputCls}`} />
        <div className="flex flex-wrap gap-2">
          {["All",...statuses].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter===s?"bg-violet-500/20 text-violet-300 border border-violet-500/40":cs("border border-slate-700 text-slate-400 hover:bg-slate-800","border border-gray-200 text-gray-600 hover:bg-gray-50",theme)}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cargo List */}
      <div className="space-y-4">
        {filtered.map(c => (
          <div key={c.id} className={`border rounded-2xl p-5 ${card}`}>
            {editId === c.id ? (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  <input value={editForm.cargoName||""} onChange={e=>setEditForm(f=>({...f,cargoName:e.target.value}))} placeholder="Cargo name" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.totalWeight||""} onChange={e=>setEditForm(f=>({...f,totalWeight:e.target.value}))} placeholder="Total weight" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.transporterName||""} onChange={e=>setEditForm(f=>({...f,transporterName:e.target.value}))} placeholder="Transporter" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.senderAddress||""} onChange={e=>setEditForm(f=>({...f,senderAddress:e.target.value}))} placeholder="Sender address" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.receiverAddress||""} onChange={e=>setEditForm(f=>({...f,receiverAddress:e.target.value}))} placeholder="Receiver address" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.specialInstructions||""} onChange={e=>setEditForm(f=>({...f,specialInstructions:e.target.value}))} placeholder="Special instructions" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/40 text-sm hover:bg-violet-500/30 transition">{t.save}</button>
                  <button onClick={() => setEditId(null)} className={`px-4 py-2 rounded-lg border text-sm transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>{t.cancel}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-violet-400">{c.id}</span>
                      <span className="font-semibold">{c.cargoName}</span>
                      <CargoStatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`text-xs ${sub}`}>{c.cargoType} · {c.totalWeight}kg · {c.quantity} units</span>
                      <span className="text-xs font-mono text-cyan-400">{c.trackingCode}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(c)} className={`px-3 py-1.5 rounded-lg border text-xs transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>✏️ {t.edit}</button>
                    <button onClick={() => deleteCargo(c.id)} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition">🗑️</button>
                  </div>
                </div>

                <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs rounded-xl p-3 mb-4 ${rowBg}`}>
                  <div><span className={sub}>From:</span><p className="font-medium truncate">{c.senderName}</p><p className={`truncate ${sub}`}>{c.senderAddress}</p></div>
                  <div><span className={sub}>To:</span><p className="font-medium truncate">{c.receiverName}</p><p className={`truncate ${sub}`}>{c.receiverAddress}</p></div>
                  <div><span className={sub}>Transport:</span><p className="font-medium">{c.vehicleType}</p><p className={sub}>{c.vehiclePlate}</p></div>
                  <div><span className={sub}>Slot / Date:</span><p className="font-medium text-cyan-400">{c.slot}</p><p className={sub}>{c.date}</p></div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1"><span className={sub}>{t.progress}</span><span>{c.progress}%</span></div>
                  <div className={`h-1.5 rounded-full ${cs("bg-slate-800","bg-gray-200",theme)}`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400" style={{ width:`${c.progress}%` }} />
                  </div>
                </div>

                <div>
                  <p className={`text-xs font-semibold mb-2 ${sub}`}>{t.changeStatus}:</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(s => (
                      <button key={s} onClick={() => updateStatus(c.id, s)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${c.status===s?"bg-violet-500/20 text-violet-300 border-violet-500/40":cs("border-slate-700 text-slate-400 hover:bg-slate-800","border-gray-200 text-gray-600 hover:bg-gray-50",theme)}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={`text-center py-16 border rounded-2xl ${card}`}>
            <p className="text-4xl mb-3">📋</p>
            <p className={`text-sm ${sub}`}>No cargo found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ANALYTICS VIEW
═══════════════════════════════════════════ */
function AnalyticsView({ deliveries, cargoList }: { deliveries: Delivery[]; cargoList: CargoItem[] }) {
  const { t, theme } = useApp();
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);

  const slots = ["06:00–09:00","09:00–11:00","12:00–14:00","15:00–17:00"];
  const slotCounts = slots.map(s => deliveries.filter(d => d.slot === s).length);
  const maxSlot = Math.max(...slotCounts, 1);

  const cargoByType = CARGO_CATEGORIES.slice(0, 6).map(cat => ({
    name: cat, count: cargoList.filter(c => c.cargoCategory === cat).length
  })).filter(x => x.count > 0);

  const totalCargoWeight = cargoList.reduce((s, c) => s + parseFloat(c.totalWeight || "0"), 0);
  const totalCargoValue = cargoList.reduce((s, c) => s + parseFloat(c.estimatedValue || "0"), 0);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">📊 {t.analytics}</h1>
        <p className={`text-sm mt-1 ${sub}`}>Delivery & Cargo performance insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:t.totalDeliveries, value:String(deliveries.length), icon:"🚚", grad:"from-cyan-500 to-blue-600" },
          { label:t.onTimeRate, value:"87%", icon:"⏱️", grad:"from-green-500 to-emerald-600" },
          { label:t.totalCargo, value:String(cargoList.length), icon:"📦", grad:"from-violet-500 to-purple-600" },
          { label:t.fuelSaved, value:"340L", icon:"⛽", grad:"from-amber-500 to-orange-600" },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl p-5 ${card}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className={`text-xs mt-1 ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Slot Distribution */}
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className="font-semibold mb-5">{t.slotDistribution}</h2>
          <div className="space-y-4">
            {slots.map((s, i) => (
              <div key={s}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={sub}>{s}</span>
                  <span className="font-medium">{slotCounts[i]} trips</span>
                </div>
                <div className={`h-3 rounded-full ${cs("bg-slate-800","bg-gray-100",theme)}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all" style={{ width:`${(slotCounts[i]/maxSlot)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cargo by Type */}
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className="font-semibold mb-5">{t.cargoTypes}</h2>
          <div className="space-y-3">
            {cargoByType.length > 0 ? cargoByType.map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={sub}>{c.name}</span>
                  <span className="font-medium">{c.count}</span>
                </div>
                <div className={`h-2.5 rounded-full ${cs("bg-slate-800","bg-gray-100",theme)}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${["from-violet-500 to-purple-500","from-cyan-500 to-blue-500","from-green-500 to-emerald-500","from-amber-500 to-orange-500","from-pink-500 to-rose-500","from-teal-500 to-cyan-500"][i%6]}`} style={{ width:`${(c.count/cargoList.length)*100}%` }} />
                </div>
              </div>
            )) : (
              <p className={`text-sm ${sub}`}>No cargo data yet.</p>
            )}
          </div>
        </div>

        {/* Cargo Analytics */}
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className="font-semibold mb-5">{t.cargoAnalytics}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label:t.cargoWeight, value:`${totalCargoWeight.toFixed(0)} kg`, icon:"⚖️", color:"text-cyan-400" },
              { label:t.cargoValue, value:`₹${(totalCargoValue/1000).toFixed(1)}K`, icon:"💰", color:"text-amber-400" },
              { label:"Fragile Items", value:String(cargoList.filter(c=>c.fragile).length), icon:"⚠️", color:"text-orange-400" },
              { label:"Cold Chain", value:String(cargoList.filter(c=>c.requiresRefrigeration).length), icon:"❄️", color:"text-blue-400" },
              { label:"Insured", value:String(cargoList.filter(c=>c.insuranceRequired).length), icon:"🛡️", color:"text-green-400" },
              { label:"Hazardous", value:String(cargoList.filter(c=>c.hazardous).length), icon:"☢️", color:"text-red-400" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 ${cs("bg-slate-800/50","bg-gray-50",theme)}`}>
                <p className="text-lg">{s.icon}</p>
                <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
                <p className={`text-xs ${sub}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Status Breakdown */}
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className="font-semibold mb-5">Delivery Status Breakdown</h2>
          <div className="space-y-3">
            {["In Transit","Scheduled","Out for Delivery","Completed","Approved","Draft","Cancelled"].map(s => {
              const count = deliveries.filter(d => d.status === s).length;
              const pct = deliveries.length ? Math.round((count / deliveries.length) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <StatusBadge status={s as DeliveryStatus} />
                  <div className={`flex-1 h-2 rounded-full ${cs("bg-slate-800","bg-gray-100",theme)}`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width:`${pct}%` }} />
                  </div>
                  <span className={`text-xs w-8 text-right ${sub}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic Impact */}
      <div className={`border rounded-2xl p-6 ${card}`}>
        <h2 className="font-semibold mb-5">{t.trafficImpact}</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label:"Morning Rush (8–10 AM)", before:120, after:70, unit:"vehicles/hr" },
            { label:"Afternoon Peak (12–2 PM)", before:95, after:60, unit:"vehicles/hr" },
            { label:"Evening Rush (5–7 PM)", before:150, after:90, unit:"vehicles/hr" },
          ].map(x => (
            <div key={x.label}>
              <p className={`text-xs font-semibold mb-3 ${sub}`}>{x.label}</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-red-400">Before</span><span>{x.before} {x.unit}</span></div>
                  <div className={`h-2 rounded-full ${cs("bg-slate-800","bg-gray-100",theme)}`}><div className="h-full rounded-full bg-red-500" style={{ width:`${(x.before/150)*100}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-green-400">After</span><span>{x.after} {x.unit}</span></div>
                  <div className={`h-2 rounded-full ${cs("bg-slate-800","bg-gray-100",theme)}`}><div className="h-full rounded-full bg-green-500" style={{ width:`${(x.after/150)*100}%` }} /></div>
                </div>
                <p className="text-xs text-emerald-400 font-semibold">↓ {Math.round(((x.before-x.after)/x.before)*100)}% reduction</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TRACKING VIEW
═══════════════════════════════════════════ */
function TrackingView({ deliveries }: { deliveries: Delivery[] }) {
  const { t, theme } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white placeholder:text-slate-500","bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",theme);

  const filtered = deliveries.filter(d => {
    const ms = !search || d.id.toLowerCase().includes(search.toLowerCase()) || d.supplierName.toLowerCase().includes(search.toLowerCase()) || d.dropoffAddress.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || d.status === filter;
    return ms && mf;
  });

  const statusColor: Record<string,string> = { "In Transit":"bg-cyan-500","Out for Delivery":"bg-amber-500","Scheduled":"bg-blue-500","Completed":"bg-green-500","Approved":"bg-violet-500","Draft":"bg-slate-500","Cancelled":"bg-red-500" };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">📍 {t.tracking}</h1>
        <p className={`text-sm mt-1 ${sub}`}>Live delivery tracking & status updates</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:t.inTransit, value:String(deliveries.filter(d=>d.status==="In Transit").length), color:"text-cyan-400" },
          { label:t.scheduled, value:String(deliveries.filter(d=>d.status==="Scheduled").length), color:"text-blue-400" },
          { label:t.outForDelivery, value:String(deliveries.filter(d=>d.status==="Out for Delivery").length), color:"text-amber-400" },
          { label:t.completed, value:String(deliveries.filter(d=>d.status==="Completed").length), color:"text-green-400" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 text-center ${card}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`border rounded-xl p-4 flex flex-wrap gap-3 ${card}`}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchDeliveries}
          className={`flex-1 min-w-48 rounded-lg border px-3 py-2 text-sm outline-none transition ${inputCls}`} />
        <div className="flex flex-wrap gap-2">
          {["All","In Transit","Scheduled","Out for Delivery","Completed","Approved","Cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===s?"bg-cyan-500/20 text-cyan-300 border border-cyan-500/40":cs("border border-slate-700 text-slate-400 hover:bg-slate-800","border border-gray-200 text-gray-600 hover:bg-gray-50",theme)}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(d => (
          <div key={d.id} className={`border rounded-2xl p-5 hover:border-cyan-500/30 transition-all ${card}`}>
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <p className="font-mono text-xs text-cyan-400">{d.id}</p>
                <p className="font-semibold text-sm mt-0.5">{d.supplierName}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {(d.status==="In Transit"||d.status==="Out for Delivery") && <span className={`w-2 h-2 rounded-full ${statusColor[d.status]||"bg-slate-500"} animate-pulse`} />}
                <StatusBadge status={d.status} />
              </div>
            </div>
            <div className={`rounded-xl p-3 space-y-1.5 mb-3 text-xs ${cs("bg-slate-800/50","bg-gray-50",theme)}`}>
              <div className="flex justify-between"><span className={sub}>{t.pickup}</span><span className="font-medium truncate ml-2 max-w-[140px]">{d.pickupAddress}</span></div>
              <div className="flex justify-between"><span className={sub}>{t.dropoff}</span><span className="font-medium truncate ml-2 max-w-[140px]">{d.dropoffAddress}</span></div>
              <div className="flex justify-between"><span className={sub}>{t.slot}</span><span className="font-medium text-cyan-400">{d.slot}</span></div>
              <div className="flex justify-between"><span className={sub}>{t.vehicle}</span><span className="font-medium">{d.vehiclePlate}</span></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className={sub}>{t.progress}</span><span>{d.progress}%</span></div>
              <div className={`h-1.5 rounded-full ${cs("bg-slate-800","bg-gray-200",theme)}`}>
                <div className={`h-full rounded-full ${statusColor[d.status]||"bg-slate-500"} transition-all`} style={{ width:`${d.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={`col-span-3 text-center py-16 border rounded-2xl ${card}`}>
            <p className="text-4xl mb-3">🔍</p>
            <p className={`text-sm ${sub}`}>No deliveries found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DELIVERIES VIEW
═══════════════════════════════════════════ */
function DeliveriesView({ deliveries, setView }: { deliveries: Delivery[]; setView: (v: View) => void; role?: Role; userName?: string }) {
  const { t, theme } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white placeholder:text-slate-500","bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",theme);

  const filtered = deliveries.filter(d => {
    const ms = !search || d.id.toLowerCase().includes(search.toLowerCase()) || d.supplierName.toLowerCase().includes(search.toLowerCase()) || d.retailerName.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || d.status === filter;
    return ms && mf;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">🚚 {t.deliveries}</h1>
          <p className={`text-sm mt-1 ${sub}`}>All delivery schedules and status</p>
        </div>
        <button onClick={() => setView("add-delivery")} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
          <span>+</span> {t.addNewDelivery}
        </button>
      </div>

      <div className={`border rounded-xl p-4 flex flex-wrap gap-3 ${card}`}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchDeliveries}
          className={`flex-1 min-w-48 rounded-lg border px-3 py-2 text-sm outline-none transition ${inputCls}`} />
        <div className="flex flex-wrap gap-2">
          {["All","In Transit","Scheduled","Out for Delivery","Completed","Approved","Draft","Cancelled"].map(s => (
            <button key={s} onClick={()=>setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===s?"bg-cyan-500/20 text-cyan-300 border border-cyan-500/40":cs("border border-slate-700 text-slate-400 hover:bg-slate-800","border border-gray-200 text-gray-600 hover:bg-gray-50",theme)}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-xs font-semibold ${cs("border-slate-800 bg-slate-800/40 text-slate-400","border-gray-200 bg-gray-50 text-gray-600",theme)}`}>
                {[t.id, t.supplier, t.goods, t.slot, t.status, t.progress].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${cs("divide-slate-800/50","divide-gray-100",theme)}`}>
              {filtered.map(d => (
                <tr key={d.id} className={`transition-colors ${cs("hover:bg-slate-800/30","hover:bg-gray-50",theme)}`}>
                  <td className="px-4 py-3 font-mono text-xs text-cyan-400 whitespace-nowrap">{d.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium">{d.supplierName}</p>
                    <p className={`text-xs ${sub}`}>{d.retailerName}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p>{d.goodsType}</p>
                    <p className={`text-xs ${sub}`}>{d.weight} kg</p>
                  </td>
                  <td className="px-4 py-3 text-cyan-400 font-medium whitespace-nowrap text-xs">{d.slot}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-1.5 rounded-full ${cs("bg-slate-800","bg-gray-200",theme)}`}>
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width:`${d.progress}%` }} />
                      </div>
                      <span className={`text-xs ${sub}`}>{d.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className={`text-center py-12 ${sub}`}>No deliveries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADD DELIVERY VIEW
═══════════════════════════════════════════ */
function AddDeliveryView({ onAdd }: { onAdd: (d: Delivery) => void }) {
  const { t, theme } = useApp();
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20","bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200",theme);

  const [form, setForm] = useState({ supplierName:"", transporterName:"", vehiclePlate:"", retailerName:"", pickupAddress:"", dropoffAddress:"", contactPhone:"", goodsType:"FMCG", weight:"", notes:"", slot:"06:00–09:00" as TimeSlot, date:"" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const slots: TimeSlot[] = ["06:00–09:00","09:00–11:00","12:00–14:00","15:00–17:00"];
  const slotColors = ["from-blue-500 to-cyan-500","from-cyan-500 to-teal-500","from-amber-500 to-orange-500","from-orange-500 to-red-500"];

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className={`text-xs font-semibold ${cs("text-slate-300","text-gray-700",theme)}`}>{label}</label>
      {children}
    </div>
  );

  const [step, setStep] = useState<"details" | "payment">("details");
  const [payForm, setPayForm] = useState({ cardHolder:"", cardNumber:"", expiry:"", cvv:"" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "details") {
      setStep("payment");
      return;
    }
    const route = ROUTES.r1;
    const delivery: Delivery = {
      ...form, id:`DLV-${String(Date.now()).slice(-4)}`,
      createdBy:"user", status:"Scheduled", progress:10, route, pos:route[0],
    };
    onAdd(delivery);
  };

  const PaymentField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className={`text-xs font-semibold ${cs("text-slate-300","text-gray-700",theme)}`}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🚚 {t.formTitle}</h1>
        <p className={`text-sm mt-1 ${sub}`}>{t.formSubtitle}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={`border rounded-2xl p-6 space-y-6 ${card}`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label={t.supplierName}><input value={form.supplierName} onChange={e=>set("supplierName",e.target.value)} required placeholder="e.g. Ravi Traders" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.transporterName}><input value={form.transporterName} onChange={e=>set("transporterName",e.target.value)} required placeholder="e.g. FastMove Logistics" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.vehiclePlate}><input value={form.vehiclePlate} onChange={e=>set("vehiclePlate",e.target.value)} required placeholder="e.g. MH04 AB1234" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.retailerName}><input value={form.retailerName} onChange={e=>set("retailerName",e.target.value)} required placeholder="e.g. Green Mart" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.pickupAddress}><input value={form.pickupAddress} onChange={e=>set("pickupAddress",e.target.value)} required placeholder="Pickup location" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.dropoffAddress}><input value={form.dropoffAddress} onChange={e=>set("dropoffAddress",e.target.value)} required placeholder="Delivery location" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.contactPhone}><input type="tel" value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)} required placeholder="10-digit number" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
            <Field label={t.goodsType}>
              <select value={form.goodsType} onChange={e=>set("goodsType",e.target.value)} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`}>
                {GOODS_TYPES.map(g=><option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label={t.weight}><input type="number" min="1" value={form.weight} onChange={e=>set("weight",e.target.value)} required placeholder="e.g. 450" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>
          </div>
          <Field label={t.notes}><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Special instructions..." className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition resize-none ${inputCls}`} /></Field>

          <div>
            <label className={`text-xs font-semibold block mb-3 ${cs("text-slate-300","text-gray-700",theme)}`}>{t.timeSlot}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {slots.map((s,i) => (
                <button key={s} type="button" onClick={() => set("slot", s)}
                  className={`rounded-xl border p-3 text-center transition-all ${form.slot===s?`bg-gradient-to-br ${slotColors[i]} border-transparent text-white`:cs("border-slate-700 hover:border-cyan-500/30","border-gray-200 hover:border-cyan-500/30",theme)}`}>
                  <p className="font-bold text-sm">{s}</p>
                </button>
              ))}
            </div>
          </div>

          <Field label={t.deliveryDate}><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} required className={`w-full sm:w-64 rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></Field>

          <div className="flex gap-3">
            {step === "details" ? (
              <>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-cyan-500/20 text-sm">Proceed to Payment</button>
                <button type="reset" className={`px-5 py-3 rounded-xl border text-sm font-medium transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>{t.resetForm}</button>
              </>
            ) : (
              <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-4 rounded-xl border ${cs("bg-slate-800/50 border-slate-700","bg-gray-50 border-gray-200",theme)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">💳 {t.payment}</h3>
                    <span className="text-xs font-mono text-cyan-400">Total: ₹500.00</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <PaymentField label={t.cardHolder}><input value={payForm.cardHolder} onChange={e=>setPayForm(f=>({...f,cardHolder:e.target.value}))} required placeholder="Name on card" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></PaymentField>
                    <PaymentField label={t.cardNumber}><input value={payForm.cardNumber} onChange={e=>setPayForm(f=>({...f,cardNumber:e.target.value}))} required placeholder="0000 0000 0000 0000" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></PaymentField>
                    <PaymentField label={t.expiry}><input value={payForm.expiry} onChange={e=>setPayForm(f=>({...f,expiry:e.target.value}))} required placeholder="MM/YY" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></PaymentField>
                    <PaymentField label={t.cvv}><input value={payForm.cvv} onChange={e=>setPayForm(f=>({...f,cvv:e.target.value}))} required placeholder="123" maxLength={3} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputCls}`} /></PaymentField>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-emerald-500/20 text-sm">{t.payNow} & Submit</button>
                  <button type="button" onClick={()=>setStep("details")} className={`px-5 py-3 rounded-xl border text-sm font-medium transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>Back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADMIN VIEW
═══════════════════════════════════════════ */
function AdminView({ deliveries, setDeliveries }: { deliveries: Delivery[]; setDeliveries: React.Dispatch<React.SetStateAction<Delivery[]>> }) {
  const { t, theme } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editId, setEditId] = useState<string|null>(null);
  const [editForm, setEditForm] = useState<Partial<Delivery>>({});
  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white","bg-white border-gray-200 text-gray-900",theme);

  const statuses: DeliveryStatus[] = ["Draft","Scheduled","Approved","In Transit","Out for Delivery","Completed","Cancelled","Pending Payment"];
  const progressMap: Record<DeliveryStatus,number> = { "Draft":5,"Scheduled":15,"Approved":30,"In Transit":65,"Out for Delivery":85,"Completed":100,"Cancelled":0, "Pending Payment": 10 };

  const filtered = deliveries.filter(d => {
    const ms = !search || d.id.toLowerCase().includes(search.toLowerCase()) || d.supplierName.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || d.status === filter;
    return ms && mf;
  });

  const updateStatus = (id: string, status: DeliveryStatus) =>
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status, progress:progressMap[status] } : d));
  const deleteDelivery = (id: string) => setDeliveries(prev => prev.filter(d => d.id !== id));
  const startEdit = (d: Delivery) => { setEditId(d.id); setEditForm({ ...d }); };
  const saveEdit = () => { setDeliveries(prev => prev.map(d => d.id === editId ? { ...d, ...editForm } : d)); setEditId(null); };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">🛡️ {t.adminPanel}</h1>
        <p className={`text-sm mt-1 ${sub}`}>{t.manageDeliveries}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:t.totalDeliveries, value:String(deliveries.length), icon:"🚚", grad:"from-cyan-500 to-blue-600" },
          { label:t.inTransit, value:String(deliveries.filter(d=>d.status==="In Transit").length), icon:"🚛", grad:"from-blue-500 to-indigo-600" },
          { label:t.approved, value:String(deliveries.filter(d=>d.status==="Approved").length), icon:"✅", grad:"from-violet-500 to-purple-600" },
          { label:t.completed, value:String(deliveries.filter(d=>d.status==="Completed").length), icon:"🏁", grad:"from-green-500 to-emerald-600" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${card}`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center text-base mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className={`text-xs ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`border rounded-xl p-4 flex flex-wrap gap-3 ${card}`}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchDeliveries}
          className={`flex-1 min-w-48 rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
        <div className="flex flex-wrap gap-2">
          {["All",...statuses].map(s => (
            <button key={s} onClick={()=>setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===s?"bg-cyan-500/20 text-cyan-300 border border-cyan-500/40":cs("border border-slate-700 text-slate-400 hover:bg-slate-800","border border-gray-200 text-gray-600 hover:bg-gray-50",theme)}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(d => (
          <div key={d.id} className={`border rounded-2xl p-5 ${card}`}>
            {editId === d.id ? (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  <input value={editForm.supplierName||""} onChange={e=>setEditForm(f=>({...f,supplierName:e.target.value}))} placeholder="Supplier" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.transporterName||""} onChange={e=>setEditForm(f=>({...f,transporterName:e.target.value}))} placeholder="Transporter" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.vehiclePlate||""} onChange={e=>setEditForm(f=>({...f,vehiclePlate:e.target.value}))} placeholder="Vehicle plate" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.goodsType||""} onChange={e=>setEditForm(f=>({...f,goodsType:e.target.value}))} placeholder="Goods type" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.weight||""} onChange={e=>setEditForm(f=>({...f,weight:e.target.value}))} placeholder="Weight (kg)" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <input value={editForm.notes||""} onChange={e=>setEditForm(f=>({...f,notes:e.target.value}))} placeholder="Notes" className={`rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-sm">{t.save}</button>
                  <button onClick={() => setEditId(null)} className={`px-4 py-2 rounded-lg border text-sm ${cs("border-slate-700","border-gray-200",theme)}`}>{t.cancel}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-cyan-400">{d.id}</span>
                      <span className="font-semibold">{d.supplierName}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className={`text-xs mt-1 ${sub}`}>{d.goodsType} · {d.weight}kg · {d.slot} · {d.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(d)} className={`px-3 py-1.5 rounded-lg border text-xs transition ${cs("border-slate-700 hover:bg-slate-800","border-gray-200 hover:bg-gray-100",theme)}`}>✏️ {t.edit}</button>
                    <button onClick={() => deleteDelivery(d.id)} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10">🗑️</button>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className={sub}>{t.progress}</span><span>{d.progress}%</span></div>
                  <div className={`h-1.5 rounded-full ${cs("bg-slate-800","bg-gray-200",theme)}`}><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width:`${d.progress}%` }} /></div>
                </div>
                <div>
                  <p className={`text-xs font-semibold mb-2 ${sub}`}>{t.changeStatus}:</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(s => (
                      <button key={s} onClick={() => updateStatus(d.id, s)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${d.status===s?"bg-cyan-500/20 text-cyan-300 border-cyan-500/40":cs("border-slate-700 text-slate-400 hover:bg-slate-800","border-gray-200 text-gray-600 hover:bg-gray-50",theme)}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAP VIEW (Real Leaflet)
═══════════════════════════════════════════ */
function MapView({ deliveries }: { deliveries: Delivery[] }) {
  const { t, theme } = useApp();
  const card = cs("bg-slate-900 border-slate-800","bg-white border-gray-200 shadow-sm",theme);
  const sub = cs("text-slate-400","text-gray-500",theme);
  const center: [number,number] = [19.2955, 72.8535];

  const hubs = useMemo(() => [
    { id:"HUB-CENTRAL", name:"Central Hub", pos:[19.2955,72.8535] as [number,number], status:"Active", capacity:85 },
    { id:"HUB-NORTH", name:"North Hub", pos:[19.3145,72.858] as [number,number], status:"Active", capacity:60 },
    { id:"HUB-SOUTH", name:"South Hub", pos:[19.2735,72.852] as [number,number], status:"Active", capacity:45 },
    { id:"HUB-EAST", name:"East Hub", pos:[19.292,72.872] as [number,number], status:"Active", capacity:70 },
    { id:"DEPOT", name:"Main Depot", pos:[19.295,72.862] as [number,number], status:"Busy", capacity:92 },
  ], []);

  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setLiveTick(t => t+1), 1200);
    return () => window.clearInterval(id);
  }, []);

  const liveDeliveries = useMemo(() => {
    const lerp = (a:number,b:number,t:number) => a+(b-a)*t;
    return deliveries.map((d, idx) => {
      if (d.status==="Scheduled"||d.status==="Completed"||d.status==="Cancelled") return { ...d };
      const r = d.route;
      if (!r||r.length<2) return { ...d };
      const phase = ((liveTick*0.12+idx*0.33)%1+1)%1;
      const segFloat = phase*(r.length-1);
      const seg = Math.min(r.length-2, Math.floor(segFloat));
      const localT = segFloat-seg;
      const pos: [number,number] = [lerp(r[seg][0],r[seg+1][0],localT),lerp(r[seg][1],r[seg+1][1],localT)];
      return { ...d, pos };
    });
  }, [deliveries, liveTick]);

  const statusColor: Record<string,string> = { 
    "In Transit":"#06b6d4",
    "Out for Delivery":"#f59e0b",
    "Scheduled":"#64748b",
    "Approved":"#8b5cf6",
    "Draft":"#94a3b8",
    "Completed":"#22c55e",
    "Cancelled":"#ef4444",
    "Pending Payment":"#ec4899"
  };
  const hubIcon = useMemo(() => L.divIcon({ className:"", html:`<div style="width:16px;height:16px;border-radius:9999px;background:#f97316;box-shadow:0 0 0 6px rgba(249,115,22,0.2);border:2px solid rgba(15,23,42,0.9)"></div>`, iconSize:[16,16], iconAnchor:[8,8] }), []);
  const depotIcon = useMemo(() => L.divIcon({ className:"", html:`<div style="width:16px;height:16px;border-radius:4px;background:#a855f7;box-shadow:0 0 0 6px rgba(168,85,247,0.2);border:2px solid rgba(15,23,42,0.9)"></div>`, iconSize:[16,16], iconAnchor:[8,8] }), []);
  const vehicleIcon = useCallback((color:string) => L.divIcon({ className:"", html:`<div style="width:14px;height:14px;border-radius:9999px;background:${color};box-shadow:0 0 0 5px ${color}33;border:2px solid rgba(15,23,42,0.92)"></div>`, iconSize:[14,14], iconAnchor:[7,7] }), []);

  const legend = [
    { label:"Hub", color:"#f97316" },{ label:"Main Depot", color:"#a855f7" },
    { label:"In Transit", color:"#06b6d4" },{ label:"Out for Delivery", color:"#f59e0b" },
    { label:"Scheduled", color:"#64748b" },{ label:"Completed", color:"#22c55e" },
    { label:"Pending Payment", color:"#ec4899" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🗺️ {t.map}</h1>
        <p className={`text-sm mt-1 ${sub}`}>Interactive real-time delivery map — Mira Bhayandar</p>
      </div>
      <div className={`border rounded-2xl overflow-hidden ${card}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${cs("border-slate-800","border-gray-200",theme)}`}>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-sm font-medium">{t.liveMapView}</span></div>
          <span className={`text-xs ${sub}`}>OpenStreetMap · Mira Bhayandar</span>
        </div>
        <div className="h-[520px]">
          <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {hubs.map(h => (
              <Marker key={h.id} position={h.pos} icon={h.id==="DEPOT"?depotIcon:hubIcon}>
                <Popup><div className="text-slate-900 text-sm"><b>{h.name}</b><br/>Status: {h.status}<br/>Capacity: {h.capacity}%</div></Popup>
              </Marker>
            ))}
            {liveDeliveries.map(d => d.route && d.route.length > 1 && (
              <Fragment key={d.id}>
                <Polyline positions={d.route} pathOptions={{ color:statusColor[d.status]||"#64748b", weight:3, opacity:0.5 }} />
                <CircleMarker center={d.route[d.route.length-1]} radius={5} pathOptions={{ color:statusColor[d.status]||"#64748b", weight:2, fillOpacity:0.2 }} />
                <Marker position={d.pos||d.route[0]} icon={vehicleIcon(statusColor[d.status]||"#64748b")}>
                  <Popup><div className="text-slate-900 text-sm"><b>{d.id}</b><br/>{d.supplierName}<br/>→ {d.retailerName}<br/>Status: {d.status}<br/>Slot: {d.slot}</div></Popup>
                </Marker>
              </Fragment>
            ))}
          </MapContainer>
        </div>
        <div className={`px-5 py-3 border-t flex flex-wrap gap-4 ${cs("border-slate-800","border-gray-200",theme)}`}>
          {legend.map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor:l.color }} />
              <span className={`text-xs ${sub}`}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`border rounded-2xl p-6 ${card}`}>
        <h2 className="font-semibold mb-4">{t.hubNetwork}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {hubs.map(h => (
            <div key={h.id} className={`rounded-xl p-4 ${cs("bg-slate-800/50","bg-gray-50",theme)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">{h.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${h.status==="Busy"?"bg-amber-500/20 text-amber-400":"bg-green-500/20 text-green-400"}`}>{h.status}</span>
              </div>
              <div className={`h-1.5 rounded-full mb-1 ${cs("bg-slate-700","bg-gray-200",theme)}`}>
                <div className={`h-full rounded-full ${h.capacity>80?"bg-amber-500":"bg-cyan-500"}`} style={{ width:`${h.capacity}%` }} />
              </div>
              <p className={`text-xs ${sub}`}>{t.capacity}: {h.capacity}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:t.activeVehicles, value:String(liveDeliveries.filter(d=>d.status==="In Transit"||d.status==="Out for Delivery").length), icon:"🚛", gradient:"from-cyan-500 to-blue-600" },
          { label:t.hubsOnline, value:"5/5", icon:"📡", gradient:"from-green-500 to-emerald-600" },
          { label:"Coverage Area", value:"24km²", icon:"🗺️", gradient:"from-violet-500 to-purple-600" },
          { label:"Map Refresh", value:"1.2s", icon:"⏱️", gradient:"from-amber-500 to-orange-600" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-5 ${card}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className={`text-xs mb-1 ${sub}`}>{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AUTH PAGES
═══════════════════════════════════════════ */
function LoginPage({ onBack, onSwitch, onSuccess }: { onBack:()=>void; onSwitch:()=>void; onSuccess:(r:Role,n:string)=>void }) {
  const { t, theme } = useApp();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [displayName, setDisplayName] = useState(""); const [asRole, setAsRole] = useState<Role>("user");
  const inputCls = cs("bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20","bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200",theme);
  return (
    <AuthLayout title={t.welcomeBack} subtitle={t.loginSubtitle} onBack={onBack} accent="login">
      <form className="space-y-4" onSubmit={e=>{e.preventDefault();if(email&&password)onSuccess(asRole,displayName||email.split("@")[0]||"User")}}>
        <AuthField label={t.displayName}><input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="e.g. Rahul" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`} /></AuthField>
        <AuthField label={t.email}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@company.com" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`} /></AuthField>
        <AuthField label={t.password}><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`} /></AuthField>
        <div className="space-y-2">
          <label className={`text-sm font-medium ${cs("text-slate-300","text-gray-700",theme)}`}>{t.loginAs}</label>
          <div className="grid grid-cols-2 gap-2">
            {(["user","admin"] as Role[]).map(r => (
              <button key={r} type="button" onClick={()=>setAsRole(r)} className={`px-3 py-2 rounded-xl border text-sm transition-colors ${asRole===r?"border-cyan-500/50 bg-cyan-500/10 text-cyan-300":cs("border-slate-700 text-slate-400 hover:bg-slate-800","border-gray-300 text-gray-500 hover:bg-gray-50",theme)}`}>
                {r==="user"?t.user:t.adminRole}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 text-sm">{t.loginBtn}</button>
      </form>
      <p className={`mt-5 text-center text-sm ${cs("text-slate-500","text-gray-500",theme)}`}>{t.noAccount} <button onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300 font-medium">{t.signupHere}</button></p>
    </AuthLayout>
  );
}

function SignupPage({ onBack, onSwitch, onSuccess }: { onBack:()=>void; onSwitch:()=>void; onSuccess:(r:Role,n:string)=>void }) {
  const { t, theme } = useApp();
  const [name, setName] = useState(""); const [org, setOrg] = useState(""); const [email, setEmail] = useState(""); const [stakeholderRole, setStakeholderRole] = useState("Supplier"); const [password, setPassword] = useState(""); const [agree, setAgree] = useState(true);
  const inputCls = cs("bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20","bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200",theme);
  return (
    <AuthLayout title={t.createAccount} subtitle={t.signupSubtitle} onBack={onBack} accent="signup">
      <form className="space-y-4" onSubmit={e=>{e.preventDefault();if(name&&org&&email&&password&&agree)onSuccess(stakeholderRole==="Authority"?"admin":"user",name)}}>
        <AuthField label={t.displayName}><input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Full name" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`} /></AuthField>
        <AuthField label={t.organization}><input type="text" value={org} onChange={e=>setOrg(e.target.value)} required placeholder="Company or department" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`} /></AuthField>
        <AuthField label={t.email}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@organization.com" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`} /></AuthField>
        <AuthField label={t.stakeholderRole}>
          <select value={stakeholderRole} onChange={e=>setStakeholderRole(e.target.value)} className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`}>
            {["Supplier","Transporter","Retailer","Authority"].map(r=><option key={r}>{r}</option>)}
          </select>
        </AuthField>
        <AuthField label={t.password}><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Create a secure password" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputCls}`} /></AuthField>
        <label className={`flex items-start gap-3 text-sm cursor-pointer ${cs("text-slate-400","text-gray-500",theme)}`}>
          <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="mt-1 accent-cyan-500" />
          <span>{t.agree}</span>
        </label>
        <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 font-semibold text-white hover:from-emerald-400 hover:to-cyan-500 transition-all shadow-lg shadow-emerald-500/20 text-sm">{t.createBtn}</button>
      </form>
      <p className={`mt-5 text-center text-sm ${cs("text-slate-500","text-gray-500",theme)}`}>{t.haveAccount} <button onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300 font-medium">{t.loginHere}</button></p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, onBack, accent, children }: { title:string; subtitle:string; onBack:()=>void; accent:"login"|"signup"; children:React.ReactNode }) {
  const { t, theme } = useApp();
  const grad = accent==="login" ? "from-cyan-500/20 to-blue-600/20 border-cyan-500/20" : "from-emerald-500/20 to-cyan-600/20 border-emerald-500/20";
  return (
    <section className="min-h-screen pt-24 pb-10 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-cyan-500/8 blur-3xl" /><div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl" /></div>
      <div className="relative max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch">
        <div className={`rounded-3xl border bg-gradient-to-br ${grad} p-8 flex flex-col justify-between`}>
          <div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg mb-4">SD</div>
            <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
            <p className={`text-sm leading-relaxed ${cs("text-slate-300","text-gray-600",theme)}`}>{subtitle}</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[{icon:"📦",t:"Cargo",d:"Full lifecycle."},{icon:"🕒",t:"Time Slots",d:"Low-traffic windows."},{icon:"📍",t:"Live Tracking",d:"Full visibility."}].map(c => (
              <div key={c.t} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                <div className="text-xl mb-1">{c.icon}</div>
                <div className="text-white font-semibold text-xs mb-1">{c.t}</div>
                <div className={`text-[10px] ${cs("text-slate-400","text-gray-400",theme)}`}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={`rounded-3xl border p-6 sm:p-8 ${cs("border-slate-800 bg-slate-950/90","border-gray-200 bg-white shadow-lg",theme)}`}>
          <button onClick={onBack} className={`mb-5 inline-flex items-center gap-2 text-sm transition-colors ${cs("text-slate-400 hover:text-cyan-400","text-gray-500 hover:text-cyan-600",theme)}`}>{t.backHome}</button>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          <p className={`text-sm mb-6 ${cs("text-slate-400","text-gray-500",theme)}`}>{subtitle}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

function AuthField({ label, children }: { label:string; children:React.ReactNode }) {
  const { theme } = useApp();
  return (
    <div className="space-y-1.5">
      <label className={`text-sm font-medium ${cs("text-slate-300","text-gray-700",theme)}`}>{label}</label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════ */
function StatusBadge({ status }: { status: DeliveryStatus | string }) {
  const map: Record<string,string> = {
    "Draft":"bg-slate-700/50 text-slate-300 border-slate-600",
    "Scheduled":"bg-blue-500/15 text-blue-300 border-blue-500/30",
    "Approved":"bg-violet-500/15 text-violet-300 border-violet-500/30",
    "In Transit":"bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    "Out for Delivery":"bg-amber-500/15 text-amber-300 border-amber-500/30",
    "Completed":"bg-green-500/15 text-green-300 border-green-500/30",
    "Cancelled":"bg-red-500/15 text-red-300 border-red-500/30",
    "Pending Payment":"bg-pink-500/15 text-pink-300 border-pink-500/30",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${map[status]||"bg-slate-700/50 text-slate-300 border-slate-600"}`}>{status}</span>;
}

function CargoStatusBadge({ status }: { status: CargoStatus | string }) {
  const map: Record<string,string> = {
    "Pending":"bg-slate-700/50 text-slate-300 border-slate-600",
    "Accepted":"bg-blue-500/15 text-blue-300 border-blue-500/30",
    "Loading":"bg-amber-500/15 text-amber-300 border-amber-500/30",
    "In Transit":"bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    "Unloading":"bg-orange-500/15 text-orange-300 border-orange-500/30",
    "Delivered":"bg-green-500/15 text-green-300 border-green-500/30",
    "Rejected":"bg-red-500/15 text-red-300 border-red-500/30",
    "Pending Payment":"bg-pink-500/15 text-pink-300 border-pink-500/30",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${map[status]||"bg-slate-700/50 text-slate-300 border-slate-600"}`}>{status}</span>;
}

function SectionHeader({ tag, title, subtitle }: { tag:string; title:string; subtitle:string }) {
  const { theme } = useApp();
  return (
    <div className="text-center">
      <span className="inline-block bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium px-3 py-1 rounded-full mb-3 uppercase tracking-widest">{tag}</span>
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
      <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${cs("text-slate-400","text-gray-600",theme)}`}>{subtitle}</p>
    </div>
  );
}

/* -------------------------------------------
   CHAT VIEW
 ------------------------------------------- */
function ChatView({ role, userName, messages, setMessages }: { role: Role; userName: string; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
  const { t, theme } = useApp();
  const [text, setText] = useState("");

  useEffect(() => {
    const el = document.getElementById("chat-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const card = cs("bg-slate-900 border-slate-800", "bg-white border-gray-200 shadow-sm", theme);
  const sub = cs("text-slate-400", "text-gray-500", theme);
  const inputCls = cs("bg-slate-800 border-slate-700 text-white placeholder:text-slate-500","bg-gray-100 border-gray-200 text-gray-900", theme);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: role,
      userName,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, msg]);
    setText("");

    if (role === "user") {
      setTimeout(() => {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "admin",
          userName: "Support Agent",
          text: "Thanks for your message! Our team will get back to you shortly.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, botMsg]);
      }, 1500);
    }
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">?? {t.chat}</h1>
        <p className={`text-sm ${sub}`}>{role === "admin" ? t.chatWithUser : t.chatWithAdmin}</p>
      </div>

      <div className={`flex-1 overflow-hidden border rounded-2xl flex flex-col ${card}`}>
        <div id="chat-scroll" className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isMe = (role === "admin" && m.sender === "admin") || (role === "user" && m.sender === "user" && m.userName === userName);
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">{m.userName}</span>
                    <span className="text-[9px] opacity-40">{m.time}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-none" 
                      : cs("bg-slate-800 text-slate-200 rounded-tl-none","bg-gray-100 text-gray-800 rounded-tl-none", theme)
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={sendMessage} className={`p-4 border-t ${cs("border-slate-800","border-gray-100",theme)} flex gap-2`}>
          <input 
            value={text} 
            onChange={e => setText(e.target.value)}
            placeholder={t.typeMessage}
            className={`flex-1 rounded-xl px-4 py-2 text-sm outline-none transition ${inputCls}`}
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition">
            {t.sendMessage}
          </button>
        </form>
      </div>
    </div>
  );
}
