import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Home, Ticket, History, Settings } from 'lucide-react-native';

function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const [hasActiveTicket, setHasActiveTicket] = React.useState(false);

  React.useEffect(() => {
    checkActiveTicket();


    const unsubscribe = navigation.addListener('focus', () => {
      checkActiveTicket();
    });

    return unsubscribe;
  }, [navigation, route]);

  const checkActiveTicket = async () => {
    try {
      // Use getSession for instant check, getUser is only needed for sensitive ops
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setHasActiveTicket(false);
        return;
      }

      // Quick check in parking_sessions
      const { data: sessionData } = await supabase
        .from('parking_sessions')
        .select('id')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'retrieving'])
        .limit(1);

      setHasActiveTicket(sessionData && sessionData.length > 0);
    } catch (error) {
      setHasActiveTicket(false);
    }
  };

  const navItems = [
    {
      name: 'Home',
      label: 'Home',
      icon: Home,
      onPress: () => navigation.navigate('Home'),
      path: 'Home'
    },
    {
      name: 'Ticket',
      label: 'Ticket',
      icon: Ticket,
      onPress: () => navigation.navigate('ParkingTicket'),
      path: 'ParkingTicket',
      disabled: !hasActiveTicket
    },
    {
      name: 'History',
      label: 'History',
      icon: History,
      onPress: () => navigation.navigate('History'),
      path: 'History'
    },
    {
      name: 'Settings',
      label: 'Settings',
      icon: Settings,
      onPress: () => navigation.navigate('Settings'),
      path: 'Settings'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = route.name === item.path ||
            (item.label === 'Ticket' && (route.name === 'ParkingTicket' || route.name === 'ParkingSessions'));
          const isDisabled = item.disabled || false;
          const Icon = item.icon;

          return (
            <Pressable
              key={item.name}
              onPress={item.onPress}
              disabled={isDisabled}
              style={[
                styles.navItem,
                isDisabled && styles.navItemDisabled
              ]}
            >
              <Icon
                size={24}
                color={isDisabled ? '#d1d5db' : isActive ? '#6366f1' : '#9ca3af'}
              />
              <Text style={[
                styles.navLabel,
                isActive && !isDisabled && styles.navLabelActive,
                isDisabled && styles.navLabelDisabled
              ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 50,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navItemDisabled: {
    opacity: 0.5,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  navLabelActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  navLabelDisabled: {
    color: '#d1d5db',
  },
});

export default BottomNav;

