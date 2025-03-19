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


class cgAddSenioVitalsReadings extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      manualInput: false,
      showFields: false,
      heartRate: "",
      spo2: "",
      temperature: "",
      errorMessage: null,
      showDialog: false,
      senior: this.props.navigation.state.params.senior,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  handleManualInput = () => {
    this.setState({ manualInput: true, showFields: true, heartRate: "", spo2: "", temperature: "" });
  };

  successAdded = () => {
    this.setState({
      errorMessage: translate('Succesfully Added'),
      showDialog: true,
    });
  };

  submit = () => {
    firestore()
      .collection('Users')
      .doc(this.state.senior.data.Uid)
      .collection('SeniorData')
      .add({
        DeviceType: 1,
        HeartRate: this.state.heartRate,
        Spo2: this.state.spo2,
        Temperature: this.state.temperature,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        this.successAdded();
      });
  };

  componentWillUnmount() {
    this._isMounted = false;
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
                  <Text style={styles.text}>{'Input vitals readings manually'}</Text>
                  {/* TODO <Text style={styles.text}>{translate('Input vitals readings manually')}</Text> */}
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
                    onChangeText={heartRate => this.setState({ heartRate })}
                    value={this.state.heartRate}
                  />
                </View>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('SPO2')}  (%)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={spo2 => this.setState({ spo2 })}
                    value={this.state.spo2}
                  />
                </View>
                <View style={styles.container2_1}>
                  <Text style={styles.inputTitle2}>{translate('TEMPERATURE')}  (°C)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={temperature => this.setState({ temperature })}
                    value={this.state.temperature}
                  />
                </View>
                {this.state.heartRate != '' &&
                  this.state.spo2 != '' &&
                  this.state.temperature != '' && (
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

export default connect(mapStateToProps, { setUserProfile })(cgAddSenioVitalsReadings);
