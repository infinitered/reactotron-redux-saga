import createSagaMonitor, { PluginConfig } from "./sagaMonitor"
import { Reactotron } from "reactotron-react-native"

export default (pluginConfig: PluginConfig) => (reactotron: Reactotron) => ({
  features: {
    createSagaMonitor: (options: any) => createSagaMonitor(reactotron, options, pluginConfig),
  },
})
