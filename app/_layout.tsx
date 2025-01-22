import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, themes } from "@/packages/dsgn-sstm";
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { ThemeProvider, DarkTheme, DefaultTheme, useTheme } from '@react-navigation/native';

const queryClient = new QueryClient()

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <IconRegistry icons={EvaIconsPack} />
          <ApplicationProvider {...eva} theme={themes[colorScheme || 'light']}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <StatusBar style="auto" />
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="forgot-password"
                  options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="signup"
                  options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="authorized"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </ThemeProvider>
          </ApplicationProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
      <Toast />
    </>
  )

}
