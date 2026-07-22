import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OwnerSchema, OwnerFormData } from '../../models/Schemas';
import { OwnerService } from '../../services/OwnerService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

export function EditOwnerScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const ownerId = route.params?.ownerId;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<OwnerFormData & { isActive: boolean }>({
    // @ts-ignore
    resolver: zodResolver(OwnerSchema),
    defaultValues: { name: '', phoneNumber: '', village: '', notes: '', isActive: true }
  });

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function loadOwner() {
      try {
        const owner = await OwnerService.getOwnerById(ownerId);
        if (owner) {
          reset({
            name: owner.name,
            phoneNumber: owner.phoneNumber || '',
            village: owner.village || '',
            notes: owner.notes || '',
            isActive: !!owner.isActive
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOwner();
  }, [ownerId, reset]);

  const onSubmit = async (data: OwnerFormData & { isActive: boolean }) => {
    try {
      await OwnerService.updateOwner(ownerId, data);
      Alert.alert('Success', 'Owner updated successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update owner');
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;

  return (
    <ScrollView 
      className="flex-1 bg-white dark:bg-slate-900 px-4 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
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
        <Text className="text-white font-bold text-lg">Update Owner</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
