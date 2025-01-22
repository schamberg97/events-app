import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { useNavigation } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from 'react-native'
import { profileStore$ } from "../model";
import { useInputs } from "../hooks/useInputs";
import { useMutation } from "@tanstack/react-query";
import { apiClient, API_ADDRESS } from "@/packages/api";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { use$ } from "@legendapp/state/react"

import type { SignupData } from '../model'

const SIGNUP_URL = `${API_ADDRESS}/profile/signup/`;
const AnimatedLayout = Animated.createAnimatedComponent(Layout)

export function Signup() {
    const mutation = useMutation({
        mutationFn: async (email: SignupData) => {
            return apiClient.post({ url: SIGNUP_URL, body: email })
        },
    })

    const email = use$(profileStore$.email) || ''
    const username = use$(profileStore$.username) || ''
    const password = use$(profileStore$.password) || ''
    const repeatPassword = use$(profileStore$.repeatPassword) || ''
    const {isAbleToSendForm, ...inputProps} = useInputs({isSignup: true})

    const navigation = useNavigation()
    const handleGoBack = useCallback(() => {
        profileStore$.set({
            email: '',
            password: '',
            repeatPassword: '',
            username: '',
        })
        navigation.goBack()
    }, [navigation])

    const handleSignupAttempt = useCallback(() => {
        if (!isAbleToSendForm) {
            return Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please make sure that all fields are filled in'
            })
        }
        mutation.mutate({ email, username, password }, {
            onError: (err) => {
                Toast.show({type: 'error', text1: 'Error', text2: err.message})
            },
            onSuccess: () => {
                navigation.goBack()
                // TODO: костыль связанный с не совсем корректной работой выбранной библиотекой тостов
                setTimeout(() => {
                    Toast.show({type: 'success', text1: 'Success', text2: 'We have successfully signed you up!'})
                }, 500)
                
            }
        })
    }, [mutation, navigation, email, username, password, isAbleToSendForm])
    
    return (
        <AnimatedLayout
            entering={FadeIn}
            style={styles.screenContainer}
        >
            {/* Dismiss modal when pressing outside */}
            <Pressable onPressIn={handleGoBack} style={StyleSheet.absoluteFill} />
            {/* Внизу можно было бы использовать Card из UI Kitten, но я не захотел */}
            <AnimatedLayout
                entering={SlideInDown}
                style={styles.modalContainer}
            >
                
                    <View style={styles.headingContainer}>
                        <Text category="h6">
                            Signup
                        </Text>

                        <Text category="s1">
                            Welcome to our service! Please fill out the form below to signup
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

                {mutation.isError ? (
                    <Text category="c2" status="danger">An error occurred: {mutation.error.message}</Text>
                ) : null}

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
                    onPressOut={handleSignupAttempt}
                  >
                    Signup
                  </Button>
                </View>
                
            </AnimatedLayout>
            {
                // В модалке Expo Router - Toast работает странно, если его не продублировать в самой модалке
            }
            <Toast/>
        </AnimatedLayout>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000040',
        flex: 1,
    },
    modalContainer: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    contentContainer: {
        flex: 1,
        marginVertical: 16,
        marginHorizontal: 8,
    },
    headingContainer: {
        marginTop: 16,
        paddingHorizontal: 24,
        gap: 8,
        width: '100%',
        alignItems: 'flex-start',
    },
    inputContainer: {
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