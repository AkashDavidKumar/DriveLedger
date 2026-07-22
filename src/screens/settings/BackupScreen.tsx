import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { BackupService } from '../../services/BackupService';

export function BackupScreen() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const insets = useSafeAreaInsets();

  const loadBackups = useCallback(async () => {
    try {
      const b = await BackupService.listBackups();
      setBackups(b);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadBackups(); }, [loadBackups]));

  const handleCreate = async () => {
    try {
      setLoading(true);
      setLoadingMsg('Creating complete backup...');
      await BackupService.createBackup();
      await loadBackups();
      Alert.alert('Success', 'Backup created successfully!');
    } catch (e: any) {
      Alert.alert('Backup Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setLoadingMsg('Importing and validating...');
      const result = await BackupService.importBackup();
      if (!result) {
        setLoading(false);
        return;
      }
      
      const { zip, manifest } = result;

      Alert.alert(
        'Confirm Restore',
        `Imported: v${manifest.schemaVersion} Backup from ${dayjs(manifest.timestamp).format('MMM D, YYYY')}\n\n` +
        `Records:\n` +
        `- Owners: ${manifest.recordCounts.owners}\n` +
        `- Vehicles: ${manifest.recordCounts.vehicles}\n` +
        `- Work Entries: ${manifest.recordCounts.workEntries}\n\n` +
        `WARNING: This will completely replace your current app data and automatically create a safety backup. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Restore Data', 
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                setLoadingMsg('Restoring data and photos...');
                await BackupService.restoreBackup(zip);
                Alert.alert('Restore Complete', 'Your data has been fully restored. Please restart the application completely for all UI to refresh properly.', [{text: 'OK'}]);
              } catch (err: any) {
                Alert.alert('Restore Failed', err.message);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (e: any) {
      Alert.alert('Import Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (filename: string) => {
    Alert.alert('Delete Backup', 'Are you sure you want to permanently delete this local backup?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          await BackupService.deleteBackup(filename);
          await loadBackups();
        }
      }
    ]);
  };

  const handleExport = async (path: string) => {
    try {
      await BackupService.exportBackup(path);
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center p-4">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-4 text-slate-600 dark:text-slate-300 font-bold">{loadingMsg}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="p-4">
        <Text className="text-3xl font-bold text-black dark:text-white mb-2">Settings & Backup</Text>
        <Text className="text-slate-500 mb-6">Manage your local offline data safely.</Text>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            onPress={handleCreate}
            className="flex-1 bg-emerald-500 py-3 rounded-xl items-center mr-2 shadow-sm"
          >
            <Ionicons name="archive" size={20} color="white" />
            <Text className="text-white font-bold mt-1 text-sm">Create Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleImport}
            className="flex-1 bg-slate-800 py-3 rounded-xl items-center ml-2 shadow-sm"
          >
            <Ionicons name="download" size={20} color="white" />
            <Text className="text-white font-bold mt-1 text-sm">Import Zip</Text>
          </TouchableOpacity>
        </View>

        <Text className="font-bold text-slate-700 dark:text-slate-300 mb-3">Local Device Backups</Text>
      </View>

      <FlatList
        data={backups}
        keyExtractor={item => item.filename}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={<Text className="text-slate-500 text-center mt-4">No local backups found.</Text>}
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="server" size={20} color={item.filename.includes('Safety') ? '#f59e0b' : '#3b82f6'} />
              <Text className="ml-2 font-bold text-black dark:text-white flex-1 truncate">{item.filename}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-slate-500 text-xs">{dayjs(item.timestamp * 1000).format('MMM D, YYYY h:mm A')}</Text>
              <Text className="text-slate-500 text-xs">{(item.size / 1024 / 1024).toFixed(2)} MB</Text>
            </View>
            
            <View className="flex-row border-t border-slate-100 dark:border-slate-700 pt-3">
              <TouchableOpacity onPress={() => handleExport(item.path)} className="flex-1 items-center border-r border-slate-100 dark:border-slate-700">
                <Text className="text-blue-500 font-bold uppercase text-xs">Export</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.filename)} className="flex-1 items-center">
                <Text className="text-red-500 font-bold uppercase text-xs">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
