import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, useColorScheme, FlatList, ListRenderItemInfo } from "react-native";
import { use$ } from "@legendapp/state/react";
import { eventStore$ } from "../model";
import { IconButton } from "@/packages/dsgn-sstm";
import { useCallback, useState } from "react";
import { EventCard } from "../components/EventCard";
import type { Event } from "../model";
import { useRouter } from "expo-router";

export function Events() {
    const [searchInputValue, setSearchInputValue] = useState(eventStore$.search.get())
    const handleSearchInput = useCallback((value: string) => {
        setSearchInputValue(value)
    }, [setSearchInputValue])
    

    const handleSearchButtonPress = useCallback(() => {
        const previous = eventStore$.search.get()
        if (previous !== searchInputValue) {
            eventStore$.set({
                search: searchInputValue,
                page: 1,
                events: [],
                isLoading: false,
            })
        }
        
    }, [searchInputValue])

    const events = use$(eventStore$.events)

    const router = useRouter()

    const handleChooseEvent = useCallback((index: number) => {
        router.push(`/authorized/events/${index}`)
    }, [router])

    const renderItem = useCallback(
        ({ index }: ListRenderItemInfo<Event>) => {
            return (
                <EventCard index={index} onChooseEvent={handleChooseEvent} />
            )
        },
        [handleChooseEvent],
    )

    const handleRefresh = useCallback(() => {
        
    }, [])

    const handleEndReached = useCallback(() => {
        if (!eventStore$.endReached.get() && !eventStore$.isLoading.get()) eventStore$.page.set(page => page + 1)
    }, [])

    const colorScheme = useColorScheme();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style={colorScheme === "light" ? 'dark' : 'light'} />
            <View style={styles.searchContainer}>
                <Input
                    status="primary"
                    placeholder='Search events'
                    value={searchInputValue}
                    style={styles.inputStyle}
                    onChangeText={handleSearchInput}
                />
                <IconButton style={styles.searchButtonStyle} iconName='search' color='blue' onPress={handleSearchButtonPress} />
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    // имхо визуально портит
                    showsVerticalScrollIndicator={false}
                    data={events}
                    renderItem={renderItem}
                    onEndReachedThreshold={0.75}
                    onEndReached={handleEndReached}
                    initialNumToRender={12}
                    windowSize={30}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 8,
        alignSelf: 'center',
    },
    inputStyle: {
        marginLeft: 16,
        width: '80%',
    },
    searchButtonStyle: {
        width: 40,
        height: 40,
    },
    listContainer: {
        marginTop: 16,
        flex: 1,
    },
    contentContainer: {
        alignItems: 'center',
    }
})