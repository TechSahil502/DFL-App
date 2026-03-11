import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../Colors';
import { TrendingUp, Package, CheckCircle, Truck, Wallet } from 'lucide-react-native';

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    color: string;
    type: 'spend' | 'active' | 'delivered' | 'transit';
}

const icons = {
    spend: Wallet,
    active: Package,
    delivered: CheckCircle,
    transit: Truck,
};

export const StatCard = ({ title, value, subtitle, color, type }: StatCardProps) => {
    const Icon = icons[type];

    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <View style={styles.leftContent}>
                <Text style={styles.value}>{value}</Text>
                {subtitle && (
                    <View style={styles.subtitleContainer}>
                        <TrendingUp size={12} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>
                )}
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.iconContainer}>
                <Icon size={24} color="rgba(255,255,255,0.4)" />
            </View>
            <View style={styles.circleDecoration} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 100,
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
        elevation: 2,
    },
    leftContent: {
        zIndex: 2,
        flex: 1,
    },
    value: {
        fontSize: 20,
        fontWeight: '900',
        color: Colors.white,
    },
    title: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 10,
        textTransform: 'uppercase',
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    subtitle: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        marginLeft: 4,
        fontWeight: '600',
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    circleDecoration: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 1,
    }
});
