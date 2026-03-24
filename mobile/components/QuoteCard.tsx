import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';

interface Props {
  quote: {
    id: string;
    quoteNumber: string;
    total: number;
    status: string;
    project?: { client?: { name: string } };
  };
  onPress: () => void;
}

const statusColors: Record<string, string> = {
  DRAFT: '#94A3B8',
  SENT: '#3B82F6',
  ACCEPTED: '#10B981',
  REJECTED: '#EF4444',
};

export const QuoteCard: React.FC<Props> = ({ quote, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text variant="titleMedium">{quote.quoteNumber}</Text>
            <Text variant="bodySmall" style={styles.client}>
              {quote.project?.client?.name || 'Unknown Client'}
            </Text>
          </View>
          <View style={styles.right}>
            <Text variant="titleMedium">KSh {Number(quote.total).toLocaleString()}</Text>
            <Chip 
              style={[styles.status, { backgroundColor: statusColors[quote.status] || '#94A3B8' }]}
              textStyle={{ color: '#fff', fontSize: 10 }}
            >
              {quote.status}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  client: { color: '#64748B', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  status: { marginTop: 4 },
});
