import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { ThemeProvider } from '@aws-amplify/ui-react'
import { Amplify } from 'aws-amplify'
import { Provider } from 'react-redux'
import { App } from './App'
import { AuthProvider } from './features/user/User'
import { store } from './app/store'
import { theme } from './theme'
import packageJson from '../package.json'

// Gen-1 (aws-exports) config shape. Amplify v6 parses it at runtime, but its
// `LegacyConfig` type is an intentional stub declaring only aws_project_region,
// so cast past excess-property checking on the remaining legacy keys.
Amplify.configure({
  aws_project_region: import.meta.env.VITE_AWS_REGION,
  aws_appsync_graphqlEndpoint: import.meta.env.VITE_APPSYNC_ENDPOINT,
  aws_appsync_region: import.meta.env.VITE_AWS_REGION,
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: import.meta.env.VITE_APPSYNC_API_KEY,
} as unknown as Parameters<typeof Amplify.configure>[0])
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
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </Provider>
)

const isLocalhost = document.location.host.startsWith('localhost')
const rootElement = document.getElementById('root')!
const app = isLocalhost ? providers : <ErrorBoundary>{providers}</ErrorBoundary>
createRoot(rootElement).render(<StrictMode>{app}</StrictMode>)
