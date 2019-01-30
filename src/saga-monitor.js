import * as is from "@redux-saga/is"
import {
  contains,
  isNil,
  last,
  forEach,
} from "ramda"
import {
  ITERATOR,
  CALL,
  PUT,
  FORK,
  RACE,
  PENDING,
  RESOLVED,
  REJECTED,
  CANCELLED,
} from "./saga-constants"
import mng from "./manager"
import { effectTypes } from 'redux-saga/effects'
import getDescri from './get-effect-description';
import getName from './get-effect-name';
const isRaceEffect = eff => is.effect(eff) && eff.type === effectTypes.RACE
// import { reject, values, pluck, isNil, split, pathOr, last, forEach, propEq, filter, __, map, omit } from 'ramda'

// creates a saga monitor
export default (reactotron, options, pluginConfig = {}) => {
  // a lookup table of effects - keys are numbers, values are objects
  const Manager = new mng()
  const exceptions = pluginConfig.except || []
  // start a relative timer
  const timer = reactotron.startTimer()
  // ---------------- Sending Effect Updates ----------------
  //const sendReactotronEffectTree = () => reactotron.send('saga.effect.update', effects)

  // ---------------- Starting -----------------------------

  const rootSagaStarted = function rootSagaStarted (description) {
    Manager.setRootEffect(
      description.effectId,
      Object.assign({}, description, {
        status: PENDING,
        start: timer(),
      }),
    )
  }

  // redux-saga calls this when an effect is triggered (started)
  const effectTriggered = (description) => {
    Manager.set(
      description.effectId,
      Object.assign({}, description, {
        status: PENDING,
        start: timer(),
        name: getName(description.effect),
        description: getDescri(description.effect),
      }),
    )
  }

  // ---------------- Finishing ----------------------------

  // update the duration of the effect
  const updateDuration = (effectInfo) => {
    effectInfo.duration = timer() - effectInfo.start
  }

  // fires when a task has been resolved
  const taskResolved = (effectId, taskResult) => {
    // lookup this effect info
    const effectInfo = Manager.get(effectId)
    updateDuration(effectInfo)
    const { duration } = effectInfo

    // grab the parent too
    const { parentEffectId } = effectInfo
    const parentEffectInfo = Manager.get(parentEffectId)
    let children = []

    // a human friendly name of the saga task
    let sagaDescription
    // what caused the trigger
    let triggerType
    // for FORK tasks, we have a bunch on things to pass along
    if (effectInfo.name && effectInfo.name === FORK) {
      const args = effectInfo.effect.payload.args
      const lastArg = last(args)
      triggerType = lastArg && lastArg.type
      if (parentEffectInfo) {
        if (parentEffectInfo.name && parentEffectInfo.name=== ITERATOR) {

          sagaDescription = parentEffectInfo.description
        }
      } else {
        sagaDescription = "(root)"

        triggerType = `${effectInfo.description}()`
      }

      // flatten out the nested effects
      const buildChild = (depth, effectId) => {
        const sourceEffectInfo = Manager.get(effectId)
        if (isNil(sourceEffectInfo)) return
        let extra = null
        if (sourceEffectInfo.name) {

          switch (sourceEffectInfo.name) {
            case CALL:
              extra = sourceEffectInfo.effect.payload.args
              break

            case PUT:
              extra = sourceEffectInfo.effect.payload.action
              break

            // children handle this
            case RACE:
              break

            // TODO: More of customizations needed here

            default:
              extra = sourceEffectInfo.effect.payload
              break
          }
        }
        // assemble the structure
        children.push({
          depth,
          effectId: sourceEffectInfo.effectId,
          parentEffectId: sourceEffectInfo.parentEffectId || null,
          name: sourceEffectInfo.name || null,
          description: sourceEffectInfo.description || null,
          duration: Math.round(sourceEffectInfo.duration),
          status: sourceEffectInfo.status || null,
          winner: sourceEffectInfo.winner || null,
          loser: sourceEffectInfo.loser || null,
          result: sourceEffectInfo.result || null,
          extra: extra || null,
        })

        // rerun this function for our children
        forEach(x => buildChild(depth + 1, x), Manager.getChildIds(effectId))
      }
      const xs = Manager.getChildIds(effectId);
      forEach(effectId => buildChild(0, effectId), xs)
    }

    // saga not blacklisted?
    if (!contains(effectInfo.description, exceptions)) {
      reactotron.send("saga.task.complete", {
        triggerType: triggerType || effectInfo.description,
        description: sagaDescription,
        duration: Math.round(duration),
        children,
      })
    }
  }

  // redux-saga calls this when an effect is resolved (successfully or not)
  const effectResolved = (effectId, result) => {
    resolveEffect(effectId, result)
  }

  // flags on of the children as the winner
  const setRaceWinner = (effectId, resultOrError) => {
    const winnerLabel = Object.keys(resultOrError)[0]
    for (const childId of Manager.getChildIds(effectId)) {
      const childEffect = Manager.get(childId)
      if (childEffect.label === winnerLabel) {
        childEffect.winner = true
      }
    }
  }

  // ---------------- Failing ------------------------------

  // redux-saga calls this when an effect is rejected (an error has happened)
  const effectRejected = (effectId, error) => {
    rejectEffect(effectId, error)
  }

  // ---------------- Cancelling ---------------------------

  // redux-saga calls this when an effect is cancelled
  const effectCancelled = (effectId) => {
    cancelEffect(effectId)
  }

  const computeEffectDur = (effect) => {
    const now = timer()
    Object.assign(effect, {
      end: now,
      duration: now - effect.start,
    })
  }

  const resolveEffect = (effectId, result) => {
    const effect = Manager.get(effectId)
    if (is.task(result)) {
      result.toPromise().then(
        taskResult => {
          if (result.isCancelled()) {
            cancelEffect(effectId)
          } else {
            resolveEffect(effectId, taskResult)
            taskResolved(effectId, taskResult)
          }
        },
        taskError => rejectEffect(effectId, taskError),
      )
    } else {
      computeEffectDur(effect)
      effect.status = RESOLVED
      effect.result = result
      updateDuration(effect)
      if (isRaceEffect(effect.effect)) {
        setRaceWinner(effectId, result)
      }
    }
  }

  const rejectEffect = (effectId, error) => {
    const effect = Manager.get(effectId)
    computeEffectDur(effect)
    effect.status = REJECTED
    effect.error = error
    updateDuration(effect)
    if (isRaceEffect(effect.effect)) {
      setRaceWinner(effectId, error)
    }
  }

  const cancelEffect = (effectId) => {
    const effect = Manager.get(effectId)
    computeEffectDur(effect)
    effect.status = CANCELLED
    updateDuration(effect)
  }

  // the interface for becoming a redux-saga monitor
  return {
    rootSagaStarted,
    effectTriggered,
    effectResolved,
    effectRejected,
    effectCancelled,
    actionDispatched: () => {},
  }
};
