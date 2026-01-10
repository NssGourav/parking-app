import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ParkingSessionCard({ session }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = () => {
    if (session.end_time) {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } else {
      const start = new Date(session.start_time);
      const now = new Date();
      const diff = now - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#34C759',
      completed: '#007AFF',
      cancelled: '#FF3B30',
    };
    return colors[status] || '#666';
  };

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionSite}>{session.site_name}</Text>
        <View
          style={[
            styles.sessionStatus,
            { backgroundColor: getStatusColor(session.status) },
          ]}
        >
          <Text style={styles.statusText}>{session.status?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vehicle:</Text>
          <Text style={styles.detailValue}>{session.vehicle_plate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Time:</Text>
          <Text style={styles.detailValue}>{formatDate(session.start_time)}</Text>
        </View>
        {session.end_time && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>End Time:</Text>
            <Text style={styles.detailValue}>{formatDate(session.end_time)}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{getDuration()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionSite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionDetails: {
    marginTop: 8,
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
});
