import { Icon, Text } from "@ui-kitten/components";
import React, { useCallback, useEffect, useState } from "react";
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native'
import { profileStore$, tmpProfileStore$ } from "../model";
import { useColorScheme, themes } from "@/packages/dsgn-sstm";
import { isEmail } from "multiform-validator";
import type {ImageProps} from 'react-native'
import type {IconElement, IconProps, InputProps} from "@ui-kitten/components";

const MINIMUM_PASSWORD_LENGTH = 8;
const MINIMUM_USERNAME_LENGTH = 3;

const AlertIcon = (props: IconProps): IconElement => {
  const colorScheme = useColorScheme();
  const theme = themes[colorScheme || 'light'];

  return (
    <View>
      <Icon
        {...props}
        fill={theme['color-danger-700']}
        width={14}
        height={14}
        name='alert-circle-outline'
      />
    </View>
)};

type CaptionTextProps = {
  text: string
}

const CaptionText = ({text}: CaptionTextProps) => (
  <View style={styles.captionContainer}>
    {AlertIcon(styles.captionIcon)}
    <Text style={styles.captionText} status="danger">
      {text}
    </Text>
  </View>
)

type UseInputsProps = {
  isSignup?: boolean
  isProfile?: boolean
  isFocused?: boolean
}

type UseInputsOutput = {
  password: InputProps
  repeatPassword: InputProps
  username: InputProps
  email: InputProps
  // Используется на регистрации и редактировании профиля
  isAbleToSendForm: boolean
}

export const useInputs = ({isSignup, isProfile, isFocused}: UseInputsProps = {}) : UseInputsOutput => {
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const toggleSecureEntry = (): void => {
      setSecureTextEntry(!secureTextEntry);
    };

    const secureRenderIcon = (props?: ImageProps): React.ReactElement => (
      <TouchableWithoutFeedback onPress={toggleSecureEntry}>
        <Icon
          {...props}
          name={secureTextEntry ? 'eye-off' : 'eye'}
        />
      </TouchableWithoutFeedback>
    );

    useEffect(() => {
      // заполняем временный state состоянием основного инстанса профиля, но только когда экран в фокусе
      if (isProfile && isFocused) {
        // destructuting нужен, т.к. мы НЕ хотим хранить один и тот же объект в двух разных хранилищах.
        tmpProfileStore$.set({...profileStore$.get()})
      }
    }, [isProfile, isFocused])

    const initialValidityValue = isProfile ? true : null

    const [isPasswordValid, setIsPasswordValid] = useState<null|boolean>(initialValidityValue);
    const [isRepeatPasswordValid, setIsRepeatPasswordValid] = useState<null|boolean>(initialValidityValue);
    const [isEmailValid, setIsEmailValid] = useState<null|boolean>(initialValidityValue);
    const [isUsernameValid, setIsUsernameValid] = useState<null|boolean>(initialValidityValue);

    const secureRenderCaptionPasswordLength = useCallback((): React.ReactElement => {
      if (typeof isPasswordValid !== 'boolean' || isPasswordValid) return <></>
      return (
        <CaptionText text={`Should contain at least ${MINIMUM_PASSWORD_LENGTH} symbols`}/>
      );
    }, [isPasswordValid]);

    const secureRenderCaptionPasswordMatch = useCallback((): React.ReactElement => {
      if (typeof isRepeatPasswordValid !== 'boolean' || isRepeatPasswordValid) return <></>
      return (
        <CaptionText text="Passwords should match"/>
      );
    }, [isRepeatPasswordValid]);

    const captionEmailValidation = useCallback((): React.ReactElement => {
      if (typeof isEmailValid !== 'boolean' || isEmailValid) return <></>
      return (
        <CaptionText text="Email should be valid"/>
      );
    }, [isEmailValid]);

    const captionUsernameValidation = useCallback((): React.ReactElement => {
      if (typeof isUsernameValid !== 'boolean' || isUsernameValid) return <></>
      return (
        <CaptionText text={`Should contain at least ${MINIMUM_USERNAME_LENGTH} symbols`}/>
      );
    }, [isUsernameValid]);

    const onChangeUsername = useCallback((value: string) => {
      (isProfile ? tmpProfileStore$ : profileStore$).username.set(value)
      if (isSignup || isProfile) {
        setIsUsernameValid(value.length >= MINIMUM_USERNAME_LENGTH)
      }
    }, [setIsUsernameValid, isProfile, isSignup])

    const onChangePassword = useCallback((value: string) => {
      const store$ = isProfile ? tmpProfileStore$ : profileStore$
      store$.password.set(value)
      if (isProfile) {
        const repeatPassword = store$.repeatPassword.get()
        if (value.length === 0 && typeof repeatPassword === 'string' && repeatPassword.length === 0) {
          setIsPasswordValid(true)
          return setIsRepeatPasswordValid(true)
        }
      }
      if (isSignup || isProfile) {
        setIsPasswordValid(value.length >= MINIMUM_PASSWORD_LENGTH)
      }
    }, [setIsPasswordValid, isSignup, isProfile])

    const onChangeRepeatPassword = useCallback((value: string) => {
      const store$ = isProfile ? tmpProfileStore$ : profileStore$
      store$.repeatPassword.set(value)
      if (isProfile) {
        const password = store$.password.get()
        if (value.length === 0 && typeof password === 'string' && password.length === 0) {
          setIsPasswordValid(true)
          return setIsRepeatPasswordValid(true)
        }
      }
      if (isSignup || isProfile) {
        setIsRepeatPasswordValid(store$.password.get() === value)
      }
    }, [setIsRepeatPasswordValid, isSignup, isProfile])

    const onChangeEmail = useCallback((value: string) => {
      (isProfile ? tmpProfileStore$ : profileStore$).email.set(value)
      if (isSignup || isProfile) {
        if (!value) {
         return setIsEmailValid(false)
        }
        setIsEmailValid(isEmail(value || ''))
      }
    }, [isProfile, isSignup, setIsEmailValid])

    return {
      password: {
        onChangeText: onChangePassword,
        accessoryRight: secureRenderIcon,
        secureTextEntry,
        caption: isSignup || isProfile ? secureRenderCaptionPasswordLength : undefined,
        autoCapitalize: 'none'
      },
      repeatPassword: {
        onChangeText: onChangeRepeatPassword,
        //TODO: для повторного ввода пароля было бы неплохо securtTextEntry сделать независимым. Но это было скучно делать
        accessoryRight: secureRenderIcon,
        secureTextEntry,
        caption: isSignup || isProfile ? secureRenderCaptionPasswordMatch : undefined,
        autoCapitalize: 'none'
      },
      username: {
        onChangeText: onChangeUsername,
        autoCapitalize: 'none',
        caption: isSignup || isProfile ? captionUsernameValidation : undefined,
      },
      email: {
        onChangeText: onChangeEmail,
        autoCapitalize: 'none',
        caption: isSignup || isProfile ? captionEmailValidation : undefined,
      },
      isAbleToSendForm: (!!isSignup || !!isProfile) && !!isUsernameValid && !!isPasswordValid && !!isRepeatPasswordValid && !!isEmailValid,
    }
}

const styles = StyleSheet.create({
  captionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
  },
})