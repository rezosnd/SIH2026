import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, 
  ScrollView, ActivityIndicator, useWindowDimensions, Platform 
} from 'react-native';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const numColumns = isDesktop ? 4 : (isTablet ? 4 : 2);
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

  const BrandHeader = () => (
    <View style={styles.brandContainer}>
      <Text style={styles.headerTitle}>HONEYCHAIN</Text>
      <Text style={styles.headerSubtitle}>BEEKEEPER DASHBOARD</Text>
    </View>
  );

  const TopControls = () => (
    <View style={styles.topControls}>
      <TouchableOpacity style={styles.iconButton}>
        <Feather name="bell" size={20} color={isLargeScreen ? "#000" : "#fff"} />
        <View style={styles.notificationBadge} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.iconButton, { marginLeft: 16 }]}>
        <Feather name="user" size={22} color={isLargeScreen ? "#000" : "#fff"} />
      </TouchableOpacity>
    </View>
  );

  const MobileHero = () => (
    <View style={styles.mobileHeroSection}>
      <View style={styles.mobileHeroTop}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <BrandHeader />
        <TopControls />
      </View>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome back,</Text>
        <Text style={styles.welcomeName}>{loading ? '...' : (data?.name || 'Beekeeper')}!</Text>
        <Text style={styles.welcomeDesc}>Here's what's happening with your hives.</Text>
      </View>
      <Feather name="hexagon" size={160} color="rgba(255,255,255,0.03)" style={styles.heroHexagon} />
    </View>
  );

  const StatCard = ({ title, value, unit, icon, alert }: { title: string, value: any, unit?: string, icon: any, alert?: boolean }) => (
    <TouchableOpacity style={[styles.statCard, isLargeScreen && styles.statCardDesktop]} activeOpacity={0.8}>
      <View style={styles.statHeader}>
        <View style={styles.statIconContainer}>
          <Feather name={icon} size={20} color="#000" />
        </View>
        <Feather name="chevron-right" size={16} color="#ccc" />
      </View>
      <View style={styles.statBody}>
        {loading ? (
          <View style={styles.skeletonNumber} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={[styles.statNumber, alert && value > 0 && { color: '#ff3b3b' }]}>
              {value ?? 0}
            </Text>
            {unit && <Text style={styles.statUnit}>{unit}</Text>}
          </View>
        )}
        <Text style={styles.statLabel}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const ActionCard = ({ title, desc, icon }: { title: string, desc: string, icon: any }) => (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
      <View style={styles.actionIconWrapper}>
        <Feather name={icon} size={22} color="#fff" />
      </View>
      <View style={styles.actionTextWrapper}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const DashboardContent = () => (
    <View style={styles.mainContentArea}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>OVERVIEW</Text>
        <View style={styles.sectionUnderline} />
      </View>
      
      <View style={[styles.statsGrid, isLargeScreen && styles.statsGridDesktop]}>
        <StatCard title="ACTIVE HIVES" value={data?.activeHives} icon="layers" />
        <StatCard title="HARVESTED" value={data?.totalHarvested} unit="kg" icon="box" />
        <StatCard title="ACTIVE BATCHES" value={data?.activeBatches} icon="package" />
        <StatCard title="QR ALERTS" value={data?.alerts} alert={true} icon="alert-circle" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.sectionUnderline} />
      </View>

      <View style={[styles.actionsGrid, isLargeScreen && styles.actionsGridDesktop]}>
        <ActionCard title="Create Honey Batch" desc="Record a new harvest" icon="plus" />
        <ActionCard title="Manage Hives" desc="Register or update hive status" icon="grid" />
        <ActionCard title="Print QR Labels" desc="Generate labels for packaging" icon="printer" />
      </View>
    </View>
  );

  const MobileBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItemActive}>
        <Feather name="home" size={20} color="#fff" />
        <Text style={styles.navTextActive}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="layers" size={20} color="#666" />
        <Text style={styles.navText}>Hives</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="package" size={20} color="#666" />
        <Text style={styles.navText}>Batches</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="alert-circle" size={20} color="#666" />
        <Text style={styles.navText}>Alerts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="user" size={20} color="#666" />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const DesktopSidebar = () => (
    <View style={styles.desktopSidebar}>
      <View style={styles.desktopBrand}>
        <Text style={[styles.headerTitle, { color: '#000' }]}>HONEYCHAIN</Text>
        <Text style={[styles.headerSubtitle, { color: '#666' }]}>BEEKEEPER DASHBOARD</Text>
      </View>
      
      <View style={styles.desktopNav}>
        <TouchableOpacity style={styles.desktopNavItemActive}>
          <Feather name="home" size={20} color="#fff" />
          <Text style={styles.desktopNavTextActive}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.desktopNavItem}>
          <Feather name="layers" size={20} color="#666" />
          <Text style={styles.desktopNavText}>Hives</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.desktopNavItem}>
          <Feather name="package" size={20} color="#666" />
          <Text style={styles.desktopNavText}>Batches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.desktopNavItem}>
          <Feather name="alert-circle" size={20} color="#666" />
          <Text style={styles.desktopNavText}>QR Alerts</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.desktopNavItem, { marginTop: 'auto' }]}>
        <Feather name="user" size={20} color="#666" />
        <Text style={styles.desktopNavText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isLargeScreen ? "dark" : "light"} />
      
      {isLargeScreen ? (
        <View style={styles.desktopLayout}>
          <DesktopSidebar />
          <View style={styles.desktopMainContent}>
            <View style={styles.desktopHeader}>
              <View>
                <Text style={styles.desktopWelcomeTitle}>Welcome back,</Text>
                <Text style={styles.desktopWelcomeName}>{loading ? '...' : (data?.name || 'Beekeeper')}!</Text>
              </View>
              <TopControls />
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
  // Mobile Layout
  mobileLayout: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  mobileScrollInner: {
    paddingBottom: 100, // Space for bottom nav
  },
  mobileHeroSection: {
    backgroundColor: '#000000',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  mobileHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  heroHexagon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
  },
  // Typography
  brandContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999999',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  welcomeSection: {
    zIndex: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#ffffff',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  welcomeName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  welcomeDesc: {
    fontSize: 14,
    color: '#aaaaaa',
    fontWeight: '500',
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
    backgroundColor: '#ff3b3b',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000',
  },
  // Dashboard Content
  mobileContentWrapper: {
    padding: 20,
  },
  mainContentArea: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 1.5,
  },
  sectionUnderline: {
    width: 24,
    height: 3,
    backgroundColor: '#000000',
    marginTop: 6,
    borderRadius: 2,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsGridDesktop: {
    flexWrap: 'nowrap',
    gap: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  statCardDesktop: {
    width: '23%',
    marginBottom: 0,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBody: {
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999999',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999999',
    marginTop: 4,
    letterSpacing: 1,
  },
  skeletonNumber: {
    width: 60,
    height: 32,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 4,
  },
  // Actions
  actionsGrid: {
    flexDirection: 'column',
  },
  actionsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
    flex: isPlatformWeb() ? 1 : undefined,
    minWidth: isPlatformWeb() ? 300 : '100%',
  },
  actionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextWrapper: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  actionDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999999',
    marginTop: 4,
  },
  // Mobile Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16, // Safe area approximation
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  // Desktop Layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
  },
  desktopSidebar: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  desktopBrand: {
    marginBottom: 48,
    alignItems: 'flex-start',
  },
  desktopNav: {
    flex: 1,
  },
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  desktopNavItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  desktopNavText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
    marginLeft: 12,
  },
  desktopNavTextActive: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12,
  },
  desktopMainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  desktopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 32,
    backgroundColor: '#F7F7F7',
  },
  desktopWelcomeTitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  desktopWelcomeName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginTop: 4,
  },
  desktopScrollInner: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    maxWidth: 1400,
  }
});

function isPlatformWeb() {
  return Platform.OS === 'web';
}
