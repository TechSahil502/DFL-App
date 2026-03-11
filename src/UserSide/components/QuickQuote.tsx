import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Zap, ArrowRight } from 'lucide-react-native';
import { Colors } from '../Colors';

export const QuickQuote = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <Zap size={16} color={Colors.cardOrange} />
                    <Text style={styles.title}>Quick Quote</Text>
                </View>
                <Text style={styles.subtitle}>Check shipping rates instantly</Text>
            </View>

            <View style={styles.formContent}>
                <View style={styles.inputsGrid}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Origin pincode</Text>
                        <TextInput style={styles.input} placeholder="e.g. 110001" placeholderTextColor="#ccc" keyboardType="numeric" />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Destination pincode</Text>
                        <TextInput style={styles.input} placeholder="e.g. 400001" placeholderTextColor="#ccc" keyboardType="numeric" />
                    </View>
                </View>

                <View style={styles.weightRow}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Weight (KG)</Text>
                        <TextInput style={styles.input} placeholder="e.g. 0.5" placeholderTextColor="#ccc" keyboardType="numeric" />
                    </View>
                    <TouchableOpacity style={styles.checkRatesButton}>
                        <Text style={styles.buttonText}>Check Rates</Text>
                        <ArrowRight size={16} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 15,
        marginTop: 20,
    },
    header: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.text,
        marginLeft: 8,
    },
    subtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    formContent: {
        gap: 12,
    },
    inputsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 8,
    },
    label: {
        fontSize: 9,
        color: '#999',
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    input: {
        fontSize: 13,
        color: Colors.text,
        padding: 0,
        height: 24,
        fontWeight: '600',
    },
    weightRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    checkRatesButton: {
        backgroundColor: '#003049',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
    },
    buttonText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '700',
        marginRight: 8,
    }
});
