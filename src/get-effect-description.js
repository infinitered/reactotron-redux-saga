// Provides an additional description of the effect.  A friendlier name
// to display to the humans.
import * as is from '@redux-saga/is'
import * as effectTypes from './saga-constants'
import { isNilOrEmpty } from 'ramdasauce'

/* eslint-disable no-cond-assign */
export default effect => {
  if (!effect) return effectTypes.UNKNOWN
  if (effect.root) return effect.saga.name
  if (is.iterator(effect)) return effect.name
  if (is.promise(effect)) {
    let display
    if (effect.name) {
      // a promise object with a manually set name prop for display reasons
      display = `${effectTypes.PROMISE}(${effect.name})`
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
    const { type , payload: data} = effect
    if (type === effectTypes.TAKE) {
      return data.pattern || 'channel'
    } else if (type === effectTypes.PUT) {
      return data.channel ? data.action : data.action.type
    } else if (type === effectTypes.ALL) {
      return data
    } else if (type === effectTypes.RACE) {
      return null
    } else if (type === effectTypes.CALL) {
      return isNilOrEmpty(data.fn.name) ? '(anonymous)' : data.fn.name
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
  if (is.array(effect)) return null


  return effectTypes.UNKNOWN
}
