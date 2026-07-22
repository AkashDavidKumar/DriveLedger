import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import { WorkEntryService } from '../../services/WorkEntryService';
import { TripService } from '../../services/TripService';
import { SalaryCalculatorService } from '../../services/SalaryCalculatorService';
import { OwnerService } from '../../services/OwnerService';
import { VehicleService } from '../../services/VehicleService';

export function ActiveWorkScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { workEntryId } = route.params;

  const [entry, setEntry] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [notes, setNotes] = useState('');
  
  // Real-time tracking base
  const [now, setNow] = useState(dayjs());

  const loadData = useCallback(async () => {
    try {
      const active = await WorkEntryService.getActiveWorkEntry();
      if (!active || active.id !== workEntryId) {
         Alert.alert('Error', 'Work session is not active.');
         navigation.goBack();
         return;
      }
      setEntry(active);
      setNotes(active.notes || '');

      const [o, v] = await Promise.all([
        OwnerService.getOwnerById(active.ownerId),
        VehicleService.getVehicleById(active.vehicleId)
      ]);
      setOwner(o);
      setVehicle(v);
    } catch (e) {
      console.error(e);
    }
  }, [workEntryId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    // Timer for hourly updates (every minute)
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTrip = async () => {
    try {
      await TripService.addTrip(workEntryId);
      await loadData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRemoveTrip = () => {
    if (entry?.tripCount <= 0) return;
    Alert.alert('Remove Trip', 'Are you sure you want to remove the last trip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await TripService.removeLastTrip(workEntryId);
        await loadData();
      }}
    ]);
  };

  const saveNotes = async () => {
    try {
      await WorkEntryService.updateWorkEntry(workEntryId, { notes });
    } catch (e) {
      console.error('Auto-save notes failed', e);
    }
  };

  if (!entry || !owner || !vehicle) return null;

  let currentHours = 0;
  if (entry.paymentType === 'per_hour' && entry.startTime) {
    currentHours = SalaryCalculatorService.calculateHours(entry.startTime, now.toISOString());
  }

  const expectedSalary = SalaryCalculatorService.calculateSalary(entry.paymentType, entry.rate, currentHours);

  return (
    <ScrollView 
      className="flex-1 bg-white dark:bg-slate-900 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-black dark:text-white">Active Work</Text>
        <View className="bg-emerald-100 dark:bg-emerald-900 px-3 py-1 rounded-full">
          <Text className="text-emerald-700 dark:text-emerald-300 font-bold tracking-widest uppercase text-xs">Live</Text>
        </View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-500">Owner</Text>
          <Text className="font-bold text-black dark:text-white">{owner.name}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-500">Vehicle</Text>
          <Text className="font-bold text-black dark:text-white">{vehicle.name}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-500">Rate ({entry.paymentType.replace('_', ' ')})</Text>
          <Text className="font-bold text-emerald-600 dark:text-emerald-400">₹{entry.rate}</Text>
        </View>
        {entry.paymentType === 'per_hour' && (
          <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <Text className="text-slate-500 font-bold">Current Hours</Text>
            <Text className="font-bold text-black dark:text-white">{currentHours} hrs</Text>
          </View>
        )}
      </View>

      <View className="items-center justify-center bg-primary rounded-3xl p-8 mb-6 shadow-lg">
        <Text className="text-emerald-200 font-bold mb-2 uppercase tracking-widest text-sm">Total Trips</Text>
        <Text className="text-white text-7xl font-bold">{entry.tripCount}</Text>
        
        <View className="flex-row mt-6 space-x-6 w-full justify-center px-4">
          <TouchableOpacity onPress={handleRemoveTrip} className="bg-white/20 p-4 rounded-full w-16 h-16 items-center justify-center mx-4">
            <Ionicons name="remove" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddTrip} className="bg-white p-4 rounded-full w-20 h-20 items-center justify-center mx-4 shadow-xl">
            <Ionicons name="add" size={40} color="#1e3a8a" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2">Earnings So Far</Text>
        <Text className="text-4xl font-bold text-emerald-500">₹{expectedSalary}</Text>
      </View>

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1 mt-4">Notes (Auto-saves)</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-6"
        multiline
        numberOfLines={3}
        value={notes}
        onChangeText={setNotes}
        onBlur={saveNotes}
        placeholder="Add any notes here..."
        placeholderTextColor="#94a3b8"
      />

      <TouchableOpacity
        className="bg-danger rounded-xl p-4 items-center mb-10 shadow-lg"
        onPress={() => navigation.navigate('FinishWork', { workEntryId })}
      >
        <Text className="text-white font-bold text-lg">Finish Work</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
