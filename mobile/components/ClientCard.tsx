import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';

interface Props {
  client: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  onPress: () => void;
}

export const ClientCard: React.FC<Props> = ({ client, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text variant="titleMedium">{client.name}</Text>
            <Text variant="bodySmall" style={styles.company}>
              {client.company || 'No company'}
            </Text>
            <Text variant="bodySmall" style={styles.contact}>
              {client.email || client.phone || 'No contact'}
            </Text>
          </View>
          <IconButton icon="chevron-right" />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1 },
  company: { color: '#64748B', marginTop: 2 },
  contact: { color: '#94A3B8', marginTop: 2 },
});
