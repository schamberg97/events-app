import { observable } from "@legendapp/state";
import { synced } from '@legendapp/state/sync'
import { API_ADDRESS, apiClient } from "../api";
import { addQueryStringParameters } from "../core";

export const EVENTS_URL = `${API_ADDRESS}/events`;

export type Geolocation = [number, number];
export type Event = {
    id: number;
    name: string;
    image: string;
    blurhash: string;
    address: string;
    geolocation: [number, number];
    description: string;
    attending: boolean;
    date: number;
}

type EventStore = {
    search?: string;
    events: Event[];
    page: number;
    endReached?: boolean;
    approximateEventsCount?: number;
    isLoading: boolean;
}

//TODO: можно доработать, чтобы после первичной загрузки - это место работало бы в офлайне
export const eventStore$ = observable<EventStore>({
    isLoading: false,
    events: synced({
        get: async () => {
            eventStore$.isLoading.set(true)
            const search = eventStore$.search.get() || null
            const url = addQueryStringParameters(EVENTS_URL, {
                page: eventStore$.page.get().toString(),
                search,
            })
            const data = await apiClient.get({url})

            eventStore$.isLoading.set(false)
            eventStore$.endReached.set(data.totalPages <= data.page)
            eventStore$.approximateEventsCount.set(data.total)

            const events : Event[] = data.items

            return events
        },
        mode: 'append',
    }),
    page: 1,
    endReached: false,
});