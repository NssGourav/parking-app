import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import TransactionCard from '../components/TransactionCard';
import BottomNav from '../components/BottomNav';

export default function Transactions({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    site_id: '',
    base_rate: '',
    service_fee: '',
    gst: '',
    payment_method: 'upi',
    status: 'pending',
  });

  useEffect(() => {
    loadTransactions();
    loadVehicles();
    loadSites();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dummyTransactions = [
        {
          id: '1',
          user_id: user.id,
          vehicle_id: 'a47c5498-7344-4e79-babb-75e4f5f01096',
          site_id: '32112460-fb7a-4958-b871-8d78d74dd157',
          site_name: 'Phoenix Mall',
          vehicle_plate: 'MH 12 AB 1234',
          amount: 180,
          base_rate: 150,
          service_fee: 20,
          gst: 10,
          payment_method: 'upi',
          status: 'completed',
          created_at: new Date('2025-12-08').toISOString(),
        },
        {
          id: '2',
          user_id: user.id,
          vehicle_id: '6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9',
          site_id: '32112460-fb7a-4958-b871-8d78d74dd157',
          site_name: 'Central Plaza',
          vehicle_plate: 'MH 14 CD 5678',
          amount: 120,
          base_rate: 100,
          service_fee: 15,
          gst: 5,
          payment_method: 'card',
          status: 'completed',
          created_at: new Date('2025-12-05').toISOString(),
        },
      ];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setTransactions(dummyTransactions);
      } else {
        const enriched = await Promise.all(
          (data.length > 0 ? data : dummyTransactions).map(async (tx) => {
            const site = sites.find((s) => s.id === tx.site_id) || {
              name: tx.site_name || 'Unknown Site',
            };
            const vehicle = vehicles.find((v) => v.id === tx.vehicle_id) || {
              license_plate: tx.vehicle_plate || 'Unknown',
            };
            return {
              ...tx,
              site_name: site.name,
              vehicle_plate: vehicle.license_plate,
            };
          })
        );
        setTransactions(enriched);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dummyVehicles = [
        {
          id: 'a47c5498-7344-4e79-babb-75e4f5f01096',
          license_plate: 'MH 12 AB 1234',
          model: 'Toyota Camry',
        },
        {
          id: '6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9',
          license_plate: 'MH 14 CD 5678',
          model: 'Honda Civic',
        },
      ];

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        setVehicles(dummyVehicles);
      } else {
        setVehicles(data.length > 0 ? data : dummyVehicles);
      }
    } catch (error) {

    }
  };

  const loadSites = async () => {
    try {
      const dummySites = [
        {
          id: '32112460-fb7a-4958-b871-8d78d74dd157',
          name: 'Phoenix Mall',
          address: 'Lower Parel, Mumbai',
        },
      ];

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('is_active', true);

      if (error) {
        setSites(dummySites);
      } else {
        setSites(data.length > 0 ? data : dummySites);
      }
    } catch (error) {

    }
  };

  const handleSubmit = async () => {
    const baseRate = parseFloat(formData.base_rate);
    const serviceFee = parseFloat(formData.service_fee) || 0;
    const gst = parseFloat(formData.gst) || 0;
    const amount = baseRate + serviceFee + gst;

    if (!formData.vehicle_id || !formData.site_id || !formData.base_rate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        vehicle_id: formData.vehicle_id,
        site_id: formData.site_id,
        amount: amount,
        base_rate: baseRate,
        service_fee: serviceFee,
        gst: gst,
        payment_method: formData.payment_method,
        status: formData.status,
      });

      if (error) throw error;

      setShowForm(false);
      setFormData({
        vehicle_id: '',
        site_id: '',
        base_rate: '',
        service_fee: '',
        gst: '',
        payment_method: 'upi',
        status: 'pending',
      });
      loadTransactions();
    } catch (error) {

      Alert.alert('Error', 'Failed to create transaction');
    }
  };

  const calculateTotal = () => {
    const baseRate = parseFloat(formData.base_rate) || 0;
    const serviceFee = parseFloat(formData.service_fee) || 0;
    const gst = parseFloat(formData.gst) || 0;
    return (baseRate + serviceFee + gst).toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
        <BottomNav navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.addBtnText}>+ Add Transaction</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Transaction</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Vehicle *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.vehicle_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vehicle_id: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Vehicle" value="" />
                    {vehicles.map((vehicle) => (
                      <Picker.Item
                        key={vehicle.id}
                        label={`${vehicle.license_plate}${vehicle.model ? ` - ${vehicle.model}` : ''
                          }`}
                        value={vehicle.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Site *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.site_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, site_id: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Site" value="" />
                    {sites.map((site) => (
                      <Picker.Item
                        key={site.id}
                        label={site.name}
                        value={site.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Base Rate (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.base_rate}
                  onChangeText={(value) =>
                    setFormData({ ...formData, base_rate: value })
                  }
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Service Fee (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.service_fee}
                  onChangeText={(value) =>
                    setFormData({ ...formData, service_fee: value })
                  }
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>GST (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.gst}
                  onChangeText={(value) =>
                    setFormData({ ...formData, gst: value })
                  }
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Payment Method *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_method: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="UPI" value="upi" />
                    <Picker.Item label="Net Banking" value="netbanking" />
                    <Picker.Item label="Card" value="card" />
                    <Picker.Item label="Cash" value="cash" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Pending" value="pending" />
                    <Picker.Item label="Completed" value="completed" />
                    <Picker.Item label="Failed" value="failed" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Total Amount (₹)</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={calculateTotal()}
                  editable={false}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.btnText}>Add Transaction</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  transactionsList: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  btnPrimary: {
    backgroundColor: '#007AFF',
  },
  btnSecondary: {
    backgroundColor: '#f0f0f0',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
