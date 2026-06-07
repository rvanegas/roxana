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
import packageJson from '../package.json'

Amplify.configure({
  aws_project_region: import.meta.env.VITE_AWS_REGION,
  aws_appsync_graphqlEndpoint: import.meta.env.VITE_APPSYNC_ENDPOINT,
  aws_appsync_region: import.meta.env.VITE_AWS_REGION,
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: import.meta.env.VITE_APPSYNC_API_KEY,
  aws_cognito_identity_pool_id: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: import.meta.env.VITE_AWS_REGION,
  aws_user_pools_id: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_COGNITO_WEB_CLIENT_ID,
  aws_cognito_username_attributes: [],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ['EMAIL'],
})
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
