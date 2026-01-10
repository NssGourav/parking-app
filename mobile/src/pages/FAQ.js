import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { ArrowLeft, HelpCircle, Pencil } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

function FAQ() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      if (profileData && profileData.length > 0) {
        setProfile(profileData[0]);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: 'How do I add a vehicle?',
      answer: 'Go to the "Manage Vehicles" section and click "Add New Vehicle".',
    },
    {
      question: 'How do I remove a vehicle?',
      answer: 'Go to the "Manage Vehicles" section and click "Remove" next to the vehicle you want to delete.',
    },
    {
      question: 'How do I manage payment methods?',
      answer: 'Go to the "Payment Methods" section and add or remove payment options.',
    },
    {
      question: 'How do I view transaction history?',
      answer: 'Go to the "Transaction History" section to view all your payments.',
    },
  ];

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>FAQ</Text>
          </View>
          <Text style={styles.headerSubtitle}>Frequently Asked Questions</Text>
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


        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <View style={styles.faqLeft}>
                <View style={styles.faqIconContainer}>
                  <HelpCircle size={20} color="#4b5563" />
                </View>
              </View>
              <View style={styles.faqRight}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            </View>
          ))}
        </View>
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
    paddingBottom: 100,
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
    paddingBottom: 32,
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
    marginTop: 24,
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
  faqList: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 16,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  faqLeft: {
    marginRight: 12,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqRight: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default FAQ;
