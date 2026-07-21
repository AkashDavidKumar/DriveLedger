import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { OwnerService } from '../../services/OwnerService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export function OwnersListScreen() {
  const [owners, setOwners] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation<any>();

  const loadOwners = useCallback(async () => {
    try {
      const data = await OwnerService.getActiveOwners(search);
      setOwners(data);
    } catch (e) {
      console.error(e);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadOwners();
    }, [loadOwners])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Owner', 'Are you sure you want to delete this owner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await OwnerService.softDeleteOwner(id);
        loadOwners();
      }}
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 p-4">
      <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 mb-4">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput 
          className="flex-1 ml-2 text-black dark:text-white"
          placeholder="Search owners..."
          placeholderTextColor="gray"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={owners}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No owners found</Text>}
        renderItem={({ item }) => (
          <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm">
            <View>
              <Text className="text-lg font-bold text-black dark:text-white">{item.name}</Text>
              {item.phoneNumber && <Text className="text-slate-500">{item.phoneNumber}</Text>}
              {item.village && <Text className="text-slate-500">{item.village}</Text>}
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('AddOwner')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
