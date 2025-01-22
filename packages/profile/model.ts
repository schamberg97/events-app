import { observable, observe, syncState } from "@legendapp/state";
import { syncObservable } from '@legendapp/state/sync'
import { API_ADDRESS, apiClient } from "../api";
import Toast from "react-native-toast-message";
import { makeSynced } from "../core";

export const PROFILE_URL = `${API_ADDRESS}/profile/`;

export type LoginData = {
  username?: string | null;
  password?: string | null;
}

export type EmailData = {
  email?: string | null;
}

export type SignupData = LoginData & EmailData & {
  repeatPassword?: string | null;
}

export type ProfileData = SignupData & {
  /**
   * На вебе токен лучше хранить в Cookie с флагом HTTPOnly, т.к. этот токен доступен только серверу, 
   * но не доступен JS коду, но делать отдельную авторизацию для веба мы пока не будем ;)
   */
  token?: string | null;
  triggerProfileReload?: boolean;
}

export const profileStore$ = observable<ProfileData>({
  token: makeSynced('profile')({
    initial: null,
    persist: {
      name: 'token'
    },
  }),
  username: makeSynced('profile')({
    initial: null,
    persist: {
        name: 'username'
    }
  }),
  email: makeSynced('profile')({
    initial: null,
    persist: {
        name: 'email'
    }
  }),
  password: '',
  repeatPassword: '',
  triggerProfileReload: false,
});

export const tmpProfileStore$ = observable<ProfileData>({
  username: '',
  email: '',
  password: '',
  repeatPassword: '',
})

// Синхроизируем с сервером модель пользовательских данных
syncObservable<ProfileData>(profileStore$,
  {
      get: async ({value, mode, refresh}) => {
        if (value.token) {
            try {
                const data = await apiClient.get({url: PROFILE_URL});
                const state = {
                  token: data.token || value.token, // ability to refresh token in the future, not sure about security
                  username: data.username,
                  email: data.email,
                }
                return state
            } catch (err) {
              return value
            }
        }
        // на случай если сервер умер - локальная копия для нас - ок, чтобы избежать retry
        return value
      },
      set: async ({ value, update }) => {
          const {token, triggerProfileReload} = value
          if (triggerProfileReload) {
            const data = await apiClient.get({url: PROFILE_URL});
            return update({
              value: {
                triggerProfileReload: false,
                ...data,
                token: data.token || value.token
              }
            })
          }
          if (!token) {
            return update({value})
          }
          // если есть token - мы залогинены, значит надо синхронизировать изменения с сервером
          try {
            const data = await apiClient.post({url: PROFILE_URL, body: value});
            const newState = {
              ...data,
              token: data.token || profileStore$.token.get()
            }
            
            update({value: newState})
          } catch (err) {
            // @ts-expect-error: TODO: должно быть сделано получше
            if (err.statusCode === 401) {
              // @ts-expect-error: TODO: должно быть сделано получше, UI не должен дергаться отсюда
              Toast.show({type: 'error', text1: 'Error', text2: err.message})
            }
            throw err
          }
          
      },
      mode: 'set',
      subscribe: ({ update }) => {
        // в идеале тут бы websockets использовать
        const timer = setInterval(async () => {
          const token = profileStore$.token.get()
          if (!token) {
            return
          }
          const data = await apiClient.get({url: PROFILE_URL});
          return update({
            value: {
              triggerProfileReload: false,
              ...data,
              token: data.token || token
            }
          })
        }, 20000)
        return () => {
          clearInterval(timer)
        }
      },
      // если сервер не отвечает, то пробуем синхронизировать данные вновь, актуально в нашем случае для set
      retry: {
        times: 3,
        delay: 30,
        backoff: 'exponential',
        maxDelay: 600
      },
      debounceSet: 100,
      
  }
)

export const makeProfileStoreReload = () => profileStore$.triggerProfileReload.set(true)