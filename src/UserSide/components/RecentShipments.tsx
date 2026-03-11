import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../Colors';

const MOCK_DATA = [
    { id: 'DFL5223835', origin: 'New Delhi', destination: 'qwadtvb vda', date: '23 Feb', status: 'CANCELLED', amount: '₹2,694.55' },
    { id: 'DFL5855743', origin: 'Ujjain', destination: 'Las Vegas', date: '03 Feb', status: 'CANCELLED', amount: '₹1,751.25' },
    { id: 'DFL7385319', origin: 'New Delhi', destination: 'Rohtak', date: '29 Jan', status: 'DISPUTE RESOLVED', amount: '₹4,012.48' },
    { id: 'DFL9063723', origin: 'New Delhi', destination: 'Lucknow', date: '16 Jan', status: 'CANCELLED', amount: '₹2,240.52' },
];

const ShipmentItem = ({ shipment }: any) => (
    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
        <View style={styles.idSection}>
            <Text style={styles.idText}>{shipment.id}</Text>
            <View style={styles.routeContainer}>
                <Text style={styles.routeText} numberOfLines={1}>{shipment.origin}</Text>
                <View style={styles.dotSeparator} />
                <Text style={styles.routeText} numberOfLines={1}>{shipment.destination}</Text>
            </View>
        </View>

        <View style={styles.statusSection}>
            <View style={[styles.statusBadge, shipment.status === 'CANCELLED' ? styles.cancelledBadge : styles.resolvedBadge]}>
                <Text style={[styles.statusText, shipment.status === 'CANCELLED' ? styles.cancelledText : styles.resolvedText]}>
                    {shipment.status.split(' ')[0]}
                </Text>
            </View>
            <Text style={styles.dateText}>{shipment.date}</Text>
        </View>

        <View style={styles.amountSection}>
            <Text style={styles.amountText}>{shipment.amount}</Text>
            <ChevronRight size={16} color="#CBD5E0" />
        </View>
    </TouchableOpacity>
);

export const RecentShipments = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleGroup}>
                    <Text style={styles.title}>Recent Shipments</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>4</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.listContent}>
                        {MOCK_DATA.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <ShipmentItem shipment={item} />
                                {index < MOCK_DATA.length - 1 && <View style={styles.separator} />}
                            </React.Fragment>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        marginBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginBottom: 15,
    },
    titleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
    },
    countBadge: {
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    countText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#E67E22',
    },
    viewAll: {
        color: '#0984e3',
        fontSize: 13,
        fontWeight: '700',
    },
    listCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
    },
    listContent: {
        minWidth: '100%',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        minWidth: 420, // Ensure enough width for content to breathe
    },
    separator: {
        height: 1,
        backgroundColor: '#f5f6f7',
        marginHorizontal: 15,
    },
    idSection: {
        width: 150, // Fixed width for ID section
    },
    idText: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.2,
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    routeText: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#CBD5E0',
        marginHorizontal: 6,
    },
    statusSection: {
        width: 120, // Fixed width for Status section
        alignItems: 'flex-start',
        paddingLeft: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelledBadge: {
        backgroundColor: '#FFE5E5',
    },
    resolvedBadge: {
        backgroundColor: '#E6F9F4',
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    cancelledText: {
        color: '#D63031',
    },
    resolvedText: {
        color: '#00B894',
    },
    dateText: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 6,
        fontWeight: '600',
    },
    amountSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 5,
    },
    amountText: {
        fontSize: 15,
        fontWeight: '900',
        color: Colors.text,
        marginRight: 12,
    },
});


