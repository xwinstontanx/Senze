import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import DatePicker from 'react-native-date-picker'
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import { translate } from '../../../translations';

let dbRefUser;

class SeniorNotificationSetting extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,

      dailyCheckinStatus: this.props.profile.ToggleDailyCheckin,
      showTheThing: this.props.profile.ToggleDailyCheckin,
      time: new Date(),
      dcTime: this.props.profile.DailyCheckinReminderAt,
      isDatePickerVisible: false,
    };

  }

  componentDidMount() {
    this._isMounted = true;
    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  toggleDC = () => {
    if (this.state.dailyCheckinStatus === false) {
      this.setState({
        dailyCheckinStatus: true,
        showTheThing: true,
        errorMessage: translate('Daily Check In Reminder On'),
        showDialog: true,
      });

      dbRefUser
        .update({
          ToggleDailyCheckin: true,
        })
        .then(() => {
          // Update User Data to redux
          let newProfile = this.props.profile;
          newProfile.ToggleDailyCheckin = this.state.dailyCheckinStatus;
          this.props.setUserProfile(newProfile);
        })
        .catch(error =>
          this.setState({
            errorMessage: error.message,
            showDialog: true,
          }),
        );
    } else {
      this.setState({
        dailyCheckinStatus: false,
        showTheThing: false,
        errorMessage: translate('Daily Check In Reminder Off'),
        showDialog: true,
      });

      dbRefUser
        .update({
          ToggleDailyCheckin: false,
        })
        .then(() => {
          // Update User Data to redux
          let newProfile = this.props.profile;
          newProfile.ToggleDailyCheckin = this.state.dailyCheckinStatus;
          this.props.setUserProfile(newProfile);
        })
        .catch(error =>
          this.setState({
            errorMessage: error.message,
            showDialog: true,
          }),
        );
    }
  };

  successUpdate = () => {
    this.setState({
      errorMessage: translate('Succesfully Updated'),
      showDialog: true,
    });
  };

  showDatePicker = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  handleConfirm = time => {
    var setHM = time.getHours() + ':00';

    this.setState({
      dcTime: setHM,
    }),
      dbRefUser
        .update({
          DailyCheckinReminderAt: setHM,
        })
        .then(() => {
          // Update User Data to redux
          let newProfile = this.props.profile;
          newProfile.DailyCheckinReminderAt = this.state.dcTime;
          this.props.setUserProfile(newProfile);
          this.successUpdate();
        })
        .catch(error =>
          this.setState({
            errorMessage: error.message,
          }),
        );

    this.hideDatePicker();
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
                  {translate('REMINDER')}
                </Text>
              </View>

              <View style={styles.form}>
                <View style={{ flexDirection: 'row', marginBottom: 30 }}>
                  <View
                    style={{
                      flex: 3,
                    }}>
                    <Text style={styles.inputTitle}>
                      {translate('DAILY CHECK IN REMINDER')}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: 'center',
                    }}>
                    <ToggleSwitch
                      isOn={this.state.dailyCheckinStatus}
                      onColor="#2196f3"
                      offColor="grey"
                      label=""
                      labelStyle={{ color: 'black', fontWeight: '900' }}
                      size="0"
                      onToggle={isOn => this.toggleDC()}
                    />
                  </View>
                </View>

                {this.state.showTheThing && (
                  <View>
                    <View style={{ flexDirection: 'row' }}>
                      <View
                        style={{
                          flex: 3,
                        }}>
                        <Text style={styles.inputTitle}>
                          {translate('REMINDER SENDS ON')} {this.state.dcTime}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 0.5,
                          alignItems: 'center',
                        }}>
                        <FontAwesome5
                          name="edit"
                          size={26}
                          color="#2196f3"
                          onPress={this.showDatePicker}
                        />
                      </View>

                      <DatePicker
                        modal
                        open={this.state.isDatePickerVisible}
                        mode='time'
                        date={this.state.time}
                        locale="en_GB"
                        onConfirm={(date) => {
                          this.handleConfirm(date)
                        }}
                        onCancel={() => {
                          this.hideDatePicker()
                        }}
                        theme='light'
                      />
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ fontSize: 11, color: 'red' }}>
                        ** {translate('REMINDER SENDS IN HOURLY BASIS')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
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
  form: {
    marginHorizontal: '8%',
    margin: '4%',
  },
  inputTitle: {
    color: '#2196f3',
    fontSize: 16,
    textTransform: 'uppercase',
    alignContent: 'center',
  },
  back: {
    top: 15,
    left: 15,
    left: 15,
    flexDirection: 'column'
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(
  SeniorNotificationSetting,
);
