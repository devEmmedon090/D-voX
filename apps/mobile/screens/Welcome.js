// === IMPORTS ===
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { ethers } from 'ethers';

// === CONFIG ===
import { buildApiUrl } from '../config/api';

const CONTRACT_ADDRESS = '0x8d726de195271a3767fd435d78322c061df651bb';
const ALCHEMY_RPC = 'https://eth-sepolia.g.alchemy.com/v2/oED6dKLPbgYYFaMR9Xqcm';
const ABI = [
  "function eligibleVoters(address) view returns (bool)",
  "function addEligibleVoter(address) external"
];

export default function Welcome({ route, navigation }) {
  const { fullName, ninHash, wallet } = route.params;
  const [eligibility, setEligibility] = useState(null);  // null = not checked, true/false = result
  const [history, setHistory] = useState([]);
  const [headlines, setHeadlines] = useState([]);

  useEffect(() => {
    fetchHistory();
    fetchHeadlines();
  }, []);

  // === CHECK ELIGIBILITY — ON-CHAIN (ADMIN MARKED) ===
const checkEligibility = async () => {
  setEligibility('loading');
  console.log('Checking on-chain eligibility for:', wallet.address);

  try {
  const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC);
  
  // Test connection
  await provider.getBlockNumber();
  
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const isEligible = await contract.eligibleVoters(wallet.address);

  setEligibility(isEligible);
} catch (error) {
  console.error('RPC Error:', error.message);
  Alert.alert('Network Error', 'Cannot connect to blockchain. Try WiFi or check RPC URL.');
  setEligibility(false);
}
};

  // === FETCH HISTORY & HEADLINES ===
  const fetchHistory = async () => {
    setHistory([
      { id: 1, election: 'Student Union 2025', candidate: 'Candidate A', date: 'Oct 15' },
    ]);
  };

  const fetchHeadlines = async () => {
    setHeadlines([
      { id: 1, title: 'Election Day: Nov 1' },
    ]);
  };

  // === COMPONENTS ===
  const Greeting = () => (
    <View style={styles.greeting}>
      <Text style={styles.title}>Welcome, {fullName}!</Text>
      <Text style={styles.nin}>NIN: {ninHash.slice(0, 4)}****{ninHash.slice(-4)}</Text>
    </View>
  );

  const EligibilitySection = () => {
    if (eligibility === null) {
      return (
        <View style={styles.section}>
          <TouchableOpacity style={styles.checkButton} onPress={checkEligibility}>
            <Text style={styles.checkButtonText}>Check Eligibility</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (eligibility === 'loading') {
      return <Text style={styles.loading}>Checking eligibility...</Text>;
    }

    const status = eligibility ? 'Eligible to Vote' : 'Not Eligible';
    const color = eligibility ? '#00D9A5' : '#FF0000';

    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{status}</Text>
        <Text style={styles.badgeDetail}>NIN Verified: Yes</Text>
        <Text style={styles.badgeDetail}>Age Eligible: Yes</Text>
        <Text style={styles.badgeDetail}>Region Eligible: Yes</Text>
      </View>
    );
  };

  const HistoryList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Voting History</Text>
      {history.length === 0 ? (
        <Text style={styles.noData}>No voting history yet.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.election}</Text>
              <Text style={styles.cardSub}>Voted for {item.candidate} on {item.date}</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  const HeadlinesCarousel = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Campaign Headlines</Text>
      <FlatList
        data={headlines}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.carouselCard}>
            <Text style={styles.carouselText}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );

  const Actions = () => (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ElectionList', { wallet })}>
        <Text style={styles.actionText}>Check Elections</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.actionText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Greeting />
      <EligibilitySection />
      <HistoryList />
      <HeadlinesCarousel />
      <Actions />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1D56' },
  greeting: { padding: 20, alignItems: 'center' },
  title: { fontSize: 28, color: '#00D9A5', fontWeight: 'bold' },
  nin: { color: 'white', fontSize: 16, marginTop: 10 },
  section: { padding: 20 },
  checkButton: {
    backgroundColor: '#00D9A5',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  loading: { color: '#00D9A5', textAlign: 'center', fontSize: 16 },
  badge: { padding: 20, borderRadius: 10, alignItems: 'center', margin: 20 },
  badgeText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  badgeDetail: { fontSize: 16, color: 'white', marginTop: 8 },
  sectionTitle: { fontSize: 20, color: '#00D9A5', marginBottom: 10 },
  noData: { color: 'white', textAlign: 'center' },
  card: { backgroundColor: '#0A1D56', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#00D9A5' },
  cardText: { color: 'white', fontSize: 18 },
  cardSub: { color: '#00D9A5', fontSize: 14 },
  carouselCard: { backgroundColor: '#0A1D56', padding: 15, borderRadius: 10, marginRight: 10, width: 200, borderWidth: 1, borderColor: '#00D9A5' },
  carouselText: { color: 'white', textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  actionButton: { backgroundColor: '#00D9A5', padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5 },
  actionText: { color: 'white', fontWeight: 'bold' },
});