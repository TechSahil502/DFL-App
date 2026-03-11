import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Easing } from 'react-native';
import { Search, Wallet, MapPin, Settings, LogOut, Package, ChevronUp, ChevronDown } from 'lucide-react-native';
import { Colors } from '../Colors';

import { BookingsStore } from '../store/bookingsStore';

export const Header = ({ onToggleSidebar, onNavigate }: { onToggleSidebar?: () => void, onNavigate?: (screen: string, data?: any) => void }) => {
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const dropdownAnim = React.useRef(new Animated.Value(0)).current;

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (onNavigate && text.trim().length >= 11) {
            const allBookings = BookingsStore.getAll();
            const found = allBookings.find(b => b.id.toLowerCase() === text.toLowerCase().trim());
            if (found) {
                onNavigate('Shipment Details', found.id);
                setSearchQuery(''); // clear after navigation
            }
        }
    };

    const handleSearchSubmit = () => {
        if (onNavigate && searchQuery.trim()) {
            const allBookings = BookingsStore.getAll();
            const found = allBookings.find(b => b.id.toLowerCase() === searchQuery.toLowerCase().trim());
            if (found) {
                onNavigate('Shipment Details', found.id);
                setSearchQuery('');
            }
        }
    };

    React.useEffect(() => {
        Animated.timing(dropdownAnim, {
            toValue: showDropdown ? 1 : 0,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();
    }, [showDropdown]);

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.searchContainer}>
                    <Search size={14} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Shipment ID..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onSubmitEditing={handleSearchSubmit}
                        autoCapitalize="characters"
                    />
                </View>

                <View style={styles.rightActions}>
                    <View style={styles.balanceTag}>
                        <View style={styles.balanceIconBg}>
                            <Text style={styles.balanceIconText}>₹</Text>
                        </View>
                        <Text style={styles.balanceAmount}>₹695,991.97</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.profileWrapper}
                        onPress={() => setShowDropdown(!showDropdown)}
                    >
                        <View style={styles.profileAvatar}>
                            <Text style={styles.avatarText}>P</Text>
                        </View>
                        {showDropdown ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                    </TouchableOpacity>
                </View>
            </View>

            {showDropdown && (
                <Animated.View style={[
                    styles.dropdownMenu,
                    {
                        opacity: dropdownAnim,
                        transform: [{
                            translateY: dropdownAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 0]
                            })
                        }]
                    }
                ]}>
                    <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownName}>Piyush Sinha</Text>
                        <Text style={styles.dropdownEmail}>piyushsinha19807@gmail.com</Text>
                    </View>

                    <View style={styles.dropdownDivider} />

                    <TouchableOpacity style={styles.dropdownItem}>
                        <Package size={18} color="#64748B" />
                        <Text style={styles.dropdownItemText}>My Bookings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dropdownItem}>
                        <Wallet size={18} color="#64748B" />
                        <Text style={styles.dropdownItemText}>Wallet Recharge</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dropdownItem}>
                        <MapPin size={18} color="#64748B" />
                        <Text style={styles.dropdownItemText}>Address Book</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dropdownItem}>
                        <Settings size={18} color="#64748B" />
                        <Text style={styles.dropdownItemText}>Settings</Text>
                    </TouchableOpacity>

                    <View style={styles.dropdownDivider} />

                    <TouchableOpacity style={[styles.dropdownItem, { marginTop: 5 }]}>
                        <LogOut size={18} color="#D63031" />
                        <Text style={[styles.dropdownItemText, { color: '#D63031' }]}>Sign Out</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 2000,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        borderRadius: 8,
        flex: 1,
        height: 36,
    },
    searchInput: {
        flex: 1,
        marginLeft: 6,
        fontSize: 12,
        color: Colors.text,
        padding: 0,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    balanceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#10B98122',
    },
    balanceIconBg: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    balanceIconText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '900',
    },
    balanceAmount: {
        fontSize: 11,
        fontWeight: '800',
        color: '#064E3B',
    },
    profileWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    profileAvatar: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#003049',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 65,
        right: 12,
        width: 260,
        backgroundColor: '#E2E8F0', // matched to screenshot light gray
        borderRadius: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    dropdownHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    dropdownName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    dropdownEmail: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.06)',
        marginVertical: 8,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    dropdownItemText: {
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    }
});
