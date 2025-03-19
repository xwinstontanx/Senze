import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  ImageBackground,
  Linking,
  View,
  Image
} from 'react-native';

// RN Copilot
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import * as Copilot from '../Functions/Tutorial';

import { Form, Input, List, ListItem } from 'native-base';
import Swipeout from 'react-native-swipeout';
import { mainStyles } from '../../styles/styles';
import styled from 'styled-components';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Spinner from 'react-native-loading-spinner-overlay';
import { FloatingAction } from 'react-native-floating-action';
import SimpleDialog from '../../components/SimpleDialog';

import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import getToken from '../Functions/FCMToken';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

import { connect } from 'react-redux';
import { setUserProfile, fetchAlerts } from '../../redux/actions';

import * as Tutorial from '../Functions/Tutorial';
import { translate } from '../../../translations';
import * as Animatable from 'react-native-animatable';

let dbRef;
let dbRefElderlyUndercare;
let dbRefElderlyDetail;
let dbRefAddElderly;
let dbRefElderlyCaregiverList;
let unsubscribe1 = null;
let unsubscribe2 = null;

class cgHome extends Component {
  _isMounted = false;
  SCREEN_NAME = 'cgHome';
  floatingAction;

  constructor(props) {
    super(props);

    this.state = {
      emptyList: false,
      elderlyUidList: [],
      elderlyList: [],
      showAddUser: false,
      searchElderlyPhoneNumber: null,
      loading: false,
      errorMessage: null,
      showDialog: false,

      geoLocation: '',
    };
  }

  componentDidMount() {
    this._isMounted = true;

    // Get FCM token
    getToken();

    // Set the firebase reference
    dbRef = firestore().collection('Users').doc(auth().currentUser.uid);

    // Get user profile
    dbRef.get().then(data => {
      this.props.setUserProfile(data.data());

      // Get Location
      // this.getLocation();

      this.props.fetchAlerts(() => { });
    });

    // Get Elderly list
    dbRefElderlyUndercare = firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('ElderlyUnderCare');

    // Get each elderly latest details
    dbRefElderlyDetail = firestore().collection('Users');

    this.getElderlyList();

    this.props.copilotEvents.on('stepChange', (step) => {
      Copilot.handleStepChange(step);
      if (step.name == 'last') {
        this.floatingAction.animateButton();
      }
    });
    this.props.copilotEvents.on("stop", () => {
      // Copilot tutorial finished!
      console.log("Tutorial ended")
      this.floatingAction.animateButton();
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    BackgroundGeolocation.removeAllListeners();
    if (unsubscribe1 !== null) {
      unsubscribe1();
    }
    if (unsubscribe2 !== null) {
      unsubscribe2();
    }
  }

  getElderlyList = () => {
    // Reset the elderlyList
    this.setState({
      elderlyUidList: [],
    });

    // Get list of elderly under this user
    dbRefElderlyUndercare.get().then(elderlyListSnapshot => {
      if (!elderlyListSnapshot.empty) {
        elderlyListSnapshot.forEach(elderlyList => {
          this.setState({
            elderlyUidList: this.state.elderlyUidList.concat({
              docID: elderlyList.id,
              data: elderlyList.data(),
            }),
            emptyList: false,
          });
        });

        this.getElderlyDetail();
      } else {
        this.setState({
          emptyList: true,
          elderlyList: []
        });
      }
    })
      .then(value =>
        Copilot.startTutorialIfNewUser(this.props, this.SCREEN_NAME, (err) => this.notifyMessage(err)));
  };

  getElderlyDetail = () => {
    this.setState({
      elderlyList: [],
    });

    // Get elderly detail
    this.state.elderlyUidList.forEach(elderly => {
      unsubscribe1 = dbRefElderlyDetail
        .where('Uid', '==', elderly.data.Uid)
        .onSnapshot(elderlyDetailSnapshot => {
          elderlyDetailSnapshot.forEach(doc => {
            unsubscribe2 = dbRefElderlyDetail
              .doc(doc.id)
              .collection('SeniorData')
              .where("DeviceType", "==", 1).orderBy("CreatedAt", "desc").limit(1)
              // .orderBy("CreatedAt", "desc").limit(1)
              .onSnapshot(snapshot => {
                if (snapshot._docs.length > 0) {
                  snapshot.forEach(health => {
                    let user = {
                      elderlyUnderCareDocID: elderly.docID,
                      docID: doc.id,
                      data: doc.data(),
                      health: health.data(),
                    };

                    // Check elderlyList whether has been added, update it
                    let index = this.state.elderlyList.findIndex(
                      item => item.data.Uid === doc.id,
                    );

                    if (index === -1) {
                      // Add new elderly to the elderlyList
                      this.setState({
                        elderlyList: [...this.state.elderlyList, user],
                      });
                    } else {
                      let tempElderlyList = this.state.elderlyList;
                      tempElderlyList[index] = user;
                      this.setState({
                        elderlyList: tempElderlyList,
                      });
                    }

                  });
                }//
                else {
                  let user = {
                    elderlyUnderCareDocID: elderly.docID,
                    docID: doc.id,
                    data: doc.data(),
                    health: "no data",
                  };

                  // Check elderlyList whether has been added, update it
                  let index = this.state.elderlyList.findIndex(
                    item => item.data.Uid === doc.id,
                  );

                  if (index === -1) {
                    // Add new elderly to the elderlyList
                    this.setState({
                      elderlyList: [...this.state.elderlyList, user],
                    });
                  } else {
                    let tempElderlyList = this.state.elderlyList;
                    tempElderlyList[index] = user;
                    this.setState({
                      elderlyList: tempElderlyList,
                    });
                  }
                }
              });
          });
        });
    });
  };

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
              dbRef
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
        interval: 10000,
        fastInterval: 5000,
      })
        .then(data => {
          console.log('requestLocationPermission ', data);
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
      stopOnTerminate: false,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 300000,
      fastestInterval: 300000, // Every 5mins get user's background location
      activitiesInterval: 300000,
      notificationsEnabled: true,
      startForeground: false,
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

      dbRef.update({
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

      dbRef.update({
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

  search = () => {
    if (this.state.searchElderlyPhoneNumber === null) {
      this.setState({
        errorMessage: translate('Please enter senior phone number'),
        showDialog: true,
      });
    } else {
      this.setState({
        loading: true,
      });

      // Add new elderly
      dbRefAddElderly = firestore().collection('Users');

      dbRefAddElderly
        .where('PhoneNumber', '==', this.state.searchElderlyPhoneNumber)
        .where('Role', '==', '0')
        .get()
        .then(searchElderlySnapshot => {
          if (searchElderlySnapshot.size === 0) {
            this.setState({
              errorMessage: translate('No senior was found'),
              showDialog: true,
            });
          } else {
            searchElderlySnapshot.forEach(foundElderlydata => {
              if (
                this.state.elderlyList.some(
                  item => foundElderlydata.data().Uid === item.docID,
                ) === true
              ) {
                this.setState({
                  errorMessage: translate('You have already added this senior'),
                  showDialog: true,
                  showAddUser: false,
                });
              } else {
                // Check whether is in elderly list
                dbRefElderlyCaregiverList = firestore().collection('Users').doc(foundElderlydata.data().Uid).collection('CaregiversList').where('PhoneNumber', '==', this.props.profile.PhoneNumber);
                dbRefElderlyCaregiverList.get().then(granted => {
                  if (!granted.empty) {

                    granted.forEach(doc => {
                      // Update senior caregiver list with FCM & UID
                      firestore()
                        .collection('Users')
                        .doc(foundElderlydata.data().Uid)
                        .collection('CaregiversList')
                        .doc(doc.id)
                        .update({
                          Uid: this.props.profile.Uid,
                          FcmToken: this.props.profile.FcmToken,
                          Accepted: true,
                          AcceptedAt: firestore.FieldValue.serverTimestamp()
                        })
                    });

                    // Add senior to the elderlyUnderCare
                    dbRefAddElderly
                      .doc(auth().currentUser.uid)
                      .collection('ElderlyUnderCare')
                      .add({
                        Uid: foundElderlydata.data().Uid,
                        CreatedAt: firestore.FieldValue.serverTimestamp(),
                      })
                      .then(() => {
                        this.setState({
                          searchElderlyPhoneNumber: null,
                          errorMessage: translate('Senior was added successfully'),
                          showDialog: true,
                          showAddUser: false,
                        });
                        this.getElderlyList();
                      });
                  }
                  else {
                    this.setState({
                      errorMessage: translate('You are not allow to add this senior'),
                      showDialog: true
                    });
                  }
                })
              }
            });
          }
        })
        .finally(() => {
          this.setState({
            loading: false,
          });
        });
    }
  };

  openTwoButtonAlert = item => {
    Alert.alert(
      translate('Confirmation'),
      translate('Do you want to remove this senior'),
      [
        {
          text: translate('CANCEL'),
          style: 'cancel',
        },
        {
          text: translate('YES'),
          onPress: () => {
            this.removed(item);
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  removed = item => {
    dbRefElderlyUndercare.doc(item.elderlyUnderCareDocID).delete();
    this.setState({
      errorMessage: translate('Senior has been removed'),
      showDialog: true,
    });
    this.getElderlyList();
  };

  swipeBtns = item => [{
    text: translate('Delete'),
    backgroundColor: 'red',
    underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    onPress: () => {
      this.openTwoButtonAlert(item);
    }
  }];

  checkInAnimation = {
    0: {
      opacity: 1,
      scale: 1,
    },
    0.5: {
      opacity: 0.7,
      scale: 1.1,
    },
    1: {
      opacity: 1,
      scale: 1,
    },
  };

  render() {
    const actions = [
      {
        text: translate('ADD SENIOR'),
        textColor: '#180D59',
        color: '#ffffff',
        tintColor: '#180D59',
        icon: <FontAwesome5 name="heart" size={25} color="#180D59" />,
        name: 'new_senior',
        position: 1,
      },
      {
        text: translate('STORE'),
        textColor: '#180D59',
        color: '#ffffff',
        tintColor: '#180D59',
        icon: <FontAwesome5 name="cart-plus" size={25} color="#180D59" />,
        name: 'store',
        position: 2,
      },
      // {
      //   text: translate('CAREGIVING'),
      //   textColor: '#180D59',
      //   color: '#ffffff',
      //   tintColor: '#180D59',
      //   icon: <FontAwesome5 name="briefcase" size={25} color="#180D59" />,
      //   name: 'caregiving',
      //   position: 3,
      // },
      // {
      //   text: translate('VOLUNTEERING EVENTS'),
      //   textColor: '#180D59',
      //   color: '#ffffff',
      //   tintColor: '#180D59',
      //   icon: <FontAwesome5 name="calendar-week" size={25} color="#180D59" />,
      //   name: 'volunteering',
      //   position: 3,
      // },
    ];

    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeareaview}>
            <Text
              style={styles.topLeft}
            // onPress={() => Copilot.triggerTutorial(this.props, this.SCREEN_NAME, (err) => this.notifyMessage(err))}
            >
              {`${translate("HELLO")} ${this.props.profile.Name}`},
            </Text>

            <ScrollView>
              <KeyboardAvoidingView>
                {this.state.emptyList == true &&
                  this.state.showAddUser == false ? (
                  <View style={[styles.EmptyContainer]}>
                    <Text
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#180D59',
                      }}>
                      {translate('ADD SENIOR')}
                    </Text>
                    <Text
                      style={{
                        marginBottom: 10,
                        fontSize: 14,
                        textAlign: 'center',
                        color: '#180D59',
                      }}>
                      {translate('Click the button below to add senior')}
                    </Text>
                  </View>
                ) : null}

                {this.state.showAddUser == true ? (
                  <Form
                    style={{
                      margin: 15,
                      padding: 10,
                      borderRadius: 20,
                      borderWidth: 2,
                      backgroundColor: '#ffffffcc',
                      alignItems: 'center',
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text
                          style={{
                            marginLeft: 30,
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#180D59',
                          }}>
                          {translate('ADD SENIOR')}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={{ alignItems: 'flex-end' }}
                        onPress={() => {
                          this.setState({ showAddUser: false });
                        }}>
                        <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                      </TouchableOpacity>
                    </View>

                    <Input
                      keyboardType="numeric"
                      autoFocus
                      style={{
                        margin: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        textAlign: 'center',
                      }}
                      placeholder={translate('Enter Senior Phone Number')}
                      placeholderTextColor="#b6b6b4"
                      onChangeText={text => {
                        this.setState({ searchElderlyPhoneNumber: text });
                      }}
                      backgroundColor="#ffffff"
                    />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        this.setState({
                          loading: true,
                        })
                        this.search(this.state.searchElderlyPhoneNumber)
                      }}>
                      <Text style={styles.text}>{translate('Submit')}</Text>
                    </TouchableOpacity>
                  </Form>
                ) : null}

                {this.state.emptyList == false ? (
                  <Text
                    style={{
                      marginTop: 10,
                      marginLeft: 15,
                      fontSize: 14,
                      textAlign: 'left',
                      color: '#ffffff',
                    }}>
                    {translate("SENIOR'S LATEST HEALTH VITALS")}:
                  </Text>
                ) : null}
                {/* <CopilotStep text={translate("SEE YOUR SENIORS' HEALTH VITALS HERE")} order={1} name="senior">
                  <Copilot.WalkthroughableView> */}
                <List>
                  {this.state.elderlyList.map((item, index) => (
                    <Swipeout right={this.swipeBtns(item)}
                      autoClose={true}
                      backgroundColor='transparent'>
                      <ListItem
                        // Performance settings
                        removeClippedSubviews={true} // Unmount components when outside of window
                        initialNumToRender={2} // Reduce initial render amount
                        maxToRenderPerBatch={1} // Reduce number in each render batch
                        updateCellsBatchingPeriod={200} // Increase time between renders
                        windowSize={4} // Reduce the window size
                        key={item.docID}
                        thumbnail
                        onLongPress={() => this.openTwoButtonAlert(item)}
                        onPress={() => {
                          console.log('onPress')
                          this.props.navigation.navigate('cgseniordetails', {
                            senior: item,
                          });
                        }}>
                        <DataContainer>
                          {item.health.CreatedAt !== null && (<View
                            style={{
                              marginTop: 5,
                              marginBottom: 5,
                              alignItems: 'center',
                            }}>
                            <Text darkBlue heavy medium>
                              {item.data.Name}
                            </Text>
                            {item.health.HeartRate !== undefined ? (
                              <Text grey heavy ultrasmall>
                                {translate('UPDATED ON')}{' '}
                                {
                                  moment(item.health.CreatedAt.toDate()).format('dddd') +
                                  ', ' +
                                  moment(item.health.CreatedAt.toDate()).format('DD MMM YYYY') +
                                  ' ' +
                                  moment(item.health.CreatedAt.toDate()).format('h:mm a')}
                              </Text>
                            ) : null}
                          </View>)}

                          {item.health.Battery <= 30 && (
                            <Animatable.View animation={this.checkInAnimation} easing="ease-in-out" iterationCount="infinite" iterationDelay={250}>
                              <Image
                                style={styles.ImageLowBatt}
                                source={require('../../assets/LowBatt.png')}
                              />
                            </Animatable.View>
                          )}

                          <DataInside>
                            <DataImage
                              source={require('../../assets/heartRate.png')}
                            />
                            <DataInfo>
                              <Text darkBlue large>
                                {translate('HEART RATE')}
                              </Text>
                              <Text darkBlue ultrasmall>
                                {item.data.MinHeartRate} - {item.data.MaxHeartRate}{' '}
                                BPM
                              </Text>
                            </DataInfo>
                            {item.health.HeartRate !== undefined ? (
                              <Text darkBlue large heavy>
                                {item.health.HeartRate} BPM
                              </Text>
                            ) : (<Text darkBlue large heavy>
                              -- BPM
                            </Text>)}
                          </DataInside>
                          <DataInside>
                            <DataImage source={require('../../assets/spo.png')} />
                            <DataInfo>
                              <Text darkBlue large>
                                {translate('SPO2')}
                              </Text>
                              <Text darkBlue small>
                                {item.data.MinSpo2} - {item.data.MaxSpo2} %
                              </Text>
                            </DataInfo>
                            {item.health.Spo2 !== undefined ? (
                              <Text darkBlue large heavy>
                                {item.health.Spo2}%
                              </Text>
                            ) : (<Text darkBlue large heavy>
                              -- %
                            </Text>)}
                          </DataInside>
                          <DataInside>
                            <DataImage source={require('../../assets/temp.png')} />
                            <DataInfo>
                              <Text darkBlue large>
                                {translate('TEMPERATURE')}
                              </Text>
                              <Text darkBlue small>
                                {item.data.MinTemp} - {item.data.MaxTemp} °C
                              </Text>
                            </DataInfo>
                            {item.health.Spo2 !== undefined ? (
                              <Text darkBlue large heavy>
                                {item.health.Temperature}°C
                              </Text>
                            ) : (<Text darkBlue large heavy>
                              -- °C
                            </Text>)}
                          </DataInside>
                        </DataContainer>
                      </ListItem>
                    </Swipeout>
                  ))}
                </List>
                {/* </Copilot.WalkthroughableView>
                </CopilotStep> */}

                <Spinner
                  color={'#2196f3'}
                  overlayColor={'#ffffff99'}
                  visible={this.state.loading}
                  tintColor="#123456"
                  textContent={translate('LOADING') + '...'}
                  textStyle={{ color: '#2196f3' }}
                />
              </KeyboardAvoidingView>
            </ScrollView>

            <SimpleDialog
              modalVisible={this.state.showDialog}
              onModalClosed={() => this.setState({ showDialog: false })}
              errorMessage={this.state.errorMessage}
            />

            {/* <CopilotStep text={translate("YOU CAN PERFORM OTHER TASKS TOO, SUCH AS VIEWING THE SENZHUB STORE")} order={3} name="last">
              <Copilot.WalkthroughableView style={styles.actionsOverlay}>
              </Copilot.WalkthroughableView>
            </CopilotStep> */}
            {/* This is an underlay of the floating action button for tutorial purposes.
        This is because wrapping copilot with the floating action does not work, so
        we have to create a replica manually */}
            <View style={styles.replicaContainer}>
              <View style={styles.replicaParent}>
                <CopilotStep text={translate("THIS BUTTON ALLOWS YOU TO ADD A SENIOR UNDER YOUR CARE INTO THE APP")} order={1} name="add button">
                  <Copilot.WalkthroughableView style={styles.replicaWrapper}>
                    <View style={styles.replica}></View>
                  </Copilot.WalkthroughableView>
                </CopilotStep>
              </View>
            </View>


            <FloatingAction
              color="#180D59"
              overlayColor="#180D5960"
              showBackground={true}
              actions={actions}
              ref={(ref) => { this.floatingAction = ref; }}
              onPressItem={name => {
                switch (name) {
                  case 'new_senior':
                    this.setState({ showAddUser: true });
                    break;

                  case 'store':
                    Linking.openURL('https://www.senzehub.com/shop');
                    break;

                  case 'caregiving':
                    Linking.openURL('https://www.senzecare.com/');
                    break;

                  case 'volunteering':
                    Linking.openURL('https://www.senzehealth.com/');
                    break;
                }
              }}
            />
          </SafeAreaView>
        </View>
      </ImageBackground>

    );
  }
}
const walkthroughableButton = walkthroughable(FloatingAction)
const styles = StyleSheet.create({
  actionsOverlay: {
    position: 'absolute',
    bottom: 0,
    width: 250,
    // height: 300,
    alignSelf: 'flex-end',
    backgroundColor: 'transparent'
  },
  replicaWrapper: {
    width: 56,
    height: 56,
    borderRadius: 56 / 2,
  },
  replicaParent: {
    marginHorizontal: 30,
    zIndex: 0,

  },
  replica: {
    width: 56,
    height: 56,
    borderRadius: 56 / 2,
    alignItems: "center",
    justifyContent: "center",

  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "transparent",
  },
  replicaContainer: {
    elevation: 10,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingVertical: 30,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  EmptyContainer: {
    backgroundColor: '#ffffffaa',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderRadius: 10,
    borderColor: '#180D59',
    borderWidth: 1,
    margin: 35,
    padding: 10,
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topLeft: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    top: 30,
    marginBottom: 40,
    left: 16,
    fontSize: 23,
    textAlign: 'left',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  safeareaview: {
    flex: 1,
  },
  input: {
    marginHorizontal: 30,
    marginVertical: 15,
    height: 50,
    borderColor: '#000000',
    borderWidth: 1,
  },
  text: {
    color: '#FFF',
  },
  button: {
    // marginHorizontal: 20,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  ImageLowBatt: {
    height: 65,
    width: 50,
    resizeMode: 'stretch',
  },
});

const Text = styled.Text`
  ${({ darkBlue, grey }) => {
    switch (true) {
      case darkBlue:
        return `color: #180D59`;
      case grey:
        return `color: grey`;
    }
  }}
  font-family: 'AvenirNext-Regular';
  ${({ title, large, medium, small, ultrasmall }) => {
    switch (true) {
      case title:
        return `font-size: 24px`;
      case large:
        return `font-size: 16px`;
      case medium:
        return `font-size: 14px`;
      case small:
        return `font-size: 12px`;
      case ultrasmall:
        return `font-size: 10px`;
    }
  }}
  ${({ bold, heavy, light }) => {
    switch (true) {
      case bold:
        return `font-weight: 600`;
      case heavy:
        return `font-weight: 700`;
      case light:
        return `font-weight: 100`;
    }
  }}
`;

const Container = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const DataContainer = styled.View`
  margin: 1%;
  padding: 1%;
  width: 94%;
  align-items: center;
  background-color: #ffffffaa;
  border-radius: 24px;
  border-width: 1px;
`;

const DataInside = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const DataImage = styled.Image`
  width: 30px;
  height: 30px;
  margin-right: 3%;
`;

const DataInfo = styled.View`
  flex: 1;
`;

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile, fetchAlerts })(copilot(Copilot.copilotConfig)(cgHome));
