import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import { buildApiUrl } from '../config/api';

export default function Register({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    password: '',
    nin: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInput = (key, value) => {
    setForm({ ...form, [key]: value });
  };

    // === HASH FUNCTION (FIXED FOR EXPO) ===
    const hashString = async (str) => {
    if (!str) return '';
    console.log('🔑 Hashing:', str);
    const msgUint8 = Buffer.from(str, 'utf8');
    const hashBuffer = await Crypto.digest('SHA-256', msgUint8);
    
    // ← FIX: Convert Buffer → Uint8Array → Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    const hex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('✅ Hash result:', hex);
    return hex;
  };

  // === BIOMETRIC (WITH LOGS) ===
  const scanBiometric = async () => {
    console.log('🔍 Checking biometric hardware...');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    console.log('Hardware:', hasHardware);

    if (!hasHardware) {
      Alert.alert('Error', 'No biometric sensor');
      return null;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    console.log('Enrolled:', isEnrolled);

    if (!isEnrolled) {
      Alert.alert('Error', 'No fingerprint/face enrolled');
      return null;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Register with fingerprint/face',
    });
    console.log('Biometric result:', result);

    if (!result.success) {
      Alert.alert('Failed', 'Biometric not recognized');
      return null;
    }

    const template = `bio_${Date.now()}_${Math.random()}`;
    const bioHash = await hashString(template);
    
    if (!bioHash) {
      console.error('❌ bioHash is empty!');
      return null;
    }

    await SecureStore.setItemAsync('bio_hash', bioHash);
    console.log('✅ Bio hash saved to SecureStore');
    return bioHash;
  };

  // === GENERATE WALLET ===
const generateWallet = async () => {
  console.log('🔑 Generating wallet...');
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const hexKey = '0x' + Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const wallet = new ethers.Wallet(hexKey);
  console.log('✅ Wallet address:', wallet.address);
  await SecureStore.setItemAsync('private_key', wallet.privateKey);
  return wallet.address;
};

  // === MAIN REGISTER ===
  const register = async () => {
  console.log('🚀 Register clicked');
  const { fullName, phone, email, dob, password, nin } = form;

  if (!fullName || !phone || !password || !nin || !dob) {
    Alert.alert('Error', 'All required fields must be filled');
    return;
  }
  if (nin.length !== 11) {
    Alert.alert('Error', 'NIN must be 11 digits');
    return;
  }

  setLoading(true);
  console.log('⏳ Hashing data...');

  try {
    const ninHash = await hashString(nin);
    const dobHash = await hashString(dob);
    console.log('✅ NIN Hash:', ninHash);
    console.log('✅ DOB Hash:', dobHash);

    const bioHash = await scanBiometric();
    if (!bioHash) {
    console.log('❌ Biometric failed');
      setLoading(false);
      return;
    }
    // === SAVE BIO HASH ONLY HERE (REGISTER ONLY) ===
    await SecureStore.setItemAsync('bio_hash', bioHash);
    console.log('Bio hash saved to SecureStore (REGISTER ONLY):', bioHash);
    
    console.log('✅ Bio Hash:', bioHash);

    const wallet = await generateWallet();
    console.log('✅ Wallet:', wallet);

    console.log('📡 Sending to server...');
    const res = await fetch(buildApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName, phone, email: email || null, dobHash, password, ninHash, bioHash, wallet
      }),
    });

    const text = await res.text();  // ← GET RAW RESPONSE
    console.log('📥 Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ Not JSON:', text);
      Alert.alert('Server Error', 'Invalid response from server');
      setLoading(false);
      return;
    }

    if (data.ok) {
      Alert.alert('Success!', data.msg, [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Failed', data.msg);
    }
  } catch (error) {
    console.error('💥 Register error:', error);
    Alert.alert('Error', 'Check server or internet');
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>D-voX Register</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={form.fullName} onChangeText={v => handleInput('fullName', v)} />
      <TextInput style={styles.input} placeholder="Phone (080...)" keyboardType="phone-pad" value={form.phone} onChangeText={v => handleInput('phone', v)} />
      <TextInput style={styles.input} placeholder="Email (optional)" keyboardType="email-address" value={form.email} onChangeText={v => handleInput('email', v)} />
      <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" value={form.dob} onChangeText={v => handleInput('dob', v)} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password} onChangeText={v => handleInput('password', v)} />
      <TextInput style={styles.input} placeholder="NIN (11 digits)" keyboardType="numeric" maxLength={11} value={form.nin} onChangeText={v => handleInput('nin', v)} />

      <TouchableOpacity style={styles.button} onPress={register} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Registering...' : 'Register with Biometric'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#0A1D56' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#00D9A5', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#00D9A5', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});
