import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/UserSide/screens/DashboardScreen';
import { BookShipmentScreen } from './src/UserSide/screens/BookShipmentScreen';
import { MyBookingsScreen } from './src/UserSide/screens/MyBookingsScreen';
import { SplashScreen } from './src/UserSide/screens/SplashScreen';
import { ShipmentDetailsScreen } from './src/UserSide/screens/ShipmentDetailsScreen';
import { ManifestsScreen } from './src/UserSide/screens/ManifestsScreen';
import { DraftsScreen } from './src/UserSide/screens/DraftsScreen';
import { RateCalculatorScreen } from './src/UserSide/screens/RateCalculatorScreen';
import { BulkOrdersScreen } from './src/UserSide/screens/BulkOrdersScreen';
import { HeavyWeightQuoteScreen } from './src/UserSide/screens/HeavyWeightQuoteScreen';
import { RechargeWalletScreen } from './src/UserSide/screens/RechargeWalletScreen';
import { BookingsStore } from './src/UserSide/store/bookingsStore';

function App() {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedShipmentId, setSelectedShipmentId] = useState('');

  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  const navigateWithData = (screen: string, data?: any) => {
    if (screen === 'Shipment Details' && data) {
      setSelectedShipmentId(data);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={navigateWithData} />;
      case 'Book Shipment':
        return <BookShipmentScreen onNavigate={navigateWithData} />;
      case 'My Bookings':
        return <MyBookingsScreen onNavigate={navigateWithData} />;
      case 'Shipment Details':
        return <ShipmentDetailsScreen onNavigate={navigateWithData} shipmentId={selectedShipmentId} />;
      case 'Manifests':
        return <ManifestsScreen onNavigate={navigateWithData} />;
      case 'Drafts':
        return <DraftsScreen onNavigate={navigateWithData} />;
      case 'Rate Calculator':
        return <RateCalculatorScreen onNavigate={navigateWithData} />;
      case 'Bulk Orders':
        return <BulkOrdersScreen onNavigate={navigateWithData} />;
      case 'Heavy Weight Quotes':
        return <HeavyWeightQuoteScreen onNavigate={navigateWithData} />;
      case 'Recharge Wallet':
        return <RechargeWalletScreen onNavigate={navigateWithData} />;
      default:
        return <DashboardScreen onNavigate={navigateWithData} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}

export default App;