import React from 'react';
import ReactDOM from 'react-dom'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import {AmplifyProvider, Authenticator} from '@aws-amplify/ui-react'
import Amplify from 'aws-amplify'
import {Provider} from 'react-redux'
import {App} from './App'
import {store} from './app/store'
import {theme} from './theme'
import * as serviceWorker from './serviceWorker'
import awsExports from "./aws-exports"
const packageJson = require('../package.json')

Amplify.configure(awsExports);
console.log('version', packageJson.version)

Bugsnag.start({
  appVersion: packageJson.version,
  apiKey: 'f9ee89b75415659a9708bea10e368d0f',
  plugins: [new BugsnagPluginReact()]
})

// @ts-ignore
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

const storeProvider = (
  <Provider store={store}>
    <AmplifyProvider theme={theme}>
      <Authenticator.Provider>
        <App />
      </Authenticator.Provider>
    </AmplifyProvider>
  </Provider>
)

const bugsnagBoundary = <ErrorBoundary>{storeProvider}</ErrorBoundary>
const isLocalhost = document.location.host === 'localhost:3000'

ReactDOM.render(
  <React.StrictMode>
    {isLocalhost ? storeProvider : bugsnagBoundary}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
