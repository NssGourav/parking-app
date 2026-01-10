import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {



        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role_id, full_name, email')
          .eq('id', data.user.id);



        if (profileError) {

          Alert.alert('Error', 'Failed to fetch user profile. Please try again.');
          setLoading(false);
          return;
        }


        if (!profileData || profileData.length === 0) {
          Alert.alert(
            'Profile Not Found',
            'Your account does not have a profile. Please contact support.'
          );
          setLoading(false);
          return;
        }

        const profile = profileData[0];
        let roleName = profile.role?.name?.toLowerCase()?.trim();

        if (!roleName && profile.role_id) {
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();

          if (!roleError && roleData) {
            roleName = roleData.name?.toLowerCase()?.trim();
          }
        }

        if (roleName === 'user') {
          navigation.replace('Home');
        } else if (roleName === 'driver') {
          navigation.replace('DriverConsole');
        } else if (roleName === 'manager') {
          navigation.replace('ManagerDashboard');
        } else if (roleName === 'super_admin' || roleName === 'superadmin' || roleName === 'admin') {
          navigation.replace('SuperAdmin');
        } else {
          Alert.alert('Error', `Invalid user role: "${roleName}". Please contact support.`);
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.authCard}>
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>Smart Parking</Text>
            <Text style={styles.authSubtitle}>Welcome back! Please login to continue.</Text>
          </View>

          <View style={styles.authForm}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.authFooter}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.authLink}
                onPress={() => navigation.navigate('Register')}
              >
                Register
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  authHeader: {
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  authForm: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  btnPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  authLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
