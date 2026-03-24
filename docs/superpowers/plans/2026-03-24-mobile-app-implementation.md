# Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build React Native mobile app (Expo) for EngiQuote KE - manage clients, quotes, and view dashboard on mobile

**Architecture:** Expo SDK 52 with Expo Router, React Native Paper for UI, Axios for API calls, SecureStore for auth tokens

**Tech Stack:** React Native, Expo, Expo Router, React Native Paper, Axios, @react-native-async-storage/async-storage, expo-secure-store

---

## File Structure

### New Directory: `mobile/`
```
mobile/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Dashboard
│   │   ├── clients.tsx           # Clients list
│   │   ├── quotes.tsx           # Quotes list
│   │   └── settings.tsx         # Settings
│   ├── _layout.tsx               # Root layout
│   ├── login.tsx                 # Login screen
│   └── +html.tsx                # WebView for PDF
├── components/
│   ├── ClientCard.tsx
│   ├── QuoteCard.tsx
│   ├── StatCard.tsx
│   └── LoadingSpinner.tsx
├── services/
│   ├── api.ts                   # Axios instance
│   └── auth.ts                  # Auth helpers
├── context/
│   └── AuthContext.tsx          # Auth state
├── utils/
│   └── storage.ts               # AsyncStorage helpers
├── package.json
├── app.json
└── tsconfig.json
```

---

## Task 1: Initialize Expo Project

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/app.json`
- Create: `mobile/tsconfig.json`
- Create: `mobile/babel.config.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "engiquote-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "react-native-paper": "^5.12.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "axios": "^1.7.0",
    "@react-native-async-storage/async-storage": "1.23.0",
    "expo-secure-store": "~14.0.0",
    "expo-status-bar": "~2.0.0",
    "react-native-vector-icons": "^10.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0"
  }
}
```

- [ ] **Step 2: Create app.json**

```json
{
  "expo": {
    "name": "EngiQuote KE",
    "slug": "engiquote-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "engiquote",
    "userInterfaceStyle": "automatic",
    "splash": {
      "backgroundColor": "#1E40AF"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.engiquote.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E40AF"
      },
      "package": "com.engiquote.app"
    },
    "plugins": ["expo-router", "expo-secure-store"]
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts"]
}
```

- [ ] **Step 4: Create babel.config.js**

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

- [ ] **Step 5: Install dependencies**

Run: `cd mobile && npm install`

---

## Task 2: Create API Service

**Files:**
- Create: `mobile/services/api.ts`
- Create: `mobile/services/auth.ts`
- Create: `mobile/utils/storage.ts`

- [ ] **Step 1: Create services/api.ts**

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.0.2.2:3001/api'; // Android emulator localhost

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

export const quotesApi = {
  getAll: () => api.get('/quotes'),
  getById: (id: string) => api.get(`/quotes/${id}`),
  create: (data: any) => api.post('/quotes', data),
  update: (id: string, data: any) => api.put(`/quotes/${id}`, data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export default api;
```

- [ ] **Step 2: Create utils/storage.ts**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  set: async (key: string, value: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  get: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  remove: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};
```

---

## Task 3: Auth Context

**Files:**
- Create: `mobile/context/AuthContext.tsx`

- [ ] **Step 1: Create AuthContext.tsx**

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { token, user } = response.data;
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## Task 4: UI Components

**Files:**
- Create: `mobile/components/ClientCard.tsx`
- Create: `mobile/components/QuoteCard.tsx`
- Create: `mobile/components/StatCard.tsx`
- Create: `mobile/components/LoadingSpinner.tsx`

- [ ] **Step 1: Create ClientCard.tsx**

```typescript
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
```

- [ ] **Step 2: Create QuoteCard.tsx**

```typescript
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
```

- [ ] **Step 3: Create StatCard.tsx**

```typescript
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
```

- [ ] **Step 4: Create LoadingSpinner.tsx**

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

interface Props {
  message?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1E40AF" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 12, color: '#64748B' },
});
```

---

## Task 5: Root Layout & Navigation

**Files:**
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Create app/_layout.tsx**

```typescript
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E40AF',
  },
};

function RootLayoutNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="login" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </PaperProvider>
  );
}
```

- [ ] **Step 2: Create app/(tabs)/_layout.tsx**

```typescript
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: { backgroundColor: '#1E40AF' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Quotes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## Task 6: Login Screen

**Files:**
- Create: `mobile/app/login.tsx`

- [ ] **Step 1: Create app/login.tsx**

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.title}>EngiQuote KE</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Sign in to continue</Text>
        
        <Surface style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Sign In
          </Button>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', color: '#1E40AF', fontWeight: 'bold' },
  subtitle: { textAlign: 'center', color: '#64748B', marginBottom: 32 },
  form: { padding: 24, borderRadius: 16, elevation: 2 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 4 },
  error: { color: '#EF4444', textAlign: 'center', marginBottom: 16 },
});
```

---

## Task 7: Dashboard Screen

**Files:**
- Create: `mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Create app/(tabs)/index.tsx**

```typescript
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
  section { margin: 16, padding: 16, borderRadius: 12, elevation: 1 },
  sectionTitle: { marginBottom: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#94A3B8', padding: 20 },
});
```

---

## Task 8: Clients Screen

**Files:**
- Create: `mobile/app/(tabs)/clients.tsx`

- [ ] **Step 1: Create app/(tabs)/clients.tsx**

```typescript
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
```

---

## Task 9: Quotes Screen

**Files:**
- Create: `mobile/app/(tabs)/quotes.tsx`

- [ ] **Step 1: Create app/(tabs)/quotes.tsx**

```typescript
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
```

---

## Task 10: Settings Screen

**Files:**
- Create: `mobile/app/(tabs)/settings.tsx`

- [ ] **Step 1: Create app/(tabs)/settings.tsx**

```typescript
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
```

---

## Task 11: Test & Build

- [ ] **Step 1: Start Expo dev server**

Run: `cd mobile && npx expo start`

- [ ] **Step 2: Run on Android emulator**

Run: `npx expo run:android`

- [ ] **Step 3: Verify functionality**

- [ ] **Step 4: Commit**

```bash
git add mobile/
git commit -m "feat: add React Native mobile app"
git push origin main
```
