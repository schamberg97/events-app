import { Platform } from "react-native";

export const IS_MOBILE = Platform.OS === 'ios' || Platform.OS === 'android'
export const IS_WEB = Platform.OS === 'web'