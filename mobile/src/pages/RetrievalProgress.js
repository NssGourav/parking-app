import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Car } from 'lucide-react-native';

function RetrievalProgress() {
  const navigation = useNavigation();
  const route = useRoute();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const type = route.params?.type || 'Park Vehicle';
  const vehicle = route.params?.vehicle || { model: 'Toyota Innova', license_plate: 'MH14EF9012' };
  const nextState = route.params?.nextState;

  const isRetrieving = type.toLowerCase().includes('retrieve');
  const taskText = isRetrieving ? `Retrieving vehicle – ${vehicle.license_plate}` : 'Parking vehicle…';

  useEffect(() => {

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(async ({ finished }) => {
      if (finished) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();


        if (nextState) {
          const newStateData = { state: nextState, assignedAt: timestamp, hasAcceptedMaruti: false };
          await AsyncStorage.setItem('DRIVER_STATE_MACHINE', JSON.stringify(newStateData));
        }

        const successMessage = isRetrieving ? 'Vehicle retrieved successfully' : 'Vehicle parked successfully';
        navigation.navigate('TaskSuccess', { message: successMessage });
      }
    });


    if (isRetrieving) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -15, duration: 400, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Driver Console</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Current Assignment</Text>

        <View style={styles.progressCard}>

          <View style={styles.iconCircle}>

            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Car size={32} color="#4e3efd" />
            </Animated.View>
          </View>

          <Text style={styles.taskTitle}>{taskText}</Text>
          <Text style={styles.carName}>{vehicle.model}</Text>
          <Text style={styles.plateNumber}>{vehicle.license_plate}</Text>

          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#4e3efd', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  content: { padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  progressCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 32, alignItems: 'center', shadowColor: '#4e3efd', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5, borderWidth: 1, borderColor: '#eef2ff' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  taskTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 8, textAlign: 'center' },
  carName: { fontSize: 16, color: '#64748b' },
  plateNumber: { fontSize: 14, color: '#94a3b8', marginBottom: 32 },
  progressContainer: { width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#4e3efd' },
});

export default RetrievalProgress;
