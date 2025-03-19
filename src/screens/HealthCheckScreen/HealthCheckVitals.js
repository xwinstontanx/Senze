import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
} from 'react-native';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import { connect } from 'react-redux';
import BluetoothService from './BluetoothService';
import base64 from 'react-native-base64';
import { Buffer } from 'buffer';
import { translate } from '../../../translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

let dbRefUser;

// BLE Service UUIDs & Characteristic UUIDs
const ServiceUUID = 'a195ff00-bc46-11ea-b3de-0242ac130004';
const ReadCharacteristicUUID = 'a195ff01-bc46-11ea-b3de-0242ac130004';
const NotifyReadCharacteristicUUID = 'a195ff02-bc46-11ea-b3de-0242ac130004';
const ReadWriteCharacteristicUUID = 'a195ff03-bc46-11ea-b3de-0242ac130004';
const BattServiceUUID = '0000180f-0000-1000-8000-00805f9b34fb';
const BattCharacteristicUUID = '00002A19-0000-1000-8000-00805F9B34FB';

class HealthCheckVitals extends Component {
  _isMounted = false;
  scaningTimeout = 120; //2.5mins
  isNewWearable = true;
  pairedSenzeWearable;

  constructor(props) {
    super(props);
    this.state = {
      manualInput: false,
      autoInput: false,
      showFields: false,
      HeartRate: "--",
      Spo2: "--",
      Temperature: "--",
      deviceId: "--",
      bleStatus: 'Not Paired',
      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;

    // Stop scanning
    BluetoothService.getInstance().stopDeviceScan();
    console.log("Stop scanning")

    try {
      if (this.state.deviceId !== "--") {
        BluetoothService.getInstance()
          .isDeviceConnected(this.state.deviceId)
          .then(status => {
            console.log('status ' + status);
            if (status) {
              this.pairedSenzeWearable.cancelConnection();
            }
          });
      }
    } catch (error) {
      console.log(error)
    }
  }

  async startbluetooth(pairedWearable) {
    if (Platform.OS === 'android') {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 60000,
        fastInterval: 60000,
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
    }
  }

  startScan(pairedWearable) {
    console.log('start scanning')

    this.setState({
      bleStatus: translate('SCANNING'),
    });

    if (this.btAdpaterOn === true) {
      BluetoothService.getInstance().startDeviceScan(
        null,
        null,
        (error, device) => {
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
              // this.getPairedWearable();
              subscription.remove();

              this.props.navigation.state.params.onGoBack();
              this.props.navigation.goBack();
            },
          );

          dev
            .discoverAllServicesAndCharacteristics()
            .then(() => this.getServicesAndCharacteristics(dev))
            .catch(error => {
              console.log(error)
              this.notifyMessage(error);
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
            if (!status) {
              // Connect the wearable automatically
              this.startbluetooth(pairedWearable);
            }
          });
      }
    });
  }

  // logging all characteristics
  getServicesAndCharacteristics(device) {

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
              // console.log('Wearable Status: ' + dataArray[1])
              // dataArray[1]: Wearable Status
              // 0: Undetected
              // 1: Off Skin
              // 2: On Some Subject
              // 3: On Skin
              if (dataArray[1] === 3) {

                // console.log('Confident Level for HR: ' + dataArray[7])  // dataArray[7]: Confident Level for HR
                // console.log('Confident Level for Spo2: ' + dataArray[8])  // dataArray[8]: Confident Level for Spo2

                // Vitals value
                let tempValue = dataArray[2] + dataArray[3] / 100;
                tempValue = tempValue.toFixed(1);
                let heartrateValue = dataArray[4];
                let spo2Value = dataArray[5];

                // console.log('Spo2: ' + spo2Value)
                // console.log('Hr: ' + heartrateValue)
                // console.log('Temperature: ' + tempValue)

                // Battery value
                // let battValue = dataArray[6];

                // Fall Detection
                let fallValue = '0';
                // if (dataArray[0] === 0x37 && dataArray[2] === 0xaa) {
                //   fallValue = '1';
                // }

                // Prevent data overflow
                heartrateValue = heartrateValue < parseInt(240, 10) ? heartrateValue : 80;
                spo2Value = spo2Value < parseInt(240, 10) ? spo2Value : 92;

                this.setState({
                  HeartRate: heartrateValue.toString(),
                  Spo2: spo2Value.toString(),
                  Temperature: tempValue,
                  bleStatus: 'Done'
                })

              }
              else {
                this.setState({
                  bleStatus: 'Need to adjust the wearable',
                });
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

      this.setState({
        bleStatus: 'Reading Vitals',
      });
    }
    catch (error) {
      console.log(error)
      this.notifyMessage(error);
    };
  }

  removePairedDevice = async () => {
    try {
      AsyncStorage.getItem('wearableID').then(value => {
        let device = JSON.parse(value);
        if (value !== 'undefined' && device !== null) {
          // Check the connection has established
          try {
            BluetoothService.getInstance()
              .isDeviceConnected(pairedWearable.id)
              .then(status => {
                if (status) {
                  // Connect the wearable automatically
                  this.pairedWearable.cancelConnection();
                }
              });
          }
          catch (error) {
            console.log(error)
          }
        }
      });

      await AsyncStorage.removeItem('wearableID');
      this.setState({
        showDialog: true,
        errorMessage: translate('Unpair successfully'),
      });
      return true;
    } catch (exception) {
      console.log('exception', exception);
      return false;
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

  handleManualInput = () => {
    this.setState({
      manualInput: true, autoInput: false, showFields: true, HeartRate: "",
      Spo2: "", Temperature: ""
    });
  };

  handleAutoInput = () => {
    this.setState({
      manualInput: false,
      autoInput: true,
      showFields: true,
      HeartRate: "--",
      Spo2: "--",
      Temperature: "--"
    });
    this.startbluetooth();
  };

  handleWifiDeviceInput = () => {
    firestore()
      .collection('HealthCheckDevice')
      .doc('HealthCheckDevice')
      .update({
        health_check_uid: this.props.navigation.state.params.Uid,
        // DeviceType: 2,
        // CreatedAt: firestore.FieldValue.serverTimestamp(),
      });
    firestore()
      .collection('HealthCheckDevice')
      .doc('HealthCheckDeviceInfo')
      .update({
        health_check_uid: this.props.navigation.state.params.Uid,
        DeviceType: 2,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      });
    // ** Fix me: remember to change to other HealthCheckLocation or use the location of the scanner
    // firestore()
    //   .collection('Users')
    //   .doc(this.props.navigation.state.params.Uid)
    //   .update({
    //     HealthCheckLocation: "BRP",  // BRP or Yishun
    //   });
    this.successAdded();
  };

  successAdded = () => {
    this.setState({
      errorMessage: translate('Succesfully Added'),
      showDialog: true,
    });
  };

  submit = () => {
    if (this.state.manualInput === false) {
      try {
        BluetoothService.getInstance()
          .isDeviceConnected(pairedWearable.id)
          .then(status => {
            if (status) {
              // Connect the wearable automatically
              this.pairedWearable.cancelConnection();
            }
          });
      }
      catch (error) {
        console.log(error)
      }
    }

    firestore()
      .collection('Users')
      .doc(this.props.navigation.state.params.Uid)
      .collection('SeniorData')
      .add({
        DeviceType: 1,
        HeartRate: this.state.HeartRate,
        Spo2: this.state.Spo2,
        Temperature: this.state.Temperature,
        DeviceID: this.state.deviceId,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      });

    // ** Fix me: remember to change to other HealthCheckLocation or use the location of the scanner
    // firestore()
    //   .collection('Users')
    //   .doc(this.props.navigation.state.params.Uid)
    //   .update({
    //     HealthCheckLocation: "BRP",  // BRP or Yishun
    //   });
    this.successAdded();
  };

  notifyMessage(msg) {
    if (this._isMounted) {
      this.setState({
        errorMessage: msg,
        showDialog: true,
      });
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <KeyboardAvoidingView>
            <View style={styles.container}>
              <StatusBar barStyle="light-content" />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 40,
                }}>
                <TouchableOpacity
                  style={styles.back}
                  onPress={() => {
                    this.props.navigation.navigate('healthCheckData');
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.greeting}>
                  {translate('Vitals Readings')}
                </Text>
              </View>
            </View>

            {this.state.manualInput == false && this.state.showFields == false && (
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={[
                    styles.buttonMain,
                    { backgroundColor: '#2196f3', alignItems: 'center' },
                  ]}
                  onPress={this.handleManualInput}>
                  <Text style={styles.text}>{translate('Input vitals manually')}</Text>
                </TouchableOpacity>
                <Text
                  style={{ textAlign: 'center', margin: 15, color: 'grey' }}>
                  ---------- {translate('or')} ---------
                </Text>
                <TouchableOpacity
                  style={[
                    styles.buttonMain,
                    { backgroundColor: '#2196f3', alignItems: 'center' },
                  ]}
                  onPress={this.handleAutoInput}>
                  <Text style={styles.text}>{translate('Retrieve vitals from wearable')}</Text>
                </TouchableOpacity>
                <Text
                  style={{ textAlign: 'center', margin: 15, color: 'grey' }}>
                  ---------- {translate('or')} ---------
                </Text>
                <TouchableOpacity
                  style={[
                    styles.buttonMain,
                    { backgroundColor: '#2196f3', alignItems: 'center' },
                  ]}
                  onPress={this.handleWifiDeviceInput}>
                  <Text style={styles.text}>{translate('Retrieve vitals from device')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {this.state.manualInput == true && this.state.showFields == true && (
              <View style={styles.container2}>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('HEART RATE')}  (BPM)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={HeartRate => this.setState({ HeartRate })}
                    value={this.state.HeartRate}
                  />
                </View>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('SPO2')}  (%)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={Spo2 => this.setState({ Spo2 })}
                    value={this.state.Spo2}
                  />
                </View>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('TEMPERATURE')}  (°C)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={Temperature => this.setState({ Temperature })}
                    value={this.state.Temperature}
                  />
                </View>
                {this.state.HeartRate != '' && this.state.HeartRate != '--' &&
                  this.state.Spo2 != '' && this.state.Spo2 != '--' &&
                  this.state.Temperature != '' && this.state.Temperature != '--' && (
                    <View style={styles.ButtonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                          this.submit();
                        }}>
                        <Text style={styles.text}>{translate('Submit')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            )}

            {this.state.autoInput == true && this.state.showFields == true && (
              <View style={styles.container2}>

                <View style={styles.container2_2}>
                  <Text style={styles.inputTitle2}>Status: {this.state.bleStatus}</Text>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignSelf: 'stretch',
                    alignItems: 'center',
                  }}>
                    <TouchableOpacity
                      style={[
                        styles.buttonSmall,
                        { backgroundColor: '#2196f3', alignItems: 'center' },
                      ]}
                      onPress={this.handleAutoInput}>
                      <Text style={styles.text}>Reconnect</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.buttonSmall,
                        { backgroundColor: '#2196f3', alignItems: 'center' },
                      ]}
                      onPress={this.readSensorValue}>
                      <Text style={styles.text}>Read Vitals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.buttonSmall,
                        { backgroundColor: '#2196f3', alignItems: 'center' },
                      ]}
                      onPress={this.removePairedDevice}>
                      <Text style={styles.text}>Remove Paired Device</Text>
                    </TouchableOpacity>
                  </View>
                </View>


                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('HEART RATE')}  (BPM)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={HeartRate => this.setState({ HeartRate })}
                    value={this.state.HeartRate}
                  />
                </View>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('SPO2')}  (%)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={Spo2 => this.setState({ Spo2 })}
                    value={this.state.Spo2}
                  />
                </View>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('TEMPERATURE')}  (°C)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={Temperature => this.setState({ Temperature })}
                    value={this.state.Temperature}
                  />
                </View>
                {this.state.HeartRate != '' && this.state.HeartRate != '--' &&
                  this.state.Spo2 != '' && this.state.Spo2 != '--' &&
                  this.state.Temperature != '' && this.state.Temperature != '--' && (
                    <View style={styles.ButtonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                          this.submit();
                        }}>
                        <Text style={styles.text}>{translate('Submit')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            )}
          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
            if (this.state.errorMessage === translate('Succesfully Added') || this.state.errorMessage === translate('Unpair successfully')) {
              this.props.navigation.state.params.onGoBack();
              this.props.navigation.goBack();
            }
            else if (this.state.errorMessage === translate('Please adjust the position of your wearable')) {
              this.readSensorValue();
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
    height: '100%',
    marginBottom: 10,
    marginTop: Platform.OS === 'ios' ? '5%' : '0%',
  },
  title0: {
    color: '#180D59',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
    textDecorationLine: 'underline',
    alignItems: 'center',
  },
  container2: {
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    paddingTop: 10,
    paddingBottom: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    // justifyContent: 'space-around',
    backgroundColor: '#ffffffaa',
  },
  container2_1: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 15
  },
  container2_2: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center',
    borderColor: '#180D59',
    borderWidth: 2,
    borderRadius: 10,
    margin: 15,
    padding: 15
  },
  greeting: {
    top: 15,
    left: 30,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#180D59',
    flex: 1,
    flexWrap: 'wrap'
  },
  errorMessage: {
    height: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  error: {
    color: '#E9446A',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    marginHorizontal: '8%',
    margin: '4%',
  },
  TextContainer: {
    flex: 1,
    flexDirection: 'row',
    margin: '2%',
  },
  TextContainer2: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  inputWrap: {
    flex: 1,
    margin: '2%',
    justifyContent: 'center',
    textAlign: 'center',
  },
  inputWrap2: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  inputTitle: {
    color: '#2196f3',
    fontSize: 17,
    // textTransform: 'uppercase',
    marginHorizontal: '2%',
    margin: '12%',
    textAlign: 'center',
    width: 150,
  },
  inputTitle2: {
    height: 60,
    width: 450,
    fontSize: 20,
    color: '#2196f3',
    marginHorizontal: '0%',
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: '700',
  },
  inputTitle3: {
    color: '#2196f3',
    fontSize: 16,
    textAlign: 'justify'
  },
  input: {
    height: 60,
    width: 80,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 20,
    color: '#161F3D',
    marginHorizontal: '25%',
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: '700',
  },
  text: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  back: {
    //position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'column'
  },
  ButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  button: {
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 10,
    width: 100,
  },
  buttonMain: {
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 10,
    width: 240,
  },
  buttonSmall: {
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 10,
    width: 120,
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(HealthCheckVitals);
