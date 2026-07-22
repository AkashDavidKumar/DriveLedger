import './global.css';
import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useDbMigrations } from './src/database/db';
import { LoadingScreen, ErrorScreen } from './src/screens';

export default function App() {
  const colorScheme = useColorScheme();
  // key is used to remount the hook on retry
  const [retryKey, setRetryKey] = useState(0);

  return (
    <SafeAreaProvider>
      <AppContent key={retryKey} onRetry={() => setRetryKey(k => k + 1)} theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme} />
    </SafeAreaProvider>
  );
}

function AppContent({ onRetry, theme }: { onRetry: () => void, theme: any }) {
  const { success, error } = useDbMigrations();

  if (error) {
    return <ErrorScreen error={error.message} onRetry={onRetry} />;
  }

  if (!success) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={theme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
