import { effectTypes } from "redux-saga/effects"

const {
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
const PARALLEL = "PARALLEL"
const ITERATOR = "ITERATOR"
const PROMISE = "PROMISE" // not from redux-saga
const UNKNOWN = "UNKNOWN" // not from redux-saga

// monitoring statuses
const PENDING = "PENDING"
const RESOLVED = "RESOLVED"
const REJECTED = "REJECTED"

export {
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
  PARALLEL,
  ITERATOR,
  PROMISE,
  UNKNOWN,
  PENDING,
  RESOLVED,
  REJECTED,
}
