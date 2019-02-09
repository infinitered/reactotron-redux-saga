import * as is from "@redux-saga/is"
import { Effect } from "@redux-saga/types"

import * as effectTypes from "../constants"

function getEffectName(effect: Effect | any[] | IterableIterator<any> | Promise<any>) {
  if (is.array(effect)) return effectTypes.PARALLEL
  if (is.iterator(effect)) return effectTypes.ITERATOR
  if (is.promise(effect)) return effectTypes.PROMISE

  if (is.effect(effect)) {
    return effect.type
  }

  return effectTypes.UNKNOWN
}

export default getEffectName
