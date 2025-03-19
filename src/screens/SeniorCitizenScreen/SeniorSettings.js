import React, { Component } from 'react';
import { Text, StyleSheet, ImageBackground, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import styled from 'styled-components';

import { Icon } from 'native-base';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import VersionInfo from 'react-native-version-info';
import SimpleDialog from '../../components/SimpleDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BluetoothService from './BluetoothService';

import { connect } from 'react-redux';
import { logout } from '../../redux/actions';

import SettingButton from '../../components/SettingButton';
import SignOutButton from '../../components/SignOutButton';

import { showLanguageOptions, LanguageBottomSheet, translate } from '../../../translations.js'

class Settings extends Component {
  _isMounted = false;
  rbSheet = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  qrcode = () => {
    this.props.navigation.navigate('seniorQR');
  };

  profile = () => {
    this.props.navigation.navigate('seniorProfileSetting');
  };

  cargiver = () => {
    this.props.navigation.navigate('seniorCaregiver');
  };

  notification = () => {
    this.props.navigation.navigate('seniorNotificationSetting');
  };

  health = () => {
    this.props.navigation.navigate('seniorHealthVitalsSetting');
  };

  bloodpressure = () => {
    this.props.navigation.navigate('seniorBloodPressure');
  };

  bloodpressureQ = () => {
    this.props.navigation.navigate('seniorBloodPressureQ');
  };

  helpInfo = () => {
    this.setState({
      errorMessage: "For enquiries, please email us at contact@senzehub.com",
      showDialog: true,
    });
  }

  //SignOut
  signOutUser = () => {
    let dbRef = firestore().collection('Users').doc(auth().currentUser.uid);
    dbRef
      .update({
        FcmToken: '',
      })
      .then(() => {
        firestore().collection('Users')
          .doc(auth().currentUser.uid)
          .collection('LogHistory')
          .add({
            From: "Mobile",
            Action: "Logout",
            CreatedAt: firestore.FieldValue.serverTimestamp(),
          }).then(() => {
            auth()
              .signOut()
              .then(() => {
                this.props.logout();
                this.props.navigation.navigate('Login');
              })
              .catch((error) => {
                this.setState({
                  errorMessage: error,
                  showDialog: true,
                })
              });
          })
      });
  };

  async removeItemValue(key) {
    try {
      AsyncStorage.getItem('wearableID').then(value => {
        let device = JSON.parse(value);
        if (value !== 'undefined' && device !== null) {
          // Check the connection has established
          BluetoothService.getInstance().cancelDeviceConnection(device.id);
          BluetoothService.resetInstance();
        }
      });

      await AsyncStorage.removeItem(key);
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



  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <Container>
          <SafeAreaView style={styles.container}>
            <Text style={styles.topLeft} bold>
              {translate('SETTINGS')}
            </Text>

            <SettingButton
              title={translate('Profile')}
              icon="user"
              onClick={() => {
                this.profile();
              }}
            />

            <SettingButton
              title={translate('USERS LIST')}
              icon="users"
              onClick={() => {
                this.cargiver();
              }}
            />

            <SettingButton
              title={translate('SHOW QR CODE')}
              icon="qrcode"
              onClick={() => {
                this.qrcode();
              }}
            />

            <SettingButton
              title={translate('REMINDER')}
              icon="envelope"
              onClick={() => {
                this.notification();
              }}
            />

            {/* <SettingButton
              title={translate('HEALTH VITALS')}
              icon="heartbeat"
              onClick={() => {
                this.health();
              }}
            /> */}

            {/* <SettingButton
              title={translate('UNPAIR WEARABLE')}
              icon="ban"
              onClick={() => {
                Alert.alert('', translate('ARE YOU SURE TO UNPAIR THE WEARABLE?'), [
                  {
                    text: translate('CANCEL'),
                    onPress: () => {
                      console.log('Cancel Pressed');
                    },
                    style: 'cancel',
                  },
                  {
                    text: translate('OK'),
                    onPress: () => {
                      this.removeItemValue('wearableID');
                    },
                  },
                ]);
              }}
            /> */}

            <SettingButton
              title={translate("Change Language")}
              icon="globe"
              onClick={() => {
                showLanguageOptions();
              }}
            />

            {/* <SettingButton
              title="Blood Pressure"
              icon="heartbeat"
              onClick={() => {
                this.bloodpressure();
              }}
            /> */}
            {/* <SettingButton
              title="Blood PressureQ"
              icon="heartbeat"
              onClick={() => {
                this.bloodpressureQ();
              }}
            /> */}
            <SignOutButton
              onClick={() => {
                this.signOutUser();
              }}
            />

            <Text style={styles.version} bold>
              V{VersionInfo.appVersion}
              {/* <Icon
                  type="FontAwesome"
                  style={{ color: '#180D59' }}
                  name="question-circle"
                  onPress={() => this.helpInfo()}
                /> */}
            </Text>


            <Text style={{
              fontSize: 13,
              textAlign: 'center',
              color: '#180D59',
              marginTop: 10
            }}>{translate('For enquiries')}</Text>

            <TouchableOpacity
              onPress={async () => await Linking.openURL('mailto:contact@senzehub.com')}>
              <Text style={{
                fontSize: 15,
                textAlign: 'center',
                color: '#2196f3',
                marginBottom: 30,
              }}>contact@senzehub.com</Text>
            </TouchableOpacity>
            <LanguageBottomSheet />
            <SimpleDialog
              modalVisible={this.state.showDialog}
              onModalClosed={() => {
                this.setState({ showDialog: false });
              }}
              errorMessage={this.state.errorMessage}
            />
          </SafeAreaView>
        </Container>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topLeft: {
    // alignItems: 'flex-start',
    // // position: 'absolute',
    // top: 30,
    // left: 16,
    // fontSize: 30,
    // fontWeight: 'bold',
    // textAlign: 'left',
    // color: '#ffffff',
    // marginBottom: 40,

    alignItems: 'flex-start',
    // position: 'absolute',
    top: 15,
    marginBottom: 30,
    left: 16,
    fontSize: 23,
    textAlign: 'left',
    color: '#ffffff',
  },
  version: {
    marginTop: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
});

const Container = styled.ScrollView`
  flex: 1;
`;

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { logout })(Settings);
