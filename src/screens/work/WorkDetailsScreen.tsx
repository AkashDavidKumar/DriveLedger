import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WorkEntryService } from '../../services/WorkEntryService';

export function WorkDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { workEntryId } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const result = await WorkEntryService.getWorkEntryById(workEntryId);
      if (!result) {
        Alert.alert('Error', 'Work entry not found');
        navigation.goBack();
        return;
      }
      setData(result);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [workEntryId, navigation]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleDelete = () => {
    // Show confirmation dialog before deleting work entries with linked salary payments
    const hasPayments = data.entry.receivedSalary > 0;
    const msg = hasPayments 
      ? 'This work entry has linked salary payments. Deleting it will permanently delete those payments. Are you sure?'
      : 'Are you sure you want to permanently delete this work entry and all related trips?';

    Alert.alert('Delete Work Entry', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await WorkEntryService.deleteWorkEntry(workEntryId);
          navigation.goBack();
        } catch(e: any) {
          Alert.alert('Error', e.message);
        }
      }}
    ]);
  };

  if (loading || !data) return <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900"><ActivityIndicator color="#10b981" /></View>;

  const { entry, owner, vehicle } = data;

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-black dark:text-white">Work Details</Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => navigation.navigate('EditWork', { workEntryId })} className="bg-slate-200 dark:bg-slate-700 p-2 rounded-xl mr-2">
            <Ionicons name="pencil" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-xl">
            <Ionicons name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">General Information</Text>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Date</Text><Text className="font-bold text-black dark:text-white">{entry.date}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Owner</Text><Text className="font-bold text-black dark:text-white">{owner?.name}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Vehicle</Text><Text className="font-bold text-black dark:text-white">{vehicle?.name}</Text></View>
        <View className="flex-row justify-between"><Text className="text-slate-500">Reg. Number</Text><Text className="font-bold text-black dark:text-white">{vehicle?.registrationNumber || 'N/A'}</Text></View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <View className="flex-row justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          <Text className="text-lg font-bold text-slate-800 dark:text-white">Work Data</Text>
        </View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Payment Type</Text><Text className="font-bold text-black dark:text-white">{entry.paymentType.replace('_', ' ')}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Rate</Text><Text className="font-bold text-black dark:text-white">₹{entry.rate}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Hours</Text><Text className="font-bold text-black dark:text-white">{entry.hours || 0}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Trips</Text><Text className="font-bold text-black dark:text-white">{entry.tripCount}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Pickup</Text><Text className="font-bold text-black dark:text-white">{entry.pickupLocation || 'N/A'}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Drop</Text><Text className="font-bold text-black dark:text-white">{entry.dropLocation || 'N/A'}</Text></View>
        <View className="mt-2"><Text className="text-slate-500 mb-1">Notes</Text><Text className="text-black dark:text-white">{entry.notes || 'None'}</Text></View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <View className="flex-row justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          <Text className="text-lg font-bold text-slate-800 dark:text-white">Salary Information</Text>
          <View className={`px-2 py-1 rounded-md ${entry.salaryStatus === 'paid' ? 'bg-emerald-100' : entry.salaryStatus === 'partial' ? 'bg-blue-100' : 'bg-amber-100'}`}>
            <Text className={`text-xs font-bold uppercase ${entry.salaryStatus === 'paid' ? 'text-emerald-700' : entry.salaryStatus === 'partial' ? 'text-blue-700' : 'text-amber-700'}`}>{entry.salaryStatus}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Expected</Text><Text className="font-bold text-slate-800 dark:text-slate-200">₹{entry.expectedSalary}</Text></View>
        <View className="flex-row justify-between mb-2"><Text className="text-slate-500">Received</Text><Text className="font-bold text-emerald-600 dark:text-emerald-400">₹{entry.receivedSalary}</Text></View>
        <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"><Text className="text-slate-500 font-bold">Pending</Text><Text className="font-bold text-danger text-lg">₹{entry.pendingSalary}</Text></View>
        
        {entry.pendingSalary > 0 && (
          <TouchableOpacity 
            className="mt-6 bg-primary py-3 rounded-xl items-center shadow-sm"
            onPress={() => navigation.navigate('AddPayment', { workEntryId })}
          >
            <Text className="text-white font-bold">Add Payment</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View className="h-10" />
    </ScrollView>
  );
}
