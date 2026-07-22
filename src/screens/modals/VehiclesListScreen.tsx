import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { VehicleService } from '../../services/VehicleService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export function VehiclesListScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const loadVehicles = useCallback(async () => {
    try {
      const data = await VehicleService.getVehicles();
      setVehicles(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to delete this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await VehicleService.softDeleteVehicle(id);
        loadVehicles();
      }}
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 px-4 pt-4">
      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No vehicles found</Text>}
        renderItem={({ item }) => (
          <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-lg font-bold text-black dark:text-white mr-2">{item.name}</Text>
                <Text className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded overflow-hidden text-slate-800 dark:text-slate-200">
                  {item.type}
                </Text>
              </View>
              <Text className="text-slate-500 mb-2">{item.registrationNumber || 'No Reg. Number'}</Text>
              <Text className="text-emerald-600 dark:text-emerald-400 font-medium">Default: {item.defaultRate} ({item.defaultPaymentMethod.replace('_', ' ')})</Text>
            </View>
            <View className="flex-row items-center pl-2">
              <TouchableOpacity onPress={() => navigation.navigate('EditVehicle', { vehicleId: item.id })} className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-2">
                <Ionicons name="pencil" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        className="absolute right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ bottom: Math.max(insets.bottom + 24, 24) }}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
