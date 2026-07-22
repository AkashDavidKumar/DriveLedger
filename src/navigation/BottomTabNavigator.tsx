import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabParamList } from './types';

import { DashboardScreen, CalendarScreen, ReportsScreen, SalaryScreen, SettingsScreen } from '../screens';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#10b981' }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} /> }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} /> }} />
      <Tab.Screen name="Salary" component={SalaryScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}
