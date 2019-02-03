import { SagaMonitor, Saga } from "@redux-saga/core"
import * as is from "@redux-saga/is"
import { Reactotron } from "reactotron-react-native"

import * as effectTypes from "./constants"
import EffectManager, { MonitoredEffect } from "./EffectManager"
import getEffectName from "./helpers/getEffectName"
import getEffectDescription from "./helpers/getEffectDescription"
import { isRaceEffect } from "./helpers/isRaceEffect"

export interface PluginConfig {
  except?: string[]
}

export default (reactotron: Reactotron, options: any, pluginConfig: PluginConfig = {}): SagaMonitor => {
  const manager = new EffectManager()
  const exceptions = pluginConfig.except || []
  const timer = reactotron.startTimer()

  function computeEffectDuration(effect: MonitoredEffect) {
    const now = timer()

    effect.end = now
    effect.duration = now - effect.start
  }

  // Scale children building up metadata for sending to the other side.
  function buildChildEffects(depth: number, effectId: number, children: any[]) {
    const effect = manager.get(effectId)
    if (!effect) return

    let extra = null

    if (effect.name) {
      switch (effect.name) {
        case effectTypes.CALL:
          extra = effect.effect.payload.args
          break
        case effectTypes.PUT:
          extra = effect.effect.payload.action
          break
        case effectTypes.RACE:
          // Do Nothing for now
          break
        default:
          extra = effect.effect.payload
          break
      }
    }

    children.push({
      depth,
      effectId: effect.effectId,
      parentEffectId: effect.parentEffectId || null,
      name: effect.name || null,
      description: effect.description || null,
      duration: Math.round(effect.duration),
      status: effect.status || null,
      winner: effect.winner || null,
      result: effect.result || null,
      extra: extra || null,
    })

    manager
      .getChildIds(effectId)
      .forEach(childEffectId => buildChildEffects(depth + 1, childEffectId, children))
  }

  // This is the method called when the below events think we are ready to ship a saga to reactotron.
  function shipEffect(effectId: number) {
    const effect = manager.get(effectId)
    computeEffectDuration(effect)

    // If we are on the exception list bail fast.
    if (exceptions.indexOf(effect.description) > -1) return

    // a human friendly name of the saga task
    let sagaDescription
    // what caused the trigger
    let triggerType
    const children = []

    const parentEffect = manager.get(effect.parentEffectId)

    // If we are a fork effect then we need to collect up everything that happened in us to ship that
    if (effect.name && effect.name === effectTypes.FORK) {
      const { args } = effect.effect.payload
      const lastArg = args.length > 0 ? args[args.length - 1] : null
      triggerType = lastArg && lastArg.type

      if (parentEffect) {
        if (parentEffect.name && parentEffect.name === effectTypes.ITERATOR) {
          sagaDescription = parentEffect.description
        }
      } else {
        sagaDescription = "(root)"
        triggerType = `${effect.description}()`
      }

      manager
        .getChildIds(effectId)
        .forEach(childEffectId => buildChildEffects(0, childEffectId, children))
    }

    reactotron.send("saga.task.complete", {
      triggerType: triggerType || effect.description,
      description: sagaDescription,
      duration: Math.round(effect.duration),
      children,
    })
  }

  function setRaceWinner(raceEffectId: number, result: any) {
    const winnerLabel = Object.keys(result)[0]
    for (const childId of manager.getChildIds(raceEffectId)) {
      const childEffect = manager.get(childId)
      if (childEffect.label === winnerLabel) {
        childEffect.winner = true
      }
    }
  }

  function rootSagaStarted(options: { effectId: number; saga: Saga; args: any[] }) {
    manager.setRootEffect(options.effectId, {
      ...options,
      status: effectTypes.PENDING,
      start: timer(),
    })
  }

  function effectTriggered(options: {
    effectId: number
    parentEffectId: number
    label?: string
    effect: any
  }) {
    manager.set(options.effectId, {
      ...options,
      status: effectTypes.PENDING,
      start: timer(),
      name: getEffectName(options.effect),
      description: getEffectDescription(options.effect),
    })
  }

  function effectRejected(effectId: number, error: any) {
    const effect = manager.get(effectId)

    computeEffectDuration(effect)
    effect.status = effectTypes.REJECTED
    effect.error = error

    if (isRaceEffect(effect.effect)) {
      setRaceWinner(effectId, error)
    }
  }

  function effectCancelled(effectId: number) {
    const effect = manager.get(effectId)

    computeEffectDuration(effect)
    effect.status = effectTypes.CANCELLED
  }

  function effectResolved(effectId: number, result: any) {
    const effect = manager.get(effectId)

    if (is.task(result)) {
      result.toPromise().then(
        taskResult => {
          if (result.isCancelled()) {
            effectCancelled(effectId)
          } else {
            effectResolved(effectId, taskResult)
            shipEffect(effectId)
          }
        },
        taskError => {
          effectRejected(effectId, taskError)

          if (!taskError.reactotronWasHere) {
            reactotron.reportError(taskError)
          }
          taskError.reactotronWasHere = true
        }
      )
    } else {
      computeEffectDuration(effect)
      effect.status = effectTypes.RESOLVED
      effect.result = result

      if (isRaceEffect(effect.effect)) {
        setRaceWinner(effectId, result)
      }
    }
  }

  return {
    rootSagaStarted,
    effectTriggered,
    effectResolved,
    effectRejected,
    effectCancelled,
    actionDispatched: () => {},
  }
}
