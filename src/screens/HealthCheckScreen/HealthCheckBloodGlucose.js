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
import DropDownPicker from 'react-native-dropdown-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import BluetoothService from './BluetoothService';
import { Buffer } from 'buffer';
import HealthData from '../../components/HealthData';
import { translate } from '../../../translations';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

const BPServiceUUID = '00001808-0000-1000-8000-00805f9b34fb';
const BPCharacteristicUUID = '00002a18-0000-1000-8000-00805f9b34fb';
let glucoseDevice = null;

class HealthCheckBloodGlucose extends Component {
  _isMounted = false;
  bt_On = false;
  scaningTimeout = 120; //2.5mins

  constructor(props) {
    super(props);
    this.state = {
      manualInput: false,
      autoInput: false,
      showFields: false,
      bloodGlucose: "--",
      bloodGlucoseMeal: "",
      bloodGlucoseTaken: "",
      bleStatus: 'Not Paired',
      errorMessage: null,
      showDialog: false,

      mealOpen: false,
      mealValue: 'Before/After',
      mealItems: [
        {
          label: 'Before',
          value: '0',
        },
        {
          label: 'After',
          value: '1',
        },
      ],

      takenOpen: false,
      takenValue: 'Breakfast/Lunch/HighTea/Dinner',
      takenItems: [
        {
          label: 'Breakfast',
          value: '0',
        },
        {
          label: 'Lunch',
          value: '1',
        },
        {
          label: 'High Tea',
          value: '2',
        },
        {
          label: 'Dinner',
          value: '3',
        },
      ],
    };
    this.setOpenMeal = this.setOpenMeal.bind(this);
    this.setValueMeal = this.setValueMeal.bind(this);
    this.setItemsMeal = this.setItemsMeal.bind(this);

    this.setOpenTaken = this.setOpenTaken.bind(this);
    this.setValueTaken = this.setValueTaken.bind(this);
    this.setItemsTaken = this.setItemsTaken.bind(this);
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
  };

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
              const substring = 'Contour';
              if (string !== null) {
                if (string.includes(substring)) {
                  // Filter and only add Contour to the list
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
      this.glucoseDevice = device;
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
      BPServiceUUID,
      BPCharacteristicUUID,
      (error, characteristic) => {
        if (characteristic) {
          // Process the battery characteristic value
          const buffer = Buffer.from(characteristic.value, 'base64');
          const bufString = buffer.toString('hex').match(/.{1,2}/g); // Convert to hex and group by 2 Chars

          if (this._isMounted) {
            this.setState({
              bloodGlucose: parseInt(bufString[12], 16) / 10,
            });

            // Stop scaning
            BluetoothService.getInstance().stopDeviceScan();
          }
        }
      },
    );
  }

  handleManualInput = () => {
    this.setState({ manualInput: true, autoInput: false, showFields: true, bloodGlucose: "" });
  };

  handleAutoInput = () => {
    this.setState({ manualInput: false, autoInput: true, showFields: true, bloodGlucose: "--" });
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
        BloodGlucose: this.state.bloodGlucose,
        // BloodGlucoseMeal: this.state.bloodGlucoseMeal,
        // BloodGlucoseTaken: this.state.bloodGlucoseTaken,
        DeviceType: 5,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      });
    this.successAdded();
  };

  componentWillUnmount() {
    this._isMounted = false;

    // Stop scaning
    BluetoothService.getInstance().stopDeviceScan();
    console.log("Stop scanning")

    if (this.glucoseDevice != null) {
      try {
        BluetoothService.getInstance()
          .isDeviceConnected(this.glucoseDevice.id)
          .then(status => {
            if (status) {
              // Connect the wearable automatically
              this.glucoseDevice.cancelConnection();
            }
          });
      } catch (error) {
        console.log(error)
      }
    }
  }

  setOpenMeal(mealOpen) {
    this.setState({
      mealOpen,
    });
  }

  setValueMeal(callback) {
    this.setState(state => ({
      mealValue: callback(state.mealValue),
      bloodGlucoseMeal: callback(state.mealValue),
    }));
  }

  setItemsMeal(callback) {
    this.setState(state => ({
      mealItems: callback(state.mealItems),
    }));
  }

  setOpenTaken(takenOpen) {
    this.setState({
      takenOpen,
    });
  }

  setValueTaken(callback) {
    this.setState(state => ({
      takenValue: callback(state.takenValue),
      bloodGlucoseTaken: callback(state.takenValue),
    }));
  }

  setItemsTaken(callback) {
    this.setState(state => ({
      takenItems: callback(state.takenItems),
    }));
  }

  render() {
    const {
      mealOpen,
      mealValue,
      mealItems,
      takenOpen,
      takenValue,
      takenItems,
    } = this.state;
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
                  {translate('Blood Glucose Readings')}
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
                  <Text style={styles.text}>{translate('Input blood glucose manually')}</Text>
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
                  <Text style={styles.text}>{translate('Retrieve blood glucose from device')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {(this.state.autoInput == true || this.state.manualInput == true) && (
              <View style={styles.container2}>
                <View style={styles.container}>
                  {/* <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: 5
                    }}>
                    <Text style={styles.inputTitle3}>
                      {translate('Select following meal options and continue to use the glucose meter to take the sugar level:')}
                    </Text>
                  </View> */}
                  {/* <Text style={styles.inputTitle}></Text>
                  <DropDownPicker
                    open={mealOpen}
                    value={mealValue}
                    items={mealItems}
                    setOpen={this.setOpenMeal}
                    setValue={this.setValueMeal}
                    setItems={this.setItemsMeal}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      fontSize: 16,
                    }}
                    dropDownDirection="TOP"
                    placeholder={this.state.mealValue}
                  />
                  <Text style={styles.inputTitle}></Text>
                  <DropDownPicker
                    open={takenOpen}
                    value={takenValue}
                    items={takenItems}
                    setOpen={this.setOpenTaken}
                    setValue={this.setValueTaken}
                    setItems={this.setItemsTaken}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      fontSize: 16,
                    }}
                    dropDownDirection="TOP"
                    placeholder={this.state.takenValue}
                  /> */}
                </View>

                <View style={styles.container2_1}>
                  {this.state.autoInput == true && this.state.showFields == true && (
                    <HealthData
                      icon={require('../../assets/bloodGlucose.png')}
                      title={translate("BLOOD GLUCOSE")}
                      value={this.state.bloodGlucose}
                      unit="mmol/L"
                    />
                  )}
                  {this.state.manualInput == true && this.state.showFields == true && (
                    <View style={styles.inputView}>
                      <Text style={styles.inputTitle2}>{translate("BLOOD GLUCOSE")} (mmol/L)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={bloodGlucose => this.setState({ bloodGlucose })}
                        value={this.state.bloodGlucose} />
                    </View>
                  )}
                </View>

                {this.state.bloodGlucose != '--' &&
                  // this.state.bloodGlucoseMeal != '' &&
                  // this.state.bloodGlucoseTaken != '' &&
                  this.state.bloodGlucose != '' &&
                  (
                    <View style={styles.ButtonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                          this.submit();
                        }}>
                        <Text style={styles.text}>{translate("Submit")}</Text>
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
      </SafeAreaView >
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
    flexDirection: 'row',
    // margin: 5,
    // alignSelf: 'stretch',
    justifyContent: 'space-around',
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
    fontSize: 16,
    textTransform: 'uppercase',
  },
  inputTitle2: {
    color: '#2196f3',
    fontSize: 16,
    paddingBottom: 24,
    textAlign: 'center',
    width: 240,
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
  inputView: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(HealthCheckBloodGlucose);
