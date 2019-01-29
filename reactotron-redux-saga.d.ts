// Module Augmentation for plugin
declare module 'reactotron-react-native' {
    import { SagaMonitor } from 'redux-saga';

    export interface Reactotron {
        createSagaMonitor(): SagaMonitor;
    }
}

declare module 'reactotron-redux-saga' {
    import { ReactotronPlugin, Reactotron } from 'reactotron-react-native';

    interface PluginConfig {
        except?: string[];
    }

    export default function sagaPlugin(config: PluginConfig): (tron: Reactotron) => ReactotronPlugin;
}

