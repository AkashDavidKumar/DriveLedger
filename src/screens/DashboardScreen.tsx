import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WorkEntryService } from '../services/WorkEntryService';
import { DashboardService } from '../services/DashboardService';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [activeWork, setActiveWork] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadDashboard() {
        const active = await WorkEntryService.getActiveWorkEntry();
        const dStats = await DashboardService.getDashboardStats();
        setActiveWork(active);
        setStats(dStats);
      }
      loadDashboard();
    }, [])
  );

  const handleWorkAction = () => {
    if (activeWork) {
      navigation.navigate('WorkStack', { screen: 'ActiveWork', params: { workEntryId: activeWork.id } });
    } else {
      navigation.navigate('WorkStack', { screen: 'StartWork' });
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 p-4">
      <View className="mb-6 mt-4">
        <Text className="text-3xl font-bold text-slate-800 dark:text-white">DriveLedger</Text>
        <Text className="text-slate-500">Your Personal Work Manager</Text>
      </View>

      <TouchableOpacity
        className={`${activeWork ? 'bg-warning' : 'bg-primary'} rounded-2xl p-6 items-center flex-row justify-center shadow-lg mb-6`}
        onPress={handleWorkAction}
      >
        <Ionicons name={activeWork ? "construct" : "play"} size={24} color="white" className="mr-2" />
        <Text className="text-white font-bold text-xl ml-2">
          {activeWork ? 'Resume Active Work' : 'Start Work'}
        </Text>
      </TouchableOpacity>
      
      {stats && (
        <View className="mb-4">
          <Text className="text-xl font-bold text-black dark:text-white mb-3">Overview</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-1 mr-2 shadow-sm border border-slate-100 dark:border-slate-700">
              <Text className="text-slate-500 text-sm font-bold mb-1">Today&apos;s Earnings</Text>
              <Text className="text-2xl font-bold text-emerald-500">₹{stats.todayExpected}</Text>
            </View>
            <View className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-1 ml-2 shadow-sm border border-slate-100 dark:border-slate-700">
              <Text className="text-slate-500 text-sm font-bold mb-1">Monthly Earnings</Text>
              <Text className="text-2xl font-bold text-blue-500">₹{stats.monthlyExpected}</Text>
            </View>
          </View>

          <View className="bg-white dark:bg-slate-800 p-4 rounded-xl w-full shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
            <Text className="text-slate-500 text-sm font-bold mb-1">Total Pending Salary</Text>
            <Text className="text-3xl font-bold text-danger">₹{stats.totalPending}</Text>
          </View>
        </View>
      )}

    </ScrollView>
  );
}
