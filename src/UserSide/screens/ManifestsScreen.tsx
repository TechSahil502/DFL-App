import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    TextInput,
    Modal,
    Pressable,
    Alert,
    useWindowDimensions,
} from 'react-native';
import {
    Search,
    Plus,
    Filter,
    Download,
    Eye,
    ChevronDown,
    X,
    Printer,
    FileText,
    Check,
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

interface ManifestRecord {
    id: string;
    code: string;
    date: string;
    pickupAddress: string;
    packets: number;
    value: string;
    status: 'Generated' | 'Pending';
}

const DUMMY_MANIFESTS: ManifestRecord[] = [
    { id: '1', code: 'MAN-20260223-8071', date: '2/23/2026', pickupAddress: 'f-35/2 centre wali gali katwaria sar...', packets: 1, value: '0.00', status: 'Generated' },
    { id: '2', code: 'MAN-20260117-3178', date: '1/17/2026', pickupAddress: '123 Mock St', packets: 1, value: '0.00', status: 'Generated' },
    { id: '3', code: 'MAN-1766301499567', date: '12/21/2025', pickupAddress: 'Noida, sector 132', packets: 1, value: '0.00', status: 'Generated' },
    { id: '4', code: 'MAN-1766300229863', date: '12/21/2025', pickupAddress: 'f-35/2 Centre wali gali', packets: 1, value: '0.00', status: 'Generated' },
    { id: '5', code: 'MAN-1766300117387', date: '12/21/2025', pickupAddress: 'F-35/2 Centre wali gali katwaria sarai', packets: 1, value: '0.00', status: 'Generated' },
];

export const ManifestsScreen = ({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedManifest, setSelectedManifest] = useState<ManifestRecord | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedManifestIds, setSelectedManifestIds] = useState<string[]>([]);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const toggleSelect = (id: string) => {
        setSelectedManifestIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedManifestIds.length === filteredManifests.length) {
            setSelectedManifestIds([]);
        } else {
            setSelectedManifestIds(filteredManifests.map(m => m.id));
        }
    };

    // Filtered manifests based on search query
    const filteredManifests = DUMMY_MANIFESTS.filter(m =>
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get unique pickup addresses for the dropdown
    const pickupAddresses = Array.from(new Set(DUMMY_MANIFESTS.map(m => m.pickupAddress)));

    const renderTable = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} persistentScrollbar={true}>
            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <View style={[styles.headerCell, { width: 40, alignItems: 'center' }]}>
                        <TouchableOpacity
                            style={[styles.checkbox, selectedManifestIds.length === filteredManifests.length && filteredManifests.length > 0 && styles.checkboxSelected]}
                            onPress={toggleSelectAll}
                        >
                            {selectedManifestIds.length === filteredManifests.length && filteredManifests.length > 0 && <Check size={12} color="#FFFFFF" />}
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.headerText, { width: 220 }]}>MANIFEST CODE</Text>
                    <Text style={[styles.headerText, { width: 120 }]}>DATE</Text>
                    <Text style={[styles.headerText, { width: 300 }]}>PICKUP ADDRESS</Text>
                    <Text style={[styles.headerText, { width: 100, textAlign: 'center' }]}>PACKETS</Text>
                    <Text style={[styles.headerText, { width: 100, textAlign: 'center' }]}>VALUE</Text>
                    <Text style={[styles.headerText, { width: 120, textAlign: 'center' }]}>STATUS</Text>
                    <Text style={[styles.headerText, { width: 80, textAlign: 'center' }]}>ACTION</Text>
                </View>

                {/* Table Rows */}
                {filteredManifests.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.tableRow, index % 2 === 1 && { backgroundColor: '#F8FAFC' }]}
                        onPress={() => {
                            setSelectedManifest(item);
                            setShowDetailsModal(true);
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.cell, { width: 40, alignItems: 'center' }]}>
                            <TouchableOpacity
                                style={[styles.checkbox, selectedManifestIds.includes(item.id) && styles.checkboxSelected]}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleSelect(item.id);
                                }}
                            >
                                {selectedManifestIds.includes(item.id) && <Check size={12} color="#FFFFFF" />}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.cellText, { width: 220, color: '#003049', fontWeight: 'bold' }]}>{item.code}</Text>
                        <Text style={[styles.cellText, { width: 120 }]}>{item.date}</Text>
                        <Text style={[styles.cellText, { width: 300 }]} numberOfLines={1}>{item.pickupAddress}</Text>
                        <Text style={[styles.cellText, { width: 100, textAlign: 'center' }]}>{item.packets}</Text>
                        <Text style={[styles.cellText, { width: 100, textAlign: 'center' }]}>{item.value}</Text>
                        <View style={[styles.cell, { width: 120, alignItems: 'center' }]}>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusBadgeText}>Generated</Text>
                            </View>
                        </View>
                        <View style={[styles.cell, { width: 80, alignItems: 'center' }]}>
                            <TouchableOpacity
                                style={styles.viewBtn}
                                onPress={() => {
                                    setSelectedManifest(item);
                                    setShowDetailsModal(true);
                                }}
                            >
                                <Eye size={14} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    return (
        <View style={[styles.container, { paddingTop: STATUSBAR_HEIGHT }]}>
            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="Manifests"
                onNavigate={onNavigate}
            />
            <View style={styles.mainWrapper}>
                <View style={{ width: 72 }} />
                <View style={{ flex: 1 }}>
                    <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />

                    <ScrollView
                        style={styles.contentArea}
                        contentContainerStyle={{ paddingBottom: 50 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.pageHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                            <View>
                                <Text style={styles.pageTitle}>Manifests</Text>
                                <Text style={styles.pageSubtitle}>Generate and manage your shipping manifests</Text>
                            </View>
                            <View style={[styles.headerActions, isMobile && { width: '100%', flexWrap: 'wrap', justifyContent: 'flex-start' }]}>
                                <View style={[styles.searchBox, isMobile && { width: '100%' }]}>
                                    <Search size={14} color="#94A3B8" />
                                    <TextInput
                                        placeholder="Search manifests"
                                        style={styles.searchInput}
                                        placeholderTextColor="#94A3B8"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10, width: isMobile ? '100%' : 'auto', zIndex: 100 }}>
                                    <View>
                                        <TouchableOpacity
                                            style={[styles.exportBtn, isMobile && { flex: 1 }]}
                                            onPress={() => setShowExportMenu(!showExportMenu)}
                                        >
                                            <Download size={16} color="#475569" />
                                            <Text style={styles.exportBtnText}>Export</Text>
                                        </TouchableOpacity>

                                        {showExportMenu && (
                                            <View style={styles.exportMenu}>
                                                <TouchableOpacity style={styles.exportMenuItem} onPress={() => { Alert.alert('Export', 'Exporting as XLSX...'); setShowExportMenu(false); }}>
                                                    <Text style={styles.exportMenuText}>Export as XLSX</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.exportMenuItem} onPress={() => { Alert.alert('Export', 'Exporting as CSV...'); setShowExportMenu(false); }}>
                                                    <Text style={styles.exportMenuText}>Export as CSV</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.exportMenuItem, { borderBottomWidth: 0 }]} onPress={() => { Alert.alert('Export', 'Exporting as PDF...'); setShowExportMenu(false); }}>
                                                    <Text style={styles.exportMenuText}>Export as PDF</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.createBtn, isMobile && { flex: 1.5 }]}
                                        onPress={() => setShowCreateModal(true)}
                                    >
                                        <Plus size={16} color="#FFFFFF" />
                                        <Text style={styles.createBtnText}>Create Manifest</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.filterRow}>
                            <View style={styles.tabScroll}>
                                <View style={[styles.tab, styles.activeTab]}>
                                    <Text style={[styles.tabText, styles.activeTabText]}>All</Text>
                                    <View style={styles.tabBadge}>
                                        <Text style={styles.tabBadgeText}>5</Text>
                                    </View>
                                </View>
                                <View style={styles.tab}>
                                    <Text style={styles.tabText}>Generated</Text>
                                    <View style={[styles.tabBadge, { backgroundColor: '#E2E8F0' }]}>
                                        <Text style={[styles.tabBadgeText, { color: '#64748B' }]}>5</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tableCard}>
                            <View style={[styles.tableTop, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
                                <Text style={styles.tableInfo}>Showing 1 to 5 of 5 entries</Text>
                                <View style={styles.perPageRow}>
                                    <Text style={styles.perPageText}>Items per page:</Text>
                                    <View style={styles.perPageSelect}>
                                        <Text style={styles.perPageValue}>10</Text>
                                        <ChevronDown size={14} color="#64748B" />
                                    </View>
                                </View>
                            </View>

                            {renderTable()}

                            <View style={[styles.tableBottom, isMobile && { flexDirection: 'column', gap: 16 }]}>
                                <Text style={styles.tableInfo}>Showing 1 to 5 of 5 entries</Text>
                                <View style={styles.pagination}>
                                    <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>{'<'}</Text></TouchableOpacity>
                                    <View style={[styles.pageBtn, styles.activePageBtn]}>
                                        <Text style={styles.activePageText}>1</Text>
                                    </View>
                                    <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>{'>'}</Text></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Create Manifest Modal */}
            <Modal
                visible={showCreateModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setShowCreateModal(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Manifest</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Select Pickup Address <Text style={{ color: 'red' }}>*</Text></Text>
                            <TouchableOpacity
                                style={styles.dropdownTrigger}
                                onPress={() => setShowDropdown(!showDropdown)}
                            >
                                <Text style={styles.dropdownValue}>
                                    {selectedAddress || 'Select an address...'}
                                </Text>
                                <ChevronDown size={18} color="#64748B" />
                            </TouchableOpacity>

                            {showDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <ScrollView nestedScrollEnabled={true}>
                                        {pickupAddresses.map((addr, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setSelectedAddress(addr);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{addr}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.generateBtn, !selectedAddress && styles.generateBtnDisabled]}
                                disabled={!selectedAddress}
                                onPress={() => {
                                    Alert.alert('Success', 'Manifest Generated Successfully!');
                                    setShowCreateModal(false);
                                }}
                            >
                                <Text style={styles.generateBtnText}>Generate Manifest</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Manifest Details Modal */}
            <Modal
                visible={showDetailsModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setShowDetailsModal(false)} />
                    <View style={[styles.modalContent, { maxWidth: isMobile ? '95%' : 700 }]}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={styles.modalIconBg}>
                                    <FileText size={20} color="#10B981" />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>Manifest Details</Text>
                                    <Text style={styles.modalSubtitle}>{selectedManifest?.code}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.detailsModalBody}>
                            <Text style={styles.sectionHeading}>Included Shipments</Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={true} persistentScrollbar={true}>
                                <View style={styles.detailTable}>
                                    <View style={styles.detailTableHeader}>
                                        <Text style={[styles.detailHeaderText, { width: 150 }]}>AWB</Text>
                                        <Text style={[styles.detailHeaderText, { width: 100 }]}>DATE</Text>
                                        <Text style={[styles.detailHeaderText, { width: 150 }]}>CONSIGNEE</Text>
                                        <Text style={[styles.detailHeaderText, { width: 220 }]}>DESTINATION</Text>
                                    </View>
                                    <View style={styles.detailTableRow}>
                                        <Text style={[styles.detailCellText, { width: 150, color: '#3182CE', fontWeight: '800' }]}>DFL66267123</Text>
                                        <Text style={[styles.detailCellText, { width: 100 }]}>2/3/2026</Text>
                                        <Text style={[styles.detailCellText, { width: 150 }]}>Sahil Dhiman</Text>
                                        <Text style={[styles.detailCellText, { width: 220 }]}>San Jose, United States</Text>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.printBtn}>
                                    <Printer size={16} color="#475569" />
                                    <Text style={styles.printBtnText}>Print</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.closeModalBtn}
                                    onPress={() => setShowDetailsModal(false)}
                                >
                                    <Text style={styles.closeModalBtnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
        padding: 16,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    headerActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        borderRadius: 8,
        width: 240,
        height: 40,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1E293B',
    },
    exportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    exportBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        width: '80',
        textAlign: 'center',
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#003049',
        paddingHorizontal: 16,
        height: 40,
        borderRadius: 8,
        gap: 8,
    },
    createBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    filterRow: {
        marginBottom: 24,
    },
    tabScroll: {
        flexDirection: 'row',
        gap: 12,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#003049',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    tabBadge: {
        backgroundColor: '#E67E22',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
    },
    tabBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    tableCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 10,
    },
    tableTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    tableInfo: {
        fontSize: 13,
        color: '#64748B',
    },
    perPageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    perPageText: {
        fontSize: 13,
        color: '#64748B',
    },
    perPageSelect: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 6,
    },
    perPageValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    table: {
        minWidth: 1000,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#F8FAFC',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    headerCell: {
        justifyContent: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'center',
    },
    cell: {
        justifyContent: 'center',
    },
    cellText: {
        fontSize: 13,
        color: '#334155',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        borderColor: '#CBD5E0',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxSelected: {
        backgroundColor: '#003049',
        borderColor: '#003049',
    },
    statusBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#166534',
    },
    viewBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    pagination: {
        flexDirection: 'row',
        gap: 4,
    },
    pageBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activePageBtn: {
        backgroundColor: '#003049',
        borderColor: '#003049',
    },
    pageBtnText: {
        fontSize: 14,
        color: '#64748B',
    },
    activePageText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
    },
    modalBody: {
        padding: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    dropdownValue: {
        fontSize: 14,
        color: '#1E293B',
    },
    dropdownMenu: {
        maxHeight: 200,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        position: 'relative',
        top: -16,
        marginBottom: 8,
        zIndex: 10,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#475569',
    },
    generateBtn: {
        height: 48,
        backgroundColor: '#64748B', // matched to screenshot gray-blue
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    generateBtnDisabled: {
        opacity: 0.6,
    },
    generateBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    modalIconBg: {
        width: 40,
        height: 40,
        backgroundColor: '#ECFDF5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    detailsModalBody: {
        backgroundColor: '#F3F4F6',
        padding: 20,
    },
    sectionHeading: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 16,
    },
    detailTable: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    detailTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    detailHeaderText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#475569',
    },
    detailTableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    detailCellText: {
        fontSize: 13,
        color: '#1E293B',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 24,
    },
    printBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    printBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    closeModalBtn: {
        backgroundColor: '#003049',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    closeModalBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    exportMenu: {
        position: 'absolute',
        top: 45,
        left: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        width: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    exportMenuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    exportMenuText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
});
