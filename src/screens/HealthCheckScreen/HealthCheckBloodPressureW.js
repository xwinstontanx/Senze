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
  SafeAreaView
} from 'react-native';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import BluetoothService from './BluetoothService';
import { Buffer } from 'buffer';
import HealthData from '../../components/HealthData';
import { translate } from '../../../translations';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

const BPServiceUUID = '00001810-0000-1000-8000-00805f9b34fb';
const BPCharacteristicUUID = '00002a35-0000-1000-8000-00805f9b34fb';

let bpDevice = null;

class HealthCheckBloodPressureW extends Component {
  _isMounted = false;
  bt_On = false;
  scaningTimeout = 120; //2.5mins
  constructor(props) {
    super(props);
    this.state = {
      manualInput: false,
      autoInput: false,
      showFields: false,
      systolic: "--",
      diastolic: "--",
      pulse: "--",
      bleStatus: 'Not Paired',
      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  async startbluetooth() {
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
                this.bt_On = true;
                console.log('Bluetooth PoweredOn');
                subscription.remove();

                // Get back the wearable details
                this.startScan();
              } else if (state === 'PoweredOff') {
                this.bt_On = false;
                console.log('Bluetooth PoweredOff');
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
          if (!error) {
            if (device !== null) {

              const string = device.name;
              const substring1 = 'BLESmart_'; //for Android
              const substring2 = 'HEM-7361T'; //for iOS

              if (string !== null) {
                if (string.includes(substring1) || string.includes(substring2)) {
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
          else {
            console.log(error)
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
      this.bpDevice = device;

      BluetoothService.getInstance()
        .connectToDevice(device.id, { autoConnect: true })
        .then(dev => {
          if (this._isMounted) {
            this.setState({
              bleStatus: 'Paired',
            });
          }

          BluetoothService.getInstance().onDeviceDisconnected(
            device.id,
            (error, device) => {
              if (error) {
                console.log('onDeviceDisconnected ', error);
              }
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
              bleStatus: 'Not Paired',
            });
          }
          console.log('connectToDevice ', error);
        });
    }
  }


  // logging all characteristics
  getServicesAndCharacteristics(device) {

    device.monitorCharacteristicForService(
      BPServiceUUID,
      BPCharacteristicUUID,
      (error, characteristic) => {
        if (characteristic) {
          // Process the battery characteristic value
          const buffer = Buffer.from(characteristic.value, 'base64');
          const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars

          if (this._isMounted) {
            this.setState({
              systolic: parseInt(bufString[1], 16),
              diastolic: parseInt(bufString[3], 16),
              pulse: parseInt(bufString[14], 16)
            });

            // Stop scaning
            BluetoothService.getInstance().stopDeviceScan();
          }
        }
      },
    );
  }

  handleManualInput = () => {
    this.setState({ manualInput: true, autoInput: false, showFields: true, systolic: "", diastolic: "" });
  };

  handleAutoInput = () => {
    this.setState({ manualInput: false, autoInput: true, showFields: true, systolic: "--", diastolic: "--" });
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
      try {
        BluetoothService.getInstance()
          .isDeviceConnected(this.bpDevice.id)
          .then(status => {
            if (status) {
              // Connect the wearable automatically
              this.bpDevice.cancelConnection();
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
        DeviceType: 3,
        Systolic: this.state.systolic,
        Diastolic: this.state.diastolic,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      });
    this.successAdded();
  };

  componentWillUnmount() {
    this._isMounted = false;

    // Stop scaning
    BluetoothService.getInstance().stopDeviceScan();

    if (this.bpDevice != null) {
      try {
        BluetoothService.getInstance()
          .isDeviceConnected(this.bpDevice.id)
          .then(status => {
            console.log('status ' + status);
            if (status) {
              // Connect the wearable automatically
              this.bpDevice.cancelConnection();
            }
          });
      } catch (error) {
        console.log(error)
      }
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
                  {translate('Blood Pressure Readings')}
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
                  <Text style={styles.text}>{translate('Input blood pressure manually')}</Text>
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
                  <Text style={styles.text}>{translate('Retrieve blood pressure from device')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {this.state.manualInput == true && this.state.showFields == true && (
              <View style={styles.containerManualBorder}>
                <View style={styles.containerManual}>
                  <View>
                    <Text style={styles.inputTitleManual}>{translate('SYSTOLIC')} (mmHg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      onChangeText={systolic => this.setState({ systolic })}
                      value={this.state.systolic}
                      autoFocus={true}
                    />
                  </View>
                  <View>
                    <Text style={styles.inputTitleManual}>{translate('DIASTOLIC')} (mmHg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      onChangeText={diastolic => this.setState({ diastolic })}
                      value={this.state.diastolic}
                    />
                  </View>
                </View>

                {this.state.systolic != '--' && this.state.diastolic != '--' &&
                  this.state.systolic != '' && this.state.diastolic != '' && (
                    <View style={styles.ButtonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                          this.submit();
                        }}>
                        <Text style={styles.text}>{translate('Submit')}</Text>
                      </TouchableOpacity>
                    </View>)}
              </View>
            )}

            {this.state.autoInput == true && (<View style={styles.containerAuto}>
              <Text style={styles.inputTitleAuto}>{translate('Press the START button on the device to trigger the measurement')}</Text>
              <View style={styles.containerAutoContent}>

                <HealthData
                  icon={require('../../assets/bp.png')}
                  title={translate('SYSTOLIC')}
                  value={this.state.systolic}
                  unit="mmHg" />
                <HealthData
                  icon={require('../../assets/bp.png')}
                  title={translate('DIASTOLIC')}
                  value={this.state.diastolic}
                  unit="mmHg" />
              </View>

              {this.state.systolic != '--' && this.state.diastolic != '--' &&
                this.state.systolic != '' && this.state.diastolic != '' && (
                  <View style={styles.ButtonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        this.submit();
                      }}>
                      <Text style={styles.text}>{translate('Submit')}</Text>
                    </TouchableOpacity>
                  </View>)}
            </View>)}

          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
            if (this.state.errorMessage === translate('Succesfully Added')) {
              this.props.navigation.state.params.onGoBack();
              this.props.navigation.goBack();
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
  back: {
    //position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'column'
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
  containerAuto: {
    flexDirection: 'column',
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    paddingTop: 10,
    paddingBottom: 20,
    marginTop: 50,
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: '#ffffffaa',
  },
  containerAutoContent: {
    flexDirection: 'row',
    margin: 5,
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  containerManualBorder: {
    borderColor: '#180D59',
    borderWidth: 2,
    borderRadius: 10,
    margin: 15,
  },
  containerManual: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 15,
  },
  inputTitleManual: {
    color: '#2196f3',
    fontSize: 16,
    paddingBottom: 24,
    textAlign: 'center',
    width: 80,
    fontWeight: '700',
  },
  inputTitleAuto: {
    color: '#2196f3',
    fontSize: 16,
    textAlign: 'justify',
    margin: 10
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
  input: {
    height: 60,
    width: 80,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 20,
    color: '#161F3D',
    // marginHorizontal: '25%',
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
  ButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  buttonMain: {
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 10,
    width: 220,
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
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(HealthCheckBloodPressureW);
