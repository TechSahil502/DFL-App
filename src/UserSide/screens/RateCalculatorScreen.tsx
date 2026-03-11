import React, { useState, useRef, useEffect } from 'react';
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
    Easing,
    useWindowDimensions,
    Image,
    Modal,
    Pressable,
} from 'react-native';
import {
    MapPin,
    Package,
    ChevronRight,
    Search,
    Plus,
    Copy,
    Trash2,
    Truck,
    CheckCircle2,
    Info,
    Phone,
    Mail,
    MessageCircle,
    ArrowRight,
    LayoutDashboard,
    Clock,
    Layers,
    X,
    Weight,
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const pincodeData: { [key: string]: { city: string, state: string, country: string, locations: string[] } } = {};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

interface BoxData {
    id: string;
    wt: string;
    l: string;
    w: string;
    h: string;
}

export const RateCalculatorScreen = ({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 992;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [shipmentType, setShipmentType] = useState('Parcel');
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Form States
    const [origin, setOrigin] = useState({
        location: '',
        pincode: '',
        city: '',
        state: '',
        country: ''
    });

    const [destination, setDestination] = useState({
        location: '',
        pincode: '',
        city: '',
        state: '',
        country: ''
    });

    const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
    const [showOriginSug, setShowOriginSug] = useState(false);
    const [showDestSug, setShowDestSug] = useState(false);

    const [loadingPincode, setLoadingPincode] = useState({ origin: false, destination: false });
    const [globalSuggestions, setGlobalSuggestions] = useState<{ origin: any[], destination: any[] }>({ origin: [], destination: [] });

    const handlePincodeChange = async (type: 'origin' | 'destination', value: string) => {
        const isOrigin = type === 'origin';
        const currentData = isOrigin ? origin : destination;
        const setData = isOrigin ? setOrigin : setDestination;
        const setShowSug = isOrigin ? setShowOriginSug : setShowDestSug;

        setData({ ...currentData, pincode: value });

        // Trigger search for 3+ characters (Global support)
        if (value.length >= 3) {
            setLoadingPincode(prev => ({ ...prev, [type]: true }));
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?postalcode=${value}&format=json&addressdetails=1&limit=5`,
                    {
                        headers: {
                            'Accept-Language': 'en',
                            'User-Agent': 'DFL-App-Rate-Calculator'
                        }
                    }
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    const suggestions = data.map((item: any) => {
                        const addr = item.address;
                        const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.city_district || addr.hamlet || addr.suburb || '';
                        return {
                            display: `${cityName ? cityName + ', ' : ''}${addr.state || ''}, ${addr.country || ''}`.replace(/^, |, $/, '').replace(/, ,/g, ','),
                            city: cityName,
                            state: addr.state || '',
                            country: addr.country || '',
                            full: item
                        };
                    });

                    if (isOrigin) {
                        setOriginSuggestions(suggestions.map(s => s.display));
                        setGlobalSuggestions(prev => ({ ...prev, origin: suggestions }));
                    } else {
                        setDestSuggestions(suggestions.map(s => s.display));
                        setGlobalSuggestions(prev => ({ ...prev, destination: suggestions }));
                    }
                    setShowSug(true);
                } else {
                    isOrigin ? setOriginSuggestions([]) : setDestSuggestions([]);
                    setShowSug(false);
                }
            } catch (error) {
                console.error('Pincode fetch error:', error);
                setShowSug(false);
            } finally {
                setLoadingPincode(prev => ({ ...prev, [type]: false }));
            }
        } else {
            setShowSug(false);
        }
    };

    const handleSelectSuggestion = (type: 'origin' | 'destination', index: number) => {
        const isOrigin = type === 'origin';
        const suggestions = isOrigin ? globalSuggestions.origin : globalSuggestions.destination;
        const selected = suggestions[index];
        const setData = isOrigin ? setOrigin : setDestination;
        const currentData = isOrigin ? origin : destination;

        // Extract a better location name from display if city is empty
        const locationName = selected.city || (selected.display.split(',')[0]);

        setData({
            ...currentData,
            location: locationName,
            city: selected.city,
            state: selected.state,
            country: selected.country
        });
        isOrigin ? setShowOriginSug(false) : setShowDestSug(false);
    };

    const [boxes, setBoxes] = useState<BoxData[]>([
        { id: Math.random().toString(36).substr(2, 9), wt: '0', l: '0', w: '0', h: '0' }
    ]);

    const addBox = () => {
        const newBox = { id: Math.random().toString(36).substr(2, 9), wt: '0', l: '0', w: '0', h: '0' };
        setBoxes([...boxes, newBox]);
    };

    const copyBox = (box: BoxData) => {
        const newBox = { ...box, id: Math.random().toString(36).substr(2, 9) };
        setBoxes([...boxes, newBox]);
    };

    const removeBox = (id: string) => {
        if (boxes.length > 1) {
            setBoxes(boxes.filter(b => b.id !== id));
        }
    };

    const updateBox = (id: string, field: keyof BoxData, value: string) => {
        setBoxes(boxes.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const isDomestic = origin.country === destination.country;

    const handleContinueStep1 = () => {
        if (!origin.pincode || !origin.country) {
            setFormError('Please fill in Origin Pincode and Country.');
            return;
        }

        if (shipmentType === 'Parcel') {
            for (const box of boxes) {
                if (!box.wt || box.wt === '0' || !box.l || box.l === '0' || !box.w || box.w === '0' || !box.h || box.h === '0') {
                    setFormError('Please fill in all Package Details (Weight, L, W, H).');
                    return;
                }
            }
        } else {
            // For Document, only weight is required
            if (!boxes[0].wt || boxes[0].wt === '0') {
                setFormError('Please fill in Package Weight.');
                return;
            }
        }

        setFormError(null);
        setActiveStep(2);
    };

    const renderStepIndicator = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stepScrollContent}
            style={styles.stepScrollView}
        >
            <View style={styles.stepContainer}>
                <View style={styles.stepItem}>
                    <View style={[styles.stepIcon, activeStep >= 1 && styles.activeStepIcon]}>
                        <Package size={20} color={activeStep >= 1 ? Colors.white : '#A0AEC0'} />
                    </View>
                    <View style={styles.stepTextContainer}>
                        <Text style={[styles.stepLabel, activeStep >= 1 && styles.activeStepLabel]}>STEP 1</Text>
                        <Text style={styles.stepValue}>Shipment Details</Text>
                    </View>
                </View>

                <View style={styles.stepDivider} />

                <View style={styles.stepItem}>
                    <View style={[styles.stepIcon, activeStep >= 2 && styles.activeStepIcon]}>
                        <Layers size={20} color={activeStep >= 2 ? Colors.white : '#A0AEC0'} />
                    </View>
                    <View style={styles.stepTextContainer}>
                        <Text style={[styles.stepLabel, activeStep >= 2 && styles.activeStepLabel]}>STEP 2</Text>
                        <Text style={styles.stepValue}>Select Service</Text>
                    </View>
                </View>

                <View style={styles.stepDivider} />

                <View style={styles.stepItem}>
                    <View style={[styles.stepIcon, activeStep >= 3 && styles.activeStepIcon]}>
                        <CheckCircle2 size={20} color={activeStep >= 3 ? Colors.white : '#A0AEC0'} />
                    </View>
                    <View style={styles.stepTextContainer}>
                        <Text style={[styles.stepLabel, activeStep >= 3 && styles.activeStepLabel]}>STEP 3</Text>
                        <Text style={styles.stepValue}>Summary</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderStep1 = () => (
        <View>
            {formError && (
                <View style={styles.errorBanner}>
                    <Info size={18} color="#991B1B" />
                    <Text style={styles.errorBannerText}>{formError}</Text>
                    <TouchableOpacity onPress={() => setFormError(null)}>
                        <X size={16} color="#991B1B" />
                    </TouchableOpacity>
                </View>
            )}
            <View style={[styles.step1Layout, isMobile && { flexDirection: 'column' }]}>
                {/* Left Column: Origin & Destination */}
                <View style={[styles.formColumn, !isMobile && { flex: 2 }]}>
                    <View style={styles.card}>
                        <View style={styles.cardSection}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconBg, { backgroundColor: '#FFEDD5' }]}>
                                    <MapPin size={18} color="#EA580C" />
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Origin</Text>
                                    <Text style={styles.sectionSubtitle}>Where is the package shipping from?</Text>
                                </View>
                            </View>

                            <View style={styles.fieldGrid}>
                                <View style={styles.fieldFull}>
                                    <Text style={styles.inputLabel}>LOCATION</Text>
                                    <View style={styles.inputSearchWrapper}>
                                        <Search size={16} color="#94A3B8" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Search city or area"
                                            placeholderTextColor="#94A3B8"
                                            value={origin.location}
                                            onChangeText={(v) => {
                                                setOrigin({ ...origin, location: v });
                                                setShowOriginSug(false);
                                            }}
                                        />
                                    </View>
                                    {showOriginSug && originSuggestions.length > 0 && (
                                        <View style={styles.suggestionsContainer}>
                                            {originSuggestions.map((loc, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={styles.suggestionItem}
                                                    onPress={() => handleSelectSuggestion('origin', i)}
                                                >
                                                    <MapPin size={14} color="#64748B" />
                                                    <Text style={styles.suggestionText}>{loc}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={styles.fieldFull}>
                                    <Text style={styles.inputLabel}>PINCODE <Text style={{ color: '#E11D48' }}>*</Text></Text>
                                    <View style={styles.inputSearchWrapper}>
                                        <Search size={16} color="#94A3B8" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter pincode"
                                            placeholderTextColor="#94A3B8"
                                            value={origin.pincode}
                                            keyboardType="numeric"
                                            onChangeText={(v) => handlePincodeChange('origin', v)}
                                        />
                                        {loadingPincode.origin && (
                                            <Text style={{ fontSize: 10, color: '#64748B', fontWeight: 'bold' }}>Searching...</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.fieldHalf}>
                                    <Text style={styles.inputLabel}>CITY</Text>
                                    <View style={styles.fieldInputWrapper}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={origin.city}
                                            onChangeText={(v) => setOrigin({ ...origin, city: v })}
                                            placeholder="City"
                                        />
                                    </View>
                                </View>
                                <View style={styles.fieldHalf}>
                                    <Text style={styles.inputLabel}>STATE</Text>
                                    <View style={styles.fieldInputWrapper}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={origin.state}
                                            onChangeText={(v) => setOrigin({ ...origin, state: v })}
                                            placeholder="State"
                                        />
                                    </View>
                                </View>

                                <View style={styles.fieldFull}>
                                    <Text style={styles.inputLabel}>COUNTRY <Text style={{ color: '#E11D48' }}>*</Text></Text>
                                    <View style={styles.fieldInputWrapper}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={origin.country}
                                            onChangeText={(v) => setOrigin({ ...origin, country: v })}
                                            placeholder="Country"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.divider, { marginVertical: 0 }]} />

                        <View style={styles.cardSection}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconBg, { backgroundColor: '#DCFCE7' }]}>
                                    <Truck size={18} color="#16A34A" />
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Destination</Text>
                                    <Text style={styles.sectionSubtitle}>Where is the package going?</Text>
                                </View>
                            </View>

                            <View style={styles.fieldGrid}>
                                <View style={styles.fieldFull}>
                                    <Text style={styles.inputLabel}>LOCATION</Text>
                                    <View style={styles.inputSearchWrapper}>
                                        <Search size={16} color="#94A3B8" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Search city or area"
                                            placeholderTextColor="#94A3B8"
                                            value={destination.location}
                                            onChangeText={(v) => {
                                                setDestination({ ...destination, location: v });
                                                setShowDestSug(false);
                                            }}
                                        />
                                    </View>
                                    {showDestSug && destSuggestions.length > 0 && (
                                        <View style={styles.suggestionsContainer}>
                                            {destSuggestions.map((loc, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={styles.suggestionItem}
                                                    onPress={() => handleSelectSuggestion('destination', i)}
                                                >
                                                    <MapPin size={14} color="#64748B" />
                                                    <Text style={styles.suggestionText}>{loc}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={styles.fieldFull}>
                                    <Text style={styles.inputLabel}>PINCODE</Text>
                                    <View style={styles.inputSearchWrapper}>
                                        <Search size={16} color="#94A3B8" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter pincode"
                                            placeholderTextColor="#94A3B8"
                                            value={destination.pincode}
                                            keyboardType="numeric"
                                            onChangeText={(v) => handlePincodeChange('destination', v)}
                                        />
                                        {loadingPincode.destination && (
                                            <Text style={{ fontSize: 10, color: '#64748B', fontWeight: 'bold' }}>Searching...</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.fieldHalf}>
                                    <Text style={styles.inputLabel}>CITY</Text>
                                    <View style={styles.fieldInputWrapper}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={destination.city}
                                            onChangeText={(v) => setDestination({ ...destination, city: v })}
                                            placeholder="City"
                                        />
                                    </View>
                                </View>
                                <View style={styles.fieldHalf}>
                                    <Text style={styles.inputLabel}>STATE</Text>
                                    <View style={styles.fieldInputWrapper}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={destination.state}
                                            onChangeText={(v) => setDestination({ ...destination, state: v })}
                                            placeholder="State"
                                        />
                                    </View>
                                </View>

                                <View style={styles.fieldFull}>
                                    <Text style={styles.inputLabel}>COUNTRY</Text>
                                    <View style={styles.fieldInputWrapper}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={destination.country}
                                            onChangeText={(v) => setDestination({ ...destination, country: v })}
                                            placeholder="Country"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Right Column: Package Details */}
                <View style={[styles.formColumn, !isMobile && { flex: 1 }]}>
                    <View style={styles.card}>
                        <View style={styles.cardSection}>
                            <Text style={styles.packageTitle}>Package Details</Text>

                            <Text style={[styles.inputLabel, { marginTop: 20 }]}>SHIPMENT TYPE</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, shipmentType === 'Parcel' && styles.activeTypeBtn]}
                                    onPress={() => setShipmentType('Parcel')}
                                >
                                    <Package size={18} color={shipmentType === 'Parcel' ? Colors.white : '#64748B'} />
                                    <Text style={[styles.typeBtnText, shipmentType === 'Parcel' && styles.activeTypeBtnText]}>Parcel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, shipmentType === 'Document' && styles.activeTypeBtn]}
                                    onPress={() => setShipmentType('Document')}
                                >
                                    <Clock size={18} color={shipmentType === 'Document' ? Colors.white : '#64748B'} />
                                    <Text style={[styles.typeBtnText, shipmentType === 'Document' && styles.activeTypeBtnText]}>Document</Text>
                                </TouchableOpacity>
                            </View>

                            {shipmentType === 'Parcel' ? (
                                <>
                                    <View style={styles.boxHeaderRow}>
                                        <Text style={styles.boxCountLabel}>{boxes.length} {boxes.length === 1 ? 'Box' : 'Boxes'}</Text>
                                        <TouchableOpacity style={styles.addBoxBtn} onPress={addBox}>
                                            <Plus size={16} color={Colors.white} />
                                            <Text style={styles.addBoxBtnText}>Add</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.boxesList}>
                                        {boxes.map((box, idx) => (
                                            <View key={box.id} style={styles.boxItemCard}>
                                                <View style={styles.boxItemHeader}>
                                                    <View style={styles.boxLabelRow}>
                                                        <Package size={14} color="#E67E22" />
                                                        <Text style={styles.boxItemTitle}>Box {idx + 1}</Text>
                                                    </View>
                                                    <View style={styles.boxActions}>
                                                        <TouchableOpacity onPress={() => copyBox(box)}>
                                                            <Copy size={16} color="#94A3B8" />
                                                        </TouchableOpacity>
                                                        {boxes.length > 1 && (
                                                            <TouchableOpacity onPress={() => removeBox(box.id)}>
                                                                <Trash2 size={16} color="#94A3B8" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>

                                                <View style={styles.boxInputRow}>
                                                    <View style={styles.boxInputGroup}>
                                                        <Text style={styles.boxLabel}>WT (KG) <Text style={{ color: 'red' }}>*</Text></Text>
                                                        <TextInput
                                                            style={styles.boxInput}
                                                            value={box.wt}
                                                            keyboardType="numeric"
                                                            onChangeText={(v) => updateBox(box.id, 'wt', v)}
                                                        />
                                                    </View>
                                                    <View style={styles.boxInputGroup}>
                                                        <Text style={styles.boxLabel}>L (CM) <Text style={{ color: 'red' }}>*</Text></Text>
                                                        <TextInput
                                                            style={styles.boxInput}
                                                            value={box.l}
                                                            keyboardType="numeric"
                                                            onChangeText={(v) => updateBox(box.id, 'l', v)}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={[styles.boxInputRow, { marginTop: 10 }]}>
                                                    <View style={styles.boxInputGroup}>
                                                        <Text style={styles.boxLabel}>W (CM) <Text style={{ color: 'red' }}>*</Text></Text>
                                                        <TextInput
                                                            style={styles.boxInput}
                                                            value={box.w}
                                                            keyboardType="numeric"
                                                            onChangeText={(v) => updateBox(box.id, 'w', v)}
                                                        />
                                                    </View>
                                                    <View style={styles.boxInputGroup}>
                                                        <Text style={styles.boxLabel}>H (CM) <Text style={{ color: 'red' }}>*</Text></Text>
                                                        <TextInput
                                                            style={styles.boxInput}
                                                            value={box.h}
                                                            keyboardType="numeric"
                                                            onChangeText={(v) => updateBox(box.id, 'h', v)}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <View style={{ marginTop: 24 }}>
                                    <Text style={styles.inputLabel}>WEIGHT (KG) <Text style={{ color: '#E11D48' }}>*</Text></Text>
                                    <View style={styles.documentWeightInput}>
                                        <View style={styles.weightIconWrapper}>
                                            <Weight size={18} color="#94A3B8" />
                                        </View>
                                        <TextInput
                                            style={styles.textInput}
                                            value={boxes[0].wt}
                                            keyboardType="numeric"
                                            onChangeText={(v) => updateBox(boxes[0].id, 'wt', v)}
                                            placeholder="0.0"
                                            placeholderTextColor="#94A3B8"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={handleContinueStep1}
                    >
                        <Text style={styles.continueBtnText}>Continue</Text>
                        <ArrowRight size={18} color={Colors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('Dashboard')}>
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View >
    );

    const renderStep2Domestic = () => (
        <View style={styles.domesticContainer}>
            <View style={styles.domesticCard}>
                <View style={[styles.iconBg, { backgroundColor: '#EDF2F7', marginBottom: 20 }]}>
                    <Truck size={40} color="#CBD5E0" />
                    <View style={styles.alertCircleIcon}>
                        <Info size={14} color="#E53E3E" />
                    </View>
                </View>
                <Text style={styles.domesticTitle}>No Online Rates Available</Text>
                <Text style={styles.domesticSub}>
                    We couldn't find instant rates for this specific route. However, our sales team can provide you with a custom quote immediately.
                </Text>

                <View style={styles.ticketBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.ticketText}>Ticket #251234 has been automatically raised for you</Text>
                </View>

                <View style={styles.contactSalesHeader}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.contactSalesHeaderText}>CONTACT SALES TEAM</Text>
                </View>

                <View style={styles.contactCard}>
                    <View style={styles.contactRow}>
                        <View style={styles.contactInfo}>
                            <View style={[styles.contactIconBg, { backgroundColor: '#EBF8FF' }]}>
                                <Phone size={18} color="#3182CE" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>CALL US</Text>
                                <Text style={styles.contactValue}>9355151122</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.contactActionBtn}>
                            <Phone size={14} color="#64748B" style={{ marginRight: 6 }} />
                            <Text style={styles.contactActionText}>Call</Text>
                            <Copy size={14} color="#CBD5E0" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.divider, { marginVertical: 15 }]} />

                    <View style={styles.contactRow}>
                        <View style={styles.contactInfo}>
                            <View style={[styles.contactIconBg, { backgroundColor: '#F0FFF4' }]}>
                                <MessageCircle size={18} color="#38A169" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>WHATSAPP CHAT</Text>
                                <Text style={styles.contactValue}>9355029322</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.contactActionBtn}>
                            <MessageCircle size={14} color="#64748B" style={{ marginRight: 6 }} />
                            <Text style={styles.contactActionText}>Chat</Text>
                            <Copy size={14} color="#CBD5E0" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.divider, { marginVertical: 15 }]} />

                    <View style={styles.contactRow}>
                        <View style={styles.contactInfo}>
                            <View style={[styles.contactIconBg, { backgroundColor: '#FAF5FF' }]}>
                                <Mail size={18} color="#805AD5" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>EMAIL US</Text>
                                <Text style={styles.contactValue}>courier@thedflgroup.com</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.contactActionBtn}>
                            <Mail size={14} color="#64748B" style={{ marginRight: 6 }} />
                            <Text style={styles.contactActionText}>Email</Text>
                            <Copy size={14} color="#CBD5E0" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderStep2International = () => {
        const totalWeight = boxes.reduce((acc, b) => acc + (parseFloat(b.wt) || 0), 0).toFixed(2);

        const services = [
            { id: '1', name: 'DFL EXPRESS - Priority', time: '5-6 BUSINESS DAYS', basePrice: '3,930.00', gst: '707.40', total: '4,637.40', tag: 'DDP', color: '#6C5CE7', logo: 'EX' },
            { id: '2', name: 'DFL EXPRESS - Standard', time: '7-8 BUSINESS DAYS', basePrice: '4,035.60', gst: '726.41', total: '4,762.01', tag: 'DDP', color: '#0984E3', logo: 'ST' },
            { id: '3', name: 'DFL EXPRESS - FBA', time: '7-10 BUSINESS DAYS', basePrice: '4,236.00', gst: '762.48', total: '4,998.48', tag: 'DDP', color: '#00B894', logo: 'FB' },
            { id: '4', name: 'DFL EXPRESS - Economy Saver', time: '13-15 BUSINESS DAYS', basePrice: '5,080.47', gst: '914.48', total: '5,994.95', tag: 'DDP', color: '#E17055', logo: 'ES', alert: 'NO REFUND POLICY' },
            { id: '5', name: 'DFL EXPRESS - Economy Ground', time: '11-13 BUSINESS DAYS', basePrice: '5,148.00', gst: '926.64', total: '6,074.64', tag: 'DDP', color: '#3182CE', logo: 'EG' }
        ];

        const selectedServiceData = services.find(s => s.id === selectedService);

        return (
            <View>
                <View style={styles.step2InternationalLayout}>
                    {/* QUOTE SUMMARY FIRST */}
                    <View style={[styles.summaryColumn, !isMobile && { flex: 1 }]}>
                        <View style={styles.card}>
                            <View style={styles.cardSection}>
                                <Text style={styles.summaryTitle}>QUOTE SUMMARY</Text>

                                <View style={styles.summaryRoute}>
                                    <View style={styles.routeItem}>
                                        <View style={[styles.routeDot, { backgroundColor: '#EA580C' }]} />
                                        <View style={styles.routeInfo}>
                                            <Text style={styles.routeLabel}>ORIGIN</Text>
                                            <Text style={styles.routeCity}>{origin.location || origin.city || 'Noida'}</Text>
                                            <Text style={styles.routeCountry}>{origin.country || 'India'}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.routeLine, { left: 4, height: 16, marginVertical: 2 }]} />
                                    <View style={styles.routeItem}>
                                        <View style={[styles.routeDot, { backgroundColor: '#16A34A' }]} />
                                        <View style={styles.routeInfo}>
                                            <Text style={styles.routeLabel}>DESTINATION</Text>
                                            <Text style={styles.routeCity}>{destination.location || destination.city || 'California'}</Text>
                                            <Text style={styles.routeCountry}>{destination.country || 'United States'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.divider, { marginVertical: 20 }]} />

                                <Text style={styles.summaryLabel}>PACKAGE</Text>
                                <View style={styles.packageDetailGrid}>
                                    <View style={styles.packageSummaryBox}>
                                        <Text style={styles.pSummaryLabel}>TYPE</Text>
                                        <Text style={styles.pSummaryValue}>{shipmentType}</Text>
                                    </View>
                                    <View style={styles.packageSummaryBox}>
                                        <Text style={styles.pSummaryLabel}>WEIGHT</Text>
                                        <Text style={styles.pSummaryValue}>{totalWeight} kg</Text>
                                    </View>
                                </View>

                                {selectedServiceData && (
                                    <View style={styles.selectedServiceCard}>
                                        <View style={styles.selectedServiceHeader}>
                                            <Text style={styles.selectedServiceName}>{selectedServiceData.name}</Text>
                                        </View>
                                        <View style={styles.selectedServiceFooter}>
                                            <View>
                                                <Text style={styles.selectedTotalLabel}>TOTAL</Text>
                                                <Text style={styles.selectedTotalValue}>₹ {selectedServiceData.total}</Text>
                                            </View>
                                            <Text style={styles.selectedDeliveryTime}>{selectedServiceData.time}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* SELECT SERVICE SECOND */}
                    <View style={[styles.serviceColumn, !isMobile && { flex: 2 }]}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardHeaderTitle}>Select Service</Text>
                                <Text style={styles.cardHeaderSubtitle}>Choose the best shipping option for your needs</Text>
                            </View>

                            <View style={styles.serviceList}>
                                {services.map(service => (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={[
                                            styles.premiumServiceItem,
                                            selectedService === service.id && styles.activePremiumService
                                        ]}
                                        onPress={() => setSelectedService(service.id)}
                                    >
                                        <View style={styles.serviceTopSection}>
                                            <View style={styles.serviceLogoCircle}>
                                                <Image source={{ uri: 'https://img.icons8.com/color/48/000000/dhl.png' }} style={{ width: 24, height: 24, opacity: 0.8 }} />
                                            </View>
                                            <View style={styles.serviceNameArea}>
                                                <Text style={styles.premiumServiceName}>{service.name}</Text>
                                                {service.alert && (
                                                    <View style={styles.serviceAlertRow}>
                                                        <Info size={12} color="#EF4444" />
                                                        <Text style={styles.serviceAlertText}>{service.alert}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.priceBreakdown}>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.currencySymbol}>₹</Text>
                                                    <Text style={styles.basePriceTxt}>{service.basePrice}</Text>
                                                </View>
                                                <Text style={styles.gstText}>INCL. GST (18%): ₹{service.gst}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.serviceBottomSection}>
                                            <View style={styles.serviceTagsRow}>
                                                <View style={styles.serviceTag}>
                                                    <Weight size={12} color="#64748B" />
                                                    <Text style={styles.serviceTagText}>{totalWeight} KG</Text>
                                                </View>
                                                <View style={[styles.serviceTag, { backgroundColor: '#F0FDF4' }]}>
                                                    <Clock size={12} color="#16A34A" />
                                                    <Text style={[styles.serviceTagText, { color: '#16A34A' }]}>{service.time}</Text>
                                                </View>
                                                <View style={[styles.serviceTag, { backgroundColor: '#F5F3FF' }]}>
                                                    <Text style={[styles.serviceTagText, { color: '#7C3AED' }]}>{service.tag}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.totalBadge}>
                                                <Text style={styles.totalBadgeLabel}>TOTAL</Text>
                                                <Text style={styles.totalBadgeValue}>₹{service.total}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* WORKING BUTTONS AT THE BOTTOM */}
                <View style={[styles.bottomActions, { marginTop: 24, paddingBottom: 20 }]}>
                    <TouchableOpacity style={styles.backBtnLarge} onPress={() => setActiveStep(1)}>
                        <Text style={styles.backBtnLargeText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.continueBtnLarge, !selectedService && { opacity: 0.6 }]}
                        onPress={() => selectedService && setActiveStep(3)}
                        disabled={!selectedService}
                    >
                        <Text style={styles.continueBtnLargeText}>Continue</Text>
                        <ArrowRight size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: STATUSBAR_HEIGHT }]}>
            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="Rate Calculator"
                onNavigate={onNavigate}
            />
            <View style={styles.mainWrapper}>
                <View style={{ width: isMobile ? 56 : 72 }} />
                <View style={{ flex: 1 }}>
                    <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />

                    <ScrollView
                        style={styles.contentArea}
                        contentContainerStyle={{ paddingBottom: 50 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.innerContent}>
                            <View style={styles.pageHeader}>
                                <View>
                                    <Text style={styles.pageTitle}>Rate Calculator</Text>
                                    <Text style={styles.pageSubtitle}>Get an instant price estimate for your shipment</Text>
                                </View>
                            </View>

                            {renderStepIndicator()}

                            {activeStep === 1 ? renderStep1() :
                                activeStep === 2 ? (isDomestic ? renderStep2Domestic() : renderStep2International()) :
                                    (
                                        <View style={styles.summaryStepContainer}>
                                            <CheckCircle2 size={60} color="#16A34A" />
                                            <Text style={styles.step3Title}>Ready to ship!</Text>
                                            <Text style={styles.step3Sub}>Your quote has been generated. You can now proceed to book your shipment or save it for later.</Text>
                                            <View style={styles.summaryCard}>
                                                <View style={styles.summaryRow}>
                                                    <Text style={styles.sumLabel}>Service</Text>
                                                    <Text style={styles.sumValue}>{selectedService ? 'Express Worldwide' : 'Custom Quote requested'}</Text>
                                                </View>
                                                <View style={styles.summaryRow}>
                                                    <Text style={styles.sumLabel}>Route</Text>
                                                    <Text style={styles.sumValue}>{origin.country} → {destination.country}</Text>
                                                </View>
                                                <View style={styles.summaryRow}>
                                                    <Text style={styles.sumLabel}>Weight</Text>
                                                    <Text style={styles.sumValue}>{boxes.reduce((acc, b) => acc + (parseFloat(b.wt) || 0), 0)} KG</Text>
                                                </View>
                                            </View>
                                            <View style={styles.step3Actions}>
                                                <TouchableOpacity
                                                    style={styles.bookNowBtn}
                                                    onPress={() => onNavigate('Book Shipment')}
                                                >
                                                    <Text style={styles.bookNowText}>Book Now</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.backToHomeBtn}
                                                    onPress={() => onNavigate('Dashboard')}
                                                >
                                                    <Text style={styles.backToHomeText}>Back to Dashboard</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
            Animated.spring(translateY, {
                toValue: 0,
                delay,
                useNativeDriver: true,
                friction: 8,
                tension: 40,
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    mainWrapper: {
        flex: 1,
        flexDirection: 'row',
    },
    contentArea: {
        flex: 1,
    },
    innerContent: {
        padding: Platform.OS === 'web' ? 24 : 16,
    },
    pageHeader: {
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    stepScrollView: {
        marginBottom: 32,
        marginHorizontal: Platform.OS === 'web' ? -24 : -16,
        paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    },
    stepScrollContent: {
        paddingRight: 40,
        alignItems: 'center',
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    activeStepIcon: {
        backgroundColor: '#003049',
        borderColor: '#003049',
    },
    stepTextContainer: {
        gap: 2,
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
    },
    activeStepLabel: {
        color: '#EA580C',
    },
    stepValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
    },
    stepDivider: {
        width: 60,
        height: 2,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 16,
    },
    step1Layout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    formColumn: {
        width: Platform.OS === 'web' ? 'auto' : '100%',
        gap: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 8,
        // overflow: 'hidden', // Removed to let absolute suggestions show
    },
    cardSection: {
        padding: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    sectionIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    fieldGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    fieldFull: {
        width: '100%',
    },
    fieldHalf: {
        width: Platform.OS === 'web' ? '48%' : '100%',
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    inputSearchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        height: 44,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#1E293B',
    },
    fieldInputWrapper: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        height: 44,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    textInputDisabled: {
        height: 44,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#64748B',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        width: '100%',
    },
    packageTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginTop: 8,
        gap: 4,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
        borderRadius: 8,
        minWidth: 120,
        minHeight: 44,
    },
    activeTypeBtn: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        paddingHorizontal: 12,
    },
    typeBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    activeTypeBtnText: {
        color: '#1E293B',
    },
    boxHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    boxCountLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
    },
    addBoxBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#003049',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    addBoxBtnText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '800',
    },
    boxesList: {
        gap: 16,
    },
    boxItemCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    boxItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    boxLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    boxItemTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
    },
    boxActions: {
        flexDirection: 'row',
        gap: 12,
    },
    boxInputRow: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 12,
    },
    boxInputGroup: {
        flex: 1,
    },
    boxLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 6,
    },
    boxInput: {
        height: 40,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        color: '#1E293B',
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#003049',
        height: 52,
        borderRadius: 12,
        gap: 10,
        marginTop: 10,
    },
    continueBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
    backBtn: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    backBtnText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '700',
    },
    domesticContainer: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    domesticCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    iconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    alertCircleIcon: {
        position: 'absolute',
        top: 10,
        right: 15,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 2,
    },
    domesticTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 12,
    },
    domesticSub: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    ticketBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FFF4',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        marginTop: 24,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2FB344',
        marginRight: 10,
    },
    ticketText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#16A34A',
    },
    contactSalesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
        width: '100%',
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EA580C',
        marginRight: 10,
    },
    contactSalesHeaderText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 2,
    },
    contactCard: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    contactIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    contactValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    contactActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    contactActionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
    },
    backBtnLarge: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 24,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
    },
    backBtnLargeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    continueBtnLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#003049',
        height: 52,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 10,
    },
    continueBtnLargeText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFF',
    },
    step2InternationalLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: 14,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FECACA',
        gap: 12,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 14,
        color: '#991B1B',
        fontWeight: '600',
    },
    serviceColumn: {
        gap: 24,
    },
    cardHeader: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    cardHeaderTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    cardHeaderSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    serviceList: {
        padding: 16,
        gap: 12,
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectedServiceItem: {
        borderColor: '#003049',
        backgroundColor: '#EDF2F7',
    },
    serviceItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    serviceLogo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceLogoText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#003049',
    },
    serviceName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    deliveryTime: {
        fontSize: 12,
        color: '#64748B',
    },
    servicePriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    servicePrice: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: '#003049',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#003049',
    },
    summaryColumn: {
        gap: 24,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 24,
    },
    summaryRoute: {
        gap: 2,
    },
    routeItem: {
        flexDirection: 'row',
        gap: 12,
    },
    routeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EA580C',
        marginTop: 4,
    },
    routeInfo: {
        gap: 2,
    },
    routeLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    routeCity: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    routeCountry: {
        fontSize: 12,
        color: '#64748B',
    },
    routeLine: {
        width: 2,
        height: 20,
        backgroundColor: '#E2E8F0',
        marginLeft: 4,
    },
    packageSummary: {
        marginTop: 10,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 10,
    },
    packageRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    packageValue: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    weightBox: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    weightLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#64748B',
        marginBottom: 4,
    },
    weightValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#003049',
    },
    totalAmountSection: {
        marginTop: 24,
        backgroundColor: '#003049',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
        marginBottom: 8,
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    inclusiveText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },
    summaryStepContainer: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 24,
    },
    step3Title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E293B',
        marginTop: 20,
    },
    step3Sub: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 22,
    },
    summaryCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 20,
        gap: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sumLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    sumValue: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
    },
    step3Actions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 40,
    },
    bookNowBtn: {
        backgroundColor: '#003049',
        paddingHorizontal: 32,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
    },
    bookNowText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    backToHomeBtn: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 32,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
    },
    backToHomeText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '800',
    },
    documentWeightInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    weightIconWrapper: {
        marginRight: 12,
    },
    ticketInfo: {
        backgroundColor: '#F0FFF4',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 4,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        zIndex: 9999,
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 10,
    },
    suggestionText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500',
    },
    premiumServiceItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    activePremiumService: {
        borderColor: '#003049',
        borderWidth: 1.5,
        backgroundColor: '#F8FAFC',
    },
    serviceMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceLogoCircle: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    premiumServiceName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 6,
    },
    serviceTagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    serviceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    serviceTagText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
    },
    serviceAlertRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    serviceAlertText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#EF4444',
    },
    priceBreakdown: {
        alignItems: 'flex-end',
    },
    basePriceTxt: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    gstText: {
        fontSize: 9,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '600',
    },
    totalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#003049',
        borderRadius: 4,
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    totalBadgeLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 8,
        fontWeight: '800',
        marginRight: 4,
    },
    totalBadgeValue: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
    },
    packageDetailGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    packageSummaryBox: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        padding: 10,
        borderRadius: 10,
    },
    pSummaryLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 2,
    },
    pSummaryValue: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
    },
    serviceTopSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    serviceNameArea: {
        flex: 1,
        marginHorizontal: 12,
    },
    serviceBottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    currencySymbol: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: 'bold',
    },
    selectedServiceCard: {
        marginTop: 20,
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 16,
    },
    selectedServiceHeader: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 10,
        marginBottom: 10,
    },
    selectedServiceName: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    selectedServiceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    selectedTotalLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 2,
    },
    selectedTotalValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    selectedDeliveryTime: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
});
