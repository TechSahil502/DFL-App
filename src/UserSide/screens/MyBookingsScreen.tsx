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
    Modal,
    Pressable,
} from 'react-native';
import {
    Search,
    Eye,
    Package,
    MapPin,
    User,
    Layers,
    Clock,
    ChevronLeft,
    ChevronRight,
    X,
    ArrowRight,
    Box,
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BookingsStore, BookingRecord, ShipmentStatus } from '../store/bookingsStore';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const ITEMS_PER_PAGE = 10;

const STATUS_TABS: ShipmentStatus[] = [
    'Pending', 'Processing', 'In Transit', 'Out for Delivery',
    'Delivered', 'Cancelled', 'On Hold', 'Dispute',
];

const STATUS_COLORS: Record<ShipmentStatus, { bg: string; text: string; border: string }> = {
    Pending: { bg: '#FFF7ED', text: '#C05621', border: '#FDBA74' },
    Processing: { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD' },
    'In Transit': { bg: '#F0FDF4', text: '#15803D', border: '#86EFAC' },
    'Out for Delivery': { bg: '#F0FDF4', text: '#065F46', border: '#6EE7B7' },
    Delivered: { bg: '#F0FDF4', text: '#14532D', border: '#4ADE80' },
    Cancelled: { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5' },
    'On Hold': { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
    Dispute: { bg: '#FDF4FF', text: '#7E22CE', border: '#D8B4FE' },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ShipmentStatus }) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
    return (
        <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
            <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
        </View>
    );
};

// ─── Tracking Timeline ────────────────────────────────────────────────────────
const TrackingTimeline = ({ history }: { history: BookingRecord['trackingHistory'] }) => (
    <View style={styles.timelineContainer}>
        {history.map((item, idx) => (
            <View key={idx} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, idx === 0 && styles.timelineDotActive]} />
                    {idx < history.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStatus, idx === 0 && styles.timelineStatusActive]}>
                        {item.status}
                    </Text>
                    <Text style={styles.timelineDesc}>{item.description}</Text>
                    <Text style={styles.timelineDate}>{item.date}</Text>
                </View>
            </View>
        ))}
    </View>
);

// ─── Shipment Detail Modal ────────────────────────────────────────────────────
const ShipmentDetailModal = ({
    booking,
    visible,
    onClose,
}: {
    booking: BookingRecord | null;
    visible: boolean;
    onClose: () => void;
}) => {
    if (!booking) return null;

    const InfoRow = ({ label, value }: { label: string; value?: string }) =>
        value ? (
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        ) : null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <Pressable
                style={StyleSheet.absoluteFillObject}
                onPress={onClose}
            />
            <View style={styles.modalBackdrop} />

            <View style={styles.detailModal}>
                {/* Header */}
                <View style={styles.detailHeader}>
                    <View>
                        <Text style={styles.detailShipId}>#{booking.id}</Text>
                        <View style={styles.detailHeaderSub}>
                            <Text style={styles.detailCategoryTag}>{booking.category}</Text>
                            <StatusBadge status={booking.status} />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.closeIconBtn} onPress={onClose}>
                        <X size={20} color="#4A5568" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {/* Route Card */}
                    <View style={styles.routeCard}>
                        <View style={styles.routeEndpoint}>
                            <MapPin size={14} color="#718096" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.routeEndpointLabel}>FROM</Text>
                                <Text style={styles.routeEndpointCity}>{booking.shipperCity}</Text>
                                <Text style={styles.routeEndpointCountry}>{booking.shipperCountry}</Text>
                            </View>
                        </View>
                        <View style={styles.routeArrow}>
                            <View style={styles.routeArrowLine} />
                            <ArrowRight size={18} color="#E67E22" />
                        </View>
                        <View style={[styles.routeEndpoint, { alignItems: 'flex-end' }]}>
                            <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                                <Text style={styles.routeEndpointLabel}>TO</Text>
                                <Text style={styles.routeEndpointCity}>{booking.consigneeCity}</Text>
                                <Text style={styles.routeEndpointCountry}>{booking.consigneeCountry}</Text>
                            </View>
                            <MapPin size={14} color="#718096" />
                        </View>
                    </View>

                    {/* Carrier Badge */}
                    <View style={styles.carrierBadge}>
                        <Package size={14} color="#003049" />
                        <Text style={styles.carrierBadgeText}>{booking.carrier}</Text>
                        <Clock size={12} color="#718096" />
                        <Text style={styles.carrierEta}>{booking.eta}</Text>
                    </View>

                    <View style={styles.detailGrid}>
                        {/* Shipper */}
                        <View style={styles.detailSection}>
                            <View style={styles.detailSectionHeader}>
                                <User size={14} color="#003049" />
                                <Text style={styles.detailSectionTitle}>SHIPPER DETAILS</Text>
                            </View>
                            <InfoRow label="Name" value={booking.shipperName} />
                            <InfoRow label="Company" value={booking.shipperCompany} />
                            <InfoRow label="Address" value={`${booking.shipperAddress}, ${booking.shipperCity}, ${booking.shipperState}, ${booking.shipperPincode}`} />
                            <InfoRow label="Contact" value={booking.shipperMobile} />
                            <InfoRow label="Email" value={booking.shipperEmail} />
                            <InfoRow label="Pickup Date" value={booking.pickupDate} />
                        </View>

                        {/* Consignee */}
                        <View style={styles.detailSection}>
                            <View style={styles.detailSectionHeader}>
                                <User size={14} color="#003049" />
                                <Text style={styles.detailSectionTitle}>CONSIGNEE DETAILS</Text>
                            </View>
                            <InfoRow label="Name" value={booking.consigneeName} />
                            <InfoRow label="Company" value={booking.consigneeCompany} />
                            <InfoRow label="Address" value={`${booking.consigneeAddress}, ${booking.consigneeCity}, ${booking.consigneeCountry}`} />
                            <InfoRow label="Contact" value={booking.consigneeMobile} />
                        </View>

                        {/* Package Info */}
                        <View style={styles.detailSection}>
                            <View style={styles.detailSectionHeader}>
                                <Box size={14} color="#003049" />
                                <Text style={styles.detailSectionTitle}>PACKAGE INFO</Text>
                            </View>
                            <InfoRow label="Total Packages" value={`${booking.totalBoxes}`} />
                            <InfoRow label="Total Weight" value={`${booking.totalWeight} kg`} />
                            <InfoRow label="Content" value={booking.shipmentType} />
                            <InfoRow label="Invoice No." value={booking.invoiceNo} />
                            <InfoRow label="Currency" value={booking.currency} />
                            <InfoRow label="Total Value" value={`${booking.currency.split(' - ')[0]} ${booking.totalValue}`} />
                        </View>

                        {/* Service Details */}
                        <View style={styles.detailSection}>
                            <View style={styles.detailSectionHeader}>
                                <Layers size={14} color="#003049" />
                                <Text style={styles.detailSectionTitle}>SERVICE DETAILS</Text>
                            </View>
                            <InfoRow label="Service" value={booking.carrier} />
                            <InfoRow label="Category" value={booking.category} />
                            <View style={styles.pricingBox}>
                                <View style={styles.pricingRow}>
                                    <Text style={styles.pricingLabel}>Price</Text>
                                    <Text style={styles.pricingValue}>₹{booking.price.toLocaleString()}</Text>
                                </View>
                                <View style={styles.pricingRow}>
                                    <Text style={styles.pricingLabel}>GST (18%)</Text>
                                    <Text style={styles.pricingValue}>₹{booking.gst.toFixed(2)}</Text>
                                </View>
                                <View style={[styles.pricingRow, styles.pricingTotal]}>
                                    <Text style={styles.pricingTotalLabel}>TOTAL</Text>
                                    <Text style={styles.pricingTotalValue}>₹{booking.total.toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Tracking History */}
                    <View style={styles.trackingCard}>
                        <View style={styles.trackingCardHeader}>
                            <Clock size={16} color="#003049" />
                            <Text style={styles.trackingCardTitle}>Tracking History</Text>
                        </View>
                        <TrackingTimeline history={booking.trackingHistory} />
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const MyBookingsScreen = ({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'All' | ShipmentStatus>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);

    // Subscribe to the store
    useEffect(() => {
        setBookings(BookingsStore.getAll());
        const unsub = BookingsStore.subscribe(() => {
            setBookings(BookingsStore.getAll());
        });
        return unsub;
    }, []);

    // Filter bookings
    const filtered = bookings.filter(b => {
        const matchesStatus = activeFilter === 'All' || b.status === activeFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !q ||
            b.id.toLowerCase().includes(q) ||
            b.shipperName.toLowerCase().includes(q) ||
            b.consigneeName.toLowerCase().includes(q) ||
            b.shipperCity.toLowerCase().includes(q) ||
            b.consigneeCity.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const pageData = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const statusCounts = (() => {
        const counts: Record<string, number> = { All: bookings.length };
        STATUS_TABS.forEach(s => {
            counts[s] = bookings.filter(b => b.status === s).length;
        });
        return counts;
    })();

    const handleFilterChange = (filter: 'All' | ShipmentStatus) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const openDetail = (booking: BookingRecord) => {
        setSelectedBooking(booking);
        setShowDetail(true);
    };

    // Format booked date
    const formatDate = (isoDate: string) => {
        try {
            const d = new Date(isoDate);
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
                '\n' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return isoDate;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: STATUSBAR_HEIGHT }]}>
            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="My Bookings"
                onNavigate={onNavigate}
            />

            <View style={styles.mainWrapper}>
                <View style={{ width: 72 }} />
                <View style={{ flex: 1 }}>
                    <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />

                    <ScrollView
                        style={styles.contentArea}
                        showsVerticalScrollIndicator={true}
                        persistentScrollbar={true}
                        contentContainerStyle={{ paddingBottom: 60 }}
                    >
                        {/* Page Title Row */}
                        <View style={styles.pageTitleRow}>
                            <View>
                                <Text style={styles.pageTitle}>My Bookings</Text>
                                <Text style={styles.pageSub}>Track and manage your shipment history</Text>
                            </View>
                            <View style={styles.searchBox}>
                                <Search size={14} color="#94A3B8" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search your bookings..."
                                    placeholderTextColor="#94A3B8"
                                    value={searchQuery}
                                    onChangeText={t => { setSearchQuery(t); setCurrentPage(1); }}
                                />
                            </View>
                        </View>

                        {/* Status Filter Tabs */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterScroll}
                            contentContainerStyle={styles.filterContainer}
                        >
                            {/* All Tab */}
                            <TouchableOpacity
                                style={[styles.filterTab, activeFilter === 'All' && styles.filterTabActive]}
                                onPress={() => handleFilterChange('All')}
                            >
                                <Text style={[styles.filterTabText, activeFilter === 'All' && styles.filterTabTextActive]}>
                                    All
                                </Text>
                                <View style={[
                                    styles.filterCount,
                                    activeFilter === 'All' && styles.filterCountActive
                                ]}>
                                    <Text style={[styles.filterCountText, activeFilter === 'All' && styles.filterCountTextActive]}>
                                        {statusCounts['All']}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {STATUS_TABS.map(status => (
                                statusCounts[status] > 0 || true ? (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.filterTab, activeFilter === status && styles.filterTabActive]}
                                        onPress={() => handleFilterChange(status)}
                                    >
                                        <Text style={[styles.filterTabText, activeFilter === status && styles.filterTabTextActive]}>
                                            {status}
                                        </Text>
                                        {statusCounts[status] > 0 && (
                                            <View style={[
                                                styles.filterCount,
                                                activeFilter === status && styles.filterCountActive
                                            ]}>
                                                <Text style={[styles.filterCountText, activeFilter === status && styles.filterCountTextActive]}>
                                                    {statusCounts[status]}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ) : null
                            ))}
                        </ScrollView>

                        {/* Table Card */}
                        <View style={styles.tableCard}>
                            {/* Entries Info + Per Page */}
                            <View style={styles.tableControls}>
                                <Text style={styles.entriesText}>
                                    Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                                    {Math.min(currentPage * itemsPerPage, filtered.length)} of{' '}
                                    {filtered.length} entries
                                </Text>
                                <View style={styles.perPageWrapper}>
                                    <Text style={styles.perPageLabel}>Items per page:</Text>
                                    <TouchableOpacity
                                        style={styles.perPageBtn}
                                        onPress={() => setShowPerPageDropdown(!showPerPageDropdown)}
                                    >
                                        <Text style={styles.perPageBtnText}>{itemsPerPage}</Text>
                                        <ChevronRight size={12} color="#64748B" style={{ transform: [{ rotate: '90deg' }] }} />
                                    </TouchableOpacity>
                                    {showPerPageDropdown && (
                                        <View style={styles.perPageDropdown}>
                                            {[5, 10, 25, 50].map(n => (
                                                <TouchableOpacity
                                                    key={n}
                                                    style={[styles.perPageOption, itemsPerPage === n && styles.perPageOptionActive]}
                                                    onPress={() => {
                                                        setItemsPerPage(n);
                                                        setCurrentPage(1);
                                                        setShowPerPageDropdown(false);
                                                    }}
                                                >
                                                    <Text style={[styles.perPageOptionText, itemsPerPage === n && styles.perPageOptionTextActive]}>
                                                        {n}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Table Header & Rows wrapped in Horizontal Scroll */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                persistentScrollbar={true}
                            >
                                <View style={{ minWidth: 1100 }}>
                                    {/* Table Header */}
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderCell, { flex: 2.2 }]}>SHIPMENT ID</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>SHIPPER</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>CONSIGNEE</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>ROUTE</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>WEIGHT</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>DATE</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>ACTION</Text>
                                    </View>

                                    {/* Table Rows */}
                                    {pageData.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <View style={styles.emptyIconBg}>
                                                <Package size={28} color="#CBD5E0" />
                                            </View>
                                            <Text style={styles.emptyTitle}>No shipments found</Text>
                                            <Text style={styles.emptyDesc}>
                                                {bookings.length === 0
                                                    ? 'Book your first shipment to see it here.'
                                                    : 'No shipments match your current filter.'}
                                            </Text>
                                            {bookings.length === 0 && (
                                                <TouchableOpacity
                                                    style={styles.emptyAction}
                                                    onPress={() => onNavigate('Book Shipment')}
                                                >
                                                    <Text style={styles.emptyActionText}>Book a Shipment</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ) : (
                                        pageData.map((booking, idx) => (
                                            <View
                                                key={booking.id}
                                                style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
                                            >
                                                {/* Shipment ID */}
                                                <View style={[styles.tableCell, { flex: 2.2 }]}>
                                                    <View style={styles.shipIdCell}>
                                                        <View style={styles.shipIconBg}>
                                                            <Package size={12} color="#003049" />
                                                        </View>
                                                        <View>
                                                            <Text style={styles.shipIdText}>#{booking.id}</Text>
                                                            <Text style={styles.shipCategoryText}>{booking.category.split(' ')[0]}</Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* Shipper */}
                                                <View style={[styles.tableCell, { flex: 1.2 }]}>
                                                    <Text style={styles.cellMain} numberOfLines={1}>{booking.shipperName}</Text>
                                                </View>

                                                {/* Consignee */}
                                                <View style={[styles.tableCell, { flex: 1.2 }]}>
                                                    <Text style={styles.cellMain} numberOfLines={1}>{booking.consigneeName}</Text>
                                                </View>

                                                {/* Route */}
                                                <View style={[styles.tableCell, { flex: 1.8 }]}>
                                                    <View style={styles.routeCell}>
                                                        <Text style={styles.routeCellFrom} numberOfLines={1}>{booking.shipperCity}</Text>
                                                        <ArrowRight size={10} color="#CBD5E0" />
                                                        <Text style={styles.routeCellTo} numberOfLines={1}>{booking.consigneeCity}</Text>
                                                    </View>
                                                </View>

                                                {/* Weight */}
                                                <View style={[styles.tableCell, { flex: 0.8, alignItems: 'center' }]}>
                                                    <Text style={styles.cellSub}>{booking.totalWeight} kg</Text>
                                                </View>

                                                {/* Amount */}
                                                <View style={[styles.tableCell, { flex: 1, alignItems: 'flex-end' }]}>
                                                    <Text style={styles.amountText}>₹{booking.total.toLocaleString()}</Text>
                                                </View>

                                                {/* Status */}
                                                <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                                                    <StatusBadge status={booking.status} />
                                                </View>

                                                {/* Date */}
                                                <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                                                    <Text style={styles.dateText}>{formatDate(booking.bookedAt)}</Text>
                                                </View>

                                                {/* Actions */}
                                                <View style={[styles.tableCell, { flex: 0.8, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                                                    <TouchableOpacity
                                                        style={styles.actionBtn}
                                                        onPress={() => {
                                                            onNavigate('Shipment Details', booking.id);
                                                        }}
                                                    >
                                                        <Eye size={15} color="#003049" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            </ScrollView>

                            {/* Pagination */}
                            {filtered.length > 0 && (
                                <View style={styles.pagination}>
                                    <TouchableOpacity
                                        style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                                        onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={15} color={currentPage === 1 ? '#CBD5E0' : '#003049'} />
                                    </TouchableOpacity>

                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let page: number;
                                        if (totalPages <= 5) {
                                            page = i + 1;
                                        } else if (currentPage <= 3) {
                                            page = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            page = totalPages - 4 + i;
                                        } else {
                                            page = currentPage - 2 + i;
                                        }
                                        return (
                                            <TouchableOpacity
                                                key={page}
                                                style={[styles.pageBtn, currentPage === page && styles.pageBtnActive]}
                                                onPress={() => setCurrentPage(page)}
                                            >
                                                <Text style={[styles.pageBtnText, currentPage === page && styles.pageBtnTextActive]}>
                                                    {page}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}

                                    {totalPages > 5 && (
                                        <>
                                            <Text style={styles.pageEllipsis}>...</Text>
                                            <TouchableOpacity
                                                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnActive]}
                                                onPress={() => setCurrentPage(totalPages)}
                                            >
                                                <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextActive]}>
                                                    {totalPages}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                                        onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight size={15} color={currentPage === totalPages ? '#CBD5E0' : '#003049'} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={{ height: 60 }} />
                    </ScrollView>
                </View>
            </View>

            {/* Shipment Detail Modal */}
            <ShipmentDetailModal
                booking={selectedBooking}
                visible={showDetail}
                onClose={() => { setShowDetail(false); setSelectedBooking(null); }}
            />
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
    },
    mainWrapper: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
    },
    contentArea: {
        flex: 1,
        padding: 16,
    },

    // ── Page Header
    pageTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1E293B',
    },
    pageSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minWidth: 200,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#1E293B',
        padding: 0,
    },

    // ── Filter Tabs
    filterScroll: {
        marginBottom: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 6,
    },
    filterTabActive: {
        backgroundColor: '#1A202C',
        borderColor: '#1A202C',
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    filterTabTextActive: {
        color: Colors.white,
    },
    filterCount: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    filterCountActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    filterCountText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
    },
    filterCountTextActive: {
        color: Colors.white,
    },

    // ── Table Card
    tableCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    tableControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    entriesText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    perPageWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
    },
    perPageLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    perPageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    perPageBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    perPageDropdown: {
        position: 'absolute',
        top: 32,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        zIndex: 100,
        minWidth: 60,
    },
    perPageOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    perPageOptionActive: {
        backgroundColor: '#F0F9FF',
    },
    perPageOptionText: {
        fontSize: 13,
        color: '#374151',
    },
    perPageOptionTextActive: {
        color: '#003049',
        fontWeight: '700',
    },

    // ── Table
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tableHeaderCell: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tableRowAlt: {
        backgroundColor: '#FAFAFA',
    },
    tableCell: {
        justifyContent: 'center',
    },

    // ── Cell content
    shipIdCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    shipIconBg: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shipIdText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#003049',
    },
    shipCategoryText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#64748B',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 2,
    },
    cellMain: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    cellSub: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    routeCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    routeCellFrom: {
        fontSize: 11,
        color: '#374151',
        fontWeight: '600',
        maxWidth: 60,
    },
    routeCellTo: {
        fontSize: 11,
        color: '#374151',
        fontWeight: '600',
        maxWidth: 60,
    },
    amountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E293B',
    },
    dateText: {
        fontSize: 10,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 15,
    },
    actionBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },

    // ── Status Badge
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },

    // ── Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#374151',
    },
    emptyDesc: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        maxWidth: 280,
    },
    emptyAction: {
        backgroundColor: '#003049',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 8,
    },
    emptyActionText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 13,
    },

    // ── Pagination
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    pageBtn: {
        minWidth: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    pageBtnActive: {
        backgroundColor: '#003049',
        borderColor: '#003049',
    },
    pageBtnDisabled: {
        opacity: 0.4,
    },
    pageBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    pageBtnTextActive: {
        color: Colors.white,
    },
    pageEllipsis: {
        fontSize: 14,
        color: '#94A3B8',
        paddingHorizontal: 2,
    },

    // ── Detail Modal
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    detailModal: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '55%',
        minWidth: 360,
        backgroundColor: Colors.white,
        elevation: 30,
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FAFAFA',
    },
    detailShipId: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
    },
    detailHeaderSub: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    detailCategoryTag: {
        fontSize: 10,
        fontWeight: '800',
        color: '#003049',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    closeIconBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Route Card in detail
    routeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    routeEndpoint: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeEndpointLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.5,
    },
    routeEndpointCity: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1E293B',
    },
    routeEndpointCountry: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    routeArrow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    routeArrowLine: {
        width: 30,
        height: 1,
        backgroundColor: '#CBD5E0',
    },

    // Carrier badge
    carrierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        gap: 8,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    carrierBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#003049',
        flex: 1,
    },
    carrierEta: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },

    // Detail grid
    detailGrid: {
        paddingHorizontal: 16,
        gap: 14,
    },
    detailSection: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 10,
    },
    detailSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    detailSectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#003049',
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        flex: 0.5,
    },
    infoValue: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '600',
        flex: 0.5,
        textAlign: 'right',
    },

    // Pricing Box
    pricingBox: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
        marginTop: 4,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pricingLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    pricingValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    pricingTotal: {
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 8,
        marginTop: 4,
    },
    pricingTotalLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1E293B',
    },
    pricingTotalValue: {
        fontSize: 14,
        fontWeight: '900',
        color: '#003049',
    },

    // Tracking Card
    trackingCard: {
        margin: 16,
        backgroundColor: '#1A202C',
        borderRadius: 14,
        padding: 16,
    },
    trackingCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    trackingCardTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.white,
    },
    timelineContainer: {
        gap: 0,
    },
    timelineRow: {
        flexDirection: 'row',
    },
    timelineLeft: {
        width: 24,
        alignItems: 'center',
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4A5568',
        marginTop: 3,
    },
    timelineDotActive: {
        backgroundColor: '#E67E22',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#2D3748',
        marginTop: 4,
        marginBottom: 4,
        minHeight: 30,
    },
    timelineContent: {
        flex: 1,
        paddingLeft: 12,
        paddingBottom: 20,
    },
    timelineStatus: {
        fontSize: 13,
        fontWeight: '700',
        color: '#A0AEC0',
    },
    timelineStatusActive: {
        color: Colors.white,
    },
    timelineDesc: {
        fontSize: 11,
        color: '#718096',
        marginTop: 2,
    },
    timelineDate: {
        fontSize: 10,
        color: '#4A5568',
        marginTop: 3,
    },
});
