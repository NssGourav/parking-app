import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Camera, User as UserIcon, Phone, Mail, Calendar, FileText, Truck, CheckCircle2 } from 'lucide-react-native';

export default function AddDriver() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    licenseNumber: '',
    licenseExpiry: '',
  });

  const [driverPhoto, setDriverPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDateChange = (text, field) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setFormData(prev => ({ ...prev, [field]: formatted.slice(0, 10) }));
  };

  const handleDriverPhotoUpload = () => {
    setDriverPhoto(require('../../assets/photo-1472099645785-5658abf4ff4e.jpeg'));
  };

  const handleLicensePhotoUpload = () => {
    setLicensePhoto(require('../../assets/photo-1589829545856-d10d557cf95f.jpeg'));
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.dob.length === 10 &&
      formData.licenseNumber.trim() !== '' &&
      formData.licenseExpiry.length === 10 &&
      driverPhoto !== null &&
      licensePhoto !== null
    );
  };

  const handleApply = async () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Form', 'Please fill in all details and upload photos before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('pending_drivers')
        .insert({
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          dob: formData.dob,
          license_number: formData.licenseNumber,
          license_expiry: formData.licenseExpiry,
          status: 'pending',
          submitted_by: userData.user?.id
        })
        .select()
        .single();

      if (error) {

        Alert.alert('Error', 'Failed to submit driver application: ' + error.message);
        setIsSubmitting(false);
        return;
      }


      setShowSuccess(true);
    } catch (error) {

      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successCheckWrapper}>
            <CheckCircle2 size={80} color="#10b981" strokeWidth={1.5} />
          </View>
          <Text style={styles.successTitle}>Submitted for Approval</Text>
          <Text style={styles.successSubtitle}>
            Driver profile has been sent to Super Admin for review
          </Text>
        </View>

        <Pressable
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>Add Driver/Valet</Text>
          <Text style={styles.headerSubtitle}>Fill in the details to add a new driver</Text>
        </View>


        <View style={styles.formContent}>

          <View style={styles.sectionHeaderBox}>
            <Text style={styles.sectionTitleSmall}>Driver Photo *</Text>
          </View>
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoCircle} onPress={handleDriverPhotoUpload}>
              {driverPhoto ? (
                <Image source={driverPhoto} style={styles.photoImage} />
              ) : (
                <View style={styles.photoInner}>
                  <Camera size={28} color="#94a3b8" />
                  <Text style={styles.photoText}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <UserIcon size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <View style={styles.inputWrapper}>
              <Phone size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="driver@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={formData.dob}
                onChangeText={(text) => handleDateChange(text, 'dob')}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>License Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Driving License Number *</Text>
            <View style={styles.inputWrapper}>
              <FileText size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="DL-1420110012345"
                placeholderTextColor="#94a3b8"
                value={formData.licenseNumber}
                onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>License Expiry Date *</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={formData.licenseExpiry}
                onChangeText={(text) => handleDateChange(text, 'licenseExpiry')}
              />
            </View>
          </View>

          <View style={styles.photoContainerLarge}>
            <Text style={styles.inputLabel}>License Photo *</Text>
            <TouchableOpacity style={styles.licenseBox} onPress={handleLicensePhotoUpload}>
              {licensePhoto ? (
                <Image source={licensePhoto} style={styles.licenseImage} />
              ) : (
                <View style={styles.photoInner}>
                  <Truck size={32} color="#94a3b8" />
                  <Text style={styles.photoText}>Upload License Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              (pressed || isSubmitting) && styles.submitButtonPressed,
              (!isFormValid() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleApply}
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Approval</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#0f172a',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  formContent: {
    padding: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainerLarge: {
    marginBottom: 32,
  },
  photoCircle: {
    marginTop: 12,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  photoInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  photoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  licenseBox: {
    marginTop: 12,
    width: '100%',
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  licenseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sectionHeaderBox: {
    marginBottom: 8,
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  submitButton: {
    backgroundColor: '#4e3efd',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4e3efd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  successContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successCheckWrapper: {
    width: 120,
    height: 120,
    backgroundColor: '#f0fdf4',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  doneButton: {
    backgroundColor: '#0f172a',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
