import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EntriesListScreen from './src/screens/EntriesListScreen';
import EntryFormScreen from './src/screens/EntryFormScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import StatsScreen from './src/screens/StatsScreen';
import { getNativeStackScreenOptions } from './src/constants/navigation';
import { AuthContext } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { PeriodPickerProvider, usePeriodPicker } from './src/context/PeriodPickerContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.listAccent,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons name={name} size={22} color="#fff" />
    </View>
  );
}

function TabPlaceholderScreen() {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.listBg }} />;
}

function AddTabFabButton(props) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Новая запись"
      accessibilityState={props.accessibilityState}
      onPress={() => navigation.navigate('EntryForm')}
      style={{
        top: -16,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.listAccent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Ionicons name="add" size={36} color="#fff" />
    </TouchableOpacity>
  );
}

function CalendarTabButton(props) {
  const { open } = usePeriodPicker();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        const parent = navigation.getParent();
        if (parent?.getState()?.index > 0) {
          parent.navigate('Tabs', { screen: 'Home' });
        }
        props.onPress?.();
        setTimeout(() => open(), 100);
      }}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <TabIcon name="calendar" />
    </TouchableOpacity>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.listBg,
          borderTopWidth: 0,
          paddingTop: 16,
          paddingBottom: 44,
          height: 100,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: { paddingVertical: 4 },
        freezeOnBlur: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={EntriesListScreen}
        options={{
          tabBarIcon: () => <TabIcon name="calendar" />,
          tabBarButton: (props) => <CalendarTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={TabPlaceholderScreen}
        options={{
          tabBarIcon: () => null,
          tabBarButton: (props) => <AddTabFabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={TabPlaceholderScreen}
        options={{
          tabBarIcon: () => <TabIcon name="bar-chart" />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const parent = navigation.getParent();
            if (!parent) return;
            const state = parent.getState();
            const top = state.routes[state.index];
            if (top.name === 'Stats') return;
            if (top.name !== 'Tabs') {
              parent.navigate('Tabs', { screen: 'Home' });
            }
            parent.navigate('Stats');
          },
        })}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  const { colors } = useTheme();
  const screenOptions = useMemo(() => getNativeStackScreenOptions(colors.listBg), [colors.listBg]);
  return (
    <PeriodPickerProvider>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Tabs" component={MainTabs} />
        <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
        <Stack.Screen name="EntryForm" component={EntryFormScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
      </Stack.Navigator>
    </PeriodPickerProvider>
  );
}

function AppNavigation() {
  const { colors, isDark } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('authToken').then((token) => setIsLoggedIn(!!token));
  }, []);

  const login = () => setIsLoggedIn(true);
  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.listBg,
      },
    }),
    [colors.listBg]
  );

  const authStackOptions = useMemo(() => getNativeStackScreenOptions(colors.authBg), [colors.authBg]);

  if (isLoggedIn === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <AuthContext.Provider value={{ login, logout }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <NavigationContainer theme={navTheme}>
          {isLoggedIn ? (
            <AppStack />
          ) : (
            <Stack.Navigator screenOptions={authStackOptions} initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}
