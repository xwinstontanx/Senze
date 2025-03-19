import {PermissionsAndroid} from 'react-native';
export default async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Tracking',
        message:
          'SenzeHub app collects location data to enable nearby caregivers or volunteers being notified if senior encounters any problem or issue even when the app is closed or not in used',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Location Permision Granted');
    } else {
      console.log('location permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}
