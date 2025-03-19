/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {Provider} from 'react-redux';
import store from './src/redux/store';
import {StyleProvider} from 'native-base';
import getTheme from './native-base-theme/components';
import material from './native-base-theme/variables/material_copy';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return (
    <StyleProvider style={getTheme(material)}>
      <Provider store={store}>
        <App />
      </Provider>
    </StyleProvider>
  );
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
