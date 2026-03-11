import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    useWindowDimensions,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import {
    Info,
    ChevronDown,
    MapPin,
    Package,
    ArrowRight
} from 'lucide-react-native';
import { Colors } from '../Colors';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const CountryPicker = ({ visible, onClose, onSelect }: { visible: boolean, onClose: () => void, onSelect: (country: string) => void }) => {
    const countries = [
        "India", "United States", "United Kingdom", "Canada", "Australia",
        "United Arab Emirates", "Singapore", "Germany", "France"
    ];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Country</Text>
                    <FlatList
                        data={countries}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.countryOption}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.countryOptionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export const HeavyWeightQuoteScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [serviceMode, setServiceMode] = useState<'Schedule Pickup' | 'Drop off at Warehouse'>('Schedule Pickup');
    const [country, setCountry] = useState('Select Country...');
    const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);

    const BoxIllustration = () => (
        <View style={styles.illustrationContainer}>
            <View style={styles.boxWireframe}>
                {/* Simplified Isometric Box Wireframe */}
                <View style={styles.boxTop} />
                <View style={styles.boxFront} />
                <View style={styles.boxRight} />
                <Text style={styles.dimensionLabelL}>L</Text>
                <Text style={styles.dimensionLabelB}>B</Text>
                <Text style={styles.dimensionLabelH}>H</Text>
                <View style={styles.arrowL} />
                <View style={styles.arrowB} />
                <View style={styles.arrowH} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={{ width: isMobile ? 56 : 72 }} />
            <Sidebar
                isExpanded={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                activeScreen="Heavy Weight Quotes"
                onNavigate={onNavigate}
            />

            <View style={styles.mainContent}>
                <Header onNavigate={onNavigate} onToggleSidebar={() => setIsSidebarOpen(true)} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.contentLayout, { flexDirection: isMobile ? 'column' : 'row' }]}>

                        {/* Right Section: Tips - Now FIRST */}
                        <View style={[styles.tipsSection, !isMobile && { flex: 0.8 }]}>
                            <View style={styles.tipsCard}>
                                <Text style={styles.tipsTitle}>Quick Tips</Text>

                                <BoxIllustration />

                                <View style={styles.tipsContent}>
                                    <Text style={styles.tipsHeader}>Have a heavy-weight consignment to ship?</Text>
                                    <Text style={styles.tipsDescription}>
                                        We've got the perfect solution for you! Our logistics experts ensure safe, efficient, and cost-effective transportation, no matter the load.
                                    </Text>
                                    <Text style={styles.tipsHighlight}>Plus, we have special offers for bulk shipments!</Text>
                                    <Text style={styles.tipsDescription}>
                                        Simply fill out the form, and our team will get in touch with you ASAP to provide the best shipping options tailored to your needs.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Left Section: Form - Now SECOND */}
                        <View style={[styles.formSection, !isMobile && { flex: 1.2, marginRight: 24 }]}>
                            <View style={styles.formCard}>
                                <Text style={styles.screenTitle}>Request Heavy Weight Quote</Text>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, isMobile && { minWidth: '100%' }]}>
                                        <Text style={styles.label}>Weight <Text style={styles.required}>*</Text></Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput placeholder="Eg. 1.25" style={styles.input} placeholderTextColor="#9CA3AF" />
                                            <Text style={styles.unitText}>kg</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.inputGroup, isMobile && { minWidth: '100%' }]}>
                                        <Text style={styles.label}>No. of Boxes <Text style={styles.required}>*</Text></Text>
                                        <TextInput placeholder="Enter No. of Boxes..." style={styles.input} placeholderTextColor="#9CA3AF" />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Service Mode <Text style={styles.required}>*</Text></Text>
                                    <View style={styles.radioRow}>
                                        <TouchableOpacity
                                            style={styles.radioButton}
                                            onPress={() => setServiceMode('Schedule Pickup')}
                                        >
                                            <View style={[styles.radioCircle, serviceMode === 'Schedule Pickup' && styles.radioActive]}>
                                                {serviceMode === 'Schedule Pickup' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.radioLabel}>Schedule Pickup</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.radioButton}
                                            onPress={() => setServiceMode('Drop off at Warehouse')}
                                        >
                                            <View style={[styles.radioCircle, serviceMode === 'Drop off at Warehouse' && styles.radioActive]}>
                                                {serviceMode === 'Drop off at Warehouse' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.radioLabel}>Drop off at Warehouse</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {serviceMode === 'Schedule Pickup' && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Pickup Location <Text style={styles.required}>*</Text></Text>
                                        <TextInput placeholder="Enter Pickup City/Area..." style={styles.input} placeholderTextColor="#9CA3AF" />
                                    </View>
                                )}

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, isMobile && { minWidth: '100%' }]}>
                                        <Text style={styles.label}>Country <Text style={styles.required}>*</Text></Text>
                                        <TouchableOpacity
                                            style={[styles.input, styles.pickerTrigger]}
                                            onPress={() => setIsCountryPickerVisible(true)}
                                        >
                                            <Text style={[styles.pickerText, country === 'Select Country...' && { color: '#9CA3AF' }]}>{country}</Text>
                                            <ChevronDown size={18} color="#4B5563" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.inputGroup, isMobile && { minWidth: '100%' }]}>
                                        <Text style={styles.label}>Destination Zip Code</Text>
                                        <TextInput placeholder="Enter Pin Code..." style={styles.input} placeholderTextColor="#9CA3AF" />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.submitBtn}>
                                    <Text style={styles.submitBtnText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </View>

            <CountryPicker
                visible={isCountryPickerVisible}
                onClose={() => setIsCountryPickerVisible(false)}
                onSelect={setCountry}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 24,
    },
    contentLayout: {
        gap: 24,
    },
    formSection: {
        flex: 1,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 32,
    },
    row: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    inputGroup: {
        flex: 1,
        minWidth: 200, // Reduced to allow better wrapping on small devices
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        color: '#1F2937',
        fontSize: 14,
        textAlignVertical: 'center',
    },
    unitText: {
        position: 'absolute',
        right: 16,
        color: '#6B7280',
        fontSize: 14,
    },
    radioRow: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: '#003049',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#003049',
    },
    radioLabel: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    pickerTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 14,
        color: '#1F2937',
    },
    submitBtn: {
        backgroundColor: '#003049',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignSelf: 'flex-end',
        marginTop: 12,
        marginBottom: 40, // Extra margin for mobile nav
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    tipsSection: {
        flex: 1,
    },
    tipsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        height: '100%',
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 32,
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        height: 280,
        marginBottom: 32,
    },
    boxWireframe: {
        width: 200,
        height: 150,
        position: 'relative',
    },
    boxTop: {
        position: 'absolute',
        top: 20,
        left: 40,
        width: 120,
        height: 60,
        borderWidth: 2,
        borderColor: '#003049',
        transform: [{ skewX: '-30deg' }, { scaleY: 0.5 }],
        backgroundColor: 'rgba(0, 48, 73, 0.05)',
    },
    boxFront: {
        position: 'absolute',
        top: 50,
        left: 31,
        width: 103,
        height: 80,
        borderWidth: 2,
        borderColor: '#003049',
        backgroundColor: 'rgba(0, 48, 73, 0.05)',
    },
    boxRight: {
        position: 'absolute',
        top: 50,
        left: 134,
        width: 35,
        height: 80,
        borderWidth: 2,
        borderColor: '#003049',
        transform: [{ skewY: '-30deg' }],
        backgroundColor: 'rgba(0, 48, 73, 0.05)',
    },
    dimensionLabelL: { position: 'absolute', bottom: 10, left: 80, fontSize: 12, fontWeight: '700', color: '#003049' },
    dimensionLabelB: { position: 'absolute', top: 20, right: 20, fontSize: 12, fontWeight: '700', color: '#003049' },
    dimensionLabelH: { position: 'absolute', top: 70, right: 10, fontSize: 12, fontWeight: '700', color: '#003049' },
    arrowL: {
        position: 'absolute', bottom: 2, left: 31, width: 103, height: 2, backgroundColor: '#003049',
        transform: [{ translateY: 10 }]
    },
    arrowB: {
        position: 'absolute', top: 30, right: 15, width: 40, height: 2, backgroundColor: '#003049',
        transform: [{ rotate: '-30deg' }]
    },
    arrowH: {
        position: 'absolute', top: 50, right: 15, width: 2, height: 80, backgroundColor: '#003049',
    },
    tipsContent: {
        gap: 16,
    },
    tipsHeader: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        lineHeight: 22,
    },
    tipsDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
    },
    tipsHighlight: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 20,
    },
    countryOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    countryOptionText: {
        fontSize: 16,
        color: '#4B5563',
    },
});
