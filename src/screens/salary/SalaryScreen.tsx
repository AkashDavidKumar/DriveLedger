import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DashboardService } from '../../services/DashboardService';
import { SalaryPaymentService } from '../../services/SalaryPaymentService';

export function SalaryScreen() {
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dash, time] = await Promise.all([
        DashboardService.getDashboardStats(),
        SalaryPaymentService.getGlobalTimeline()
      ]);
      setStats(dash);
      setTimeline(time);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View className="p-4 bg-white dark:bg-slate-900">
      <Text className="text-3xl font-bold text-black dark:text-white mb-6">Salary & Payments</Text>
      
      {stats && (
        <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <View className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <Text className="text-slate-500 font-bold mb-1 uppercase tracking-widest text-xs">Total Pending</Text>
            <Text className="text-4xl font-bold text-danger">₹{stats.totalPending}</Text>
          </View>
          
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-slate-500 font-bold mb-1 text-sm">Total Expected</Text>
              <Text className="text-xl font-bold text-black dark:text-white">₹{stats.totalExpected}</Text>
            </View>
            <View>
              <Text className="text-slate-500 font-bold mb-1 text-sm text-right">Total Received</Text>
              <Text className="text-xl font-bold text-emerald-600 dark:text-emerald-400 text-right">₹{stats.totalReceived}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <View>
              <Text className="text-slate-500 text-xs">This Month (Expected)</Text>
              <Text className="font-bold text-black dark:text-white mt-1">₹{stats.monthlyExpected}</Text>
            </View>
            <View>
              <Text className="text-slate-500 text-xs text-right">Today (Expected)</Text>
              <Text className="font-bold text-black dark:text-white mt-1 text-right">₹{stats.todayExpected}</Text>
            </View>
          </View>
        </View>
      )}

      <Text className="text-xl font-bold text-black dark:text-white mb-2">Payment Timeline</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <FlatList
        data={timeline}
        ListHeaderComponent={renderHeader}
        keyExtractor={item => item.payment.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No payments found</Text>}
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">+ ₹{item.payment.amount}</Text>
              <Text className="text-slate-500 text-xs">{item.payment.paymentDate}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-black dark:text-white font-medium">{item.owner?.name}</Text>
              <Text className="text-slate-500 text-xs">{item.vehicle?.name}</Text>
            </View>
            {item.payment.notes ? (
              <Text className="text-slate-500 text-sm mt-2 italic">&quot;{item.payment.notes}&quot;</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}
