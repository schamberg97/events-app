import {Text} from "@ui-kitten/components";
import React from "react";
import {View} from 'react-native'
import type {ViewProps} from 'react-native'

export const Header = (props?: ViewProps): React.ReactElement => (
    <View {...props}>
      <Text category='h6'>
        Test App
      </Text>
      <Text category='s1'>
        By Nicholas Schamberg
      </Text>
    </View>
)