import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing, StatusBar } from 'react-native';
import { Truck } from 'lucide-react-native';
import { Colors } from '../Colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
    onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
    const truckPosition = useRef(new Animated.Value(-width)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // 1. Smoothly bring the truck in and scale it up
        Animated.parallel([
            Animated.timing(truckPosition, {
                toValue: 0,
                duration: 1800,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 1800,
                useNativeDriver: true,
            }),
        ]).start();

        // 2. Fade in text after truck is almost there
        setTimeout(() => {
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        }, 1200);

        // 3. Exit sequence
        setTimeout(() => {
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(() => {
                onAnimationComplete();
            });
        }, 5200);
    }, [onAnimationComplete, truckPosition, textOpacity, containerOpacity, logoScale]);

    return (
        <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <View style={styles.centerContent}>
                <Animated.View style={{
                    transform: [
                        { translateX: truckPosition },
                        { scale: logoScale }
                    ]
                }}>
                    <View style={styles.truckContainer}>
                        <Truck size={100} color={Colors.white} strokeWidth={1.5} />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                    <Text style={styles.brandName}>DFL Logistics</Text>
                    <View style={styles.taglineBorder} />
                    <Text style={styles.tagline}>Fast • Reliable • Nationwide</Text>
                </Animated.View>
            </View>

            <View style={styles.loadingBarContainer}>
                <Animated.View style={[
                    styles.loadingBar,
                    {
                        width: textOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                        })
                    }
                ]} />
            </View>

            <View style={styles.footer}>
                <Text style={styles.version}>PREMIUM DELIVERY SERVICE</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    truckContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 25,
        borderRadius: 75,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 15,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    brandName: {
        fontSize: 42,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    taglineBorder: {
        height: 3,
        width: 80,
        backgroundColor: Colors.white,
        marginVertical: 15,
        borderRadius: 2,
    },
    tagline: {
        fontSize: 16,
        color: Colors.white,
        opacity: 0.9,
        letterSpacing: 4,
        fontWeight: '500',
    },
    loadingBarContainer: {
        position: 'absolute',
        bottom: 120,
        width: width * 0.6,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingBar: {
        height: '100%',
        backgroundColor: Colors.white,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    version: {
        color: Colors.white,
        opacity: 0.5,
        fontSize: 12,
        letterSpacing: 5,
        fontWeight: '600',
    },
});
