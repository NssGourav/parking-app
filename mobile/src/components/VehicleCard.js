import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  return (
    <View style={styles.vehicleCard}>
      <Text style={styles.vehicleIcon}>🚗</Text>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehiclePlate}>{vehicle.license_plate}</Text>
        {vehicle.model && (
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
        )}
      </View>
      <View style={styles.vehicleActions}>
        <TouchableOpacity style={styles.btnIcon} onPress={onEdit}>
          <Text style={styles.btnIconText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnIcon} onPress={onDelete}>
          <Text style={styles.btnIconText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleModel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnIcon: {
    padding: 8,
  },
  btnIconText: {
    fontSize: 20,
  },
});
