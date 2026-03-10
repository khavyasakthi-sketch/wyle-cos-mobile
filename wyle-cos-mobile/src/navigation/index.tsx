import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Colors, Typography } from '../theme';
import { useAppStore } from '../store';

// ─── Screens (imported lazily to keep nav file clean) ─────────────────────────
import HomeScreen from '../screens/Home/HomeScreen';
import ObligationsScreen from '../screens/Obligations/ObligationsScreen';
import FoodScreen from '../screens/Food/FoodScreen';
import BuddyScreen from '../screens/Buddy/BuddyScreen';
import InsightsScreen from '../screens/Insights/InsightsScreen';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import PreferencesScreen from '../screens/Onboarding/PreferencesScreen';
import ObligationScanScreen from '../screens/Onboarding/ObligationScanScreen';
import ReadyScreen from '../screens/Onboarding/ReadyScreen';

const RootStack = createStackNavigator();
const OnboardingStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Obligations: '📋',
  Food: '🍽️',
  Buddy: '◎',
  Insights: '◈',
};

// ─── Onboarding flow ──────────────────────────────────────────────────────────
function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="Preferences" component={PreferencesScreen} />
      <OnboardingStack.Screen name="ObligationScan" component={ObligationScanScreen} />
      <OnboardingStack.Screen name="Ready" component={ReadyScreen} />
    </OnboardingStack.Navigator>
  );
}

// ─── Main tab bar ─────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.verdigris,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: Typography.size.xs, fontWeight: Typography.weight.medium },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 20, color }}>{TAB_ICONS[route.name] || '•'}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Obligations" component={ObligationsScreen} />
      <Tab.Screen name="Food" component={FoodScreen} />
      <Tab.Screen name="Buddy" component={BuddyScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, isAuthenticated } = useAppStore();
  const showOnboarding = isAuthenticated && !user?.onboardingComplete;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : showOnboarding ? (
          <RootStack.Screen name="OnboardingFlow" component={OnboardingNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
