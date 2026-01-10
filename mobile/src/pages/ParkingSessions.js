import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';


function ParkingSessions() {
  const navigation = useNavigation();

  useEffect(() => {
    checkActiveParking();
  }, []);

  const checkActiveParking = async () => {
    try {
      const activeParking = await AsyncStorage.getItem('activeParking');
      if (!activeParking) {
        navigation.navigate('Home');
      }
    } catch (error) {

    }
  };

  const sessions = [
    {
      id: '1',
      site_name: 'Phoenix Mall',
      vehicle_plate: 'MH 12 AB 1234',
      status: 'active',
      start_time: '2 hours ago',
      duration: '2h 15m'
    },
    {
      id: '2',
      site_name: 'Central Plaza',
      vehicle_plate: 'MH 14 CD 5678',
      status: 'completed',
      start_time: 'Yesterday',
      duration: '2h 50m'
    }
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Parking Sessions</Text>
        </View>

        <View style={styles.sessionsList}>
          {sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionSiteName}>{session.site_name}</Text>
                <View style={[
                  styles.statusBadge,
                  session.status === 'active' ? styles.statusBadgeActive : styles.statusBadgeCompleted
                ]}>
                  <Text style={[
                    styles.statusText,
                    session.status === 'active' ? styles.statusTextActive : styles.statusTextCompleted
                  ]}>
                    {session.status}
                  </Text>
                </View>
              </View>
              <View style={styles.sessionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vehicle:</Text>
                  <Text style={styles.detailValue}>{session.vehicle_plate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Start Time:</Text>
                  <Text style={styles.detailValue}>{session.start_time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{session.duration}</Text>
                </View>
              </View>
            </View>
          ))}
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
  contentContainer: {
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sessionsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionSiteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeActive: {
    backgroundColor: '#dbeafe',
  },
  statusBadgeCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: '#1e40af',
  },
  statusTextCompleted: {
    color: '#166534',
  },
  sessionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
});

export default ParkingSessions;

