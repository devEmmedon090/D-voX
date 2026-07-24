// MODULAR: Vote Screen — BigInt fix + IPFS + Biometric + Centered UI
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ethers } from 'ethers';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// === CONFIG ===
const ALCHEMY_RPC = 'https://eth-sepolia.g.alchemy.com/v2/oED6dKLPbgYYFaMR9Xqcm';
const VOTING_ADDRESS = '0x16bdc6488ffcd6191c3f3f2e8863110faef4f483';  // UPDATE AFTER DEPLOYMENT
const GATEWAY = 'lime-electoral-parrotfish-434.mypinata.cloud';

const VOTING_ABI = [
  "function getElection(uint) view returns (tuple(uint id, string name, uint startTime, uint endTime, bool active, string zone, string electionType, uint[] candidateIds))",
  "function getElectionCandidates(uint) view returns (uint[])",
  "function getCandidate(uint electionId, uint candidateId) view returns (tuple(uint id, string name, uint voteCount, string ipfsHash))",
  "function castVote(uint electionId, uint candidateId)",
  "function isRegistered(address) view returns (bool)",
  "function registerVoter()"
];

export default function Vote({ navigation, route }) {
  const { election, wallet } = route.params;
  const [candidates, setCandidates] = useState([]);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  // MODULAR: Load candidates — BIG INT FIX!
  const loadCandidates = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC);
      const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, provider);

      const candidateIds = await contract.getElectionCandidates(election.id);
      const loaded = [];

      for (const idBig of candidateIds) {
        const id = Number(idBig);  // ← BIG INT → NUMBER
        const onChain = await contract.getCandidate(election.id, id);

        // MODULAR: Convert ALL uint → Number
        const candidate = {
          id: Number(onChain.id),
          name: onChain.name,
          voteCount: Number(onChain.voteCount),
          ipfsHash: onChain.ipfsHash
        };

        // MODULAR: Fetch IPFS JSON
        const hash = candidate.ipfsHash.replace('ipfs://', '');
        const metadata = await fetch(`https://${GATEWAY}/ipfs/${hash}`);
        const json = await metadata.json();

        loaded.push({ ...candidate, ...json });  // photo, logo, party, vision
      }

      setCandidates(loaded);
      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      Alert.alert('Load failed', err.message || 'Check contract or network');
      setLoading(false);
    }
  };

  // MODULAR: Biometric
  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify to Vote',
    });
    return result.success;
  };

  // MODULAR: Cast vote
  const castVote = async (candidateId) => {
    if (!await authenticate()) return Alert.alert('Biometric failed');

    setVoting(true);
    try {
      const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC);
      const signer = new ethers.Wallet(wallet.privateKey, provider);
      const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

      const tx = await contract.castVote(election.id, candidateId);
      const receipt = await tx.wait();

      await SecureStore.setItemAsync(`receipt_${election.id}`, receipt.transactionHash);
      Alert.alert('Voted!', `Tx: ${receipt.transactionHash.slice(0, 10)}...`);
      navigation.navigate('LiveStats', { electionId: election.id });
    } catch (err) {
      console.error('Vote error:', err);
      Alert.alert('Vote Failed', err.message || 'Check wallet or gas');
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#228B22" style={styles.loading} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{election.name}</Text>
      {candidates.map(c => (
        <View key={c.id} style={styles.candidateCard}>
          <Image source={{ uri: c.photo }} style={styles.photo} />
          <Image source={{ uri: c.logo }} style={styles.logo} />
          <Text style={styles.name}>{c.name} - {c.party || 'PDP'}</Text>
          <Text style={styles.vision}>Vision: {c.vision}</Text>
          <TouchableOpacity style={styles.voteBtn} onPress={() => castVote(c.id)} disabled={voting}>
            <Text style={styles.voteText}>{voting ? 'Voting...' : 'Vote for Me'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// === MODULAR STYLES: CENTERED + SPACED + LOGO ===
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#D2B48C',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loading: { flex: 1, justifyContent: 'center', backgroundColor: '#D2B48C' },
  title: { fontSize: 26, color: '#FFF', fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  candidateCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginVertical: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    elevation: 10
  },
  photo: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  logo: { width: 60, height: 60, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#8B4513' },
  vision: { fontSize: 16, color: '#A0522D', textAlign: 'center', marginVertical: 10 },
  voteBtn: { backgroundColor: '#228B22', padding: 15, borderRadius: 12, width: '80%', marginTop: 10 },
  voteText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' }
});