import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { buildApiUrl } from '../config/api';

export default function NINVerify({ navigation }) {
  const [nin, setNin] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return Alert.alert('Error', 'No biometric hardware');

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity',
    });

    if (result.success) {
      return 'hash1'; // In real app: hash biometric data
    } else {
      Alert.alert('Biometric failed');
      return null;
    }
  };

  const verifyVoter = async () => {
    if (!nin || nin.length !== 11) {
      Alert.alert('Invalid NIN', 'Enter 11 digits');
      return;
    }

    setLoading(true);
    const fingerprint = await verifyBiometric();
    if (!fingerprint) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(buildApiUrl('/api/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin, fingerprint }),
      });
      const data = await res.json();

      if (data.ok) {
        Alert.alert('Eligible!', 'You can now register to vote');
        // navigation.navigate('Register');
      } else {
        Alert.alert('Not Eligible', data.msg);
      }
    } catch (error) {
      Alert.alert('Error', 'Check internet or API');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>D-voX Verification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter NIN (11 digits)"
        keyboardType="numeric"
        value={nin}
        onChangeText={setNin}
        maxLength={11}
      />
      <TouchableOpacity style={styles.button} onPress={verifyVoter} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify with Fingerprint'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#0A1D56' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#00D9A5', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 18 },
  button: { backgroundColor: '#00D9A5', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});
