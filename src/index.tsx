import React from 'react';
import ReactDOM from 'react-dom';
import {AmplifyProvider, Authenticator} from '@aws-amplify/ui-react'
import Amplify from "aws-amplify";
import {Provider} from 'react-redux';
import App from './App';
import {store} from './app/store';
import {theme} from './theme'
import * as serviceWorker from './serviceWorker';
import awsExports from "./aws-exports";
const packageJson = require('../package.json')

Amplify.configure(awsExports);
console.log('version', packageJson.version)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AmplifyProvider theme={theme}>
        <Authenticator.Provider>
          <App />
        </Authenticator.Provider>
      </AmplifyProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
