import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TransactionCard({ transaction }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      upi: 'UPI',
      netbanking: 'Net Banking',
      card: 'Card',
      cash: 'Cash',
    };
    return labels[method] || method;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#34C759',
      pending: '#FF9500',
      failed: '#FF3B30',
    };
    return colors[status] || '#666';
  };

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View>
          <Text style={styles.transactionSite}>
            {transaction.site_name || 'Unknown Site'}
          </Text>
          <Text style={styles.transactionVehicle}>
            {transaction.vehicle_plate || 'Unknown Vehicle'}
          </Text>
        </View>
        <Text style={styles.transactionAmount}>
          ₹{transaction.amount?.toFixed(2) || '0.00'}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {formatDate(transaction.created_at)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method:</Text>
          <Text style={styles.detailValue}>
            {getPaymentMethodLabel(transaction.payment_method)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Breakdown:</Text>
          <Text style={styles.detailValue}>
            ₹{transaction.base_rate?.toFixed(2) || '0.00'} + ₹
            {transaction.service_fee?.toFixed(2) || '0.00'} + ₹
            {transaction.gst?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </View>

      <View style={styles.transactionStatusBadge}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(transaction.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {transaction.status?.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionSite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionVehicle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  transactionStatusBadge: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
