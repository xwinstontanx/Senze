import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  SafeAreaView,
  ImageBackground,
  TextInput,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  BackHandler,
  Platform,
  Alert
} from 'react-native';
import { Container, Form, Text, Button, Icon } from 'native-base';
import SimpleDialog from '../components/SimpleDialog';
import themeVariables from '../../native-base-theme/variables/material_copy';
import { mainStyles } from '../styles/styles';
// import Spinner from 'react-native-loading-spinner-overlay';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { WebView } from 'react-native-webview';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { connect } from 'react-redux';
import CryptoJS from 'react-native-crypto-js';
import SendIntentAndroid from 'react-native-send-intent'
import { changeIcon } from 'react-native-change-icon';
import PasswordInputText from 'react-native-hide-show-password-input';
import { translate } from '../../translations';
import VersionInfo from 'react-native-version-info';
import DeviceInfo from 'react-native-device-info';
import * as Animatable from 'react-native-animatable';

import AsyncStorage from '@react-native-async-storage/async-storage';

let dbRef;
let dbRefSingpass;

class LoginScreen extends Component {
  _isMounted = false;
  webview = null;

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',

      errorMessage: null,
      showDialog: false,

      mainSignIn: true,
      showNonSPLogin: false,
      showNumberLogin: false,
      showSPLogin: false,
      sheetRef: null,
      loadingSpinner: false,
      loadingSingpass: false,

      singpassUUID: '',

      hidePassword: true,

      countryCode: '+65',
      phoneNumber: '',
      phoneConfirm: null,
      phoneAuth: false,
      smsCode: '',
      showPhoneNumber: false,
      showVerifyCode: false,

      codeTimer: 45,
      enableResend: false,

      uri: ""
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.interval);
  }

  organizationChangeIcon = async () => {
    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid).get().then((snapshot) => {
      const THKorgID = "A4tUdFPVYGe6uTqrb08T";
      if (snapshot.data().OrganizationId == THKorgID) {
        return 'thk'
      }
      return 'senzehub'
    })
  };

  handleNumberLogin = () => {
    const { countryCode, phoneNumber } = this.state;

    if (countryCode === '' || phoneNumber === '') {
      this.setState({
        showDialog: true,
        errorMessage: translate('Country Code or Phone Number cannot be empty'),
      });
      return;
    }
    else {
      // Check user exist
      dbRefSingpass = firestore().collection('Users');
      dbRefSingpass
        .where('PhoneNumber', '==', this.state.phoneNumber)
        .get()
        .then(phoneSnapshot => {
          if (phoneSnapshot.empty) {
            this.setState({
              showDialog: true,
              errorMessage: translate('Please kindly create new account first'),
            });
          }
          else {
            this.setState({
              loadingSpinner: true,
            })
            this.signInWithPhoneNumber(this.state.countryCode + this.state.phoneNumber, false)
            // Check email exist
            // phoneSnapshot.forEach(doc => {

            //   // if (doc.data().NoEmail !== undefined) {
            //   //   if (doc.data().NoEmail === true) {
            //   //     this.setState({
            //   //       loadingSpinner: true,
            //   //     })
            //       // this.signInWithPhoneNumber(this.state.countryCode + this.state.phoneNumber, false)
            //   //   }
            //   // }
            //   // else {
            //   //   this.setState({
            //   //     showDialog: true,
            //   //     errorMessage: translate("Please login with email"),
            //   //   });
            //   // }

            //   // Login with phone number
            //   // if (doc.data().NoEmail !== undefined) {
            //   //   if (doc.data().NoEmail === true) {
            //   //     this.setState({
            //   //       loadingSpinner: true,
            //   //     })
            //   //     this.signInWithPhoneNumber(this.state.countryCode + this.state.phoneNumber)
            //   //   }
            //   // }
            //   // else {
            //   //   if ((doc.data().Password !== undefined) && (doc.data().Email !== undefined)) {
            //   //     // Login with email
            //   //     //decrypt password
            //   //     let bytes = CryptoJS.AES.decrypt(
            //   //       doc.data().Password,
            //   //       'SenzeHub is the best',
            //   //     );
            //   //     let originalText = bytes.toString(CryptoJS.enc.Utf8);

            //   //     this.setState({
            //   //       email: doc.data().Email,
            //   //       password: originalText,
            //   //     });
            //   //     this.handleLogin();
            //   //   }
            //   // }
            // });
          }
        });
    }
  }

  handleLogin = () => {
    const { email, password } = this.state;

    if (email === '' || password === '') {
      this.setState({
        showDialog: true,
        errorMessage: translate('Email Address or Password cannot be empty'),
      });
      return;
    }

    this.setState({
      loadingSpinner: true,
    })

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        var user = auth().currentUser;
        if (user.emailVerified == false) {
          this.setState({
            errorMessage:
              translate('Please check your inbox junk to verfiy your email before sign in'),
            showDialog: true,
            loadingSpinner: false,
          });
        } else {
          this.roleChecking(user);
        }
      })
      .catch(error => {
        this.setState({
          loadingSpinner: false,
        });
        switch (error.code) {
          case 'auth/wrong-password':
            this.setState({
              errorMessage:
                translate('The password is invalid or the user does not have a password'),
              showDialog: true,
            });
            break;
          case 'auth/invalid-email':
            this.setState({
              errorMessage: translate('The email address is badly formatted'),
              showDialog: true,
            });
            break;
          case 'auth/user-not-found':
          case 'auth/user-disabled':
            this.setState({
              errorMessage:
                translate('There is no user record corresponding to this identifier'),
              showDialog: true,
            });
            break
        }
      });
  };

  navNextScreen = (role) => {
    this.setState({ loadingSpinner: false })

    firestore().collection('Users')
      .doc(auth().currentUser.uid)
      .collection('LogHistory')
      .add({
        From: "Mobile",
        Action: "Login",
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        if (role === '0') {
          //----->Senior Citizen Screen == APP, Role == 0
          this.props.navigation.navigate('Senior');
        } else if (role === '1') {
          //----->Senior Citizen Volunteer == Volunteer, Role == 1
          this.props.navigation.navigate('Volunteer');
        } else if (role === '2') {
          this.props.navigation.navigate('Caregiver');
        } else if (role === '7') {
          this.props.navigation.navigate('HealthCheck');
        } else if (role === '-1') {
          this.props.navigation.navigate('Gym');
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  processSingpassID = event => {
    if (event.nativeEvent.data.startsWith('<head></head><body>')) {
      const regex = /<[^>]*>/gim;
      const text = event.nativeEvent.data;
      const sinpassUUIDraw = text.replace(regex, '');
      let sinpassUUID = sinpassUUIDraw.split('=');

      // Reset UI
      this.setState({
        mainSignIn: true,
        showNonSPLogin: false,
        showNumberLogin: false,
        showPhoneNumber: false,
        showVerifyCode: false,
        showSPLogin: false,
        singpassUUID: sinpassUUID[1],
        sheetRef: null,
        loadingSpinner: false,
      });

      // Check whether user exists
      dbRefSingpass = firestore().collection('Users');
      dbRefSingpass
        .where('SingpassUUID', '==', sinpassUUID[1])
        .limit(1)
        .get()
        .then(singpassSnapshot => {
          if (singpassSnapshot.empty) {
            // Navigate to Register screen
            this.setState({
              showDialog: true,
              errorMessage:
                translate('Thank you for using SenzeHub App'),
            });
          } else {
            singpassSnapshot.forEach(doc => {
              //decrypt password
              let bytes = CryptoJS.AES.decrypt(
                doc.data().Password,
                'SenzeHub is the best',
              );
              let originalText = bytes.toString(CryptoJS.enc.Utf8);

              this.setState({
                email: doc.data().Email,
                password: originalText,
              });
              this.handleLogin();
            });
          }
        });
    }
  };

  startCountDownTimer = () => {
    //Start countdown timer

    this.interval = setInterval(
      () => this.setState({
        codeTimer: this.state.codeTimer - 1
      }, () => {
        if (this.state.codeTimer === 0) {
          clearInterval(this.interval);
          this.setState({ enableResend: true })
        }
      }),
      1000
    );
  }

  gymRegistration = () => {
    // For Gym2022 straight go to gym screen
    AsyncStorage.getItem('gym2022').then(value => {
      if (value) {
        this.props.navigation.navigate('Gym');
      } else {
        this.props.navigation.navigate('GymRegister');
      }
    })
  }

  helpInfo = () => {
    this.setState({
      errorMessage: "For enquiries, please email us at contact@senzehub.com",
      showDialog: true,
    });
  }

  signInWithPhoneNumber = async (phoneNumber, resend) => {
    try {
      let confirmation;

      if (resend) {
        confirmation = await auth().signInWithPhoneNumber(phoneNumber, true);
      }
      else {
        confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      }
      this.setState({
        phoneAuth: true,
        phoneConfirm: confirmation,
        showPhoneNumber: false,
        showVerifyCode: true,
        loadingSpinner: false,
      })

      let unsubscribe = auth().onAuthStateChanged((user) => {
        if (user) {
          console.log(user)
          if (this.state.phoneAuth) {
            this.setState({
              loadingSpinner: false,
            })
            unsubscribe();
            this.roleChecking(user);
          }
        }
      });

      this.startCountDownTimer();

    } catch (error) {
      this.setState({
        loadingSpinner: false,
        showDialog: true,
        errorMessage: error.message
      })
      console.log(error);
    }
  }

  confirmCode = async () => {
    this.setState({
      loadingSpinner: true,
    })
    try {
      await this.state.phoneConfirm.confirm(this.state.smsCode);
      this.setState({
        loadingSpinner: false,
      })
      if (auth().currentUser !== null) {
        this.roleChecking(auth().currentUser);
      }
    } catch (error) {
      this.setState({
        loading: false,
        loadingSpinner: false,
        showDialog: true,
        errorMessage:
          error.message
      })
      console.log(error);
    }
  }

  roleChecking = (user) => {

    dbRef = firestore().collection('Users').doc(user.uid);
    dbRef.get().then(data => {

      if (data.exists) {
        let role = data.data().Role;
        if (role === '3' || role === '4') {
          this.setState({
            errorMessage: translate('You are not authorized'),
            showDialog: true,
          });
        } else {
          dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid).get().then((snapshot) => {
            const THKorgID = "A4tUdFPVYGe6uTqrb08T";

            // For THK Change Icon
            // if (snapshot.data().OrganizationId == THKorgID) {
            //   if (Platform.OS == 'ios') {
            //     changeIcon("thk").then(() => {
            //       this.navNextScreen(role)
            //     })
            //   }
            //   else {
            //     this.setState({
            //       errorMessage:
            //         translate('App will be restarted to change new settings'),
            //       showDialog: true,
            //     });
            //   }
            // }
            // else {  // For SenzeHub or other org
            //   let password = CryptoJS.AES.encrypt(
            //     this.state.password,
            //     'SenzeHub is the best',
            //   ).toString()

            //   dbRef.update({
            //     Password: password,
            //     LastLoginAt: firestore.FieldValue.serverTimestamp(),
            //     DeviceModel: DeviceInfo.getModel(),
            //     DeviceSystemVersion: DeviceInfo.getSystemVersion()
            //   });

            //   this.navNextScreen(role)
            // }

            // For SenzeHub or other org
            // let password = CryptoJS.AES.encrypt(
            //   this.state.password,
            //   'SenzeHub is the best',
            // ).toString()

            dbRef.update({
              // Password: password,
              LastLoginAt: firestore.FieldValue.serverTimestamp(),
              DeviceModel: DeviceInfo.getModel(),
              DeviceSystemVersion: DeviceInfo.getSystemVersion()
            });

            this.navNextScreen(role)
          })
        }
      }

    })
  }

  checkInAnimation = {
    0: {
      opacity: 1,
      scale: 0.9,
    },
    0.5: {
      opacity: 0.7,
      scale: 1,
    },
    1: {
      opacity: 1,
      scale: 0.9,
    },
  };

  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random() * 16;//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {//Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  render() {
    const injectScript =
      "window.ReactNativeWebView.postMessage(document.documentElement.innerHTML); const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);";
    // const uri = Platform.OS === 'android' ? 'https://us-central1-senzehch.cloudfunctions.net/singpass/singpass_qr/android' : 'https://us-central1-senzehch.cloudfunctions.net/singpass/singpass_qr/ios';

    return (
      <SafeAreaView style={styles.container}>
        <Container
          style={{
            backgroundColor: '#FFFFFF',
          }}>

          {this.state.showNonSPLogin === false &&
            this.state.showNumberLogin == false &&
            this.state.showSPLogin === false ? (
            // <View style={{ flex: 3 }}>
            <View>
              <Image
                style={styles.ImageTop}
                source={require('../assets/logo_combined.png')}
                resizeMode={'contain'}
              />
              <Text style={styles.version}>
                V{VersionInfo.appVersion}
                {/* <Icon
                  type="FontAwesome"
                  style={{ color: '#180D59' }}
                  name="question-circle"
                  onPress={() => this.helpInfo()}
                /> */}
              </Text>
              {/* <Animatable.View animation={this.checkInAnimation} easing="ease-in-out" iterationCount="infinite" iterationDelay={750}>
                <TouchableOpacity onPress={() => this.gymRegistration()}>
                  <Image
                    style={styles.ImageTopGym}
                    source={require('../assets/gym2022.png')}
                    resizeMode={'contain'}
                  />
                </TouchableOpacity>
              </Animatable.View> */}
            </View>
          ) : null}

          <View style={{ flex: 4 }}>
            <ScrollView>

              {this.state.mainSignIn && (
                <View style={{
                  width: '80%',
                  alignSelf: 'center',
                  justifyContent: 'center'
                }
                }>
                  <Text style={styles.greeting}>{translate('Existing User')}</Text>
                  <Button
                    style={[
                      mainStyles.button,
                      {
                        marginTop: 15,
                        backgroundColor: '#2196f3',
                        justifyContent: 'center',
                      },
                    ]}
                    onPress={() => {
                      this.setState({
                        mainSignIn: false,
                        showNonSPLogin: false,
                        showNumberLogin: true,
                        showPhoneNumber: true,
                        showVerifyCode: false,
                      });
                    }}>
                    <FontAwesome5
                      name="phone" size={25} color="#ffffff" />
                    <Text
                      uppercase={false}
                      style={{
                        fontWeight: 'bold',
                        fontSize: 15,
                      }}>
                      {translate('Sign in via Phone Number')}
                    </Text>
                  </Button>
                  <Button
                    style={[
                      mainStyles.button,
                      {
                        marginTop: 15,
                        backgroundColor: '#2196f3',
                        justifyContent: 'center',
                      },
                    ]}
                    onPress={() => {
                      this.setState({
                        mainSignIn: false,
                        showNumberLogin: false,
                        showNonSPLogin: true,
                        showPhoneNumber: false,
                        showVerifyCode: false,
                      });
                    }}>
                    <FontAwesome5 name="envelope" size={28} color="#ffffff" />
                    <Text
                      uppercase={false}
                      style={{ fontWeight: 'bold', fontSize: 15 }}>
                      {' '}
                      {translate('SIGN IN VIA EMAIL')}
                    </Text>
                  </Button>

                  {/* <Button
                    style={[
                      mainStyles.button,
                      {
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        marginTop: 15
                      },
                    ]}
                    onPress={() => {

                      Alert.alert('', translate('Have you created account with us?'), [
                        {
                          text: translate('NO'),
                          onPress: () => {
                            this.setState({
                              mainSignIn: true,
                              showNumberLogin: false,
                              showNonSPLogin: false,
                              showPhoneNumber: false,
                              showVerifyCode: false,
                            });
                            this.props.navigation.navigate('Register')
                          },
                          style: 'cancel',
                        },
                        {
                          text: translate('YES'),
                          onPress: () => {
                            // let state = this.makeid(16);
                            // let nounce = this.generateUUID();
                            // this.setState({ uri: "https://id.singpass.gov.sg/auth?client_id=fxDoDQgZ242o2EUCTrD0qxl82yilrf5m&redirect_uri=https://us-central1-senzehch.cloudfunctions.net/singpass/singpass_redirect&scope=openid&response_type=code&state=" + state + "&nonce=" + nounce + "&app_launch_url=https://senzehubapp.page.link/app" })
                            // // const uri = "https://id.singpass.gov.sg/auth?client_id=fxDoDQgZ242o2EUCTrD0qxl82yilrf5m&redirect_uri=https://us-central1-senzehch.cloudfunctions.net/singpass/singpass_redirect&scope=openid&response_type=code&state=" + state + "&nonce=" + nounce + "&app_launch_url=https://senzehubapp.page.link/app";
                            // console.log(this.state.uri)

                            let state = this.makeid(16);
                            let nounce = this.generateUUID();
                            let url = "https://id.singpass.gov.sg/auth?client_id=fxDoDQgZ242o2EUCTrD0qxl82yilrf5m&redirect_uri=https://us-central1-senzehch.cloudfunctions.net/singpass/singpass_redirect&scope=openid&response_type=code&state=" + state + "&nonce=" + nounce + "&app_launch_url=https://play.google.com/store/apps/details?id=com.senzehub";
                            Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
                            // this.setState({
                            //   mainSignIn: false,
                            //   showNonSPLogin: false,
                            //   showSPLogin: true,
                            // });
                          },
                        },
                      ]);
                    }}>
                    <Text
                      uppercase={false}
                      style={{ fontWeight: 'bold', fontSize: 15 }}>
                      {' '}
                      {translate('SIGN IN VIA')}
                    </Text>
                    <ImageBackground
                      source={require('../assets/singpass_logo_white.png')}
                      resizeMode="contain"
                      style={{
                        width: 100,
                        height: 30,
                      }}></ImageBackground>
                  </Button> */}

                  <Text
                    style={{ textAlign: 'center', margin: 15, marginTop: 35, color: 'grey' }}>
                    ---------- or ---------
                  </Text>

                  <Text style={styles.greeting}>{translate('Create New User Account')}</Text>
                  <Button
                    style={[
                      mainStyles.button,
                      {
                        marginTop: 15,
                        marginBottom: 45,
                        backgroundColor: '#2196f3',
                        justifyContent: 'center',
                      },
                    ]}
                    onPress={() => {
                      this.props.navigation.navigate('Register')
                    }}>
                    <FontAwesome5 name="user" size={28} color="#ffffff" />
                    <Text
                      uppercase={false}
                      style={{ fontWeight: 'bold', fontSize: 15 }}>
                      {' '}
                      {translate('CREATE ACCOUNT')}
                    </Text>
                  </Button>

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

                  {/* <TouchableOpacity
                    style={[styles.register, { marginTop: 45 }]}
                    onPress={() => this.props.navigation.navigate('Register')}>
                    <Text style={styles.newtext}>
                      {translate('NEW TO SENZEHUB')}?
                      <Text style={styles.signup}> {translate('CREATE ACCOUNT')}</Text>
                    </Text>
                  </TouchableOpacity> */}

                </View>
              )}

              {this.state.showNumberLogin === true ? (
                <View>
                  <Text
                    uppercase={false}
                    style={{ fontWeight: 'bold', fontSize: 25, alignSelf: 'center', margin: 25 }}>
                    {' '}
                    {translate('SIGN IN VIA')}
                  </Text>
                  <Form
                    style={{
                      margin: 15,
                      padding: 10,
                      borderRadius: 20,
                      borderWidth: 2,
                      backgroundColor: '#ffffffcc',
                      alignItems: 'center',
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text
                          style={{
                            marginLeft: 20,
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#180D59',
                          }}>
                          {translate('Sign in via Phone Number')}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={{ alignItems: 'flex-end' }}
                        onPress={() => {
                          Keyboard.dismiss();
                          this.setState({
                            phoneNumber: "",
                            smsCode: "",
                            mainSignIn: true,
                            showNonSPLogin: false,
                            showNumberLogin: false,
                            showPhoneNumber: false,
                            showVerifyCode: false,
                          });
                        }}>
                        <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={{
                        alignSelf: 'stretch',
                        marginLeft: 20,
                        marginRight: 20,
                      }}>
                      <View style={styles.inputView}>
                        {this.state.showPhoneNumber && (
                          <>
                            <View style={{ flexDirection: "row" }}>
                              <Text style={[styles.inputTitle, { flex: 1, marginRight: 10 }]}>{translate('Country Code')}</Text>
                              <Text style={[styles.inputTitle, { flex: 2, marginLeft: 10 }]}>{translate('PHONE NUMBER')}</Text>
                            </View>
                            <View style={{ flexDirection: "row" }}>
                              <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                autoCapitalize="none"
                                onChangeText={countryCode => this.setState({ countryCode })}
                                value={this.state.countryCode}
                              />
                              <TextInput
                                style={[styles.input, { flex: 2, marginLeft: 10 }]}
                                keyboardType="numeric"
                                autoCapitalize="none"
                                onChangeText={phoneNumber => this.setState({ phoneNumber })}
                                value={this.state.phoneNumber}
                                autoFocus={true}
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                  this.handleNumberLogin
                                }}
                              />
                            </View>
                            <Button
                              style={{
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 15,
                                backgroundColor: '#2196f3',
                              }}
                              onPress={this.handleNumberLogin}>
                              <Text>{translate('Submit')}</Text>
                            </Button>
                          </>
                        )}

                        {this.state.showVerifyCode && (
                          <>
                            <Text style={[styles.inputTitle, { flex: 2, marginLeft: 10 }]}>{translate('Enter Verification Code from SMS')}</Text>
                            <TextInput
                              style={[styles.input, { flex: 2, marginLeft: 10 }]}
                              autoCapitalize="none"
                              onChangeText={smsCode => this.setState({ smsCode })}
                              value={this.state.smsCode}
                              autoFocus={true}
                              returnKeyType="next"
                              onSubmitEditing={() => {
                                this.confirmCode
                              }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                              <Button
                                style={{
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginTop: 15,
                                  marginRight: 5,
                                  backgroundColor: this.state.enableResend ? '#2196f3' : '#2196f333',
                                }}
                                disabled={!this.state.enableResend}
                                onPress={() => {
                                  this.setState({ enableResend: false, codeTimer: 45 })
                                  this.signInWithPhoneNumber(this.state.countryCode + this.state.phoneNumber, true)
                                }}>
                                {!this.state.enableResend && (
                                  <Text> {translate('RESEND')} ({this.state.codeTimer}s) </Text>
                                )}
                                {this.state.enableResend && (
                                  <Text> {translate('RESEND')}</Text>
                                )}
                              </Button>
                              <Button
                                style={{
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginTop: 15,
                                  marginLeft: 5,
                                  backgroundColor: '#2196f3',
                                }}
                                onPress={this.confirmCode}>
                                <Text>{translate('Submit')}</Text>
                              </Button>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </Form>
                </View>

              ) : null}

              {this.state.showNonSPLogin === true ? (
                <View>
                  <Text
                    uppercase={false}
                    style={{ fontWeight: 'bold', fontSize: 25, alignSelf: 'center', margin: 25 }}>
                    {' '}
                    {translate('SIGN IN VIA')}
                  </Text>
                  <Form
                    style={{
                      margin: 15,
                      padding: 10,
                      borderRadius: 20,
                      borderWidth: 2,
                      backgroundColor: '#ffffffcc',
                      alignItems: 'center',
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text
                          style={{
                            marginLeft: 20,
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#180D59',
                          }}>
                          {translate('VIA EMAIL')}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={{ alignItems: 'flex-end' }}
                        onPress={() => {
                          Keyboard.dismiss();
                          this.setState({
                            email: "",
                            password: "",
                            mainSignIn: true,
                            showNonSPLogin: false,
                            showNumberLogin: false,
                            showPhoneNumber: false,
                            showVerifyCode: false,
                          });
                        }}>
                        <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={{
                        alignSelf: 'stretch',
                        marginLeft: 20,
                        marginRight: 20,
                      }}>
                      <View style={styles.inputView}>
                        <Text style={styles.inputTitle}>{translate('EMAIL ADDRESS')}</Text>
                        <TextInput
                          style={styles.input}
                          autoCapitalize="none"
                          onChangeText={email => this.setState({ email })}
                          value={this.state.email}
                          autoFocus={true}
                          returnKeyType="next"
                          onSubmitEditing={() => {
                            this.passwordTextInput.focus();
                          }}
                        />
                      </View>
                      <View style={styles.inputView}>
                        <Text style={styles.inputTitle}>{translate('PASSWORD')}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                          <TextInput style={[styles.input, { flex: 9 }]}
                            secureTextEntry={this.state.hidePassword ? true : false}
                            autoCapitalize="none"
                            onChangeText={password => this.setState({ password })}
                            value={this.state.password}
                            returnKeyType="next"
                            ref={(input) => { this.passwordTextInput = input; }}
                            onSubmitEditing={() => {
                              this.handleLogin();
                            }} />

                          <Icon
                            style={{ flex: 1 }}
                            name={this.state.hidePassword ? 'eye-off' : 'eye'}
                            size={15}
                            color="grey"
                            onPress={() => this.setState({ hidePassword: !this.state.hidePassword })}
                          />
                        </View>
                      </View>
                      {/* <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => this.props.navigation.navigate('Forgetpw')}>
                        <Text style={styles.newtext}>
                          <Text style={styles.signup}>{translate('FORGOT PASSWORD')}?</Text>
                        </Text>
                      </TouchableOpacity> */}
                      <Button
                        style={{
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 15,
                          backgroundColor: '#2196f3',
                          width: '70%'
                        }}
                        onPress={this.handleLogin}>
                        <Text>{translate('SIGN IN')}</Text>
                      </Button>
                      <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => this.props.navigation.navigate('Forgetpw')}>
                        <Text style={styles.newtext}>
                          <Text style={styles.signup}>{translate('FORGOT PASSWORD')}?</Text>
                        </Text>
                      </TouchableOpacity>
                      {/* <Button
                        style={{
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 25,
                          backgroundColor: '#2196f3',
                          width: '70%'
                        }}
                        onPress={() => this.props.navigation.navigate('Forgetpw')}>
                        <Text style="color: '#2196f3'">{translate('FORGOT PASSWORD')}</Text>
                      </Button> */}
                    </View>
                  </Form>
                </View>
              ) : null}

              {this.state.showSPLogin === true ? (
                <View>
                  <Text
                    uppercase={false}
                    style={{ fontWeight: 'bold', fontSize: 25, alignSelf: 'center', margin: 25 }}>
                    {' '}
                    {translate('SIGN IN VIA')}
                  </Text>
                  <Form
                    style={{
                      margin: 15,
                      padding: 10,
                      borderRadius: 20,
                      borderWidth: 2,
                      backgroundColor: '#ffffffcc',
                      alignItems: 'center',
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#180D59',
                          }}></Text>
                      </View>
                      <View style={{ flex: 0 }}>
                        <TouchableOpacity
                          style={{ alignItems: 'flex-end' }}
                          onPress={() => {
                            Keyboard.dismiss();
                            this.setState({
                              mainSignIn: true,
                              showSPLogin: false,
                            });
                          }}>
                          <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                        </TouchableOpacity>

                      </View>
                    </View>

                    {this.state.loadingSingpass && (
                      <View
                        style={{ alignSelf: 'center', backgroundColor: 'white' }}>
                        <ActivityIndicator color="#2196f3" size="large" />
                      </View>
                    )}
                    <View style={{ flex: 1, alignItems: 'center', marginTop: 10 }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: 'red',
                        }}>If Singpass is installed on another phone, please use that phone to scan QR to login</Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: 'white',
                        flex: 1,
                        flexDirection: 'row',
                        alignSelf: 'center',
                        height: 450,
                      }}>

                      <WebView
                        scalesPageToFit={Platform.OS === 'android' ? false : true}
                        javaScriptEnabled={true}
                        injectedJavaScript={injectScript}
                        onMessage={event => {
                          this.processSingpassID(event);
                        }}
                        domStorageEnabled={true}
                        ref={ref => (this.webview = ref)}
                        source={{
                          uri: this.state.uri,
                        }}
                        originWhitelist={['*']}
                        onShouldStartLoadWithRequest={request => {
                          const { url } = request;
                          if (
                            url.startsWith('intent://') &&
                            Platform.OS === 'android'
                          ) {
                            SendIntentAndroid.openChromeIntent(this.state.url);
                            return false;
                          } else {
                            return true;
                          }
                        }}
                        onLoadStart={syntheticEvent => {
                          this.setState({ loadingSingpass: true });
                        }}
                        onLoadEnd={syntheticEvent => {
                          this.setState({ loadingSingpass: false });
                        }}
                      />
                    </View>
                  </Form>
                </View>
              ) : null}
              {/* <Spinner
                color={'#2196f3'}
                overlayColor={'#ffffff99'}
                visible={this.state.loadingSpinner}
                tintColor="#123456"
                textContent={'Loading...'}
                textStyle={mainStyles.spinnerTextStyle}
              /> */}
              {this.state.loadingSpinner &&
                <View style={styles.loading}>
                  <ActivityIndicator color="#2196f3" size='large' />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      paddingRight: 10,
                      color: '#2196f3',
                    }}>
                    {translate('LOADING')}
                  </Text>
                </View>
              }
            </ScrollView>
          </View>
        </Container >

        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
            if (
              this.state.errorMessage ===
              translate('Thank you for using SenzeHub App')
            ) {
              this.props.navigation.navigate('Register', {
                singpass: this.state.singpassUUID,
              });
            }
            else if (this.state.errorMessage ===
              translate('App will be restarted to change new settings')) {
              this.setState({ loadingSpinner: true })

              changeIcon("thk").then(() => {
                BackHandler.exitApp();
              })
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
  },
  name: {
    marginTop: 2,
    fontWeight: 'bold',
    fontSize: 50,
    textAlign: 'center',
    color: themeVariables.brandPrimary,
  },
  greeting: {
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
    color: '#180D59',
    marginTop: 20,
    marginBottom: 5,
  },
  ImageTop: {
    // height: 130,
    height: 180,
    width: '100%',
    resizeMode: 'center',
  },
  ImageTopGym: {
    marginTop: 20,
    marginBottom: 20,
    height: 130,
    width: '100%',
    resizeMode: 'contain',
  },
  ImageTop2: {
    marginTop: 10,
    height: 80,
    width: '100%',
    resizeMode: 'contain',
  },
  errorMessage: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  error: {
    color: '#E9446A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputView: {
    marginTop: 32,
  },
  inputTitle: {
    color: '#180D59',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
    fontSize: 15,
    color: '#161F3D',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  register: {
    alignSelf: 'center',
    marginTop: 12,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 35,
    marginBottom: 24,
  },
  newtext: {
    color: '#414959',
    fontSize: 16,
  },
  signup: {
    fontWeight: '500',
    color: themeVariables.brandPrimary,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff99'
  },
  version: {
    // alignItems: 'center',
    // textAlign: 'center',
    alignSelf: 'flex-end',
    marginTop: 5,
    paddingRight: 10,
    position: 'absolute',
    fontSize: 10
  },
});

const mapStateToProps = state => {
  const { main } = state;
  return { loading: main.loading };
};

export default connect(mapStateToProps)(LoginScreen);
