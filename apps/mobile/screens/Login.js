import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import { buildApiUrl } from '../config/api';

export default function Login({ navigation }) {
  const [nin, setNin] = useState('');
  const [loading, setLoading] = useState(false);

  // === HASH FUNCTION (SAME AS REGISTER) ===
  const hashString = async (str) => {
    if (!str) return '';
    const msgUint8 = Buffer.from(str, 'utf8');
    const hashBuffer = await Crypto.digest('SHA-256', msgUint8);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // === BIOMETRIC + HASH ===
  const scanBiometric = async () => {
    console.log('🔍 Checking biometric...');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert('Error', 'No biometric sensor');
      return null;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      Alert.alert('Error', 'No fingerprint/face enrolled');
      return null;
    }

      const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with biometric',
    });

    if (!result.success) return null;

    // === LOAD STORED BIO HASH (NO NEW HASH) ===
    const storedBioHash = await SecureStore.getItemAsync('bio_hash');
    if (!storedBioHash) {
      Alert.alert('Error', 'Biometric not registered. Register first.');
      return null;
    }

    console.log('Using stored Bio Hash for login:', storedBioHash);
    return storedBioHash;
  };

  // === MAIN LOGIN ===
  const login = async () => {
    if (!nin || nin.length !== 11) {
      Alert.alert('Error', 'Enter valid 11-digit NIN');
      return;
    }

    setLoading(true);
    console.log('🚀 Login started...');

    try {
      // 1. Hash NIN
      const ninHash = await hashString(nin);
      console.log('🔑 NIN Hash:', ninHash);

      // 2. Biometric
      const bioHash = await scanBiometric();
      if (!bioHash) {
        setLoading(false);
        return;
      }

      // 3. Send to server
      console.log('📡 Sending to server...');
      const res = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ninHash, bioHash }),
      });

      const data = await res.json();
      console.log('📥 Response:', data);

      if (!data.ok) {
        Alert.alert('Login Failed', data.msg || 'Invalid NIN or biometric');
        setLoading(false);
        return;
      }

      // 4. Load wallet
      const privateKey = await SecureStore.getItemAsync('private_key');
      if (!privateKey) {
        Alert.alert('Error', 'Wallet not found. Register first.');
        setLoading(false);
        return;
      }

      const wallet = new ethers.Wallet(privateKey);
      console.log('✅ Wallet loaded:', wallet.address);

      // 5. Navigate to Welcome
      navigation.navigate('Welcome', {
        wallet,
        ninHash,
        fullName: data.fullName || 'Voter'
      });

      Alert.alert('Success!', 'Login successful!');

    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Check server or internet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>D-voX Login</Text>

      <TextInput
        style={styles.input}
        placeholder="NIN (11 digits)"
        keyboardType="numeric"
        maxLength={11}
        value={nin}
        onChangeText={setNin}
      />

      <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login with Biometric'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>New? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#0A1D56' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#00D9A5', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#00D9A5', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  link: { color: '#00D9A5', textAlign: 'center', marginTop: 20, fontSize: 16 },
});
