import { Button, Input, Layout, Text } from "@ui-kitten/components";
import React, { useCallback } from "react";
import { StyleSheet, View } from 'react-native'
import { PROFILE_URL, profileStore$, tmpProfileStore$ } from "../model";
import { useInputs } from "../hooks/useInputs";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "expo-router";
import Toast from "react-native-toast-message";
import { apiClient } from "@/packages/api";

export function Profile() {
    const navigation = useNavigation()
    const { isAbleToSendForm, ...inputProps } = useInputs({ isProfile: true, isFocused: navigation.isFocused() })
    const email = use$(tmpProfileStore$.email) || ''
    const username = use$(tmpProfileStore$.username) || ''
    const password = use$(tmpProfileStore$.password) || ''
    const repeatPassword = use$(tmpProfileStore$.repeatPassword) || ''

    const handleGoBack = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const handleSave = useCallback(() => {
        if (!isAbleToSendForm) return Toast.show({type: 'error', text1: 'Error', text2: 'Please make sure all the required fields are filled!'})
        profileStore$.assign(tmpProfileStore$.get())
    }, [isAbleToSendForm])

    return (
            <Layout style={styles.layout}>
                <View style={styles.headingContainer}>
                    <Text category="s1">
                        If you need to change your profile data, you can do it here.
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Input
                        placeholder='Email'
                        value={email}
                        style={styles.inputStyle}
                        {...inputProps.email}
                    />
                    <Input
                        placeholder='Username'
                        value={username}
                        style={styles.inputStyle}
                        {...inputProps.username}
                    />
                    <Input
                        placeholder='Password'
                        value={password}
                        style={styles.inputStyle}
                        {...inputProps.password}
                    />
                    <Input
                        placeholder='Repeat Password'
                        value={repeatPassword}
                        style={styles.inputStyle}
                        {...inputProps.repeatPassword}
                    />
                </View>

                <View
                  style={styles.footerContainer}
                >
                  <Button
                    style={styles.footerControl}
                    size='small'
                    status='basic'
                    onPressOut={handleGoBack}
                  >
                    Go back
                  </Button>
                  <Button
                    style={styles.footerControl}
                    size='small'
                    onPressOut={handleSave}
                  >
                    Save
                  </Button>
                </View>
            </Layout>
    );
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        height: '100%'
    },
    headingContainer: {
        marginTop: 16,
        paddingHorizontal: 24,
        gap: 8,
        width: '100%',
        alignItems: 'flex-start',
    },
    inputContainer: {
        flex: 1,
        marginTop: 8,
        paddingHorizontal: 24,
        alignItems: 'flex-start',
        width: '100%',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        gap: 8,
        marginTop: 16,
        marginBottom: 16,
        marginRight: 24,
    },
    footerControl: {
        marginHorizontal: 2,
    },
    inputStyle: {
        marginVertical: 4,
    },
})