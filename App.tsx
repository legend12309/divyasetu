import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from './context/AuthContext';
import { colors } from './theme';

import HomeScreen from './screens/HomeScreen';
import GroceryScreen from './screens/GroceryScreen';
import MealsScreen from './screens/MealsScreen';
import ChoresScreen from './screens/ChoresScreen';
import BudgetScreen from './screens/BudgetScreen';
import LoginScreen from './screens/Auth/LoginScreen';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'GroceryTab') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'MealsTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'ChoresTab') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'BudgetTab') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray600,
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          elevation: 8,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="GroceryTab" 
        component={GroceryScreen}
        options={{
          tabBarLabel: 'Grocery',
        }}
      />
      <Tab.Screen 
        name="MealsTab" 
        component={MealsScreen}
        options={{
          tabBarLabel: 'Meals',
        }}
      />
      <Tab.Screen 
        name="ChoresTab" 
        component={ChoresScreen}
        options={{
          tabBarLabel: 'Chores',
        }}
      />
      <Tab.Screen 
        name="BudgetTab" 
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Budget',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return <LoginScreen />;
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return user ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
