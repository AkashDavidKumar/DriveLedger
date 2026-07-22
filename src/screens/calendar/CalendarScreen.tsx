import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { CalendarService } from '../../services/CalendarService';
import { ReportService } from '../../services/ReportService';

export function CalendarScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  
  const [markedDates, setMarkedDates] = useState<any>({});
  const [dayEntries, setDayEntries] = useState<any[]>([]);
  
  const [monthlyStats, setMonthlyStats] = useState<any>(null);

  const loadMonthData = useCallback(async (month: string) => {
    const marks = await CalendarService.getMarkedDates(month);
    setMarkedDates(marks);

    // Monthly summary stats
    const start = `${month}-01`;
    const end = `${month}-31`;
    const stats = await ReportService.getSummaryMetrics({ dateFrom: start, dateTo: end });
    setMonthlyStats(stats);
  }, []);

  const loadDayData = useCallback(async (date: string) => {
    const entries = await CalendarService.getEntriesForDate(date);
    setDayEntries(entries);
  }, []);

  // Fetch when screen focuses or month/date changes
  useFocusEffect(
    useCallback(() => {
      loadMonthData(currentMonth);
      loadDayData(selectedDate);
    }, [currentMonth, selectedDate, loadMonthData, loadDayData])
  );

  const handleMonthChange = (monthData: any) => {
    setCurrentMonth(monthData.dateString.substring(0, 7)); // YYYY-MM
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const renderBadge = (status: string, salaryStatus: string) => {
    if (status === 'in_progress') {
      return <View className="bg-blue-100 px-2 py-1 rounded"><Text className="text-blue-700 text-[10px] font-bold uppercase">Active</Text></View>;
    }
    if (salaryStatus === 'paid') return <View className="bg-emerald-100 px-2 py-1 rounded"><Text className="text-emerald-700 text-[10px] font-bold uppercase">Paid</Text></View>;
    if (salaryStatus === 'partial') return <View className="bg-amber-100 px-2 py-1 rounded"><Text className="text-amber-700 text-[10px] font-bold uppercase">Partial</Text></View>;
    return <View className="bg-red-100 px-2 py-1 rounded"><Text className="text-red-700 text-[10px] font-bold uppercase">Pending</Text></View>;
  };

  return (
    <View 
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      style={{ paddingTop: insets.top }}
    >
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#0f172a', // dark slate for selection
          }
        }}
        theme={{
          calendarBackground: '#ffffff',
          todayTextColor: '#10b981',
          arrowColor: '#10b981',
          selectedDayBackgroundColor: '#0f172a',
          dotColor: '#10b981',
        }}
        style={{ marginBottom: 10 }}
      />

      {monthlyStats && (
        <View className="mx-4 mb-4 flex-row justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <View className="flex-1 items-center">
            <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Work Days</Text>
            <Text className="text-xl font-bold text-black dark:text-white">{monthlyStats.totalDays}</Text>
          </View>
          <View className="flex-1 items-center border-l border-r border-slate-200 dark:border-slate-700">
            <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Earned</Text>
            <Text className="text-xl font-bold text-emerald-600">₹{monthlyStats.totalExpected}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Pending</Text>
            <Text className="text-xl font-bold text-danger">₹{monthlyStats.totalPending}</Text>
          </View>
        </View>
      )}

      <Text className="mx-4 mb-2 font-bold text-slate-700 dark:text-slate-300">
        Activity on {dayjs(selectedDate).format('MMMM D, YYYY')}
      </Text>

      <FlatList
        data={dayEntries}
        keyExtractor={item => item.entry.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-4">No work recorded this day</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm border border-slate-100 dark:border-slate-700"
            onPress={() => {
              if (item.entry.status === 'in_progress') {
                navigation.navigate('WorkStack', { screen: 'ActiveWork', params: { workEntryId: item.entry.id } });
              } else {
                navigation.navigate('WorkDetails', { workEntryId: item.entry.id });
              }
            }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-black dark:text-white">{item.owner?.name}</Text>
              {renderBadge(item.entry.status, item.entry.salaryStatus)}
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-500">{item.vehicle?.name} ({item.entry.paymentType.replace('_', ' ')})</Text>
              <Text className="text-emerald-600 dark:text-emerald-400 font-bold">₹{item.entry.expectedSalary}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
