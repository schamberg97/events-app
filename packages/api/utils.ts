//TODO: не нравятся перекрестные зависимости
import { profileStore$ } from "../profile/model";
import { API_ADDRESS } from "./constants";

type RequestData<Body=unknown> = {
    body?: Body,
    url: string,
    headers?: unknown,
    method: string
}

export async function makeJSONRequest<Body = unknown>({body, url, headers, method}: RequestData<Body>) {
    // Хотелось бы использовать startsWith, но видимо его еше нет в hermes
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
        if (url.indexOf('/') !== 0) url = '/' + url;
        url = API_ADDRESS + url;
    }

    const authToken = profileStore$.token.get()
    const response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            ...(headers || {}),
        }
    })
    const json = await response.json();
    if (response.status === 200) return json.data;
    // TODO: не очень хорошая история, в идеале должно быть сделано иначе
    const err = new Error(json.error);
    //@ts-expect-error: Лениво тут исправлять типизацию
    err.statusCode = response.status;
    throw err;
}

function makeMethodClosure(method: string) {
    return function<Body = unknown>({url, body, headers}: Omit<RequestData<Body>, 'method'>) {
        return makeJSONRequest({url, body, method, headers});
    } 
}

export const apiClient = {
    get: makeMethodClosure('GET'),
    post: makeMethodClosure('POST'),
    put: makeMethodClosure('PUT'),
    delete: makeMethodClosure('DELETE'),
}
