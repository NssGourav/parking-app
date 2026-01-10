import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, User as UserIcon } from 'lucide-react-native';



export default function ApprovalSuccess() {
  const navigation = useNavigation();

  return (
    <View style={styles.outerContainer}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CheckCircle2 size={48} color="#10b981" />
        </View>
        <Text style={styles.title}>Submitted for Approval</Text>
        <Text style={styles.subtitle}>
          Driver profile has been sent to Super Admin for review
        </Text>

        <Pressable
          style={styles.doneButton}
          onPress={() => navigation.navigate('ManagerDashboard')}
        >
          <Text style={styles.doneButtonText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
