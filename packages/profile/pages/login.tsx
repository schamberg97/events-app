import { Button, Card, Input, Text } from "@ui-kitten/components";
import { Link, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {StyleSheet, View} from 'react-native'
import { useInputs } from "../hooks/useInputs";
import { Header } from "../components";
import { useMutation } from "@tanstack/react-query";
import { apiClient, API_ADDRESS } from "@/packages/api";
import { makeProfileStoreReload, profileStore$ } from "../model";
import { SafeAreaView } from "react-native-safe-area-context";
import { use$ } from "@legendapp/state/react";

import type {LoginData} from '../model'
import type {ViewProps} from 'react-native'
import { IS_WEB } from "@/packages/core";

const LOGIN_URL = `${API_ADDRESS}/profile/signin/`;

export function Login() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async (loginData: LoginData) => {
      return apiClient.post({url: LOGIN_URL, body: loginData})
    },
  })

  // По факту - я не верю, что здесь нужен TanStack Query, но его использование запрашивалось в доке...
  const handleSignInAttempt = useCallback(() => {
    mutation.mutate({
      username: profileStore$.username.get(),
      password: profileStore$.password.get(),
    }, {
      onSuccess: (data) => {
        profileStore$.set(data)
        makeProfileStoreReload()
      }
    })
  }, [mutation])

  const handleGoToSignUp = useCallback(() => {
    router.push('/signup')
  }, [router])

  const Footer = useCallback((props?: ViewProps): React.ReactElement => (
    <View
      {...props}
      style={[props?.style || {}, styles.footerContainer]}
    >
      <Button
        style={styles.footerControl}
        size='small'
        status='basic'
        onPressOut={handleGoToSignUp}
      >
        Sign up
      </Button>
      <Button
        style={styles.footerControl}
        size='small'
        onPressOut={handleSignInAttempt}
      >
        Sign in
      </Button>
    </View>
  ), [handleSignInAttempt]);

  const password = use$(profileStore$.password) || ''
  const username = use$(profileStore$.username) || ''
  const inputProps = useInputs()

  return (
    <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
            <Card
                style={styles.card}
                header={Header}
                footer={Footer}
            >
              <Text category="s1">
                  Please authorize or signup to continue
              </Text>

              <View>
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

                <Text category="c1" style={styles.inputStyle}>
                  Forgot password? <Link href="/forgot-password"><Text category="c1" status="info">Click here</Text></Link>
                  
                </Text>

                {mutation.isError ? (
                  <Text category="c2" status="danger">An error occurred: {mutation.error.message}</Text>
                ) : null}
              </View>
            </Card>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    margin: 2,
    ...IS_WEB ? {
      minWidth: 600
    } : {},
    borderWidth: 0.75,
    borderColor: 'black'
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerControl: {
    marginHorizontal: 2,
  },
  inputStyle: {
    marginVertical: 4,
  },
  captionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionIcon: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  captionText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'opensans-regular',
    color: '#8F9BB3',
  },
})