import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  BackHandler,
  Alert,
  Linking
} from 'react-native';
import SimpleDialog from '../components/SimpleDialog';
import splash from '../assets/splash.png';
import auth from '@react-native-firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import getRoleId from './Functions/GetRoles';
import firestore from '@react-native-firebase/firestore';
import { translate } from '../../translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkVersion } from "react-native-check-version";

export default class LoadingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    // Check internet availability
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        this.setState({
          errorMessage:
            translate('No internet is available'),
          showDialog: true,
        });
      } else {
        // Check latest version available
        checkVersion().then((versionInfo) => {
          if (versionInfo.needsUpdate) {
            Alert.alert('New Version Available', 'Do you want to proceed for update?', [
              {
                text: 'NO',
                onPress: () => {
                  this.normalRoutine();
                },
                style: 'cancel',
              },
              {
                text: 'YES',
                onPress: () => {
                  Linking.openURL(versionInfo.url);
                },
              },
            ]);
          }
          else {
            this.normalRoutine();
          }
        });
      }
    });
  }

  normalRoutine = () => {
    // For Gym2022 straight go to gym screen
    AsyncStorage.getItem('gym2022').then(value => {
      console.log(value)
      if (value) {
        this.props.navigation.navigate('Gym');
      }
      else {
        //Checking the user and user role
        let user = auth().currentUser;

        // User is already logged in
        if (user) {
          getRoleId(user)
            .then((userDetail) => {
              if (userDetail.ForceSignOut) {
                dbRef = firestore().collection('Users').doc(auth().currentUser.uid);
                dbRef.update({
                  ForceSignOut: false
                }).then(() => {
                  firestore().collection('Users')
                    .doc(auth().currentUser.uid)
                    .collection('LogHistory')
                    .add({
                      From: "Mobile",
                      Action: "ForceLogout",
                      CreatedAt: firestore.FieldValue.serverTimestamp(),
                    });
                  auth().signOut();
                  this.props.navigation.navigate('Auth');
                })
              }
              else {
                if (userDetail.Role === '0') {
                  // Senior Citizen Screen == Senior, Role == 0
                  this.props.navigation.navigate('Senior');
                } else if (userDetail.Role === '1') {
                  // Volunteer Screen == Volunteer, Role == 1
                  this.props.navigation.navigate('Volunteer');
                } else if (userDetail.Role === '2') {
                  // Caregiver Screen == Caregiver, Role == 2
                  this.props.navigation.navigate('Caregiver');
                } else if (userDetail.Role === '-1') {
                  this.props.navigation.navigate('Gym');
                }
                else {
                  // Invalid user, force to login again
                  this.setState({
                    errorMessage: translate('Invalid User'),
                    showDialog: true,
                  });
                  auth().signOut();
                  this.props.navigation.navigate('Auth');
                }
              }

            })
            .catch(() => {
              this.props.navigation.navigate('Auth');
            });
        } else {
          this.props.navigation.navigate('Auth');
        }
      }
    })
  }

  CheckUpdateRequired = async () => {
    const version = await checkVersion();
    console.log("Got version info:", version);

    if (version.needsUpdate) {
      console.log(`App has a ${version.updateType} update pending.`);
      return true
    }
    else {
      return false
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={splash} style={styles.image}>
          <ActivityIndicator size="large" />
          <SimpleDialog
            modalVisible={this.state.showDialog}
            onModalClosed={() => {
              this.setState({ showDialog: false });
              if (
                this.state.errorMessage ===
                translate('No internet is available')
              ) {
                BackHandler.exitApp();
              }
            }}
            errorMessage={this.state.errorMessage}
          />
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  text: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
