import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { ThemeProvider, Authenticator } from '@aws-amplify/ui-react'
import { Amplify } from 'aws-amplify'
import { Provider } from 'react-redux'
import { App } from './App'
import { store } from './app/store'
import { theme } from './theme'
import awsExports from './aws-exports'
import packageJson from '../package.json'

Amplify.configure(awsExports)
console.log('version', packageJson.version)

Bugsnag.start({
  appVersion: packageJson.version,
  apiKey: 'f9ee89b75415659a9708bea10e368d0f',
  plugins: [new BugsnagPluginReact()]
})

// @ts-ignore
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)
const providers = (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <Authenticator.Provider>
        <App />
      </Authenticator.Provider>
    </ThemeProvider>
  </Provider>
)

const isLocalhost = document.location.host.startsWith('localhost')
const rootElement = document.getElementById('root')!
const app = isLocalhost ? providers : <ErrorBoundary>{providers}</ErrorBoundary>
createRoot(rootElement).render(<StrictMode>{app}</StrictMode>)
