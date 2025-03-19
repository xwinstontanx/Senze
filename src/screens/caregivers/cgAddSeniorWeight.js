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

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';

import BluetoothService from '../SeniorCitizenScreen/BluetoothService';
import { Buffer } from 'buffer';

import HealthData from '../../components/HealthData';
import { translate } from '../../../translations';

let dbRefUser;

const weightServiceUUID = '0000181d-0000-1000-8000-00805f9b34fb';
const weightCharacteristicUUID = '00002a9d-0000-1000-8000-00805f9b34fb';
let scaleDevice = null;

class cgAddSeniorWeight extends Component {
  _isMounted = false;
  bt_On = false;
  scaningTimeout = 120; //2.5mins

  constructor(props) {
    super(props);
    this.state = {
      manualInput: false,
      autoInput: false,
      showFields: false,
      weight: "--",
      bleStatus: 'Not Paired',
      errorMessage: null,
      showDialog: false,
      senior: this.props.navigation.state.params.senior,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  startbluetooth() {
    if (Platform.OS === 'android') {
      // Enable Bluetooth
      BluetoothService.enableBluetooth();
    }

    // Configure the Bluetooth Library
    const subscription = BluetoothService.getInstance().onStateChange(state => {
      // PoweredOn indicate bluetooth is on
      if (state === 'PoweredOn') {
        this.bt_On = true;
        console.log('Bluetooth PoweredOn');
        subscription.remove();

        // Get back the wearable details
        this.startScan();
      } else if (state === 'PoweredOff') {
        this.bt_On = false;
        console.log('Bluetooth PoweredOff');
        if (Platform.OS === 'android') {
          BluetoothService.getInstance().resetInstance();
        }
      }
    }, true);
  }

  startScan() {
    if (this._isMounted) {
      this.setState({
        bleStatus: 'Pairing',
      });
    }

    if (this.bt_On === true) {
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

          //   if (this._isMounted) {
          //     this.setState({
          //       bleStatus: 'Not Paired',
          //     });
          //   }

          //   this.notifyMessage(
          //     'Unable to pair with wearable, please restart the phone and try again',
          //   );
          // } else if (error) {
          //   if (this._isMounted) {
          //     this.setState({
          //       bleStatus: 'Not Paired',
          //     });
          //   }
          //   this.notifyMessage(error);
          //   return;
          // } else
          //console.log('Scanning...');

          if (!error) {
            if (
              (device !== null) &
              (device.rssi > -80)
            ) {
              this.scaleDevice = device;
              const string = device.name;
              const substring = 'MI SCALE2';
              if (string !== null) {
                if (string.includes(substring)) {
                  // Filter and only add BLESmart_ to the list
                  console.log(device.name);
                  console.log('RSSI', device.rssi);
                  // Stop scaning
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
    if (this._isMounted) {
      this.setState({
        bleStatus: 'Pairing',
      });
    }

    if (device) {
      console.log('device.id: ' + device.id);

      BluetoothService.getInstance()
        .connectToDevice(device.id)
        .then(dev => {
          if (this._isMounted) {
            this.setState({
              bleStatus: 'Paired',
            });
          }

          console.log('connected')
          // AsyncStorage.setItem(
          //   'wearableID',
          //   JSON.stringify(this.decycle(dev)),
          //   err => {
          //     if (err) {
          //       this.notifyMessage(err);
          //     }
          //   },
          // ).catch(err => {
          //   this.notifyMessage(err);
          // });

          BluetoothService.getInstance().onDeviceDisconnected(
            device.id,
            (error, device) => {
              if (error) {
                console.log('onDeviceDisconnected ', error);
              }
              // if (this._isMounted) {
              //   this.setState({
              //     bleStatus: 'Not Paired',
              //   });
              // }
              console.log('Device is disconnected');
              // this.reconnectWearable();
            },
          );

          dev
            .discoverAllServicesAndCharacteristics()
            .then(d => this.getServicesAndCharacteristics(dev));

        })
        .catch(error => {
          if (this._isMounted) {
            this.setState({
              bleStatus: 'Not Paired',
            });
          }
          console.log('connectToDevice ', error);
        });
    }
  }


  // logging all characteristics
  getServicesAndCharacteristics(device) {

    // Command to get battery level (Notify) value
    // device.readCharacteristicForService(
    //   BattServiceUUID,
    //   BattCharacteristicUUID,
    // );
    console.log('getServicesAndCharacteristics')

    device.monitorCharacteristicForService(
      weightServiceUUID,
      weightCharacteristicUUID,
      (error, characteristic) => {

        if (characteristic) {
          // Process the battery characteristic value
          const buffer = Buffer.from(characteristic.value, 'base64');
          const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars

          console.log("state: " + bufString[0]);
          console.log("weight: " + parseInt(bufString[2] + bufString[1], 16) / 200)
          // console.log(parseInt(bufString[1], 16));
          // console.log(parseInt(bufString[3], 16));
          // console.log(parseInt(bufString[14], 16));
          if (bufString[0] === '22' || bufString[0] === 'a2') {
            if (this._isMounted) {
              this.setState({
                weight: parseInt(bufString[2] + bufString[1], 16) / 200,
              });
            }
          }
        }
      },
    );
  }

  handleManualInput = () => {
    this.setState({ manualInput: true, autoInput: false, showFields: true, weight: "" });
  };

  handleAutoInput = () => {
    this.setState({ manualInput: false, autoInput: true, showFields: true, weight: "--" });
    this.startbluetooth();
  };

  successAdded = () => {
    this.setState({
      errorMessage: translate('Succesfully Added'),
      showDialog: true,
    });
  };

  submit = () => {
    if (this.state.manualInput === false) {
      BluetoothService.getInstance()
        .isDeviceConnected(this.scaleDevice.id)
        .then(status => {
          console.log('status ' + status);
          if (status) {
            // Connect the wearable automatically
            this.scaleDevice.cancelConnection();
          }
        });
    }

    firestore()
      .collection('Users')
      .doc(this.state.senior.data.Uid)
      .collection('SeniorData')
      .add({
        DeviceType: 4,
        Weight: this.state.weight,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        this.successAdded();
      });
  };

  componentWillUnmount() {
    this._isMounted = false;
    // Stop scaning
    BluetoothService.getInstance().stopDeviceScan();
    console.log("Stop scanning")

    try {
      BluetoothService.getInstance()
        .isDeviceConnected(this.scaleDevice.id)
        .then(status => {
          console.log('status ' + status);
          if (status) {
            // Connect the wearable automatically
            this.scaleDevice.cancelConnection();
          }
        });
    } catch (error) {
      console.log(error)
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
                    this.props.navigation.navigate('cgaddotherdevices');
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.greeting}>
                  {translate('Weight Readings')}
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
                  <Text style={styles.text}>{translate('Input weight manually')}</Text>
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
                  <Text style={styles.text}>{translate('Retrieve weight from device')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {this.state.manualInput == true && this.state.showFields == true && (
              <View style={styles.container2}>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('Weight')} (kg)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={weight => this.setState({ weight })}
                    value={this.state.weight}
                  />
                </View>
                {this.state.weight != '' && this.state.weight != '--' && (
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.inputTitle3}>
                    {translate('Stand on the weighing scale')}
                  </Text>

                </View>
                <View style={styles.container2_1}>
                  <HealthData
                    icon={require('../../assets/weight.jpeg')}
                    title={translate('Weight')}
                    value={this.state.weight}
                    unit="kg" />
                </View>
                {this.state.weight != '' && this.state.weight != '--' && (
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
            if (this.state.errorMessage === translate('Succesfully Added')) {
              this.props.navigation.navigate('cgseniordetails');
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
    flexDirection: 'column',
    borderColor: '#180D59',
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 50,
    alignSelf: 'stretch',
    alignItems: 'center',
    // justifyContent: 'space-around',
    backgroundColor: '#ffffffaa',
  },
  container2_1: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 15,
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
    width: 280,
    fontSize: 17,
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
    width: 110,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 17,
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
    width: 150,
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
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(cgAddSeniorWeight);
