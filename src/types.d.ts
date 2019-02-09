declare module "reactotron-react-native" {
  import { SagaMonitor } from "redux-saga"

  export interface Reactotron {
    createSagaMonitor(): SagaMonitor
    startTimer(): any
    reportError(error: any): any
    send(type: string, options: any): any
  }
}
