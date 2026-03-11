import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar,
    Animated,
    Easing,
    useWindowDimensions,
    Linking,
    Alert
} from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import {
    LayoutDashboard,
    Download,
    FileSpreadsheet,
    UploadCloud,
    Search,
    ChevronRight,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    ExternalLink
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

interface UploadRecord {
    id: string;
    orderId: string;
    fileName: string;
    size: string;
    status: 'Pending' | 'Success' | 'Failed';
    date: string;
}

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            })
        ]).start();
    }, [delay]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

export const BulkOrdersScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
    const { width } = useWindowDimensions();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'New' | 'History'>('New');
    const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
    const isMobile = width < 768;

    const handleFileUpload = async () => {
        try {
            const results = await pick({
                type: [types.csv, types.xls, types.xlsx],
            });

            if (!results || results.length === 0) return;
            const file = results[0];
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB

            // Log for debugging
            console.log('Selected file:', file.name, file.size, file.type);

            // Validation: File Type
            const extension = file.name?.split('.').pop()?.toLowerCase();
            if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
                Alert.alert("Invalid File Type", "Please select a .csv or .xlsx file.");
                return;
            }

            // Validation: File Size
            if (file.size && file.size > MAX_SIZE) {
                Alert.alert("File Too Large", "The selected file exceeds the 5MB size limit. Please upload a smaller file.");
                return;
            }

            const newRecord: UploadRecord = {
                id: Date.now().toString(),
                orderId: `BLK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${new Date().getDate()}-${Math.floor(1000 + Math.random() * 9000)}`,
                fileName: file.name || 'bulk_order_upload.csv',
                size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A',
                status: 'Pending',
                date: new Date().toLocaleString()
            };

            setUploadHistory(prev => [newRecord, ...prev]);
            Alert.alert("Upload Successful", "Your bulk order file has been uploaded and is being processed.");
            setActiveTab('History');
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled the picker
            } else {
                Alert.alert("Error", "An error occurred while picking the file.");
                console.error(err);
            }
        }
    };

    const handleDownloadTemplate = () => {
        const csvHeader = "invoice_no,invoice_date,order_reference,service,package_weight,package_length,package_breadth,package_height,currency_code,csb5_status,customer_shipping_firstname,customer_shipping_lastname,customer_shipping_mobile,customer_shipping_email,customer_shipping_company,customer_shipping_address,customer_shipping_address_2,customer_shipping_address_3,customer_shipping_city,customer_shipping_postcode,customer_shipping_country_code,customer_shipping_state,vendor_order_item_name,vendor_order_item_sku,vendor_order_item_quantity,vendor_order_item_unit_price,vendor_order_item_hsn,vendor_order_item_tax_rate,ioss_number,csbv5_limit_comfirmation";
        const csvSampleRow = "\nINV2201254,08-08-2022,404-548-458,DFL EXPRESS - Economy,0.5,10,10,10,INR,1,John,Doe,19999999999,johndoe@gmail.com,,218W,37th Street,,New York,10001,US,NY,Cotton T-Shirts,CS123,5,499,63079099,5,,1";
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvHeader + csvSampleRow);

        Linking.openURL(csvContent).catch(() => {
            Alert.alert("Download Template", "Downloading template...");
        });
    };

    const renderNewUpload = () => (
        <View style={styles.newUploadContainer}>
            <View style={styles.gridRow}>
                <View style={styles.columnLeft}>
                    {/* Step 1: Prepare Data */}
                    <AnimatedSection delay={0}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepText}>1</Text>
                                </View>
                                <Text style={styles.cardTitle}>Prepare Data</Text>
                                <FileSpreadsheet size={24} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
                            </View>
                            <Text style={styles.cardDescription}>
                                Download our standardized CSV template. It contains all the necessary fields and instructions for a successful import.
                            </Text>
                            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadTemplate}>
                                <Download size={18} color={Colors.white} />
                                <Text style={styles.downloadBtnText}>Download Template</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedSection>

                    {/* Step 2: Fill Details */}
                    <AnimatedSection delay={150}>
                        <View style={[styles.card, { marginTop: 20 }]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepText}>2</Text>
                                </View>
                                <Text style={styles.cardTitle}>Fill Details</Text>
                            </View>
                            <View style={styles.instructionRow}>
                                <CheckCircle2 size={16} color={Colors.cardGreen} />
                                <Text style={styles.instructionText}>Fill in the order details strictly following the format.</Text>
                            </View>
                            <View style={styles.instructionRow}>
                                <CheckCircle2 size={16} color={Colors.cardGreen} />
                                <Text style={styles.instructionText}>Do not modify the header rows.</Text>
                            </View>
                            <View style={styles.instructionRow}>
                                <CheckCircle2 size={16} color={Colors.cardGreen} />
                                <Text style={styles.instructionText}>Remove any empty rows before saving.</Text>
                            </View>
                        </View>
                    </AnimatedSection>
                </View>

                {/* Step 3: Upload & Import */}
                <View style={[styles.columnRight, isMobile && { minWidth: '100%', marginTop: 20 }]}>
                    <AnimatedSection delay={300}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepText}>3</Text>
                                </View>
                                <Text style={styles.cardTitle}>Upload & Import</Text>
                            </View>
                            <View style={[styles.dropZone, { padding: isMobile ? 20 : 40 }]}>
                                <View style={styles.uploadIconBg}>
                                    <UploadCloud size={48} color="#003049" />
                                </View>
                                <Text style={styles.dropZoneTitle}>Drag & Drop your CSV file here</Text>
                                <Text style={styles.dropZoneSub}>or click below to browse from your computer</Text>
                                <TouchableOpacity style={styles.browseBtn} onPress={handleFileUpload}>
                                    <Text style={styles.browseBtnText}>Browse Files</Text>
                                </TouchableOpacity>
                                <Text style={styles.supportedFormats}>Supported formats: .CSV, .XLSX (Max 5MB)</Text>
                            </View>
                        </View>
                    </AnimatedSection>
                </View>
            </View>
        </View>
    );

    const renderHistory = () => (
        <AnimatedSection delay={0}>
            <View style={styles.card}>
                <View style={[styles.cardHeader, { flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }]}>
                    <View>
                        <Text style={styles.cardTitle}>Upload History</Text>
                        <Text style={styles.cardSub}>Your recent bulk file uploads</Text>
                    </View>
                    <View style={[styles.searchBox, isMobile && { marginLeft: 0, width: '100%' }]}>
                        <Search size={16} color={Colors.textSecondary} />
                        <Text style={styles.searchText}>Search uploads...</Text>
                    </View>
                </View>

                {uploadHistory.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.headerCell, { width: 180 }]}>Date</Text>
                                <Text style={[styles.headerCell, { width: 180 }]}>Order ID</Text>
                                <Text style={[styles.headerCell, { width: 220 }]}>File Name</Text>
                                <Text style={[styles.headerCell, { width: 100 }]}>Size</Text>
                                <Text style={[styles.headerCell, { width: 100 }]}>Status</Text>
                            </View>
                            {uploadHistory.map((item, index) => (
                                <View key={item.id} style={[styles.tableRow, index === uploadHistory.length - 1 && { borderBottomWidth: 0 }]}>
                                    <Text style={[styles.cell, { width: 180 }]}>{item.date}</Text>
                                    <Text style={[styles.cell, { width: 180, color: item.orderId !== '-' ? '#0984e3' : Colors.text, fontWeight: '700' }]}>{item.orderId}</Text>
                                    <Text style={[styles.cell, { width: 220 }]}>{item.fileName}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{item.size}</Text>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: item.status === 'Failed' ? '#FEE2E2' : item.status === 'Pending' ? '#FEF3C7' : '#DCFCE7',
                                        width: 100
                                    }]}>
                                        <View style={[styles.statusDot, { backgroundColor: item.status === 'Failed' ? '#EF4444' : item.status === 'Pending' ? '#F59E0B' : '#10B981' }]} />
                                        <Text style={[styles.statusText, { color: item.status === 'Failed' ? '#991B1B' : item.status === 'Pending' ? '#92400E' : '#065F46' }]}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.emptyHistoryState}>
                        <Clock size={48} color={Colors.textSecondary} style={{ opacity: 0.2 }} />
                        <Text style={styles.emptyHistoryText}>No history available yet.</Text>
                        <Text style={styles.emptyHistorySub}>Upload your first file to see history</Text>
                        <TouchableOpacity style={styles.startUploadBtn} onPress={() => setActiveTab('New')}>
                            <Text style={styles.startUploadBtnText}>Start New Upload</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </AnimatedSection>
    );

    return (
        <View style={styles.container}>
            <View style={{ width: isMobile ? 56 : 72 }} />
            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="Bulk Orders"
                onNavigate={onNavigate}
            />

            <View style={styles.mainContent}>
                <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.topHeader}>
                        <View>
                            <Text style={styles.title}>Bulk Order Import</Text>
                            <Text style={styles.subtitle}>Efficiently manage multiple shipments by importing them in bulk</Text>
                        </View>
                        <View style={styles.tabSwitcher}>
                            <TouchableOpacity
                                style={[styles.tabBtn, activeTab === 'New' && styles.activeTabBtn]}
                                onPress={() => setActiveTab('New')}
                            >
                                <Text style={[styles.tabBtnText, activeTab === 'New' && styles.activeTabBtnText]}>New Upload</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabBtn, activeTab === 'History' && styles.activeTabBtn]}
                                onPress={() => setActiveTab('History')}
                            >
                                <Text style={[styles.tabBtnText, activeTab === 'History' && styles.activeTabBtnText]}>Upload History</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {activeTab === 'New' ? renderNewUpload() : renderHistory()}
                </ScrollView>
            </View>
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
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    tabSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        padding: 4,
    },
    tabBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    activeTabBtn: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    activeTabBtnText: {
        color: '#1F2937',
    },
    newUploadContainer: {
        flex: 1,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 20,
        flexWrap: 'wrap',
    },
    columnLeft: {
        flex: 1,
        minWidth: 320,
    },
    columnRight: {
        flex: 1.5,
        minWidth: 400,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 4,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepText: {
        color: '#2563EB',
        fontWeight: '800',
        fontSize: 14,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
    },
    cardSub: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    cardDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 20,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#003049',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 10,
        alignSelf: 'flex-start',
    },
    downloadBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    instructionText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    dropZone: {
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        minHeight: 280,
    },
    uploadIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dropZoneTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    dropZoneSub: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    browseBtn: {
        backgroundColor: '#003049',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginBottom: 16,
    },
    browseBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    supportedFormats: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    searchBox: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
    },
    headerCell: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B5563',
        paddingHorizontal: 15,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingVertical: 16,
        alignItems: 'center',
    },
    cell: {
        fontSize: 13,
        color: '#374151',
        paddingHorizontal: 15,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
        marginLeft: 15,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    emptyHistoryState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyHistoryText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 16,
    },
    emptyHistorySub: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        marginBottom: 24,
    },
    startUploadBtn: {
        backgroundColor: '#003049',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    startUploadBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
});
