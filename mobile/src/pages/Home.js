import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Trophy, Car, Camera, MapPin, Clock, ArrowRight, ParkingCircle } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

function Home() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [activeParking, setActiveParking] = useState(null);
  const [recentParking, setRecentParking] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const calculateDuration = (startTime) => {
    if (!startTime) return '0m';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;


      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);


      const { data: sessionData, error: activeError } = await supabase
        .from('parking_sessions')
        .select(`
          *,
          vehicles (
            license_plate,
            model
          ),
          sites (
            name
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'retrieving'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeError) throw activeError;

      const activeData = sessionData && sessionData.length > 0 ? sessionData[0] : null;

      if (activeData) {
        activeData.duration = calculateDuration(activeData.created_at);
        setActiveParking(activeData);
      } else {
        setActiveParking(null);
      }

      // Recent History
      const { data: historyData } = await supabase
        .from('transactions')
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
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentParking(historyData || []);

      // Fetch all user vehicles
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setMyVehicles(vehicleData || []);

    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeParking) return;
    const interval = setInterval(() => {
      setActiveParking(prev => {
        if (!prev) return null;
        return {
          ...prev,
          duration: calculateDuration(prev.created_at)
        };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [activeParking]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <BottomNav />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.outerContainer, { opacity: fadeAnim }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Smart Parking</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {profile?.full_name || 'User'}!
          </Text>

          <View style={styles.premiumBanner}>
            <View style={styles.premiumContent}>
              <View style={styles.premiumRow}>
                <Trophy size={16} color="#ffffff" />
                <Text style={styles.premiumBadge}>#1 IN INDIA</Text>
              </View>
              <Text style={styles.premiumTitle}>Premium Parking Solution</Text>
              <Text style={styles.premiumSubtitle}>Trusted by 1M+ users nationwide</Text>
            </View>
            <Car size={32} color="#ffffff" />
          </View>
        </View>


        <Pressable
          onPress={() => navigation.navigate('ScanQR')}
          style={({ pressed }) => [
            styles.scanCard,
            pressed && styles.scanCardPressed
          ]}
        >
          <View style={styles.scanIconContainer}>
            <Camera size={28} color="#ffffff" />
          </View>
          <View style={styles.scanContent}>
            <Text style={styles.scanTitle}>Scan to Park</Text>
            <Text style={styles.scanSubtitle}>Scan QR code at parking entrance</Text>
          </View>
          <ArrowRight size={24} color="#6366f1" />
        </Pressable>


        {myVehicles.length > 0 && (
          <View style={styles.vehiclesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Vehicles</Text>
              <Text style={styles.vehicleCount}>{myVehicles.length} Total</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vehiclesScroll}
            >
              {myVehicles.map((vehicle) => (
                <View key={vehicle.id} style={styles.vehicleFleetCard}>
                  <View style={styles.fleetIconContainer}>
                    <Car size={20} color="#6366f1" />
                  </View>
                  <Text style={styles.fleetModel} numberOfLines={1}>
                    {vehicle.model}
                  </Text>
                  <Text style={styles.fleetPlate}>
                    {vehicle.license_plate}
                  </Text>
                </View>
              ))}
              <Pressable
                onPress={() => navigation.navigate('RegisterVehicle')}
                style={styles.addVehicleCard}
              >
                <View style={[styles.fleetIconContainer, { backgroundColor: '#f3f4f6' }]}>
                  <Text style={{ fontSize: 20, color: '#9ca3af' }}>+</Text>
                </View>
                <Text style={styles.addVehicleText}>Add New</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}


        {activeParking && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>Active Parking</Text>
            <Pressable
              onPress={() => navigation.navigate('ParkingTicket')}
              style={({ pressed }) => [
                styles.activeCard,
                pressed && styles.activeCardPressed
              ]}
            >
              <View style={styles.activeIconContainer}>
                <ParkingCircle size={24} color="#ffffff" />
              </View>
              <View style={styles.activeContent}>
                <Text style={styles.activeTitle}>{activeParking.sites?.name || 'Parking Session'}</Text>
                <View style={styles.activeDetails}>
                  <View style={styles.activeDetailItem}>
                    <Clock size={16} color="#4b5563" />
                    <Text style={styles.activeDetailText}>
                      {new Date(activeParking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.activeDetailItem}>
                    <Car size={16} color="#4b5563" />
                    <Text style={styles.activeDetailText}>
                      {activeParking.vehicle_number || activeParking.vehicles?.license_plate || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.activeBadgeContainer}>
                  <Text style={styles.activeBadge}>
                    {activeParking.status === 'retrieving' ? 'Retrieving' : 'Parked'} - {activeParking.duration}
                  </Text>
                </View>
              </View>
              <ArrowRight size={24} color="#16a34a" />
            </Pressable>
          </View>
        )}


        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Parking</Text>
          <View style={styles.recentList}>
            {recentParking.length === 0 ? (
              <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 20 }}>
                No recent activity
              </Text>
            ) : (
              recentParking.map((parking) => (
                <View key={parking.id} style={styles.recentCard}>
                  <View style={styles.recentHeader}>
                    <Text style={styles.recentSiteName}>{parking.sites?.name || 'Parking Site'}</Text>
                    <Text style={styles.recentCost}>₹{parking.amount}</Text>
                  </View>
                  <View style={styles.recentLocation}>
                    <MapPin size={16} color="#4b5563" />
                    <Text style={styles.recentLocationText}>{parking.sites?.address || 'Site Address'}</Text>
                  </View>
                  <View style={styles.recentStatus}>
                    <Text style={styles.recentStatusText}>{parking.status}</Text>
                  </View>
                  <View style={styles.recentMeta}>
                    <View style={styles.recentMetaItem}>
                      <Clock size={16} color="#4b5563" />
                      <Text style={styles.recentMetaText}>
                        {new Date(parking.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.recentMetaItem}>
                      <Car size={16} color="#4b5563" />
                      <Text style={styles.recentMetaText}>
                        {parking.vehicles?.license_plate}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <BottomNav />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    paddingBottom: 160,
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 16,
  },
  premiumBanner: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumContent: {
    flex: 1,
    gap: 4,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  premiumSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  scanCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
    elevation: 2,
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanContent: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scanSubtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
  vehiclesSection: {
    marginTop: 24,
    paddingLeft: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 16,
  },
  vehicleCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  vehiclesScroll: {
    paddingRight: 20,
    gap: 12,
  },
  vehicleFleetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: 140,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fleetIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fleetModel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  fleetPlate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  addVehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVehicleText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 8,
  },
  activeSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  activeCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeContent: {
    flex: 1,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  activeDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  activeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDetailText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeBadgeContainer: {
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  recentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentSiteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  recentCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  recentLocationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  recentStatus: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 99,
    marginBottom: 8,
  },
  recentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    textTransform: 'capitalize',
  },
  recentMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  recentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentContainer: {
    paddingBottom: 100,
  },
});

export default Home;
