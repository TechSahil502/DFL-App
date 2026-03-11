import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    Image,
    useWindowDimensions,
} from 'react-native';
import {
    ArrowLeft,
    Package,
    MapPin,
    User,
    Layers,
    Clock,
    Box,
    FileText,
    Search,
    ChevronRight,
    ArrowRight,
    Monitor,
    Printer,
    Download
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BookingsStore, BookingRecord } from '../store/bookingsStore';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

export const ShipmentDetailsScreen = ({ onNavigate, shipmentId }: { onNavigate: (screen: string) => void, shipmentId: string }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [booking, setBooking] = useState<BookingRecord | null>(null);

    useEffect(() => {
        const allBookings = BookingsStore.getAll();
        const found = allBookings.find(b => b.id === shipmentId);
        if (found) {
            setBooking(found);
        }
    }, [shipmentId]);

    if (!booking) {
        return (
            <View style={[styles.container, { paddingTop: STATUSBAR_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Shipment not found</Text>
                <TouchableOpacity onPress={() => onNavigate('Dashboard')} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#003049', fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const InfoRow = ({ label, value }: { label: string, value: string }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );

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
                    <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

                    <ScrollView
                        style={styles.contentArea}
                        contentContainerStyle={{ paddingBottom: 50 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header Navigation */}
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => onNavigate('My Bookings')}
                        >
                            <ArrowLeft size={20} color="#4A5568" />
                            <Text style={styles.backText}>Shipment Details</Text>
                        </TouchableOpacity>

                        {/* ID Row */}
                        <View style={[styles.idRow, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginBottom: 15 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <Text style={styles.shipmentIdText}>{booking.id}</Text>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryBadgeText}>{booking.category.split(' ')[0]}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                                    <Text style={styles.statusBadgeText}>{booking.status.toUpperCase()}</Text>
                                </View>
                            </View>
                            <View style={[isMobile && { width: '100%', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8, marginTop: 4 }]}>
                                <Text style={styles.expectedDelivery}>
                                    Expected Delivery: <Text style={{ fontWeight: '800' }}>{booking.eta}</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.gridContainer}>
                            {/* Left Column */}
                            <View style={styles.leftCol}>
                                {/* Route Card */}
                                <View style={[styles.routeCard, isMobile && styles.mobileRouteCard]}>
                                    <View style={[styles.routePoint, isMobile && styles.mobileRoutePoint]}>
                                        <View style={styles.iconCircle}>
                                            <MapPin size={16} color="#718096" />
                                        </View>
                                        <View>
                                            <Text style={styles.routeLabel}>FROM</Text>
                                            <Text style={[styles.routeCity, isMobile && { fontSize: 16 }]}>{booking.shipperCity}</Text>
                                            <Text style={styles.routeCountry}>{booking.shipperCountry}</Text>
                                        </View>
                                    </View>

                                    {!isMobile ? (
                                        <View style={styles.routeLineContainer}>
                                            <View style={styles.routeLine} />
                                            <View style={styles.deliveryIconBg}>
                                                <Package size={24} color={Colors.white} />
                                            </View>
                                            <Text style={styles.carrierSub}>{booking.carrier}</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.mobileRouteConnector}>
                                            <View style={styles.mobileRouteLine} />
                                            <View style={[styles.deliveryIconBg, { width: 36, height: 36 }]}>
                                                <Package size={18} color={Colors.white} />
                                            </View>
                                            <View style={styles.mobileRouteLine} />
                                        </View>
                                    )}

                                    <View style={[styles.routePoint, { alignItems: isMobile ? 'flex-start' : 'flex-end' }, isMobile && styles.mobileRoutePoint]}>
                                        <View style={styles.iconCircle}>
                                            <MapPin size={16} color="#718096" />
                                        </View>
                                        <View style={{ alignItems: isMobile ? 'flex-start' : 'flex-end' }}>
                                            <Text style={styles.routeLabel}>DESTINATION</Text>
                                            <Text style={[styles.routeCity, isMobile && { fontSize: 16 }]}>{booking.consigneeCity}</Text>
                                            <Text style={styles.routeCountry}>{booking.consigneeCountry}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Shipper & Receiver Details */}
                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailBox}>
                                        <View style={styles.detailBoxHeader}>
                                            <User size={16} color="#003049" />
                                            <Text style={styles.detailBoxTitle}>Shipper Details</Text>
                                        </View>
                                        <InfoRow label="NAME" value={booking.shipperName} />
                                        <InfoRow label="COMPANY" value={booking.shipperCompany || '-'} />
                                        <InfoRow label="ADDRESS" value={booking.shipperCity + ', ' + booking.shipperCountry} />
                                        <InfoRow label="CONTACT" value={booking.shipperMobile} />
                                    </View>

                                    <View style={styles.detailBox}>
                                        <View style={styles.detailBoxHeader}>
                                            <User size={16} color="#003049" />
                                            <Text style={styles.detailBoxTitle}>Receiver Details</Text>
                                        </View>
                                        <InfoRow label="NAME" value={booking.consigneeName} />
                                        <InfoRow label="COMPANY" value={booking.consigneeCompany || '-'} />
                                        <InfoRow label="ADDRESS" value={booking.consigneeCity + ', ' + booking.consigneeCountry} />
                                        <InfoRow label="CONTACT" value={booking.consigneeMobile} />
                                    </View>
                                </View>

                                {/* Package & Service Info */}
                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailBox}>
                                        <View style={styles.detailBoxHeader}>
                                            <Box size={16} color="#003049" />
                                            <Text style={styles.detailBoxTitle}>Package Info</Text>
                                        </View>
                                        <InfoRow label="TOTAL PACKAGES" value={booking.totalBoxes.toString()} />
                                        <InfoRow label="TOTAL WEIGHT" value={booking.totalWeight + " kg"} />
                                        <InfoRow label="CONTENT" value={booking.shipmentType} />
                                        <InfoRow label="VALUE" value={booking.currency.split(' ')[0] + " " + booking.totalValue} />
                                    </View>

                                    <View style={styles.detailBox}>
                                        <View style={styles.detailBoxHeader}>
                                            <Layers size={16} color="#003049" />
                                            <Text style={styles.detailBoxTitle}>Service Details</Text>
                                        </View>
                                        <InfoRow label="SERVICE" value={booking.carrier} />
                                        <InfoRow label="TRACKING NO" value={booking.id} />
                                        <InfoRow label="PAYMENT" value="PREPAID" />
                                        <InfoRow label="TOTAL COST" value={"₹" + booking.total.toLocaleString()} />
                                    </View>
                                </View>
                            </View>

                            {/* Right Column */}
                            <View style={styles.rightCol}>
                                {/* Shipping Labels Card */}
                                <View style={styles.rightCard}>
                                    <View style={styles.rightCardHeader}>
                                        <FileText size={16} color="#003049" />
                                        <Text style={styles.rightCardTitle}>Shipping Labels</Text>
                                    </View>

                                    <View style={styles.labelActionRow}>
                                        <View style={styles.labelActionIconBg}>
                                            <FileText size={18} color="#A0AEC0" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.labelActionName}>First Mile Sticker</Text>
                                            <Text style={styles.labelActionStatus}>Not available yet</Text>
                                        </View>
                                    </View>

                                    <View style={styles.labelActionRow}>
                                        <View style={styles.labelActionIconBg}>
                                            <FileText size={18} color="#A0AEC0" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.labelActionName}>Last Mile Sticker</Text>
                                            <Text style={styles.labelActionStatus}>Not available yet</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Tracking History Card */}
                                <View style={[styles.rightCard, { backgroundColor: '#001E2F', marginTop: 20 }]}>
                                    <View style={styles.rightCardHeader}>
                                        <Clock size={16} color={Colors.white} />
                                        <Text style={[styles.rightCardTitle, { color: Colors.white }]}>Tracking History</Text>
                                    </View>

                                    <View style={styles.timeline}>
                                        {booking.trackingHistory.map((item, index) => (
                                            <View key={index} style={styles.timelineItem}>
                                                <View style={styles.timelineLeft}>
                                                    <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
                                                    {index < booking.trackingHistory.length - 1 && <View style={styles.timelineLine} />}
                                                </View>
                                                <View style={styles.timelineRight}>
                                                    <Text style={[styles.timelineStatus, index === 0 && styles.timelineStatusActive]}>{item.status}</Text>
                                                    <Text style={styles.timelineDesc}>{item.description}</Text>
                                                    <Text style={styles.timelineDate}>{item.date}</Text>
                                                    <View style={styles.timelineLocationRow}>
                                                        <MapPin size={10} color="#718096" />
                                                        <Text style={styles.timelineLocation}>Noida</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    mainWrapper: {
        flex: 1,
        flexDirection: 'row',
    },
    contentArea: {
        flex: 1,
        padding: 16,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    backText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1A202C',
    },
    idRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    shipmentIdText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#718096',
    },
    categoryBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#4A5568',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#B7791F',
    },
    expectedDelivery: {
        fontSize: 11,
        color: '#4A5568',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    leftCol: {
        flex: 1,
        minWidth: 280,
    },
    rightCol: {
        flex: 1,
        minWidth: 280,
    },
    routeCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    mobileRouteCard: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 20,
        padding: 16,
    },
    mobileRoutePoint: {
        flex: 0,
        width: '100%',
        paddingLeft: 8,
    },
    mobileRouteConnector: {
        alignItems: 'center',
        paddingLeft: 24,
        marginVertical: -10,
    },
    mobileRouteLine: {
        width: 1,
        height: 15,
        backgroundColor: '#E2E8F0',
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    routeLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#A0AEC0',
        letterSpacing: 0.5,
    },
    routeCity: {
        fontSize: 18,
        fontWeight: '900',
        color: '#2D3748',
        marginVertical: 1,
    },
    routeCountry: {
        fontSize: 11,
        color: '#718096',
    },
    routeLineContainer: {
        flex: 0.8,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    routeLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#E2E8F0',
        position: 'absolute',
        top: 24,
    },
    deliveryIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#6B46C1',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    carrierSub: {
        fontSize: 9,
        fontWeight: '800',
        color: '#4A5568',
        marginTop: 6,
        textAlign: 'center',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    detailBox: {
        flex: 1,
        minWidth: 140,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    detailBoxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    detailBoxTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#2D3748',
        letterSpacing: 0.5,
        flex: 1,
    },
    infoRow: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#A0AEC0',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A5568',
    },
    rightCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    rightCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    rightCardTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#2D3748',
    },
    labelActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 10,
    },
    labelActionIconBg: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    labelActionName: {
        fontSize: 12,
        fontWeight: '800',
        color: '#4A5568',
    },
    labelActionStatus: {
        fontSize: 10,
        color: '#A0AEC0',
    },
    timeline: {
        paddingLeft: 5,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 12,
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4A5568',
        marginTop: 5,
    },
    timelineDotActive: {
        backgroundColor: '#38B2AC',
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: -2,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        minHeight: 40,
    },
    timelineRight: {
        flex: 1,
    },
    timelineStatus: {
        fontSize: 13,
        fontWeight: '800',
        color: '#718096',
    },
    timelineStatusActive: {
        color: '#38B2AC',
    },
    timelineDesc: {
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 2,
    },
    timelineDate: {
        fontSize: 10,
        color: '#718096',
        marginTop: 4,
    },
    timelineLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    timelineLocation: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4A5568',
    },
});
