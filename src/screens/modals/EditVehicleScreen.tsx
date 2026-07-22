import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VehicleSchema, VehicleFormData } from '../../models/Schemas';
import { VehicleService } from '../../services/VehicleService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

export function EditVehicleScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const vehicleId = route.params?.vehicleId;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormData & { isActive: boolean }>({
    // @ts-ignore
    resolver: zodResolver(VehicleSchema),
    defaultValues: { name: '', registrationNumber: '', type: 'Tractor', defaultPaymentMethod: 'per_day', defaultRate: 0, isActive: true }
  });

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const vehicle = await VehicleService.getVehicleById(vehicleId);
        if (vehicle) {
          reset({
            name: vehicle.name,
            registrationNumber: vehicle.registrationNumber || '',
            type: vehicle.type as any,
            defaultPaymentMethod: vehicle.defaultPaymentMethod as any,
            defaultRate: vehicle.defaultRate,
            isActive: !!vehicle.isActive
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [vehicleId, reset]);

  const onSubmit = async (data: VehicleFormData & { isActive: boolean }) => {
    try {
      await VehicleService.updateVehicle(vehicleId, data);
      Alert.alert('Success', 'Vehicle updated successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update vehicle');
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;

  return (
    <ScrollView 
      className="flex-1 bg-white dark:bg-slate-900 px-4 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
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

      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Registration Number</Text>
        <Controller
          control={control}
          name="registrationNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. TN-01-AB-1234"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
      </View>

      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Vehicle Type</Text>
        <View className="border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange} style={{ color: 'gray' }}>
                <Picker.Item label="Tractor" value="Tractor" />
                <Picker.Item label="Tipper" value="Tipper" />
                <Picker.Item label="Cultivator" value="Cultivator" />
              </Picker>
            )}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Default Payment Type</Text>
        <View className="border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
          <Controller
            control={control}
            name="defaultPaymentMethod"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange} style={{ color: 'gray' }}>
                <Picker.Item label="Per Day" value="per_day" />
                <Picker.Item label="Per Hour" value="per_hour" />
              </Picker>
            )}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Default Rate *</Text>
        <Controller
          control={control}
          name="defaultRate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-black dark:text-white"
              onBlur={onBlur}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '');
                onChange(numeric ? Number(numeric) : 0);
              }}
              value={value ? String(value) : ''}
              keyboardType="numeric"
              placeholder="e.g. 700"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
        {errors.defaultRate && <Text className="text-danger text-sm mt-1">{errors.defaultRate.message}</Text>}
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-1">Status</Text>
        <View className="border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange} style={{ color: 'gray' }}>
                <Picker.Item label="Active" value={true} />
                <Picker.Item label="Inactive" value={false} />
              </Picker>
            )}
          />
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center mb-10"
        onPress={handleSubmit(onSubmit as any)}
      >
        <Text className="text-white font-bold text-lg">Update Vehicle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
