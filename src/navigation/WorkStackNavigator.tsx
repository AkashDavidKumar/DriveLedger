import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WorkStackParamList } from './types';
import { StartWorkScreen, ActiveWorkScreen, FinishWorkScreen } from '../screens';

const Stack = createNativeStackNavigator<WorkStackParamList>();

export function WorkStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StartWork" component={StartWorkScreen} />
      <Stack.Screen name="ActiveWork" component={ActiveWorkScreen} />
      <Stack.Screen name="FinishWork" component={FinishWorkScreen} />
    </Stack.Navigator>
  );
}
