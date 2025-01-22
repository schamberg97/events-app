import { Button, Card, Text } from "@ui-kitten/components"
import { View, StyleSheet, Image, Pressable } from "react-native";
import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Blurhash } from "react-native-blurhash";

import { eventStore$ } from "../model"
import { useMutation } from "@tanstack/react-query";
import { API_ADDRESS, apiClient } from "@/packages/api";
import Toast from "react-native-toast-message";
import QRCode from "react-native-qrcode-svg";

const CHANGE_ATTENDANCE = 'change-attendance'
const ATTENDANCE_CODE = 'attendance-code'
const QR_CODE_SIZE = 200

const makeOperationURL = (eventId: number | string, operation: string) => `${API_ADDRESS}/events/${eventId}/${operation}`

export type EventCardProps = {
    index: number
    onChooseEvent: (index: number) => void
    isExtended?: boolean
    onOuterPress?: (index: number) => void
}
function EventCardUnmemo({onChooseEvent, index, isExtended, onOuterPress}: EventCardProps) {

    const event = eventStore$.events.get()[index]
    const attendingMutation = useMutation({
        mutationFn: async (attending: boolean) => {
            return apiClient.post({ url: makeOperationURL(event.id, CHANGE_ATTENDANCE), body: {attending} })
        },
    })
    const formattedDate = useMemo(() => dayjs.unix(event.date).format('DD.MM.YYYY HH:mm'), [event.date])
    const [attendanceCode, setAttendanceCode] = useState<null|string>(null)
    const [isImageReady, setIsImageReady] = useState(false)

    useEffect(() => {
       
        (async () => {
            if (event.attending) {
                try {
                    const data = await apiClient.get({url: makeOperationURL(event.id, ATTENDANCE_CODE)})
                    console.log(data)
                    setAttendanceCode(data.code)
                } catch (err) {
                    //@ts-expect-error TODO: исправить
                    Toast.show({type: 'error', text1: 'Error', text2: err.message})
                }
                
            } else {
                setAttendanceCode(null)
            }
        })();
        
        
    }, [event.attending])

    const handlePress = useCallback(() => {
        onChooseEvent(index)
    }, [onChooseEvent, index])

    const handleAlternativePress = useCallback(() => {
        const fn = onOuterPress || onChooseEvent
        fn(index)
    }, [onOuterPress, onChooseEvent, index])

    useEffect(() => {
        // handling ошибок максимально примитивный - если проблема с изображением - лучше оставим blurhash
        Image.prefetch(event.image).then(() => {
            setIsImageReady(true)
        }).catch((e) => {
            setIsImageReady(false)
        })
    }, [event.image])

    const handleChangeAttendanceStatus = useCallback(() => {
        const newState = !eventStore$.events[index].attending.get()
        attendingMutation.mutate(newState, {
            onError: (err) => {
                Toast.show({type: 'error', text1: 'Error', text2: err.message})
            },
            onSuccess: () => {
                // изменение локального стейта
                const events = eventStore$.events.get()
                const newEvents = [...events];
                newEvents[index].attending = newState
                eventStore$.events.set(newEvents)
            }
        })
    }, [attendingMutation])

    const Footer = useCallback(() => {
        return (
            <View
              style={styles.footerContainer}
            >
                <Button
                    style={styles.footerControl}
                    size='small'
                    status='basic'
                    onPressOut={handleAlternativePress}
                >
                    Go back
                </Button>
              <Button
                style={styles.footerControl}
                size='small'
                onPressOut={handleChangeAttendanceStatus}
              >
                {event.attending ? "Cancel attendance" : "Attend" }
              </Button>
            </View>
        )
    }, [styles])

    return (
        <Pressable onPress={handleAlternativePress}>
            <Card
                style={styles.card}
                onPress={handlePress}
                footer={isExtended ? Footer : undefined}
            >
                <View style={styles.container}>
                    <Text category="h5">{event.name}</Text>
                    <Image source={{uri: event.image}} style={isImageReady ? styles.image : styles.imageNotReady}/>
                    {!isImageReady 
                        ? <Blurhash blurhash={event.blurhash} style={styles.image}/>
                        : null
                    }
                </View>
                <View style={styles.container}>
                    <View style={isExtended ? styles.extendedDataSection : styles.dataSection}>
                        <View style={styles.container}>
                            <Text category="c1" style={styles.textBold}>Date: </Text>
                            <Text category="c1">{formattedDate}</Text>
                        </View>
                        <View style={styles.container}>
                            <Text category="c1" style={styles.textBold}>Description: </Text>
                            <Text numberOfLines={5} category="c1">{event.description}</Text>
                        </View>
                        <View style={styles.container}>
                            <Text category="c1" style={styles.textBold}>Address: </Text>
                            <Text numberOfLines={5} category="c1">{event.address}</Text>
                        </View>

                        <View style={[styles.container, styles.marginTopEight]}>
                            <Text category="c1" style={styles.textBold}>Attending: </Text>
                            <Text numberOfLines={5} category="c1">{event.attending ? 'Yes' : 'No'}</Text>
                        </View>
                        {isExtended && attendanceCode ? 
                            <View style={[styles.qrCodeContainer, styles.marginTopEight]}>
                                <Text category="s1" style={styles.textBold}>To attend this event, please show the QR code below at the venue</Text>
                                <QRCode
                                  size={QR_CODE_SIZE}
                                  value={attendanceCode}
                                />
                            </View> 
                        : null}
                    </View>
                </View>
            </Card>
        </Pressable>
    )
}

export const EventCard = memo(EventCardUnmemo)

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
        marginBottom: 8,
        borderWidth: 1.25,
        borderRadius: 15,
        borderColor: 'black',
        width: '98%', // визуально понравилось так
        alignSelf: 'center',
    },
    image: {
        width: '100%',
        minHeight: 150,
        paddingTop: 10,
    },
    imageNotReady: {
        position: 'absolute',
        top: 900
    },
    container: {
        
    },
    qrCodeContainer: {
        gap: 8,
    },
    dataSection: {
        width: '100%',
        paddingTop: 10,
        gap: 4,
    },
    extendedDataSection: {
        minHeight: 200,
        width: '100%',
        paddingTop: 10,
        gap: 4,
    },
    imageSection: {
        width: '58%',
        marginTop: 10,
        minHeight: 200,
    },
    textBold: {
        fontWeight: 'bold'
    },
    marginTopEight: {
        marginTop: 8
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
})