import EffectManager from "./EffectManager"

describe("EffectManager", () => {
  it("should track rootIds", () => {
    const manager = new EffectManager()

    manager.setRootEffect(0, { effectId: 0, status: "a test" })

    expect(manager.getRootIds()).toEqual([0])
  })

  it("should track effects and return them", () => {
    const manager = new EffectManager()

    manager.set(1, { effectId: 1, status: "a test", parentEffectId: 0 })

    expect(manager.get(1)).toEqual({ effectId: 1, status: "a test", parentEffectId: 0 })
  })

  it("should return children ids", () => {
    const manager = new EffectManager()

    manager.set(1, { effectId: 1, status: "a test", parentEffectId: 0 })
    manager.set(2, { effectId: 2, status: "another test", parentEffectId: 1 })
    manager.set(3, { effectId: 3, status: "another test", parentEffectId: 1 })
    manager.set(4, { effectId: 4, status: "another test", parentEffectId: 2 })

    expect(manager.getChildIds(1)).toEqual([2, 3])
    expect(manager.getChildIds(2)).toEqual([4])
  })
})
