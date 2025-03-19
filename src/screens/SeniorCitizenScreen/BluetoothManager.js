/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
  PermissionsAndroid,
  AppState,
  FlatList,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
// import BleManager from 'react-native-ble-manager';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
//https://polidea.github.io/react-native-ble-plx/
//import {BleManager} from 'react-native-ble-plx';
//https://www.npmjs.com/package/react-native-base64
import base64 from 'react-native-base64';
import {connect} from 'react-redux';
import {setElderly} from '../../redux/actions';
import {Buffer} from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BluetoothService from './BluetoothService';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import moment from 'moment';
import {__esModule} from '@babel/runtime/helpers/interopRequireDefault';

// BLE Service UUIDs & Characteristic UUIDs
const ServiceUUID = 'a195ff00-bc46-11ea-b3de-0242ac130004';
const ReadCharacteristicUUID = 'a195ff01-bc46-11ea-b3de-0242ac130004';
const NotifyReadCharacteristicUUID = 'a195ff02-bc46-11ea-b3de-0242ac130004';
const ReadWriteCharacteristicUUID = 'a195ff03-bc46-11ea-b3de-0242ac130004';
const BattServiceUUID = '0000180f-0000-1000-8000-00805f9b34fb';
const BattCharacteristicUUID = '00002A19-0000-1000-8000-00805F9B34FB';

let dbRefUser;

class BluetoothManager extends Component {
  _isMounted = false;
  bt_On = false;
  scaningTimeout = 120; //2.5mins

  constructor() {
    super();

    this.state = {
      errorMessage: null,
      showDialog: false,

      scanning: false,
      connectionStatus: 0,
      appState: '',
      MaxHeartRate: '',
      MaxSpo2: '',
      MaxTemp: '',
      MinHeartRate: '',
      MinSpo2: '',
      MinTemp: '',
      count: 0,
      battLevel: 0,
      SosNumber: '',
      name: '',
      postalcode: '',
      phonenumber: '',
      address: '',

      startTime: new Date(),
    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.setElderly(false);

    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);

    dbRefUser.get().then(data => {
      if (data.exists) {
        this.setState({
          MaxHeartRate: data.data().MaxHeartRate,
          MinHeartRate: data.data().MinHeartRate,
          MaxSpo2: data.data().MaxSpo2,
          MinSpo2: data.data().MinSpo2,
          MaxTemp: data.data().MaxTemp,
          MinTemp: data.data().MinTemp,
          name: data.data().Name,
          address: data.data().Address,
          phonenumber: data.data().PhoneNumber,
          postalcode: data.data().PostalCode,
          SosNumber: data.data().SosNumber,
        });
      }
    });

    // Enable Bluetooth
    BluetoothService.enableBluetooth();

    // Configure the Bluetooth Library
    const subscription = BluetoothService.getInstance().onStateChange(state => {
      // PoweredOn indicate bluetooth is on
      if (state === 'PoweredOn') {
        bt_On = true;
        console.log('Bluetooth PoweredOn');
        subscription.remove();

        // Get back the wearable details
        this.readBleHistory();
      } else if (state === 'PoweredOff') {
        if (this._isMounted) {
          this.setState({bleStatus: 'Not Paired'});
        }
        bt_On = false;
        console.log('Bluetooth PoweredOff');
        BluetoothService.getInstance().resetInstance();
      }
    }, true);

    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  readBleHistory() {
    // Get back the wearable details
    AsyncStorage.getItem('wearableID').then(value => {
      let device = JSON.parse(value);
      if (value !== 'undefined' && device !== null) {
        // Check the connection has established
        BluetoothService.getInstance()
          .isDeviceConnected(device.id)
          .then(status => {
            if (!status) {
              this.connectWearable(device);
            } else {
              if (this._isMounted) {
                this.setState({
                  scanning: false,
                  connectionStatus: 2,
                  bleStatus: 'Paired',
                });
              }
            }
          });
      } else {
        console.log('AsyncStorage first time');
        // If not data means first time pairing
        this.startScan();
      }
    });
  }

  startScan() {
    if (this._isMounted) {
      this.setState({
        scanning: true,
        connectionStatus: 0,
        bleStatus: 'Scanning',
      });
    }

    BluetoothService.getInstance().startDeviceScan(
      null,
      null,
      (error, device) => {
        let scanningDuration = moment(new Date()).diff(
          this.state.startTime,
          'seconds',
        );

        // Check scanning timeout
        if (scanningDuration > this.scaningTimeout) {
          BluetoothService.getInstance().stopDeviceScan();

          if (this._isMounted) {
            this.setState({
              scanning: false,
              connectionStatus: 0,
              bleStatus: 'Not Paired',
            });
          }

          this.notifyMessage(
            'Unable to pair with wearable, please restart the phone and try again',
          );
        } else if (error) {
          if (this._isMounted) {
            this.setState({
              scanning: false,
              connectionStatus: 0,
              bleStatus: 'Not Paired',
            });
          }
          this.notifyMessage(error);
          return;
        } else if ((device.name === 'SenzeWearable') & (device.rssi > -80)) {
          // Filter and only add SenzeWearable to the list
          console.log('RSSI', device.rssi);
          // Stop scaning
          BluetoothService.getInstance().stopDeviceScan();

          this.connectWearable(device);
        }
      },
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
    BluetoothService.getInstance().stopDeviceScan();
  }

  connectWearable(device) {
    if (this._isMounted) {
      this.setState({
        scanning: false,
        connectionStatus: 1,
        bleStatus: 'Pairing',
      });
    }

    if (device) {
      console.log('device.id: ' + device.id);

      BluetoothService.getInstance()
        .connectToDevice(device.id, {autoConnect: true})
        .then(dev => {
          if (this._isMounted) {
            this.setState({
              scanning: false,
              connectionStatus: 2,
              bleStatus: 'Paired',
            });
          }

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

          BluetoothService.getInstance().onDeviceDisconnected(
            device.id,
            (error, device) => {
              if (error) {
                console.log(error);
              }
              if (this._isMounted) {
                this.setState({
                  scanning: false,
                  connectionStatus: 0,
                });
              }
              //this.reconnectWearable(device);
              console.log('Device is disconnected');
            },
          );

          dev
            .discoverAllServicesAndCharacteristics()
            .then(d => this.getServicesAndCharacteristics(dev));
        })
        .catch(error => {
          if (this._isMounted) {
            this.setState({
              scanning: false,
              connectionStatus: 0,
              bleStatus: 'Not Paired',
            });
          }
          console.log(error);
        });
    }
  }

  reconnectWearable(device) {
    if (this._isMounted) {
      this.setState({
        scanning: false,
        connectionStatus: 0,
        bleStatus: 'Not Paired',
      });
    }

    if (this.bt_On) {
      // Get back the wearable details
      this.readBleHistory();

      // BluetoothService.getInstance()
      // .cancelDeviceConnection(device.id)
      // .catch((err) => console.log('error on cancel connection', err));
    }
  }

  // logging all characteristics
  getServicesAndCharacteristics(device) {
    //const characteristics = [];

    // Command to set Date (Write) to wearable
    const date = new Date(); // current date
    let bytesWD = new Int8Array(5);

    bytesWD[0] = 0x61; // command
    bytesWD[1] = date.getFullYear() - 2000; // year - 2000
    bytesWD[2] = date.getMonth() + 1; // month
    bytesWD[3] = date.getDate(); // day
    bytesWD[4] = date.getDay(); // day of week
    console.log('writing date = ', bytesWD);

    device
      .writeCharacteristicWithoutResponseForService(
        ServiceUUID,
        ReadWriteCharacteristicUUID,
        base64.encodeFromByteArray(bytesWD),
      )
      .then(success => {
        console.log('Write Date success');
      })
      .catch(error => {
        console.log(error);
      });

    // Command to set Time (Write) to wearable
    let time = new Date(); // current time
    let bytesWT = new Int8Array(7);

    bytesWT[0] = 0x62; // command
    bytesWT[1] = time.getHours(); // hours
    bytesWT[2] = time.getMinutes(); // minutes
    bytesWT[3] = time.getSeconds(); // seconds
    bytesWT[4] = time.getHours() >= 12 ? 1 : 0; // AM = 0, PM = 1
    bytesWT[5] = 0; // 24hr = 0, 12hr = 1
    bytesWT[6] = time.getTimezoneOffset(); // timezone
    console.log('writing time = ', bytesWT);

    device
      .writeCharacteristicWithoutResponseForService(
        ServiceUUID,
        ReadWriteCharacteristicUUID,
        base64.encodeFromByteArray(bytesWT),
      )
      .then(success => {
        console.log('Write Time success');
      })
      .catch(error => {
        console.log(error);
      });

    // Command to get battery level (Notify) value
    device.readCharacteristicForService(
      BattServiceUUID,
      BattCharacteristicUUID,
    );

    device.monitorCharacteristicForService(
      BattServiceUUID,
      BattCharacteristicUUID,
      (error, characteristic) => {
        console.log(characteristic);
        if (characteristic) {
          // Process the battery characteristic value
          const buffer = Buffer.from(characteristic.value, 'base64');
          const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars
          console.log('battery Level', parseInt(bufString[0], 16));
          if (this._isMounted) {
            this.setState({
              battLevel: parseInt(bufString[0], 16),
            });
          }

          console.log(this.state.battLevel);
        }
      },
    );

    // Command to get fall (Notify) value
    var bytesFall = new Int8Array(2);
    bytesFall[0] = 0x37; // command
    bytesFall[1] = 1; // index to retrieve - NOT USED

    device.writeCharacteristicWithResponseForService(
      ServiceUUID,
      NotifyReadCharacteristicUUID,
      base64.encodeFromByteArray(bytesFall),
    );

    // Command to get sensor (Notify) value
    var bytesNRT = new Int8Array(2);
    bytesNRT[0] = 0x33; // command
    bytesNRT[1] = 1; // index to retrieve - NOT USED

    device.writeCharacteristicWithResponseForService(
      ServiceUUID,
      NotifyReadCharacteristicUUID,
      base64.encodeFromByteArray(bytesNRT),
    );

    device.monitorCharacteristicForService(
      ServiceUUID,
      NotifyReadCharacteristicUUID,
      (error, characteristic) => {
        if (characteristic) {
          // Process the sensor characteristic value
          console.log('characteristic.value ' + characteristic.value);
          const buffer = Buffer.from(characteristic.value, 'base64');
          const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars
          console.log(bufString);
          let splitToByte = bufString.toString().split(',');
          let dataArray = [];
          for (var i = 0; i < splitToByte.length; i++) {
            // console.log(splitToByte[i]);
            dataArray.push(parseInt(splitToByte[i], 16));
          }

          // Send to firebase
          // For sensor value
          if (
            dataArray.length === 12 &&
            (dataArray[0] === 0x33 || dataArray[0] === 0x37)
          ) {
            let tempValue = dataArray[2] + dataArray[3] / 100;
            tempValue = tempValue.toFixed(1);
            let heartrateValue = dataArray[4];
            let spo2Value = dataArray[5];
            let zeroPad = (num, places) => String(num).padStart(places, '0');
            var addYear = dataArray[6] + 2000;

            // To prevent invalid timestamp
            //if (addYear >= 2021 && addYear < 2031) {
            var wear =
              addYear +
              '-' +
              zeroPad(dataArray[7], 2) +
              '-' +
              zeroPad(dataArray[8], 2) +
              'T' +
              zeroPad(dataArray[9], 2) +
              ':' +
              zeroPad(dataArray[10], 2) +
              ':' +
              zeroPad(dataArray[11], 2) +
              '.000Z';

            console.log(wear);

            let dbRef;
            let dbRef1;

            dbRef = firestore()
              .collection('Users')
              .doc(auth().currentUser.uid)
              .collection('SeniorData');

            dbRef1 = firestore().collection('Notification');

            // To make sure battery level has been read before sending to firebase
            //if (this.state.battLevel !== 0) {
            let fallValue = '0';
            // Fall Detected
            if (dataArray[0] === 0x37 && dataArray[2] === 0xaa) {
              fallValue = '1';
            }

            console.log('Sent to Firestore');
            dbRef
              .add({
                CreatedAt: firestore.FieldValue.serverTimestamp(),
                HeartRate: heartrateValue,
                Spo2: spo2Value,
                Temperature: tempValue,
                Battery: this.state.battLevel,
                Fall: fallValue,
              })
              .then(ref => {
                // Check for reading that is out of health range *****
                console.log(this.state.MaxHeartRate);

                // Check Temperature out of range
                if (
                  tempValue < parseInt(this.state.MinTemp, 10) ||
                  tempValue > parseInt(this.state.MaxTemp, 10)
                ) {
                  dbRef1
                    .add({
                      Name: this.state.name,
                      Address: this.state.address,
                      PostalCode: this.state.postalcode,
                      PhoneNumber: this.state.phonenumber,
                      SosNumber: this.state.SosNumber,
                      NotifyStatus: 'healthdDataOFR',
                      ReadingValue: tempValue + '°C',
                      ReadingName: 'Temperature',
                      Attendee: '',
                      CurrentLocation: this.state.geoLocation,
                      //status 1 ==> Notification Open status 0 ==> Notification Close
                      Status: 1,
                      SeniorUid: auth().currentUser.uid,
                      CreatedAt: firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                      console.log('Notification Data Added....');
                    })
                    .catch(err => {
                      console.log(
                        'Home Screen [sendNotification] adding Data Error',
                        err,
                      );
                    });
                } else if (
                  // Check Heartrate out of range
                  (heartrateValue < parseInt(this.state.MinHeartRate, 10) ||
                    heartrateValue > parseInt(this.state.MaxHeartRate, 10)) &&
                  heartrateValue !== parseInt(255, 10)
                ) {
                  dbRef1
                    .add({
                      Name: this.state.name,
                      Address: this.state.address,
                      PostalCode: this.state.postalcode,
                      PhoneNumber: this.state.phonenumber,
                      SosNumber: this.state.SosNumber,
                      NotifyStatus: 'healthdDataOFR',
                      ReadingValue: heartrateValue,
                      ReadingName: 'Heart Rate',
                      Attendee: '',
                      CurrentLocation: this.state.geoLocation,
                      //status 1 ==> Notification Open status 0 ==> Notification Close
                      Status: 1,
                      SeniorUid: auth().currentUser.uid,
                      CreatedAt: firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                      console.log('Notification Data Added....');
                    })
                    .catch(err => {
                      console.log(
                        'Home Screen [sendNotification] adding Data Error',
                        err,
                      );
                    });
                } else if (
                  // Check SpO2 out of range
                  (spo2Value < parseInt(this.state.MinSpo2, 10) ||
                    spo2Value > parseInt(this.state.MaxSpo2, 10)) &&
                  spo2Value !== parseInt(255, 10)
                ) {
                  dbRef1
                    .add({
                      Name: this.state.name,
                      Address: this.state.address,
                      PostalCode: this.state.postalcode,
                      PhoneNumber: this.state.phonenumber,
                      SosNumber: this.state.SosNumber,
                      NotifyStatus: 'healthdDataOFR',
                      readingValue: spo2Value + '%',
                      readingName: 'Spo2',
                      Attendee: '',
                      currentLocation: this.state.geoLocation,
                      //status 1 ==> Notification Open status 0 ==> Notification Close
                      Status: 1,
                      SeniorUid: auth().currentUser.uid,
                      CreatedAt: firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                      console.log('Notification Data Added....');
                    })
                    .catch(err => {
                      console.log(
                        'Home Screen [sendNotification] adding Data Error',
                        err,
                      );
                    });
                } //
                else if (
                  // Check batt low
                  this.state.battLevel < parseInt(40, 10)
                ) {
                  dbRef1
                    .add({
                      Name: this.state.name,
                      Address: this.state.address,
                      PostalCode: this.state.postalcode,
                      PhoneNumber: this.state.phonenumber,
                      SosNumber: this.state.SosNumber,
                      NotifyStatus: 'healthdDataOFR',
                      readingValue: this.state.battLevel + '%',
                      readingName: 'Battery',
                      Attendee: '',
                      currentLocation: this.state.geoLocation,
                      //status 1 ==> Notification Open status 0 ==> Notification Close
                      Status: 1,
                      SeniorUid: auth().currentUser.uid,
                      CreatedAt: firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                      console.log('Notification Data Added....');
                    })
                    .catch(err => {
                      console.log(
                        'Home Screen [sendNotification] adding Data Error',
                        err,
                      );
                    });
                } //
              });
            //}
            //}
          }
        } else if (error) {
          console.log('monitorCharacteristicForService', error);
        }
      },
    );
  }

  notifyMessage(msg) {
    if (this._isMounted) {
      this.setState({
        errorMessage: msg,
        showDialog: true,
      });
    }
  }

  //Hardware Back Button Navigate to Home page
  handleBackButtonClick() {
    this.props.navigation.navigate('Home');
    return true;
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

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.topTitle}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => {
              this.handleBackButtonClick();
            }}>
            <Icon name="arrow-circle-left" size={40} color="#2196f3" />
          </TouchableOpacity>
          <Text style={styles.greeting}>Wearable</Text>
        </View>

        <ScrollView>
          <KeyboardAvoidingView>
            <View style={styles.container}>
              {this.state.scanning && (
                <View>
                  <View
                    style={{
                      margin: 30,
                    }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={{textAlign: 'center'}}>Scanning</Text>
                  </View>
                  <View
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#000',
                      margin: 20,
                      padding: 5,
                    }}>
                    <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                      Guidelines
                    </Text>
                    <Image
                      style={styles.ImageTop}
                      source={require('../../assets/wearable_label.png')}
                    />

                    <Text style={styles.guides}>
                      1. Make sure green LED blinks while pairing. Press button
                      once if LED does not blink.
                    </Text>
                    <Text style={styles.guides}>
                      2. Orange LED blinks 3 times after connection is well
                      established.
                    </Text>
                  </View>
                </View>
              )}
              {this.state.connectionStatus === 1 && (
                <View
                  style={{
                    margin: 30,
                  }}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text style={{textAlign: 'center'}}>
                    Connecting to wearable
                  </Text>
                  <View
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#000',
                      margin: 20,
                      padding: 5,
                    }}>
                    <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                      Guidelines
                    </Text>
                    <Image
                      style={styles.ImageTop}
                      source={require('../../assets/wearable_label.png')}
                    />

                    <Text style={styles.guides}>
                      1. Make sure green LED blinks while pairing. Press button
                      once if LED does not blink.
                    </Text>
                    <Text style={styles.guides}>
                      2. Orange LED blinks 3 times after connection is well
                      established.
                    </Text>
                  </View>
                </View>
              )}
              {this.state.connectionStatus === 2 && (
                <Image
                  style={styles.ImageTop2}
                  source={require('../../assets/wearable_connected.png')}
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({showDialog: false});
            if (
              this.state.errorMessage ===
                'Unable to pair with wearable, please restart the phone and try again' ||
              this.state.errorMessage === 'Wearable is connected'
            ) {
              this.props.navigation.navigate('Home');
            }
          }}
          errorMessage={this.state.errorMessage}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
  guides: {
    textAlign: 'left',
    marginLeft: 15,
    marginLeft: 15,
  },
  row: {
    margin: 10,
  },
  ImageTop: {
    height: 180,
    width: '100%',
    resizeMode: 'contain',
  },
  ImageTop2: {
    height: 220,
    width: '100%',
    resizeMode: 'contain',
    marginTop: 40,
  },
  topTitle: {
    flexDirection: 'column',
    margin: 15,
  },
  greeting: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#180D59',
    alignSelf: 'center',
  },
  back: {
    position: 'absolute',
  },
});

/**
 * get data from state
 * @param {object} state state inside redux store
 */
const mapStateToProps = state => ({
  profile: state.main.profile,
  elderlyLoading: state,
});

export default connect(mapStateToProps, {setElderly})(BluetoothManager);
