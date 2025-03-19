import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

export default async function getToken() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      messaging()
        .getToken()
        .then((fcmtoken) => {
          if (fcmtoken) {
            dbRef = firestore().collection('Users').doc(auth().currentUser.uid);

            dbRef.update({
              FcmToken: fcmtoken,
            });
          } else {
            // user doesn't have a device token yet
          }
        });
    }
  } catch (err) {
    console.warn(err);
  }
}
