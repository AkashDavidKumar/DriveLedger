import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const Placeholder = ({ name }: { name: string }) => (
  <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
    <Text className="text-primary dark:text-white text-xl font-bold">{name}</Text>
  </View>
);

export * from './DashboardScreen';
export * from './work/HistoryScreen';
export * from './calendar/CalendarScreen';
export * from './reports/ReportsScreen';
export * from './salary/SalaryScreen';
export * from './settings/BackupScreen';

export * from './work/StartWorkScreen';
export * from './work/ActiveWorkScreen';
export * from './work/FinishWorkScreen';

export * from './modals/AddOwnerScreen';
export * from './modals/AddVehicleScreen';
export * from './salary/AddPaymentScreen';
export const PhotoViewerScreen = () => <Placeholder name="Photo Viewer" />;
export * from './work/WorkDetailsScreen';
export * from './work/EditWorkScreen';

export * from './modals/OwnersListScreen';
export * from './modals/VehiclesListScreen';

export const LoadingScreen = () => (
  <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
    <ActivityIndicator size="large" color="#10b981" />
    <Text className="text-slate-600 dark:text-slate-300 mt-4">Initializing Database...</Text>
  </View>
);

export const ErrorScreen = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-6">
    <Text className="text-danger text-2xl font-bold mb-2">Startup Error</Text>
    <Text className="text-slate-600 dark:text-slate-300 text-center mb-6">{error}</Text>
  </View>
);
