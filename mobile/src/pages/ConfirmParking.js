import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Check, Phone, Building2, CreditCard, Wallet, MapPin, Car } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

function ConfirmParking() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const vehicleData = route.params?.vehicle || {
    model: 'Honda Civic',
    license_plate: 'MH 14 CD 5678'
  };
  const parkingLocation = route.params?.location || 'Inorbit Mall';

  const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: Phone },
    { id: 'netbanking', label: 'Netbanking', icon: Building2 },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'cash', label: 'Cash', icon: Wallet }
  ];

  const handlePark = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Session expired. Please login again.');
        setIsProcessing(false);
        return;
      }

      const requestedSiteId = route.params?.site?.id;

      // Ensure we have a site ID
      let finalSiteId = requestedSiteId;
      if (!finalSiteId) {
        const { data: firstSite } = await supabase.from('sites').select('id').eq('is_active', true).limit(1).single();
        finalSiteId = firstSite?.id;
      }

      if (!finalSiteId) {
        Alert.alert('Error', 'No valid parking site found. Please scan QR again.');
        setIsProcessing(false);
        return;
      }

      // 1. Attempt High-Performance Consolidated RPC Call
      // This handles cleanup, session creation, and transaction in a SINGLE round-trip
      const { data: rpcData, error: rpcError } = await supabase.rpc('start_parking_session_v1', {
        p_user_id: user.id,
        p_vehicle_id: route.params?.vehicle?.id || null,
        p_site_id: finalSiteId,
        p_vehicle_number: vehicleData.license_plate,
        p_vehicle_model: vehicleData.model,
        p_payment_method: selectedPayment,
        p_amount: 150.00,
        p_base_rate: 100.00,
        p_service_fee: 30.00,
        p_gst: 20.00
      });

      let session;

      if (!rpcError && rpcData) {
        session = rpcData;
      } else {
        // 2. Fallback to Legacy Sequential Mode (if RPC is not yet migrated)
        // Note: This is slower due to multiple network round-trips

        // Cleanup existing sessions
        await supabase
          .from('parking_sessions')
          .update({ status: 'completed', exit_time: new Date().toISOString() })
          .eq('user_id', user.id)
          .in('status', ['active', 'retrieving']);

        // Create new session
        const sessionData = {
          user_id: user.id,
          vehicle_id: route.params?.vehicle?.id || null,
          site_id: finalSiteId,
          vehicle_number: vehicleData.license_plate,
          vehicle_type: 'car',
          vehicle_model: vehicleData.model,
          entry_time: new Date().toISOString(),
          status: 'active'
        };

        const { data: newSession, error: sessionError } = await supabase
          .from('parking_sessions')
          .insert(sessionData)
          .select()
          .single();

        if (sessionError) throw sessionError;
        session = newSession;

        // Create transaction
        const transactionData = {
          user_id: user.id,
          vehicle_id: route.params?.vehicle?.id || null,
          site_id: finalSiteId,
          parking_session_id: session.id,
          amount: 150.00,
          base_rate: 100.00,
          service_fee: 30.00,
          gst: 20.00,
          payment_method: selectedPayment,
          status: 'completed',
          completed_at: new Date().toISOString()
        };

        const { error: transError } = await supabase
          .from('transactions')
          .insert(transactionData);

        if (transError) throw transError;
      }

      // 3. Finalize and Navigate
      const activeParkingData = {
        sessionId: session.id,
        location: parkingLocation,
        vehicle: vehicleData.license_plate,
        vehicleModel: vehicleData.model,
        amount: 150,
        entryTime: new Date(session.entry_time || session.created_at).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        startTime: session.entry_time || session.created_at || new Date().toISOString()
      };
      await AsyncStorage.setItem('activeParking', JSON.stringify(activeParkingData));

      navigation.navigate('ParkingTicket', {
        sessionId: session.id,
        vehicle: vehicleData,
        location: parkingLocation,
        amount: 150
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start parking session. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Parking</Text>
      </View>


      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Check size={16} color="#ffffff" />
        </View>
        <Text style={styles.bannerText}>Auto-filled from saved vehicle</Text>
      </View>


      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Car size={20} color="#4b5563" />
            </View>
            <Text style={styles.cardTitle}>Vehicle Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Owner</Text>
              <Text style={styles.detailValue}>{vehicleData.owner_name || vehicleData.owner || 'Owner'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{vehicleData.model}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Number Plate</Text>
              <Text style={styles.detailValue}>{vehicleData.license_plate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mobile</Text>
              <Text style={styles.detailValue}>{vehicleData.owner_phone || vehicleData.phone || 'N/A'}</Text>
            </View>
          </View>
        </View>


        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <MapPin size={20} color="#4b5563" />
            </View>
            <Text style={styles.cardTitle}>Parking Location</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardValue}>{parkingLocation}</Text>
            <Text style={styles.cardSubtext}>Malad West, Mumbai</Text>
          </View>
        </View>


        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.sectionSubtitle}>Choose how you want to pay</Text>

          <View style={styles.paymentGrid}>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPayment === method.id;

              return (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedPayment(method.id)}
                  style={[
                    styles.paymentButton,
                    isSelected && styles.paymentButtonSelected
                  ]}
                >
                  <View style={[
                    styles.paymentIconContainer,
                    isSelected && styles.paymentIconContainerSelected
                  ]}>
                    <Icon size={24} color={isSelected ? '#ffffff' : '#4b5563'} />
                  </View>
                  <Text style={[
                    styles.paymentLabel,
                    isSelected && styles.paymentLabelSelected
                  ]}>
                    {method.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.paymentCheck}>
                      <Check size={12} color="#ffffff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>


        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Base Rate:</Text>
              <Text style={styles.summaryValue}>₹100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee:</Text>
              <Text style={styles.summaryValue}>₹30</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%):</Text>
              <Text style={styles.summaryValue}>₹20</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
              <Text style={styles.summaryTotalValue}>₹150</Text>
            </View>
          </View>
        </View>
      </ScrollView>


      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handlePark}
          disabled={isProcessing}
          style={[
            styles.parkButton,
            isProcessing && styles.parkButtonProcessing
          ]}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.parkButtonText}>Processing Payment...</Text>
            </>
          ) : (
            <>
              <Car size={20} color="#ffffff" />
              <Text style={styles.parkButtonText}>Park My Car</Text>
            </>
          )}
        </Pressable>
      </View>

      <BottomNav />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    paddingBottom: 180,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: '#111827',
  },
  cardContent: {
    gap: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#111827',
  },
  cardSubtext: {
    fontSize: 14,
    color: '#4b5563',
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentButton: {
    width: '47%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  paymentButtonSelected: {
    borderColor: '#a855f7',
    backgroundColor: '#faf5ff',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  paymentIconContainerSelected: {
    backgroundColor: '#a855f7',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#374151',
  },
  paymentLabelSelected: {
    color: '#7c3aed',
  },
  paymentCheck: {
    width: 20,
    height: 20,
    backgroundColor: '#a855f7',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  summary: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 16,
    color: '#111827',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  parkButton: {
    width: '100%',
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  parkButtonProcessing: {
    opacity: 0.7,
  },
  parkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmParking;

