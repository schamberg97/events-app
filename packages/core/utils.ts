import { configureSynced, synced } from "@legendapp/state/sync"
import { observablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'
import { IS_MOBILE } from "../core"

const hasQueryStringRegex = /\?.+=/gi

export const makeSynced = (id: string) => configureSynced(synced, {
    persist: {
      plugin: IS_MOBILE ? observablePersistMMKV({id}) : new ObservablePersistLocalStorage(),
      mmkv: IS_MOBILE ? {
        id
      } : undefined
    }
  })


// TODO: параметры в query string не всегда представляют "простые" типы данных, например там можно передавать и массивы строк. Если такое понадобится - функцию надо доработать
export const addQueryStringParameters = (url: string, params: Record<string, string|null>) => {
  const keys = Object.keys(params)
  if (!keys.length) return url
  const firstAdditionSymbol = hasQueryStringRegex.test(url) ? '&' : '?'
  let queryString = firstAdditionSymbol
  const firstKey = keys.shift()
  queryString += `${firstKey}=${params[firstKey as string]}`
  keys.forEach((key) => {
    const val = params[key]
    if (!val) return
    queryString += `&${key}=${params[key]}`
  })
  return `${url}${queryString}`
}