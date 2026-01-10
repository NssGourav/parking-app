import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Bell, Car, User as UserIcon, MapPin, Clock, ChevronRight, ArrowLeft, } from 'lucide-react-native';

const STATES = {
  INITIAL: 'INITIAL',
  MARUTI_RETRIEVAL: 'MARUTI_RETRIEVAL',
  TOYOTA_PARKING: 'TOYOTA_PARKING',
};

const VEHICLES = {
  MARUTI_SWIFT: {
    carName: 'Maruti Swift',
    plate: 'MH12CD5678',
    customer: 'Priya Verma',
    location: 'Phoenix Mall',
    subLocation: 'Lower Parel, Mumbai',
    parkAt: 'Level 3 - A12',
  },
  HONDA_CITY: {
    carName: 'Honda City',
    plate: 'MH02AB1234',
    customer: 'Amit Sharma',
    location: 'Phoenix Mall',
    subLocation: 'Lower Parel, Mumbai',
    parkAt: 'Level 2 - B34',
  },
  TOYOTA_INNOVA: {
    carName: 'Toyota Innova',
    plate: 'MH14EF9012',
    customer: 'Rajesh Kumar',
    location: 'Phoenix Mall',
    subLocation: 'Lower Parel, Mumbai',
    parkAt: 'Level 1 - C56',
  },
};

export default function DriverConsole() {
  const navigation = useNavigation();
  const [currentState, setCurrentState] = useState(STATES.INITIAL);
  const [assignedAt, setAssignedAt] = useState('12:19 am');
  const [hasAcceptedMaruti, setHasAcceptedMaruti] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadState = async () => {
        const stored = await AsyncStorage.getItem('DRIVER_STATE_MACHINE');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentState(parsed.state);
          setAssignedAt(parsed.assignedAt);
          setHasAcceptedMaruti(parsed.hasAcceptedMaruti || false);
        } else {
          const initialState = {
            state: STATES.INITIAL,
            assignedAt: '12:19 am',
            hasAcceptedMaruti: false
          };
          await AsyncStorage.setItem('DRIVER_STATE_MACHINE', JSON.stringify(initialState));
        }
      };
      loadState();
    }, [])
  );

  const updateState = async (newState, newTime = null, acceptedMaruti = null) => {
    const time = newTime || assignedAt;
    const accepted = acceptedMaruti !== null ? acceptedMaruti : hasAcceptedMaruti;
    const stateData = { state: newState, assignedAt: time, hasAcceptedMaruti: accepted };
    await AsyncStorage.setItem('DRIVER_STATE_MACHINE', JSON.stringify(stateData));
    setCurrentState(newState);
    if (newTime) setAssignedAt(newTime);
    if (acceptedMaruti !== null) setHasAcceptedMaruti(acceptedMaruti);
  };

  const handleAcceptAssignment = () => {
    updateState(STATES.MARUTI_RETRIEVAL, null, true);
  };

  const handleStartTask = (taskType, vehicle, nextState) => {
    navigation.navigate('RetrievalProgress', {
      type: taskType,
      vehicle: { model: vehicle.carName, license_plate: vehicle.plate },
      nextState: nextState,
    });
  };


  const notificationCount =
    (currentState === STATES.INITIAL) ||
      (currentState === STATES.MARUTI_RETRIEVAL && hasAcceptedMaruti) ? 1 : 0;


  const showNewAssignments = currentState === STATES.INITIAL;


  let currentVehicle, buttonText, taskType, nextStateAfterTask;

  if (currentState === STATES.MARUTI_RETRIEVAL) {
    currentVehicle = VEHICLES.MARUTI_SWIFT;
    buttonText = 'Start Retrieval';
    taskType = 'Retrieve Vehicle';
    nextStateAfterTask = STATES.TOYOTA_PARKING;
  } else if (currentState === STATES.TOYOTA_PARKING) {
    currentVehicle = VEHICLES.TOYOTA_INNOVA;
    buttonText = 'Start Parking';
    taskType = 'Park Vehicle';
    nextStateAfterTask = STATES.MARUTI_RETRIEVAL;
  } else {

    currentVehicle = VEHICLES.HONDA_CITY;
    buttonText = 'Start Parking';
    taskType = 'Park Vehicle';
    nextStateAfterTask = STATES.MARUTI_RETRIEVAL;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.replace('Login');
    } catch (error) {

    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleLogout} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Driver Console</Text>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.driverName}>Rajesh Kumar</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={24} color="#ffffff" />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContent}>

          {showNewAssignments && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bell size={18} color="#4e3efd" />
                <Text style={styles.sectionTitle}>New Assignments</Text>
              </View>

              <View style={styles.newAssignmentCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <Car size={24} color="#4e3efd" />
                  </View>
                  <View style={styles.carInfo}>
                    <Text style={styles.carNameText}>{VEHICLES.MARUTI_SWIFT.carName}</Text>
                    <Text style={styles.plateNumberText}>{VEHICLES.MARUTI_SWIFT.plate}</Text>
                    <View style={styles.typeBadgeOrange}>
                      <Text style={styles.typeTextOrange}>Retrieve Vehicle</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={handleAcceptAssignment}
                >
                  <Text style={styles.acceptBtnText}>Accept Assignment</Text>
                  <ChevronRight size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}


          <View style={styles.section}>
            <Text style={styles.sectionTitleRegular}>Current Assignment</Text>

            <View style={styles.taskCard}>
              <View style={styles.cardHeaderLarge}>
                <View style={styles.iconBoxLarge}>
                  <Car size={32} color="#4e3efd" />
                </View>
                <View style={styles.carInfo}>
                  <Text style={styles.carNameHeader}>{currentVehicle.carName}</Text>
                  <Text style={styles.plateNumberHeader}>{currentVehicle.plate}</Text>
                  <View style={taskType === 'Park Vehicle' ? styles.typeBadgeGreen : styles.typeBadgeOrange}>
                    <Text style={taskType === 'Park Vehicle' ? styles.typeTextGreen : styles.typeTextOrange}>
                      {taskType}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <UserIcon size={20} color="#94a3b8" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>{currentVehicle.customer}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <MapPin size={20} color="#94a3b8" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{currentVehicle.location}</Text>
                  <Text style={styles.detailSubValue}>{currentVehicle.subLocation}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <MapPin size={20} color="#94a3b8" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>
                    {taskType === 'Retrieve Vehicle' ? 'Retrieve from' : 'Park at'}
                  </Text>
                  <Text style={styles.detailValue}>{currentVehicle.parkAt}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Clock size={20} color="#94a3b8" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Assigned at</Text>
                  <Text style={styles.detailValue}>{assignedAt}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => handleStartTask(taskType, currentVehicle, nextStateAfterTask)}
              >
                <Text style={styles.startBtnText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitleRegular}>Performance Overview</Text>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Total</Text>
            <Text style={[styles.statValue, { color: '#1e293b' }]}>12</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Parked</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>8</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Retrieved</Text>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>4</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={[styles.statValue, { color: '#6366f1' }]}>4.9★</Text>
          </View>
        </View>
      </ScrollView >
    </View >
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f6ff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60, // More padding to ensure clean scroll end
  },
  header: {
    backgroundColor: '#4e3efd',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 12,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.8,
  },
  driverName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ff4b4b',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4e3efd',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionTitleRegular: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 16,
  },
  newAssignmentCard: {
    backgroundColor: '#fcfdff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8efff',
    shadowColor: '#4e3efd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  cardHeaderLarge: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxLarge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  carNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  carNameHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  plateNumberText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  plateNumberHeader: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  typeBadgeOrange: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  typeTextOrange: {
    color: '#ff9800',
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadgeGreen: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  typeTextGreen: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptBtn: {
    backgroundColor: '#6c5ce7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  detailSubValue: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: '#4e3efd',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
});
