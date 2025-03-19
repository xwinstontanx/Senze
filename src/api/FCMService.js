import messaging from '@react-native-firebase/messaging';

class FCMService {
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister);
    this.createNotificationListeners(
      onRegister,
      onNotification,
      onOpenNotification,
    );
  };

  registerAppWithFCM = async () => {
    await messaging().registerDeviceForRemoteMessages();
    await messaging().setAutoInitEnabled(true);
  };

  checkPermission = onRegister => {
    messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          this.getToken(onRegister);
        } else {
          this.requestPermission(onRegister);
        }
      })
      .catch(error => {
        console.log('[FCMService] Permission Rejected: ', error);
      });
  };

  getToken = onRegister => {
    messaging()
      .getToken()
      .then(fcmToken => {
        if (fcmToken) {
          onRegister(fcmToken);
        } else {
          console.log("[FCMService] user don't have a device token");
        }
      })
      .catch(error => {
        console.log('[FCMService] get token rejected', error);
      });
  };

  requestPermission = onRegister => {
    messaging()
      .requestPermission()
      .then(() => {
        this.getToken(onRegister);
      })
      .catch(error => {
        console.log('[FCMService] Request Permission Rejected: ', error);
      });
  };

  deleteToken = () => {
    console.log('[FCMService] delete token');
    messaging()
      .deleteToken()
      .catch(error => {
        console.log('[FCMService] delete token error', error);
      });
  };

  createNotificationListeners = (
    onRegister,
    onNotification,
    onOpenNotification,
  ) =>
    //When application is running in background
    {
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('[FCMService] onNotificationOpendApp');
        if (remoteMessage) {
          const notification = remoteMessage.notification;
          onOpenNotification(notification);
        }
      });

      //When application in opened from quit state.

      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          console.log('[FCMService] getInitialNotification');
          if (remoteMessage) {
            const notification = remoteMessage.notification;
            onOpenNotification(notification);
          }
        });

      // Foreground state messages

      this.messageListener = messaging().onMessage(async remoteMessage => {
        console.log('[FCMService] a new message arrived!', remoteMessage);
        if (remoteMessage) {
          let notification = null;
          notification = remoteMessage.notification;
          onNotification(notification);
        }
      });

      //Triggered when we have new token
      messaging().onTokenRefresh(fcmToken => {
        console.log('[FCMService] New token refresh', fcmToken);
        onRegister(fcmToken);
      });
    };

  unRegister = () => {
    this.messageListener();
  };
}

export const fcmService = new FCMService();
