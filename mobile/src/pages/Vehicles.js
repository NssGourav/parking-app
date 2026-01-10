import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Car, Pencil, Trash2, Plus } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

export default function Vehicles({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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


      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);

    } catch (error) {

      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (vehicleId) => {
    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to remove this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase
                .from('vehicles')
                .update({ is_active: false })
                .eq('id', vehicleId)
                .eq('user_id', user.id);

              if (error) throw error;

              // Sync with AsyncStorage
              try {
                const stored = await AsyncStorage.getItem('vehicles');
                if (stored) {
                  const saved = JSON.parse(stored);
                  const filtered = saved.filter(v => (v.id || v.vehicle_id) !== vehicleId);
                  await AsyncStorage.setItem('vehicles', JSON.stringify(filtered));
                }
              } catch (e) {

              }

              loadData();
            } catch (error) {

              Alert.alert('Error', 'Failed to remove vehicle');
            }
          }
        }
      ]
    );
  };

  if (loading && vehicles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>Manage Vehicles</Text>
          </View>
          <Text style={styles.headerSubtitle}>{vehicles.length} vehicles registered</Text>
        </View>


        <View style={styles.listContainer}>
          {vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={styles.cardTop}>
                <View style={styles.carIconBox}>
                  <Car size={24} color="#4e3efd" />
                </View>
                <View style={styles.vehicleDetails}>
                  <Text style={styles.modelName}>{vehicle.model || 'Unknown Model'}</Text>
                  <Text style={styles.plateNumber}>{vehicle.license_plate}</Text>
                  <Text style={styles.ownerName}>{profile?.full_name || 'John Doe'}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable style={styles.editButton}>
                  <Pencil size={18} color="#4b5563" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemove(vehicle.id)}
                >
                  <Trash2 size={18} color="#ef4444" />
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>


        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterVehicle')}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add New Vehicle</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4e3efd',
  },
  header: {
    backgroundColor: '#4e3efd',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  listContainer: {
    padding: 20,
    gap: 20,
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  carIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleDetails: {
    marginLeft: 16,
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  plateNumber: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  ownerName: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  addButton: {
    backgroundColor: '#4e3efd',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
