import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

function LoginAs() {
  const [selectedRole, setSelectedRole] = useState('user');

  const roles = [
    { id: 'user', label: 'User', icon: '👤' },
    { id: 'manager', label: 'Manager', icon: '🛡️' },
    { id: 'driver', label: 'Driver', icon: '🚗' },
    { id: 'super_admin', label: 'Super Admin', icon: '👑' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login As</Text>
      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <Pressable
            key={role.id}
            onPress={() => setSelectedRole(role.id)}
            style={[
              styles.roleButton,
              selectedRole === role.id && styles.roleButtonSelected
            ]}
          >
            <Text style={styles.roleIcon}>{role.icon}</Text>
            <Text style={[
              styles.roleLabel,
              selectedRole === role.id && styles.roleLabelSelected
            ]}>
              {role.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 32,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  roleButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  roleIcon: {
    fontSize: 24,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  roleLabelSelected: {
    color: '#ffffff',
  },
});

export default LoginAs;

