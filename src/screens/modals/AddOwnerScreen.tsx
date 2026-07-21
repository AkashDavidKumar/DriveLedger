import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OwnerSchema, OwnerFormData } from '../../models/Schemas';
import { OwnerService } from '../../services/OwnerService';
import { useNavigation } from '@react-navigation/native';

export function AddOwnerScreen() {
  const navigation = useNavigation();
  const { control, handleSubmit, formState: { errors } } = useForm<OwnerFormData>({
    resolver: zodResolver(OwnerSchema),
    defaultValues: { name: '', phoneNumber: '', village: '', notes: '' }
  });

  const onSubmit = async (data: OwnerFormData) => {
    try {
      await OwnerService.createOwner(data);
      Alert.alert('Success', 'Owner added successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save owner');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900 p-4">
      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Owner Name"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
        {errors.name && <Text className="text-danger text-sm mt-1">{errors.name.message}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</Text>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="phone-pad"
              placeholder="e.g. 9876543210"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
      </View>

      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Village</Text>
        <Controller
          control={control}
          name="village"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Village Name"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={3}
              placeholder="Any additional notes..."
              placeholderTextColor="#94a3b8"
            />
          )}
        />
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-white font-bold text-lg">Save Owner</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
