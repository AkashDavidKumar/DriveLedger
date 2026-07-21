import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import { BottomTabNavigator } from './BottomTabNavigator';
import { 
  AddOwnerScreen, 
  AddVehicleScreen, 
  AddPaymentScreen, 
  PhotoViewerScreen, 
  WorkDetailsScreen,
  EditWorkScreen,
  OwnersListScreen,
  VehiclesListScreen,
  HistoryScreen
} from '../screens';

import { WorkStackNavigator } from './WorkStackNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen name="WorkStack" component={WorkStackNavigator} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: true, title: 'History' }} />
      <Stack.Group screenOptions={{ presentation: 'modal', headerShown: true }}>
        <Stack.Screen name="AddOwner" component={AddOwnerScreen} options={{ title: 'Add Owner' }} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ title: 'Add Vehicle' }} />
        <Stack.Screen name="AddPayment" component={AddPaymentScreen} options={{ title: 'Add Payment' }} />
        <Stack.Screen name="PhotoViewer" component={PhotoViewerScreen} options={{ title: 'Photo' }} />
        <Stack.Screen name="WorkDetails" component={WorkDetailsScreen} options={{ title: 'Work Details' }} />
        <Stack.Screen name="EditWork" component={EditWorkScreen} options={{ title: 'Edit Work' }} />
        <Stack.Screen name="OwnersList" component={OwnersListScreen} options={{ title: 'Manage Owners' }} />
        <Stack.Screen name="VehiclesList" component={VehiclesListScreen} options={{ title: 'Manage Vehicles' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
