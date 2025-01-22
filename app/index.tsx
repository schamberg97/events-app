import { Login, useIsAuthorized } from "@/packages/profile";
import { Redirect } from "expo-router";
import {ActivityIndicator, StyleSheet, View, ImageBackground} from 'react-native'

const image = require('../assets/images/railways.jpg')

export default function Index() {

  const isAuthorized = useIsAuthorized()

  if (isAuthorized === false) {
    return (
    <ImageBackground source={image} style={{width: '100%', height: '100%'}}>
      <Login/>
    </ImageBackground>)
  }

  if (isAuthorized === null) {
    return (<View
      style={styles.view}
    >
      <ActivityIndicator size="large" />
    </View>)
  }

  return (
    <Redirect href="/authorized/events"></Redirect>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
})