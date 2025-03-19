
import AsyncStorage from '@react-native-async-storage/async-storage';
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import {
    Text,
    TouchableOpacity,
    View,
    Platform
  } from 'react-native';

export const WalkthroughableText = walkthroughable(Text);
export const WalkthroughableView = walkthroughable(View);
export const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);

export const roundedRectangleSvgPath = ({ position, canvasSize, size }) => {
  const br = 10; // border radius
  const sizeX = size.x._value - 2 * br;
  const sizeY = size.y._value - 2 * br;
  return `M 0 0 H ${canvasSize.x} V ${canvasSize.y} H 0 V 0 Z M ${position.x._value + br} ${position.y._value} Z h ${sizeX} a ${br} ${br} 0 0 1 ${br} ${br} v ${sizeY} a ${br} ${br} 0 0 1 -${br} ${br} h -${sizeX} a ${br} ${br} 0 0 1 -${br} -${br} v -${sizeY} a ${br} ${br} 0 0 1 ${br} -${br} z`;
}

export const copilotConfig = {
  overlay: "svg",
  androidStatusBarVisible: Platform.OS === "android",
  svgMaskPath: roundedRectangleSvgPath,
};

export function handleStepChange(step) {
    console.log(`Current step is: ${step.name}`);
}

export function triggerTutorial(props, screenName, errorCallback) {
    props.start();
    setSeenTutorial(screenName, errorCallback);
}

export function setSeenTutorial(screenName, errorCallback) {
    AsyncStorage.setItem(
      screenName,
      JSON.stringify({ seenTutorial : true }),
      err => {
        if (err) {
          errorCallback(err);
        }
      },
    ).catch(err => {
      errorCallback(err);
    });
}

export function startTutorialIfNewUser(props, screenName, errorCallback) {
    AsyncStorage.getItem(screenName).then(data => {
      if (data != null && JSON.parse(data).seenTutorial !== true) {
        this.triggerTutorial(props, screenName, errorCallback);
      } else if (data == null) {
        // AsyncStorage has not yet been set -> must be brand new user
        this.triggerTutorial(props, screenName, errorCallback);
        console.log('AsyncStorage first time');
      }
    });
}