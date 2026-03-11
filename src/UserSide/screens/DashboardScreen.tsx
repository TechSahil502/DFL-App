import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar, Platform, Animated, Easing, Dimensions } from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { QuickQuote } from '../components/QuickQuote';
import { RecentShipments } from '../components/RecentShipments';
import { RightProfile } from '../components/RightProfile';
import { Colors } from '../Colors';
import { ShieldCheck, ChevronDown, Package, Plus } from 'lucide-react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                delay: delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
            Animated.spring(translateY, {
                toValue: 0,
                delay: delay,
                useNativeDriver: true,
                friction: 8,
                tension: 40,
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY }]
        }}>
            {children}
        </Animated.View>
    );
};

const ShipmentOverviewBox = () => (
    <View style={styles.overviewBox}>
        <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Shipment Overview</Text>
            <TouchableOpacity style={styles.overviewDropdown}>
                <Text style={styles.overviewDropdownText}>This Month</Text>
                <ChevronDown size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
        </View>
        <View style={styles.overviewContent}>
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconBg}>
                    <Package size={24} color="#A0AEC0" />
                </View>
                <Text style={styles.emptyText}>No shipment data</Text>
            </View>
        </View>
    </View>
);

export const DashboardScreen = ({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const isMobile = Dimensions.get('window').width < 768;

    return (
        <View style={[styles.container, { paddingTop: STATUSBAR_HEIGHT }]}>
            <View style={{ width: isMobile ? 56 : 72 }} />

            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="Dashboard"
                onNavigate={onNavigate}
            />

            <View style={styles.mainWrapper}>
                <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />

                <View style={styles.contentAndRight}>
                    <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
                        <View style={styles.innerContent}>
                            <AnimatedSection delay={0}>
                                <View style={styles.welcomeRow}>
                                    <View style={styles.welcomeHeaderRow}>
                                        <View>
                                            <Text style={styles.greeting}>Good Afternoon, Piyush 👋</Text>
                                            <Text style={styles.date}>Friday, 6 March 2026</Text>
                                        </View>
                                        <View style={styles.actionSection}>
                                            <View style={styles.kycBadge}>
                                                <ShieldCheck size={14} color={Colors.cardGreen} />
                                                <Text style={styles.kycText}>KYC VERIFIED</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.newShipmentBtn}
                                                onPress={() => onNavigate('Book Shipment')}
                                            >
                                                <Plus size={16} color={Colors.white} />
                                                <Text style={styles.newShipmentText}>New Shipment</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </AnimatedSection>

                            <AnimatedSection delay={200}>
                                <View style={styles.dashboardGrid}>
                                    <View style={styles.fullWidthSection}>
                                        <ShipmentOverviewBox />
                                    </View>

                                    <View style={styles.statsGrid}>
                                        <View style={styles.statsRow}>
                                            <StatCard
                                                title="Total Spend (Month)"
                                                value="₹0"
                                                subtitle="+12.5%"
                                                color="#6c5ce7"
                                                type="spend"
                                            />
                                            <StatCard
                                                title="Active Shipments"
                                                value="1"
                                                color="#0984e3"
                                                type="active"
                                            />
                                        </View>
                                        <View style={[styles.statsRow, { marginTop: 12 }]}>
                                            <StatCard
                                                title="Delivered"
                                                value="0"
                                                color="#00b894"
                                                type="delivered"
                                            />
                                            <StatCard
                                                title="In Transit"
                                                value="1"
                                                color="#e17055"
                                                type="transit"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </AnimatedSection>

                            <AnimatedSection delay={400}>
                                <QuickQuote />
                            </AnimatedSection>

                            <AnimatedSection delay={500}>
                                <RightProfile />
                            </AnimatedSection>

                            <AnimatedSection delay={600}>
                                <RecentShipments />
                            </AnimatedSection>

                            <View style={{ height: 100 }} />
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
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
    },
    mainWrapper: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    contentAndRight: {
        flex: 1,
    },
    contentArea: {
        flex: 1,
    },
    innerContent: {
        padding: 15,
        width: '100%',
    },
    welcomeRow: {
        marginBottom: 20,
    },
    welcomeHeaderRow: {
        flexDirection: 'column', // Stack on mobile for better fit
        gap: 12,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    date: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    kycBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    kycText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#059669',
        marginLeft: 6,
    },
    newShipmentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#003049',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    newShipmentText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '800',
    },
    dashboardGrid: {
        flexDirection: 'column',
        gap: 15,
        marginBottom: 20,
    },
    fullWidthSection: {
        width: '100%',
    },
    statsGrid: {
        width: '100%',
    },
    overviewBox: {
        backgroundColor: '#EDF2F7',
        borderRadius: 16,
        padding: 16,
        minHeight: 180,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    overviewTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#334155',
    },
    overviewDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        elevation: 1,
    },
    overviewDropdownText: {
        fontSize: 11,
        color: '#64748B',
        marginRight: 4,
        fontWeight: '600',
    },
    overviewContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateContainer: {
        alignItems: 'center',
    },
    emptyIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
    },
});
