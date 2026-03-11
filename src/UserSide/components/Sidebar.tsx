import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Animated, Easing, useWindowDimensions } from 'react-native';
import { LayoutDashboard, Package, BookOpen, FileText, ClipboardList, Calculator, Box, Info, Wallet, Settings, LogOut, X, MapPin, Phone, Mail } from 'lucide-react-native';
import { Colors } from '../Colors';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

// Sidebar Item Component
const SidebarItem = ({ icon: Icon, label, active = false, isExpanded, index, onPress }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-15)).current;

    useEffect(() => {
        if (isExpanded) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    delay: index * 30 + 100,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 50,
                    delay: index * 30 + 100,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(-15);
        }
    }, [isExpanded]);

    return (
        <TouchableOpacity
            style={[
                styles.item,
                active && styles.activeItem,
                isExpanded && styles.expandedItem
            ]}
            activeOpacity={0.7}
            onPress={() => onPress && onPress(label)}
        >
            <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
                <Icon size={22} color={active ? Colors.white : '#E67E22'} strokeWidth={active ? 2.5 : 2} />
            </View>

            {isExpanded && (
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                    flex: 1
                }}>
                    <Text style={[styles.itemLabel, active && styles.activeLabel]} numberOfLines={1}>
                        {label}
                    </Text>
                </Animated.View>
            )}
        </TouchableOpacity>
    );
};

const SectionHeader = ({ title, isExpanded }: { title: string, isExpanded: boolean }) => {
    if (!isExpanded) return <View style={styles.miniDivider} />;

    return (
        <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>{title}</Text>
        </View>
    );
};

export const Sidebar = ({ isExpanded, onToggle, activeScreen = 'Dashboard', onNavigate }: { isExpanded: boolean, onToggle: () => void, activeScreen?: string, onNavigate?: (screen: string) => void }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const MINI_WIDTH = isMobile ? 56 : 72;

    // Width animation ref
    const sidebarWidth = useRef(new Animated.Value(MINI_WIDTH)).current;
    // Overlay opacity ref
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Stop any current animation to prevent overlaps
        sidebarWidth.stopAnimation();
        overlayOpacity.stopAnimation();

        Animated.parallel([
            Animated.timing(sidebarWidth, {
                toValue: isExpanded ? 280 : MINI_WIDTH,
                duration: 350,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: false, // width can't use native driver
            }),
            Animated.timing(overlayOpacity, {
                toValue: isExpanded ? 1 : 0,
                duration: 350,
                useNativeDriver: true,
            })
        ]).start();
    }, [isExpanded, isMobile, MINI_WIDTH]); // Added MINI_WIDTH to dependency array

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Dark Overlay Background - rendered even when isExpanded is false but opacity 0 to allow animation */}
            <Animated.View
                style={[
                    styles.overlay,
                    { opacity: overlayOpacity }
                ]}
                pointerEvents={isExpanded ? 'auto' : 'none'}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onToggle}
                    activeOpacity={1}
                />
            </Animated.View>

            {/* Sidebar Container */}
            <Animated.View style={[
                styles.container,
                {
                    width: sidebarWidth,
                    paddingTop: STATUSBAR_HEIGHT,
                }
            ]}>
                <View style={styles.headerRow}>
                    {isExpanded ? (
                        <View style={styles.logoAndText}>
                            <View style={styles.logoSquare}>
                                <Text style={styles.logoTextInner}>DFL</Text>
                            </View>
                            <View style={styles.logoTextContainer}>
                                <Text style={styles.logoMainText}>DFL GROUP</Text>
                                <Text style={styles.logoSubText}>LOGISTICS PARTNER</Text>
                            </View>
                            <TouchableOpacity onPress={onToggle} style={styles.closeBtn}>
                                <X size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoInitial}>D</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={isExpanded ? styles.expandedScrollContent : styles.miniScrollContent}
                    style={styles.scrollView}
                >
                    <SidebarItem index={0} icon={LayoutDashboard} label="Dashboard" active={activeScreen === 'Dashboard'} isExpanded={isExpanded} onPress={onNavigate} />

                    <SectionHeader title="SHIPMENT" isExpanded={isExpanded} />
                    <SidebarItem index={1} icon={Package} label="Book Shipment" active={activeScreen === 'Book Shipment'} isExpanded={isExpanded} onPress={onNavigate} />
                    <SidebarItem index={2} icon={BookOpen} label="My Bookings" active={activeScreen === 'My Bookings'} isExpanded={isExpanded} onPress={onNavigate} />
                    <SidebarItem index={3} icon={ClipboardList} label="Manifests" active={activeScreen === 'Manifests'} isExpanded={isExpanded} onPress={onNavigate} />
                    <SidebarItem index={4} icon={FileText} label="Drafts" active={activeScreen === 'Drafts'} isExpanded={isExpanded} onPress={onNavigate} />

                    <SectionHeader title="SERVICES" isExpanded={isExpanded} />
                    <SidebarItem index={5} icon={Calculator} label="Rate Calculator" active={activeScreen === 'Rate Calculator'} isExpanded={isExpanded} onPress={onNavigate} />
                    <SidebarItem index={6} icon={Box} label="Bulk Orders" active={activeScreen === 'Bulk Orders'} isExpanded={isExpanded} onPress={onNavigate} />
                    <SidebarItem index={7} icon={Info} label="Heavy Weight Quotes" active={activeScreen === 'Heavy Weight Quotes'} isExpanded={isExpanded} onPress={onNavigate} />

                    <SectionHeader title="FINANCE" isExpanded={isExpanded} />
                    <SidebarItem index={8} icon={Wallet} label="Recharge Wallet" active={activeScreen === 'Recharge Wallet'} isExpanded={isExpanded} onPress={onNavigate} />

                    <SectionHeader title="ACCOUNT" isExpanded={isExpanded} />
                    <SidebarItem index={9} icon={MapPin} label="Address Book" active={activeScreen === 'Address Book'} isExpanded={isExpanded} onPress={onNavigate} />
                    <SidebarItem index={10} icon={Settings} label="Settings" active={activeScreen === 'Settings'} isExpanded={isExpanded} onPress={onNavigate} />

                    {isExpanded && (
                        <View style={styles.bottomCard}>
                            <View style={styles.addressRow}>
                                <MapPin size={14} color="#E67E22" />
                                <View style={styles.addressTextCol}>
                                    <Text style={styles.addressTitle}>B 331, Logix Technova</Text>
                                    <Text style={styles.addressText}>Sector 132, Noida</Text>
                                </View>
                            </View>
                            <View style={styles.addressRow}>
                                <Phone size={14} color="#E67E22" />
                                <Text style={styles.contactValue}>9355151122</Text>
                            </View>

                            <View style={styles.addressRow}>
                                <Mail size={14} color="#E67E22" />
                                <Text style={styles.contactValue}>courier@thedflgroup.com</Text>
                            </View>
                            <View style={{ height: 1 }} />
                        </View>
                    )}
                </ScrollView>

                {!isExpanded && (
                    <View style={styles.miniBottomArea}>
                        <TouchableOpacity style={styles.miniBottomItem}>
                            <LogOut size={20} color="#E67E22" />
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    container: {
        backgroundColor: '#EAE3D2',
        height: '100%',
        zIndex: 9999,
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.1)',
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        paddingBottom: 40,
    },
    headerRow: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        width: '100%',
    },
    logoAndText: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        width: '100%',
    },
    logoSquare: {
        width: 38,
        height: 38,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    logoTextInner: {
        fontSize: 10,
        fontWeight: '900',
        color: '#003049',
    },
    logoTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    logoMainText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#003049',
    },
    logoSubText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#E67E22',
        letterSpacing: 0.5,
    },
    closeBtn: {
        padding: 5,
    },
    logoCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#E67E22',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    logoInitial: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: '900',
    },
    scrollView: {
        flex: 1,
    },
    miniScrollContent: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    expandedScrollContent: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    item: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 4,
    },
    expandedItem: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 8,
        height: 52,
        borderRadius: 12,
    },
    activeItem: {
        backgroundColor: 'rgba(230, 126, 34, 0.08)',
    },
    iconContainer: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    activeIconContainer: {
        backgroundColor: '#E67E22',
    },
    itemLabel: {
        marginLeft: 12,
        fontSize: 15,
        color: '#4A4A4A',
        fontWeight: '600',
    },
    activeLabel: {
        color: '#003049',
        fontWeight: '700',
    },
    miniDivider: {
        width: 30,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 15,
    },
    sectionHeaderRow: {
        marginTop: 20,
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '800',
        color: '#888',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    miniBottomArea: {
        paddingVertical: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 40,
    },
    miniBottomItem: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomCard: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        marginTop: 25,
        borderRadius: 16,
        padding: 15,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressTextCol: {
        marginLeft: 10,
        flex: 1,
    },
    addressTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#333',
    },
    addressText: {
        fontSize: 10,
        color: '#666',
    },
    contactValue: {
        fontSize: 11,
        fontWeight: '700',
        color: '#333',
        marginLeft: 10,
    }
});
