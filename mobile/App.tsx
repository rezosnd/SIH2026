import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, ActivityIndicator, useWindowDimensions, Platform, Image,
  Alert, TextInput
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { 
  Bell, User, Home, Package, QrCode, Printer, PackagePlus, ChevronRight, Activity, Hexagon, AlertCircle
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const BRAND_FONT = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const SANS_FONT = Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' });

// Custom Beehive Icon to match Lucide's style (stroke: currentColor, fill: none, stroke-width: 2)
const BeehiveIcon = ({ size = 24, color = "#000", strokeWidth = 2, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M7 8c0-2.76 2.24-5 5-5s5 2.24 5 5" />
    <Path d="M4 8h16" />
    <Path d="M4 8v3h16V8" />
    <Path d="M5 11v3h14v-3" />
    <Path d="M6 14v3h12v-3" />
    <Path d="M7 17v4h10v-4" />
    <Path d="M11 21v-3a1 1 0 0 1 2 0v3" />
  </Svg>
);

// Custom Honey Jar Icon
const HoneyJarIcon = ({ size = 24, color = "#000", strokeWidth = 2, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M8 4h8" />
    <Path d="M7 4v3h10V4" />
    <Path d="M7 7c-2 2-2 14-2 14h14c0 0 0-12-2-14" />
    <Path d="M5 12h14" />
    <Path d="M6 17h12" />
    <Path d="M12 12v3a1 1 0 0 1-2 0" />
  </Svg>
);

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

  useEffect(() => {
    async function init() {
      try {
        const apiUrl = 'http://10.170.214.1:4000';
        const tokenRes = await fetch(`${apiUrl}/auth/dev-login`);
        const tokenData = await tokenRes.json();
        setToken(tokenData.access_token);
        
        const res = await fetch(`${apiUrl}/beekeepers/dashboard`, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const BrandHeader = ({ color = '#fff' }: { color?: string }) => (
    <View style={styles.brandContainer}>
      <Text style={[styles.headerTitle, { color }]}>HONEYCHAIN</Text>
    </View>
  );

  const TopControls = ({ isDark = false }: { isDark?: boolean }) => (
    <View style={styles.topControls}>
      <TouchableOpacity style={styles.iconButton}>
        <Bell size={22} color={isDark ? "#111" : "#fff"} strokeWidth={2} />
        <View style={styles.notificationBadge} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.iconButton, { marginLeft: 16 }]}>
        <User size={24} color={isDark ? "#111" : "#fff"} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  const HoneycombBackground = () => (
    <View style={styles.honeycombWrapper}>
      <Hexagon size={60} color="rgba(255,255,255,0.02)" style={{ position: 'absolute', top: 0, left: 40 }} strokeWidth={1} />
      <Hexagon size={60} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', top: 30, left: 90 }} strokeWidth={1} />
      <Hexagon size={60} color="rgba(255,255,255,0.02)" style={{ position: 'absolute', top: 80, left: 40 }} strokeWidth={1} />
      <Hexagon size={60} color="rgba(255,255,255,0.04)" style={{ position: 'absolute', top: -20, left: 140 }} strokeWidth={1} />
      <Hexagon size={60} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', top: 30, left: 190 }} strokeWidth={1} />
      <Hexagon size={60} color="rgba(255,255,255,0.02)" style={{ position: 'absolute', top: 80, left: 140 }} strokeWidth={1} />
      <Hexagon size={60} color="rgba(255,255,255,0.02)" style={{ position: 'absolute', top: 130, left: 90 }} strokeWidth={1} />
    </View>
  );

  const MobileHero = () => (
    <View style={styles.heroSection}>
      <HoneycombBackground />
      
      {/* Colorful Beehive Image (No dark overlays!) */}
      <Image 
        source={require('./assets/beehouse.png')} 
        style={styles.heroImage}
        resizeMode="contain"
      />
      
      <View style={styles.heroTop}>
        <TouchableOpacity style={styles.iconButton}>
          <Activity size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <BrandHeader />
        <TopControls />
      </View>
      <View style={styles.heroWelcome}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.welcomeName}>{loading ? '...' : (data?.name || 'Beekeeper')}</Text>
        <Text style={styles.welcomeDesc}>Here's what's happening with your hives.</Text>
      </View>
    </View>
  );

  const StatCard = ({ title, value, unit, IconComponent, alert }: { title: string, value: any, unit?: string, IconComponent: any, alert?: boolean }) => (
    <TouchableOpacity style={[styles.statCard, isLargeScreen && styles.statCardDesktop]} activeOpacity={0.7}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconWrapper, alert && { backgroundColor: '#FFF5F5' }]}>
          <IconComponent size={24} color={alert ? "#E60000" : "#111111"} strokeWidth={2} />
        </View>
        <ChevronRight size={18} color="#CCCCCC" strokeWidth={2} />
      </View>
      <View style={styles.statBody}>
        {loading ? (
          <View style={styles.skeletonBlock} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={[styles.statValue, alert && value > 0 && { color: '#E60000' }]}>
              {value ?? 0}
            </Text>
            {unit && <Text style={styles.statUnit}>{unit}</Text>}
          </View>
        )}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const ActionCard = ({ title, desc, IconComponent, onPress }: { title: string, desc: string, IconComponent: any, onPress?: () => void }) => (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.actionIconWrapperDark}>
        <IconComponent size={24} color="#FFFFFF" strokeWidth={2} />
      </View>
      <View style={styles.actionTextWrapper}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <ChevronRight size={20} color="#CCCCCC" strokeWidth={2} />
    </TouchableOpacity>
  );

  const HiveStatus = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.statusSectionTitle}>HIVE STATUS</Text>
      <View style={styles.statusCard}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>All systems operational</Text>
      </View>
    </View>
  );

  const DashboardContent = () => (
    <View style={styles.contentArea}>
      <View style={styles.statsGrid}>
        <StatCard title="ACTIVE HIVES" value={data?.activeHives} IconComponent={BeehiveIcon} />
        <StatCard title="HARVESTED" value={data?.totalHarvested} unit="kg" IconComponent={HoneyJarIcon} />
        <StatCard title="ACTIVE BATCHES" value={data?.activeBatches} IconComponent={Package} />
        <StatCard title="QR ALERTS" value={data?.alerts} alert={data?.alerts > 0} IconComponent={QrCode} />
      </View>

      <HiveStatus />

      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

      <View style={styles.actionsGrid}>
        <ActionCard title="Create Honey Batch" desc="Record a new harvest" IconComponent={PackagePlus} onPress={() => setActiveTab('CreateBatch')} />
        <ActionCard title="Manage Hives" desc="Register or update hive status" IconComponent={BeehiveIcon} onPress={() => setActiveTab('Hives')} />
        <ActionCard title="View QR Codes" desc="See containers and QR labels" IconComponent={QrCode} onPress={() => setActiveTab('Containers')} />
      </View>
    </View>
  );

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [hives, setHives] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);

  // Form states
  const [hiveLocation, setHiveLocation] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('');
  const [selectedHiveId, setSelectedHiveId] = useState('');

  const fetchHives = async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';
      const res = await fetch(`${apiUrl}/hives`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setHives(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';
      const res = await fetch(`${apiUrl}/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setBatches(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContainers = async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';
      // Fetch all batches with their containers
      const res = await fetch(`${apiUrl}/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const batchList = await res.json();
        // Flatten containers from all batches
        const allContainers: any[] = [];
        for (const batch of batchList) {
          if (batch.containers && batch.containers.length > 0) {
            batch.containers.forEach((c: any) => {
              allContainers.push({ ...c, batchId: batch.id });
            });
          }
        }
        setContainers(allContainers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'Hives' || activeTab === 'CreateBatch') fetchHives();
    if (activeTab === 'Batches') fetchBatches();
    if (activeTab === 'Containers') fetchContainers();
  }, [activeTab, token]);


  const handleCreateHive = async () => {
    if (!hiveLocation) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';
      const res = await fetch(`${apiUrl}/hives`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ location: hiveLocation, status: 'ACTIVE' })
      });
      if (res.ok) {
        Alert.alert('Success', 'Hive registered successfully!');
        setHiveLocation('');
        setActiveTab('Hives');
      } else {
        Alert.alert('Error', 'Failed to register hive');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleCreateBatch = async () => {
    if (!selectedHiveId || !batchQuantity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';
      const res = await fetch(`${apiUrl}/batches`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ hiveId: selectedHiveId, quantity: parseFloat(batchQuantity), status: 'HARVESTED' })
      });
      if (res.ok) {
        Alert.alert('Success', 'Batch created successfully!');
        setBatchQuantity('');
        setSelectedHiveId('');
        setActiveTab('Batches');
      } else {
        Alert.alert('Error', 'Failed to create batch');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred');
    }
  };

  const HivesContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>MY HIVES</Text>
      {hives.length === 0 ? (
        <Text style={{color: '#666', marginTop: 20}}>No hives found.</Text>
      ) : (
        hives.map(hive => (
          <View key={hive.id} style={styles.actionCard}>
            <View style={styles.actionIconWrapperDark}>
              <BeehiveIcon size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>{hive.location}</Text>
              <Text style={styles.actionDesc}>Status: {hive.status}</Text>
            </View>
          </View>
        ))
      )}
      <TouchableOpacity 
        style={[styles.actionCard, { marginTop: 20, backgroundColor: '#111' }]} 
        activeOpacity={0.7}
        onPress={() => setActiveTab('CreateHive')}
      >
        <Text style={[styles.actionTitle, { color: '#fff', textAlign: 'center', width: '100%' }]}>+ Register New Hive</Text>
      </TouchableOpacity>
    </View>
  );

  const CreateHiveContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>REGISTER NEW HIVE</Text>
      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Hive Location</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder="e.g. North Apiary, Sector 4"
          value={hiveLocation}
          onChangeText={setHiveLocation}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateHive}>
          <Text style={styles.primaryButtonText}>Register Hive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveTab('Hives')}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const CreateBatchContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>CREATE HONEY BATCH</Text>
      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Select Source Hive</Text>
        <ScrollView style={{maxHeight: 150, marginBottom: 16}}>
          {hives.map(h => (
            <TouchableOpacity 
              key={h.id} 
              style={[styles.hiveSelectItem, selectedHiveId === h.id && styles.hiveSelectItemSelected]}
              onPress={() => setSelectedHiveId(h.id)}
            >
              <Text style={[styles.hiveSelectText, selectedHiveId === h.id && {color: '#fff'}]}>{h.location}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.inputLabel}>Harvest Quantity (kg)</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder="e.g. 25"
          keyboardType="numeric"
          value={batchQuantity}
          onChangeText={setBatchQuantity}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateBatch}>
          <Text style={styles.primaryButtonText}>Create Batch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveTab('Batches')}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const BatchesContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>MY BATCHES</Text>
      {batches.length === 0 ? (
        <Text style={{color: '#666', marginTop: 20}}>No batches found.</Text>
      ) : (
        batches.map(batch => (
          <View key={batch.id} style={[styles.actionCard, {height: 'auto', paddingVertical: 16, marginBottom: 12}]}>
            <View style={styles.actionIconWrapperDark}>
              <Package size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Batch {batch.id.substring(0,6).toUpperCase()}</Text>
              <Text style={styles.actionDesc}>Status: {batch.status}</Text>
              <Text style={styles.actionDesc}>Qty: {batch.quantity}kg</Text>
            </View>
          </View>
        ))
      )}
      <TouchableOpacity 
        style={[styles.actionCard, { marginTop: 20, backgroundColor: '#111' }]} 
        activeOpacity={0.7}
        onPress={() => setActiveTab('CreateBatch')}
      >
        <Text style={[styles.actionTitle, { color: '#fff', textAlign: 'center', width: '100%' }]}>+ Create Honey Batch</Text>
      </TouchableOpacity>
    </View>
  );

  const ContainersContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>MY QR CODES & CONTAINERS</Text>
      {containers.length === 0 ? (
        <Text style={{color: '#666', marginTop: 20}}>No QR containers generated yet. Processors create these when packaging.</Text>
      ) : (
        containers.map(c => (
          <View key={c.id} style={[styles.actionCard, {height: 'auto', paddingVertical: 16, marginBottom: 12}]}>
            <View style={styles.actionIconWrapperDark}>
              <QrCode size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Size: {c.containerSize}kg</Text>
              <Text style={styles.actionDesc}>Batch: {c.batchId.substring(0,6).toUpperCase()}</Text>
              <Text style={[styles.actionDesc, {fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 4, fontSize: 10}]}>{c.qrData}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const MobileBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={activeTab === 'Dashboard' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('Dashboard')}>
        <Home size={22} color={activeTab === 'Dashboard' ? "#FFFFFF" : "#999999"} strokeWidth={2} />
        <Text style={activeTab === 'Dashboard' ? styles.navTextActive : styles.navText}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={activeTab === 'Hives' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('Hives')}>
        <BeehiveIcon size={24} color={activeTab === 'Hives' ? "#FFFFFF" : "#999999"} strokeWidth={2} />
        <Text style={activeTab === 'Hives' ? styles.navTextActive : styles.navText}>Hives</Text>
      </TouchableOpacity>
      <TouchableOpacity style={activeTab === 'Batches' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('Batches')}>
        <Package size={24} color={activeTab === 'Batches' ? "#FFFFFF" : "#999999"} strokeWidth={2} />
        <Text style={activeTab === 'Batches' ? styles.navTextActive : styles.navText}>Batches</Text>
      </TouchableOpacity>
      <TouchableOpacity style={activeTab === 'Alerts' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('Alerts')}>
        <Bell size={24} color={activeTab === 'Alerts' ? "#FFFFFF" : "#999999"} strokeWidth={2} />
        <Text style={activeTab === 'Alerts' ? styles.navTextActive : styles.navText}>Alerts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={activeTab === 'Profile' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('Profile')}>
        <User size={24} color={activeTab === 'Profile' ? "#FFFFFF" : "#999999"} strokeWidth={2} />
        <Text style={activeTab === 'Profile' ? styles.navTextActive : styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const DesktopSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarBrand}>
        <BrandHeader color="#111" />
      </View>
      <View style={styles.sidebarNav}>
        <TouchableOpacity style={activeTab === 'Dashboard' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setActiveTab('Dashboard')}>
          <Home size={20} color={activeTab === 'Dashboard' ? "#111111" : "#6B6B6B"} strokeWidth={2} />
          <Text style={activeTab === 'Dashboard' ? styles.sidebarTextActive : styles.sidebarText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'Hives' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setActiveTab('Hives')}>
          <BeehiveIcon size={20} color={activeTab === 'Hives' ? "#111111" : "#6B6B6B"} strokeWidth={2} />
          <Text style={activeTab === 'Hives' ? styles.sidebarTextActive : styles.sidebarText}>Hives</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'Batches' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setActiveTab('Batches')}>
          <Package size={20} color={activeTab === 'Batches' ? "#111111" : "#6B6B6B"} strokeWidth={2} />
          <Text style={activeTab === 'Batches' ? styles.sidebarTextActive : styles.sidebarText}>Batches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'Alerts' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setActiveTab('Alerts')}>
          <Bell size={20} color={activeTab === 'Alerts' ? "#111111" : "#6B6B6B"} strokeWidth={2} />
          <Text style={activeTab === 'Alerts' ? styles.sidebarTextActive : styles.sidebarText}>Alerts</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={activeTab === 'Profile' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setActiveTab('Profile')}>
        <User size={20} color={activeTab === 'Profile' ? "#111111" : "#6B6B6B"} strokeWidth={2} />
        <Text style={activeTab === 'Profile' ? styles.sidebarTextActive : styles.sidebarText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style={isLargeScreen ? "dark" : "light"} />
        
        {isLargeScreen ? (
          <View style={styles.desktopLayout}>
            <DesktopSidebar />
            <View style={styles.desktopMain}>
              <View style={styles.desktopHeader}>
                <View>
                  <Text style={styles.welcomeTextDark}>Welcome back,</Text>
                  <Text style={styles.welcomeNameDark}>{loading ? '...' : (data?.name || 'Beekeeper')}</Text>
                </View>
                <TopControls isDark={true} />
              </View>
              <ScrollView style={styles.scrollArea} contentContainerStyle={styles.desktopScrollInner}>
                {activeTab === 'Dashboard' && <DashboardContent />}
                {activeTab === 'Hives' && <HivesContent />}
                {activeTab === 'CreateHive' && <CreateHiveContent />}
                {activeTab === 'Batches' && <BatchesContent />}
                {activeTab === 'CreateBatch' && <CreateBatchContent />}
                {activeTab === 'Containers' && <ContainersContent />}
              </ScrollView>
            </View>
          </View>
        ) : (
          <View style={styles.mobileLayout}>
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.mobileScrollInner} bounces={false}>
              <MobileHero />
              <View style={styles.mobileContentWrapper}>
                {activeTab === 'Dashboard' && <DashboardContent />}
                {activeTab === 'Hives' && <HivesContent />}
                {activeTab === 'CreateHive' && <CreateHiveContent />}
                {activeTab === 'Batches' && <BatchesContent />}
                {activeTab === 'CreateBatch' && <CreateBatchContent />}
                {activeTab === 'Containers' && <ContainersContent />}
              </View>
            </ScrollView>
            <MobileBottomNav />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollArea: {
    flex: 1,
  },
  // Mobile Layout
  mobileLayout: {
    flex: 1,
  },
  mobileScrollInner: {
    paddingBottom: 90, 
  },
  mobileContentWrapper: {
    paddingHorizontal: 20,
    marginTop: -24, 
    zIndex: 20,
  },
  contentArea: {
    flex: 1,
  },
  // Desktop Layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopMain: {
    flex: 1,
  },
  desktopScrollInner: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    maxWidth: 1200,
  },
  desktopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 36,
  },
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E8E8E8',
    padding: 24,
    paddingTop: 36,
  },
  sidebarBrand: {
    marginBottom: 48,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sidebarItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: -12, 
  },
  sidebarText: {
    fontFamily: SANS_FONT,
    fontSize: 15,
    fontWeight: '500',
    color: '#6B6B6B',
    marginLeft: 12,
  },
  sidebarTextActive: {
    fontFamily: SANS_FONT,
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginLeft: 12,
  },
  // Hero Section
  heroSection: {
    backgroundColor: '#000000',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 70, 
    position: 'relative',
    overflow: 'hidden',
    height: 380,
  },
  honeycombWrapper: {
    position: 'absolute',
    right: -20,
    top: 40,
    width: 300,
    height: 300,
    zIndex: 0,
  },
  heroImage: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    width: 260,
    height: 280,
    zIndex: 1,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  heroWelcome: {
    zIndex: 10,
    marginTop: 10,
  },
  // Typography
  brandContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: BRAND_FONT,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  welcomeText: {
    fontFamily: SANS_FONT,
    fontSize: 16,
    fontWeight: '400',
    color: '#E0E0E0',
    marginBottom: 4,
  },
  welcomeName: {
    fontFamily: SANS_FONT,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeDesc: {
    fontFamily: SANS_FONT,
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '400',
  },
  welcomeTextDark: {
    fontFamily: SANS_FONT,
    fontSize: 16,
    fontWeight: '400',
    color: '#6B6B6B',
    marginBottom: 4,
  },
  welcomeNameDark: {
    fontFamily: SANS_FONT,
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontFamily: SANS_FONT,
    fontSize: 12,
    fontWeight: '700',
    color: '#999999',
    letterSpacing: 1.2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  statusSectionTitle: {
    fontFamily: SANS_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#999999',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  // Controls
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  // Stats Grid & Cards
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    width: '48%',
    height: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'space-between',
  },
  statCardDesktop: {
    width: '23%',
    marginBottom: 0,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBody: {
    marginTop: 12,
  },
  statValue: {
    fontFamily: SANS_FONT,
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontFamily: SANS_FONT,
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    marginLeft: 4,
  },
  statTitle: {
    fontFamily: SANS_FONT,
    fontSize: 10,
    fontWeight: '700',
    color: '#6B6B6B',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skeletonBlock: {
    width: 48,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    marginBottom: 4,
  },
  // Status
  statusContainer: {
    marginBottom: 32,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111111',
    marginRight: 12,
  },
  statusText: {
    fontFamily: SANS_FONT,
    fontSize: 14,
    fontWeight: '500',
    color: '#111111',
  },
  // Actions
  actionsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    height: 86,
  },
  actionIconWrapperDark: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#080808',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  actionTitle: {
    fontFamily: SANS_FONT,
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  actionDesc: {
    fontFamily: SANS_FONT,
    fontSize: 13,
    fontWeight: '400',
    color: '#6B6B6B',
  },
  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, 
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    width: 60,
  },
  navItemActive: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    height: 54,
    width: 68,
    marginTop: Platform.OS === 'ios' ? -10 : 0,
  },
  navText: {
    fontFamily: SANS_FONT,
    fontSize: 10,
    fontWeight: '500',
    color: '#999999',
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: SANS_FONT,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  // Form styles
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 12,
  },
  inputLabel: {
    fontFamily: SANS_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#999999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: SANS_FONT,
    color: '#111',
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: SANS_FONT,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#555555',
    fontFamily: SANS_FONT,
    fontSize: 15,
    fontWeight: '600',
  },
  hiveSelectItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  hiveSelectItemSelected: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  hiveSelectText: {
    fontFamily: SANS_FONT,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
