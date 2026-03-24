import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { QuoteCard } from '../../components/QuoteCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (!stats) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall">Welcome back!</Text>
        <Text variant="bodyMedium" style={styles.userName}>{user?.name}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard title="Total Clients" value={stats.totalClients} icon="👥" color="#3B82F6" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon="📁" color="#10B981" />
      </View>
      <View style={styles.statsRow}>
        <StatCard title="Quotes This Month" value={stats.quotesThisMonth} icon="📄" color="#F59E0B" />
        <StatCard title="Revenue" value={`KSh ${Number(stats.monthlyRevenue || 0).toLocaleString()}`} icon="💰" color="#8B5CF6" />
      </View>

      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Recent Quotes</Text>
        {stats.recentQuotes?.length > 0 ? (
          stats.recentQuotes.map((quote: any) => (
            <QuoteCard 
              key={quote.id} 
              quote={quote} 
              onPress={() => {}} 
            />
          ))
        ) : (
          <Text style={styles.empty}>No recent quotes</Text>
        )}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, paddingTop: 8 },
  userName: { color: '#64748B', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10 },
  section: { margin: 16, padding: 16, borderRadius: 12, elevation: 1 },
  sectionTitle: { marginBottom: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#94A3B8', padding: 20 },
});
