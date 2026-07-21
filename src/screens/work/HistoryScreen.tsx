import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WorkEntryService } from '../../services/WorkEntryService';

export function HistoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const initialFilters = route.params?.filters || {};

  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<string | null>(initialFilters.salaryStatuses?.[0] || null);

  const loadData = useCallback(async () => {
    try {
      const data = await WorkEntryService.getHistory({
        search,
        salaryStatuses: statusFilter ? [statusFilter] : undefined,
      });
      setHistory(data);
    } catch(e) {
      console.error(e);
    }
  }, [search, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const renderBadge = (status: string) => {
    let bg = 'bg-slate-200 dark:bg-slate-700';
    let text = 'text-slate-700 dark:text-slate-300';
    if (status === 'paid') { bg = 'bg-emerald-100 dark:bg-emerald-900'; text = 'text-emerald-700 dark:text-emerald-300'; }
    else if (status === 'partial') { bg = 'bg-blue-100 dark:bg-blue-900'; text = 'text-blue-700 dark:text-blue-300'; }
    else if (status === 'pending') { bg = 'bg-amber-100 dark:bg-amber-900'; text = 'text-amber-700 dark:text-amber-300'; }

    return (
      <View className={`${bg} px-2 py-1 rounded shadow-sm`}>
        <Text className={`${text} text-[10px] font-bold uppercase tracking-widest`}>{status}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <View className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <Text className="text-2xl font-bold text-black dark:text-white mb-4">Work History</Text>
        
        <View className="flex-row items-center bg-white dark:bg-slate-900 rounded-xl px-4 py-2 mb-3 border border-slate-200 dark:border-slate-700">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput 
            className="flex-1 ml-2 text-black dark:text-white h-10"
            placeholder="Search by owner, vehicle, notes..."
            placeholderTextColor="gray"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
          {['pending', 'partial', 'paid'].map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => setStatusFilter(statusFilter === status ? null : status)}
              className={`px-4 py-2 rounded-full border ${statusFilter === status ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'} mr-2 shadow-sm`}
            >
              <Text className={`${statusFilter === status ? 'text-white font-bold' : 'text-slate-600 dark:text-slate-300'} capitalize`}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.entry.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No history found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm border border-slate-100 dark:border-slate-700"
            onPress={() => navigation.navigate('WorkDetails', { workEntryId: item.entry.id })}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-500 font-bold">{item.entry.date}</Text>
              {renderBadge(item.entry.salaryStatus)}
            </View>
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-bold text-black dark:text-white">{item.owner?.name}</Text>
              <Text className="text-emerald-600 dark:text-emerald-400 font-bold">₹{item.entry.expectedSalary}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-500">{item.vehicle?.name} ({item.entry.paymentType.replace('_', ' ')})</Text>
              <Text className="text-slate-400 text-xs">Trips: {item.entry.tripCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
