import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, Phone, Bell, XCircle, ChevronRight } from 'lucide-react-native';
import { Colors } from '../Colors';

export const RightProfile = () => {
    return (
        <View style={styles.container}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>P</Text>
                    </View>
                    <View style={styles.statusDot} />
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>Piyush Sinha</Text>
                    <Text style={styles.profileRole}>SALES EXECUTIVE</Text>
                </View>
                <View style={styles.actionIcons}>
                    <TouchableOpacity style={styles.miniIcon}>
                        <Mail size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniIcon}>
                        <Phone size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Alerts Section */}
            <View style={styles.alertsCard}>
                <View style={styles.alertsHeader}>
                    <View style={styles.alertsTitleGroup}>
                        <View style={styles.redDot} />
                        <Text style={styles.alertsTitle}>Live Alerts</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>3 Actions Pending</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.alertItem}>
                    <View style={styles.alertIconBox}>
                        <XCircle size={18} color={Colors.cancelled} />
                    </View>
                    <View style={styles.alertTextContent}>
                        <Text style={styles.alertMainText}>Cancelled Shipments</Text>
                        <Text style={styles.alertSubText}>3 shipments require your immediate attention</Text>
                    </View>
                    <ChevronRight size={16} color="#CBD5E0" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 15,
        marginTop: 20,
    },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#003049',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.cardGreen,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    profileInfo: {
        marginLeft: 15,
        flex: 1,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
    },
    profileRole: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.cardBlue,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    actionIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    miniIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    alertsCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    alertsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    alertsTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.cancelled,
        marginRight: 8,
    },
    alertsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    badge: {
        backgroundColor: '#FFE5E5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: Colors.cancelled,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 15,
    },
    alertIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertTextContent: {
        flex: 1,
        marginLeft: 12,
    },
    alertMainText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
    },
    alertSubText: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});


