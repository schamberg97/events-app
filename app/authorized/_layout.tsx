import React, { useCallback, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import { View, StyleSheet, useColorScheme } from 'react-native';

import { IconButton, themes } from '@/packages/dsgn-sstm';
import { profileStore$, useIsAuthorized } from '@/packages/profile';

export const unstable_settings = {
    initialRouteName: 'events',
  };

export default function AuthorizedLayout() {
    const router = useRouter()
    const isAuthorized = useIsAuthorized()
    const handleLogout = useCallback(() => {
        profileStore$.delete()
        profileStore$.set({})
    }, [])

    useEffect(() => {
        if (!isAuthorized && isAuthorized !== null) {
            router.replace('/')
        }
    }, [isAuthorized, router])

    const colorScheme = useColorScheme();
    const theme = themes[colorScheme || 'light']

    return (
        <>
            <StatusBar style="dark" />
            <Tabs>
                <Tabs.Screen name="events" options={{
                      headerShown: false,
                      title: "Events",
                      tabBarIcon: ({ color }) => <FontAwesome size={20} name="calendar" color={color} />
                }}/>
                <Tabs.Screen name="profile" options={{
                      headerShown: true,
                      headerRight: () => {
                        return <View>
                            <IconButton style={styles.logoutButton} onPress={handleLogout} iconName="log-out" color={theme['color-danger-500']}/>
                        </View>
                      },
                      title: "Profile",
                      tabBarIcon: ({ color }) => <Feather size={20} name="user" color={color} />
                }}/>
            </Tabs>
        </>
    )
};

const styles = StyleSheet.create({
    logoutButton: {
        width: 20,
        height: 20,
    },
})