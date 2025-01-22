import { EventPage } from "@/packages/events";
import { useLocalSearchParams } from "expo-router";

export default function EventIdPage() {
    const { index } = useLocalSearchParams();
    return <EventPage index={parseInt(index.toString())}/>
}