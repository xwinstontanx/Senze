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
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import BluetoothService from './BluetoothService';
import { Buffer } from 'buffer';
import HealthData from '../../components/HealthData';
import { translate } from '../../../translations';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

const weightServiceUUID = '0000181d-0000-1000-8000-00805f9b34fb';
const weightCharacteristicUUID = '00002a9d-0000-1000-8000-00805f9b34fb';
let scaleDevice = null;

class HealthCheckWeight extends Component {
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
      BluetoothService.getInstance()
        .connectToDevice(device.id)
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
      weightServiceUUID,
      weightCharacteristicUUID,
      (error, characteristic) => {

        if (characteristic) {
          // Process the battery characteristic value
          const buffer = Buffer.from(characteristic.value, 'base64');
          const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars

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

  submit = async () => {
    if (this.state.manualInput === false) {
      try {
        BluetoothService.getInstance()
          .isDeviceConnected(this.scaleDevice.id)
          .then(status => {
            if (status) {
              // Connect the wearable automatically
              this.scaleDevice.cancelConnection();
            }
          });
      }
      catch (error) {
        console.log(error)
      }
    }

    // Push the weight value
    await firestore()
      .collection('Users')
      .doc(this.props.navigation.state.params.Uid)
      .collection('SeniorData')
      .add({
        DeviceType: 4,
        Weight: this.state.weight,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      });

    // Get the height value
    let startTime = moment().utcOffset(0);
    startTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    let endTime = moment().utcOffset(0).add(1, 'd');
    endTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 6)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(heightSnapshot => {
        heightSnapshot.forEach(heightDetailSnapshot => {
          let height = heightDetailSnapshot.data().Height;
          let bmi = parseInt(this.state.weight, 10) / ((parseInt(height, 10) * parseInt(height, 10) / 10000));

          // Push the BMI value
          firestore()
            .collection('Users')
            .doc(this.props.navigation.state.params.Uid)
            .collection('SeniorData')
            .add({
              DeviceType: 7,
              BMI: parseFloat(bmi.toFixed(1)),
              CreatedAt: firestore.FieldValue.serverTimestamp(),
            });
        })
      })
    this.successAdded();
  };

  componentWillUnmount() {
    this._isMounted = false;
    // Stop scaning
    BluetoothService.getInstance().stopDeviceScan();
    console.log("Stop scanning")

    if (this.scaleDevice != null) {
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
                  <Text style={styles.inputTitle2}>{translate('Weight')}  (kg)</Text>
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
    marginTop: 50,
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
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(HealthCheckWeight);
