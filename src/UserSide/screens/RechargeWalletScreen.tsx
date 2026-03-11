import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    useWindowDimensions,
    Image,
    Platform,
    Alert,
    Animated,
    Modal,
    ActivityIndicator
} from 'react-native';
import {
    Copy,
    Upload,
    ChevronDown,
    Clock,
    CreditCard,
    Info,
    Smartphone,
    Building2,
    Calendar,
    ArrowRight,
    Check,
    X
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import Clipboard from '@react-native-clipboard/clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { pick, types } from '@react-native-documents/picker';
import { Search, Eye, Filter, ArrowLeft, ArrowRight as ArrowRightIcon } from 'lucide-react-native';

interface PaymentRecord {
    id: string;
    date: Date;
    amount: string;
    txnId: string;
    mode: string;
    bank: string;
    sender: string;
    remarks: string;
    status: 'Completed' | 'Under Review' | 'Pending' | 'Rejected';
    proofUri: string;
}


export const RechargeWalletScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Add Payment' | 'Payment History'>('Add Payment');

    // Form States
    const [amount, setAmount] = useState('');
    const [utr, setUtr] = useState('');
    const [time, setTime] = useState('');
    const [paymentMode, setPaymentMode] = useState('NEFT');
    const [bankName, setBankName] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [remarks, setRemarks] = useState('');

    // Date/Time States
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [timeHours, setTimeHours] = useState('12');
    const [timeMinutes, setTimeMinutes] = useState('00');
    const [timePeriod, setTimePeriod] = useState('PM');

    // File State
    const [selectedFile, setSelectedFile] = useState<{ name: string, uri: string } | null>(null);

    // Payment History States
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([
        {
            id: 'PAY-1772708956269-7YW',
            date: new Date('2026-03-05T16:39:00'),
            amount: '1',
            txnId: 'werfgwe234',
            mode: 'NEFT',
            bank: 'test',
            sender: 'test',
            remarks: 'Reject',
            status: 'Rejected',
            proofUri: ''
        },
        {
            id: '123',
            date: new Date('2026-01-12T13:20:00'),
            amount: '1',
            txnId: 'asda',
            mode: 'UPI',
            bank: 'sadasd',
            sender: 'asd',
            remarks: 'reject',
            status: 'Rejected',
            proofUri: ''
        },
        {
            id: 'sdas',
            date: new Date('2026-01-03T11:23:00'),
            amount: '113',
            txnId: 'sdad',
            mode: 'NEFT',
            bank: 'sdasd',
            sender: 'asd',
            remarks: 'reject',
            status: 'Rejected',
            proofUri: ''
        },
        {
            id: 'zxczxc',
            date: new Date('2025-12-11T14:13:00'),
            amount: '1,000,000',
            txnId: 'cxvcxv',
            mode: 'NEFT',
            bank: '-',
            sender: '-',
            remarks: '-',
            status: 'Completed',
            proofUri: ''
        },
        {
            id: '234567',
            date: new Date('2025-11-12T14:12:00'),
            amount: '4,000',
            txnId: 'sdfasdf',
            mode: 'NEFT',
            bank: '-',
            sender: '-',
            remarks: '-',
            status: 'Completed',
            proofUri: ''
        }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);


    // UI States
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const paymentModes = ['NEFT', 'IMPS', 'RTGS', 'UPI', 'CHEQUE', 'CASH DEPOSIT'];

    const copyToClipboard = (text: string, fieldId: string) => {
        Clipboard.setString(text);
        setCopiedField(fieldId);
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(1500),
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start(() => setCopiedField(null));
    };

    const validateForm = () => {
        let newErrors: Record<string, string> = {};
        if (!amount) newErrors.amount = 'Amount is required';
        if (!utr) newErrors.utr = 'Transaction ID is required';
        if (!bankName) newErrors.bankName = 'Bank Name is required';
        if (!accountHolder) newErrors.accountHolder = 'Account Holder Name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateOrderId = () => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `PAY-${timestamp}-${randomStr}`;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            if (!selectedFile) {
                Alert.alert('Error', 'Please upload a payment proof image.');
                return;
            }
            setIsSubmitting(true);
            
            // Simulate processing
            setTimeout(() => {
                const newRecord: PaymentRecord = {
                    id: generateOrderId(),
                    date: new Date(),
                    amount: amount,
                    txnId: utr,
                    mode: paymentMode,
                    bank: bankName,
                    sender: accountHolder,
                    remarks: remarks || '-',
                    status: 'Under Review',
                    proofUri: selectedFile.uri
                };

                setPaymentHistory([newRecord, ...paymentHistory]);
                setIsSubmitting(false);
                
                // Reset form
                setAmount('');
                setUtr('');
                setBankName('');
                setAccountHolder('');
                setRemarks('');
                setSelectedFile(null);

                Alert.alert('Success', 'Payment proof submitted successfully! Your wallet will be updated soon.');
                setActiveTab('Payment History');
            }, 2000); // Reduced to 2s for better UX, original was 6s
        }
    };


    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleFilePick = async () => {
        try {
            const result = await pick({
                type: [types.images, types.pdf],
            });
            if (result && result.length > 0) {
                setSelectedFile({
                    name: result[0].name || 'Selected File',
                    uri: result[0].uri
                });
            }
        } catch (err) {
            console.log('File pick error:', err);
        }
    };

    const formatDisplayDate = (d: Date) => {
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const InstructionsPanel = () => (
        <View style={styles.instructionsContainer}>
            <View style={styles.instructionHeader}>
                <View style={[styles.instructionBar, { backgroundColor: '#003049' }]} />
                <Text style={styles.instructionTitle}>Instructions</Text>
            </View>

            <View style={styles.instructionItem}>
                <View style={styles.dot} />
                <View style={styles.instructionContent}>
                    <Text style={styles.instructionLabel}>Payment Verification</Text>
                    <Text style={styles.instructionText}>
                        Ensure the Transaction / UTR ID exactly matches your bank statement. Mismatched IDs may cause delays in wallet credit.
                    </Text>
                </View>
            </View>

            <View style={styles.instructionItem}>
                <View style={styles.dot} />
                <View style={styles.instructionContent}>
                    <Text style={styles.instructionLabel}>Proof Quality</Text>
                    <Text style={styles.instructionText}>
                        Upload a clear, full screenshot of the payment receipt. Essential details like <Text style={styles.boldText}>Amount, Date, and UTR Number</Text> must be clearly visible.
                    </Text>
                </View>
            </View>

            <View style={styles.instructionItem}>
                <View style={styles.dot} />
                <View style={styles.instructionContent}>
                    <Text style={styles.instructionLabel}>File Requirements</Text>
                    <Text style={styles.instructionText}>
                        Supported formats: <Text style={styles.boldText}>JPG, PNG, WEBP</Text>. Max file size: <Text style={styles.boldText}>5MB</Text>. Please verify the file is not password protected.
                    </Text>
                </View>
            </View>

            <View style={styles.instructionItem}>
                <View style={styles.dot} />
                <View style={styles.instructionContent}>
                    <Text style={styles.instructionLabel}>Processing Time</Text>
                    <Text style={styles.instructionText}>
                        Payments are typically verified within <Text style={styles.boldText}>30-60 minutes</Text> during working hours (9 AM - 7 PM IST). Off-hour requests will be processed the next business day.
                    </Text>
                </View>
            </View>

            <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>NEED HELP?</Text>
                <Text style={styles.helpContact}>Contact accounts@thedflindia.in</Text>
            </View>
        </View>
    );

    const CopyOverlay = () => (
        <Animated.View style={[styles.copyFeedback, { opacity: fadeAnim }]}>
            <Check size={14} color="#059669" />
            <Text style={styles.copyFeedbackText}>Copied!</Text>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <View style={{ width: isMobile ? 56 : 72 }} />
            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="Recharge Wallet"
                onNavigate={onNavigate}
            />

            <View style={styles.mainContent}>
                <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Page Header and Tabs */}
                    <View style={styles.pageHeader}>
                        <View>
                            <Text style={styles.title}>Payment Details</Text>
                            <Text style={styles.subtitle}>Manage your payments and upload proofs</Text>
                        </View>

                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'Add Payment' && styles.activeTab]}
                                onPress={() => setActiveTab('Add Payment')}
                            >
                                <Text style={[styles.tabText, activeTab === 'Add Payment' && styles.activeTabText]}>Add Payment</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'Payment History' && styles.activeTab]}
                                onPress={() => setActiveTab('Payment History')}
                            >
                                <Text style={[styles.tabText, activeTab === 'Payment History' && styles.activeTabText]}>Payment History</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {activeTab === 'Add Payment' ? (
                        <View style={[styles.layoutRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                            {/* Left Side: Forms */}
                            <View style={styles.leftColumn}>
                                {/* Bank Details & UPI Section */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Building2 size={24} color="#003049" />
                                        <Text style={styles.cardTitle}>Bank Details & UPI</Text>
                                    </View>
                                    <View style={[styles.paymentMethodRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                                        {/* Bank Transfer */}
                                        <View style={styles.bankTransferBox}>
                                            <View style={styles.methodTitleRow}>
                                                <CreditCard size={20} color="#6B7280" />
                                                <View style={styles.methodInfo}>
                                                    <Text style={styles.methodSubLabel}>BANK TRANSFER</Text>
                                                    <Text style={styles.methodLabel}>AXIS BANK LTD.</Text>
                                                </View>
                                            </View>
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailLabel}>BRANCH ADDRESS</Text>
                                                <View style={styles.detailValueRow}>
                                                    <Text style={styles.detailValue}>SECTOR 132 NOIDA UP NOIDA 201301</Text>
                                                    <View style={styles.copyContainer}>
                                                        {copiedField === 'address' && <CopyOverlay />}
                                                        <TouchableOpacity onPress={() => copyToClipboard('SECTOR 132 NOIDA UP NOIDA 201301', 'address')}>
                                                            <Copy size={16} color={copiedField === 'address' ? '#059669' : '#9CA3AF'} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailLabel}>ACCOUNT NAME</Text>
                                                <View style={styles.detailValueRow}>
                                                    <Text style={styles.detailValue}>M/S DELISHA INTERNATIONAL</Text>
                                                    <View style={styles.copyContainer}>
                                                        {copiedField === 'name' && <CopyOverlay />}
                                                        <TouchableOpacity onPress={() => copyToClipboard('M/S DELISHA INTERNATIONAL', 'name')}>
                                                            <Copy size={16} color={copiedField === 'name' ? '#059669' : '#9CA3AF'} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailLabel}>ACCOUNT NUMBER</Text>
                                                <View style={styles.detailValueRow}>
                                                    <Text style={styles.detailValue}>923020024708210</Text>
                                                    <View style={styles.copyContainer}>
                                                        {copiedField === 'account' && <CopyOverlay />}
                                                        <TouchableOpacity onPress={() => copyToClipboard('923020024708210', 'account')}>
                                                            <Copy size={16} color={copiedField === 'account' ? '#059669' : '#9CA3AF'} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailLabel}>IFSC CODE</Text>
                                                <View style={styles.detailValueRow}>
                                                    <Text style={styles.detailValue}>UTIB0003734</Text>
                                                    <View style={styles.copyContainer}>
                                                        {copiedField === 'ifsc' && <CopyOverlay />}
                                                        <TouchableOpacity onPress={() => copyToClipboard('UTIB0003734', 'ifsc')}>
                                                            <Copy size={16} color={copiedField === 'ifsc' ? '#059669' : '#9CA3AF'} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        {/* UPI Payment */}
                                        <View style={styles.upiBox}>
                                            <View style={styles.methodTitleRow}>
                                                <Smartphone size={20} color="#6B7280" />
                                                <View style={styles.methodInfo}>
                                                    <Text style={styles.methodSubLabel}>UPI PAYMENT</Text>
                                                    <Text style={styles.methodLabel}>Scan & Pay</Text>
                                                </View>
                                            </View>
                                            <View style={styles.qrContainer}>
                                                <View style={styles.qrPlaceholder}>
                                                    <View style={styles.qrInner}>
                                                        <Image
                                                            source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('upi://pay?pa=923020024708210@axisbank&pn=Delisha International&cu=INR&mode=02&orgid=000000')}` }}
                                                            style={styles.qrImage}
                                                        />
                                                        <View style={styles.peLogoOverlay}>
                                                            <Text style={styles.peLogoText}>पे</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <Text style={styles.qrHint}>Scan this QR code using any UPI app to pay</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {/* Submit Payment Proof Section */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Upload size={24} color="#003049" />
                                        <Text style={styles.cardTitle}>Submit Payment Proof</Text>
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.sectionHeader}>TRANSACTION DETAILS</Text>
                                        <View style={[styles.formRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>AMOUNT PAID</Text>
                                                <View style={[styles.amountInputWrapper, errors.amount && styles.errorInput]}>
                                                    <Text style={styles.currencySymbol}>₹</Text>
                                                    <TextInput
                                                        placeholder="0.00"
                                                        style={styles.nestedInput}
                                                        placeholderTextColor="#9CA3AF"
                                                        value={amount}
                                                        onChangeText={(text) => { setAmount(text); if (errors.amount) setErrors({ ...errors, amount: '' }) }}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>TRANSACTION ID / UTR</Text>
                                                <View style={[styles.inputWithIcon, errors.utr && styles.errorInput]}>
                                                    <Building2 size={16} color="#9CA3AF" style={styles.inputIcon} />
                                                    <TextInput
                                                        placeholder="Enter reference number"
                                                        style={styles.nestedInput}
                                                        placeholderTextColor="#9CA3AF"
                                                        value={utr}
                                                        onChangeText={(text) => { setUtr(text); if (errors.utr) setErrors({ ...errors, utr: '' }) }}
                                                    />
                                                </View>
                                                {errors.utr && <Text style={styles.errorText}>{errors.utr}</Text>}
                                            </View>
                                        </View>
                                        <Text style={styles.sectionHeader}>PAYMENT INFORMATION</Text>
                                        <View style={[styles.formRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>DATE</Text>
                                                <TouchableOpacity
                                                    style={styles.inputWithIcon}
                                                    onPress={() => setShowDatePicker(true)}
                                                >
                                                    <Calendar size={16} color="#9CA3AF" style={styles.inputIcon} />
                                                    <Text style={styles.selectText}>{formatDisplayDate(date)}</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>TIME (IST)</Text>
                                                <TouchableOpacity
                                                    style={styles.inputWithIcon}
                                                    onPress={() => setShowTimePicker(true)}
                                                >
                                                    <Clock size={16} color="#9CA3AF" style={styles.inputIcon} />
                                                    <Text style={styles.selectText}>
                                                        {timeHours}:{timeMinutes} {timePeriod}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>MODE</Text>
                                                <TouchableOpacity
                                                    style={styles.selectTrigger}
                                                    onPress={() => setIsDropdownVisible(true)}
                                                >
                                                    <Text style={styles.selectText}>{paymentMode}</Text>
                                                    <ChevronDown size={20} color="#9CA3AF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Text style={styles.sectionHeader}>SENDER DETAILS</Text>
                                        <View style={[styles.formRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>BANK NAME</Text>
                                                <TextInput
                                                    placeholder="e.g. HDFC Bank"
                                                    style={[styles.input, errors.bankName && styles.errorInput]}
                                                    placeholderTextColor="#9CA3AF"
                                                    value={bankName}
                                                    onChangeText={(text) => { setBankName(text); if (errors.bankName) setErrors({ ...errors, bankName: '' }) }}
                                                />
                                                {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>ACCOUNT HOLDER</Text>
                                                <TextInput
                                                    placeholder="e.g. John Doe"
                                                    style={[styles.input, errors.accountHolder && styles.errorInput]}
                                                    placeholderTextColor="#9CA3AF"
                                                    value={accountHolder}
                                                    onChangeText={(text) => { setAccountHolder(text); if (errors.accountHolder) setErrors({ ...errors, accountHolder: '' }) }}
                                                />
                                                {errors.accountHolder && <Text style={styles.errorText}>{errors.accountHolder}</Text>}
                                            </View>
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>REMARKS (OPTIONAL)</Text>
                                            <TextInput
                                                placeholder="Add any additional notes here..."
                                                style={[styles.input, styles.textArea]}
                                                placeholderTextColor="#9CA3AF"
                                                multiline
                                                numberOfLines={4}
                                                value={remarks}
                                                onChangeText={setRemarks}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>PAYMENT PROOF</Text>
                                            <TouchableOpacity
                                                style={[styles.uploadZone, selectedFile && styles.uploadZoneActive]}
                                                onPress={handleFilePick}
                                            >
                                                <View style={styles.uploadIconCircle}>
                                                    {selectedFile ? <Check size={24} color="#059669" /> : <Upload size={24} color="#9CA3AF" />}
                                                </View>
                                                <Text style={styles.uploadTitle}>
                                                    {selectedFile ? selectedFile.name : 'Click to upload proof'}
                                                </Text>
                                                <Text style={styles.uploadSubs}>
                                                    {selectedFile ? 'File attached successfully' : 'JPG, PNG, WEBP (MAX 5MB)'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                                            onPress={handleSubmit}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                                    <Text style={styles.submitBtnText}> Processing...</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Text style={styles.submitBtnText}>Submit Payment Proof </Text>
                                                    <ArrowRightIcon size={18} color="#FFFFFF" />
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.rightColumn, !isMobile && { width: 320, marginLeft: 24 }]}>
                                <InstructionsPanel />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.card}>
                            {/* Filter and Search Bar */}
                            <View style={[styles.historyToolbar, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
                                <View style={[styles.filtersWrapper, isMobile && { minWidth: '100%' }]}>
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={false} 
                                        contentContainerStyle={styles.filterChipsContainer}
                                        scrollEnabled={true}
                                    >
                                        {[
                                            { label: 'All', count: paymentHistory.length, color: '#1F2937' },
                                            { label: 'Completed', count: paymentHistory.filter(r => r.status === 'Completed').length, color: '#10B981' },
                                            { label: 'Under Review', count: paymentHistory.filter(r => r.status === 'Under Review').length, color: '#F59E0B' },
                                            { label: 'Pending', count: paymentHistory.filter(r => r.status === 'Pending').length, color: '#6B7280' },
                                            { label: 'Rejected', count: paymentHistory.filter(r => r.status === 'Rejected').length, color: '#EF4444' }
                                        ].map((chip) => (
                                            <TouchableOpacity
                                                key={chip.label}
                                                style={[
                                                    styles.filterChip,
                                                    statusFilter === chip.label && { backgroundColor: chip.color + '20', borderColor: chip.color }
                                                ]}
                                                onPress={() => { setStatusFilter(chip.label); setCurrentPage(1); }}
                                            >
                                                <Text style={[styles.filterChipLabel, { color: statusFilter === chip.label ? chip.color : '#6B7280' }]}>
                                                    {chip.label}
                                                </Text>
                                                <View style={[styles.chipCount, { backgroundColor: statusFilter === chip.label ? chip.color : '#E5E7EB' }]}>
                                                    <Text style={[styles.chipCountText, { color: statusFilter === chip.label ? '#FFFFFF' : '#4B5563' }]}>
                                                        {chip.count}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={[styles.searchContainer, isMobile && { maxWidth: '100%' }]}>
                                    <View style={styles.searchInputWrapper}>
                                        <TextInput
                                            placeholder="Search by Order ID..."
                                            style={styles.historySearchInput}
                                            placeholderTextColor="#9CA3AF"
                                            value={searchQuery}
                                            onChangeText={(text) => { setSearchQuery(text); setCurrentPage(1); }}
                                        />
                                        <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
                                    </View>
                                </View>
                            </View>

                            {/* Entries display info */}
                            <View style={[styles.entriesInfoRow, isMobile && { flexDirection: 'column', alignItems: 'flex-start' }]}>
                                <Text style={styles.entriesInfoText}>
                                    Showing <Text style={styles.boldText}>{(currentPage - 1) * itemsPerPage + 1}</Text> to <Text style={styles.boldText}>{Math.min(currentPage * itemsPerPage, paymentHistory.length)}</Text> of <Text style={styles.boldText}>{paymentHistory.length}</Text> entries
                                </Text>
                                <View style={[styles.itemsPerPageRow, isMobile && { marginTop: 8 }]}>
                                    <Text style={styles.entriesInfoText}>Items per page: </Text>
                                    <View style={styles.smallSelect}>
                                        <Text style={styles.smallSelectText}>{itemsPerPage}</Text>
                                        <ChevronDown size={14} color="#6B7280" />
                                    </View>
                                </View>
                            </View>

                            {/* Data Table */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                <View style={styles.tableContainer}>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderCell, { width: 220 }]}>ORDER ID</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 140 }]}>DATE</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 100 }]}>AMOUNT</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 120, textAlign: 'center' }]}>STATUS</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 80, textAlign: 'center' }]}>PROOF</Text>
                                    </View>

                                    {paymentHistory
                                        .filter(r => (statusFilter === 'All' || r.status === statusFilter) &&
                                            (r.id.toLowerCase().includes(searchQuery.toLowerCase()) || r.txnId.toLowerCase().includes(searchQuery.toLowerCase())))
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((record, index) => (
                                            <View key={record.id} style={[styles.tableRow, index % 2 === 1 && { backgroundColor: '#F9FAFB' }]}>
                                                <Text style={[styles.tableCellText, { width: 220, color: '#003049', fontWeight: 'bold' }]}>{record.id}</Text>
                                                <View style={{ width: 140 }}>
                                                    <Text style={styles.tableCellText}>{formatDisplayDate(record.date)}</Text>
                                                    <Text style={styles.tableCellSubText}>{record.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                                </View>
                                                <Text style={[styles.tableCellText, { width: 100, fontWeight: '800' }]}>₹{record.amount}</Text>
                                                <View style={{ width: 120, alignItems: 'center' }}>
                                                    <View style={[
                                                        styles.statusBadge,
                                                        record.status === 'Completed' && styles.statusCompleted,
                                                        record.status === 'Under Review' && styles.statusReview,
                                                        record.status === 'Pending' && styles.statusPending,
                                                        record.status === 'Rejected' && styles.statusRejected,
                                                    ]}>
                                                        <Text style={[
                                                            styles.statusText,
                                                            record.status === 'Completed' && { color: '#065F46' },
                                                            record.status === 'Under Review' && { color: '#92400E' },
                                                            record.status === 'Pending' && { color: '#374151' },
                                                            record.status === 'Rejected' && { color: '#991B1B' },
                                                        ]}>{record.status}</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    style={{ width: 80, alignItems: 'center' }}
                                                    onPress={() => record.proofUri ? setSelectedProof(record.proofUri) : Alert.alert('Notice', 'No proof image available for this record.')}
                                                >
                                                    <Eye size={18} color="#3B82F6" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </View>
                            </ScrollView>

                            {/* Pagination */}
                            <View style={styles.paginationContainer}>
                                <TouchableOpacity
                                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                                    onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ArrowLeft size={16} color={currentPage === 1 ? '#9CA3AF' : '#4B5563'} />
                                </TouchableOpacity>
                                <View style={styles.activePageBtn}>
                                    <Text style={styles.activePageText}>{currentPage}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.pageBtn, currentPage * itemsPerPage >= paymentHistory.length && styles.pageBtnDisabled]}
                                    onPress={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage * itemsPerPage >= paymentHistory.length}
                                >
                                    <ArrowRightIcon size={16} color={currentPage * itemsPerPage >= paymentHistory.length ? '#9CA3AF' : '#4B5563'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </ScrollView>
            </View>

            {/* Payment Mode Selection Modal */}
            <Modal
                visible={isDropdownVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDropdownVisible(false)}
                >
                    <View style={styles.dropdownMenu}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Select Payment Mode</Text>
                            <TouchableOpacity onPress={() => setIsDropdownVisible(false)}>
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        {paymentModes.map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[styles.dropdownItem, paymentMode === mode && styles.dropdownItemActive]}
                                onPress={() => {
                                    setPaymentMode(mode);
                                    setIsDropdownVisible(false);
                                }}
                            >
                                <Text style={[styles.dropdownItemText, paymentMode === mode && styles.dropdownItemTextActive]}>{mode}</Text>
                                {paymentMode === mode && <Check size={18} color="#003049" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {/* Custom Time Picker Modal */}
            <Modal
                visible={showTimePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowTimePicker(false)}
                >
                    <View style={styles.timePickerContainer}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Set Time (IST)</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.timePickerWheelContainer}>
                            {/* Hours */}
                            <ScrollView style={styles.timeWheel} showsVerticalScrollIndicator={false}>
                                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                                    <TouchableOpacity
                                        key={h}
                                        style={[styles.timeWheelItem, timeHours === h && styles.timeWheelItemActive]}
                                        onPress={() => setTimeHours(h)}
                                    >
                                        <Text style={[styles.timeWheelText, timeHours === h && styles.timeWheelTextActive]}>{h}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.timeSeparator}>:</Text>

                            {/* Minutes */}
                            <ScrollView style={styles.timeWheel} showsVerticalScrollIndicator={false}>
                                {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[styles.timeWheelItem, timeMinutes === m && styles.timeWheelItemActive]}
                                        onPress={() => setTimeMinutes(m)}
                                    >
                                        <Text style={[styles.timeWheelText, timeMinutes === m && styles.timeWheelTextActive]}>{m}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Period */}
                            <View style={styles.periodColumn}>
                                {['AM', 'PM'].map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[styles.periodBtn, timePeriod === p && styles.periodBtnActive]}
                                        onPress={() => setTimePeriod(p)}
                                    >
                                        <Text style={[styles.periodText, timePeriod === p && styles.periodTextActive]}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.setBtn}
                            onPress={() => setShowTimePicker(false)}
                        >
                            <Text style={styles.setBtnText}>Set Time</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* Proof Modal */}
            <Modal
                visible={!!selectedProof}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedProof(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedProof(null)}
                >
                    <View style={styles.proofModalContainer}>
                        <View style={styles.dropdownHeader}>
                            <View style={styles.proofHeaderInfo}>
                                <CreditCard size={20} color="#003049" />
                                <Text style={styles.dropdownTitle}>Payment Proof</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedProof(null)}>
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.proofImageContainer}>
                            {selectedProof && (
                                <Image
                                    source={{ uri: selectedProof }}
                                    style={styles.proofImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        flexWrap: 'wrap',
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#003049',
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    layoutRow: {
        flex: 1,
    },
    leftColumn: {
        flex: 1,
        gap: 24,
    },
    rightColumn: {
        // defined inline for responsiveness
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
    },
    paymentMethodRow: {
        gap: 24,
    },
    bankTransferBox: {
        flex: 1.2,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    upiBox: {
        flex: 0.8,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    methodTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    methodInfo: {
        flex: 1,
    },
    methodSubLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#6B7280',
        letterSpacing: 0.5,
    },
    methodLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#003049',
    },
    detailItem: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 4,
    },
    detailValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        flex: 1,
        marginRight: 8,
    },
    copyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    copyFeedback: {
        position: 'absolute',
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        gap: 4,
    },
    copyFeedbackText: {
        fontSize: 10,
        color: '#059669',
        fontWeight: '700',
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrPlaceholder: {
        width: 180,
        height: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        elevation: 1,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    qrInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    qrImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    peLogoOverlay: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    peLogoText: {
        color: '#6739B7',
        fontSize: 18,
        fontWeight: 'bold',
    },
    qrHint: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    formSection: {
        gap: 10,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginTop: 12,
        marginBottom: 8,
    },
    formRow: {
        gap: 16,
    },
    inputGroup: {
        flex: 1,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B5563',
        marginBottom: 8,
    },
    input: {
        height: 48,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 16,
        color: '#1F2937',
        fontSize: 14,
    },
    amountInputWrapper: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingLeft: 16,
    },
    currencySymbol: {
        marginRight: 8,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    inputWithIcon: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 10,
    },
    nestedInput: {
        flex: 1,
        color: '#1F2937',
        fontSize: 14,
        padding: 0,
    },
    errorInput: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600',
    },
    selectTrigger: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 16,
    },
    selectText: {
        fontSize: 14,
        color: '#1F2937',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    uploadZone: {
        height: 140,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    uploadIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 1,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },

    uploadSubs: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    submitBtn: {
        backgroundColor: '#003049',
        flexDirection: 'row',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        elevation: 2,
    },
    submitBtnDisabled: {
        backgroundColor: '#6B7280',
        elevation: 0,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    btnIcon: {
        marginLeft: 10,
    },
    instructionsContainer: {
        gap: 24,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    instructionBar: {
        width: 4,
        height: 20,
        borderRadius: 2,
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#374151',
    },
    instructionItem: {
        flexDirection: 'row',
        gap: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#003049',
        marginTop: 8,
    },
    instructionContent: {
        flex: 1,
    },
    instructionLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    instructionText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
    },
    boldText: {
        fontWeight: '800',
        color: '#374151',
    },
    helpSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    helpTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 0.5,
    },
    helpContact: {
        fontSize: 13,
        color: '#4B5563',
        marginTop: 4,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownMenu: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        elevation: 5,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginBottom: 8,
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2937',
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    dropdownItemActive: {
        backgroundColor: '#F0F9FF',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
    },
    dropdownItemTextActive: {
        color: '#003049',
        fontWeight: '800',
    },
    uploadZoneActive: {
        borderColor: '#059669',
        backgroundColor: '#F0FDF4',
        borderStyle: 'solid',
    },
    timePickerContainer: {
        width: '100%',
        maxWidth: 350,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 10,
    },
    timePickerWheelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        gap: 12,
        marginVertical: 16,
    },
    timeWheel: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    timeWheelItem: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeWheelItemActive: {
        backgroundColor: '#003049',
    },
    timeWheelText: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '600',
    },
    timeWheelTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    timeSeparator: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
    },
    periodColumn: {
        width: 60,
        gap: 8,
    },
    periodBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    periodBtnActive: {
        backgroundColor: '#3B82F6',
    },
    periodText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4B5563',
    },
    periodTextActive: {
        color: '#FFFFFF',
    },
    setBtn: {
        backgroundColor: '#003049',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    setBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    // Payment History Styles
    historyToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
        width: '100%',
    },
    filtersWrapper: {
        width: '100%',
    },
    filterChipsContainer: {
        paddingVertical: 4,
        gap: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    filterChipLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    chipCount: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    chipCountText: {
        fontSize: 10,
        fontWeight: '800',
    },
    searchContainer: {
        flex: 1,
        minWidth: 250,
        maxWidth: 350,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginLeft: 8,
    },
    historySearchInput: {
        flex: 1,
        fontSize: 13,
        color: '#1F2937',
        padding: 0,
    },
    entriesInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    entriesInfoText: {
        fontSize: 13,
        color: '#6B7280',
    },
    itemsPerPageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    smallSelect: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    smallSelectText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '600',
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 12,
    },
    tableHeaderCell: {
        fontSize: 11,
        fontWeight: '800',
        color: '#1F2937',
        letterSpacing: 0.5,
        paddingHorizontal: 16,
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
        paddingVertical: 12,
    },
    tableCellText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '600',
        paddingHorizontal: 16,
    },
    tableCellSubText: {
        fontSize: 11,
        color: '#9CA3AF',
        paddingHorizontal: 16,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        minWidth: 90,
        alignItems: 'center',
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    statusCompleted: {
        backgroundColor: '#ECFDF5',
        borderColor: '#10B981',
    },
    statusReview: {
        backgroundColor: '#FFFBEB',
        borderColor: '#F59E0B',
    },
    statusPending: {
        backgroundColor: '#F9FAFB',
        borderColor: '#6B7280',
    },
    statusRejected: {
        backgroundColor: '#FEF2F2',
        borderColor: '#EF4444',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
    },
    pageBtn: {
        width: 32,
        height: 32,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    pageBtnDisabled: {
        backgroundColor: '#F9FAFB',
        borderColor: '#F3F4F6',
    },
    activePageBtn: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#003049',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activePageText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    proofModalContainer: {
        width: '90%',
        maxWidth: 800,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        maxHeight: '80%',
    },
    proofHeaderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    proofImageContainer: {
        width: '100%',
        height: 400,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginTop: 16,
        overflow: 'hidden',
    },
    proofImage: {
        width: '100%',
        height: '100%',
    },

});
