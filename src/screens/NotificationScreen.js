import {Alert} from 'react-native';
import {fcmService} from '../api/FCMService';
import {localNotificationService} from '../ui/LocalNotificationService';

export default function NotificationScreen() {
  Notification = () => {
    fcmService.registerAppWithFCM();
    fcmService.register(onRegister, onNotification, onOpenNotification);
    localNotificationService.configure(onOpenNotification);

    function onRegister(token) {
      console.log('[Main] onRegister: ', token);
    }

    function onNotification(notify) {
      console.log('[Main] onNotification: ', notify);
      const options = {
        soundName: 'default',
        playSound: true,
      };
      localNotificationService.showNotification(
        0,
        notify.title,
        notify.body,
        notify,
        options,
      );
    }

    function onOpenNotification(notify) {
      console.log('[Main] onOpenNotification: ', notify);
      Alert.alert(
        notify.title +
          '\n' +
          notify.body[
            ({
              text: 'Ask me later',
              onPress: () => console.log('Ask me later pressed'),
            },
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')})
          ],
        {cancelable: false},
      );
    }
    return () => {
      console.log('[Main] unregister');
      fcmService.unRegister();
      localNotificationService.unregister();
    };
  };
}
