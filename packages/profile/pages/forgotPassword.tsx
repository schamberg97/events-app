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
import { isEmail } from "multiform-validator";
import { use$ } from "@legendapp/state/react";

import type { EmailData } from '../model'

const AnimatedLayout = Animated.createAnimatedComponent(Layout)

const RESET_PASS_URL = `${API_ADDRESS}/profile/reset-password/`;

export function ForgotPassword() {
    const mutation = useMutation({
        mutationFn: async (email: EmailData) => {
            return apiClient.post({ url: RESET_PASS_URL, body: email })
        },
    })

    const email = use$(profileStore$.email) || ''
    const inputProps = useInputs()

    const navigation = useNavigation()
    const handleGoBack = useCallback(() => {
        profileStore$.email.set('')
        navigation.goBack()
    }, [navigation])

    const handleResetPassword = useCallback(() => {
        const isValidEmail = email.length > 0 && isEmail(email)
        if (!isValidEmail) {
            return Toast.show({type: 'error', text1: 'Error', text2: "Email is not valid!"})
        }
        mutation.mutate({ email }, {
            onError: (err) => {
                Toast.show({type: 'error', text1: 'Error', text2: err.message})
            },
            onSuccess: () => {
                Toast.show({type: 'success', text1: 'Success', text2: 'We have sent you an email, if specified email exists in our database'})
            }
        })
    }, [mutation, email])

    return (
        <Animated.View
            entering={FadeIn}
            style={styles.screenContainer}
        >
            {/* Dismiss modal when pressing outside */}
            <Pressable onPressIn={handleGoBack} style={StyleSheet.absoluteFill} />
            <AnimatedLayout
                entering={SlideInDown}
                style={styles.modalContainer}
            >
                
                <View style={styles.headingContainer}>
                    <Text category="h6">
                        We are sorry to hear that you have lost access to your account!
                    </Text>

                    <Text category="s1">
                        Please provide your email and we will send you a message, containing account recovery details
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Input
                      placeholder='name@example.com'
                      value={email}
                      style={styles.inputStyle}
                      {...inputProps.email}
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
                    onPressOut={handleResetPassword}
                  >
                    Reset
                  </Button>
                </View>
                
            </AnimatedLayout>
            {
                // В модалке Expo Router - Toast работает странно, если его не продублировать в самой модалке
            }
            <Toast/>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000040',
    },
    modalContainer: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'flex-start',
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