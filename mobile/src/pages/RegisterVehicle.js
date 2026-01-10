import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, Modal, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Hash, Car, Phone, ChevronDown, Check, X } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

const CAR_DATA = {
  'Toyota': ['Camry', 'Corolla', 'Fortuner', 'Innova', 'Glanza'],
  'Honda': ['Civic', 'City', 'Accord', 'Amaze', 'WR-V'],
  'Hyundai': ['Creta', 'Verna', 'i20', 'Venue', 'Tucson'],
  'Maruti Suziki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Ertiga'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altorz', 'Punch'],
  'Mahindra': ['Scorpio', 'XUV300', 'Thar', 'XUV700', 'Bolero'],
  'Ford': ['EcoSport', 'Endeavour', 'Figo', 'Aspire', 'Mustang'],
  'BMW': ['3 Series', '5 Series', 'X1', 'X3', 'X5'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLA', 'GLC', 'S-Class'],
  'Audi': ['A4', 'A6', 'Q3', 'Q5', 'Q7']
};

function RegisterVehicle() {
  const navigation = useNavigation();
  const route = useRoute();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licensePlate: '',
    brand: '',
    model: '',
    mobile: ''
  });

  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);

  const handleSave = async () => {

    if (!formData.firstName || !formData.lastName || !formData.licensePlate || !formData.brand || !formData.model || !formData.mobile) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }


    const plateRegex = /^[A-Z]{2}\s[0-9]{1,2}\s[A-Z]{1,2}\s[0-9]{4}$/;
    if (!plateRegex.test(formData.licensePlate)) {
      Alert.alert(
        'Invalid Format',
        'Invalid license plate format. Use format: XX XX XX XXXX (e.g., MH 12 AB 1234)'
      );
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert('Error', 'You must be logged in to register a vehicle');
        return;
      }

      const vehicleData = {
        user_id: user.id,
        license_plate: formData.licensePlate.toUpperCase(),
        model: `${formData.brand} ${formData.model}`.trim(),
        owner_name: `${formData.firstName} ${formData.lastName}`.trim(),
        owner_phone: formData.mobile,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('This license plate is already registered.');
        }

        throw error;
      }

      const newVehicleEntry = {
        ...data,
        owner_name: `${formData.firstName} ${formData.lastName}`.trim(),
        owner_phone: formData.mobile,
      };

      try {
        const existingVehiclesString = await AsyncStorage.getItem('vehicles');
        const existingVehicles = existingVehiclesString ? JSON.parse(existingVehiclesString) : [];

        existingVehicles.push(newVehicleEntry);
        await AsyncStorage.setItem('vehicles', JSON.stringify(existingVehicles));
      } catch (storageErr) {

      }

      navigation.navigate('ConfirmParking', {
        vehicle: newVehicleEntry,
        site: route.params?.site,
        location: route.params?.location
      });
    } catch (error) {

      Alert.alert('Registration Failed', error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const renderSelectModal = (visible, setVisible, options, title, currentVal, onSelect) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <X size={24} color="#374151" />
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
                style={({ pressed }) => [
                  styles.optionItem,
                  currentVal === item && styles.optionItemSelected,
                  pressed && { backgroundColor: '#f3f4f6' }
                ]}
              >
                <Text style={[
                  styles.optionText,
                  currentVal === item && styles.optionTextSelected
                ]}>{item}</Text>
                {currentVal === item && <Check size={20} color="#6366f1" />}
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionList}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Register Vehicle</Text>
          <Text style={styles.headerSubtitle}>Add your vehicle details for quick parking</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              placeholderTextColor="#9ca3af"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />
          </View>
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              placeholderTextColor="#9ca3af"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />
          </View>
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Car Number Plate</Text>
          <View style={styles.inputContainer}>
            <Hash size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="MH 12 AB 1234"
              placeholderTextColor="#9ca3af"
              value={formData.licensePlate}
              onChangeText={(text) => setFormData({ ...formData, licensePlate: text.toUpperCase() })}
              autoCapitalize="characters"
            />
          </View>
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Car Brand</Text>
          <Pressable
            onPress={() => setBrandModalVisible(true)}
            style={({ pressed }) => [
              styles.inputContainer,
              pressed && { backgroundColor: '#f9fafb' }
            ]}
          >
            <Car size={20} color="#9ca3af" />
            <Text style={[
              styles.input,
              !formData.brand && { color: '#9ca3af' }
            ]}>
              {formData.brand || 'Select car brand'}
            </Text>
            <ChevronDown size={20} color="#9ca3af" />
          </Pressable>
        </View>


        <View style={[styles.formGroup, !formData.brand && styles.disabledGroup]}>
          <Text style={[styles.label, !formData.brand && styles.disabledLabel]}>Car Model</Text>
          <Pressable
            onPress={() => formData.brand && setModelModalVisible(true)}
            style={({ pressed }) => [
              styles.inputContainer,
              !formData.brand && styles.disabledInputContainer,
              pressed && formData.brand && { backgroundColor: '#f9fafb' }
            ]}
          >
            <Car size={20} color={formData.brand ? "#9ca3af" : "#d1d5db"} />
            <Text style={[
              styles.input,
              (!formData.model || !formData.brand) && { color: '#9ca3af' },
              !formData.brand && { color: '#d1d5db' }
            ]}>
              {formData.brand ? (formData.model || 'Select car model') : 'Select brand first'}
            </Text>
            <ChevronDown size={20} color={formData.brand ? "#9ca3af" : "#d1d5db"} />
          </Pressable>
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#9ca3af"
              value={formData.mobile}
              onChangeText={(text) => setFormData({ ...formData, mobile: text })}
              keyboardType="phone-pad"
            />
          </View>
        </View>


        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Car size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Auto-fill next time</Text>
            <Text style={styles.infoText}>
              Your vehicle will be automatically detected when you scan a QR code
            </Text>
          </View>
        </View>


        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && { opacity: 0.8 }
          ]}
        >
          <Text style={styles.saveButtonText}>Save New Vehicle</Text>
        </Pressable>
      </ScrollView>

      {renderSelectModal(
        brandModalVisible,
        setBrandModalVisible,
        Object.keys(CAR_DATA),
        "Select Car Brand",
        formData.brand,
        (brand) => setFormData({ ...formData, brand, model: '' })
      )}

      {renderSelectModal(
        modelModalVisible,
        setModelModalVisible,
        formData.brand ? CAR_DATA[formData.brand] : [],
        "Select Car Model",
        formData.model,
        (model) => setFormData({ ...formData, model })
      )}

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  disabledInputContainer: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  disabledGroup: {
    opacity: 0.6,
  },
  disabledLabel: {
    color: '#9ca3af',
  },
  infoBox: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338ca',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6366f1',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  optionList: {
    paddingBottom: 40,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionItemSelected: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
});

export default RegisterVehicle;
