import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';
        const res = await fetch(`${apiUrl}/beekeepers/dashboard`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HONEYCHAIN</Text>
        <Text style={styles.headerSubtitle}>Beekeeper Dashboard</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {data?.name || 'Beekeeper'}</Text>
          <Text style={styles.locationText}>{data?.cluster || 'Fetching cluster...'}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data?.activeHives ?? 0}</Text>
            <Text style={styles.statLabel}>Active Hives</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data?.totalHarvested ?? 0}<Text style={styles.statUnit}>kg</Text></Text>
            <Text style={styles.statLabel}>Harvested</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data?.activeBatches ?? 0}</Text>
            <Text style={styles.statLabel}>Active Batches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, (data?.alerts ?? 0) > 0 ? styles.textWarning : {}]}>{data?.alerts ?? 0}</Text>
            <Text style={styles.statLabel}>QR Alerts</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconPlaceholder} />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Create Honey Batch</Text>
            <Text style={styles.actionDesc}>Record a new harvest</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconPlaceholder} />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Manage Hives</Text>
            <Text style={styles.actionDesc}>Register or update hive status</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconPlaceholder} />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Print QR Labels</Text>
            <Text style={styles.actionDesc}>Generate labels for packaging</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.futureSection}>
          <Text style={styles.futureTitle}>Future Smart Hive Integration</Text>
          <Text style={styles.futureDesc}>IoT Sensors and Machine Learning yield predictions will appear here in Phase 2.</Text>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#000000',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
  },
  textWarning: {
    color: '#ff0000',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginTop: 16,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  actionIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111111',
  },
  actionDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  futureSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  futureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#444444',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  futureDesc: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
    lineHeight: 20,
  }
});
