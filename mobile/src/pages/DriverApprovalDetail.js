import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function DriverApprovalDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { driver } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('pending_drivers')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', driver.id);

      if (error) throw error;
      Alert.alert('Success', 'Driver has been approved.');
      navigation.goBack();
    } catch (error) {

      Alert.alert('Error', 'Failed to approve driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this driver application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const { error } = await supabase
                .from('pending_drivers')
                .update({
                  status: 'rejected',
                })
                .eq('id', driver.id);

              if (error) throw error;
              navigation.goBack();
            } catch (error) {

              Alert.alert('Error', 'Failed to reject application');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Driver Profile</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <View style={styles.photoCircle}>
            <Image
              source={{ uri: driver.driver_photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
              style={styles.profileImage}
            />
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{driver.full_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{driver.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{driver.email || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{driver.address || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>DOB:</Text>
            <Text style={styles.detailValue}>{driver.dob}</Text>
          </View>
        </View>

        {/* License Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>License Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>License No:</Text>
            <Text style={styles.detailValue}>{driver.license_number}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expiry:</Text>
            <Text style={styles.detailValue}>{driver.license_expiry || 'N/A'}</Text>
          </View>

          <Image
            source={{ uri: driver.license_photo_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
            style={styles.licenseImage}
          />
        </View>

        {/* Submission Info */}
        <View style={styles.submissionCard}>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Submitted by:</Text>
            <Text style={styles.subValue}>Manager</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Submitted on:</Text>
            <Text style={styles.subValue}>{formatDate(driver.created_at)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={handleApprove}
            disabled={isSubmitting}
          >
            <CheckCircle2 size={20} color="#ffffff" />
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={handleReject}
            disabled={isSubmitting}
          >
            <XCircle size={20} color="#ffffff" />
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#7c3aed',
    paddingTop: 20,
    paddingBottom: 24,
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
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  photoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#f0f4ff',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  sectionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#64748b',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 2,
    textAlign: 'right',
  },
  licenseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 16,
    resizeMode: 'cover',
  },
  submissionCard: {
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  subLabel: {
    fontSize: 14,
    color: '#6d28d9',
    flex: 1,
  },
  subValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4c1d95',
    flex: 1,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: '#059669',
  },
  rejectBtn: {
    backgroundColor: '#dc2626',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
