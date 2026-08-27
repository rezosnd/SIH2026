import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, 
  ScrollView, ActivityIndicator, useWindowDimensions, Platform, Image 
} from 'react-native';
import { useState, useEffect } from 'react';
import { 
  Bell, User, Home, Package, QrCode, Printer, PlusCircle, Hexagon, Database, ChevronRight, AlertCircle, Activity
} from 'lucide-react-native';

const BRAND_FONT = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const SANS_FONT = Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' });

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

  const MobileHero = () => (
    <View style={styles.heroSection}>
      {/* Real photographic grayscale beehive hero background */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?q=80&w=800&auto=format&fit=crop&sat=-100' }} 
        style={styles.heroImage}
        resizeMode="cover"
      />
      <View style={styles.heroGradientOverlay} />
      
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
        <StatCard title="ACTIVE HIVES" value={data?.activeHives} IconComponent={Hexagon} />
        <StatCard title="HARVESTED" value={data?.totalHarvested} unit="kg" IconComponent={Database} />
        <StatCard title="ACTIVE BATCHES" value={data?.activeBatches} IconComponent={Package} />
        <StatCard title="QR ALERTS" value={data?.alerts} alert={true} IconComponent={QrCode} />
      </View>

      <HiveStatus />

      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

      <View style={styles.actionsGrid}>
        <ActionCard title="Create Honey Batch" desc="Record a new harvest" IconComponent={PlusCircle} />
        <ActionCard title="Manage Hives" desc="Register or update hive status" IconComponent={Hexagon} />
        <ActionCard title="Print QR Labels" desc="Generate labels for packaging" IconComponent={Printer} />
      </View>
    </View>
  );

  const MobileBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem}>
        <View style={styles.navActiveIndicator} />
        <Home size={24} color="#111111" strokeWidth={2} />
        <Text style={styles.navTextActive}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Hexagon size={24} color="#999999" strokeWidth={2} />
        <Text style={styles.navText}>Hives</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Package size={24} color="#999999" strokeWidth={2} />
        <Text style={styles.navText}>Batches</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <AlertCircle size={24} color="#999999" strokeWidth={2} />
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
          <Hexagon size={20} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.sidebarText}>Hives</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <Package size={20} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.sidebarText}>Batches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <AlertCircle size={20} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.sidebarText}>QR Alerts</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.sidebarItem}>
        <User size={20} color="#6B6B6B" strokeWidth={2} />
        <Text style={styles.sidebarText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
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
  heroImage: {
    position: 'absolute',
    top: 0,
    right: -50,
    width: 350,
    height: '100%',
    opacity: 0.25,
    zIndex: 1,
  },
  heroGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 2,
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
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    height: 90,
  },
  actionIconWrapperDark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
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
    height: 82,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, 
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    width: 60,
    position: 'relative',
  },
  navActiveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111111',
    position: 'absolute',
    top: -2,
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
    color: '#111111',
    marginTop: 4,
  }
});
