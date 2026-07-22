import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import { WorkEntryService } from '../../services/WorkEntryService';
import { SalaryCalculatorService } from '../../services/SalaryCalculatorService';
import { OwnerService } from '../../services/OwnerService';
import { VehicleService } from '../../services/VehicleService';

export function FinishWorkScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { workEntryId } = route.params;

  const [entry, setEntry] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  
  const [hours, setHours] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const active = await WorkEntryService.getActiveWorkEntry();
        if (!active || active.id !== workEntryId) {
          Alert.alert('Error', 'Work session is not active.');
          navigation.navigate('Dashboard');
          return;
        }
        setEntry(active);
        
        const [o, v] = await Promise.all([
          OwnerService.getOwnerById(active.ownerId),
          VehicleService.getVehicleById(active.vehicleId)
        ]);
        setOwner(o);
        setVehicle(v);

        // Pre-calculate hours based on current time
        if (active.paymentType === 'per_hour' && active.startTime) {
          setHours(SalaryCalculatorService.calculateHours(active.startTime, dayjs().toISOString()));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [workEntryId, navigation]);

  const handleFinish = async () => {
    try {
      await WorkEntryService.finishWorkEntry(workEntryId, {
        endTime: dayjs().toISOString(),
        hours
      });
      Alert.alert('Success', 'Work session finished successfully!');
      navigation.navigate('Dashboard');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (!entry || !owner || !vehicle) return null;

  const expectedSalary = SalaryCalculatorService.calculateSalary(entry.paymentType, entry.rate, hours);

  return (
    <ScrollView 
      className="flex-1 bg-white dark:bg-slate-900 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <Text className="text-3xl font-bold text-black dark:text-white mb-6">Review & Finish</Text>

      <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <Text className="text-lg font-bold text-black dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Summary</Text>
        
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500">Owner</Text>
          <Text className="font-bold text-black dark:text-white">{owner.name}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500">Vehicle</Text>
          <Text className="font-bold text-black dark:text-white">{vehicle.name}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500">Total Trips</Text>
          <Text className="font-bold text-black dark:text-white">{entry.tripCount}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500">Rate Type</Text>
          <Text className="font-bold text-black dark:text-white">{entry.paymentType.replace('_', ' ')}</Text>
        </View>

        {entry.paymentType === 'per_hour' && (
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-500">Total Hours</Text>
            <Text className="font-bold text-black dark:text-white">{hours}</Text>
          </View>
        )}

        <View className="flex-row justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Text className="text-lg font-bold text-slate-700 dark:text-slate-300">Expected Salary</Text>
          <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{expectedSalary}</Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center mb-10 shadow-lg"
        onPress={handleFinish}
      >
        <Text className="text-white font-bold text-lg">Confirm & Finish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
