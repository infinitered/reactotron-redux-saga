import * as effectTypes from "../constants"

import getEffectDescription from "./getEffectDescription"

describe("getEffectDescription", () => {
  it("should return unknown", () => {
    expect(getEffectDescription(null)).toBe(effectTypes.UNKNOWN)
  })

  it("should return the saga name if it is the root saga", () => {
    // TODO: Investigate this.
    // expect(getEffectDescription({ root: true, saga: { name: 'test' }})).toBe("test")
  })

  it("should handle a promise with a name", () => {
    const promise = new Promise(resolve => resolve())
    ;(promise as any).name = "Testing"
    expect(getEffectDescription(promise)).toBe(`${effectTypes.PROMISE}(Testing)`)
  })

  it("should handle a promise with an anonymous function", () => {
    expect(getEffectDescription(new Promise(resolve => resolve()))).toBe(effectTypes.PROMISE)
  })

  it("should hand a class extending a promise", () => {
    // TODO: Investigate this
    // class ExtPromise extends Promise<any> {}
    // expect(getEffectDescription(new ExtPromise(resolve => resolve()))).toBe("ExtPromise")
  })

  it("should handle an iterator", () => {
    // TODO: Investigate this.
    // function* aGen() {
    //   yield Effects.put({ type: "LOL" })
    // }
    // expect(getEffectDescription(aGen())).toBe("aGen")
  })

  // TODO: Write tests for everything else eventually.
})
