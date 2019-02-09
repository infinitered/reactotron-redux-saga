import { Saga } from "redux-saga"
import { Effect } from "@redux-saga/types"

export interface MonitoredEffect {
  effectId: number
  parentEffectId?: number
  name?: string
  description?: string
  saga?: Saga
  root?: boolean
  args?: any[]
  status: string
  start?: number
  end?: number
  duration?: number
  error?: any
  label?: string
  winner?: boolean
  result?: any

  effect?: Effect
}

export default class EffectManager {
  rootIds: number[]
  map: { [id: number]: MonitoredEffect }
  childIdsMap: { [id: number]: number[] }

  constructor() {
    this.rootIds = [];
    this.map = {}
    this.childIdsMap = {}
  }

  get(effectId: number) {
    return this.map[effectId]
  }

  set(effectId: number, desc: MonitoredEffect) {
    this.map[effectId] = desc

    if (!this.childIdsMap[desc.parentEffectId]) {
      this.childIdsMap[desc.parentEffectId] = []
    }
    this.childIdsMap[desc.parentEffectId].push(effectId)
  }

  setRootEffect(effectId: number, desc: MonitoredEffect) {
    this.rootIds.push(effectId)
    this.set(effectId, { ...desc, root: true })
  }

  getRootIds() {
    return this.rootIds
  }

  getChildIds(parentEffectId: number) {
    return this.childIdsMap[parentEffectId] || []
  }
}
