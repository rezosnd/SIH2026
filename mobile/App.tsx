import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, ActivityIndicator, useWindowDimensions, Platform, Image 
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
  const { width } = useWindowDimensions();
  
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://sih-2026-kiit.vercel.app';
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

  const ActionCard = ({ title, desc, IconComponent }: { title: string, desc: string, IconComponent: any }) => (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
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
        <ActionCard title="Create Honey Batch" desc="Record a new harvest" IconComponent={PackagePlus} />
        <ActionCard title="Manage Hives" desc="Register or update hive status" IconComponent={BeehiveIcon} />
        <ActionCard title="Print QR Labels" desc="Generate labels for packaging" IconComponent={Printer} />
      </View>
    </View>
  );

  const MobileBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItemActive}>
        <Home size={22} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.navTextActive}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <BeehiveIcon size={24} color="#999999" strokeWidth={2} />
        <Text style={styles.navText}>Hives</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Package size={24} color="#999999" strokeWidth={2} />
        <Text style={styles.navText}>Batches</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Bell size={24} color="#999999" strokeWidth={2} />
        <Text style={styles.navText}>Alerts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <User size={24} color="#999999" strokeWidth={2} />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const DesktopSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarBrand}>
        <BrandHeader color="#111" />
      </View>
      <View style={styles.sidebarNav}>
        <TouchableOpacity style={styles.sidebarItemActive}>
          <Home size={20} color="#111111" strokeWidth={2} />
          <Text style={styles.sidebarTextActive}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <BeehiveIcon size={20} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.sidebarText}>Hives</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <Package size={20} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.sidebarText}>Batches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <Bell size={20} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.sidebarText}>Alerts</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.sidebarItem}>
        <User size={20} color="#6B6B6B" strokeWidth={2} />
        <Text style={styles.sidebarText}>Profile</Text>
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
                <DashboardContent />
              </ScrollView>
            </View>
          </View>
        ) : (
          <View style={styles.mobileLayout}>
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.mobileScrollInner} bounces={false}>
              <MobileHero />
              <View style={styles.mobileContentWrapper}>
                <DashboardContent />
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
  }
});
