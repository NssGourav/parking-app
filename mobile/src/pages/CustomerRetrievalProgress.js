import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, CheckCircle, Truck, Send, Clock as ClockIcon, Car, MapPin as MapPinIcon, Phone } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

function CustomerRetrievalProgress() {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState('5-7');

  const sessionId = route.params?.sessionId;
  const vehicle = route.params?.vehicle || { model: 'Toyota Camry', license_plate: 'MH 12 AB 1234' };
  const location = route.params?.location || 'Inorbit Mall';
  const entryTime = route.params?.entryTime || '12:41 am';

  useEffect(() => {

    const timer1 = setTimeout(() => {
      setCurrentStep(2);
      setEstimatedTime('3');
    }, 5000);


    const timer2 = setTimeout(() => {
      setCurrentStep(3);
    }, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const isStepCompleted = (step) => currentStep > step;
  const isStepActive = (step) => currentStep === step;

  const handleCompleteParking = async () => {
    try {
      if (!sessionId) {
        Alert.alert('Error', 'No parking session found');
        return;
      }

      // Update parking session to completed
      const { error } = await supabase
        .from('parking_sessions')
        .update({
          status: 'completed',
          exit_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;

      await AsyncStorage.removeItem('activeParking');

      navigation.navigate('Home');
    } catch (error) {

      Alert.alert('Error', 'Failed to complete parking session');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Vehicle Retrieval</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {currentStep === 1 && (
          <View style={styles.statusCardBlue}>
            <View style={styles.statusIconContainerBlue}>
              <CheckCircle size={32} color="#ffffff" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Request Received</Text>
              <Text style={styles.statusSubtitle}>Our valet has been notified</Text>
            </View>
          </View>
        )}


        {currentStep === 1 && (
          <View style={styles.estimatedCardBlue}>
            <ClockIcon size={20} color="#ffffff" />
            <Text style={styles.estimatedText}>Estimated time: {estimatedTime} minutes</Text>
          </View>
        )}


        {currentStep === 2 && (
          <View style={styles.statusCardOrange}>
            <View style={styles.statusIconContainerOrange}>
              <Truck size={32} color="#ffffff" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Car on the Way</Text>
              <Text style={styles.statusSubtitle}>Your vehicle is being brought to the pickup point</Text>
            </View>
          </View>
        )}


        {currentStep === 2 && (
          <View style={styles.estimatedCardOrange}>
            <ClockIcon size={20} color="#ffffff" />
            <Text style={styles.estimatedText}>Arriving in ~{estimatedTime} minutes</Text>
          </View>
        )}


        {currentStep === 3 && (
          <View style={styles.statusCardGreen}>
            <View style={styles.statusIconContainerGreen}>
              <Send size={32} color="#ffffff" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Car Arriving</Text>
              <Text style={styles.statusSubtitle}>Your vehicle is at the pickup point</Text>
            </View>
          </View>
        )}


        {currentStep === 3 && (
          <View style={styles.proceedCard}>
            <ClockIcon size={20} color="#10b981" />
            <Text style={styles.proceedText}>Please proceed to pickup</Text>
          </View>
        )}


        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Retrieval Progress</Text>

          {/* Step 1: Request Received */}
          <View style={styles.stepContainer}>
            <View style={[
              styles.stepIconWrapper,
              (isStepCompleted(1) || isStepActive(1)) && styles.stepIconCompleted
            ]}>
              <CheckCircle size={24} color={(isStepCompleted(1) || isStepActive(1)) ? "#10b981" : "#d1d5db"} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepTitle,
                (isStepCompleted(1) || isStepActive(1)) && styles.stepTitleActive
              ]}>
                Request Received
              </Text>
              <Text style={styles.stepSubtitle}>Valet has been notified</Text>
            </View>
            {currentStep > 1 && <View style={styles.stepConnector} />}
          </View>

          {/* Step 2: Car on the Way */}
          <View style={styles.stepContainer}>
            <View style={[
              styles.stepIconWrapper,
              (isStepCompleted(2) || isStepActive(2)) && styles.stepIconCompleted
            ]}>
              <Truck size={24} color={(isStepCompleted(2) || isStepActive(2)) ? "#10b981" : "#d1d5db"} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepTitle,
                (isStepCompleted(2) || isStepActive(2)) && styles.stepTitleActive
              ]}>
                Car on the Way
              </Text>
              <Text style={styles.stepSubtitle}>Vehicle is being brought</Text>
            </View>
            {currentStep > 2 && <View style={styles.stepConnector} />}
          </View>

          {/* Step 3: Car Arriving */}
          <View style={styles.stepContainer}>
            <View style={[
              styles.stepIconWrapper,
              (isStepCompleted(3) || isStepActive(3)) && styles.stepIconCompleted
            ]}>
              <Send size={24} color={(isStepCompleted(3) || isStepActive(3)) ? "#10b981" : "#d1d5db"} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepTitle,
                (isStepCompleted(3) || isStepActive(3)) && styles.stepTitleActive
              ]}>
                Car Arriving
              </Text>
              <Text style={styles.stepSubtitle}>Ready for pickup</Text>
            </View>
          </View>
        </View>


        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Parking Details</Text>

          {/* Vehicle */}
          <View style={styles.detailRow}>
            <Car size={20} color="#9ca3af" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{vehicle.model}</Text>
              <Text style={styles.detailSubValue}>{vehicle.license_plate}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <MapPinIcon size={20} color="#9ca3af" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{location}</Text>
            </View>
          </View>

          {/* Entry Time */}
          <View style={styles.detailRow}>
            <ClockIcon size={20} color="#9ca3af" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Entry Time</Text>
              <Text style={styles.detailValue}>{entryTime}</Text>
            </View>
          </View>
        </View>


        <Pressable
          style={({ pressed }) => [
            styles.supportButton,
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => { }}
        >
          <Phone size={20} color="#374151" />
          <Text style={styles.supportText}>Call Support</Text>
        </Pressable>


        {currentStep === 3 && (
          <View style={styles.completeContainer}>
            <Text style={styles.completeMessage}>🎉 Your vehicle is ready at the pickup point!</Text>
            <Pressable
              style={({ pressed }) => [
                styles.completeButton,
                pressed && { opacity: 0.9 }
              ]}
              onPress={handleCompleteParking}
            >
              <Text style={styles.completeButtonText}>Complete & Exit Parking</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6ff',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 150,
    gap: 16,
  },
  // Blue Status Card (Step 1)
  statusCardBlue: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statusIconContainerBlue: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimatedCardBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  // Orange Status Card (Step 2)
  statusCardOrange: {
    backgroundColor: '#f97316',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statusIconContainerOrange: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimatedCardOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  // Green Status Card (Step 3)
  statusCardGreen: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statusIconContainerGreen: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.95,
  },
  estimatedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  proceedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  proceedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    position: 'relative',
  },
  stepIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconCompleted: {
    backgroundColor: '#d1fae5',
  },
  stepContent: {
    flex: 1,
    paddingTop: 6,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
  },
  stepTitleActive: {
    color: '#111827',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  stepConnector: {
    position: 'absolute',
    left: 23,
    top: 48,
    width: 2,
    height: 24,
    backgroundColor: '#10b981',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  supportButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  supportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  completeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  completeMessage: {
    fontSize: 15,
    color: '#059669',
    marginBottom: 16,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default CustomerRetrievalProgress;
