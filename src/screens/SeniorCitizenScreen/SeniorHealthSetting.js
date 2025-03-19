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
import { translate } from '../../../translations';

let dbRefUser;

class SeniorHealthSetting extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      MaxHeartRate: this.props.profile.MaxHeartRate,
      MaxSpo2: this.props.profile.MaxSpo2,
      MaxTemp: this.props.profile.MaxTemp,
      MinHeartRate: this.props.profile.MinHeartRate,
      MinSpo2: this.props.profile.MinSpo2,
      MinTemp: this.props.profile.MinTemp,

      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  successUpdate = () => {
    this.setState({
      errorMessage: translate('Succesfully Updated'),
      showDialog: true,
    });
  };

  handleUpdate = () => {
    dbRefUser
      .update({
        MaxHeartRate: this.state.MaxHeartRate,
        MinHeartRate: this.state.MinHeartRate,
        MaxSpo2: this.state.MaxSpo2,
        MinSpo2: this.state.MinSpo2,
        MaxTemp: this.state.MaxTemp,
        MinTemp: this.state.MinTemp,
      })
      .then(() => {
        // Update User Data to redux
        let newProfile = this.props.profile;
        newProfile.MaxHeartRate = this.state.MaxHeartRate;
        newProfile.MinHeartRate = this.state.MinHeartRate;
        newProfile.MaxSpo2 = this.state.MaxSpo2;
        newProfile.MinSpo2 = this.state.MinSpo2;
        newProfile.MaxTemp = this.state.MaxTemp;
        newProfile.MinTemp = this.state.MinTemp;
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

  confirmUpdate = () => {
    Alert.alert(
      translate('Update Health Vitals'),
      translate('Click OK to proceed updating the Health Vitals'),
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
                    this.props.navigation.navigate('seniorSettingScreen');
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.greeting}>
                  {translate('HEALTH VITALS')}
                </Text>
              </View>

              <View style={styles.errorMessage}>
                {this.state.errorMessage && (
                  <Text style={styles.errorMessage}>
                    {this.state.errorMessage}
                  </Text>
                )}
              </View>
            </View>

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
                    maxLength={3}
                    onChangeText={MinHeartRate => this.setState({ MinHeartRate })}
                    value={this.state.MinHeartRate}
                  />
                </View>
                <View styel={styles.inputWrap}>
                  <Text style={styles.inputTitle}>{translate('HEART RATE')} (BPM)</Text>
                </View>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={3}
                    onChangeText={MaxHeartRate => this.setState({ MaxHeartRate })}
                    value={this.state.MaxHeartRate}
                  />
                </View>
              </View>

              <View style={styles.TextContainer}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={3}
                    onChangeText={MinSpo2 => this.setState({ MinSpo2 })}
                    value={this.state.MinSpo2}
                  />
                </View>
                <View styel={styles.inputWrap}>
                  <Text style={styles.inputTitle}>{translate('SPO2')} (%)</Text>
                </View>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={3}
                    onChangeText={MaxSpo2 => this.setState({ MaxSpo2 })}
                    value={this.state.MaxSpo2}
                  />
                </View>
              </View>

              <View style={styles.TextContainer}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={3}
                    onChangeText={MinTemp => this.setState({ MinTemp })}
                    value={this.state.MinTemp}
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
                    maxLength={3}
                    onChangeText={MaxTemp => this.setState({ MaxTemp })}
                    value={this.state.MaxTemp}
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
          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
            if (this.state.errorMessage === translate('Succesfully Updated')) {
              this.props.navigation.navigate('seniorSettingScreen');
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
    // marginBottom: 20,
  },
  greeting: {
    top: 15,
    left: 30,
    fontSize: 24,
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
    color: '#2196f3',
    fontSize: 16,
    textTransform: 'uppercase',
    // marginHorizontal: '2%',
    // margin: '12%',
    textAlign: 'center',
    width: 240,
    fontWeight: '700',
  },
  inputTitle3: {
    color: '#2196f3',
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 30,
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
  },
  button: {
    marginHorizontal: 20,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    width: 220,
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(SeniorHealthSetting);
