import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ethers } from 'ethers';

// === CONFIG (MODULAR) ===
const ALCHEMY_RPC = 'https://eth-sepolia.g.alchemy.com/v2/oED6dKLPbgYYFaMR9Xqcm';
const VOTING_ADDRESS = '0x16bdc6488ffcd6191c3f3f2e8863110faef4f483';  // ← UPDATED AFTER DEPLOYMENT
const VOTING_REGISTRY= '0xcd6565fcc358bbb60dd985c98ceebb53661637de';
const VOTING_ABI = [
  "function electionCount() view returns (uint256)",
  "function getElection(uint256) view returns ((uint id, string name, uint startTime, uint endTime, bool active, string zone, string electionType, uint[] candidateIds))",
  "function isRegistered(address) view returns (bool)",
  "function registerVoter() external"
];

export default function ElectionList({ navigation, route }) {
  const { wallet } = route.params;
  const [elections, setElections] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [loading, setLoading] = useState(true);


  const fetchElections = async () => {
      const checkRegistrationStatus = async (contract, list) => {
      const statuses = {};
      for (const e of list) {
        const registered = await contract.isRegistered(wallet.address);
        statuses[e.id] = registered;
      }
      setRegistrationStatus(statuses);
    };

    try {
      const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC);
      const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, provider);

      const countBN = await contract.electionCount();
      const count = Number(countBN);
      console.log("Election Count:", count);

      const list = [];

      for (let i = 1; i <= count; i++) {
        try {
          const e = await contract.getElection(i);

          // Safely convert BigInts to JS numbers
          const election = {
            id: Number(e.id),
            name: e.name,
            startTime: Number(e.startTime),
            endTime: Number(e.endTime),
            active: e.active,
            zone: e.zone,
            electionType: e.electionType,
            candidateIds: e.candidateIds.map(id => Number(id)),
          };

          console.log("Fetched Election:", election);

          const now = Math.floor(Date.now() / 1000);

          // Only include active, unexpired elections
          if (election.active && election.endTime > now) {
            list.push(election);
          }
        } catch (innerError) {
          console.warn(`Failed to load election ${i}:`, innerError);
        }
      }

      setElections(list);
      if (list.length === 0) {
        console.warn("No active elections found.");
      }

      // Check registration status if elections exist
      if (list.length > 0) {
        await checkRegistrationStatus(contract, list);
      }

    } catch (error) {
      console.error("Fetch Elections Error:", error);
      Alert.alert('Error', 'Failed to load elections. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  // === MODULAR: REGISTER TO VOTE (PER ELECTION) ===
  const registerForElection = async (electionId) => {
    Alert.alert('Registering...', 'Sign transaction to join this election.');
    console.log('🟡 Starting voter registration for election:', electionId);

    try {
      console.log('🧩 Creating provider...');
      const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC);
      console.log('✅ Provider connected:', provider.connection?.url || 'Unknown RPC');

      console.log('🔑 Creating wallet with provider...');
      const walletWithProvider = new ethers.Wallet(wallet.privateKey, provider);
      console.log('✅ Wallet address:', walletWithProvider.address);

      console.log('🧾 Initializing contract...');
      console.log('Contract Address:', VOTING_REGISTRY);
      console.log('Using ABI:', VOTING_ABI);
      const contract = new ethers.Contract(VOTING_REGISTRY, VOTING_ABI, walletWithProvider);
      console.log('✅ Contract ready:', contract.target || contract.address);

      console.log('🚀 Sending register transaction...');
      const tx = await contract.registerVoter();
      console.log('📤 Transaction sent:', tx.hash);

      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      // Update registration state
      setRegistrationStatus(prev => ({ ...prev, [electionId]: true }));
      console.log('✅ Updated registration status:', { ...registrationStatus, [electionId]: true });

      Alert.alert('Success!', 'You are now registered!');
    } catch (error) {
      console.error('❌ Registration failed:', error);
      Alert.alert('Failed', error.message);
    }
  };


  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => { fetchElections(); }, []);

  if (loading) return <Text style={styles.loading}>Loading elections...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Elections</Text>

      {elections.length === 0 ? (
        <Text style={styles.noElection}>No active elections.</Text>
      ) : (
        <FlatList
          data={elections}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}  // ← CENTER FLATLIST
          renderItem={({ item }) => {
            const isReg = registrationStatus[item.id];

            return (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.info}>Type: {item.type}</Text>
                <Text style={styles.time}>
                  Ends: {new Date(item.endTime * 1000).toLocaleString()}
                </Text>

                {isReg === undefined ? (
                  <Text style={styles.checking}>Checking registration...</Text>
                ) : isReg ? (
                  <TouchableOpacity
                    style={styles.voteBtn}
                    onPress={() => navigation.navigate('Vote', { election: item, wallet })}
                  >
                    <Text style={styles.voteBtnText}>Vote Now</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.registerBtn}
                    onPress={() => registerForElection(item.id)}
                  >
                    <Text style={styles.registerBtnText}>Register to Vote</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

// === MODULAR STYLES: LIGHT BROWN & WHITE (PDF BLEND) ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D2B48C',  // Light brown — warm base
    padding: 20,
    justifyContent: 'center',    // ← CENTER VERTICALLY
    alignItems: 'center'         // ← CENTER HORIZONTALLY
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',            // White text
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
    marginTop: 30
  },
  listContainer: {
    flexGrow: 1,                 // Grow to fill, center if few items
    justifyContent: 'center',
    width: '100%'
  },
  card: {
    backgroundColor: '#FFFFFF',  // White card
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#8B4513',      // Brown shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  name: { color: '#8B4513', fontSize: 20, fontWeight: 'bold' },  // Saddle brown
  info: { color: '#A0522D', fontSize: 16, marginTop: 6 },       // Sienna
  time: { color: '#696969', fontSize: 14, marginTop: 8 },       // Dim gray
  checking: { color: '#8B7355', textAlign: 'center', marginTop: 12 },
  registerBtn: {
    backgroundColor: '#8B4513',  // Saddle brown
    padding: 15,
    borderRadius: 12,
    marginTop: 15
  },
  registerBtnText: { color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center' },
  voteBtn: {
    backgroundColor: '#228B22',  // Forest green
    padding: 15,
    borderRadius: 12,
    marginTop: 15
  },
  voteBtnText: { color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center' },
  noElection: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontStyle: 'italic'
  },
  loading: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600'
  }
});