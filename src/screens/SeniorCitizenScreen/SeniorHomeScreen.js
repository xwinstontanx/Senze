import React, { Component } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  SafeAreaView,
  View,
  Image,
  Alert,
  Platform,
  ImageBackground,
  Vibration,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  AppState
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';

// RN Copilot
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import * as Copilot from '../Functions/Tutorial';

import RBSheet from "react-native-raw-bottom-sheet";
import SimpleDialog from '../../components/SimpleDialog';
import styled from 'styled-components';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import getToken from '../Functions/FCMToken';

import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import firestore, { firebase } from '@react-native-firebase/firestore';

// Redux
import { connect } from 'react-redux';
import { setUserProfile, fetchActivities } from '../../redux/actions';

import BluetoothService from './BluetoothService';
import base64 from 'react-native-base64';
import { Buffer } from 'buffer';

import ButtonIconsSmall from '../../components/ButtonIconsSmall';
import HealthData from '../../components/HealthData';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../../../translations';
import {
  getTrackingStatus,
  requestTrackingPermission,
} from 'react-native-tracking-transparency';

import QRCode from 'react-qr-code';
import CryptoJS from 'react-native-crypto-js';

import GetLocation from 'react-native-get-location'

let dbRefUser;

// BLE Service UUIDs & Characteristic UUIDs
const ServiceUUID = 'a195ff00-bc46-11ea-b3de-0242ac130004';
const ReadCharacteristicUUID = 'a195ff01-bc46-11ea-b3de-0242ac130004';
const NotifyReadCharacteristicUUID = 'a195ff02-bc46-11ea-b3de-0242ac130004';
const ReadWriteCharacteristicUUID = 'a195ff03-bc46-11ea-b3de-0242ac130004';
const BattServiceUUID = '0000180f-0000-1000-8000-00805f9b34fb';
const BattCharacteristicUUID = '00002A19-0000-1000-8000-00805F9B34FB';

class SeniorHomeScreen extends Component {
  _isMounted = false;
  btAdpaterOn = false;
  isNewWearable = true;
  scaningTimeout = 150; //2.5mins
  pairedSenzeWearable;
  SCREEN_NAME = 'SeniorHomeScreen';

  constructor(props) {
    super(props);
    this.state = {
      geoStatus: '',
      geoLocation: '',
      latitude: '',
      longitude: '',

      checkInIcon: 'thumbs-up',
      checkInStatus: false,
      HeartRate: '--',
      Spo2: '--',
      Temperature: '--',
      Battery: 100,
      lastUpdatedTime: '-',
      Systolic: "--",
      Diastolic: "--",
      Pulse: "--",
      lastUpdatedTimeSD: '-',
      BloodGlucose: "--",
      lastUpdatedTimeBG: '-',
      Weight: "--",
      Height: "--",
      BMI: "--",
      lastUpdatedTimeW: '-',
      lastCheckIn: '-',
      deviceId: '-',

      battLevel: 0,
      // time: moment().format('dddd, DD MMM YYYY'),
      bleStatus: translate('CLICK HERE'),
      // startTime: new Date(),

      modalVisible: false,

      errorMessage: '',
      showDialog: false,

      showQR: false,
      codeTimer: 10,
      encryptedUidTimestamp: '',

      showAllHealthData: false,

      appState: AppState.currentState
    };
  }

  static defaultProps = {
    onStart: () => { },
    onEnd: () => { },
  };

  componentDidMount() {
    this._isMounted = true;

    // Set the firebase reference
    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);
    // Get user profile (once)
    dbRefUser.get().then(data => {
      this.props.setUserProfile(data.data());
      // Get FCM token
      getToken();
      this.getLocation();
      // this.getPairedWearable();
      this.getLastHealthData();
      this.getCheckInStatus();
      this.props.fetchActivities();
    });


    this.props.copilotEvents.on('stepChange', Copilot.handleStepChange);
    this.props.copilotEvents.on("stop", () => {
      // Copilot tutorial finished!
      console.log("Tutorial ended")
    });
    Copilot.startTutorialIfNewUser(this.props, this.SCREEN_NAME, (err) => this.notifyMessage(err));

    AppState.addEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.getCheckInStatus();
    }
    this.setState({ appState: nextAppState });
  }

  generateQR = () => {
    let currentTimeStamp = new Date().toString();
    // encrypt
    let encrypt = CryptoJS.AES.encrypt(
      this.props.profile.Uid + "-" + currentTimeStamp,
      'SenzeHub is the best'
    ).toString();
    this.setState({
      encryptedUidTimestamp: encrypt
    });
  }

  emergencyCancel() {
    const ONE_MIN = 60000
    firestore().collection("Notification")
      .where("SeniorUid", "==", firebase.auth().currentUser.uid).orderBy("CreatedAt", "desc").limit(1)
      .onSnapshot(querySnapshot => {
        if (querySnapshot != null && !querySnapshot.empty) {
          querySnapshot.forEach(doc => {
            if (doc.data().CreatedAt.toDate() >= Date.now() - ONE_MIN) {
              doc.ref.delete();
              this.notifyMessage('Help Cancelled Successfully');
            }
          })
        }
      });
  }


  componentWillUnmount() {
    this._isMounted = false;
    //this.watchID != null && Geolocation.clearWatch(this.watchID);
    BackgroundGeolocation.removeAllListeners();
    // Don't forget to disable event handlers to prevent errors
    this.props.copilotEvents.off("stop");
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  getLastHealthData = () => {
    dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 1).orderBy("CreatedAt", "desc").limit(1)
      .onSnapshot(healthDataSnapshot => {
        if (!healthDataSnapshot.empty) {
          healthDataSnapshot.forEach(data => {
            if (data.data().CreatedAt !== null && data.data().DeviceType === 1) {
              let date = data.data().CreatedAt.toDate();
              let time =
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('dddd') +
                ', ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('DD MMM YYYY') +
                ' ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('h:mm a');
              this.setState({
                lastUpdatedTime: time,
                HeartRate: data.data().HeartRate,
                Spo2: data.data().Spo2,
                Temperature: data.data().Temperature,
                Battery: data.data().Battery,
              });
            }
          });
        }
      });
    dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 3).orderBy("CreatedAt", "desc").limit(1)
      .onSnapshot(healthDataSnapshot => {
        if (!healthDataSnapshot.empty) {
          healthDataSnapshot.forEach(data => {
            if (data.data().CreatedAt !== null && data.data().DeviceType === 3) {
              let date = data.data().CreatedAt.toDate();
              let time =
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('dddd') +
                ', ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('DD MMM YYYY') +
                ' ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('h:mm a');
              this.setState({
                lastUpdatedTimeSD: time,
                Systolic: data.data().Systolic,
                Diastolic: data.data().Diastolic,
                Pulse: data.data().Pulse
              });
            }
          });
        }
      });
    dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 4).orderBy("CreatedAt", "desc").limit(1)
      .onSnapshot(healthDataSnapshot => {
        if (!healthDataSnapshot.empty) {
          healthDataSnapshot.forEach(data => {
            if (data.data().CreatedAt !== null && data.data().DeviceType === 4) {
              let date = data.data().CreatedAt.toDate();
              let time =
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('dddd') +
                ', ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('DD MMM YYYY') +
                ' ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('h:mm a');
              this.setState({
                lastUpdatedTimeW: time,
                Weight: data.data().Weight,
              });
            }
          });
        }
      });
    dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 5).orderBy("CreatedAt", "desc").limit(1)
      .onSnapshot(healthDataSnapshot => {
        if (!healthDataSnapshot.empty) {
          healthDataSnapshot.forEach(data => {
            if (data.data().CreatedAt !== null && data.data().DeviceType === 5) {
              let date = data.data().CreatedAt.toDate();
              let time =
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('dddd') +
                ', ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('DD MMM YYYY') +
                ' ' +
                moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('h:mm a');
              this.setState({
                lastUpdatedTimeBG: time,
                BloodGlucose: data.data().BloodGlucose,
              });
            }
          });
        }
      });
    dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 6).orderBy("CreatedAt", "desc").limit(1)
      .onSnapshot(healthDataSnapshot => {
        if (!healthDataSnapshot.empty) {
          healthDataSnapshot.forEach(data => {
            if (data.data().CreatedAt !== null && data.data().DeviceType === 6) {
              this.setState({
                Height: data.data().Height,
              });
            }
          });
        }
      });
    dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 7).orderBy("CreatedAt", "desc").limit(1)
      .onSnapshot(healthDataSnapshot => {
        if (!healthDataSnapshot.empty) {
          healthDataSnapshot.forEach(data => {
            if (data.data().CreatedAt !== null && data.data().DeviceType === 7) {
              this.setState({
                BMI: data.data().BMI,
              });
            }
          });
        }
      });
  };

  getCheckInStatus = () => {
    const start = new Date();
    const end = new Date();

    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);

    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);

    dbRefUser
      .collection('CheckInHistory')
      .where("CreatedAt", '>=', start)
      .where("CreatedAt", '<=', end)
      // .orderBy('CreatedAt', 'asc')
      // .limitToLast(1)
      .get()
      .then(checkInSnapshot => {
        if (!checkInSnapshot.empty) {
          checkInSnapshot.forEach(data => {
            if (data.data().CreatedAt !== null) {
              if (this.isToday(data.data().CreatedAt.toDate())) {
                this.setState({ checkInStatus: true, checkInIcon: 'check' })

                let date = data.data().CreatedAt.toDate();
                let time =
                  moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('dddd') +
                  ', ' +
                  moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('DD MMM YYYY') +
                  ' ' +
                  moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('h:mm a');
                this.setState({
                  lastCheckIn: time + " (" + moment(date, 'YYYY-MM-DDTHH:MM:SS.sssZ').fromNow() + ")",
                });
              }
            }
          })
        }
        else {
          this.setState({ checkInStatus: false, checkInIcon: 'thumbs-up' })
        }
      })
  }

  ShowQr = () => {
    this.setState({ showQR: true })
    this.generateQR();
    this.interval = setInterval(
      () => this.setState({
        codeTimer: this.state.codeTimer - 1
      }, () => {
        if (this.state.codeTimer === 0) {
          this.generateQR();
          this.setState({
            codeTimer: 10
          })
        }
      }),
      1000
    );
  };

  //Ble Manager
  Ble = () => {
    if (this.isNewWearable) {
      // Connect to the new wearable
      this.startbluetooth();
    }

    this.setState({ modalVisible: true });
  };

  startbluetooth(pairedWearable) {
    if (Platform.OS === 'android') {
      // Enable Bluetooth
      BluetoothService.enableBluetooth();
    }

    // Configure the Bluetooth Library
    const subscription = BluetoothService.getInstance().onStateChange(state => {
      // PoweredOn indicate bluetooth is on
      if (state === 'PoweredOn') {
        this.btAdpaterOn = true;
        subscription.remove();

        if (this.isNewWearable) {
          this.startScan(null);
        }
        else {
          this.startScan(pairedWearable);
        }
      } else if (state === 'PoweredOff') {
        this.btAdpaterOn = false;
        console.log('Bluetooth Off');
      }
    }, true);
  }

  startScan(pairedWearable) {
    this.setState({
      bleStatus: translate('SCANNING'),
    });

    if (this.btAdpaterOn === true) {
      BluetoothService.getInstance().startDeviceScan(
        null,
        null,
        (error, device) => {
          // let scanningDuration = moment(new Date()).diff(
          //   this.state.startTime,
          //   'seconds',
          // );

          // // Check scanning timeout
          // if (scanningDuration > this.scaningTimeout) {
          //   BluetoothService.getInstance().stopDeviceScan();

          //   this.notifyMessage(
          //     'Unable to pair with wearable, please restart the phone and try again',
          //   );
          // } 

          if (error) {
            console.log("startDeviceScan: " + error)
            // this.notifyMessage(JSON.stringify(error))
          }
          else {
            if (device !== null) {
              if ((device.name === 'SenzeWearable') &
                (device.rssi > -80)) {
                console.log('SenzeWearable found');

                this.setState({
                  deviceId: device.id
                })

                if (this.isNewWearable) {
                  // Stop scanning
                  BluetoothService.getInstance().stopDeviceScan();
                  this.connectWearable(device);
                }
                else if (device.id === pairedWearable.id) {
                  // Stop scanning
                  BluetoothService.getInstance().stopDeviceScan();
                  this.connectWearable(device);
                }
              }
            }
          }
        },
      );
    }
  }

  connectWearable(device) {
    this.setState({
      bleStatus: translate('PAIRING'),
    });

    if (device) {
      BluetoothService.getInstance()
        .connectToDevice(device.id)
        .then(dev => {
          console.log('Paired with device: ' + device.id);

          this.pairedSenzeWearable = dev
          this.setState({
            bleStatus: translate('PAIRED'),
          });

          AsyncStorage.setItem(
            'wearableID',
            JSON.stringify(this.decycle(dev)),
            err => {
              if (err) {
                this.notifyMessage(err);
              }
            },
          ).catch(err => {
            this.notifyMessage(err);
          });

          const subscription = BluetoothService.getInstance().onDeviceDisconnected(
            device.id,
            (error, device) => {
              if (error) {
                console.log('onDeviceDisconnected ', error);
                this.notifyMessage(error + '. Please make sure you have pressed the button on the wearable. If issue persists, kindly restart your phone and try again');
              }
              this.setState({
                bleStatus: translate('DISCONNECTED'),
              });
              console.log('Device is disconnected');
              this.getPairedWearable();
              subscription.remove();
            },
          );

          dev
            .discoverAllServicesAndCharacteristics()
            .then(() => this.getServicesAndCharacteristics(dev))
            .catch(error => {
              console.log(error)
              this.notifyMessage(err);
            });
        })
        .catch(error => {
          this.notifyMessage(error + '. Please make sure you have pressed the button on the wearable. If issue persists, kindly restart your phone and try again');
          this.getPairedWearable();
        });
    }
  }

  getPairedWearable() {
    // Get the paired wearable details
    AsyncStorage.getItem('wearableID').then(pairedWearableDetail => {

      let pairedWearable = JSON.parse(pairedWearableDetail);
      if (pairedWearableDetail !== 'undefined' && pairedWearable !== null) {
        this.isNewWearable = false;

        BluetoothService.getInstance()
          .isDeviceConnected(pairedWearable.id)
          .then(status => {
            console.log('wearable status ' + status);
            if (!status) {
              // Connect the wearable automatically
              this.startbluetooth(pairedWearable);
            }
            // else {
            //   // BluetoothService.resetInstance();
            //   // this.getPairedWearable();
            //   // this.startbluetooth(pairedWearable);

            //   // this.setState({
            //   //   bleStatus: translate('PAIRED'),
            //   // });
            // }
          });
      }
    });
  }

  // logging all characteristics
  getServicesAndCharacteristics(device) {

    // // Command to set Date (Write) to wearable
    // const date = new Date(); // current date
    // let bytesWD = new Int8Array(5);

    // bytesWD[0] = 0x61; // command
    // bytesWD[1] = date.getFullYear() - 2000; // year - 2000
    // bytesWD[2] = date.getMonth() + 1; // month
    // bytesWD[3] = date.getDate(); // day
    // bytesWD[4] = date.getDay(); // day of week

    // device
    //   .writeCharacteristicWithoutResponseForService(
    //     ServiceUUID,
    //     ReadWriteCharacteristicUUID,
    //     base64.encodeFromByteArray(bytesWD),
    //   )
    //   .then(success => {
    //     console.log('Write Date success');
    //   })
    //   .catch(error => {
    //     console.log(error);
    //   });

    // // Command to set Time (Write) to wearable
    // let time = new Date(); // current time
    // let bytesWT = new Int8Array(7);

    // bytesWT[0] = 0x62; // command
    // bytesWT[1] = time.getHours(); // hours
    // bytesWT[2] = time.getMinutes(); // minutes
    // bytesWT[3] = time.getSeconds(); // seconds
    // bytesWT[4] = time.getHours() >= 12 ? 1 : 0; // AM = 0, PM = 1
    // bytesWT[5] = 0; // 24hr = 0, 12hr = 1
    // bytesWT[6] = time.getTimezoneOffset(); // timezone

    // device
    //   .writeCharacteristicWithoutResponseForService(
    //     ServiceUUID,
    //     ReadWriteCharacteristicUUID,
    //     base64.encodeFromByteArray(bytesWT),
    //   )
    //   .then(success => {
    //     console.log('Write Time success');
    //   })
    //   .catch(error => {
    //     console.log(error);
    //   });

    // // Command to get battery level (Notify) value
    // device.readCharacteristicForService(
    //   BattServiceUUID,
    //   BattCharacteristicUUID,
    // );

    // device.monitorCharacteristicForService(
    //   BattServiceUUID,
    //   BattCharacteristicUUID,
    //   (error, characteristic) => {
    //     if (characteristic) {
    //       // Process the battery characteristic value
    //       const buffer = Buffer.from(characteristic.value, 'base64');
    //       const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars
    //       console.log('battery Level', parseInt(bufString[0], 16));

    //       this.setState({
    //         battLevel: parseInt(bufString[0], 16),
    //       });
    //     }
    //   },
    // ).catch(error => {
    //   console.log(error);
    // });

    // // Command to get fall (Notify) value
    // var bytesFall = new Int8Array(2);
    // bytesFall[0] = 0x37; // command
    // bytesFall[1] = 1; // index to retrieve - NOT USED

    // device.writeCharacteristicWithResponseForService(
    //   ServiceUUID,
    //   NotifyReadCharacteristicUUID,
    //   base64.encodeFromByteArray(bytesFall),
    // );

    this.readSensorValue();

    try {
      device.monitorCharacteristicForService(
        ServiceUUID,
        NotifyReadCharacteristicUUID,
        (error, characteristic) => {

          if (characteristic.value !== null) {
            // Process the sensor characteristic value
            const buffer = Buffer.from(characteristic.value, 'base64');
            const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars
            let splitToByte = bufString.toString().split(',');
            let dataArray = [];
            for (var i = 0; i < splitToByte.length; i++) {
              dataArray.push(parseInt(splitToByte[i], 16));
            }

            // For sensor value
            if (
              dataArray.length === 12 &&
              (dataArray[0] === 0x33 || dataArray[0] === 0x37)
            ) {
              console.log('Wearable Status: ' + dataArray[1])
              // dataArray[1]: Wearable Status
              // 0: Undetected
              // 1: Off Skin
              // 2: On Some Subject
              // 3: On Skin
              if (dataArray[1] === 3) {

                console.log('Confident Level for HR: ' + dataArray[7])  // dataArray[7]: Confident Level for HR
                console.log('Confident Level for Spo2: ' + dataArray[8])  // dataArray[8]: Confident Level for Spo2

                // Vitals value
                let tempValue = dataArray[2] + dataArray[3] / 100;
                tempValue = tempValue.toFixed(1);
                let heartrateValue = dataArray[4];
                let spo2Value = dataArray[5];

                // Battery value
                let battValue = dataArray[6];

                // Fall Detection
                let fallValue = '0';
                if (dataArray[0] === 0x37 && dataArray[2] === 0xaa) {
                  fallValue = '1';
                }

                // Prevent data overflow
                heartrateValue = heartrateValue < parseInt(240, 10) ? heartrateValue : 80;
                spo2Value = spo2Value < parseInt(240, 10) ? spo2Value : 92;

                // Push vitals data
                firestore()
                  .collection('Users')
                  .doc(auth().currentUser.uid)
                  .collection('SeniorData')
                  .add({
                    CreatedAt: firestore.FieldValue.serverTimestamp(),
                    HeartRate: heartrateValue,
                    Spo2: spo2Value,
                    Temperature: tempValue,
                    Battery: battValue,
                    Fall: fallValue,
                    DeviceID: this.state.deviceId,
                    DeviceType: 1
                  })
                  .then(() => {

                    // Check Temperature out of range
                    if (
                      tempValue < parseInt(this.props.profile.MinTemp, 10) ||
                      tempValue > parseInt(this.props.profile.MaxTemp, 10)
                    ) {
                      this.sendOFRAlert(tempValue + '°C', 'Temperature')
                    }

                    // Check Heartrate out of range
                    if ((heartrateValue <
                      parseInt(this.props.profile.MinHeartRate, 10) ||
                      heartrateValue >
                      parseInt(this.props.profile.MaxHeartRate, 10))) {
                      this.sendOFRAlert(heartrateValue + 'BPM', 'Heart Rate')
                    }

                    // Check SpO2 out of range
                    if ((spo2Value < parseInt(this.props.profile.MinSpo2, 10) ||
                      spo2Value > parseInt(this.props.profile.MaxSpo2, 10))) {
                      this.sendOFRAlert(spo2Value + '%', 'Spo2')
                    }

                    // Check batt low
                    if (battValue <= parseInt(30, 10)) {
                      this.sendOFRAlert(battValue + '%', 'Battery')
                    }
                  });
              }
              else {
                this.notifyMessage(translate('Please adjust the position of your wearable'));
              }
            }
          }
          if (error) {
            // this.notifyMessage(error);
          }
        },
      )
    }
    catch (error) {
      console.log(error)
      // this.notifyMessage(error);
    }
  }

  decycle(obj, stack = []) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (stack.includes(obj)) {
      return null;
    }

    let s = stack.concat([obj]);

    return Array.isArray(obj)
      ? obj.map(x => this.decycle(x, s))
      : Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, this.decycle(v, s)]),
      );
  }

  //Function to get GeoLoaction
  sendOFRAlert = (readingValue, readingName) => {
    firestore().collection('Notification')
      .add({
        Name: this.props.profile.Name,
        Address: this.props.profile.Address,
        PostalCode: this.props.profile.PostalCode,
        PhoneNumber: this.props.profile.PhoneNumber,
        SosNumber: this.props.profile.SosNumber,
        NotifyStatus: 'healthdDataOFR',
        readingValue: readingValue,
        readingName: readingName,
        Attendee: '',
        currentLocation: this.state.geoLocation,
        //status 1 ==> Notification Open status 0 ==> Notification Close
        Status: 1,
        SeniorUid: auth().currentUser.uid,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      })
      .catch((err) => {
        this.notifyMessage(err);
        console.log(
          'Home Screen [sendNotification] adding Data Error',
          err,
        );
      });
  }

  // Command to read sensor value
  readSensorValue = () => {
    try {
      var bytesNRT = new Int8Array(2);
      bytesNRT[0] = 0x33; // command
      bytesNRT[1] = 1; // index to retrieve - NOT USED

      this.pairedSenzeWearable.writeCharacteristicWithResponseForService(
        ServiceUUID,
        NotifyReadCharacteristicUUID,
        base64.encodeFromByteArray(bytesNRT),
      )
    }
    catch (error) {
      console.log(error)
      this.notifyMessage(err);
    };
  }

  //Function to get GeoLoaction
  getLocation = () => {
    if (Platform.OS === 'android') {
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
    } else if (Platform.OS === 'ios') {
      getTrackingStatus().then(trackingStatus => {
        console.log('trackingStatus', trackingStatus);
        if (trackingStatus === 'not-determined') {
          try {
            requestTrackingPermission().then(requestStatus => {
              if (
                requestStatus === 'authorized' ||
                requestStatus === 'unavailable'
              ) {
                this.requestLocationPermission();
              }
            });
          } catch (e) {
            Alert.alert('Error', e?.toString?.() ?? e);
          }
        } else if (
          trackingStatus === 'authorized' ||
          trackingStatus === 'unavailable'
        ) {
          console.log('trackingStatus', trackingStatus);
          // enable tracking features
          this.requestLocationPermission();
        } else if (trackingStatus === 'denied') {
          requestTrackingPermission().then(requestStatus => {
            if (
              requestStatus === 'authorized' ||
              requestStatus === 'unavailable'
            ) {
              this.requestLocationPermission();
            }
          });
        }
      });

      setTimeout(() => { }, 1000);
    }
  };

  requestLocationPermission = () => {
    if (Platform.OS === 'android') {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then(async data => {
          // The user has accepted to enable the location services data can be :
          //  - "already-enabled" if the location services has been already enabled
          //  - "enabled" if user has clicked on OK button in the popup
          if (data === 'enabled' || data === 'already-enabled') {
            await requestMultiple([
              PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
              PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
              PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
              PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            ])
            this.getLocationOnce();
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
      this.getLocationOnce();
    }
  };

  //Function to get GeoLocation Once
  getLocationOnce = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        console.log(location);
        if (this._isMounted) {
          this.setState({
            geoLocation: {
              coordinates: new firestore.GeoPoint(
                location.latitude,
                location.longitude,
              ),
            },
          });
        }

        dbRefUser.update({
          GeoLocation: this.state.geoLocation,
        });

        console.log(this.state.geoLocation);
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      })

  }

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

      if (this._isMounted) {
        this.setState({
          geoLocation: {
            coordinates: new firestore.GeoPoint(
              location.latitude,
              location.longitude,
            ),
          },
        });
      }

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
      if (this._isMounted) {
        this.setState({
          geoLocation: {
            coordinates: new firestore.GeoPoint(
              stationaryLocation.latitude,
              stationaryLocation.longitude,
            ),
          },
        });
      }

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

  notifyMessage(msg) {
    if (this._isMounted) {
      this.setState({
        errorMessage: msg,
        showDialog: true,
      });
    }
  }

  phoneCall = () => {
    const phoneNumber = this.props.profile.SosNumber;
    if (phoneNumber === '123') {
      Alert.alert(
        '',
        'Kindly update the Next Of Kin (NOK) number to the emergency contact to call in the Profile Page',
        [
          {
            text: 'OK',
            onPress: () =>
              this.props.navigation.navigate('seniorProfileSetting'),
          },
        ],
      );
    } else {
      RNImmediatePhoneCall.immediatePhoneCall(phoneNumber);
    }
  };

  sendNotification = () => {
    firestore().collection('Notification')
      .add({
        Name: this.props.profile.Name,
        Address: this.props.profile.Address,
        PostalCode: this.props.profile.PostalCode,
        PhoneNumber: this.props.profile.PhoneNumber,
        SosNumber: this.props.profile.SosNumber,
        Country: this.props.profile.Country,
        NotifyStatus: 'open',
        CurrentLocation: this.state.geoLocation,
        Status: 1,
        SeniorUid: auth().currentUser.uid,
        Attendee: "",
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        firestore().collection('VolunteerChats')
          .doc(auth().currentUser.uid)
          .collection('Chats')
          .add({
            Content: translate("EMERGENCY TRIGGERED"),
            CreatedAt: firestore.FieldValue.serverTimestamp(),
            IsSystem: true,
            Name: this.props.profile.Name,
            Uid: auth().currentUser.uid,
          }).then(() => {
            this.notifyMessage('Help Sent Successfully');
          })
      })
      .catch(err => {
        this.notifyMessage(err);
      });
  };

  isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
  };

  // Check In
  checkIn = () => {
    if (!this.state.checkInStatus) {
      firestore().collection('Notification')
        .add({
          Name: this.props.profile.Name,
          Address: this.props.profile.Address,
          PostalCode: this.props.profile.PostalCode,
          PhoneNumber: this.props.profile.PhoneNumber,
          SosNumber: this.props.profile.SosNumber,
          NotifyStatus: 'checkin',
          Country: this.props.profile.Country,
          CurrentLocation: this.state.geoLocation,
          Status: 1,
          SeniorUid: auth().currentUser.uid,
          CreatedAt: firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          dbRefUser.collection('CheckInHistory').add({
            CreatedAt: firestore.FieldValue.serverTimestamp(),
          }).then(() => {
            this.getCheckInStatus();
            this.notifyMessage('Check In Successfully');
          });

        })
        .catch(err => {
          this.notifyMessage(err);
        });
    }
    else {
      this.notifyMessage('You have checked in for today');
    }

    // dbRefUser
    //   .collection('CheckInHistory')
    //   .orderBy('CreatedAt', 'asc')
    //   .limitToLast(1)
    //   .onSnapshot(healthDataSnapshot => {
    //     if (!healthDataSnapshot.empty) {
    //       healthDataSnapshot.forEach(data => {
    //         if (data.data().CreatedAt !== null) {
    //           if (this.isToday(data.data().CreatedAt.toDate())) {
    //             let date = data.data().CreatedAt.toDate();
    //             let time =
    //               moment(date).format('dddd') +
    //               ', ' +
    //               moment(date).format('DD MMM YYYY') +
    //               ' ' +
    //               moment(date).format('h:mm a');
    //             this.setState({
    //               lastCheckIn: time + " (" + moment(date).fromNow() + ")",
    //             });
    //             this.notifyMessage('Last check in on ' + time + " (" + moment(date).fromNow() + ")");

    //           }
    //           else {
    //             firestore().collection('Notification')
    //               .add({
    //                 Name: this.props.profile.Name,
    //                 Address: this.props.profile.Address,
    //                 PostalCode: this.props.profile.PostalCode,
    //                 PhoneNumber: this.props.profile.PhoneNumber,
    //                 SosNumber: this.props.profile.SosNumber,
    //                 NotifyStatus: 'checkin',
    //                 Country: this.props.profile.Country,
    //                 CurrentLocation: this.state.geoLocation,
    //                 Status: 1,
    //                 SeniorUid: auth().currentUser.uid,
    //                 CreatedAt: firestore.FieldValue.serverTimestamp(),
    //               })
    //               .then(() => {
    //                 dbRefUser.collection('CheckInHistory').add({
    //                   CreatedAt: firestore.FieldValue.serverTimestamp(),
    //                 });
    //                 this.notifyMessage('Check In Successfully');

    //               })
    //               .catch(err => {
    //                 this.notifyMessage(err);
    //               });
    //           }
    //         }
    //       });
    //     }
    //   });
  };

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
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={styles.container}>
          <ScrollView>

            <View style={styles.top}>
              <Text style={styles.topLeft}>
                {/* <Text style={styles.topLeft} onPress={() => Copilot.triggerTutorial(this.props, this.SCREEN_NAME, (err) => this.notifyMessage(err))}> */}
                {`${translate('HELLO')}, \n`}
                {this.props.profile.Name}
              </Text>

              <Image
                style={styles.ImageTop}
                source={require('../../assets/top.png')}
              />

              {/* <CopilotStep text={translate("WELCOME TO SENZEHUB! PAIR YOUR WEARABLE HERE!")} order={1} name="bluetooth">
                <Copilot.WalkthroughableTouchableOpacity style={styles.topRight} onPress={this.Ble}>
                  <FontAwesome5 name="bluetooth" size={30} color="#ffffff" />
                  <Text style={styles.Text}>{this.state.bleStatus}</Text>
                  {this.state.Battery <= 30 && (
                    <Animatable.View animation={this.checkInAnimation} easing="ease-in-out" iterationCount="infinite" iterationDelay={250}>
                      <Image
                        style={styles.ImageLowBatt}
                        source={require('../../assets/LowBatt.png')}
                      />
                    </Animatable.View>
                  )}
                </Copilot.WalkthroughableTouchableOpacity>
              </CopilotStep> */}

              <CopilotStep text={translate("Welcome to SenzeHub! Show your QR code here!")} order={1} name="qrCode">
                <Copilot.WalkthroughableTouchableOpacity style={styles.topRight} onPress={this.ShowQr}>
                  <FontAwesome5 name="qrcode" size={30} color="#ffffff" />
                  <Text style={styles.Text}>{translate("QR CODE")}</Text>
                </Copilot.WalkthroughableTouchableOpacity>
              </CopilotStep>
            </View>

            <CopilotStep text={translate("SEE YOUR RECENT VITALS HERE")} order={2} name="vitals">
              <Copilot.WalkthroughableView>

                <View style={styles.container2}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginLeft: 15,
                      }}>
                      <CopilotStep text={translate("ADD MEASUREMENTS LIKE BLOOD PRESSURE, BLOOD GLUCOSE AND WEIGHT HERE")} order={3} name="add">
                        <Copilot.WalkthroughableTouchableOpacity
                          onPress={() => {
                            this.props.navigation.navigate('seniorNewReading');
                          }}>

                          {/* <WalkthroughableView> */}
                          <FontAwesome5 name={'plus'} size={25} color="#180D59" />
                          {/* </WalkthroughableView> */}

                        </Copilot.WalkthroughableTouchableOpacity>
                      </CopilotStep>
                    </View>
                    <Text style={styles.title0}>{translate('LATEST VITALS')}</Text>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        marginRight: 15,
                      }}>
                      <CopilotStep text={translate("SEE THE HISTORY OF YOUR VITALS HERE")} order={4} name="history">
                        <Copilot.WalkthroughableTouchableOpacity
                          onPress={() => {
                            this.props.navigation.navigate('seniorHistory');
                          }}>
                          <FontAwesome5 name={'history'} size={25} color="#180D59" />
                        </Copilot.WalkthroughableTouchableOpacity>
                      </CopilotStep>
                    </View>
                  </View>
                  <Text style={styles.title2}>
                    {translate('UPDATED ON')} {this.state.lastUpdatedTime}
                  </Text>

                  <View style={styles.container2_1}>
                    <HealthData
                      icon={require('../../assets/heartRate.png')}
                      title={translate("HEART RATE")}
                      value={this.state.HeartRate}
                      unit="BPM"
                    />
                    <HealthData
                      icon={require('../../assets/spo.png')}
                      title={translate("SPO2")}
                      value={this.state.Spo2}
                      unit="%"
                    />
                    <HealthData
                      icon={require('../../assets/temp.png')}
                      title={translate("TEMPERATURE")}
                      value={this.state.Temperature}
                      unit="°C"
                    />
                  </View>

                  {this.state.showAllHealthData === true && (
                    <Text style={styles.title2}>
                      {translate("UPDATED ON")} {this.state.lastUpdatedTimeSD}
                    </Text>
                  )}

                  {this.state.showAllHealthData === true && (
                    <View style={styles.container2_1}>
                      <HealthData
                        icon={require('../../assets/bp.png')}
                        title={translate("SYSTOLIC")}
                        value={this.state.Systolic}
                        unit="mmHg"
                      />
                      <HealthData
                        icon={require('../../assets/bp.png')}
                        title={translate("DIASTOLIC")}
                        value={this.state.Diastolic}
                        unit="mmHg"
                      />
                      <HealthData
                        icon={require('../../assets/heartRate.png')}
                        title={translate('Pulse')}
                        value={this.state.Pulse}
                        unit="BPM" />
                    </View>
                  )}

                  {this.state.showAllHealthData === true && (
                    <Text style={styles.title2}>
                      {translate("UPDATED ON")}  {this.state.lastUpdatedTimeBG}
                    </Text>
                  )}

                  {this.state.showAllHealthData === true && (
                    <View style={styles.container2_1}>
                      <HealthData
                        icon={require('../../assets/bloodGlucose.png')}
                        title={translate("BLOOD GLUCOSE")}
                        value={this.state.BloodGlucose}
                        unit="mmol/L"
                      />
                    </View>
                  )}

                  {this.state.showAllHealthData === true && (
                    <Text style={styles.title2}>
                      {translate("UPDATED ON")} {this.state.lastUpdatedTimeW}
                    </Text>
                  )}

                  {this.state.showAllHealthData === true && (
                    <View style={styles.container2_1}>
                      <HealthData
                        icon={require('../../assets/weight.jpeg')}
                        title={translate("WEIGHT")}
                        value={this.state.Weight}
                        unit="kg"
                      />
                      <HealthData
                        icon={require('../../assets/height.png')}
                        title={translate("Height")}
                        value={this.state.Height}
                        unit="kg"
                      />
                      <HealthData
                        icon={require('../../assets/bmi.png')}
                        title={translate("BMI")}
                        value={this.state.BMI}
                        unit="kg"
                      />
                    </View>
                  )}



                  <TouchableOpacity
                    onPress={() => { this.setState({ showAllHealthData: !this.state.showAllHealthData }) }}
                    style={[
                      {
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        borderWidth: 2,
                        width: '95%',
                        height: 40,
                        marginTop: 10,
                        backgroundColor: '#ffffffaa',
                      },
                    ]}>
                    <Text
                      style={[
                        {
                          color: this.props.title === 'Check In' ? '#ffffff' : '#180D59',
                          fontSize: 18,
                        },
                      ]}>
                      {this.state.showAllHealthData ? translate("HIDE HEALTH RECORDS") : translate("MORE HEALTH RECORDS")}

                    </Text>
                  </TouchableOpacity>
                </View>

              </Copilot.WalkthroughableView>
            </CopilotStep>

            {/* <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <RBSheet
                ref={ref => {
                  this.RBSheet = ref;
                }}
                height={650}
                openDuration={250}
                customStyles={{
                  container: {
                    justifyContent: "center",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                  },
                  // wrapper: {
                  //   backgroundColor: "transparent"
                  // },
                  // draggableIcon: {
                  //   backgroundColor: "#000"
                  // }
                }}
              >
                <View style={{ flex: 0 }}>
                  <TouchableOpacity
                    style={{ marginTop: 5, marginRight: 5, alignItems: 'flex-end' }}
                    onPress={() => {
                      this.RBSheet.close();
                    }}>
                    <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.title2}>
                  {translate("UPDATED ON")} {this.state.lastUpdatedTimeSD}
                </Text>

                <View style={styles.container2_1}>
                  <HealthData
                    icon={require('../../assets/bp.png')}
                    title={translate("SYSTOLIC")}
                    value={this.state.Systolic}
                    unit="mmHg"
                  />
                  <HealthData
                    icon={require('../../assets/bp.png')}
                    title={translate("DIASTOLIC")}
                    value={this.state.Diastolic}
                    unit="mmHg"
                  />
                </View>

                <Text style={styles.title2}>
                  {translate("UPDATED ON")}  {this.state.lastUpdatedTimeBG}
                </Text>

                <View style={styles.container2_1}>
                  <HealthData
                    icon={require('../../assets/bloodGlucose.png')}
                    title={translate("BLOOD GLUCOSE")}
                    value={this.state.BloodGlucose}
                    unit="mmol/L"
                  />
                </View>

                <Text style={styles.title2}>
                  {translate("UPDATED ON")} {this.state.lastUpdatedTimeW}
                </Text>

                <View style={styles.container2_1}>
                  <HealthData
                    icon={require('../../assets/weight.jpeg')}
                    title={translate("WEIGHT")}
                    value={this.state.Weight}
                    unit="kg"
                  />
                </View>
              </RBSheet>
            </View> */}


            <View style={styles.container2}>
              <Text style={styles.title0}>{translate("HEALTH STATUS")} </Text>
              <View style={styles.container3}>
                <CopilotStep text={translate("REMEMBER TO CHECK IN DAILY!")} order={5} name="checkIn">
                  <Copilot.WalkthroughableView style={styles.container3}>
                    {this.state.checkInIcon === 'thumbs-up' ?
                      <Animatable.View animation={this.checkInAnimation} easing="ease-in-out" iterationCount="infinite" iterationDelay={750}>
                        <ButtonIconsSmall
                          title={translate('CHECK IN')}
                          icon={this.state.checkInIcon}
                          click={() => {
                            this.checkIn();
                          }}
                        />
                      </Animatable.View> :
                      <ButtonIconsSmall
                        title={translate('CHECKED IN')}
                        icon={this.state.checkInIcon}
                        click={() => {
                          this.checkIn();
                        }}
                      />}
                  </Copilot.WalkthroughableView>
                </CopilotStep>
                <CopilotStep text={translate("EMERGENCIES ONLY!")} order={6} name="emergency">
                  <Copilot.WalkthroughableView style={styles.container3}>
                    <ButtonIconsSmall
                      title={translate('EMERGENCY')}
                      icon={'phone'}
                      click={() => {
                        this.sendNotification();
                        Vibration.vibrate(1 * 1000);
                        this.phoneCall();
                      }}
                      onLongPress={() => {
                        // firebase.firestore().collection("Notification")
                        // .where("Name", "==", this.props.profile.Name)
                        // .where("CreatedAt", ">=", firebase.firestore.Timestamp.fromMillis(Date.now() - 60000)).get()
                        // .then(querySnapshot => {
                        //   querySnapshot.docs[0].ref.delete();
                        // });

                        (this.emergencyCancel());
                      }}
                    />
                  </Copilot.WalkthroughableView>
                </CopilotStep>
              </View>
              {
                this.state.lastCheckIn !== '-' ? <Text style={styles.title3}>
                  {translate('LAST CHECK IN ON')} {"\n" + this.state.lastCheckIn}
                </Text> : null
              }

            </View>

            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.showQR}
              onRequestClose={() => {
                this.setState({ showQR: false });
                clearInterval(this.interval);
              }}>

              <TouchableOpacity
                style={{ margin: 5, alignItems: 'flex-end', marginTop: '10%' }}
                onPress={() => {
                  this.setState({ showQR: false });
                  clearInterval(this.interval);
                }}>
                <FontAwesome5 name="times-circle" size={35} color="#180D59" />
              </TouchableOpacity>

              <View style={styles.modalView}>
                <QRCode value={this.state.encryptedUidTimestamp} />
                <Text style={styles.greeting2}>{this.props.profile.Name}</Text>
              </View>

            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modalVisible}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                this.setState({ modalVisible: false });
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      textDecorationLine: 'underline',
                      marginBottom: 10,
                      fontSize: 25,
                    }}>
                    Wearable
                  </Text>
                  {(this.state.bleStatus === 'Scanning' || this.state.bleStatus === 'Pairing') && (
                    <View>
                      <ActivityIndicator size="large" color="#0000ff" />
                      <Text style={{ textAlign: 'center' }}>
                        {this.state.bleStatus}
                      </Text>
                      <View
                        style={{
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: '#000',
                          marginTop: 15,
                          marginBottom: 15,
                          padding: 15,
                        }}>
                        <Image
                          style={styles.ImageTop1}
                          source={require('../../assets/wearable_label.png')}
                        />

                        <Text style={styles.guides}>
                          1. Make sure green LED blinks while pairing. Press
                          button once if LED does not blink.
                        </Text>
                        <Text style={styles.guides}>
                          2. Orange LED blinks 3 times after connection is well
                          established.
                        </Text>
                      </View>
                    </View>
                  )}
                  {this.state.bleStatus === 'Paired' && (
                    <View>
                      <Text style={{ textAlign: 'center' }}>
                        Paired Successfully
                      </Text>
                      <View
                        style={{
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: '#000',
                          marginTop: 15,
                          marginBottom: 15,
                          padding: 15,
                        }}>
                        <Image
                          style={styles.ImageTop2}
                          source={require('../../assets/wearable_connected.png')}
                        />

                      </View>
                    </View>
                  )}
                  <View sytle={{ justifyContent: 'space-around', flexDirection: 'row' }}>
                    {this.state.bleStatus === 'Paired' && (<Pressable
                      style={[styles.button2, styles.buttonClose]}
                      onPress={() => {
                        this.readSensorValue();
                        this.setState({ modalVisible: false });
                      }}>
                      <Text style={styles.textStyle}>Read Value</Text>
                    </Pressable>)}
                    <Pressable
                      style={[styles.button, styles.buttonClose]}
                      onPress={() => {
                        this.setState({ modalVisible: false });
                      }}>
                      <Text style={styles.textStyle}>Close</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>

            <SimpleDialog
              modalVisible={this.state.showDialog}
              onModalClosed={() => {
                this.setState({ showDialog: false });
                if (this.state.errorMessage === translate('Please adjust the position of your wearable')) {
                  this.readSensorValue();
                }
              }}
              errorMessage={this.state.errorMessage}
            />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const Container = styled.View`
  flex: 1;
`;

const DataContainer = styled.View`
  margin-top: 25%;
  margin-left: 2%;
  margin-right: 2%;
  padding-top: 20px;
  border-width: 2px;
  border-color: #000000;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
`;

const DataInside = styled.View`
  align-items: center;
`;

const styles = StyleSheet.create({
  imgBackground: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    height: '100%',
    marginBottom: 10,
    marginTop: Platform.OS === 'ios' ? '5%' : '0%',
  },
  container2: {
    flexDirection: 'column',
    borderColor: '#2196f322',
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    paddingTop: 10,
    paddingBottom: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    // justifyContent: 'space-around',
    backgroundColor: '#ffffffaa',
  },
  container2_1: {
    flexDirection: 'column',
    margin: 5,
    alignSelf: 'stretch',
    justifyContent: 'space-around',
  },
  container3: {
    flexDirection: 'row',
    margin: 10,
    alignSelf: 'stretch',
    justifyContent: 'space-around',
  },
  greeting2: {
    top: 15,
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: '#2196F3',
  },
  ImageTop: {
    flex: 1,
    height: 100,
    width: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: '-5%',
  },
  ImageLowBatt: {
    height: 65,
    width: 50,
    resizeMode: 'stretch',
  },
  topRight: {
    flex: 1,
    alignItems: 'flex-end',
    top: 10,
    right: 10,
  },
  top: {
    flex: 1,
    flexDirection: "row",
    justifyContent: 'space-between',
    // alignItems: 'flex-start',
    // position: 'absolute',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#ffffff',
    marginBottom: '5%'
  },
  topLeft: {
    flex: 1,
    alignItems: 'flex-start',
    // position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  topLeft2: {
    // position: 'absolute',
    top: 220,
    left: 16,
    fontSize: 20,
    textAlign: 'right',
    color: '#000000',
  },
  Text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  text: {
    color: '#2196f3',
    fontWeight: '700',
    fontSize: 18,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },

  ImageTop1: {
    height: 180,
    width: '100%',
    resizeMode: 'contain',
  },
  ImageTop2: {
    height: 157,
    width: 225,
    resizeMode: 'stretch',
  },
  guides: {
    textAlign: 'left',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    elevation: 2,
    color: '#180D59',
    textAlign: 'center',
    borderColor: '#180D59',
    borderWidth: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
  },
  button2: {
    borderRadius: 20,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    elevation: 2,
    color: '#00FF00',
    textAlign: 'center',
    borderColor: '#180D59',
    borderWidth: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#180D59',
    textAlign: 'center',
    marginLeft: 20,
    fontSize: 26,
  },
  icon: {
    marginTop: 5,
    height: 30,
  },
  title0: {
    color: '#180D59',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
    textDecorationLine: 'underline',
    alignItems: 'center',
  },
  title1: {
    color: '#180D59',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
    textDecorationLine: 'underline',
  },
  title2: {
    color: '#180D59',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 10,
  },
  title3: {
    color: '#180D59',
    textAlign: 'center',
    fontSize: 12,
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile, fetchActivities })(copilot(Copilot.copilotConfig)(SeniorHomeScreen));
