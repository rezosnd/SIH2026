import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, ActivityIndicator, useWindowDimensions, Platform, Image, ImageBackground,
  Alert, TextInput
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { 
  Bell, User, Home, Package, QrCode, Printer, PackagePlus, ChevronRight, Activity, Hexagon, AlertCircle, ShieldAlert, AlertTriangle, Search
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

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

const API = 'https://backend-eight-jade-26.vercel.app';
const getAuthHeaders = (t: string) => ({ Authorization: `Bearer ${t}` });

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
        const tokenRes = await fetch(`${API}/auth/dev-login`);
        const tokenData = await tokenRes.json();
        setToken(tokenData.access_token);
        
        const res = await fetch(`${API}/beekeepers/dashboard`, {
          headers: getAuthHeaders(tokenData.access_token)
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

  const translations = {
    'English': {
      activeHives: 'ACTIVE HIVES', harvested: 'HARVESTED', activeBatches: 'ACTIVE BATCHES', alerts: 'QR ALERTS',
      hiveStatus: 'HIVE STATUS', allOps: 'All systems operational', quickActions: 'QUICK ACTIONS',
      createBatch: 'Create Honey Batch', createBatchDesc: 'Record a new harvest',
      manageHives: 'Manage Hives', manageHivesDesc: 'Register or update hive status',
      viewQr: 'View QR Codes', viewQrDesc: 'See containers and QR labels', welcome: 'Welcome back,'
    },
    'हिंदी (Hindi)': {
      activeHives: 'सक्रिय छत्ते', harvested: 'काटा गया', activeBatches: 'सक्रिय बैच', alerts: 'अलर्ट',
      hiveStatus: 'छत्ते की स्थिति', allOps: 'सभी सिस्टम ठीक हैं', quickActions: 'त्वरित कार्य',
      createBatch: 'नया बैच बनाएं', createBatchDesc: 'नई फसल दर्ज करें',
      manageHives: 'छत्ते प्रबंधित करें', manageHivesDesc: 'पंजीकृत या अपडेट करें',
      viewQr: 'क्यूआर कोड देखें', viewQrDesc: 'कंटेनर और लेबल देखें', welcome: 'वापसी पर स्वागत है,'
    },
    'मैथिली (Maithili)': {
      activeHives: 'सक्रिय महुरा', harvested: 'कटल गेल', activeBatches: 'सक्रिय बैच', alerts: 'अलर्ट',
      hiveStatus: 'महुरा के स्थिति', allOps: 'सब काज क रहल अछि', quickActions: 'त्वरित काज',
      createBatch: 'मधु बैच बनाउ', createBatchDesc: 'नया फसल दर्ज करू',
      manageHives: 'महुरा प्रबंधित करू', manageHivesDesc: 'पंजीकृत करू',
      viewQr: 'क्यूआर कोड देखू', viewQrDesc: 'कंटेनर आ लेबल देखू', welcome: 'स्वागत अछि,'
    },
    'ଓଡ଼ିଆ (Odia)': {
      activeHives: 'ସକ୍ରିୟ ବାକ୍ସ', harvested: 'ଅମଳ', activeBatches: 'ସକ୍ରିୟ ବ୍ୟାଚ୍', alerts: 'ଆଲର୍ଟ',
      hiveStatus: 'ବାକ୍ସ ସ୍ଥିତି', allOps: 'ସମସ୍ତ ସିଷ୍ଟମ୍ ଠିକ୍', quickActions: 'ତ୍ୱରିତ କାର୍ଯ୍ୟ',
      createBatch: 'ବ୍ୟାଚ୍ ତିଆରି', createBatchDesc: 'ନୂଆ ଅମଳ ରେକର୍ଡ',
      manageHives: 'ବାକ୍ସ ପରିଚାଳନା', manageHivesDesc: 'ପଞ୍ଜିକରଣ କରନ୍ତୁ',
      viewQr: 'QR କୋଡ୍ ଦେଖନ୍ତୁ', viewQrDesc: 'କଣ୍ଟେନର ଏବଂ ଲେବଲ୍', welcome: 'ସ୍ଵାଗତମ୍,'
    }
  };
  
  const t = (key: keyof typeof translations['English']) => {
    return (translations as any)[language]?.[key] || translations['English'][key];
  };

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

  const MobileHero = () => {
    const isDashboard = activeTab === 'Dashboard';
    return (
    <View style={[
      styles.heroSection, 
      !isDashboard && { backgroundColor: 'rgba(255,255,255,0.4)', paddingBottom: 15, paddingTop: Platform.OS === 'android' ? 50 : 25, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', height: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
      isDashboard && { backgroundColor: 'rgba(17,17,17,0.95)' }
    ]}>
      {isDashboard && <HoneycombBackground />}
      {isDashboard && <Image source={require('./assets/beehouse.png')} style={styles.heroImage} resizeMode="contain" />}
      <View style={[styles.heroTop, !isDashboard && { marginBottom: 0 }]}>
        <TouchableOpacity style={styles.iconButton}>
          <Activity size={24} color={isDashboard ? "#fff" : "#111"} strokeWidth={2} />
        </TouchableOpacity>
        <BrandHeader color={isDashboard ? "#fff" : "#111"} />
        <TopControls isDark={!isDashboard} />
      </View>
      {isDashboard && (
        <View style={styles.heroWelcome}>
          <Text style={styles.welcomeText}>{t('welcome')}</Text>
          <Text style={styles.welcomeName}>{loading ? '...' : (data?.name || 'Beekeeper')}</Text>
        </View>
      )}
    </View>
    );
  };

  const StatCard = ({ title, value, unit, IconComponent, alert, onPress }: { title: string, value: any, unit?: string, IconComponent: any, alert?: boolean, onPress?: () => void }) => (
    <TouchableOpacity style={[styles.statCard, isLargeScreen && styles.statCardDesktop]} activeOpacity={0.7} onPress={onPress}>
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
            <Text style={[styles.statValue, alert && value > 0 && { color: '#E60000' }]}>{value ?? 0}</Text>
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
      <Text style={styles.statusSectionTitle}>{t('hiveStatus')}</Text>
      <View style={styles.statusCard}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{t('allOps')}</Text>
      </View>
    </View>
  );

  const DashboardContent = () => (
    <View style={styles.contentArea}>
      <View style={styles.statsGrid}>
        <StatCard title={t('activeHives')} value={data?.activeHives} IconComponent={BeehiveIcon} onPress={() => setActiveTab('Hives')} />
        <StatCard title={t('harvested')} value={data?.totalHarvested} unit="kg" IconComponent={HoneyJarIcon} />
        <StatCard title={t('activeBatches')} value={data?.activeBatches} IconComponent={Package} onPress={() => setActiveTab('Batches')} />
        <StatCard title={t('alerts')} value={data?.alerts} alert={data?.alerts > 0} IconComponent={QrCode} onPress={() => setActiveTab('Alerts')} />
      </View>
      <HiveStatus />
      <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
      <View style={styles.actionsGrid}>
        <ActionCard title={t('createBatch')} desc={t('createBatchDesc')} IconComponent={PackagePlus} onPress={() => setActiveTab('CreateBatch')} />
        <ActionCard title={t('manageHives')} desc={t('manageHivesDesc')} IconComponent={BeehiveIcon} onPress={() => setActiveTab('Hives')} />
        <ActionCard title={t('viewQr')} desc={t('viewQrDesc')} IconComponent={QrCode} onPress={() => setActiveTab('Containers')} />
      </View>
    </View>
  );

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [hives, setHives] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [language, setLanguage] = useState('English');

  const availableLanguages = ['English', 'हिंदी (Hindi)', 'मैथिली (Maithili)', 'ଓଡ଼ିଆ (Odia)', 'বাংলা (Bengali)'];

  // Form states
  const [hiveLocation, setHiveLocation] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('');
  const [selectedHiveId, setSelectedHiveId] = useState('');

  const fetchHives = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/hives`, {
        headers: getAuthHeaders(token!)
      });
      if (res.ok) setHives(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/batches`, {
        headers: getAuthHeaders(token!)
      });
      if (res.ok) setBatches(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContainers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/batches`, {
        headers: getAuthHeaders(token!)
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
      const res = await fetch(`${API}/hives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token!) },
        body: JSON.stringify({ location: hiveLocation }),
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
      const res = await fetch(`${API}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token!) },
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
          <View key={hive.id} style={[styles.actionCard, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.actionIconWrapperDark}>
                <BeehiveIcon size={24} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={styles.actionTextWrapper}>
                <Text style={styles.actionTitle}>{hive.location}</Text>
                <Text style={styles.actionDesc}>Status: {hive.status}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.secondaryButton, { marginTop: 0 }]} 
              onPress={() => {
                setSelectedHiveId(hive.id);
                setActiveTab('HiveDetails');
              }}
            >
              <Text style={styles.secondaryButtonText}>VIEW DETAILS</Text>
            </TouchableOpacity>
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
          placeholder="Enter APIARY location..."
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

  const [hiveDetails, setHiveDetails] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'HiveDetails' && selectedHiveId) {
      setHiveDetails(null);
      fetch(`${API}/iot/hives/${selectedHiveId}`, { headers: getAuthHeaders(token!) })
        .then(r => r.json())
        .then(d => setHiveDetails(d))
        .catch(e => console.error(e));
    }
  }, [activeTab, selectedHiveId, token]);

  const HiveDetailsContent = () => {
    if (!hiveDetails) return <View style={styles.contentArea}><ActivityIndicator size="large" color="#111" style={{marginTop: 50}} /></View>;
    return (
      <View style={styles.contentArea}>
        <TouchableOpacity onPress={() => setActiveTab('Hives')} style={{marginBottom: 16}}>
          <Text style={{color: '#666', fontWeight: 'bold'}}>← Back to Hives</Text>
        </TouchableOpacity>
        
        <View style={[styles.actionCard, { flexDirection: 'column', alignItems: 'flex-start', padding: 20 }]}>
          <Text style={{fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 4}}>{hiveDetails.location.toUpperCase()}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
            <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: hiveDetails.device?.status === 'ONLINE' ? '#10B981' : '#EF4444', marginRight: 6}} />
            <Text style={{fontWeight: 'bold', color: hiveDetails.device?.status === 'ONLINE' ? '#10B981' : '#EF4444'}}>{hiveDetails.device?.status || 'OFFLINE'}</Text>
            <Text style={{marginLeft: 8, fontSize: 12, color: '#9ca3af', fontWeight: 'bold'}}>{hiveDetails.device?.deviceId || 'NO DEVICE'}</Text>
          </View>
          <Text style={{fontSize: 12, color: '#666', marginBottom: 2}}>Last updated: {hiveDetails.current?.timestamp ? new Date(hiveDetails.current.timestamp).toLocaleString() : 'Never'}</Text>
        </View>

        {!hiveDetails.current ? (
          <View style={{backgroundColor: '#FFF5F5', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 24, alignItems: 'center'}}>
            <AlertTriangle color="#EF4444" size={32} style={{marginBottom: 8}} />
            <Text style={{fontSize: 16, fontWeight: 'black', color: '#EF4444', marginBottom: 4}}>NO SENSOR READINGS AVAILABLE</Text>
            <Text style={{color: '#991B1B', textAlign: 'center'}}>Connect the hive device to begin monitoring.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>CURRENT CONDITIONS</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
          <View style={[styles.statCardDesktop, {width: '48%', marginBottom: 12}]}>
            <Text style={styles.statTitle}>Temperature</Text>
            <Text style={styles.statValue}>{hiveDetails.current?.temperature ? `${hiveDetails.current.temperature} °C` : 'N/A'}</Text>
          </View>
          <View style={[styles.statCardDesktop, {width: '48%', marginBottom: 12}]}>
            <Text style={styles.statTitle}>Humidity</Text>
            <Text style={styles.statValue}>{hiveDetails.current?.humidity ? `${hiveDetails.current.humidity} %` : 'N/A'}</Text>
          </View>
          <View style={[styles.statCardDesktop, {width: '48%', marginBottom: 12}]}>
            <Text style={styles.statTitle}>Pressure</Text>
            <Text style={styles.statValue}>{hiveDetails.current?.pressure ? `${hiveDetails.current.pressure} hPa` : 'N/A'}</Text>
          </View>
          <View style={[styles.statCardDesktop, {width: '48%', marginBottom: 12}]}>
            <Text style={styles.statTitle}>Hive Weight</Text>
            <Text style={[styles.statValue, !hiveDetails.current?.weight && {fontSize: 14, color: '#EF4444'}]}>
              {hiveDetails.current?.weight ? `${hiveDetails.current.weight} kg` : 'NOT CONNECTED'}
            </Text>
          </View>
          <View style={[styles.statCardDesktop, {width: '48%', marginBottom: 12}]}>
            <Text style={styles.statTitle}>Rain</Text>
            <Text style={styles.statValue}>{hiveDetails.current?.rain ? 'RAIN DETECTED' : 'NO RAIN'}</Text>
          </View>
          <View style={[styles.statCardDesktop, {width: '48%', marginBottom: 12}]}>
            <Text style={styles.statTitle}>UV</Text>
            <Text style={styles.statValue}>{hiveDetails.current?.uv ? hiveDetails.current.uv : 'N/A'}</Text>
          </View>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>ENVIRONMENT</Text>
        <View style={[styles.actionCard, { flexDirection: 'column', alignItems: 'flex-start', padding: 20 }]}>
          <Text style={{fontWeight: 'bold', color: '#666', marginBottom: 4}}>Environmental Status</Text>
          <Text style={{fontSize: 20, fontWeight: '900', color: '#111', marginBottom: 12}}>{hiveDetails.environment?.status || 'UNKNOWN'}</Text>
          <Text style={{fontWeight: 'bold', color: '#666', marginBottom: 4}}>Rule-Based Environment Score</Text>
          <Text style={{fontSize: 20, fontWeight: '900', color: '#111'}}>{hiveDetails.environment?.score || 0} / 100</Text>
        </View>
        
        <Text style={styles.sectionTitle}>SENSOR HEALTH</Text>
        <View style={{backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#eee'}}>
          {[
            { name: 'DHT11', status: hiveDetails.current?.temperature ? 'ONLINE' : 'OFFLINE' },
            { name: 'BMP180', status: hiveDetails.current?.pressure ? 'ONLINE' : 'OFFLINE' },
            { name: 'Rain Sensor', status: hiveDetails.current?.rain !== undefined ? 'ONLINE' : 'OFFLINE' },
            { name: 'GUVA-S12SD', status: hiveDetails.current?.uv ? 'ONLINE' : 'OFFLINE' },
            { name: 'Load Cell', status: hiveDetails.current?.weight ? 'ONLINE' : 'NOT CONNECTED' },
          ].map(s => (
            <View key={s.name} style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
              <Text style={{fontWeight: 'bold', color: '#4b5563'}}>{s.name}</Text>
              <Text style={{fontWeight: '900', color: s.status === 'ONLINE' ? '#10B981' : (s.status === 'NOT CONNECTED' ? '#EF4444' : '#9ca3af')}}>{s.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ALERTS</Text>
        {(!hiveDetails.alerts || hiveDetails.alerts.length === 0) ? (
          <Text style={{color: '#666', marginBottom: 20}}>No active alerts.</Text>
        ) : (
          hiveDetails.alerts.map((a: any) => (
            <View key={a.id} style={{backgroundColor: '#FFF5F5', borderLeftWidth: 4, borderLeftColor: '#EF4444', padding: 16, borderRadius: 8, marginBottom: 12}}>
              <Text style={{fontWeight: '900', color: '#EF4444'}}>{a.type}</Text>
              <Text style={{color: '#EF4444', marginTop: 4}}>{a.message}</Text>
            </View>
          ))
        )}
      </View>
    );
  };

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
        containers.map(c => {
          const qrUrl = `https://honey-sih-kiit.vercel.app/verify/batch/${c.qrData}`;
          return (
            <View key={c.id} style={[styles.actionCard, {height: 'auto', paddingVertical: 16, marginBottom: 16, flexDirection: 'column', alignItems: 'center'}]}>
              <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                <QRCode value={qrUrl} size={150} />
              </View>
              <Text style={styles.actionTitle}>Size: {c.containerSize}kg</Text>
              <Text style={styles.actionDesc}>Batch: {c.batchId.substring(0,6).toUpperCase()}</Text>
              <Text style={[styles.actionDesc, {fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 8, fontSize: 10, textAlign: 'center'}]}>{c.qrData}</Text>
            </View>
          );
        })
      )}
    </View>
  );

  const AlertsContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>{t('alerts')}</Text>
      {!data?.recentAlerts || data.recentAlerts.length === 0 ? (
        <View style={[styles.actionCard, {height: 'auto', paddingVertical: 24, flexDirection: 'column', alignItems: 'center'}]}>
          <ShieldAlert size={40} color="#E60000" style={{marginBottom: 16}} />
          <Text style={{color: '#666', fontWeight: 'bold'}}>{t('allOps')}</Text>
        </View>
      ) : (
        data.recentAlerts.map((alert: any) => (
          <View key={alert.id} style={[styles.actionCard, {height: 'auto', paddingVertical: 16, flexDirection: 'column', alignItems: 'flex-start', borderLeftWidth: 4, borderLeftColor: '#E60000', marginBottom: 16}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
              <AlertTriangle size={16} color="#E60000" style={{marginRight: 6}} />
              <Text style={{fontWeight: 'bold', color: '#E60000', fontSize: 14}}>Suspicious Scan Activity</Text>
            </View>
            <Text style={[styles.actionTitle, {marginBottom: 4}]}>Batch: {alert.batchId}</Text>
            <Text style={styles.actionDesc}>Multiple scans detected. Last seen: {alert.city || 'Unknown Location'}</Text>
            <Text style={[styles.actionDesc, {fontSize: 10, marginTop: 8}]}>{new Date(alert.timestamp).toLocaleString()}</Text>
          </View>
        ))
      )}
    </View>
  );

  const ProfileContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>MY PROFILE</Text>
      <View style={[styles.actionCard, {height: 'auto', paddingVertical: 24, flexDirection: 'column', alignItems: 'center', marginBottom: 16}]}>
        <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
          <User size={40} color="#fff" />
        </View>
        <Text style={[styles.actionTitle, {fontSize: 20}]}>{data?.name || 'Beekeeper'}</Text>
        <Text style={[styles.actionDesc, {marginTop: 4}]}>{data?.cluster || 'Unknown Cluster'}</Text>
      </View>

      <Text style={styles.sectionTitle}>PREFERENCES</Text>
      <View style={[styles.actionCard, {height: 'auto', paddingVertical: 16, flexDirection: 'column', marginBottom: 16}]}>
        <Text style={[styles.actionTitle, {marginBottom: 12}]}>App Language</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{width: '100%'}}>
          {availableLanguages.map(lang => (
            <TouchableOpacity 
              key={lang} 
              style={[
                {paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#eee', marginRight: 8},
                language === lang && {backgroundColor: '#111', borderColor: '#111'}
              ]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={[{color: '#666'}, language === lang && {color: '#fff', fontWeight: 'bold'}]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={[styles.primaryButton, {marginTop: 8, width: '100%', backgroundColor: '#FF3B30'}]} onPress={() => setToken(null)}>
        <Text style={styles.primaryButtonText}>Sign Out</Text>
      </TouchableOpacity>
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
      <ImageBackground source={require('./assets/bg.png')} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ flex: 1, backgroundColor: 'rgba(243, 244, 246, 0.85)' }}>
          <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
            <StatusBar style={isLargeScreen ? "dark" : "light"} />
            
            {isLargeScreen ? (
              <View style={[styles.desktopLayout, { backgroundColor: 'transparent' }]}>
                <DesktopSidebar />
                <View style={styles.desktopMain}>
                  {activeTab === 'Dashboard' && (
                    <View style={styles.desktopHeader}>
                      <View>
                        <Text style={styles.welcomeTextDark}>Welcome back,</Text>
                        <Text style={styles.welcomeNameDark}>{loading ? '...' : (data?.name || 'Beekeeper')}</Text>
                      </View>
                      <TopControls isDark={true} />
                    </View>
                  )}
                  <ScrollView style={styles.scrollArea} contentContainerStyle={styles.desktopScrollInner}>
                    {activeTab === 'Dashboard' && <DashboardContent />}
                    {activeTab === 'Hives' && <HivesContent />}
                    {activeTab === 'HiveDetails' && <HiveDetailsContent />}
                    {activeTab === 'CreateHive' && <CreateHiveContent />}
                    {activeTab === 'Batches' && <BatchesContent />}
                    {activeTab === 'CreateBatch' && <CreateBatchContent />}
                    {activeTab === 'Containers' && <ContainersContent />}
                    {activeTab === 'Alerts' && <AlertsContent />}
                    {activeTab === 'Profile' && <ProfileContent />}
                  </ScrollView>
                </View>
              </View>
            ) : (
              <View style={[styles.mobileLayout, { backgroundColor: 'transparent' }]}>
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.mobileScrollInner} bounces={false}>
              <MobileHero />
              <View style={styles.mobileContentWrapper}>
                {activeTab === 'Dashboard' && <DashboardContent />}
                {activeTab === 'Hives' && <HivesContent />}
                {activeTab === 'HiveDetails' && <HiveDetailsContent />}
                {activeTab === 'CreateHive' && <CreateHiveContent />}
                {activeTab === 'Batches' && <BatchesContent />}
                {activeTab === 'CreateBatch' && <CreateBatchContent />}
                {activeTab === 'Containers' && <ContainersContent />}
                {activeTab === 'Alerts' && <AlertsContent />}
                  {activeTab === 'Profile' && <ProfileContent />}
                </View>
              </ScrollView>
              <MobileBottomNav />
              </View>
            )}
          </SafeAreaView>
        </View>
      </ImageBackground>
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
