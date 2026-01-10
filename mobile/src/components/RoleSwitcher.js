import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  User as UserIcon,
  LayoutDashboard,
  ShieldCheck,
  Truck
} from 'lucide-react-native';

const RoleSwitcher = ({ activeRole }) => {
  const navigation = useNavigation();

  const roles = [
    { id: 'user', label: 'User', icon: UserIcon, screen: 'Home' },
    { id: 'manager', label: 'Manager', icon: ShieldCheck, screen: 'ManagerDashboard' },
    { id: 'driver', label: 'Driver', icon: Truck, screen: 'Home' },
    { id: 'superadmin', label: 'Super Admin', icon: LayoutDashboard, screen: 'SuperAdmin' },
  ];

  return (
    <View style={roleStyles.container}>
      <Text style={roleStyles.loginAs}>Login As</Text>
      <View style={roleStyles.switcher}>
        {roles.map((role) => {
          const isActive = activeRole === role.id;
          const Icon = role.icon;
          return (
            <Pressable
              key={role.id}
              onPress={() => navigation.navigate(role.screen)}
              style={[roleStyles.roleItem, isActive && roleStyles.roleItemActive]}
            >
              <Icon size={20} color={isActive ? '#ffffff' : '#6b7280'} />
              <Text style={[roleStyles.roleLabel, isActive && roleStyles.roleLabelActive]}>
                {role.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const roleStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  loginAs: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 6,
    gap: 4,
    width: '100%',
  },
  roleItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  roleItemActive: {
    backgroundColor: '#1e293b',
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
  },
  roleLabelActive: {
    color: '#ffffff',
  },
});

export default RoleSwitcher;
