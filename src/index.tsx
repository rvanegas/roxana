import React from 'react';
import ReactDOM from 'react-dom'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import {Theme, defaultTheme, AmplifyProvider, Authenticator, ColorMode, View,
  Text, ToggleButton, ToggleButtonGroup} from '@aws-amplify/ui-react'
import Amplify from 'aws-amplify'
import {Provider} from 'react-redux'
import {App} from './App'
import {store} from './app/store'
// import {theme} from './theme'
import * as serviceWorker from './serviceWorker'
import awsExports from './aws-exports'
import packageJson from '../package.json'

Amplify.configure(awsExports);
console.log('version', packageJson.version)

Bugsnag.start({
  appVersion: packageJson.version,
  apiKey: 'f9ee89b75415659a9708bea10e368d0f',
  plugins: [new BugsnagPluginReact()]
})

// @ts-ignore
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

const DarkModeExample = () => {
  const [colorMode, setColorMode] = React.useState<ColorMode>('system')
  const theme: Theme = {
    name: 'dark-mode-theme',
    overrides: [
      {
        colorMode: 'dark',
        tokens: {
          colors: {
            neutral: {
              // flipping the neutral palette
              10: defaultTheme.tokens.colors.neutral[100],
              20: defaultTheme.tokens.colors.neutral[90],
              40: defaultTheme.tokens.colors.neutral[80],
              80: defaultTheme.tokens.colors.neutral[40],
              90: defaultTheme.tokens.colors.neutral[20],
              100: defaultTheme.tokens.colors.neutral[10],
            },
            black: { value: '#fff' },
            white: { value: '#000' },
            overlay: {
              10: { value: 'hsla(0, 0%, 100%, 0.1)' },
              20: { value: 'hsla(0, 0%, 100%, 0.2)' },
              30: { value: 'hsla(0, 0%, 100%, 0.3)' },
              40: { value: 'hsla(0, 0%, 100%, 0.4)' },
              50: { value: 'hsla(0, 0%, 100%, 0.5)' },
              60: { value: 'hsla(0, 0%, 100%, 0.6)' },
              70: { value: 'hsla(0, 0%, 100%, 0.7)' },
              80: { value: 'hsla(0, 0%, 100%, 0.8)' },
              90: { value: 'hsla(0, 0%, 100%, 0.9)' },
            },
          },
        },
      },
    ],
  }

  return (
    <AmplifyProvider theme={theme} colorMode={colorMode}>
      <View>
        {/* @ts-ignore */}
        <ToggleButtonGroup onChange={(value: ColorMode) => setColorMode(value)}
          value={colorMode}
          isExclusive
        >
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
          <ToggleButton value="system">System</ToggleButton>
        </ToggleButtonGroup>
        <Text>Current color mode: {colorMode}</Text>
        <Authenticator.Provider>
          <App />
        </Authenticator.Provider>
      </View>
    </AmplifyProvider>
  )
}

const storeProvider = (
  <Provider store={store}>
    <DarkModeExample />
  </Provider>
)

const bugsnagBoundary = <ErrorBoundary>{storeProvider}</ErrorBoundary>
const isLocalhost = document.location.host === 'localhost:3000'

ReactDOM.render(
  <React.StrictMode>
    {isLocalhost ? storeProvider : bugsnagBoundary}
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
