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

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';

import BluetoothService from './BluetoothService';
import { Buffer } from 'buffer';

import HealthData from '../../components/HealthData';
import { translate } from '../../../translations';

import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const weightServiceUUID = '0000181d-0000-1000-8000-00805f9b34fb';
const weightCharacteristicUUID = '00002a9d-0000-1000-8000-00805f9b34fb';
let scaleDevice = null;

class HealthCheckHeight extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      manualInput: false,
      autoInput: false,
      showFields: false,
      height: "--",
      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }


  handleManualInput = () => {
    this.setState({ manualInput: true, autoInput: false, showFields: true, height: "" });
  };

  handleAutoInput = () => {
    this.setState({ manualInput: false, autoInput: true, showFields: true, height: "--" });
  };

  successAdded = () => {
    this.setState({
      errorMessage: translate('Succesfully Added'),
      showDialog: true,
    });
  };

  submit = async () => {
    // Push the height value
    await firestore()
      .collection('Users')
      .doc(this.props.navigation.state.params.Uid)
      .collection('SeniorData')
      .add({
        DeviceType: 6,
        Height: this.state.height,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      });

    // Get the weight value
    let startTime = moment().utcOffset(0);
    startTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    let endTime = moment().utcOffset(0).add(1, 'd');
    endTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 4)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(weightSnapshot => {
        weightSnapshot.forEach(weightDetailSnapshot => {
          let weight = weightDetailSnapshot.data().Weight;
          let bmi = parseInt(weight, 10) / ((parseInt(this.state.height, 10) * parseInt(this.state.height, 10)) / 10000);

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
                  {translate('Height Readings')}
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
                  <Text style={styles.text}>{translate('Input height manually')}</Text>
                </TouchableOpacity>
                {/* <Text
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
                </TouchableOpacity> */}
              </View>
            )}

            {this.state.manualInput == true && this.state.showFields == true && (
              <View style={styles.container2}>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('Height')}  (cm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={height => this.setState({ height })}
                    value={this.state.height}
                  />
                </View>
                {this.state.height != '' && this.state.height != '--' && (
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

            {/* {this.state.autoInput == true && this.state.showFields == true && (
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
            )} */}
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

export default connect(mapStateToProps, { setUserProfile })(HealthCheckHeight);
