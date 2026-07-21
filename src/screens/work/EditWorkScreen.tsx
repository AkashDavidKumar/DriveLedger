import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WorkEntryService } from '../../services/WorkEntryService';

export function EditWorkScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { workEntryId } = route.params;

  const [notes, setNotes] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('');
  
  useEffect(() => {
    async function loadData() {
      const data = await WorkEntryService.getWorkEntryById(workEntryId);
      if (data?.entry) {
        setNotes(data.entry.notes || '');
        setPickupLocation(data.entry.pickupLocation || '');
        setDropLocation(data.entry.dropLocation || '');
        setRate(data.entry.rate.toString());
        setHours((data.entry.hours || 0).toString());
      }
    }
    loadData();
  }, [workEntryId]);

  const handleSave = async () => {
    try {
      await WorkEntryService.updateWorkEntry(workEntryId, {
        notes,
        pickupLocation,
        dropLocation,
        rate: parseFloat(rate) || 0,
        hours: parseFloat(hours) || 0
      });
      Alert.alert('Success', 'Work entry updated successfully!');
      navigation.goBack();
    } catch(e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900 p-4">
      <Text className="text-2xl font-bold text-black dark:text-white mb-6">Edit Work Details</Text>

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Rate (₹)</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        keyboardType="numeric"
        value={rate}
        onChangeText={setRate}
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Total Hours</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        keyboardType="numeric"
        value={hours}
        onChangeText={setHours}
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Pickup Location</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        value={pickupLocation}
        onChangeText={setPickupLocation}
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Drop Location</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-4"
        value={dropLocation}
        onChangeText={setDropLocation}
      />

      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Notes</Text>
      <TextInput
        className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white bg-slate-50 dark:bg-slate-800 mb-6"
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center shadow-lg mb-10"
        onPress={handleSave}
      >
        <Text className="text-white font-bold text-lg">Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
