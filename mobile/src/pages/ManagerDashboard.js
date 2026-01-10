import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  UserPlus,
  Search,
  Car,
  Phone,
  Clock,
  MapPin,
  CreditCard,
  User as UserIcon,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  ChevronDown
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function ManagerDashboard() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReassign, setShowReassign] = useState(null); // ID of session being reassigned
  const [selectedValets, setSelectedValets] = useState({}); // To track reassigned valets per session


  const [sessions, setSessions] = useState([
    {
      id: '1',
      carName: 'Hyundai Creta',
      plate: 'MH03EF9012',
      status: 'Retrieving',
      customer: 'Rahul Gupta',
      valet: 'Vikram Singh',
      valetId: 'V003',
      valetPhone: '+91 98765 43212',
      location: 'Phoenix Mall',
      entryTime: '8 Jan, 09:39 pm',
      duration: '30m',
      payment: 'Pending'
    },
    {
      id: '2',
      carName: 'Honda City',
      plate: 'MH02AB1234',
      status: 'Parked',
      customer: 'Amit Sharma',
      valet: 'Rajesh Kumar',
      valetId: 'V001',
      valetPhone: '+91 98765 43210',
      location: 'Phoenix Mall',
      entryTime: '8 Jan, 12:41 pm',
      duration: '2h 0m',
      payment: 'Paid'
    },
    {
      id: '3',
      carName: 'Toyota Fortuner',
      plate: 'MH01CD5678',
      status: 'Parked',
      customer: 'Sanjay Dutt',
      valet: 'Suresh Patil',
      valetId: 'V002',
      valetPhone: '+91 98765 43211',
      location: 'Phoenix Mall',
      entryTime: '8 Jan, 2:15 pm',
      duration: '1h 20m',
      payment: 'Paid'
    },
    {
      id: '4',
      carName: 'Maruti Suzuki Swift',
      plate: 'MH12GH3456',
      status: 'Retrieving',
      customer: 'Priya Verma',
      valet: 'Mohan Reddy',
      valetId: 'V004',
      valetPhone: '+91 98765 43213',
      location: 'Phoenix Mall',
      entryTime: '8 Jan, 10:05 pm',
      duration: '10m',
      payment: 'Paid'
    },
    {
      id: '5',
      carName: 'Kia Seltos',
      plate: 'MH04XY7890',
      status: 'Parked',
      customer: 'Anita Desai',
      valet: 'Arjun Nair',
      valetId: 'V005',
      valetPhone: '+91 98765 43214',
      location: 'Phoenix Mall',
      entryTime: '8 Jan, 4:30 pm',
      duration: '6h 15m',
      payment: 'Paid'
    }
  ]);

  const stats = [
    { label: 'Active Cars', value: '3' },
    { label: 'Retrieving', value: '2' },
    { label: 'Total Today', value: '12' },
    { label: 'Revenue', value: '₹1,540' },
  ];

  const tabs = ['All', 'Parked', 'Retrieving', 'Waitlist'];

  useFocusEffect(
    React.useCallback(() => {
      fetchDrivers();
    }, [])
  );

  const fetchDrivers = async () => {

    const mockDrivers = [
      { id: 'v1', full_name: 'Rajesh Kumar', phone: '+91 98765 43210' },
      { id: 'v2', full_name: 'Suresh Patil', phone: '+91 98765 43211' },
      { id: 'v3', full_name: 'Vikram Singh', phone: '+91 98765 43212' },
      { id: 'v4', full_name: 'Mohan Reddy', phone: '+91 98765 43213' },
      { id: 'v5', full_name: 'Arjun Nair', phone: '+91 98765 43214' },
    ];
    setDrivers(mockDrivers);
  };

  const handleReassign = (sessionId, valet) => {
    setSelectedValets(prev => ({ ...prev, [sessionId]: valet }));
    setShowReassign(null);
    Alert.alert('Valet Reassigned', `Session ${sessionId} assigned to ${valet.full_name}`);
  };

  const handleCall = (session) => {
    const valetName = selectedValets[session.id] ? selectedValets[session.id].full_name : session.valet;
    const valetPhone = selectedValets[session.id] ? selectedValets[session.id].phone : session.valetPhone;
    Alert.alert('Call Initiated', `Calling ${valetName} at ${valetPhone}`);
  };


  const filteredSessions = sessions.filter(session => {

    if (activeTab !== 'All') {
      if (activeTab === 'Waitlist' && session.status !== 'Pending') return false;
      if (activeTab !== 'Waitlist' && session.status !== activeTab) return false;
    }


    const query = searchQuery.toLowerCase();
    const matchesUser = session.customer.toLowerCase().includes(query);
    const matchesPlate = session.plate.toLowerCase().includes(query);
    const matchesValet = session.valet.toLowerCase().includes(query);

    return matchesUser || matchesPlate || matchesValet;
  });

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.replace('Login')}>
              <ArrowLeft size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>Manager Dashboard</Text>
            <Pressable
              style={styles.addDriverBtn}
              onPress={() => navigation.navigate('AddDriver')}
            >
              <UserPlus size={18} color="#ffffff" />
              <Text style={styles.addDriverText}>Add Driver</Text>
            </Pressable>
          </View>
          <Text style={styles.headerSubtitle}>Manage valet assignments and parking operations</Text>
        </View>


        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>


        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by plate, customer or valet..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>


        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab} {tab === 'All' ? `(${sessions.length})` : `(${sessions.filter(s => s.status === tab || (tab === 'Waitlist' && s.status === 'Pending')).length})`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>


        {filteredSessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.carIconBox}>
                <Car size={24} color="#4b5563" />
              </View>
              <View style={styles.carMeta}>
                <Text style={styles.carName}>{session.carName}</Text>
                <Text style={styles.plateNumber}>{session.plate}</Text>
              </View>
              <View style={[styles.statusBadge, session.status === 'Retrieving' && { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.statusText, session.status === 'Retrieving' && { color: '#d97706' }]}>
                  {session.status}
                </Text>
              </View>
            </View>

            <View style={styles.cardSection}>
              <UserIcon size={16} color="#9ca3af" />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionLabel}>Customer</Text>
                <Text style={styles.sectionValue}>{session.customer}</Text>
              </View>
            </View>

            <View style={styles.cardSection}>
              <UserIcon size={16} color="#9ca3af" />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionLabel}>Valet Assigned</Text>
                <Text style={styles.sectionValue}>
                  {selectedValets[session.id] ? selectedValets[session.id].full_name : session.valet}
                </Text>
                <Text style={styles.valetId}>
                  ID: {selectedValets[session.id] ? `V${selectedValets[session.id].id.substring(0, 3).toUpperCase()}` : session.valetId}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(session)}
              >
                <Phone size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>


            <View style={styles.reassignBox}>
              <Text style={styles.reassignLabel}>Reassign to:</Text>

              <Pressable
                style={styles.dropdownBox}
                onPress={() => setShowReassign(showReassign === session.id ? null : session.id)}
              >
                <Text style={[
                  styles.dropdownBoxText,
                  !selectedValets[session.id] && { color: '#6b7280', fontStyle: 'italic' }
                ]}>
                  {selectedValets[session.id] ? selectedValets[session.id].full_name : 'Select new valet...'}
                </Text>
                <ChevronDown size={20} color="#4b5563" />
              </Pressable>

              {showReassign === session.id && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                    {drivers.map((driver) => (
                      <Pressable
                        key={driver.id}
                        style={styles.dropdownListItem}
                        onPress={() => handleReassign(session.id, driver)}
                      >
                        <Text style={styles.dropdownListItemText}>{driver.full_name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Pressable onPress={() => setShowReassign(null)} style={{ alignSelf: 'center', marginTop: 12 }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </View>

            <View style={styles.cardSection}>
              <MapPin size={16} color="#9ca3af" />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionLabel}>Location</Text>
                <Text style={styles.sectionValue}>{session.location}</Text>
              </View>
            </View>

            <View style={styles.cardSection}>
              <Clock size={16} color="#9ca3af" />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionLabel}>Entry Time</Text>
                <Text style={styles.sectionValue}>{session.entryTime}</Text>
                <Text style={styles.subValue}>Duration: {session.duration}</Text>
              </View>
            </View>

            <View style={[styles.cardSection, styles.noBorder]}>
              <CreditCard size={16} color="#9ca3af" />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionLabel}>Payment</Text>
              </View>
              <View style={[styles.paidBadge, session.payment === 'Pending' && { backgroundColor: '#fff7ed' }]}>
                <Text style={[styles.paidText, session.payment === 'Pending' && { color: '#ea580c' }]}>
                  {session.payment}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  header: {
    backgroundColor: '#0f172a',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 16,
  },
  addDriverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addDriverText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  carIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carMeta: {
    flex: 1,
    marginLeft: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  plateNumber: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '600',
  },
  cardSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  noBorder: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  valetId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  callBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#10b981',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reassignBox: {
    backgroundColor: 'rgba(254, 243, 199, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 20,
    position: 'relative',
    zIndex: 100,
  },
  reassignLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
    marginBottom: 10,
  },
  dropdownBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownBoxText: {
    fontSize: 14,
    color: '#1e293b',
  },
  dropdownList: {
    position: 'absolute',
    top: 85,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownListItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownListItemText: {
    fontSize: 14,
    color: '#1e293b',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  noDriversText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  subValue: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  paidBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
});
