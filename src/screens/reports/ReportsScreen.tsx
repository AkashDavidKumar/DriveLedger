import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { ReportService } from '../../services/ReportService';
import { PDFExportService } from '../../services/PDFExportService';
import { FilterBar } from '../../components/FilterBar';

export function ReportsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // State
  const [summary, setSummary] = useState<any>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<any[]>([]);
  const [vehicleUsage, setVehicleUsage] = useState<any[]>([]);
  
  // Filters
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // In a real app we'd map `dateFilter` to actual date ranges.
      const filters = {}; 
      const sum = await ReportService.getSummaryMetrics(filters);
      const monthly = await ReportService.getMonthlyEarnings(filters);
      const vehicles = await ReportService.getVehicleUsage(filters);
      
      setSummary(sum);
      setMonthlyEarnings(monthly);
      setVehicleUsage(vehicles);
    } catch(e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navToHistory = (extraFilters: any = {}) => {
    navigation.navigate('History', { filters: extraFilters });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      let title = 'DriveLedger Report';
      if (dateFilter === 'today') title = 'Daily Report';
      if (dateFilter === 'week') title = 'Weekly Report';
      if (dateFilter === 'month') title = 'Monthly Report';

      // In real implementation, dateFilter would translate to date ranges for getDetailedRecords
      await PDFExportService.exportReport(title, {}, true);
    } catch (e: any) {
      Alert.alert('Export Failed', e.message || 'An error occurred while exporting PDF.');
    } finally {
      setExporting(false);
    }
  };

  // Chart Data Mapping
  const barData = monthlyEarnings.map(m => ({
    value: m.expected,
    label: m.month.split('-')[1], // Just month number
    frontColor: '#10b981',
  }));

  const pieData = [
    { value: summary?.totalReceived || 0, color: '#10b981', text: 'Paid' },
    { value: summary?.totalPending || 0, color: '#ef4444', text: 'Pending' }
  ].filter(d => d.value > 0);

  const vehicleBarData = vehicleUsage.map(v => ({
    value: v.hours,
    label: v.vehicleName.substring(0, 5),
    frontColor: '#3b82f6',
  }));

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-black dark:text-white">Reports</Text>
          <TouchableOpacity 
            onPress={handleExport}
            disabled={exporting}
            className="flex-row items-center bg-emerald-500 px-4 py-2 rounded-lg shadow-sm"
          >
            {exporting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="document-text" size={16} color="white" />
                <Text className="text-white font-bold ml-2">Export PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <FilterBar 
          title="Date Range"
          options={[
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' },
            { label: 'All Time', value: 'all' },
          ]}
          selectedValue={dateFilter}
          onSelect={setDateFilter}
        />

        {summary && (
          <View className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 border border-slate-100 dark:border-slate-700 flex-row flex-wrap justify-between">
            <View className="w-[48%] mb-4">
              <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Work Days</Text>
              <Text className="text-2xl font-bold text-black dark:text-white">{summary.totalDays}</Text>
            </View>
            <View className="w-[48%] mb-4">
              <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Total Trips</Text>
              <Text className="text-2xl font-bold text-black dark:text-white">{summary.totalTrips}</Text>
            </View>
            <View className="w-[48%] mb-4">
              <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Total Hours</Text>
              <Text className="text-2xl font-bold text-black dark:text-white">{summary.totalHours}</Text>
            </View>
            <View className="w-[48%] mb-4">
              <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Total Earned</Text>
              <Text className="text-2xl font-bold text-emerald-600">₹{summary.totalExpected}</Text>
            </View>
            <TouchableOpacity onPress={() => navToHistory({ salaryStatuses: ['pending'] })} className="w-[48%] bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              <Text className="text-red-500 text-xs font-bold uppercase mb-1">Pending Salary</Text>
              <Text className="text-2xl font-bold text-danger">₹{summary.totalPending}</Text>
            </TouchableOpacity>
          </View>
        )}

        {barData.length > 0 && (
          <View className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
            <Text className="text-lg font-bold text-black dark:text-white mb-4">Monthly Earnings</Text>
            <BarChart
              data={barData}
              barWidth={32}
              spacing={24}
              roundedTop
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: 'gray' }}
              xAxisLabelTextStyle={{ color: 'gray', textAlign: 'center' }}
              noOfSections={4}
              maxValue={Math.max(...barData.map(d => d.value)) * 1.2 || 100}
            />
          </View>
        )}

        {pieData.length > 0 && (
          <View className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 border border-slate-100 dark:border-slate-700 items-center">
            <Text className="text-lg font-bold text-black dark:text-white mb-4 w-full">Salary Status</Text>
            <PieChart
              data={pieData}
              donut
              showText
              textColor="white"
              radius={100}
              innerRadius={60}
              textSize={12}
            />
            <View className="flex-row mt-4 w-full justify-around">
              <Text className="text-emerald-500 font-bold">Paid: ₹{summary?.totalReceived}</Text>
              <Text className="text-danger font-bold">Pending: ₹{summary?.totalPending}</Text>
            </View>
          </View>
        )}
        
        {vehicleBarData.length > 0 && (
           <View className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-10 border border-slate-100 dark:border-slate-700">
             <Text className="text-lg font-bold text-black dark:text-white mb-4">Vehicle Usage (Hours)</Text>
             <BarChart
               data={vehicleBarData}
               barWidth={22}
               spacing={22}
               roundedTop
               frontColor={'#3b82f6'}
               xAxisThickness={0}
               yAxisThickness={0}
               yAxisTextStyle={{ color: 'gray' }}
               xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
               noOfSections={3}
             />
           </View>
        )}

      </View>
    </ScrollView>
  );
}
