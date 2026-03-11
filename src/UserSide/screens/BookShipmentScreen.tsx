import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    Animated,
    Alert,
    Modal,
    Pressable,
    Image,
    ActivityIndicator,
    Clipboard,
} from 'react-native';
import {
    User,
    Package,
    Layers,
    Search,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ChevronRight,
    Book,
    CheckCircle2,
    Clock,
    AlertCircle,
    Check,
    Copy,
    Edit3,
    Plus,
    Trash2,
    Shield,
    ArrowRight,
    Download,
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BookingsStore } from '../store/bookingsStore';
import { DraftsStore, DraftRecord } from '../store/draftsStore';

// --- Custom Calendar Modal Component ---
const CustomCalendar = ({ visible, onClose, onSelect, initialDate }: any) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(initialDate || new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    const renderHeader = () => (
        <View style={styles.calHeader}>
            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}>
                <ChevronRight size={20} color="#4A5568" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.calHeaderText}>{months[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}>
                <ChevronRight size={20} color="#4A5568" />
            </TouchableOpacity>
        </View>
    );

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const count = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        // Padding for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<View key={`pad-${i}`} style={styles.calDay} />);
        }

        for (let d = 1; d <= count; d++) {
            const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
            const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            days.push(
                <TouchableOpacity
                    key={d}
                    disabled={isPast}
                    onPress={() => onSelect(new Date(year, month, d))}
                    style={[styles.calDay, isToday && styles.calToday]}
                >
                    <Text style={[styles.calDayText, isPast && styles.calDayPast, isToday && styles.calTodayText]}>{d}</Text>
                </TouchableOpacity>
            );
        }

        return <View style={styles.calGrid}>{days}</View>;
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.calendarCard}>
                    {renderHeader()}
                    <View style={styles.calWeekRow}>
                        {weekDays.map((d, i) => <Text key={i} style={styles.calWeekText}>{d}</Text>)}
                    </View>
                    {renderDays()}
                    <TouchableOpacity style={styles.calCloseBtn} onPress={onClose}>
                        <Text style={styles.calCloseBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const MissingDetailsModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => (
    <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={onClose}>
            <View style={styles.missingDetailsCard}>
                <View style={styles.errorIconContainer}>
                    <AlertCircle size={32} color="#E53E3E" />
                </View>
                <Text style={styles.missingDetailsTitle}>Missing Details</Text>
                <Text style={styles.missingDetailsText}>
                    Please fill in all required fields marked with an asterisk (*).
                </Text>
                <TouchableOpacity style={styles.modalActionBtn} onPress={onClose}>
                    <Text style={styles.modalActionBtnText}>Okay, Got it</Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    </Modal>
);


const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

interface AddressEntry {
    name: string;
    mobile: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    email: string;
    company: string;
}

export const BookShipmentScreen = ({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [addressBook, setAddressBook] = useState<AddressEntry[]>([]);
    const [showAddressBook, setShowAddressBook] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);

    // Form States
    const [shipperData, setShipperData] = useState<AddressEntry & { pickupDate: string, pickupType: 'Pickup' | 'Drop-off' }>({
        name: '',
        mobile: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        email: '',
        company: '',
        pickupDate: '',
        pickupType: 'Pickup'
    });

    const [shipmentData, setShipmentData] = useState({
        type: 'Parcel', // 'Parcel' | 'Document'
        category: 'CSB-IV (Low Value Commercial)',
        unit: 'Metric (kg / cm)',
        currency: 'INR - Indian Rupee',
        invoiceNo: '',
        refNo: '',
        igstStatus: 'LUT / Bond',
        igstRate: '',
        fbaOption: false,
        boxes: [{
            length: '',
            width: '',
            height: '',
            weight: '',
            items: [{ productName: '', hsnCode: '', qty: '', unitPrice: '', igst: 'Select' }]
        }]
    });

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [consigneeData, setConsigneeData] = useState<AddressEntry>({
        name: '',
        mobile: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        email: '',
        company: '',
    });

    const [alternateContact, setAlternateContact] = useState({
        name: '',
        mobile: ''
    });

    const [csbVDetails, setCsbVDetails] = useState({
        consigneeCountry: '',
        invoiceDate: '',
        ctsh: '',
        uom: '',
        totalItemValue: '',
        totalTaxableValue: '',
        totalIgstPaid: '',
        totalCessPaid: '',
        bondOrUt: '',
        gstinType: 'GSTIN (Normal)',
        gstinId: '',
        govType: 'NON_GOV',
        iecNumber: '',
        adCode: '',
        bankName: '',
        accountNo: '',
        nfetFlag: '',
        stateCode: ''
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [locationSearch, setLocationSearch] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
    const [selectedCarrier, setSelectedCarrier] = useState<string | null>('DFL EXPRESS - Priority');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [generatedShipmentId, setGeneratedShipmentId] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [copied, setCopied] = useState(false);

    const CARRIERS = [
        { id: 'dfl_priority', name: 'DFL EXPRESS - Priority', logo: 'DFL', time: '5-6 BUSINESS DAYS', type: 'DDP', price: 3150.00, gst: 567.00, total: 3717.00 },
        { id: 'dfl_standard', name: 'DFL EXPRESS - Standard', logo: 'DFL', time: '7-8 BUSINESS DAYS', type: 'DDP', price: 3362.40, gst: 605.23, total: 3967.63 },
        { id: 'dfl_fba', name: 'DFL EXPRESS - FBA', logo: 'DFL', time: '7-10 BUSINESS DAYS', type: 'DDP', price: 3486.00, gst: 627.48, total: 4113.48 },
        { id: 'dfl_economy', name: 'DFL EXPRESS - Economy Ground', logo: 'DFL', time: '11-13 BUSINESS DAYS', type: 'DDP', price: 3936.00, gst: 708.48, total: 4644.48 },
        { id: 'dhl_priority', name: 'DHL Export - Priority', logo: 'DHL', time: '4 BUSINESS DAYS', type: 'DDP', price: 3960.42, gst: 712.87, total: 4673.29, info: 'DUTY CHARGES APPLICABLE' },
        { id: 'fedex_small', name: 'FedEx Export - Small Parcels', logo: 'FedEx', time: '3 BUSINESS DAYS', type: 'DDP', price: 5136.87, gst: 924.64, total: 6061.51, info: 'DUTY CHARGES APPLICABLE' },
    ];

    // ─── Pre-populate Form if Edit Mode or Draft Mode ─────────────────────
    useEffect(() => {
        const editData = BookingsStore.getEditBooking();
        const draftData = DraftsStore.getDraftToLoad();

        if (editData) {
            setShipperData({
                name: editData.shipperName,
                mobile: editData.shipperMobile,
                addressLine1: editData.shipperAddress,
                addressLine2: '',
                city: editData.shipperCity,
                state: editData.shipperState,
                country: editData.shipperCountry,
                pincode: editData.shipperPincode,
                email: editData.shipperEmail,
                company: editData.shipperCompany,
                pickupDate: editData.pickupDate,
                pickupType: editData.pickupType
            });

            setConsigneeData({
                name: editData.consigneeName,
                mobile: editData.consigneeMobile,
                addressLine1: editData.consigneeAddress,
                addressLine2: '',
                city: editData.consigneeCity,
                state: editData.consigneeState,
                country: editData.consigneeCountry,
                pincode: editData.consigneePincode,
                email: editData.consigneeEmail,
                company: editData.consigneeCompany,
            });

            setShipmentData(prev => ({
                ...prev,
                type: editData.shipmentType as any,
                category: editData.category,
                invoiceNo: editData.invoiceNo,
                refNo: editData.refNo,
                currency: editData.currency,
                boxes: Array.from({ length: editData.totalBoxes }).map(() => ({
                    length: '',
                    width: '',
                    height: '',
                    weight: (parseFloat(editData.totalWeight) / editData.totalBoxes).toString(),
                    items: [{ productName: '', hsnCode: '', qty: '', unitPrice: '', igst: 'Select' }]
                }))
            }));

            setSelectedCarrier(editData.carrier);
            setSelectedServices(editData.selectedServices);

            if (editData.csbVDetails) {
                setCsbVDetails(editData.csbVDetails);
            }

            setActiveStep(1);
            BookingsStore.setEditBooking(null);
        } else if (draftData) {
            // Load from draft
            setShipperData(draftData.shipperData);
            setConsigneeData(draftData.consigneeData);
            setShipmentData(draftData.shipmentData);
            if (draftData.csbVDetails) setCsbVDetails(draftData.csbVDetails);
            setActiveStep(draftData.activeStep || 1);

            // Clear draft to load
            DraftsStore.setDraftToLoad(null);
        }
    }, []);
    // ───────────────────────────────────────────────────────────────────────

    const addBox = () => {
        setShipmentData(prev => ({
            ...prev,
            boxes: [...prev.boxes, {
                length: '',
                width: '',
                height: '',
                weight: '',
                items: [{ productName: '', hsnCode: '', qty: '', unitPrice: '', igst: 'Select' }]
            }]
        }));
    };

    const removeBox = (index: number) => {
        if (shipmentData.boxes.length > 1) {
            const newBoxes = shipmentData.boxes.filter((_, i) => i !== index);
            setShipmentData(prev => ({ ...prev, boxes: newBoxes }));
        }
    };

    const updateBox = (index: number, field: string, value: string) => {
        const newBoxes = [...shipmentData.boxes];
        (newBoxes[index] as any)[field] = value;
        setShipmentData(prev => ({ ...prev, boxes: newBoxes }));
    };

    const addProduct = (boxIndex: number) => {
        const newBoxes = [...shipmentData.boxes];
        newBoxes[boxIndex].items.push({ productName: '', hsnCode: '', qty: '', unitPrice: '', igst: 'Select' });
        setShipmentData(prev => ({ ...prev, boxes: newBoxes }));
    };

    const removeProduct = (boxIndex: number, productIndex: number) => {
        const newBoxes = [...shipmentData.boxes];
        if (newBoxes[boxIndex].items.length > 1) {
            newBoxes[boxIndex].items = newBoxes[boxIndex].items.filter((_, i) => i !== productIndex);
            setShipmentData(prev => ({ ...prev, boxes: newBoxes }));
        }
    };

    const updateProduct = (boxIndex: number, productIndex: number, field: string, value: string) => {
        const newBoxes = [...shipmentData.boxes];
        (newBoxes[boxIndex].items[productIndex] as any)[field] = value;
        setShipmentData(prev => ({ ...prev, boxes: newBoxes }));
    };

    const calculateBoxTotal = (boxIndex: number) => {
        const box = shipmentData.boxes[boxIndex];
        if (!box || !box.items) return "0.00";
        return box.items.reduce((acc, item) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            return acc + (qty * price);
        }, 0).toFixed(2);
    };

    const calculateTotalShipmentValue = () => {
        return shipmentData.boxes.reduce((acc, _, idx) => acc + parseFloat(calculateBoxTotal(idx)), 0).toFixed(2);
    };

    const toggleService = (name: string) => {
        setSelectedServices(prev =>
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    const calculateTotalWeight = () => {
        return shipmentData.boxes.reduce((acc, box) => {
            const w = box && typeof box === 'object' ? parseFloat(box.weight) : 0;
            return acc + (w || 0);
        }, 0).toFixed(2);
    };

    const updateField = (field: string, value: string) => {
        if (activeStep === 1) {
            setShipperData(prev => ({ ...prev, [field]: value }));
        } else {
            setConsigneeData(prev => ({ ...prev, [field]: value }));
        }
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSaveAsDraft = () => {
        const draftId = 'DRAFT' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const displayId = '#' + draftId.substring(5);

        const newDraft: DraftRecord = {
            id: draftId,
            displayId,
            shipperData,
            consigneeData,
            shipmentData,
            csbVDetails: shipmentData.category === 'CSB-V (High Value Commercial)' ? csbVDetails : null,
            shipperName: shipperData.name || 'Unknown Shipper',
            consigneeName: consigneeData.name || 'Unknown Consignee',
            origin: shipperData.city || 'Unknown',
            destination: consigneeData.city || 'Unknown',
            details: `${shipmentData.type} ${shipmentData.boxes.length} Box(es)`,
            estAmount: calculateTotalShipmentValue(),
            savedAt: new Date().toISOString(),
            activeStep,
        };

        DraftsStore.add(newDraft);
        Alert.alert('Success', 'Shipment saved as draft!');
    };

    const handleSelectFromAddressBook = (entry: AddressEntry) => {
        if (activeStep === 1) {
            setShipperData(prev => ({ ...prev, ...entry }));
        } else {
            setConsigneeData(prev => ({ ...prev, ...entry }));
        }
        setShowAddressBook(false);
    };

    const validateFields = () => {
        let mandatoryFields: string[] = [];
        let currentData: any = {};

        if (activeStep === 1) {
            mandatoryFields = ['name', 'mobile', 'addressLine1', 'city', 'country', 'pincode', 'pickupDate'];
            currentData = shipperData;
        } else if (activeStep === 2) {
            mandatoryFields = ['name', 'mobile', 'addressLine1', 'city', 'country', 'pincode'];
            currentData = consigneeData;
        } else if (activeStep === 3) {
            mandatoryFields = ['invoiceNo', 'category', 'currency'];
            currentData = shipmentData;
        }

        const newErrors: Record<string, boolean> = {};
        let isValid = true;

        mandatoryFields.forEach(field => {
            if (!currentData[field]) {
                newErrors[field] = true;
                isValid = false;
            }
        });

        if (activeStep === 3) {
            shipmentData.boxes.forEach((box, index) => {
                if (!box.weight) {
                    newErrors[`box_weight_${index}`] = true;
                    isValid = false;
                }
            });
        }

        setErrors(newErrors);
        return isValid;
    };

    const generateShipmentId = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        let result = 'DFL';
        for (let i = 0; i < 8; i++) {
            result += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return result;
    };

    const copyToClipboard = (text: string) => {
        Clipboard.setString(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePayAndBook = () => {
        setIsBooking(true);
        const newId = generateShipmentId();
        // Simulate loading for 2 seconds
        setTimeout(() => {
            setIsBooking(false);
            setBookingConfirmed(true);
            setGeneratedShipmentId(newId);

            // ── Save to Bookings Store ──────────────────────────────────
            const selectedCarrierObj = CARRIERS.find(c => c.name === selectedCarrier);
            const now = new Date().toISOString();
            const nowFormatted = new Date().toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
            });

            BookingsStore.add({
                id: newId,

                // Shipper
                shipperName: shipperData.name,
                shipperCompany: shipperData.company,
                shipperMobile: shipperData.mobile,
                shipperEmail: shipperData.email,
                shipperAddress: shipperData.addressLine1 + (shipperData.addressLine2 ? ', ' + shipperData.addressLine2 : ''),
                shipperCity: shipperData.city,
                shipperState: shipperData.state,
                shipperCountry: shipperData.country,
                shipperPincode: shipperData.pincode,
                pickupDate: shipperData.pickupDate,
                pickupType: shipperData.pickupType,

                // Consignee
                consigneeName: consigneeData.name,
                consigneeCompany: consigneeData.company,
                consigneeMobile: consigneeData.mobile,
                consigneeEmail: consigneeData.email,
                consigneeAddress: consigneeData.addressLine1 + (consigneeData.addressLine2 ? ', ' + consigneeData.addressLine2 : ''),
                consigneeCity: consigneeData.city,
                consigneeState: consigneeData.state,
                consigneeCountry: consigneeData.country,
                consigneePincode: consigneeData.pincode,

                // Shipment
                shipmentType: shipmentData.type,
                category: shipmentData.category,
                invoiceNo: shipmentData.invoiceNo,
                refNo: shipmentData.refNo,
                currency: shipmentData.currency,
                totalWeight: calculateTotalWeight(),
                totalValue: calculateTotalShipmentValue(),
                totalBoxes: shipmentData.boxes.length,

                // Carrier
                carrier: selectedCarrier || 'DFL EXPRESS - Priority',
                eta: selectedCarrierObj?.time || '',
                price: selectedCarrierObj?.price || 0,
                gst: selectedCarrierObj?.gst || 0,
                total: selectedCarrierObj?.total || 0,

                selectedServices,
                status: 'Pending',
                bookedAt: now,
                csbVDetails: shipmentData.category === 'CSB-V (High Value Commercial)' ? csbVDetails : null,

                // Initial tracking history
                trackingHistory: [
                    {
                        status: 'Pending',
                        description: 'Shipment created',
                        date: nowFormatted,
                    },
                ],
            });
            // ───────────────────────────────────────────────────────────
        }, 2000);
    };

    const handleContinue = () => {
        if (activeStep < 4) {
            if (validateFields()) {
                // Check for 25000 INR limit on CSB-IV
                if (shipmentData.category === 'CSB-IV (Low Value Commercial)' && parseFloat(calculateTotalShipmentValue()) > 25000) {
                    Alert.alert(
                        "Warning",
                        "The total shipment value exceeds 25,000 INR. This exceeds the limit for CSB-IV (Low Value Commercial). Would you like to continue anyway or switch to CSB-V?",
                        [
                            { text: "Change to CSB-V", onPress: () => setShipmentData(prev => ({ ...prev, category: 'CSB-V (High Value Commercial)' })) },
                            { text: "Continue anyway", onPress: () => setActiveStep(activeStep + 1) },
                            { text: "Cancel", style: "cancel" }
                        ]
                    );
                    return;
                }
                setActiveStep(activeStep + 1);
            } else {
                setShowValidationModal(true);
            }
        } else {
            handlePayAndBook();
        }
    };

    const handleBack = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
        }
    };

    const handleManualEntry = () => {
        if (activeStep === 1) {
            setShipperData(p => ({
                ...p,
                name: '',
                mobile: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                country: 'India',
                pincode: '',
                email: '',
                company: ''
            }));
        } else if (activeStep === 2) {
            setConsigneeData({
                name: '',
                mobile: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                country: '',
                pincode: '',
                email: '',
                company: ''
            });
        }
    };

    // Location Search & Pincode Auto-fetch (Global Coverage)
    useEffect(() => {
        const fetchLocation = async () => {
            if (!locationSearch || locationSearch.length < 3) {
                setSearchSuggestions([]);
                return;
            }

            const searchLower = locationSearch.toLowerCase();
            let allSuggestions: string[] = [];

            // 1. Indian Pincode Specialized Search (Priority for India)
            const indianPincodeRegex = /^[1-9][0-9]{5}$/;
            if (indianPincodeRegex.test(locationSearch)) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${locationSearch}`);
                    const data = await response.json();
                    if (data[0].Status === 'Success') {
                        const postOffices = data[0].PostOffice;
                        const indianSuggestions = postOffices.map((po: any) =>
                            `${po.Name}, ${po.District}, ${po.State}, ${locationSearch}, India`
                        );
                        allSuggestions = [...indianSuggestions];
                        setSearchSuggestions(allSuggestions);
                        return; // Done for specialized pincode search
                    }
                } catch (error) {
                    console.error('Indian Pincode fetch error:', error);
                }
            }

            // 2. Global Search using Nominatim (OpenStreetMap)
            try {
                // Nominatim REQUIRES a User-Agent to avoid 403/non-JSON responses
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationSearch)}&format=json&addressdetails=1&limit=10`, {
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'DFL-Logistics-App/1.0 (contact@dfllogistics.com)'
                    }
                });

                const contentType = response.headers.get("content-type");
                if (response.ok && contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        const globalSuggestions = data.map((item: any) => {
                            const addr = item.address || {};
                            const city = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || '';
                            const state = addr.state || addr.province || '';
                            const country = addr.country || '';
                            const postcode = addr.postcode || '';
                            const name = item.display_name.split(',')[0];

                            return `${name}, ${city}, ${state}, ${postcode}, ${country}`;
                        });
                        allSuggestions = [...allSuggestions, ...globalSuggestions];
                    }
                } else {
                    console.warn('Nominatim returned non-JSON or error:', response.status);
                }
            } catch (error) {
                console.error('Global search error:', error);
            }

            setSearchSuggestions(allSuggestions.length > 0 ? allSuggestions.slice(0, 10) : []);
        };

        const timer = setTimeout(fetchLocation, 600); // Debounce to respect API limits
        return () => clearTimeout(timer);
    }, [locationSearch]);

    const handleSuggestionSelect = (loc: string) => {
        const parts = loc.split(', ');
        // Expected format for pincode results: Name, District, State, Pincode, Country
        // Expected format for mock results: City, State, Country

        let city = '', state = '', country = '', pincode = '', area = '';

        if (parts.length >= 5) {
            // Pincode API result
            area = parts[0];
            city = parts[1];
            state = parts[2];
            pincode = parts[3];
            country = parts[4];
        } else {
            // Mock result
            city = parts[0];
            state = parts[1];
            country = parts[2] || 'India';
            pincode = '';
            area = city;
        }

        const updateData = {
            city,
            state,
            country,
            pincode: pincode || (activeStep === 1 ? shipperData.pincode : consigneeData.pincode),
            addressLine1: area
        };

        if (activeStep === 1) {
            setShipperData(prev => ({ ...prev, ...updateData }));
        } else {
            setConsigneeData(prev => ({ ...prev, ...updateData }));
        }

        setLocationSearch(loc);
        setSearchSuggestions([]);
    };

    const renderStepIcon = (step: number, icon: any, label: string, active: boolean) => (
        <View style={styles.stepItem}>
            <View style={[styles.stepIconContainer, active && styles.activeStepIcon]}>
                {React.createElement(icon, { size: 20, color: active ? Colors.white : '#A0AEC0' })}
            </View>
            <View style={styles.stepTextContainer}>
                <Text style={[styles.stepLabel, active && styles.activeStepLabel]}>STEP {step}</Text>
                <Text style={[styles.stepSubLabel, active && styles.activeStepSubLabel]}>{label}</Text>
            </View>
        </View>
    );

    const getInputStyle = (field: string) => [
        styles.input,
        errors[field] && styles.inputError
    ];

    const renderLoadingScreen = () => (
        <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#003049" />
                <Text style={styles.loadingText}>Processing your booking...</Text>
                <Text style={styles.loadingSub}>Please do not close this window</Text>
            </View>
        </View>
    );

    const renderConfirmationScreen = () => (
        <ScrollView contentContainerStyle={styles.confirmationScroll}>
            <View style={styles.confCard}>
                <View style={styles.confHeader}>
                    <View style={styles.confCheckCircle}>
                        <CheckCircle2 size={50} color={Colors.white} />
                    </View>
                    <Text style={styles.confTitle}>Booking Confirmed!</Text>
                    <Text style={styles.confSubtitle}>Your shipment has been successfully registered and is ready for processing.</Text>
                </View>

                <View style={{ padding: 30 }}>
                    <View style={styles.shipmentIdCard}>
                        <View style={styles.shipIdBox}>
                            <Text style={styles.shipIdLabel}>SHIPMENT ID</Text>
                            <Text style={styles.shipIdValue}>{generatedShipmentId}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={() => copyToClipboard(generatedShipmentId)}
                        >
                            {copied ? (
                                <Check size={18} color="#48BB78" />
                            ) : (
                                <Copy size={18} color="#718096" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.confDetailsGrid}>
                        <View style={styles.confRow}>
                            <View style={styles.confSection}>
                                <View style={styles.confSectionHeader}>
                                    <Package size={14} color="#718096" />
                                    <Text style={styles.confSectionTitle}>ROUTE DETAILS</Text>
                                </View>
                                <View style={styles.routeBox}>
                                    <View style={styles.routePoint}>
                                        <Text style={styles.routeLabel}>FROM</Text>
                                        <Text style={styles.routeMain}>{shipperData.city || 'New Delhi'}</Text>
                                        <Text style={styles.routeSub}>{shipperData.country || 'India'}</Text>
                                    </View>
                                    <ArrowRight size={20} color="#CBD5E0" />
                                    <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
                                        <Text style={styles.routeLabel}>TO</Text>
                                        <Text style={styles.routeMain}>{consigneeData.city || 'Marysville'}</Text>
                                        <Text style={styles.routeSub}>{consigneeData.country || 'United States'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.confSection}>
                                <View style={styles.confSectionHeader}>
                                    <Search size={14} color="#718096" />
                                    <Text style={styles.confSectionTitle}>SERVICE DETAILS</Text>
                                </View>
                                <View style={styles.serviceInfoBox}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Service</Text>
                                        <Text style={styles.infoValue} numberOfLines={2}>{selectedCarrier}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>ETA</Text>
                                        <Text style={styles.infoValue}>{CARRIERS.find(c => c.name === selectedCarrier)?.time}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Total Cost</Text>
                                        <Text style={[styles.infoValue, { fontWeight: '900', color: '#003049' }]}>
                                            ₹{CARRIERS.find(c => c.name === selectedCarrier)?.total.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.confRow}>
                            <View style={styles.confSection}>
                                <View style={styles.confSectionHeader}>
                                    <User size={14} color="#718096" />
                                    <Text style={styles.confSectionTitle}>SHIPPER</Text>
                                </View>
                                <View style={styles.contactInfoBox}>
                                    <Text style={styles.contactName}>{shipperData.name}</Text>
                                    <Text style={styles.contactSub}>{shipperData.company || 'DFL-group'}</Text>
                                    <Text style={styles.contactSub}>{shipperData.mobile}</Text>
                                </View>
                            </View>

                            <View style={styles.confSection}>
                                <View style={styles.confSectionHeader}>
                                    <User size={14} color="#718096" />
                                    <Text style={styles.confSectionTitle}>CONSIGNEE</Text>
                                </View>
                                <View style={styles.contactInfoBox}>
                                    <Text style={styles.contactName}>{consigneeData.name}</Text>
                                    <Text style={styles.contactSub}>{consigneeData.company || consigneeData.mobile}</Text>
                                    <Text style={styles.contactSub}>{consigneeData.mobile}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.confActions}>
                        <TouchableOpacity style={styles.receiptBtn}>
                            <Download size={18} color="#2D3748" />
                            <Text style={styles.receiptBtnText}>Download / Print Receipt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.doneBtn}
                            onPress={() => {
                                setBookingConfirmed(false);
                                setActiveStep(1);
                            }}
                        >
                            <Text style={styles.doneBtnText}>Go to Dashboard</Text>
                            <ArrowRight size={18} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    if (bookingConfirmed) return renderConfirmationScreen();

    return (
        <View style={styles.container}>
            <View style={styles.mainWrapper}>
                <Sidebar
                    isExpanded={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeScreen="Book Shipment"
                    onNavigate={onNavigate}
                />
                <View style={{ width: 72 }} />
                <View style={styles.contentArea}>
                    <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />
                    <ScrollView
                        showsVerticalScrollIndicator={true}
                        persistentScrollbar={true}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                    >
                        <View style={{ paddingHorizontal: 15, paddingVertical: 20 }}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.titleCol}>
                                    <Text style={styles.pageTitle}>Book a Shipment</Text>
                                    <Text style={styles.pageSubtitle}>Fill in the details below to schedule your pickup.</Text>
                                </View>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={true}
                                    persistentScrollbar={true}
                                    contentContainerStyle={styles.stepperContainer}
                                    style={styles.stepperScroll}
                                >
                                    {renderStepIcon(1, User, 'Shipper', activeStep === 1)}
                                    <View style={styles.stepLink} />
                                    {renderStepIcon(2, User, 'Consignee', activeStep === 2)}
                                    <View style={styles.stepLink} />
                                    {renderStepIcon(3, Package, 'Shipment', activeStep === 3)}
                                    <View style={styles.stepLink} />
                                    {renderStepIcon(4, Layers, 'Services', activeStep === 4)}
                                </ScrollView>
                            </View>

                            <View style={styles.columnsContainer}>
                                {/* Summary Section */}
                                <View style={styles.summarySection}>
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <View style={styles.dot} />
                                            <Text style={styles.summaryTitle}>BOOKING SUMMARY</Text>
                                        </View>

                                        <View style={styles.summaryContentRow}>
                                            <View style={styles.summaryColLeft}>
                                                <Text style={styles.summaryActionLabel}>ORIGIN</Text>
                                                <Text style={styles.summaryLocationText} numberOfLines={1}>
                                                    {shipperData.city || 'City'}, {shipperData.country || 'IN'}
                                                </Text>
                                                <Text style={styles.summarySubText} numberOfLines={1}>{shipperData.name || 'Sender Name'}</Text>
                                                <Text style={styles.summaryDateText}>{shipperData.pickupDate || 'Mar 9'}</Text>
                                            </View>

                                            <View style={styles.summaryConnectorCol}>
                                                <View style={styles.connectorLine} />
                                                <View style={styles.connectorIcon}>
                                                    <ChevronRight size={14} color="#E67E22" style={{ marginRight: 50 }} />
                                                </View>
                                            </View>

                                            <View style={styles.summaryColRight}>
                                                <Text style={styles.summaryActionLabel}>DESTINATION</Text>
                                                <Text style={styles.summaryLocationText} numberOfLines={1}>
                                                    {consigneeData.city || 'City'}, {consigneeData.pincode || 'Code'}
                                                </Text>
                                                <Text style={styles.summarySubText} numberOfLines={1}>{consigneeData.name || 'Receiver Name'}</Text>
                                                <Text style={[styles.summaryDateText, { opacity: 0 }]}>Date</Text>
                                            </View>
                                        </View>

                                        <View style={styles.awaitingBadge}>
                                            <View style={styles.orangeDot} />
                                            <Text style={styles.awaitingText}>
                                                {activeStep < 3 ? 'AWAITING DETAILS' : 'DETAILS FILLED'}
                                            </Text>
                                        </View>

                                        {activeStep >= 3 && (
                                            <View style={styles.summaryShipmentDetail}>
                                                <View style={styles.summaryDivider} />
                                                <View style={styles.summaryItemRow}>
                                                    <View style={styles.summaryItemCol}>
                                                        <View style={styles.summaryItemTitleRow}>
                                                            <Package size={14} color="#718096" />
                                                            <Text style={styles.summaryItemTitle}>SHIPMENT DETAIL</Text>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.summaryItemValue}>{shipmentData.type}</Text>
                                                </View>
                                                <View style={[styles.summaryItemRow, { marginTop: 15 }]}>
                                                    <View style={styles.summaryItemCol}>
                                                        <Text style={styles.summaryItemLabel}>QTY</Text>
                                                        <Text style={styles.summaryItemMain}>{shipmentData.boxes.length} Unit</Text>
                                                    </View>
                                                    <View style={[styles.summaryItemCol, { alignItems: 'center' }]}>
                                                        <Text style={styles.summaryItemLabel}>TOTAL WEIGHT</Text>
                                                        <Text style={styles.summaryItemMain}>{calculateTotalWeight()} kg</Text>
                                                    </View>
                                                    <View style={[styles.summaryItemCol, { alignItems: 'flex-end' }]}>
                                                        <Text style={styles.summaryItemLabel}>TOTAL VALUE</Text>
                                                        <Text style={styles.summaryItemMain}>{shipmentData.currency.split(' ')[0]} {calculateTotalShipmentValue()}</Text>
                                                    </View>
                                                </View>
                                                {activeStep === 4 && selectedCarrier && (
                                                    <View style={styles.summaryCarrierDetail}>
                                                        <View style={styles.summaryDivider} />
                                                        <View style={styles.summaryCarrierRow}>
                                                            <Image
                                                                source={{ uri: 'https://www.dflworld.com/assets/img/logo.png' }}
                                                                style={styles.summaryCarrierLogo}
                                                                resizeMode="contain"
                                                            />
                                                            <View>
                                                                <Text style={styles.summaryCarrierName}>{selectedCarrier}</Text>
                                                                <Text style={styles.summaryCarrierTime}>
                                                                    {CARRIERS.find(c => c.name === selectedCarrier)?.time}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.totalPayCard}>
                                                            <View style={styles.totalPayRow}>
                                                                <Text style={styles.totalPayLabel}>TOTAL PAY</Text>
                                                                <View style={styles.taxBadge}>
                                                                    <Text style={styles.taxBadgeText}>Incl. GST</Text>
                                                                </View>
                                                            </View>
                                                            <Text style={styles.totalPayValue}>
                                                                ₹{CARRIERS.find(c => c.name === selectedCarrier)?.total.toLocaleString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Main Form Section */}
                                <View style={[styles.formSection, { marginTop: 20 }]}>
                                    <View style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardHeaderTitle}>
                                                <View style={[styles.stepDot, { backgroundColor: '#003049' }]} />
                                                <Text style={styles.cardTitle}>
                                                    {activeStep === 1 ? 'Shipper Information' :
                                                        activeStep === 2 ? 'Consignee Information' :
                                                            activeStep === 3 ? 'Shipment Details' : 'Select Service'}
                                                </Text>
                                            </View>
                                            {(activeStep === 1 || activeStep === 2) && (
                                                <View style={styles.headerBtnGroup}>
                                                    <TouchableOpacity style={styles.manualEntryBtn} onPress={handleManualEntry}>
                                                        <Edit3 size={15} color="#003049" />
                                                        <Text style={styles.addressBookBtnText}>Manual Entry</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.addressBookBtn} onPress={() => setShowAddressBook(true)}>
                                                        <Book size={15} color="#003049" />
                                                        <Text style={styles.addressBookBtnText}>Address Book</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>

                                        {activeStep <= 2 ? (
                                            <View style={styles.formGrid}>
                                                {/* NAME */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>NAME <Text style={styles.required}>*</Text></Text>
                                                    <TextInput
                                                        style={getInputStyle('name')}
                                                        placeholder="Enter Name"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.name : consigneeData.name}
                                                        onChangeText={(v) => updateField('name', v)}
                                                    />
                                                </View>

                                                {/* COMPANY */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>COMPANY</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Enter Company"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.company : consigneeData.company}
                                                        onChangeText={(v) => updateField('company', v)}
                                                    />
                                                </View>

                                                {/* MOBILE */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>MOBILE <Text style={styles.required}>*</Text></Text>
                                                    <View style={styles.mobileInputContainer}>
                                                        <View style={styles.countryCode}><Text style={styles.countryCodeText}>+91</Text></View>
                                                        <TextInput
                                                            style={[getInputStyle('mobile'), { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                                                            placeholder="1234567890"
                                                            placeholderTextColor="#A0AEC0"
                                                            keyboardType="phone-pad"
                                                            value={activeStep === 1 ? shipperData.mobile : consigneeData.mobile}
                                                            onChangeText={(v) => updateField('mobile', v)}
                                                        />
                                                    </View>
                                                </View>

                                                {/* EMAIL */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>EMAIL</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Enter Email"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.email : consigneeData.email}
                                                        onChangeText={(v) => updateField('email', v)}
                                                    />
                                                </View>

                                                {/* SEARCH LOCATION */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>SEARCH LOCATION</Text>
                                                    <View style={styles.searchInputContainer}>
                                                        <Search size={16} color="#A0AEC0" style={styles.searchIcon} />
                                                        <TextInput
                                                            style={styles.searchInput}
                                                            placeholder="Start typing area, street or city..."
                                                            placeholderTextColor="#A0AEC0"
                                                            value={locationSearch}
                                                            onChangeText={setLocationSearch}
                                                        />
                                                    </View>
                                                    {searchSuggestions.length > 0 && (
                                                        <View style={styles.suggestionBox}>
                                                            {searchSuggestions.map((item, i) => (
                                                                <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => handleSuggestionSelect(item)}>
                                                                    <MapPin size={14} color="#718096" />
                                                                    <Text style={styles.suggestionText}>{item}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>

                                                {/* ADDRESS LINE 1 */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>ADDRESS LINE 1 <Text style={styles.required}>*</Text></Text>
                                                    <TextInput
                                                        style={getInputStyle('addressLine1')}
                                                        placeholder="Street, Landmark"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.addressLine1 : consigneeData.addressLine1}
                                                        onChangeText={(v) => updateField('addressLine1', v)}
                                                    />
                                                </View>

                                                {/* ADDRESS LINE 2 */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>ADDRESS LINE 2</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Apartment, Studio, Floor"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.addressLine2 : consigneeData.addressLine2}
                                                        onChangeText={(v) => updateField('addressLine2', v)}
                                                    />
                                                </View>

                                                {/* CITY */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>CITY <Text style={styles.required}>*</Text></Text>
                                                    <TextInput
                                                        style={getInputStyle('city')}
                                                        placeholder="Enter City"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.city : consigneeData.city}
                                                        onChangeText={(v) => updateField('city', v)}
                                                    />
                                                </View>

                                                {/* STATE */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>STATE</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Enter State"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.state : consigneeData.state}
                                                        onChangeText={(v) => updateField('state', v)}
                                                    />
                                                </View>

                                                {/* COUNTRY */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>COUNTRY <Text style={styles.required}>*</Text></Text>
                                                    <TextInput
                                                        style={getInputStyle('country')}
                                                        placeholder="Enter Country"
                                                        placeholderTextColor="#A0AEC0"
                                                        value={activeStep === 1 ? shipperData.country : consigneeData.country}
                                                        onChangeText={(v) => updateField('country', v)}
                                                    />
                                                </View>

                                                {/* PINCODE */}
                                                <View style={[styles.inputGroup, { width: '100%' }]}>
                                                    <Text style={styles.label}>PINCODE <Text style={styles.required}>*</Text></Text>
                                                    <TextInput
                                                        style={getInputStyle('pincode')}
                                                        placeholder="Enter Pincode"
                                                        placeholderTextColor="#A0AEC0"
                                                        keyboardType="numeric"
                                                        value={activeStep === 1 ? shipperData.pincode : consigneeData.pincode}
                                                        onChangeText={(v) => updateField('pincode', v)}
                                                    />
                                                </View>
                                            </View>
                                        ) : activeStep === 3 ? (
                                            <View style={styles.formGrid}>
                                                <View style={styles.shipmentTypeTabs}>
                                                    <View style={styles.tabsLeft}>
                                                        <TouchableOpacity
                                                            style={[styles.typeTab, shipmentData.type === 'Parcel' && styles.typeTabActive]}
                                                            onPress={() => setShipmentData(prev => ({ ...prev, type: 'Parcel' }))}
                                                        >
                                                            <Package size={16} color={shipmentData.type === 'Parcel' ? '#003049' : '#718096'} />
                                                            <Text style={[styles.typeTabText, shipmentData.type === 'Parcel' && styles.typeTabTextActive]}>Parcel</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={[styles.typeTab, shipmentData.type === 'Document' && styles.typeTabActive]}
                                                            onPress={() => setShipmentData(prev => ({ ...prev, type: 'Document' }))}
                                                        >
                                                            <Book size={16} color={shipmentData.type === 'Document' ? '#003049' : '#718096'} />
                                                            <Text style={[styles.typeTabText, shipmentData.type === 'Document' && styles.typeTabTextActive]}>Document</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={styles.weightStats}>
                                                        <View style={styles.statBox}>
                                                            <Text style={styles.statLabel}>Act: {calculateTotalWeight()} kg</Text>
                                                        </View>
                                                        <View style={styles.statBox}>
                                                            <Text style={styles.statLabel}>Chg: 0.05 kg</Text>
                                                        </View>
                                                        <View style={[styles.statBox, { borderRightWidth: 0, backgroundColor: '#E1FFE4' }]}>
                                                            <Text style={[styles.statLabel, { color: '#2F855A' }]}>Val: {calculateTotalShipmentValue()}</Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* SHIPMENT FIELD ROWS */}
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                                                    {/* CATEGORY */}
                                                    <View style={[styles.inputGroup, { flex: 1, minWidth: '30%' }]}><Text style={styles.label}>CATEGORY <Text style={styles.required}>*</Text></Text>
                                                        <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}>
                                                            <Text style={styles.dropdownValue}>{shipmentData.category}</Text>
                                                            <ChevronRight size={14} color="#718096" style={{ transform: [{ rotate: '90deg' }] }} />
                                                        </TouchableOpacity>
                                                        {activeDropdown === 'category' && (
                                                            <View style={styles.dropdownMenu}>
                                                                {['CSB-IV (Low Value Commercial)', 'CSB-V (High Value Commercial)', 'Sample'].map(item => (
                                                                    <TouchableOpacity key={item} style={styles.dropdownMenuItem} onPress={() => { setShipmentData(prev => ({ ...prev, category: item })); setActiveDropdown(null); }}>
                                                                        <Text style={styles.dropdownMenuItemText}>{item}</Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>

                                                    {/* UNIT */}
                                                    <View style={[styles.inputGroup, { flex: 1, minWidth: '30%' }]}><Text style={styles.label}>UNIT <Text style={styles.required}>*</Text></Text>
                                                        <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setActiveDropdown(activeDropdown === 'unit' ? null : 'unit')}>
                                                            <Text style={styles.dropdownValue}>{shipmentData.unit}</Text>
                                                            <ChevronRight size={14} color="#718096" style={{ transform: [{ rotate: '90deg' }] }} />
                                                        </TouchableOpacity>
                                                        {activeDropdown === 'unit' && (
                                                            <View style={styles.dropdownMenu}>
                                                                {['Metric (kg / cm)', 'Imperial (lb / in)'].map(item => (
                                                                    <TouchableOpacity key={item} style={styles.dropdownMenuItem} onPress={() => { setShipmentData(prev => ({ ...prev, unit: item })); setActiveDropdown(null); }}>
                                                                        <Text style={styles.dropdownMenuItemText}>{item}</Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>

                                                    {/* CURRENCY */}
                                                    <View style={[styles.inputGroup, { flex: 1, minWidth: '30%' }]}><Text style={styles.label}>CURRENCY <Text style={styles.required}>*</Text></Text>
                                                        <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setActiveDropdown(activeDropdown === 'currency' ? null : 'currency')}>
                                                            <Text style={styles.dropdownValue}>{shipmentData.currency.split(' - ')[0] || 'Currency'}</Text>
                                                            <ChevronRight size={14} color="#718096" style={{ transform: [{ rotate: '90deg' }] }} />
                                                        </TouchableOpacity>
                                                        {activeDropdown === 'currency' && (
                                                            <View style={styles.dropdownMenu}>
                                                                {['INR - Indian Rupee', 'USD - US Dollar', 'EUR - Euro', 'GBP - British Pound'].map(item => (
                                                                    <TouchableOpacity key={item} style={styles.dropdownMenuItem} onPress={() => { setShipmentData(prev => ({ ...prev, currency: item })); setActiveDropdown(null); }}>
                                                                        <Text style={styles.dropdownMenuItemText}>{item}</Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                                                    {/* INVOICE NO. */}
                                                    <View style={[styles.inputGroup, { flex: 1, minWidth: '45%' }]}><Text style={styles.label}>INVOICE NO. <Text style={styles.required}>*</Text></Text>
                                                        <TextInput style={getInputStyle('invoiceNo')} placeholder="Required" placeholderTextColor="#A0AEC0" value={shipmentData.invoiceNo} onChangeText={(v) => setShipmentData(prev => ({ ...prev, invoiceNo: v }))} />
                                                    </View>

                                                    {/* REF NO. */}
                                                    <View style={[styles.inputGroup, { flex: 1, minWidth: '45%' }]}><Text style={styles.label}>REF NO.</Text>
                                                        <TextInput style={styles.input} placeholder="Optional" placeholderTextColor="#A0AEC0" value={shipmentData.refNo} onChangeText={(v) => setShipmentData(prev => ({ ...prev, refNo: v }))} />
                                                    </View>
                                                </View>

                                                {/* INTERNATIONAL ORDER CLAUSES */}
                                                <View style={styles.clauseSection}>
                                                    <View style={styles.clauseHeader}>
                                                        <Shield size={16} color="#003049" />
                                                        <Text style={styles.clauseTitle}>INTERNATIONAL ORDER CLAUSES</Text>
                                                    </View>
                                                    <View style={styles.clauseCard}>
                                                        <Text style={styles.clauseLabel}>IGST PAYMENT STATUS</Text>
                                                        <View style={styles.radioRow}>
                                                            <TouchableOpacity
                                                                style={styles.radioItem}
                                                                onPress={() => setShipmentData(prev => ({ ...prev, igstStatus: 'LUT / Bond' }))}
                                                            >
                                                                <View style={[styles.radioDot, shipmentData.igstStatus === 'LUT / Bond' && styles.radioDotActive]}>
                                                                    {shipmentData.igstStatus === 'LUT / Bond' && <View style={styles.radioDotInner} />}
                                                                </View>
                                                                <Text style={[styles.radioLabel, shipmentData.igstStatus === 'LUT / Bond' && styles.radioLabelActive]}>LUT / Bond</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={styles.radioItem}
                                                                onPress={() => setShipmentData(prev => ({ ...prev, igstStatus: 'Payment of IGST' }))}
                                                            >
                                                                <View style={[styles.radioDot, shipmentData.igstStatus === 'Payment of IGST' && styles.radioDotActive]}>
                                                                    {shipmentData.igstStatus === 'Payment of IGST' && <View style={styles.radioDotInner} />}
                                                                </View>
                                                                <Text style={[styles.radioLabel, shipmentData.igstStatus === 'Payment of IGST' && styles.radioLabelActive]}>Payment of IGST</Text>
                                                            </TouchableOpacity>
                                                        </View>

                                                        <View style={[styles.checkboxRow, { marginTop: 20 }]}>
                                                            <TouchableOpacity
                                                                style={[styles.checkbox, shipmentData.fbaOption && styles.checkboxActive]}
                                                                onPress={() => setShipmentData(prev => ({ ...prev, fbaOption: !prev.fbaOption }))}
                                                            >
                                                                {shipmentData.fbaOption && <Check size={12} color={Colors.white} />}
                                                            </TouchableOpacity>
                                                            <View style={styles.checkboxTextContainer}>
                                                                <Text style={styles.checkboxTitle}>FBA Service Option</Text>
                                                                <Text style={styles.checkboxSub}>Select this for Amazon FBA shipments to see specific rates</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={styles.boxDetailsSection}>
                                                    {shipmentData.boxes.map((box, bIndex) => (
                                                        <View key={bIndex} style={styles.boxCard}>
                                                            <View style={styles.boxCardHeader}>
                                                                <Text style={styles.boxCardTitle}>BOX {bIndex + 1}</Text>
                                                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                                                    <TouchableOpacity onPress={addBox}><Copy size={16} color="#4A5568" /></TouchableOpacity>
                                                                    {shipmentData.boxes.length > 1 && (
                                                                        <TouchableOpacity onPress={() => removeBox(bIndex)}><Trash2 size={16} color="#E53E3E" /></TouchableOpacity>
                                                                    )}
                                                                </View>
                                                            </View>
                                                            <View style={styles.formGrid}>
                                                                <View style={styles.inputGroup}><Text style={styles.label}>LENGTH (CM)</Text><TextInput style={styles.boxInput} placeholder="0" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={box.length} onChangeText={(v) => updateBox(bIndex, 'length', v)} /></View>
                                                                <View style={styles.inputGroup}><Text style={styles.label}>WIDTH (CM)</Text><TextInput style={styles.boxInput} placeholder="0" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={box.width} onChangeText={(v) => updateBox(bIndex, 'width', v)} /></View>
                                                                <View style={styles.inputGroup}><Text style={styles.label}>HEIGHT (CM)</Text><TextInput style={styles.boxInput} placeholder="0" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={box.height} onChangeText={(v) => updateBox(bIndex, 'height', v)} /></View>
                                                                <View style={styles.inputGroup}><Text style={styles.label}>WEIGHT (KG) <Text style={styles.required}>*</Text></Text><TextInput style={[styles.boxInput, errors[`box_weight_${bIndex}`] && styles.inputError]} placeholder="0.00" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={box.weight} onChangeText={(v) => updateBox(bIndex, 'weight', v)} /></View>
                                                            </View>

                                                            <View style={styles.itemDetailsSection}>
                                                                <View style={styles.itemDetailsHeader}><Text style={styles.itemDetailsTitle}>ITEM DETAILS</Text><View style={styles.badge}><Text style={styles.badgeText}>{box.items.length} items</Text></View></View>
                                                                {box.items.map((item, pIndex) => (
                                                                    <View key={pIndex} style={styles.itemCard}>
                                                                        <TouchableOpacity style={styles.removeItemBtn} onPress={() => removeProduct(bIndex, pIndex)}><Trash2 size={14} color="#E53E3E" /></TouchableOpacity>
                                                                        <View style={styles.formGrid}>
                                                                            <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>PRODUCT NAME</Text><TextInput style={styles.itemInput} placeholder="Enter name" placeholderTextColor="#A0AEC0" value={item.productName} onChangeText={(v) => updateProduct(bIndex, pIndex, 'productName', v)} /></View>
                                                                            <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>HSN CODE</Text><TextInput style={[styles.itemInput, item.hsnCode && !/^\d{8}$/.test(item.hsnCode) && styles.inputError]} placeholder="8 digits" placeholderTextColor="#A0AEC0" keyboardType="numeric" maxLength={8} value={item.hsnCode} onChangeText={(v) => updateProduct(bIndex, pIndex, 'hsnCode', v)} />{item.hsnCode && !/^\d{8}$/.test(item.hsnCode) && <Text style={styles.hsnError}>Must be 8 digits</Text>}</View>
                                                                            <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>QTY</Text><TextInput style={styles.itemInput} placeholder="0" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={item.qty} onChangeText={(v) => updateProduct(bIndex, pIndex, 'qty', v)} /></View>
                                                                            <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>UNIT PRICE</Text><TextInput style={styles.itemInput} placeholder="0" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={item.unitPrice} onChangeText={(v) => updateProduct(bIndex, pIndex, 'unitPrice', v)} /></View>
                                                                            <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>IGST</Text>
                                                                                <TouchableOpacity
                                                                                    style={[
                                                                                        styles.dropdownTrigger,
                                                                                        shipmentData.igstStatus !== 'Payment of IGST' && styles.disabledDropdown
                                                                                    ]}
                                                                                    onPress={() => {
                                                                                        if (shipmentData.igstStatus === 'Payment of IGST') {
                                                                                            setActiveDropdown(activeDropdown === `igst_${bIndex}_${pIndex}` ? null : `igst_${bIndex}_${pIndex}`)
                                                                                        }
                                                                                    }}
                                                                                    disabled={shipmentData.igstStatus !== 'Payment of IGST'}
                                                                                >
                                                                                    <Text style={[
                                                                                        styles.dropdownValue,
                                                                                        shipmentData.igstStatus !== 'Payment of IGST' && { color: '#A0AEC0' }
                                                                                    ]}>
                                                                                        {shipmentData.igstStatus !== 'Payment of IGST' ? 'N/A' : (item.igst || 'Select')}
                                                                                    </Text>
                                                                                    <ChevronRight size={14} color={shipmentData.igstStatus !== 'Payment of IGST' ? "#CBD5E0" : "#718096"} style={{ transform: [{ rotate: '90deg' }] }} />
                                                                                </TouchableOpacity>
                                                                                {activeDropdown === `igst_${bIndex}_${pIndex}` && (
                                                                                    <View style={styles.dropdownMenu}>
                                                                                        {['0%', '5%', '12%', '18%', '28%'].map(rate => (
                                                                                            <TouchableOpacity key={rate} style={styles.dropdownMenuItem} onPress={() => { updateProduct(bIndex, pIndex, 'igst', rate); setActiveDropdown(null); }}>
                                                                                                <Text style={styles.dropdownMenuItemText}>{rate}</Text>
                                                                                            </TouchableOpacity>
                                                                                        ))}
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                ))}
                                                                <TouchableOpacity style={styles.addProductBtn} onPress={() => addProduct(bIndex)}><Plus size={14} color="#003049" /><Text style={styles.addProductText}>Add Another Product</Text></TouchableOpacity>
                                                            </View>
                                                            <View style={styles.boxFooter}><Text style={styles.totalPriceLabel}>TOTAL PRICE</Text><Text style={styles.totalPriceValue}>INR {calculateBoxTotal(bIndex)}</Text></View>
                                                        </View>
                                                    ))}
                                                </View>

                                                {/* CSB-V COMMERCIAL DETAILS SECTION */}
                                                {shipmentData.category === 'CSB-V (High Value Commercial)' && (
                                                    <View style={[styles.nestedSection, { borderWidth: 1.5, borderColor: '#003049', marginTop: 15, marginBottom: 15 }]}>
                                                        <View style={styles.nestedHeader}><Shield size={16} color="#003049" /><Text style={[styles.nestedTitle, { fontWeight: '900' }]}>CSB-V Commercial Details</Text></View>
                                                        <View style={styles.formGrid}>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>CONSIGNEE COUNTRY <Text style={styles.required}>*</Text></Text><TextInput style={styles.input} placeholder="Country" placeholderTextColor="#A0AEC0" value={csbVDetails.consigneeCountry} onChangeText={(v) => setCsbVDetails(p => ({ ...p, consigneeCountry: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>INVOICE DATE <Text style={styles.required}>*</Text></Text><TextInput style={styles.input} placeholder="mm/dd/yyyy" placeholderTextColor="#A0AEC0" value={csbVDetails.invoiceDate} onChangeText={(v) => setCsbVDetails(p => ({ ...p, invoiceDate: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>CTSH <Text style={styles.required}>*</Text></Text><TextInput style={styles.input} placeholder="CTSH Code" placeholderTextColor="#A0AEC0" value={csbVDetails.ctsh} onChangeText={(v) => setCsbVDetails(p => ({ ...p, ctsh: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>UOM [UNIT OF MEASURE] <Text style={styles.required}>*</Text></Text><TextInput style={styles.input} placeholder="e.g. PCS, KGS" placeholderTextColor="#A0AEC0" value={csbVDetails.uom} onChangeText={(v) => setCsbVDetails(p => ({ ...p, uom: v }))} /></View>

                                                            <View style={styles.inputGroup}><Text style={styles.label}>TOTAL ITEM VALUE <Text style={styles.required}>*</Text></Text><TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#A0AEC0" value={csbVDetails.totalItemValue} onChangeText={(v) => setCsbVDetails(p => ({ ...p, totalItemValue: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>TOTAL TAXABLE VALUE <Text style={styles.required}>*</Text></Text><TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#A0AEC0" value={csbVDetails.totalTaxableValue} onChangeText={(v) => setCsbVDetails(p => ({ ...p, totalTaxableValue: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>TOTAL IGST PAID <Text style={styles.required}>*</Text></Text><TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#A0AEC0" value={csbVDetails.totalIgstPaid} onChangeText={(v) => setCsbVDetails(p => ({ ...p, totalIgstPaid: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>TOTAL CESS PAID</Text><TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#A0AEC0" value={csbVDetails.totalCessPaid} onChangeText={(v) => setCsbVDetails(p => ({ ...p, totalCessPaid: v }))} /></View>

                                                            <View style={styles.inputGroup}><Text style={styles.label}>BOND OR UT</Text><TextInput style={styles.input} placeholder="Bond/UT Number" placeholderTextColor="#A0AEC0" value={csbVDetails.bondOrUt} onChangeText={(v) => setCsbVDetails(p => ({ ...p, bondOrUt: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>GSTIN TYPE</Text>
                                                                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setActiveDropdown(activeDropdown === 'gstinType' ? null : 'gstinType')}>
                                                                    <Text style={styles.dropdownValue}>{csbVDetails.gstinType}</Text>
                                                                    <ChevronRight size={14} color="#718096" style={{ transform: [{ rotate: '90deg' }] }} />
                                                                </TouchableOpacity>
                                                                {activeDropdown === 'gstinType' && (
                                                                    <View style={styles.dropdownMenu}>
                                                                        {['GSTIN (Normal)', 'GSTIN (Special)', 'Non-GST'].map(item => (
                                                                            <TouchableOpacity key={item} style={styles.dropdownMenuItem} onPress={() => { setCsbVDetails(prev => ({ ...prev, gstinType: item })); setActiveDropdown(null); }}>
                                                                                <Text style={styles.dropdownMenuItemText}>{item}</Text>
                                                                            </TouchableOpacity>
                                                                        ))}
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>GSTIN ID</Text><TextInput style={styles.input} placeholder="Enter GSTIN" placeholderTextColor="#A0AEC0" value={csbVDetails.gstinId} onChangeText={(v) => setCsbVDetails(p => ({ ...p, gstinId: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>GOV/NON-GOV TYPE</Text>
                                                                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setActiveDropdown(activeDropdown === 'govType' ? null : 'govType')}>
                                                                    <Text style={styles.dropdownValue}>{csbVDetails.govType}</Text>
                                                                    <ChevronRight size={14} color="#718096" style={{ transform: [{ rotate: '90deg' }] }} />
                                                                </TouchableOpacity>
                                                                {activeDropdown === 'govType' && (
                                                                    <View style={styles.dropdownMenu}>
                                                                        {['NON_GOV', 'GOV'].map(item => (
                                                                            <TouchableOpacity key={item} style={styles.dropdownMenuItem} onPress={() => { setCsbVDetails(prev => ({ ...prev, govType: item })); setActiveDropdown(null); }}>
                                                                                <Text style={styles.dropdownMenuItemText}>{item}</Text>
                                                                            </TouchableOpacity>
                                                                        ))}
                                                                    </View>
                                                                )}
                                                            </View>

                                                            <View style={styles.inputGroup}><Text style={styles.label}>IEC NUMBER</Text><TextInput style={styles.input} placeholder="Enter IEC" placeholderTextColor="#A0AEC0" value={csbVDetails.iecNumber} onChangeText={(v) => setCsbVDetails(p => ({ ...p, gstinId: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>AD CODE</Text><TextInput style={styles.input} placeholder="Enter AD Code" placeholderTextColor="#A0AEC0" value={csbVDetails.adCode} onChangeText={(v) => setCsbVDetails(p => ({ ...p, adCode: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>BANK NAME</Text><TextInput style={styles.input} placeholder="Enter Bank Name" placeholderTextColor="#A0AEC0" value={csbVDetails.bankName} onChangeText={(v) => setCsbVDetails(p => ({ ...p, bankName: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>ACCOUNT NO</Text><TextInput style={styles.input} placeholder="Enter Account No" placeholderTextColor="#A0AEC0" value={csbVDetails.accountNo} onChangeText={(v) => setCsbVDetails(p => ({ ...p, accountNo: v }))} /></View>

                                                            <View style={styles.inputGroup}><Text style={styles.label}>NFET FLAG</Text><TextInput style={styles.input} placeholder="Optional" placeholderTextColor="#A0AEC0" value={csbVDetails.nfetFlag} onChangeText={(v) => setCsbVDetails(p => ({ ...p, nfetFlag: v }))} /></View>
                                                            <View style={styles.inputGroup}><Text style={styles.label}>STATE CODE</Text><TextInput style={styles.input} placeholder="Enter State Code" placeholderTextColor="#A0AEC0" value={csbVDetails.stateCode} onChangeText={(v) => setCsbVDetails(p => ({ ...p, stateCode: v }))} /></View>
                                                        </View>
                                                    </View>
                                                )}
                                        )}
                                            </View>
                                        ) : (
                                            <View style={styles.formGrid}>
                                                <Text style={styles.selectServiceTitle}>Select Service</Text>
                                                <Text style={styles.selectServiceSubtitle}>Choose the best shipping option for your needs.</Text>
                                                <ScrollView
                                                    horizontal={false}
                                                    showsVerticalScrollIndicator={true}
                                                    persistentScrollbar={true}
                                                    style={styles.carrierListScroll}
                                                    nestedScrollEnabled={true}
                                                >
                                                    <View style={styles.carrierList}>
                                                        {CARRIERS.map((carrier) => (
                                                            <TouchableOpacity
                                                                key={carrier.id}
                                                                style={[styles.carrierCard, selectedCarrier === carrier.name && styles.carrierCardActive]}
                                                                onPress={() => setSelectedCarrier(carrier.name)}
                                                            >
                                                                {/* TOP ROW: LOGO & NAME */}
                                                                <View style={styles.carrierHeaderRow}>
                                                                    <View style={styles.carrierLogoContainer}>
                                                                        <Image
                                                                            source={{ uri: carrier.logo === 'DHL' ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/DHL_Logo.svg/1200px-DHL_Logo.svg.png' : carrier.logo === 'FedEx' ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/FedEx_Corporation_-_Logo.svg/1280px-FedEx_Corporation_-_Logo.svg.png' : 'https://www.dflworld.com/assets/img/logo.png' }}
                                                                            style={styles.carrierLogo}
                                                                            resizeMode="contain"
                                                                        />
                                                                    </View>
                                                                    <View style={styles.carrierNameInfo}>
                                                                        <Text style={styles.carrierNameText}>{carrier.name}</Text>
                                                                        {selectedCarrier === carrier.name && <CheckCircle2 size={16} color="#003049" />}
                                                                    </View>
                                                                </View>

                                                                {/* HORIZONTAL DIVIDER */}
                                                                <View style={styles.carrierSeparator} />

                                                                {/* BOTTOM ROW: STATS & PRICING */}
                                                                <View style={styles.carrierDetailsRow}>
                                                                    <View style={styles.carrierStatsContainer}>
                                                                        <View style={styles.statTag}><Package size={12} color="#718096" /><Text style={styles.statTagText}>{calculateTotalWeight()} KG</Text></View>
                                                                        <View style={styles.statTag}><Clock size={12} color="#2F855A" /><Text style={[styles.statTagText, { color: '#2F855A' }]}>{carrier.time}</Text></View>
                                                                        <View style={styles.statTag}><Shield size={12} color="#7B61FF" /><Text style={[styles.statTagText, { color: '#7B61FF' }]}>{carrier.type}</Text></View>
                                                                    </View>

                                                                    <View style={styles.carrierPricingContainer}>
                                                                        <Text style={styles.carrierPriceLabel}>₹ {carrier.price.toLocaleString()}</Text>
                                                                        <Text style={styles.carrierGstLabel}>INCL. GST (18%): ₹{carrier.gst}</Text>
                                                                        <View style={styles.finalPriceBadge}>
                                                                            <Text style={styles.finalPriceLabel}>TOTAL</Text>
                                                                            <Text style={styles.finalPriceValue}>₹{carrier.total.toLocaleString()}</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>

                                                                {carrier.info && (
                                                                    <View style={styles.carrierNote}><AlertCircle size={12} color="#E67E22" /><Text style={styles.carrierNoteText}>{carrier.info}</Text></View>
                                                                )}
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        )}

                                        {activeStep <= 2 && (
                                            <>
                                                <View style={[styles.nestedSection, { marginTop: 25 }]}>
                                                    <View style={styles.nestedHeader}><User size={14} color="#4A5568" /><Text style={styles.nestedTitle}>Alternate Contact (Optional)</Text></View>
                                                    <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>NAME</Text><TextInput style={styles.input} placeholder="Alternate Name" placeholderTextColor="#A0AEC0" value={alternateContact.name} onChangeText={(v) => setAlternateContact(p => ({ ...p, name: v }))} /></View>
                                                    <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>MOBILE</Text><TextInput style={styles.input} placeholder="Alternate Mobile" placeholderTextColor="#A0AEC0" keyboardType="phone-pad" value={alternateContact.mobile} onChangeText={(v) => setAlternateContact(p => ({ ...p, mobile: v }))} /></View>
                                                </View>
                                                {activeStep === 1 && (
                                                    <View style={styles.nestedSection}>
                                                        <View style={styles.nestedHeader}><Calendar size={14} color="#4A5568" /><Text style={styles.nestedTitle}>Pickup Details</Text></View>
                                                        <View style={[styles.inputGroup, { width: '100%' }]}>
                                                            <Text style={styles.label}>DATE <Text style={styles.required}>*</Text></Text>
                                                            <TouchableOpacity style={[getInputStyle('pickupDate'), styles.datePickerBtn]} onPress={() => setShowDatePicker(true)}><Text style={shipperData.pickupDate ? styles.inputText : styles.placeholderText}>{shipperData.pickupDate || 'Select Date'}</Text><Calendar size={16} color="#718096" /></TouchableOpacity>
                                                            <CustomCalendar visible={showDatePicker} onClose={() => setShowDatePicker(false)} onSelect={(date: Date) => { const day = date.getDate().toString().padStart(2, '0'); const month = (date.getMonth() + 1).toString().padStart(2, '0'); const year = date.getFullYear(); setShipperData(p => ({ ...p, pickupDate: `${day}/${month}/${year}` })); setShowDatePicker(false); }} />
                                                        </View>
                                                        <View style={[styles.inputGroup, { width: '100%' }]}><Text style={styles.label}>TYPE</Text><View style={styles.toggleContainer}><TouchableOpacity style={[styles.toggleBtn, shipperData.pickupType === 'Pickup' && styles.toggleBtnActive]} onPress={() => setShipperData(p => ({ ...p, pickupType: 'Pickup' }))}><Text style={[styles.toggleText, shipperData.pickupType === 'Pickup' && styles.toggleTextActive]}>Pickup</Text></TouchableOpacity><TouchableOpacity style={[styles.toggleBtn, shipperData.pickupType === 'Drop-off' && styles.toggleBtnActive]} onPress={() => setShipperData(p => ({ ...p, pickupType: 'Drop-off' }))}><Text style={[styles.toggleText, shipperData.pickupType === 'Drop-off' && styles.toggleTextActive]}>Drop-off</Text></TouchableOpacity></View></View>
                                                    </View>
                                                )}
                                            </>
                                        )}

                                        <View style={styles.cardFooter}>
                                            <View style={styles.footerRow}>
                                                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                                                    <ChevronRight size={18} color="#718096" style={{ transform: [{ rotate: '180deg' }] }} />
                                                    <Text style={styles.backBtnText}>Back</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.saveDraftBtn} onPress={handleSaveAsDraft}>
                                                    <Text style={styles.saveDraftText}>Save as Draft</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                                                <Text style={styles.continueText}>{activeStep === 4 ? 'Pay & Book' : 'Continue'}</Text>
                                                {activeStep === 4 ? <Layers size={18} color={Colors.white} /> : <ChevronRight size={18} color={Colors.white} />}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <MissingDetailsModal visible={showValidationModal} onClose={() => setShowValidationModal(false)} />
                    {isBooking && renderLoadingScreen()}
                </View>
            </View >
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAE3D2',
    },
    mainWrapper: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        flexDirection: 'row',
    },
    contentArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    headerTitleRow: {
        marginBottom: 20,
    },
    titleCol: {
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A202C',
    },
    pageSubtitle: {
        fontSize: 13,
        color: '#718096',
        marginTop: 4,
    },
    stepperScroll: {
        flexGrow: 0,
        marginBottom: 10,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 20,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    stepIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeStepIcon: {
        backgroundColor: '#003049',
    },
    stepTextContainer: {
        marginLeft: 10,
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#A0AEC0',
    },
    activeStepLabel: {
        color: '#003049',
    },
    stepSubLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4A5568',
    },
    activeStepSubLabel: {
        color: '#1A202C',
    },
    stepLink: {
        width: 30,
        height: 1,
        backgroundColor: '#CBD5E0',
        marginHorizontal: 5,
    },
    columnsContainer: {
        flexDirection: 'column',
    },
    formSection: {
        width: '100%',
    },
    summarySection: {
        width: '100%',
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        width: '100%',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 10,
    },
    cardHeaderTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#2D3748',
    },
    cardHeaderActions: {
        flexDirection: 'row',
        backgroundColor: '#EDF2F7',
        borderRadius: 8,
        padding: 4,
    },
    headerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    headerBtnActive: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    headerBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#718096',
    },
    headerBtnTextActive: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2D3748',
    },
    formGrid: {
        gap: 15,
    },
    inputRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 5,
    },
    fullWidthInputGroup: {
        width: '100%',
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#4A5568',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    required: {
        color: '#E53E3E',
    },
    input: {
        borderRadius: 10,
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1A202C',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputText: {
        fontSize: 14,
        color: '#1A202C',
    },
    placeholderText: {
        fontSize: 14,
        color: '#A0AEC0',
    },
    datePickerBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
    },
    inputError: {
        borderColor: '#E53E3E',
        borderWidth: 1.5,
    },
    mobileInputContainer: {
        flexDirection: 'row',
    },
    countryCode: {
        backgroundColor: '#EDF2F7',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRightWidth: 0,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    countryCodeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A5568',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 13,
        color: '#2D3748',
    },
    nestedSections: {
        flexDirection: 'column',
        gap: 15,
        marginTop: 50,
    },
    nestedSection: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    nestedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 15,
    },
    suggestionBox: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
        gap: 10,
    },
    suggestionText: {
        fontSize: 13,
        color: '#2D3748',
        fontWeight: '500',
    },
    nestedTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#2D3748',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        padding: 5,
        marginTop: 5,
    },
    toggleBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: Colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    toggleTextActive: {
        color: '#003049',
        fontWeight: '900',
    },
    cardFooter: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        gap: 12,
    },
    footerRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    footerLeft: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 15,
    },
    backBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        gap: 5,
    },
    backBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#718096',
    },
    footerActions: {
        flexDirection: 'row',
        gap: 15,
    },
    saveDraftBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveDraftText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#718096',
    },
    continueBtn: {
        width: '100%',
        backgroundColor: '#003049',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    continueText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '800',
    },
    summaryCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        width: '94%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#EDF2F7',
        marginTop: 5,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 30,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#48BB78',
    },
    summaryTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#718096',
        letterSpacing: 1,
    },
    summaryContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    summaryColLeft: {
        flex: 1.5,
        alignItems: 'flex-start',
    },
    summaryColRight: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    summaryConnectorCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        position: 'relative',
        height: 40,
    },
    connectorLine: {
        width: '100%',
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        position: 'absolute',
        top: '50%',
        marginRight: 60,
    },
    connectorIcon: {
        backgroundColor: Colors.white,
        padding: 4,
        borderRadius: 10,
        zIndex: 1,
    },
    summaryActionLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#A0AEC0',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    summaryLocationText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#1A202C',
        marginBottom: 2,
    },
    summarySubText: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 6,
    },
    summaryDateText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#E67E22',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    awaitingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        gap: 8,
        marginTop: 35,
    },
    orangeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ED8936',
    },
    awaitingText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#ED8936',
    },
    addressBookDropdown: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        position: 'absolute',
        top: 70,
        right: 20,
        width: 250,
        zIndex: 100,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    addressBookItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    addressBookItemText: {
        fontSize: 13,
        color: '#2D3748',
        fontWeight: '600',
    },

    // Calendar Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarCard: {
        width: 320,
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    calHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    calHeaderText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3748',
    },
    calWeekRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    calWeekText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#A0AEC0',
    },
    calGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    calDayText: {
        fontSize: 14,
        color: '#4A5568',
    },
    calDayPast: {
        color: '#E2E8F0',
    },
    calToday: {
        backgroundColor: '#E67E22',
    },
    calTodayText: {
        color: Colors.white,
        fontWeight: '700',
    },
    calCloseBtn: {
        marginTop: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        alignItems: 'center',
    },
    calCloseBtnText: {
        color: '#E67E22',
        fontWeight: '700',
        fontSize: 15,
    },
    missingDetailsCard: {
        width: 320,
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    errorIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    missingDetailsTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#2D3748',
        marginBottom: 12,
        textAlign: 'center',
    },
    missingDetailsText: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    modalActionBtn: {
        backgroundColor: '#003049',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    modalActionBtnText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
    },
    // New Styles
    summaryShipmentDetail: {
        marginTop: 20,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#EDF2F7',
        width: '100%',
        marginBottom: 20,
    },
    summaryItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryItemCol: {
        flex: 1,
    },
    summaryItemTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    summaryItemTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#718096',
    },
    summaryItemValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A202C',
    },
    summaryItemLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#A0AEC0',
        marginBottom: 4,
    },
    summaryItemMain: {
        fontSize: 14,
        fontWeight: '900',
        color: '#2D3748',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4A5568',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 48,
    },
    dropdownValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2D3748',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 75,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    dropdownMenuItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F7FAFC',
    },
    dropdownMenuItemText: {
        fontSize: 13,
        color: '#4A5568',
        fontWeight: '600',
    },
    disabledDropdown: {
        backgroundColor: '#EDF2F7',
        borderColor: '#E2E8F0',
        opacity: 0.7,
    },
    clauseSection: {
        marginTop: 20,
        gap: 15,
    },
    clauseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    clauseTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#003049',
        letterSpacing: 0.5,
    },
    clauseCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    clauseLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#718096',
        marginBottom: 12,
    },
    radioRow: {
        flexDirection: 'row',
        gap: 20,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioDotActive: {
        borderColor: '#003049',
    },
    radioDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#003049',
    },
    radioLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#718096',
    },
    radioLabelActive: {
        color: '#003049',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 5,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#003049',
        borderColor: '#003049',
    },
    checkboxTextContainer: {
        flex: 1,
    },
    checkboxTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
    },
    checkboxSub: {
        fontSize: 11,
        color: '#718096',
    },
    boxDetailsSection: {
        marginTop: 25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#003049',
        letterSpacing: 0.5,
        marginLeft: 8,
    },
    badge: {
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#4A5568',
    },
    addBoxBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addBoxText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#003049',
    },
    boxCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        marginBottom: 15,
        width: '100%',
    },
    boxCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    boxNumberBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#003049',
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxNumberText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '800',
    },
    boxTitle: {
        flex: 1,
        fontSize: 11,
        fontWeight: '900',
        color: '#4A5568',
        letterSpacing: 0.5,
    },
    boxStats: {
        flexDirection: 'row',
        gap: 8,
        marginRight: 10,
    },
    boxStatText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#718096',
    },
    boxInputsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    boxInputGroup: {
        flexGrow: 1,
        paddingHorizontal: 5,
        marginBottom: 12,
        minWidth: 140, // Enough for labels like "LENGTH (CM)"
        flexBasis: '45%', // Allow 2 per row if space permits, else stack
    },
    boxInputLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#A0AEC0',
        marginBottom: 6,
    },
    boxInput: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        height: 40,
        paddingHorizontal: 10,
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
    },
    itemDetailsSection: {
        marginTop: 20,
    },
    itemDetailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    itemDetailsTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#4A5568',
        letterSpacing: 0.5,
    },
    itemCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        borderStyle: 'dashed',
        marginBottom: 10,
        position: 'relative',
    },
    removeItemBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
        zIndex: 10,
    },
    itemInputsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'flex-start',
    },
    itemInputGroup: {
        paddingHorizontal: 5,
        marginBottom: 12,
        minWidth: 160,
        flexGrow: 1,
        flexBasis: '48%',
    },
    itemLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#A0AEC0',
        marginBottom: 4,
    },
    itemInput: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        height: 36,
        paddingHorizontal: 8,
        fontSize: 12,
        fontWeight: '700',
        color: '#2D3748',
    },
    hsnError: {
        fontSize: 8,
        color: '#E53E3E',
        marginTop: 2,
        fontWeight: '700',
    },
    addProductBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    addProductText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#003049',
    },
    boxFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        gap: 10,
    },
    totalPriceLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#718096',
    },
    totalPriceValue: {
        fontSize: 15,
        fontWeight: '900',
        color: '#1A202C',
    },
    // Services Styles
    servicesGrid: {
        paddingTop: 10,
    },
    serviceSectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#003049',
        letterSpacing: 1,
        marginBottom: 20,
    },
    serviceRow: {
        gap: 15,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        gap: 15,
    },
    serviceCardActive: {
        borderColor: '#003049',
        borderWidth: 2,
        backgroundColor: '#F0F9FF',
    },
    serviceIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceContent: {
        flex: 1,
    },
    serviceName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 4,
    },
    serviceNameActive: {
        color: '#003049',
    },
    serviceDesc: {
        fontSize: 12,
        color: '#718096',
        lineHeight: 18,
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2D3748',
    },
    serviceCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#48BB78',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#48BB78',
    },
    priceAdd: {
        fontSize: 14,
        fontWeight: '900',
        color: '#003049',
    },
    formContentWrapper: {
        flex: 1,
        gap: 20,
    },
    fullWidth: {
        width: '100%',
    },
    shipmentTypeTabs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 10,
    },
    tabsLeft: {
        flexDirection: 'row',
        gap: 4,
    },
    typeTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    typeTabActive: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    typeTabText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#718096',
    },
    typeTabTextActive: {
        color: '#003049',
    },
    weightStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: Colors.white,
    },
    statBox: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#EDF2F7',
        borderRightWidth: 1,
        borderRightColor: '#E2E8F0',
        minWidth: 80,
        justifyContent: 'center',
    },
    // Carrier Selection Styles
    selectServiceTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1A202C',
        marginBottom: 8,
    },
    selectServiceSubtitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 20,
    },
    carrierListScroll: {
        maxHeight: 500,
        marginTop: 10,
    },
    carrierList: {
        gap: 15,
        paddingBottom: 20,
    },
    carrierCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    carrierCardActive: {
        borderColor: '#003049',
        borderWidth: 2,
        backgroundColor: '#F0F9FF',
    },
    carrierHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 15,
    },
    carrierLogoContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    carrierLogo: {
        width: '100%',
        height: '100%',
    },
    carrierNameInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        gap: 8,
    },
    carrierNameText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1A202C',
        flex: 1,
    },
    carrierSeparator: {
        height: 1,
        backgroundColor: '#EDF2F7',
        width: '100%',
        marginBottom: 15,
    },
    carrierDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    carrierStatsContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    statTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statTagText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#4A5568',
    },
    carrierPricingContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 100,
    },
    carrierPriceLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1A202C',
    },
    carrierGstLabel: {
        fontSize: 9,
        color: '#718096',
        marginTop: 4,
        fontWeight: '700',
    },
    finalPriceBadge: {
        backgroundColor: '#003049',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    finalPriceLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.5,
    },
    finalPriceValue: {
        fontSize: 13,
        fontWeight: '900',
        color: Colors.white,
    },
    carrierNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F7FAFC',
    },
    carrierNoteText: {
        fontSize: 12,
        color: '#E67E22',
        fontWeight: '700',
        flex: 1,
    },
    // Loading & Confirmation Styles
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 2000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        gap: 15,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#003049',
    },
    loadingSub: {
        fontSize: 14,
        color: '#718096',
    },
    confirmationScroll: {
        padding: 20,
        backgroundColor: '#F0F2F5',
        flexGrow: 1,
    },
    confCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        width: '100%',
        maxWidth: 700,
        alignSelf: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        overflow: 'hidden',
        marginBottom: 30,
    },
    confHeader: {
        backgroundColor: '#003049',
        padding: 40,
        alignItems: 'center',
    },
    confCheckCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    confTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.white,
        marginBottom: 10,
    },
    confSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    shipmentIdCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 16,
        paddingVertical: 15,
        paddingHorizontal: 30,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 20,
    },
    shipIdBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    shipIdLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#718096',
        letterSpacing: 0.5,
    },
    shipIdValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1A202C',
    },
    copyBtn: {
        padding: 8,
        backgroundColor: '#EDF2F7',
        borderRadius: 8,
    },
    confDetailsGrid: {
        gap: 30,
        marginBottom: 35,
    },
    confRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    confSection: {
        flex: 1,
        minWidth: 280,
        gap: 12,
    },
    confSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    confSectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#718096',
        letterSpacing: 1,
    },
    routeBox: {
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    routePoint: {
        flex: 1,
    },
    routeLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#A0AEC0',
        marginBottom: 4,
    },
    routeMain: {
        fontSize: 15,
        fontWeight: '900',
        color: '#2D3748',
        flexWrap: 'nowrap',
    },
    routeSub: {
        fontSize: 11,
        color: '#718096',
    },
    serviceInfoBox: {
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
    },
    infoLabel: {
        fontSize: 12,
        color: '#718096',
        fontWeight: '600',
        minWidth: 70,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '800',
        color: '#2D3748',
        flex: 1,
        textAlign: 'right',
    },
    contactInfoBox: {
        backgroundColor: 'transparent',
        padding: 5,
    },
    contactName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 2,
    },
    contactSub: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 2,
    },
    confActions: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
    },
    receiptBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EDF2F7',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
    },
    receiptBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2D3748',
    },
    doneBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#003049',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
    },
    doneBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.white,
    },
    contactSub: {
        fontSize: 12,
        color: '#718096',
    },
    summaryCarrierDetail: {
        marginTop: 15,
    },
    summaryCarrierRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 20,
    },
    summaryCarrierLogo: {
        width: 50,
        height: 30,
    },
    summaryCarrierName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A202C',
    },
    summaryCarrierTime: {
        fontSize: 11,
        color: '#718096',
        fontWeight: '600',
    },
    totalPayCard: {
        backgroundColor: '#1A202C',
        borderRadius: 12,
        padding: 16,
        marginTop: 15,
    },
    totalPayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalPayLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#A0AEC0',
        letterSpacing: 0.5,
    },
    taxBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    taxBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#CBD5E0',
    },
    totalPayValue: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.white,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    headerBtnGroup: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 4,
        gap: 6,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    manualEntryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BEE3F8',
    },
    addressBookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addressBookBtnText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#003049',
    },
    boxCardTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#1A202C',
        letterSpacing: 1,
        flex: 1,
    },
});
