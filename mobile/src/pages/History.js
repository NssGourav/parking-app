import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';


function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      if (transactions.length === 0) {
        setLoading(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          vehicles (license_plate, model),
          sites (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      upi: 'UPI',
      netbanking: 'Net Banking',
      card: 'Card',
      cash: 'Cash'
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
        </View>

        <View style={styles.transactionsList}>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionSiteName}>{tx.sites?.name || 'Parking Site'}</Text>
                    <Text style={styles.transactionVehicle}>
                      {tx.vehicles?.license_plate || tx.vehicle_id}
                    </Text>
                  </View>
                  <Text style={styles.transactionAmount}>₹{tx.amount}</Text>
                </View>

                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionMetaText}>
                    Date: {new Date(tx.created_at).toLocaleDateString('en-IN')}
                  </Text>
                  <Text style={styles.transactionMetaText}>
                    Payment: {getPaymentMethodLabel(tx.payment_method)}
                  </Text>
                </View>

                <View style={[
                  styles.statusBadge,
                  tx.status === 'completed' ? styles.statusSuccess : styles.statusPending
                ]}>
                  <Text style={[
                    styles.statusText,
                    tx.status === 'completed' ? styles.statusTextSuccess : styles.statusTextPending
                  ]}>{tx.status}</Text>
                </View>
              </View>
            ))
          )}
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  transactionsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionSiteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionVehicle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionMetaText: {
    fontSize: 14,
    color: '#4b5563',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusSuccess: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextSuccess: {
    color: '#166534',
  },
  statusTextPending: {
    color: '#92400e',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#9ca3af',
  }
});

export default History;
