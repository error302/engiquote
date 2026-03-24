import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { List, Switch, Text, Button, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profile}>
        <Text variant="titleLarge">{user?.name}</Text>
        <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
        <Text variant="bodySmall" style={styles.role}>{user?.role}</Text>
      </View>

      <Divider />

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={(props) => <List.Icon {...props} icon="brightness-6" />}
          right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
        />
        <List.Item
          title="Notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => <Switch value={notifications} onValueChange={setNotifications} />}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Support"
          description="Get help with the app"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          onPress={() => {}}
        />
      </List.Section>

      <View style={styles.logout}>
        <Button mode="outlined" textColor="#EF4444" onPress={logout}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  profile: { padding: 24, alignItems: 'center' },
  email: { color: '#64748B', marginTop: 4 },
  role: { color: '#94A3B8', marginTop: 2 },
  logout: { padding: 16, marginBottom: 32 },
});
