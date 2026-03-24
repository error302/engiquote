import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { quotesApi } from '../../services/api';
import { QuoteCard } from '../../components/QuoteCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuotes = async () => {
    try {
      const response = await quotesApi.getAll();
      setQuotes(response.data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuotes();
    setRefreshing(false);
  };

  const filtered = filter === 'all' 
    ? quotes 
    : quotes.filter(q => q.status === filter);

  if (loading) {
    return <LoadingSpinner message="Loading quotes..." />;
  }

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'DRAFT', label: 'Draft' },
          { value: 'SENT', label: 'Sent' },
          { value: 'ACCEPTED', label: 'Accepted' },
        ]}
        style={styles.filter}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuoteCard quote={item} onPress={() => {}} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No quotes found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  filter: { margin: 16 },
  list: { paddingBottom: 20 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },
});
