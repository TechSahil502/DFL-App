import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    TextInput,
    Alert,
    useWindowDimensions,
    Animated,
} from 'react-native';
import {
    Search,
    ChevronDown,
    Trash2,
    ArrowRight,
    Package,
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DraftsStore, DraftRecord } from '../store/draftsStore';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

export const DraftsScreen = ({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [drafts, setDrafts] = useState<DraftRecord[]>([]);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setDrafts(DraftsStore.getAll());

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        const unsub = DraftsStore.subscribe(() => {
            setDrafts(DraftsStore.getAll());
        });
        return unsub;
    }, []);

    const filteredDrafts = drafts.filter(d =>
        d.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.shipperName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.consigneeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteDraft = (id: string) => {
        Alert.alert(
            "Delete Draft",
            "Are you sure you want to delete this draft?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => DraftsStore.remove(id) }
            ]
        );
    };

    const handleLoadDraft = (draft: DraftRecord) => {
        DraftsStore.setDraftToLoad(draft);
        onNavigate('Book Shipment');
    };

    const formatDate = (isoDate: string) => {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
            '\n' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const renderPagination = () => (
        <View style={styles.pagination}>
            <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>{'<'}</Text></TouchableOpacity>
            <View style={[styles.pageBtn, styles.activePageBtn]}>
                <Text style={styles.activePageText}>1</Text>
            </View>
            <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>{'>'}</Text></TouchableOpacity>
        </View>
    );

    const renderTable = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} persistentScrollbar={true}>
            <View style={styles.table}>
                {/* Table Header - Always visible */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerText, { width: 160 }]}>DRAFT ID</Text>
                    <Text style={[styles.headerText, { width: 180 }]}>SHIPPER</Text>
                    <Text style={[styles.headerText, { width: 180 }]}>CONSIGNEE</Text>
                    <Text style={[styles.headerText, { width: 220 }]}>ROUTE</Text>
                    <Text style={[styles.headerText, { width: 140 }]}>DETAILS</Text>
                    <Text style={[styles.headerText, { width: 130 }]}>EST. AMOUNT</Text>
                    <Text style={[styles.headerText, { width: 150 }]}>DATE</Text>
                    <Text style={[styles.headerText, { width: 100, textAlign: 'center' }]}>ACTION</Text>
                </View>

                {/* Table Rows */}
                {filteredDrafts.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        style={[
                            styles.tableRow,
                            index % 2 === 1 && { backgroundColor: '#F8FAFC' },
                            { opacity: fadeAnim }
                        ]}
                    >
                        <View style={[styles.cell, { width: 160, flexDirection: 'row', alignItems: 'center' }]}>
                            <View style={styles.draftIconBg}>
                                <Package size={14} color="#E53E3E" />
                            </View>
                            <Text style={[styles.cellText, { color: '#E53E3E', fontWeight: 'bold' }]}>{item.displayId}</Text>
                        </View>
                        <View style={[styles.cell, { width: 180 }]}>
                            <Text style={styles.cellTextPrimary}>{item.shipperName}</Text>
                            {item.shipperData.company ? <Text style={styles.cellTextSecondary}>{item.shipperData.company}</Text> : null}
                        </View>
                        <View style={[styles.cell, { width: 180 }]}>
                            <Text style={styles.cellTextPrimary}>{item.consigneeName}</Text>
                            {item.consigneeData.company ? <Text style={styles.cellTextSecondary}>{item.consigneeData.company}</Text> : null}
                        </View>
                        <Text style={[styles.cellText, { width: 220 }]}>{item.origin} → {item.destination}</Text>
                        <Text style={[styles.cellText, { width: 140 }]}>{item.details}</Text>
                        <Text style={[styles.cellText, { width: 130 }]}>{item.estAmount.includes('0.00') ? '-' : item.estAmount}</Text>
                        <Text style={[styles.cellText, { width: 150, fontSize: 11 }]}>{formatDate(item.savedAt)}</Text>
                        <View style={[styles.cell, { width: 100, flexDirection: 'row', justifyContent: 'center', gap: 15 }]}>
                            <TouchableOpacity onPress={() => handleDeleteDraft(item.id)}>
                                <Trash2 size={16} color="#94A3B8" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleLoadDraft(item)}>
                                <ArrowRight size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                ))}

                {filteredDrafts.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Package size={48} color="#CBD5E0" strokeWidth={1} />
                        </View>
                        <Text style={styles.emptyStateTitle}>No Drafts Found</Text>
                        <Text style={styles.emptyStateSub}>Your saved shipments will appear in the table structure above.</Text>
                        <TouchableOpacity
                            style={styles.emptyActionBtn}
                            onPress={() => onNavigate('Book Shipment')}
                        >
                            <Text style={styles.emptyActionText}>Start New Booking</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );

    return (
        <View style={[styles.container, { paddingTop: STATUSBAR_HEIGHT }]}>
            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="Drafts"
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
                        <Animated.View
                            style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}
                        >
                            <View style={[styles.pageHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                                <View>
                                    <Text style={styles.pageTitle}>Saved Drafts</Text>
                                    <Text style={styles.pageSubtitle}>Pick up where you left off</Text>
                                </View>
                                <View style={[styles.headerActions, isMobile && { width: '100%' }]}>
                                    <View style={[styles.searchBox, isMobile && { width: '100%' }]}>
                                        <Search size={14} color="#94A3B8" />
                                        <TextInput
                                            placeholder="Search drafts..."
                                            style={styles.searchInput}
                                            placeholderTextColor="#94A3B8"
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </View>
                                    <View style={styles.draftCountBadge}>
                                        <Text style={styles.draftCountText}>{drafts.length} DRAFTS</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.tableCard}>
                                <View style={[styles.tableTop, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                                    <View style={[styles.tableInfoRow, isMobile && { width: '100%', justifyContent: 'space-between' }]}>
                                        <Text style={styles.tableInfo}>Showing 1 to {filteredDrafts.length} of {drafts.length} entries</Text>
                                        <View style={styles.perPageRow}>
                                            <Text style={styles.perPageText}>Items per page:</Text>
                                            <View style={styles.perPageSelect}>
                                                <Text style={styles.perPageValue}>10</Text>
                                                <ChevronDown size={14} color="#64748B" />
                                            </View>
                                        </View>
                                    </View>
                                    {!isMobile && renderPagination()}
                                </View>

                                {renderTable()}

                                <View style={[styles.tableBottom, isMobile && { flexDirection: 'column', gap: 16 }]}>
                                    <Text style={styles.tableInfo}>Showing 1 to {filteredDrafts.length} of {drafts.length} entries</Text>
                                    {renderPagination()}
                                </View>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </View>
            </View>
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
    draftCountBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    draftCountText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
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
    tableInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
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
        minWidth: 1100,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#F8FAFC',
    },
    headerText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
        letterSpacing: 0.5,
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
    draftIconBg: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cellText: {
        fontSize: 13,
        color: '#334155',
    },
    cellTextPrimary: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
    },
    cellTextSecondary: {
        fontSize: 11,
        color: '#64748B',
    },
    emptyState: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F7FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#2D3748',
        marginBottom: 8,
    },
    emptyStateSub: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 24,
        textAlign: 'center',
    },
    emptyActionBtn: {
        backgroundColor: '#003049',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    emptyActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
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
});
