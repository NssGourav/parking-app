import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Share, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Download, Share2, Car, MapPin, Clock, CreditCard, Hash } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import BottomNav from '../components/BottomNav';

function ParkingTicket() {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeParking, setActiveParking] = React.useState(null);
  const [ticketId, setTicketId] = React.useState('');
  const [vehicleData, setVehicleData] = React.useState(null);
  const [parkingLocation, setParkingLocation] = React.useState('');
  const [amountPaid, setAmountPaid] = React.useState(150);
  const [entryTime, setEntryTime] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [isRetrieving, setIsRetrieving] = React.useState(false);

  useEffect(() => {
    loadTicketData();
  }, []);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        navigation.navigate('Login');
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from('parking_sessions')
        .select(`
          *,
          vehicles (
            license_plate,
            model
          ),
          sites (
            name,
            address
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'retrieving'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;
      const session = sessionData && sessionData.length > 0 ? sessionData[0] : null;

      if (session) {
        setVehicleData({
          model: session.vehicle_model || session.vehicles?.model || 'Vehicle',
          license_plate: session.vehicle_number || session.vehicles?.license_plate || 'N/A'
        });
        setParkingLocation(session.sites?.name || 'Parking Location');
        const parkingAddress = session.sites?.address || 'Site Address';
        setTicketId(`TK-${session.id.slice(0, 8).toUpperCase()}`);
        setEntryTime(new Date(session.entry_time || session.created_at).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }));
        setAmountPaid(150);
        setActiveParking(session);
        setLoading(false);
        return;
      }

      // Fallback for immediate UI update or offline mode
      const storedActiveParking = await AsyncStorage.getItem('activeParking');
      if (storedActiveParking) {
        const parking = JSON.parse(storedActiveParking);

        if (parking.status === 'completed') {
          await AsyncStorage.removeItem('activeParking');
          navigation.navigate('Home');
          return;
        }

        setVehicleData({
          model: parking.vehicleModel || 'Vehicle',
          license_plate: parking.vehicle
        });
        setParkingLocation(parking.location);
        setAmountPaid(parking.amount || 150);
        setEntryTime(parking.entryTime);

        // Ensure the ID is consistently named for logic in retrieval
        parking.id = parking.id || parking.sessionId;
        setActiveParking(parking);
        setLoading(false);
        return;
      }

      navigation.navigate('Home');
    } catch (error) {

      navigation.navigate('Home');
    } finally {
      setLoading(false);
    }
  };

  const qrData = JSON.stringify({
    ticketId,
    vehicle: vehicleData?.license_plate || '',
    location: parkingLocation,
    entryTime: new Date().toISOString()
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My parking ticket for ${parkingLocation}`,
        title: 'Parking Ticket'
      });
    } catch (error) {

    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BottomNav />
      </View>
    );
  }

  if (!vehicleData) {
    return null; // Should be handled by navigation redirect
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onMomentumScrollEnd={() => { }}
      >

        <View style={styles.ticketCard}>
          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrData}
                size={200}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Ticket ID */}
          <View style={styles.ticketHeader}>
            <Hash size={16} color="#6b7280" />
            <Text style={styles.ticketIdLabel}>Ticket ID</Text>
          </View>
          <Text style={styles.ticketId}>{ticketId}</Text>

          {/* Vehicle Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Car size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Vehicle</Text>
            </View>
            <Text style={styles.infoValue}>{vehicleData.model}</Text>
            <Text style={styles.infoSubValue}>{vehicleData.license_plate}</Text>
          </View>

          {/* Location */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Location</Text>
            </View>
            <Text style={styles.infoValue}>{parkingLocation}</Text>
            <Text style={styles.infoSubValue}>{activeParking?.sites?.address || 'Site Address'}</Text>
          </View>

          {/* Entry Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Entry Time</Text>
            </View>
            <Text style={styles.infoValue}>{entryTime || '09:46 pm'}</Text>
            <Text style={styles.infoSubValue}>Duration: 0m</Text>
          </View>

          {/* Amount Paid */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <CreditCard size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Amount Paid</Text>
            </View>
            <Text style={styles.infoValue}>₹{amountPaid}</Text>
          </View>

          {/* Powered by */}
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered by Smart Parking</Text>
          </View>
        </View>


        <Pressable
          onPress={async () => {
            if (isRetrieving) return;
            setIsRetrieving(true);
            try {
              if (activeParking?.id) {
                await supabase
                  .from('parking_sessions')
                  .update({ status: 'retrieving', retrieved_at: new Date().toISOString() })
                  .eq('id', activeParking.id);
              }

              navigation.navigate('CustomerRetrievalProgress', {
                vehicle: vehicleData,
                location: parkingLocation,
                entryTime: entryTime,
                sessionId: activeParking?.id
              });
            } catch (error) {
              navigation.navigate('CustomerRetrievalProgress', {
                vehicle: vehicleData,
                location: parkingLocation,
                entryTime: entryTime,
                sessionId: activeParking?.id
              });
            } finally {
              setIsRetrieving(false);
            }
          }}
          style={({ pressed }) => [
            styles.actionButton,
            styles.primaryButton,
            (pressed || isRetrieving) && { opacity: 0.8 }
          ]}
          disabled={isRetrieving}
        >
          {isRetrieving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Car size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Get My Car</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.secondaryButton,
            pressed && { opacity: 0.8 }
          ]}
        >
          <Download size={20} color="#374151" />
          <Text style={styles.secondaryButtonText}>Download Ticket</Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.actionButton,
            styles.secondaryButton,
            pressed && { opacity: 0.8 }
          ]}
        >
          <Share2 size={20} color="#374151" />
          <Text style={styles.secondaryButtonText}>Share Ticket</Text>
        </Pressable>

        {/* Hint Box */}
        <View style={styles.hintBox}>
          <Text style={styles.hintIcon}>📱</Text>
          <View style={styles.hintContent}>
            <Text style={styles.hintTitle}>Keep this ticket handy</Text>
            <Text style={styles.hintText}>Show this QR code when retrieving your vehicle</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
    gap: 12,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ticketIdLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  ticketId: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  infoSubValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  poweredBy: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  poweredByText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  hintBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  hintIcon: {
    fontSize: 20,
  },
  hintContent: {
    flex: 1,
  },
  hintTitle: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#b45309',
  },
});

export default ParkingTicket;
