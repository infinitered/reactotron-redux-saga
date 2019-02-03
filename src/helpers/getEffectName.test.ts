import * as Effects from "redux-saga/effects"
import { createMockTask } from '@redux-saga/testing-utils'

import * as effectTypes from "../constants"

import getEffectName from "./getEffectName"

describe("getEffectName", () => {
  it("should return null if no effect sent", () => {
    expect(getEffectName(null)).toBe(effectTypes.UNKNOWN)
  })

  it("should return an parallel type", () => {
    expect(getEffectName([])).toBe(effectTypes.PARALLEL)
  })

  it("should return a iterator type", () => {
    function* testGen() {}

    expect(getEffectName(testGen())).toBe(effectTypes.ITERATOR)
  })

  it("should return a promise type", () => {
    expect(getEffectName(new Promise(resolve => resolve()))).toBe(effectTypes.PROMISE)
  })

  it("should return built in effect types", () => {
    function* testGen() {}

    expect(getEffectName(Effects.take())).toBe(effectTypes.TAKE)
    expect(getEffectName(Effects.put({ type: "TEST" }))).toBe(effectTypes.PUT)
    expect(getEffectName(Effects.all({}))).toBe(effectTypes.ALL)
    expect(getEffectName(Effects.call(() => {}))).toBe(effectTypes.CALL)
    expect(getEffectName(Effects.cps(() => {}))).toBe(effectTypes.CPS)
    expect(getEffectName(Effects.fork(testGen))).toBe(effectTypes.FORK)
    expect(getEffectName(Effects.actionChannel("TEST"))).toBe(effectTypes.ACTION_CHANNEL)
    expect(getEffectName(Effects.cancelled())).toBe(effectTypes.CANCELLED)
    expect(getEffectName(Effects.getContext("A string"))).toBe(effectTypes.GET_CONTEXT)
    expect(getEffectName(Effects.setContext({}))).toBe(effectTypes.SET_CONTEXT)
    expect(getEffectName(Effects.join(createMockTask()))).toBe(effectTypes.JOIN)
    expect(getEffectName(Effects.race([createMockTask(), createMockTask()]))).toBe(effectTypes.RACE)
    expect(getEffectName(Effects.cancel(createMockTask()))).toBe(effectTypes.CANCEL)
    expect(getEffectName(Effects.select(() => {}))).toBe(effectTypes.SELECT)
  })
})
