import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Car, FileText, HelpCircle, ChevronRight, Pencil } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

function Settings() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchSettingsData();
    }, [])
  );

  const fetchSettingsData = async () => {
    try {
      if (!profile) {
        setLoading(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parallel fetch for speed
      const [profileRes, vehicleRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true)
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      setVehicleCount(vehicleRes.count || 0);

    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const menuItems = [
    {
      id: 'vehicles',
      title: 'Manage Vehicles',
      subtitle: `${vehicleCount} vehicles saved`,
      icon: Car,
      onPress: () => navigation.navigate('Vehicles'),
    },
    {
      id: 'history',
      title: 'Transaction History',
      subtitle: 'View all payments',
      icon: FileText,
      onPress: () => navigation.navigate('History'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      icon: HelpCircle,
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      id: 'faq',
      title: 'FAQ',
      subtitle: 'Frequently Asked Questions',
      icon: HelpCircle,
      onPress: () => navigation.navigate('FAQ'),
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
        </View>


        <View style={styles.profileCard}>
          <View style={styles.profileMain}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
              <Text style={styles.profilePhone}>{profile?.phone || '+91 00000 00000'}</Text>
            </View>
            <Pressable style={styles.editIcon}>
              <Pencil size={20} color="#6366f1" />
            </Pressable>
          </View>
        </View>


        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuCard,
                pressed && styles.menuCardPressed
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <item.icon size={22} color="#4b5563" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Pressable>
          ))}
        </View>


        <Pressable
          style={styles.logoutButton}
          onPress={async () => {
            await supabase.auth.signOut();
            navigation.replace('Login');
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366f1',
  },
  header: {
    backgroundColor: '#4e3efd',
    paddingTop: 60,
    paddingBottom: 40, // Increased padding to avoid overlap
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  profileCard: {
    backgroundColor: '#f5f7ff',
    marginHorizontal: 20,
    marginTop: 20, // Removed negative margin to avoid overlap as requested
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#4e3efd',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  profilePhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  editIcon: {
    padding: 8,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuCardPressed: {
    backgroundColor: '#f9fafb',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Settings;
