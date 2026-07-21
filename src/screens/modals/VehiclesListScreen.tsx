import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { VehicleService } from '../../services/VehicleService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export function VehiclesListScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const navigation = useNavigation<any>();

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

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 p-4">
      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No vehicles found</Text>}
        renderItem={({ item }) => (
          <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-bold text-black dark:text-white">{item.name}</Text>
              <Text className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded overflow-hidden text-slate-800 dark:text-slate-200">
                {item.type}
              </Text>
            </View>
            <Text className="text-slate-500 mb-2">{item.registrationNumber || 'No Reg. Number'}</Text>
            <Text className="text-emerald-600 dark:text-emerald-400 font-medium">Default: {item.defaultRate} ({item.defaultPaymentMethod.replace('_', ' ')})</Text>
          </View>
        )}
      />

      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
