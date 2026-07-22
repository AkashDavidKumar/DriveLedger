import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PDFExportService } from '../../services/PDFExportService';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      title: 'Owner Management',
      icon: 'people',
      color: '#3b82f6',
      onPress: () => navigation.navigate('OwnersList')
    },
    {
      title: 'Vehicle Management',
      icon: 'bus',
      color: '#f59e0b',
      onPress: () => navigation.navigate('VehiclesList')
    },
    {
      title: 'Backup & Restore',
      icon: 'cloud-upload',
      color: '#10b981',
      onPress: () => navigation.navigate('Backup')
    },
    {
      title: 'Export Full Database (PDF)',
      icon: 'document-text',
      color: '#ef4444',
      onPress: () => PDFExportService.exportReport('Complete Database Dump', {}, true)
    }
  ];

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <Text className="text-3xl font-bold text-black dark:text-white mb-6">Settings</Text>
      
      <View className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-6">
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={item.title}
            onPress={item.onPress}
            className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${item.color}20` }}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text className="flex-1 text-lg font-bold text-slate-800 dark:text-slate-200">{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        ))}
      </View>

      <View className="items-center mt-4 mb-10">
        <Text className="text-slate-400 font-bold">DriveLedger v1.0.0</Text>
        <Text className="text-slate-400 text-xs mt-1">Your Personal Work Manager</Text>
      </View>
    </ScrollView>
  );
}
