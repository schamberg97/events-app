import { use$ } from "@legendapp/state/react"
import { eventStore$ } from "../model"
import { View, StyleSheet } from "react-native"
import { useCallback } from "react"
import { useNavigation } from "expo-router"
import { EventCard } from "../components"
import { SafeAreaView } from "react-native-safe-area-context"


type Props = {
    index: number
}

const noop = () => {}

export const EventPage = ({index}: Props) => {
    const events = use$(eventStore$.events.get())
    const event = events[index]

    const navigation = useNavigation()
    const handleGoBack = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    return (

        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.container}>
                <EventCard isExtended onOuterPress={handleGoBack} index={index} onChooseEvent={noop} {...event}/>
            </View>
        </SafeAreaView>
    
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 300,
        flexDirection: 'row'
    },
    modalContainer: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    }
})