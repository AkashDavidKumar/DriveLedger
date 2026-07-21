import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VehicleSchema, VehicleFormData } from '../../models/Schemas';
import { VehicleService } from '../../services/VehicleService';
import { useNavigation } from '@react-navigation/native';

export function AddVehicleScreen() {
  const navigation = useNavigation();
  const { control, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
    // @ts-ignore
    resolver: zodResolver(VehicleSchema),
    defaultValues: { name: '', registrationNumber: '', type: 'Tractor', defaultPaymentMethod: 'per_day', defaultRate: 0 }
  });

  const onSubmit = async (data: VehicleFormData) => {
    try {
      await VehicleService.createVehicle(data);
      Alert.alert('Success', 'Vehicle added successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save vehicle');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900 p-4">
      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Vehicle Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. John Deere 5050"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
        {errors.name && <Text className="text-danger text-sm mt-1">{errors.name.message}</Text>}
      </View>

      {/* Basic implementation for the rest of fields */}
      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Default Rate *</Text>
        <Controller
          control={control}
          name="defaultRate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
              value={String(value)}
              keyboardType="numeric"
              placeholder="e.g. 700"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
        {errors.defaultRate && <Text className="text-danger text-sm mt-1">{errors.defaultRate.message}</Text>}
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center mt-4"
        onPress={handleSubmit(onSubmit as any)}
      >
        <Text className="text-white font-bold text-lg">Save Vehicle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
