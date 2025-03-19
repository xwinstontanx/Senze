import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
} from 'react-native';
import SimpleDialog from '../../components/SimpleDialog';
import DropDownPicker from 'react-native-dropdown-picker';
import ToggleSwitch from 'toggle-switch-react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import { translate } from '../../../translations';

class cgSeniorSettings extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      senior: this.props.navigation.state.params.senior,

      frequencyOpen: false,
      frequencyValue: this.props.navigation.state.params.senior.data.Frequency,
      frequencyItems: [
        {
          label: 'Every 30 mintues',
          value: '0.5',
        },
        {
          label: 'Every 1 hour',
          value: '1',
        },
        {
          label: 'Every 4 hours',
          value: '4',
        },
      ],

      errorMessage: null,
      showDialog: false,
    };

    this.setOpenFrequency = this.setOpenFrequency.bind(this);
    this.setValueFrequency = this.setValueFrequency.bind(this);
    this.setItemsFrequency = this.setItemsFrequency.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setOpenFrequency(frequencyOpen) {
    this.setState({
      frequencyOpen,
    });
  }

  setValueFrequency(callback) {
    this.setState(state => ({
      frequencyValue: callback(state.frequencyValue),
    }));
  }

  setItemsFrequency(callback) {
    this.setState(state => ({
      frequencyItems: callback(state.frequencyItems),
    }));
  }

  confirmUpdate = () => {
    Alert.alert(
      translate('Update Settings'),
      translate('Click OK to proceed updating the Settings'),
      [
        {
          text: translate('CANCEL'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: translate('OK'), onPress: () => this.handleUpdate() },
      ],
    );
  };

  handleUpdate = () => {
    console.log(this.state.senior.data.Uid)
    let dbRefSeniorSettings = firestore()
      .collection('Users')
      .doc(this.state.senior.data.Uid);

    dbRefSeniorSettings
      .update({
        MaxHeartRate: this.state.senior.data.MaxHeartRate,
        MinHeartRate: this.state.senior.data.MinHeartRate,
        MaxSpo2: this.state.senior.data.MaxSpo2,
        MinSpo2: this.state.senior.data.MinSpo2,
        MaxTemp: this.state.senior.data.MaxTemp,
        MinTemp: this.state.senior.data.MinTemp,
        Frequency: this.state.frequencyValue,
        //CustomizedFrequency: this.state.senior.data.CustomizedFrequency,
      })
      .then(() => {
        // Update User Data to redux
        let newProfile = this.props.profile;
        newProfile.MaxHeartRate = this.state.senior.data.MaxHeartRate;
        newProfile.MinHeartRate = this.state.senior.data.MinHeartRate;
        newProfile.MaxSpo2 = this.state.senior.data.MaxSpo2;
        newProfile.MinSpo2 = this.state.senior.data.MinSpo2;
        newProfile.MaxTemp = this.state.senior.data.MaxTemp;
        newProfile.MinTemp = this.state.senior.data.MinTemp;
        newProfile.Frequency = this.state.frequencyValue;
        newProfile.UpdatedAt = firestore.FieldValue.serverTimestamp();
        this.props.setUserProfile(newProfile);

        this.successUpdate();
      })
      .catch(error =>
        this.setState({
          errorMessage: error.message,
          showDialog: true,
        }),
      );
  };

  successUpdate = () => {
    this.setState({
      errorMessage: translate('Succesfully Updated'),
      showDialog: true,
    });
  };

  render() {
    const { frequencyOpen, frequencyValue, frequencyItems } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <KeyboardAvoidingView>
            <View style={styles.container}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                <TouchableOpacity
                  style={styles.back}
                  onPress={() => {
                    this.props.navigation.navigate('cgseniordetails');
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.greeting1}>
                  {translate('SETTINGS')}
                </Text>
              </View>

              {/* <TouchableOpacity
                style={styles.back}
                onPress={() => {
                  this.props.navigation.navigate('cgseniordetails');
                }}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>

              <Text style={styles.greeting1}>Settings</Text> */}

              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  margin: 20,
                  marginTop: 30,
                }}>
                <Text style={styles.greeting}>{translate('HEALTH VITALS')}</Text>

                <View style={styles.form}>
                  <Text style={styles.inputTitle3}>
                    {translate("SET THE MINIMUM (MIN) AND MAXIMUM (MAX) THRESHOLD FOR HEALTH VITALS YOU WILL BE NOTIFIED WHEN THE HEALTH VITALS FALL BELOW OR ABOVE THE THRESHOLD")}
                  </Text>
                  <View style={styles.TextContainer2}>
                    <View style={styles.inputWrap2}>
                      <Text style={styles.inputTitle2}>{translate('MIN')}</Text>
                    </View>
                    <View style={styles.inputWrap2}>
                      <Text style={styles.inputTitle2}>{translate('MAX')}</Text>
                    </View>
                  </View>

                  <View style={styles.TextContainer}>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={MinHeartRate => {
                          let tempSeniorData = this.state.senior;
                          tempSeniorData.data.MinHeartRate = MinHeartRate;
                          this.setState({ senior: tempSeniorData });
                        }}
                        value={this.state.senior.data.MinHeartRate}
                      />
                    </View>
                    <View styel={styles.inputWrap}>
                      <Text style={styles.inputTitle}>{translate('HEART RATE')} (BPM)</Text>
                    </View>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={MaxHeartRate => {
                          let tempSeniorData = this.state.senior;
                          tempSeniorData.data.MaxHeartRate = MaxHeartRate;
                          this.setState({ senior: tempSeniorData });
                        }}
                        value={this.state.senior.data.MaxHeartRate}
                      />
                    </View>
                  </View>

                  <View style={styles.TextContainer}>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={MinSpo2 => {
                          let tempSeniorData = this.state.senior;
                          tempSeniorData.data.MinSpo2 = MinSpo2;
                          this.setState({ senior: tempSeniorData });
                        }}
                        value={this.state.senior.data.MinSpo2}
                      />
                    </View>
                    <View styel={styles.inputWrap}>
                      <Text style={styles.inputTitle}>{translate('SPO2')} (%)</Text>
                    </View>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={MaxSpo2 => {
                          let tempSeniorData = this.state.senior;
                          tempSeniorData.data.MaxSpo2 = MaxSpo2;
                          this.setState({ senior: tempSeniorData });
                        }}
                        value={this.state.senior.data.MaxSpo2}
                      />
                    </View>
                  </View>

                  <View style={styles.TextContainer}>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={MinTemp => {
                          let tempSeniorData = this.state.senior;
                          tempSeniorData.data.MinTemp = MinTemp;
                          this.setState({ senior: tempSeniorData });
                        }}
                        value={this.state.senior.data.MinTemp}
                      />
                    </View>
                    <View styel={styles.inputWrap}>
                      <Text style={styles.inputTitle}>
                        {translate('TEMPERATURE')} ({'\u00b0'}C)
                      </Text>
                    </View>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={MaxTemp => {
                          let tempSeniorData = this.state.senior;
                          tempSeniorData.data.MaxTemp = MaxTemp;
                          this.setState({ senior: tempSeniorData });
                        }}
                        value={this.state.senior.data.MaxTemp}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.ButtonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={this.confirmUpdate}>
                    <Text style={styles.text}>{translate('UPDATE HEALTH VITALS')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* <View
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  margin: 20,
                  marginTop: 5,
                }}>
                <Text style={styles.greeting}>Frequency</Text>
                <View style={styles.form}>
                  <Text style={styles.inputTitle3}>
                    Set the frequency to read senior's health vitals. Please
                    take note that more frequent readings may drain the battery:
                  </Text>
                  <DropDownPicker
                    open={frequencyOpen}
                    value={frequencyValue}
                    items={frequencyItems}
                    setOpen={this.setOpenFrequency}
                    setValue={this.setValueFrequency}
                    setItems={this.setItemsFrequency}
                    listMode="SCROLLVIEW"
                  />
                </View>
                <View style={styles.ButtonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={this.confirmUpdate}>
                    <Text style={styles.text}>Update Frequency</Text>
                  </TouchableOpacity>
                </View>
              </View> */}

              {/* <View
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  margin: 20,
                  marginTop: 5,
                }}>
                <Text style={styles.greeting}>Emergencies</Text>
                <View style={styles.form}>
                  <Text style={styles.inputTitle3}>
                    During emergencies, enable readings to capture more
                    frequent:
                  </Text>
                </View>
                <View
                  style={{
                    flex: 0.5,
                    alignItems: 'center',
                    marginBottom: 20,
                  }}>
                  <ToggleSwitch
                    isOn={this.state.senior.data.CustomizedFrequency}
                    onColor="#2196f3"
                    offColor="grey"
                    label=""
                    labelStyle={{color: 'black', fontWeight: '900'}}
                    size="0"
                    onToggle={value => {
                      let tempSeniorData = this.state.senior;
                      tempSeniorData.data.CustomizedFrequency = value;
                      this.confirmUpdate();
                    }}
                  />
                </View>
              </View> */}
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
            if (this.state.errorMessage === translate('Succesfully Updated')) {
              // this.props.navigation.navigate('settingScreen');
              this.props.navigation.popToTop();
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
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    margin: '1%',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#2196f3',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  greeting1: {
    top: 15,
    left: 26,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#180D59',
    flex: 1,
    flexWrap: 'wrap'
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
    fontSize: 14,
    marginHorizontal: '2%',
    margin: '12%',
    textAlign: 'center',
    width: 150,
  },
  inputTitle2: {
    color: '#2196f3',
    fontSize: 16,
    textTransform: 'uppercase',
    textAlign: 'center',
    width: 225,
    fontWeight: '700',
  },
  inputTitle3: {
    color: '#2196f3',
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 10,
  },
  input: {
    height: 60,
    width: 60,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 20,
    color: '#161F3D',
    marginHorizontal: '2%',
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: '700',
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    textAlign:"center"
  },
  back: {
    top: 15,
    left: 15,
  },
  ButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: 20,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: 220,
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(cgSeniorSettings);
