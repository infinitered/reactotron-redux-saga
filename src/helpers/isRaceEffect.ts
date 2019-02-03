import * as is from "@redux-saga/is"
import { Effect } from "@redux-saga/types";

import * as effectTypes from "../constants"

export const isRaceEffect = (eff: Effect) => is.effect(eff) && eff.type === effectTypes.RACE
