import * as Effects from "redux-saga/effects"

import { isRaceEffect } from "./isRaceEffect"
import { createMockTask } from "@redux-saga/testing-utils"

describe("isRaceEffect", () => {
  it("should detect a race effect", () => {
    expect(isRaceEffect(Effects.race([createMockTask()]))).toBeTruthy()
  })

  it("should tell us something isn't a race effect", () => {
    expect(isRaceEffect(Effects.take())).toBeFalsy()
  })
})
