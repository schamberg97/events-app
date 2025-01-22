import React from "react"
import { Pressable } from "react-native"
import {Icon} from '@ui-kitten/components'
import type { PropsWithChildren } from "react"
import type {PressableProps, ViewStyle} from "react-native"

const DEFAULT_STYLE = {
    width: 20,
    height: 20,
}

export type ButtonProps = {
    color?: string
    iconName: string
    onPress: PressableProps['onPress']
    style?: ViewStyle
}

export const IconButton = ({children, color, iconName, onPress, style = {}}: PropsWithChildren<ButtonProps>) => {
    return (
        <Pressable style={[DEFAULT_STYLE, style]} onPress={onPress}>
            <Icon
                name={iconName}
                fill={color || 'transparent'}
            />
            {children}
        </Pressable>
    )
}