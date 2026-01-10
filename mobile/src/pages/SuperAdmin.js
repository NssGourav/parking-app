import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  Ticket,
  Wallet,
  Calendar,
  TrendingUp,
  CheckCircle,
  Check,
  X,
  Phone,
  FileText,
  Eye,
  User as UserIcon,
  LogOut,
} from 'lucide-react-native';

export default function SuperAdmin() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Overview');
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [stats, setStats] = useState({
    todayTickets: 0,
    todayCollection: 0,
    totalTickets: 0,
    totalCollection: 0,
    activeParking: 0,
  });
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadSites();
    }, [])
  );

  useEffect(() => {
    if (selectedSite) {
      loadStats();
    }
  }, [selectedSite]);

  useEffect(() => {
    if (activeTab === 'Approvals') {
      loadPendingDrivers();
    }
  }, [activeTab]);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name');

      if (error) throw error;

      setSites(data || []);
      if (data && data.length > 0) {
        setSelectedSite(data[0]);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedSite) return;

    try {
      const today = new Date().toISOString().split('T')[0];


      const { count: todayCount } = await supabase
        .from('parking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', selectedSite.id)
        .gte('entry_time', `${today}T00:00:00`)
        .lte('entry_time', `${today}T23:59:59`);


      const { data: todayTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('site_id', selectedSite.id)
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const todayCollection = todayTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;


      const { count: totalCount } = await supabase
        .from('parking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', selectedSite.id);


      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('site_id', selectedSite.id)
        .eq('status', 'completed');

      const totalCollection = allTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;


      const { count: activeCount } = await supabase
        .from('parking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', selectedSite.id)
        .eq('status', 'active');

      setStats({
        todayTickets: todayCount || 0,
        todayCollection,
        totalTickets: totalCount || 0,
        totalCollection,
        activeParking: activeCount || 0,
      });
    } catch (error) {

    }
  };

  const loadPendingDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_drivers')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingDrivers(data || []);
    } catch (error) {

    }
  };

  const handleApproveDriver = async (driverId) => {
    try {
      const { error } = await supabase
        .from('pending_drivers')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) throw error;
      loadPendingDrivers();
      Alert.alert('Success', 'Driver has been approved.');
    } catch (error) {

      Alert.alert('Error', 'Failed to approve driver: ' + error.message);
    }
  };

  const handleRejectDriver = async (driverId) => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this driver application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('pending_drivers')
                .update({
                  status: 'rejected',
                })
                .eq('id', driverId);

              if (error) throw error;
              loadPendingDrivers();
            } catch (error) {

              Alert.alert('Error', 'Failed to reject application');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.replace('Login');
    } catch (error) {

    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={handleLogout} style={styles.backButton}>
              <LogOut size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>Super Admin</Text>
          </View>
          <Text style={styles.headerSubtitle}>System overview and approvals</Text>
        </View>


        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <Pressable
              onPress={() => setActiveTab('Overview')}
              style={[styles.tabItem, activeTab === 'Overview' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'Overview' && styles.tabTextActive]}>
                Overview
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('Approvals')}
              style={[styles.tabItem, activeTab === 'Approvals' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'Approvals' && styles.tabTextActive]}>
                Approvals
              </Text>
              {pendingDrivers.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingDrivers.length}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {activeTab === 'Overview' ? (
          <View style={styles.viewContent}>

            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>Select Site</Text>
              <Pressable
                style={styles.selector}
                onPress={() => setShowSiteDropdown(true)}
              >
                <MapPin size={18} color="#6b7280" />
                <Text style={styles.selectorValue}>
                  {selectedSite?.name || 'Select a site'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </Pressable>
            </View>


            <View style={styles.sectionHeaderRow}>
              <Calendar size={20} color="#1e293b" />
              <Text style={styles.sectionHeader}>Today's Performance</Text>
            </View>
            <View style={styles.perfGrid}>
              <View style={styles.perfCard}>
                <Text style={styles.perfLabel}>Tickets Issued</Text>
                <Text style={styles.perfValue}>{stats.todayTickets}</Text>
              </View>
              <View style={styles.perfCard}>
                <Text style={styles.perfLabel}>Collection</Text>
                <Text style={styles.perfValue}>₹{stats.todayCollection.toLocaleString()}</Text>
              </View>
            </View>


            <View style={styles.sectionHeaderRow}>
              <TrendingUp size={20} color="#1e293b" />
              <Text style={styles.sectionHeader}>Overall Statistics</Text>
            </View>
            <View style={styles.statsList}>
              <View style={styles.statsCard}>
                <View style={styles.statsIconBox}>
                  <Ticket size={20} color="#8b5cf6" />
                  <Text style={styles.statsCardLabel}>Total Tickets</Text>
                </View>
                <Text style={styles.statsCardValue}>{stats.totalTickets}</Text>
              </View>
              <View style={styles.statsCard}>
                <View style={styles.statsIconBox}>
                  <Wallet size={20} color="#10b981" />
                  <Text style={styles.statsCardLabel}>Total Collection</Text>
                </View>
                <Text style={styles.statsCardValue}>₹{stats.totalCollection.toLocaleString()}</Text>
              </View>
              <View style={styles.statsCard}>
                <View style={styles.statsIconBox}>
                  <MapPin size={20} color="#3b82f6" />
                  <Text style={styles.statsCardLabel}>Active Parking</Text>
                </View>
                <Text style={styles.statsCardValue}>{stats.activeParking}</Text>
              </View>
            </View>


            {selectedSite && (
              <View style={styles.siteDetailsCard}>
                <Text style={styles.siteName}>{selectedSite.name}</Text>
                <Text style={styles.siteLocation}>{selectedSite.location}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.viewContent}>
            <Text style={styles.sectionHeader}>Pending Driver Approvals</Text>

            {pendingDrivers.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <CheckCircle size={48} color="#8b5cf6" />
                </View>
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptySubtitle}>No pending driver approvals at the moment</Text>
              </View>
            ) : (
              pendingDrivers.map((driver) => (
                <View key={driver.id} style={styles.approvalCard}>
                  <View style={styles.approvalHeader}>
                    <View style={styles.driverAvatarBox}>
                      <Image
                        source={{ uri: driver.driver_photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
                        style={styles.avatarImage}
                      />
                    </View>
                    <View style={styles.driverMainInfo}>
                      <Text style={styles.driverName}>{driver.full_name || 'Unknown'}</Text>
                      <View style={styles.infoRow}>
                        <Phone size={14} color="#64748b" />
                        <Text style={styles.driverDetail}>{driver.phone || 'N/A'}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <FileText size={14} color="#64748b" />
                        <Text style={styles.driverDetail}>{driver.license_number || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.submittedDate}>
                    Submitted by Manager on {formatDate(driver.created_at)}
                  </Text>

                  <View style={styles.approvalDivider} />

                  <View style={styles.approvalActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.detailsBtn]}
                      onPress={() => navigation.navigate('DriverApprovalDetail', { driver })}
                    >
                      <Eye size={16} color="#475569" />
                      <Text style={[styles.actionText, styles.detailsText]}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtnBlock]}
                      onPress={() => handleApproveDriver(driver.id)}
                    >
                      <CheckCircle size={16} color="#ffffff" />
                      <Text style={[styles.actionText, styles.approveTextWhite]}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleRejectDriver(driver.id)}
                    >
                      <X size={16} color="#ffffff" />
                      <Text style={[styles.actionText, styles.rejectTextWhite]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>


      <Modal
        visible={showSiteDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSiteDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSiteDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            {sites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.dropdownItem,
                  selectedSite?.id === site.id && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  setSelectedSite(site);
                  setShowSiteDropdown(false);
                }}
              >
                {selectedSite?.id === site.id && (
                  <Check size={18} color="#ffffff" />
                )}
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedSite?.id === site.id && styles.dropdownItemTextSelected,
                  ]}
                >
                  {site.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f6ff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#7c3aed',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#7c3aed',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  viewContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  selectorGroup: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  selectorValue: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  perfGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  perfCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  perfLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  perfValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  statsList: {
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsCardLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  siteDetailsCard: {
    backgroundColor: '#f3e8ff',
    borderRadius: 16,
    padding: 20,
  },
  siteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  siteLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  approvalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  driverAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  driverMainInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  driverDetail: {
    fontSize: 14,
    color: '#64748b',
  },
  submittedDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
  },
  approvalDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 16,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    gap: 6,
  },
  detailsBtn: {
    backgroundColor: '#f1f5f9',
  },
  approveBtnBlock: {
    backgroundColor: '#10b981',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsText: {
    color: '#475569',
  },
  approveTextWhite: {
    color: '#ffffff',
  },
  rejectTextWhite: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownMenu: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  dropdownItemSelected: {
    backgroundColor: '#3b82f6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#ffffff',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
  },
});
