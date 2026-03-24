import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export const StatCard: React.FC<Props> = ({ title, value, icon, color }) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={[styles.icon, { backgroundColor: color }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text variant="bodySmall" style={styles.title}>{title}</Text>
          <Text variant="headlineSmall">{value}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, margin: 6 },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: '#fff', fontSize: 18 },
  info: { marginLeft: 12 },
  title: { color: '#64748B' },
});
