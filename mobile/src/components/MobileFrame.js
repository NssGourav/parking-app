import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LoginAs from './LoginAs';

function MobileFrame({ children }) {
  const route = useRoute();
  const routeName = route.name;
  
  const showLoginAs = routeName !== 'Login' && 
                      routeName !== 'Register' && 
                      routeName !== 'ScanQR' &&
                      routeName !== 'ConfirmParking' &&
                      routeName !== 'ParkingTicket' &&
                      routeName !== 'RetrievalProgress';
  const isScanPage = routeName === 'ScanQR';
  const isConfirmPage = routeName === 'ConfirmParking' || routeName === 'ParkingTicket' || routeName === 'RetrievalProgress';

  return (
    <View style={styles.container}>
      <View style={[
        styles.phoneFrame,
        (isScanPage || isConfirmPage) && styles.phoneFrameFull
      ]}>
        <View style={[
          styles.content,
          isScanPage && styles.contentScan,
          isConfirmPage && styles.contentConfirm
        ]}>
          {children}
        </View>
      </View>
      {showLoginAs && <LoginAs />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 390,
    flex: 1,
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
    padding: 4,
  },
  phoneFrameFull: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    overflow: 'hidden',
  },
  contentScan: {
    backgroundColor: '#111827',
  },
  contentConfirm: {
    backgroundColor: '#ffffff',
  },
});

export default MobileFrame;

