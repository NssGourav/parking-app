import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Car, X } from 'lucide-react-native';

function ScanQR() {
  const navigation = useNavigation();
  const route = useRoute();
  const [scanning, setScanning] = useState(true);
  const [qrDetected, setQrDetected] = useState(false);
  const [showVehicleSheet, setShowVehicleSheet] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSite, setActiveSite] = useState(null);
  const [location, setLocation] = useState('');

  useEffect(() => {
    // Parallelize loading for performance
    const init = async () => {
      await Promise.all([loadVehicles(), loadSites()]);
    };
    init();

    // Reduced simulation delay for better UX
    const scanTimer = setTimeout(() => {
      setScanning(false);
      setQrDetected(true);
    }, 1000);

    return () => clearTimeout(scanTimer);
  }, []);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (data && !error) {
        setActiveSite(data);
        setLocation(data.name);

        if (route.params?.skipScan) {
          setScanning(false);
          setQrDetected(true);
          setShowVehicleSheet(true);
        }
      }
    } catch (error) {
      setLocation('Inorbit Mall');
    }
  };

  useEffect(() => {
    if (qrDetected && activeSite) {
      // Show immediately rather than waiting 500ms
      setShowVehicleSheet(true);
    }
  }, [qrDetected, activeSite]);

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setVehicles(data);
          setLoading(false);
          return;
        }
      }


      const storedVehicles = await AsyncStorage.getItem('vehicles');
      if (storedVehicles) {
        const savedVehicles = JSON.parse(storedVehicles);
        setVehicles(savedVehicles);
      } else {
        setVehicles([]);
      }
    } catch (error) {

      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <X size={24} color="#ffffff" />
        </Pressable>
      </View>


      <View style={styles.scannerArea}>
        <View style={styles.viewfinder}>
          {scanning ? (
            <>
              <ActivityIndicator size="large" color="#a78bfa" />
            </>
          ) : (
            <View style={styles.qrIconContainer}>
              <View style={styles.qrIcon}>
                <Text style={styles.qrIconText}>QR</Text>
              </View>
            </View>
          )}
        </View>


        {!qrDetected && (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Position QR code within frame</Text>
            <Text style={styles.instructionText}>The scanner will automatically detect the code</Text>
          </View>
        )}


        {qrDetected && (
          <View style={styles.detectionStatus}>
            <Text style={styles.detectionTitle}>QR Code Detected!</Text>
            {location && (
              <Text style={styles.detectionLocation}>{location}</Text>
            )}
          </View>
        )}
      </View>


      {showVehicleSheet && (
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />

          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Select Your Vehicle</Text>
            <Text style={styles.sheetSubtitle}>
              Choose which vehicle you're parking at {location}
            </Text>


            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading vehicles...</Text>
              </View>
            ) : vehicles.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No vehicles found</Text>
              </View>
            ) : (
              <ScrollView style={styles.vehicleList}>
                {vehicles.map((vehicle) => (
                  <Pressable
                    key={vehicle.id}
                    onPress={() => {
                      setSelectedVehicle(vehicle.id);
                      navigation.navigate('ConfirmParking', {
                        vehicle,
                        site: activeSite,
                        location: activeSite?.name || 'Inorbit Mall'
                      });
                    }}
                    style={[
                      styles.vehicleButton,
                      selectedVehicle === vehicle.id && styles.vehicleButtonSelected
                    ]}
                  >
                    <View style={styles.vehicleContent}>
                      <View style={styles.vehicleIconContainer}>
                        <Car size={24} color="#4b5563" />
                      </View>
                      <View style={styles.vehicleInfo}>
                        <Text style={styles.vehicleModel}>
                          {vehicle.model || 'Vehicle'}
                        </Text>
                        <Text style={styles.vehiclePlate}>
                          {vehicle.license_plate}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.vehicleArrow}>›</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}


            <Pressable
              onPress={() => navigation.navigate('RegisterVehicle', {
                site: activeSite,
                location: activeSite?.name || location
              })}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.registerButtonPressed
              ]}
            >
              <Text style={styles.registerButtonText}>Register New Vehicle</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  scannerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  viewfinder: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: '#a78bfa',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    opacity: 0.8,
  },
  qrIconContainer: {
    width: 128,
    height: 128,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIcon: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconText: {
    color: '#6b7280',
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructionContainer: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  detectionStatus: {
    marginTop: 32,
    alignItems: 'center',
  },
  detectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  detectionLocation: {
    color: '#a78bfa',
    fontSize: 16,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 16,
    height: '75%',
  },
  dragHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#6b7280',
  },
  vehicleList: {
    marginBottom: 16,
    maxHeight: 400,
  },
  vehicleButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderColor: '#e5e7eb',
  },
  vehicleButtonSelected: {
    borderColor: '#a855f7',
    backgroundColor: '#faf5ff',
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    alignItems: 'flex-start',
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  vehicleArrow: {
    color: '#9ca3af',
    fontSize: 20,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#a855f7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScanQR;

