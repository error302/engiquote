import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Text } from 'react-native-paper';
import { clientsApi } from '../../services/api';
import { ClientCard } from '../../components/ClientCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function ClientsScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = async () => {
    try {
      const response = await clientsApi.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Loading clients..." />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search clients..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClientCard client={item} onPress={() => {}} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No clients found</Text>}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  search: { margin: 16, elevation: 2 },
  list: { paddingBottom: 80 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#1E40AF' },
});
