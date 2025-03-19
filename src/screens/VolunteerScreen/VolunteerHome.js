import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  ImageBackground,
  Linking,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

import { Text } from 'native-base';
import getToken from '../Functions/FCMToken';

import { connect } from 'react-redux';
import { setUserProfile, fetchVolunteerAlerts, fetchVolunteerEvents } from '../../redux/actions';

import ButtonIcons from '../../components/ButtonIcons';
import SimpleDialog from '../../components/SimpleDialog';

// Localizations
import { translate } from '../../../translations.js'

let dbRefUser;

class VolunteerHome extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      showDialog: false,
      geoStatus: false,
      geoLocation: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;

    // Get FCM token
    getToken();

    // Set the firebase reference
    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);

    // Get user profile
    dbRefUser.get().then(data => {

      this.props.setUserProfile(data.data());
      this.updateFCMToken();

      // Get Location
      this.getLocation();

      this.props.fetchVolunteerAlerts(() => { });
      this.props.fetchVolunteerEvents(() => { });
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    BackgroundGeolocation.removeAllListeners();
  }

  updateFCMToken = () => {
    firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('ElderlyUnderCare')
      .get()
      .then((granted) => {
        if (!granted.empty) {
          granted.forEach(doc => {
            // Update volunteer list with FCM & Uid
            firestore()
              .collection('Users')
              .doc(doc.data().Uid)
              .collection('VolunteersList')
              .where('PhoneNumber', '==', this.props.profile.PhoneNumber)
              .get()
              .then((vol) => {
                if (!vol.empty) {
                  vol.forEach(volDoc => {
                    firestore()
                      .collection('Users')
                      .doc(doc.data().Uid)
                      .collection('VolunteersList')
                      .doc(volDoc.id)
                      .update({
                        Uid: this.props.profile.Uid,
                        FcmToken: this.props.profile.FcmToken,
                      })
                  })
                }
              })
          });
        }
      });
  }

  //Function to get GeoLoaction
  getLocation = () => {
    // Prominent disclosure for location
    if (this.props.profile.LocationProminentDisclosure !== true) {
      Alert.alert(
        translate('Location Tracking'),
        translate('SenzeHub app collects location data to enable nearby caregivers or volunteers being notified if senior encounters any problem or issue even when the app is closed or not in used'),
        [
          {
            text: translate('CANCEL'),
            onPress: () => {
              console.log('Cancel Pressed');
            },
            style: 'cancel',
          },
          {
            text: translate('OK'),
            onPress: () => {
              // Update firebase so to skip this next time
              dbRefUser
                .update({
                  LocationProminentDisclosure: true,
                })
                .then(() => {
                  // Seek for permission
                  this.requestLocationPermission();
                });
            },
          },
        ],
        { cancelable: false },
      );
    } else {
      this.requestLocationPermission();
    }
  };

  requestLocationPermission = () => {
    if (Platform.OS === 'android') {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 300000,
        fastInterval: 300000,
      })
        .then(data => {
          // The user has accepted to enable the location services data can be :
          //  - "already-enabled" if the location services has been already enabled
          //  - "enabled" if user has clicked on OK button in the popup
          if (data === 'enabled' || data === 'already-enabled') {
            this.startLocationTracking();
          }
        })
        .catch(err => {
          console.log('requestLocationPermission ', err);
          // The user has not accepted to enable the location services or something went wrong during the process
          // "err" : { "code" : "ERR00|ERR01|ERR02|ERR03", "message" : "message"}
          // codes :
          //  - ERR00 : The user has clicked on Cancel button in the popup
          //  - ERR01 : If the Settings change are unavailable
          //  - ERR02 : If the popup has failed to open
          //  - ERR03 : Internal error
        });
    } else if (Platform.OS === 'ios') {
      this.startLocationTracking();
    }
  };

  startLocationTracking = () => {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: translate('Location Tracking'),
      notificationText: translate('SenzeHub app collects location data to enable nearby caregivers or volunteers being notified if senior encounters any problem or issue even when the app is closed or not in used'),
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 300000,
      fastestInterval: 300000, // Every 5mins get user's background location
      activitiesInterval: 300000,
      notificationsEnabled: true,
      startForeground: true,
      stopOnStillActivity: false,
    });

    BackgroundGeolocation.on('location', location => {
      this.setState({
        geoLocation: {
          coordinates: new firestore.GeoPoint(
            location.latitude,
            location.longitude,
          ),
        },
      });

      dbRefUser.update({
        GeoLocation: this.state.geoLocation,
      });

      console.log(this.state.geoLocation);
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      BackgroundGeolocation.startTask(taskKey => {
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('stationary', stationaryLocation => {
      console.log('stationary');
      // handle stationary locations here
      // Actions.sendLocation(stationaryLocation);
      this.setState({
        geoLocation: {
          coordinates: new firestore.GeoPoint(
            stationaryLocation.latitude,
            stationaryLocation.longitude,
          ),
        },
      });

      dbRefUser.update({
        GeoLocation: this.state.geoLocation,
      });

      console.log(this.state.geoLocation);
    });

    BackgroundGeolocation.on('error', error => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('authorization', status => {
      console.log(
        '[INFO] BackgroundGeolocation authorization status: ' + status,
      );
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(
          () =>
            Alert.alert(
              translate('App requires location tracking permission'),
              translate('Would you like to open app settings?'),
              [
                {
                  text: translate('YES'),
                  onPress: () => BackgroundGeolocation.showAppSettings(),
                },
                {
                  text: translate('NO'),
                  onPress: () => console.log('No Pressed'),
                  style: 'cancel',
                },
              ],
            ),
          1000,
        );
      }
    });

    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
    });

    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');

      // Here we can decide whether we want stop the updates or not.
      // If you've configured the server to return 285, then it means the server does not require further update.
      // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
      // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
    });

    BackgroundGeolocation.on('http_authorization', () => {
      console.log('[INFO] App needs to authorize the http requests');
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log(
        '[INFO] BackgroundGeolocation service is running',
        status.isRunning,
      );
      console.log(
        '[INFO] BackgroundGeolocation services enabled',
        status.locationServicesEnabled,
      );
      console.log(
        '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
      );

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
  };

  store = () => {
    //this.props.navigation.navigate('Store');
    Linking.openURL('https://www.senzehub.com/shop');
  };

  event = () => {
    //this.props.navigation.navigate('Store');
    Linking.openURL('https://www.senzehealth.com/');
  };


  task = () => {
    //this.props.navigation.navigate('Store');
    Linking.openURL('https://www.senzecare.com/');
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.topLeft}>{translate("HELLO")} {this.props.profile.Name},</Text>
          <Text style={styles.topLeft2}>
            {translate('YOU CAN FIND VOLUNTEERING AND CAREGIVING INFORMATION FROM THE FOLLOWING:')}
          </Text>
          <View style={styles.container}>
            <ButtonIcons
              title={translate('VOLUNTEERING INFO')}
              icon={'calendar-week'}
              click={() => {
                this.event();
              }}
            />
            <ButtonIcons
              title={translate('STORE')}
              icon={'store'}
              click={() => {
                this.store();
              }}
            />
            <ButtonIcons
              title={translate('CAREGIVER SERVICES')}
              icon={'briefcase'}
              click={() => {
                this.task();
              }}
            />
          </View>
          <SimpleDialog
            modalVisible={this.state.showDialog}
            onModalClosed={() => this.setState({ showDialog: false })}
            errorMessage={this.state.errorMessage}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topLeft: {
    alignItems: 'flex-start',
    top: 15,
    marginBottom: 40,
    left: 16,
    fontSize: 24,
    textAlign: 'left',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  topLeft2: {
    alignItems: 'center',
    top: 10,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 30,
    fontSize: 16,
    textAlign: 'justify',
    color: '#180D59',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile, fetchVolunteerAlerts, fetchVolunteerEvents })(VolunteerHome);
