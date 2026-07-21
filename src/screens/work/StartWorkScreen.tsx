import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';

import { OwnerService } from '../../services/OwnerService';
import { VehicleService } from '../../services/VehicleService';
import { SalaryRateService } from '../../services/SalaryRateService';
import { WorkEntryService } from '../../services/WorkEntryService';

export function StartWorkScreen() {
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  const [ownerId, setOwnerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [paymentType, setPaymentType] = useState('per_day');
  const [rate, setRate] = useState('0');
  
  const [startTime, setStartTime] = useState(dayjs().toISOString());
  const [pickupLocation, setPickupLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const activeEntry = await WorkEntryService.getActiveWorkEntry();
        if (activeEntry) {
          navigation.replace('ActiveWork', { workEntryId: activeEntry.id });
          return;
        }

        const [ownersData, vehiclesData] = await Promise.all([
          OwnerService.getActiveOwners(),
          VehicleService.getVehicles()
        ]);
        
        setOwners(ownersData);
        setVehicles(vehiclesData);
        
        if (ownersData.length > 0) setOwnerId(ownersData[0].id);
        if (vehiclesData.length > 0) {
          setVehicleId(vehiclesData[0].id);
          setPaymentType(vehiclesData[0].defaultPaymentMethod);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigation]);

  useEffect(() => {
    async function updateRate() {
      if (ownerId && vehicleId && paymentType) {
        const customRate = await SalaryRateService.getRate(ownerId, vehicleId, paymentType);
        if (customRate !== null) {
          setRate(customRate.toString());
        } else {
          const vehicle = vehicles.find(v => v.id === vehicleId);
          if (vehicle) {
            let baseRate = vehicle.defaultRate;
            if (paymentType === 'half_day') baseRate = baseRate / 2;
            setRate(baseRate.toString());
          }
        }
      }
    }
    updateRate();
  }, [ownerId, vehicleId, paymentType, vehicles]);

  const handleStartWork = async () => {
    if (!ownerId || !vehicleId) {
      Alert.alert('Validation Error', 'Please select an Owner and Vehicle.');
      return;
    }

    try {
      const id = await WorkEntryService.startWorkEntry({
        date: dayjs().format('YYYY-MM-DD'),
        ownerId,
        vehicleId,
        paymentType,
        rate: parseFloat(rate) || 0,
        startTime,
        pickupLocation,
        notes
      });
      navigation.replace('ActiveWork', { workEntryId: id });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900"><ActivityIndicator size="large" color="#10b981" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900 p-4">
      <Text className="text-2xl font-bold text-black dark:text-white mb-6">Start Work</Text>

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Owner</Text>
      <View className="border border-slate-300 dark:border-slate-700 rounded-xl mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800">
        <Picker selectedValue={ownerId} onValueChange={(v) => setOwnerId(v)} style={{ color: 'gray' }}>
          {owners.map(o => <Picker.Item key={o.id} label={o.name} value={o.id} />)}
        </Picker>
      </View>

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Vehicle</Text>
      <View className="border border-slate-300 dark:border-slate-700 rounded-xl mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800">
        <Picker selectedValue={vehicleId} onValueChange={(v) => setVehicleId(v)} style={{ color: 'gray' }}>
          {vehicles.map(v => <Picker.Item key={v.id} label={`${v.name} (${v.type})`} value={v.id} />)}
        </Picker>
      </View>

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Payment Type</Text>
      <View className="border border-slate-300 dark:border-slate-700 rounded-xl mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800">
        <Picker selectedValue={paymentType} onValueChange={(v) => setPaymentType(v)} style={{ color: 'gray' }}>
          <Picker.Item label="Per Day" value="per_day" />
          <Picker.Item label="Half Day" value="half_day" />
          <Picker.Item label="Per Hour" value="per_hour" />
        </Picker>
      </View>

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Applied Rate</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        keyboardType="numeric"
        value={rate}
        onChangeText={setRate}
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Start Time (ISO String for now)</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        value={startTime}
        onChangeText={setStartTime}
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Pickup Location (Optional)</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        value={pickupLocation}
        onChangeText={setPickupLocation}
        placeholder="e.g. River, Quarry"
        placeholderTextColor="#94a3b8"
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Notes (Optional)</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes?"
        placeholderTextColor="#94a3b8"
      />

      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center mt-2 mb-10 shadow-lg"
        onPress={handleStartWork}
      >
        <Text className="text-white font-bold text-lg">Start Work</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
