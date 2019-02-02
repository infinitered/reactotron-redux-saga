// effect names
import { effectTypes } from "redux-saga/effects"

export const {
  TAKE,
  PUT,
  ALL,
  RACE,
  CALL,
  CPS,
  FORK,
  JOIN,
  CANCEL,
  SELECT,
  ACTION_CHANNEL,
  CANCELLED,
  FLUSH,
  GET_CONTEXT,
  SET_CONTEXT,
} = effectTypes
export const PARALLEL = "PARALLEL"
export const ITERATOR = "ITERATOR"
export const PROMISE = "PROMISE" // not from redux-saga
export const UNKNOWN = "UNKNOWN" // not from redux-saga

// monitoring statuses
export const PENDING = "PENDING"
export const RESOLVED = "RESOLVED"
export const REJECTED = "REJECTED"
