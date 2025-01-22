import React from "react";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function EventsLayout() {

  return (      
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen
        name="[index]"
        options={{
          //presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
    </Stack>
  )

}
