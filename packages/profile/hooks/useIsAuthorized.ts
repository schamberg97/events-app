import { use$ } from "@legendapp/state/react";
import { profileStore$ } from "../model";


export function useIsAuthorized() {
    const token = use$(profileStore$.token)
    return !!token
}