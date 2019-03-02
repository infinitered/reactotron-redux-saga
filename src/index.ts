import { Reactotron } from "reactotron-core-client"
import { SagaMonitor } from "redux-saga";

import createSagaMonitor, { PluginConfig } from "./sagaMonitor"

export default (pluginConfig: PluginConfig) => (reactotron: Reactotron) => ({
  features: {
    createSagaMonitor: (options: any) => createSagaMonitor(reactotron, options, pluginConfig),
  },
})

declare module "reactotron-react-native" {
  // eslint-disable-next-line import/export
  export interface Reactotron {
    createSagaMonitor(): SagaMonitor
  }
}

declare module "reactotron-react-js" {
  // eslint-disable-next-line import/export
  export interface Reactotron {
    createSagaMonitor(): SagaMonitor
  }
}
