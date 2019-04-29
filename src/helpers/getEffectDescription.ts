import * as is from "@redux-saga/is"
import { Effect } from "@redux-saga/types"

import * as effectTypes from "../constants"

function getEffectDescription(effect: Effect | any[] | IterableIterator<any> | Promise<any>) {
  if (!effect) return effectTypes.UNKNOWN

  if ((effect as any).root) return (effect as any).saga.name // TODO: Better typing
  if (is.iterator(effect)) {
    return (effect as any).name || effectTypes.UNKNOWN
  }
  if (is.array(effect)) return null
  if (is.promise(effect)) {
    let display: string
    if ((effect as any).name) {
      // a promise object with a manually set name prop for display reasons
      display = `${effectTypes.PROMISE}(${(effect as any).name})`
    } else if (effect.constructor instanceof Promise.constructor) {
      // an anonymous promise
      display = effectTypes.PROMISE
    } else {
      // class which extends Promise, so output the name of the class to precise
      display = `${effectTypes.PROMISE}(${effect.constructor.name})`
    }
    return display
  }
  if (is.effect(effect)) {
    const { type, payload: data } = effect as Effect
    if (type === effectTypes.TAKE) {
      return data.pattern || "channel"
    } else if (type === effectTypes.PUT) {
      return data.channel ? data.action : data.action.type
    } else if (type === effectTypes.ALL) {
      return null
    } else if (type === effectTypes.RACE) {
      return null
    } else if (type === effectTypes.CALL) {
      return !data.fn.name || data.fn.name.trim() === "" ? "(anonymous)" : data.fn.name
    } else if (type === effectTypes.CPS) {
      return data.fn.name
    } else if (type === effectTypes.FORK) {
      return data.fn.name
    } else if (type === effectTypes.JOIN) {
      return data.name
    } else if (type === effectTypes.CANCEL) {
      return data.name
    } else if (type === effectTypes.SELECT) {
      return data.selector.name
    } else if (type === effectTypes.ACTION_CHANNEL) {
      return data.buffer == null ? data.pattern : data
    } else if (type === effectTypes.CANCELLED) {
      return null
    } else if (type === effectTypes.FLUSH) {
      return data
    } else if (type === effectTypes.GET_CONTEXT) {
      return data
    } else if (type === effectTypes.SET_CONTEXT) {
      return data
    }
  }

  return effectTypes.UNKNOWN
}

export default getEffectDescription
