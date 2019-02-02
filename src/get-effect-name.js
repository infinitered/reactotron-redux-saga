import * as is from "@redux-saga/is"
import * as effectTypes from "./saga-constants"
export default effect => {
  if (!effect) return effectTypes.UNKNOWN
  if (is.promise(effect)) return effectTypes.PROMISE
  if (is.effect(effect)) {
    const { type } = effect
    if (type === effectTypes.TAKE) {
      return effectTypes.TAKE
    } else if (type === effectTypes.PUT) {
      return effectTypes.PUT
    } else if (type === effectTypes.ALL) {
      return effectTypes.ALL
    } else if (type === effectTypes.RACE) {
      return effectTypes.RACE
    } else if (type === effectTypes.CALL) {
      return effectTypes.CALL
    } else if (type === effectTypes.CPS) {
      return effectTypes.CPS
    } else if (type === effectTypes.FORK) {
      return effectTypes.FORK
    } else if (type === effectTypes.JOIN) {
      return effectTypes.JOIN
    } else if (type === effectTypes.CANCEL) {
      return effectTypes.CANCEL
    } else if (type === effectTypes.SELECT) {
      return effectTypes.SELECT
    } else if (type === effectTypes.ACTION_CHANNEL) {
      return effectTypes.ACTION_CHANNEL
    } else if (type === effectTypes.CANCELLED) {
      return effectTypes.CANCELLED
    } else if (type === effectTypes.FLUSH) {
      return effectTypes.FLUSH
    } else if (type === effectTypes.GET_CONTEXT) {
      return effectTypes.GET_CONTEXT
    } else if (type === effectTypes.SET_CONTEXT) {
      return effectTypes.SET_CONTEXT
    }
  }
  if (is.array(effect)) return effectTypes.PARALLEL
  if (is.iterator(effect)) return effectTypes.ITERATOR
  return effectTypes.UNKNOWN
}
