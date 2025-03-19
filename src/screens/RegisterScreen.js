import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import SimpleDialog from '../components/SimpleDialog';
import themeVariables from '../../native-base-theme/variables/material_copy';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import { Text, Button } from 'native-base';
import { mainStyles } from '../styles/styles';
import Spinner from 'react-native-loading-spinner-overlay';
import BouncyCheckbox from "react-native-bouncy-checkbox";

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setLoading } from '../redux/actions';
import { WebView } from 'react-native-webview';

import CryptoJS from 'react-native-crypto-js';
import DatePicker from 'react-native-date-picker'

import SendIntentAndroid from 'react-native-send-intent'
import { translate } from '../../translations';

let dbRefUser;
let dbRefSingpass;

class RegisterScreen extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      manualInput: false,
      myInfo: false,
      myInfoEditable: true,
      showFields: false,
      showNoUUID: false,

      errorMessage: null,
      showDialog: false,
      loading: false,
      indicatorVisible: false,

      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phonenumber: '',
      address: '',
      postalcode: '',
      geoLocation: '',

      gender: '',
      dialect: '',
      race: '',
      dob: '',
      marital: '',
      residentialstatus: '',

      singpassUUID: '',

      Uid: null,
      role: null,

      noEmail: false,
      codeTimer: 45,
      enableResend: false,

      countryOpen: false,
      countryValue: '',
      countryItems: [
        {
          label: 'Australia',
          value: 'Australia',
        },
        {
          label: 'India',
          value: 'India',
        },
        {
          label: 'Indonesia',
          value: 'Indonesia',
        },
        {
          label: 'Malaysia',
          value: 'Malaysia',
        },
        {
          label: 'Singapore',
          value: 'Singapore',
        },
      ],

      roleOpen: false,
      roleValue: '',
      roleItems: [
        { label: 'Senior / User', value: '0' },
        { label: 'Volunteer', value: '1' },
        { label: 'Caregiver', value: '2' },
      ],

      time: new Date(),
      isDatePickerVisible: false,
      setDatePickerVisibility: false,

      sexOpen: false,
      sexValue: 'None',
      sexItems: [
        {
          label: 'MALE',
          value: 'MALE',
        },
        {
          label: 'FEMALE',
          value: 'FEMALE',
        }
      ],

      residentOpen: false,
      residentValue: 'None',
      residentItems: [
        {
          label: 'CITIZEN',
          value: 'CITIZEN',
        },
        {
          label: 'PR',
          value: 'PR',
        },
        {
          label: 'ALIEN',
          value: 'ALIEN',
        },
        {
          label: 'UNKNOWN',
          value: 'UNKNOWN',
        },
        {
          label: 'NOT APPLICABLE',
          value: 'NOT APPLICABLE',
        }
      ],

      maritalOpen: false,
      maritalValue: 'None',
      maritalItems: [
        {
          label: 'SINGLE',
          value: 'SINGLE',
        },
        {
          label: 'MARRIED',
          value: 'MARRIED',
        },
        {
          label: 'WIDOWED',
          value: 'WIDOWED',
        },
        {
          label: 'DIVORCED',
          value: 'DIVORCED',
        }
      ],

      orgOpen: false,
      orgValue: 'None',
      orgItems: [
        {
          label: 'None',
          value: 'none',
        },
      ],

      countryCode: '+65',
      phoneConfirm: null,
      smsCode: '',
      showVerifyCode: false,
    };

    this.setOpenCountry = this.setOpenCountry.bind(this);
    this.setValueCountry = this.setValueCountry.bind(this);
    this.setItemsCountry = this.setItemsCountry.bind(this);

    this.setOpenRole = this.setOpenRole.bind(this);
    this.setValueRole = this.setValueRole.bind(this);
    this.setItemsRole = this.setItemsRole.bind(this);

    this.setOpenSex = this.setOpenSex.bind(this);
    this.setValueSex = this.setValueSex.bind(this);
    this.setItemsSex = this.setItemsSex.bind(this);

    this.setOpenResident = this.setOpenResident.bind(this);
    this.setValueResident = this.setValueResident.bind(this);
    this.setItemsResident = this.setItemsResident.bind(this);

    this.setOpenMarital = this.setOpenMarital.bind(this);
    this.setValueMarital = this.setValueMarital.bind(this);
    this.setItemsMarital = this.setItemsMarital.bind(this);

    this.setOpenOrg = this.setOpenOrg.bind(this);
    this.setValueOrg = this.setValueOrg.bind(this);
    this.setItemsOrg = this.setItemsOrg.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    this.setState({
      valueC: 'singapore',
    });

    // Get Organization
    dbRefOrgId = firestore().collection('Organization');

    dbRefOrgId.get().then(orgSnapshot => {
      // Get organization list
      orgSnapshot.forEach(org => {
        this.state.orgItems.push({
          label: org.data().OrganizationName,
          value: org.id,
        });
      });
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.interval);
  }

  setOpenRole(roleOpen) {
    this.setState({
      roleOpen,
    });
  }

  setValueRole(callback) {
    this.setState(state => ({
      roleValue: callback(state.roleValue),
    }));
  }

  setItemsRole(callback) {
    this.setState(state => ({
      roleItems: callback(state.roleItems),
    }));
  }

  setOpenCountry(countryOpen) {
    this.setState({
      countryOpen,
    });
  }

  setValueCountry(callback) {
    this.setState(state => ({
      countryValue: callback(state.countryValue),
    }));
  }

  setItemsCountry(callback) {
    this.setState(state => ({
      countryItems: callback(state.countryItems),
    }));
  }

  setOpenSex(sexOpen) {
    this.setState({
      sexOpen,
    });
  }

  setValueSex(callback) {
    this.setState(state => ({
      sexValue: callback(state.sexValue),
      gender: callback(state.sexValue)
    }));
  }

  setItemsSex(callback) {
    this.setState(state => ({
      sexItems: callback(state.sexItems),
    }));
  }

  setOpenResident(residentOpen) {
    this.setState({
      residentOpen,
    });
  }

  setValueResident(callback) {
    this.setState(state => ({
      residentValue: callback(state.residentValue),
      residentialstatus: callback(state.residentValue)
    }));
  }

  setItemsResident(callback) {
    this.setState(state => ({
      residentItems: callback(state.residentItems),
    }));
  }

  setOpenMarital(maritalOpen) {
    this.setState({
      maritalOpen,
    });
  }

  setValueMarital(callback) {
    this.setState(state => ({
      maritalValue: callback(state.maritalValue),
      marital: callback(state.maritalValue),
    }));
  }

  setItemsMarital(callback) {
    this.setState(state => ({
      maritalItems: callback(state.maritalItems),
    }));
  }

  setOpenOrg(orgOpen) {
    this.setState({
      orgOpen,
    });
  }

  setValueOrg(callback) {
    this.setState(state => ({
      orgValue: callback(state.orgValue),
    }));
  }

  setItemsOrg(callback) {
    this.setState(state => ({
      orgItems: callback(state.orgItems),
    }));
  }

  handleManualInput = () => {
    this.setState({ manualInput: true, showFields: true });
  };

  RetrieveMyInfo = () => {
    this.setState({ myInfo: true, indicatorVisible: false });
  };

  processMyInfo = event => {

    const oriData = event.nativeEvent.data;
    const errorData = 'Error';
    const okData = '"status":"OK"';

    if (oriData.includes(errorData)) {
      this.setState({
        myInfo: false,
        myInfoEditable: false,
        manualInput: false,
        showFields: false,
        indicatorVisible: false,
      });
    } else if (oriData.includes(okData)) {
      const regex = /<[^>]*>/gim;
      const text = event.nativeEvent.data;
      const myInfo = text.replace(regex, '');

      const obj = JSON.parse(myInfo);

      this.setState({
        myInfo: false,
        myInfoEditable: false,
        manualInput: true,
        showFields: true,
        indicatorVisible: false,

        name: obj.text.name.value,
        email: obj.text.email.value,
        // phonenumber:
        //   obj.text.mobileno.prefix.value +
        //   obj.text.mobileno.areacode.value +
        //   obj.text.mobileno.nbr.value,
        phonenumber: obj.text.mobileno.nbr.value,
        address:
          'Blk ' +
          obj.text.regadd.block.value +
          ', ' +
          obj.text.regadd.street.value +
          ', #' +
          obj.text.regadd.floor.value +
          '-' +
          obj.text.regadd.unit.value,
        postalcode: obj.text.regadd.postal.value,
        countryValue: 'Singapore',
        gender: obj.text.sex.desc,
        dialect: obj.text.dialect.desc,
        race: obj.text.race.desc,
        dob: obj.text.dob.value,
        marital: obj.text.marital.desc,
        residentialstatus: obj.text.residentialstatus.desc,

        singpassUUID: obj.sub,
      });
    }
    // if (
    //   event.nativeEvent.data.startsWith(
    //     '<head><meta name="color-scheme" content="light dark"></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">Error',
    //   )
    // ) {
    //   this.setState({
    //     myInfo: false,
    //     myInfoEditable: false,
    //     manualInput: false,
    //     showFields: false,
    //     indicatorVisible: false,
    //   });
    // } else if (
    //   event.nativeEvent.data.startsWith(
    //     '<head><meta name="color-scheme" content="light dark"></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">{"status":"OK"',
    //     // '<head></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">{"status":"OK",',
    //   )
    // ) {
    //   const regex = /<[^>]*>/gim;
    //   const text = event.nativeEvent.data;
    //   const myInfo = text.replace(regex, '');

    //   const obj = JSON.parse(myInfo);

    //   this.setState({
    //     myInfo: false,
    //     myInfoEditable: false,
    //     manualInput: true,
    //     showFields: true,
    //     indicatorVisible: false,

    //     name: obj.text.name.value,
    //     email: obj.text.email.value,
    //     // phonenumber:
    //     //   obj.text.mobileno.prefix.value +
    //     //   obj.text.mobileno.areacode.value +
    //     //   obj.text.mobileno.nbr.value,
    //     phonenumber: obj.text.mobileno.nbr.value,
    //     address:
    //       'Blk ' +
    //       obj.text.regadd.block.value +
    //       ', ' +
    //       obj.text.regadd.floor.value +
    //       '-' +
    //       obj.text.regadd.unit.value +
    //       ', ' +
    //       obj.text.regadd.street.value,
    //     postalcode: obj.text.regadd.postal.value,
    //     countryValue: 'Singapore',
    //     gender: obj.text.sex.desc,
    //     dialect: obj.text.dialect.desc,
    //     race: obj.text.race.desc,
    //     dob: obj.text.dob.value,
    //     marital: obj.text.marital.desc,
    //     residentialstatus: obj.text.residentialstatus.desc,

    //     singpassUUID: obj.sub,
    //   });
    // }
  };

  //Function to Handle Login
  handleSignUp = () => {
    if (this.state.password !== this.state.confirmPassword) {
      this.props.setLoading(false);
      this.setState({
        loading: false,
        errorMessage: translate('Password is not identical'),
        showDialog: true,
      });
    }
    else if (
      this.state.name.trim() &&
      this.state.phonenumber.trim() &&
      // this.state.address.trim() &&
      // this.state.postalcode.trim() &&
      this.state.roleValue.trim() &&
      this.state.gender.trim() &&
      // this.state.race.trim() &&
      // this.state.dialect.trim() &&
      // this.state.dob.trim() &&
      // this.state.residentialstatus.trim() &&
      // this.state.marital.trim() &&
      this.state.orgValue.trim()
    ) {

      this.setState({ loading: true });

      // SignUp with phone number
      if (this.state.noEmail) {

        // Sign up with phone number
        this.signInWithPhoneNumber(this.state.countryCode + this.state.phonenumber, false)

        // create user detials
        // navigate to screen
      }
      else {
        if (this.state.password.trim().length < 8) {
          this.setState({
            errorMessage: translate('Password requires at least 8 characters'),
            showDialog: true,
          });
        }
        else {
          // SignUp with email
          auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(userCredentials => {
              this.updateUserProfile(userCredentials.user.uid)
            })
            .catch(error => {
              this.setState({ loading: false });
              this.props.setLoading(false);
              this.setState({
                errorMessage: error.message,
                showDialog: true,
              });
            });
        }

      }
    } else {
      this.setState({
        errorMessage: translate('Kindly fill up all the fields'),
        showDialog: true,
      });
    }
  };

  updateUserProfile = (uid) => {
    dbRefUser = firestore()
      .collection('Users')
      .doc(uid);

    //encrypt password
    let cipherPassword = CryptoJS.AES.encrypt(
      this.state.password,
      'SenzeHub is the best',
    ).toString();

    // 2: Caregiver
    if (this.state.roleValue === '2') {
      dbRefUser
        .set({
          Name: this.state.name,
          NoEmail: this.state.noEmail,
          Email: this.state.email,
          Password: cipherPassword,
          Country: this.state.countryValue,
          Role: this.state.roleValue,
          CountryCode: this.state.countryCode,
          PhoneNumber: this.state.phonenumber,
          Address: this.state.address,
          PostalCode: this.state.postalcode,
          GeoLocation: '',
          Uid: uid,
          FcmToken: '',
          CreatedAt: firestore.FieldValue.serverTimestamp(),
          Gender: this.state.gender,
          Dialect: this.state.dialect,
          Race: this.state.race,
          Marital: this.state.marital,
          Residentialstatus: this.state.residentialstatus,
          DateOfBirth: this.state.dob,
          SingpassUUID: this.state.singpassUUID,
          CreatedFrom: "Senzehub Mobile",
          OrganizationId: this.state.orgValue,
        })
        .then(() => {
          if (this.state.noEmail) {
            this.navNextScreen(this.state.roleValue);
          }
          else {
            this.sendEmailVerification();
          }

        });
    } else if (this.state.roleValue === '1') {
      // 1: Volunteer
      dbRefUser
        .set({
          Name: this.state.name,
          NoEmail: this.state.noEmail,
          Email: this.state.email,
          Password: cipherPassword,
          Country: this.state.countryValue,
          Role: this.state.roleValue,
          CountryCode: this.state.countryCode,
          PhoneNumber: this.state.phonenumber,
          Address: this.state.address,
          PostalCode: this.state.postalcode,
          GeoLocation: '',
          Uid: uid,
          FcmToken: '',
          CreatedAt: firestore.FieldValue.serverTimestamp(),
          CommonPool: true,
          Gender: this.state.gender,
          Dialect: this.state.dialect,
          Race: this.state.race,
          Marital: this.state.marital,
          Residentialstatus: this.state.residentialstatus,
          DateOfBirth: this.state.dob,
          SingpassUUID: this.state.singpassUUID,
          CreatedFrom: "Senzehub Mobile",
          OrganizationId: this.state.orgValue,
        })
        .then(() => {
          if (this.state.noEmail) {
            this.navNextScreen(this.state.roleValue);
          }
          else {
            this.sendEmailVerification();
          }
        });
    } else if (this.state.roleValue === '0') {
      // 0: Senior Citizen
      // dbRefUser
      //   .collection('SeniorData')
      //   .add({
      //     CreatedAt: firestore.FieldValue.serverTimestamp(),
      //     HeartRate: '--',
      //     Spo2: '--',
      //     Temperature: '--',
      //     Battery: '100',
      //     Fall: '0',
      //   })
      //   .then(() => {
      dbRefUser
        .set({
          Name: this.state.name,
          NoEmail: this.state.noEmail,
          Email: this.state.email,
          Password: cipherPassword,
          Country: this.state.countryValue,
          Role: this.state.roleValue,
          CountryCode: this.state.countryCode,
          PhoneNumber: this.state.phonenumber,
          Address: this.state.address,
          PostalCode: this.state.postalcode,
          SosNumber: '123',
          GeoLocation: '',
          Uid: uid,
          MaxHeartRate: '92',
          MinHeartRate: '65',
          MaxTemp: '39',
          MinTemp: '35',
          MaxSpo2: '100',
          MinSpo2: '95',
          Display: 'yes',
          FcmToken: '',
          Frequency: '4',
          ToggleDailyCheckin: true,
          DailyCheckinReminderAt: '08:00',
          WearableId: '',
          CreatedAt: firestore.FieldValue.serverTimestamp(),
          Gender: this.state.gender,
          Dialect: this.state.dialect,
          Race: this.state.race,
          Marital: this.state.marital,
          Residentialstatus: this.state.residentialstatus,
          DateOfBirth: this.state.dob,
          SingpassUUID: this.state.singpassUUID,
          CreatedFrom: "Senzehub Mobile",
          OrganizationId: this.state.orgValue,
        })
        .then(() => {
          if (this.state.noEmail) {
            this.navNextScreen(this.state.roleValue);
          }
          else {
            this.sendEmailVerification();
          }
        });
      // });
    }
  }

  navNextScreen = (role) => {
    if (role === '0') {
      //----->Senior Citizen Screen == APP, Role == 0
      this.props.navigation.navigate('Senior');
    } else if (role === '1') {
      //----->Senior Citizen Volunteer == Volunteer, Role == 1
      this.props.navigation.navigate('Volunteer');
    } else if (role === '2') {
      this.props.navigation.navigate('Caregiver');
    }
  }

  sendEmailVerification = () => {
    var user = auth().currentUser;
    user.sendEmailVerification();

    auth()
      .signOut()
      .then(() => {
        this.setState({ loading: false });
        this.props.setLoading(false);
        this.setState({
          errorMessage:
            translate('Account Created'),
          showDialog: true,
        });
      });
  };

  makeid(length) {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

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

  handleDateConfirm = date => {
    var setdob =
      new Date(date).getDate() +
      '-' +
      (new Date(date).getMonth() + 1) +
      '-' +
      new Date(date).getFullYear();

    this.setState({
      dob: setdob,
    }),
      this.hideDatePicker();
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
        phoneConfirm: confirmation,
        showPhoneNumber: false,
        phoneAuth: true,
        showVerifyCode: true,
        loadingSpinner: false,
        loading: false
      })

      this.startCountDownTimer();

      let unsubscribe = auth().onAuthStateChanged((user) => {

        if (this.state.phoneAuth) {
          this.setState({
            phoneAuth: false,
            showVerifyCode: false,
          })
          unsubscribe();
          this.updateUserProfile(user.uid)
        }
      });

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
      loading: true,
    })
    try {
      await this.state.phoneConfirm.confirm(this.state.smsCode);
      this.setState({
        loading: false,
      })
      if (auth().currentUser !== null) {
        this.updateUserProfile(auth().currentUser.uid)
      }
    } catch (error) {
      this.setState({
        loading: false,
        showDialog: true,
        errorMessage:
          error.message
      })
      console.log(error);
    }
  }

  render() {
    const {
      countryOpen,
      countryValue,
      countryItems,
      roleOpen,
      roleValue,
      roleItems,
      orgOpen,
      orgValue,
      orgItems,
    } = this.state;

    const injectScript =
      "window.ReactNativeWebView.postMessage(document.documentElement.innerHTML); const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);";

    const uri =
      'https://api.myinfo.gov.sg/com/v3/authorise?client_id=PROD-201907691D-SENZEHUB-ACCTREG&attributes=name,email,mobileno,regadd,sex,race,dialect,dob,residentialstatus,marital&purpose=SenzeHub Sign Up&state=' +
      this.makeid(16) +
      '&redirect_uri=https://asia-southeast1-senzehch.cloudfunctions.net/myinfo/callback';

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ backgroundColor: '#FFFFFF' }}>
          <KeyboardAvoidingView behavior={'padding'} style={styles.container}>

            <View style={styles.container}>
              <StatusBar barStyle="light-content" />
              {/* <Image
                style={styles.ImageTop}
                source={require('../assets/top.png')}
              /> */}
              <Text style={styles.greeting}>{translate('CREATE ACCOUNT')}</Text>
              <TouchableOpacity
                style={styles.back}
                onPress={() => this.props.navigation.goBack()}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>

              {this.state.manualInput == false && this.state.myInfo == false && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: '#2196f3', alignItems: 'center' },
                    ]}
                    onPress={this.handleManualInput}>
                    <Text style={styles.text}>{translate('INPUT INFO MANUALLY')}</Text>
                  </TouchableOpacity>
                  {/* <Text
                    style={{ textAlign: 'center', margin: 15, color: 'grey' }}>
                    ---------- {translate('or')} ---------
                  </Text>
                  <Text
                    // Simply create account using Myinfo with Singpass to pre-fill
                    // your details. Once that’s done, sit back and enjoy SenzeHub
                    // mobile app in seconds.
                    style={{ textAlign: 'center', margin: 15, color: 'grey' }}>
                    {translate('SIMPLY CREATE ACCOUNT USING MYINFO WITH SINGPASS TO PRE FILL YOUR DETAILS ONCE THAT IS DONE SIT BACK AND ENJOY SENZEHUB MOBILE APP IN SECONDS')}
                  </Text>
                  <Button
                    style={[
                      styles.button,
                      {
                        backgroundColor: 'red',
                        elevation: 0,
                        alignItems: 'center',
                      },
                    ]}
                    onPress={this.RetrieveMyInfo}>
                    <ImageBackground
                      source={require('../assets/singpass_myinfo.png')}
                      resizeMode="contain"
                      style={{
                        width: 330,
                        height: 52,
                      }}></ImageBackground>
                  </Button> */}
                  <Text style={styles.disclaimer}>{translate('DISCLAIMER: SENZE DEVICE AND MOBILE APPLICATION ARE NOT INTENDED FOR USE IN THE DETECTION, DIAGNOSIS, MONITORING, MANAGEMENT OR TREATMENT OF ANY MEDICAL CONDITION OR DISEASE ANY HEALTH-RELATED INFORMATION ACCESSED THROUGH THE DEVICE AND APPLICATION SHOULD NOT BE TREATED AS MEDICAL ADVICE USERS SHOULD SEEK PROPER MEDICAL ADVICE FROM A PHYSICIAN')}</Text>

                  {/* <Text
                    style={{textAlign: 'center', margin: 15, color: 'grey'}}>
                    ---------- {translate('or')} ---------
                  </Text>
                  <TouchableOpacity
                    style={styles.register}
                    onPress={() => this.props.navigation.navigate('Login')}>
                    <Text style={styles.newtext}>
                      Already have an account?{' '}
                      <Text style={styles.signin}>Click Here</Text>
                    </Text>
                  </TouchableOpacity> */}
                </>
              )}
              {this.state.manualInput == true && !this.state.showVerifyCode && this.state.showFields == true && (
                <View style={styles.form}>
                  <View>
                    <Text style={styles.inputTitle}>Name</Text>
                    {this.state.myInfoEditable === true ? (
                      <TextInput
                        style={styles.inputEditable}
                        editable={this.state.myInfoEditable}
                        autoCapitalize="none"
                        onChangeText={name => this.setState({ name })}
                        value={this.state.name}
                        autoFocus={true}
                      // returnKeyType="next"
                      // onSubmitEditing={() => {
                      //   this.nextInput.focus();
                      // }}
                      />
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.name}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Sex</Text>
                    {this.state.myInfoEditable === true ? (
                      // <TextInput
                      //   style={styles.inputEditable}
                      //   editable={this.state.myInfoEditable}
                      //   autoCapitalize="none"
                      //   onChangeText={gender => this.setState({ gender })}
                      //   value={this.state.gender}
                      //   returnKeyType="next"
                      //   onSubmitEditing={() => {
                      //     this.nextInput.focus();
                      //   }}
                      // />
                      <DropDownPicker
                        open={this.state.sexOpen}
                        value={this.state.sexValue}
                        items={this.state.sexItems}
                        setOpen={this.setOpenSex}
                        setValue={this.setValueSex}
                        setItems={this.setItemsSex}
                        listMode="SCROLLVIEW"
                        style={{
                          backgroundColor: '#FFFFFF',
                        }}
                        dropDownDirection="TOP"
                      />
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.gender}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Date of Birth</Text>
                    {this.state.myInfoEditable === true ? (
                      // <TextInput
                      //   style={styles.inputEditable}
                      //   editable={this.state.myInfoEditable}
                      //   autoCapitalize="none"
                      //   onChangeText={dob => this.setState({ dob })}
                      //   value={this.state.dob}
                      //   returnKeyType="next"
                      //   onSubmitEditing={() => {
                      //     this.nextInput.focus();
                      //   }}
                      // />

                      <View>
                        <Text style={styles.inputR}>{this.state.dob}</Text>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            { backgroundColor: '#2196f3', alignItems: 'center' },
                          ]}
                          onPress={this.showDatePicker}>
                          <Text style={styles.text}>SET DATE OF BIRTH</Text>
                        </TouchableOpacity>

                        <DatePicker
                          modal
                          open={this.state.isDatePickerVisible}
                          mode='date'
                          date={this.state.time}
                          locale="en_GB"
                          onConfirm={(date) => {
                            this.handleDateConfirm(date)
                          }}
                          onCancel={() => {
                            this.hideDatePicker()
                          }}
                          theme='light'
                        />
                      </View>
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.dob}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Race</Text>
                    {this.state.myInfoEditable === true ? (
                      <TextInput
                        style={styles.inputEditable}
                        editable={this.state.myInfoEditable}
                        autoCapitalize="none"
                        onChangeText={race => this.setState({ race })}
                        value={this.state.race}
                      // returnKeyType="next"
                      // onSubmitEditing={() => {
                      //   this.nextInput.focus();
                      // }}
                      />
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.race}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Dialect</Text>
                    {this.state.myInfoEditable === true ? (
                      <TextInput
                        style={styles.inputEditable}
                        editable={this.state.myInfoEditable}
                        autoCapitalize="none"
                        onChangeText={dialect => this.setState({ dialect })}
                        value={this.state.dialect}
                      // returnKeyType="next"
                      // onSubmitEditing={() => {
                      //   this.nextInput.focus();
                      // }}
                      />
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.dialect}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Residential Status</Text>
                    {this.state.myInfoEditable === true ? (
                      // <TextInput
                      //   style={styles.inputEditable}
                      //   editable={this.state.myInfoEditable}
                      //   autoCapitalize="none"
                      //   onChangeText={residentialstatus => this.setState({ residentialstatus })}
                      //   value={this.state.residentialstatus}
                      //   returnKeyType="next"
                      //   onSubmitEditing={() => {
                      //     this.nextInput.focus();
                      //   }}
                      // />
                      <DropDownPicker
                        open={this.state.residentOpen}
                        value={this.state.residentValue}
                        items={this.state.residentItems}
                        setOpen={this.setOpenResident}
                        setValue={this.setValueResident}
                        setItems={this.setItemsResident}
                        listMode="SCROLLVIEW"
                        style={{
                          backgroundColor: '#FFFFFF',
                        }}
                        dropDownDirection="TOP"
                      />
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.residentialstatus}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Marital Status</Text>
                    {/* <TextInput
                      style={styles.inputEditable}
                      editable={this.state.myInfoEditable}
                      autoCapitalize="none"
                      onChangeText={marital => this.setState({ marital })}
                      value={this.state.marital}
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        this.nextInput.focus();
                      }}
                    /> */}
                    <DropDownPicker
                      open={this.state.maritalOpen}
                      value={this.state.maritalValue}
                      items={this.state.maritalItems}
                      setOpen={this.setOpenMarital}
                      setValue={this.setValueMarital}
                      setItems={this.setItemsMarital}
                      listMode="SCROLLVIEW"
                      style={{
                        backgroundColor: '#FFFFFF',
                      }}
                      dropDownDirection="TOP"
                    />
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Address</Text>
                    {this.state.myInfoEditable === true ? (
                      <TextInput
                        style={styles.inputEditable}
                        editable={this.state.myInfoEditable}
                        autoCapitalize="none"
                        onChangeText={address => this.setState({ address })}
                        value={this.state.address}
                        returnKeyType="next"
                        ref={nextInput6 => (this.nextInput6 = nextInput6)}
                        onSubmitEditing={() => {
                          this.nextInput7.focus();
                        }}
                      />
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.address}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Postal Code</Text>
                    {this.state.myInfoEditable === true ? (
                      <TextInput
                        style={styles.inputEditable}
                        editable={this.state.myInfoEditable}
                        keyboardType="numeric"
                        maxLength={6}
                        autoCapitalize="none"
                        onChangeText={postalcode => this.setState({ postalcode })}
                        value={this.state.postalcode}
                        returnKeyType="done"
                        ref={nextInput7 => (this.nextInput7 = nextInput7)}
                        onSubmitEditing={() => {
                          this.nextInput8.focus();
                        }}
                      />
                    ) : (
                      <Text style={styles.inputUneditable}>
                        {this.state.postalcode}
                      </Text>
                    )}
                  </View>

                  {/* <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Country</Text>
                    <DropDownPicker
                      open={countryOpen}
                      value={countryValue}
                      items={countryItems}
                      setOpen={this.setOpenCountry}
                      setValue={this.setValueCountry}
                      setItems={this.setItemsCountry}
                      listMode="SCROLLVIEW"
                      style={{
                        backgroundColor: 'whitesmoke',
                      }}
                      dropDownDirection="TOP"
                      placeholder="Select Country"
                      listMode="SCROLLVIEW"
                    />
                  </View> */}

                  {/* <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Phone Number</Text>
                    <TextInput
                      style={styles.inputEditable}
                      keyboardType="numeric"
                      maxLength={11}
                      autoCapitalize="none"
                      onChangeText={phonenumber => this.setState({ phonenumber })}
                      value={this.state.phonenumber}
                      returnKeyType="next"
                      ref={nextInput5 => (this.nextInput5 = nextInput5)}
                      onSubmitEditing={() => {
                        this.nextInput6.focus();
                      }}
                    />
                  </View> */}

                  <View style={styles.inputView}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={[styles.inputTitle, { flex: 1, marginRight: 10 }]}>{translate('Country Code')}</Text>
                      <Text style={[styles.inputTitle, { flex: 2, marginLeft: 10 }]}>{translate('PHONE NUMBER')}</Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <TextInput
                        style={[styles.inputEditable, { flex: 1, marginRight: 10 }]}
                        autoCapitalize="none"
                        onChangeText={countryCode => this.setState({ countryCode })}
                        value={this.state.countryCode}
                      />
                      <TextInput
                        style={[styles.inputEditable, { flex: 2, marginLeft: 10 }]}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        onChangeText={phonenumber => this.setState({ phonenumber })}
                        value={this.state.phonenumber}
                        ref={nextInput8 => (this.nextInput8 = nextInput8)}
                      />
                    </View>
                  </View>


                  <View style={[styles.inputView, { flexDirection: 'row', justifyContent: 'flex-start' }]}>
                    <BouncyCheckbox
                      ref={(ref) => (bouncyCheckboxRef = ref)}
                      size={25}
                      fillColor="#180D59"
                      unfillColor="#ffffff"
                      isChecked={this.state.noEmail}
                      onPress={noEmail => this.setState({ noEmail })} />
                    <Text onPress={() => bouncyCheckboxRef?.onPress()}
                      style={[styles.inputTitle, { alignSelf: 'center' }]}>I do not have Email Address</Text>
                  </View>


                  {this.state.noEmail !== true ? (
                    <>
                      <View style={styles.inputView}>
                        <Text style={styles.inputTitle}>Email Address</Text>
                        <TextInput
                          style={styles.inputEditable}
                          autoCapitalize="none"
                          onChangeText={email => this.setState({ email })}
                          value={this.state.email}
                          returnKeyType="next"
                          ref={nextInput2 => (this.nextInput2 = nextInput2)}
                          onSubmitEditing={() => {
                            this.nextInput3.focus();
                          }}
                        />
                      </View>

                      <View style={styles.inputView}>
                        <Text style={styles.inputTitle}>
                          Password (Minimum 8 characters)
                        </Text>
                        <TextInput
                          style={styles.inputEditable}
                          secureTextEntry={true}
                          autoCapitalize="none"
                          onChangeText={password => this.setState({ password })}
                          value={this.state.password}
                          returnKeyType="next"
                          ref={nextInput3 => (this.nextInput3 = nextInput3)}
                          onSubmitEditing={() => {
                            this.nextInput4.focus();
                          }}
                        />
                      </View>

                      <View style={styles.inputView}>
                        <Text style={styles.inputTitle}>Confirm Password</Text>
                        <TextInput
                          style={styles.inputEditable}
                          secureTextEntry={true}
                          autoCapitalize="none"
                          onChangeText={confirmPassword =>
                            this.setState({ confirmPassword })
                          }
                          value={this.state.confirmPassword}
                          returnKeyType="next"
                          ref={nextInput4 => (this.nextInput4 = nextInput4)}
                        />
                      </View>
                    </>
                  ) : null}

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>Role</Text>
                    <DropDownPicker
                      open={roleOpen}
                      value={roleValue}
                      items={roleItems}
                      setOpen={this.setOpenRole}
                      setValue={this.setValueRole}
                      setItems={this.setItemsRole}
                      listMode="SCROLLVIEW"
                      dropDownDirection="TOP"
                      placeholder="Select Role"
                    />
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>
                      {translate('UNDER ORGANIZATION (OPTIONAL)')}
                    </Text>
                    <DropDownPicker
                      open={orgOpen}
                      value={orgValue}
                      items={orgItems}
                      setOpen={this.setOpenOrg}
                      setValue={this.setValueOrg}
                      setItems={this.setItemsOrg}
                      listMode="SCROLLVIEW"
                      style={{
                        backgroundColor: '#FFFFFF',
                      }}
                      dropDownDirection="TOP"
                      placeholder="Select Organization"
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: '#2196f3', marginTop: 30 },
                    ]}
                    onPress={this.handleSignUp}>
                    <Text style={styles.text}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              )}

              {this.state.showVerifyCode && (
                <>
                  <View style={{ margin: 15 }}>
                    <Text style={[styles.inputTitle, { flex: 2, marginLeft: 10 }]}>{translate('Enter Verification Code from SMS')}</Text>
                    <TextInput
                      style={[styles.inputEditable, { flex: 2, marginLeft: 10 }]}
                      autoCapitalize="none"
                      onChangeText={smsCode => this.setState({ smsCode })}
                      value={this.state.smsCode}
                      autoFocus={true}
                    // returnKeyType="next"
                    // onSubmitEditing={() => {
                    //   this.confirmCode()
                    // }}
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
                          this.signInWithPhoneNumber(this.state.countryCode + this.state.phonenumber, true)
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
                  </View>

                </>
              )}
            </View>
            {this.state.myInfo === true ? (
              <View
                style={{
                  backgroundColor: 'white',
                  flex: 1,
                  flexDirection: 'column',
                  alignSelf: 'flex-start',
                  width: '100%',
                  height: 1100,
                }}>
                {this.state.indicatorVisible && (
                  <ActivityIndicator color="#2196f3" size="large" />
                )}
                <WebView
                  scalesPageToFit={Platform.OS === 'android' ? false : true}
                  javaScriptEnabled={true}
                  injectedJavaScript={injectScript}
                  onMessage={event => {
                    this.processMyInfo(event);
                  }}
                  domStorageEnabled={true}
                  ref={ref => (this.webview = ref)}
                  source={{
                    uri: uri,
                  }}
                  originWhitelist={['*']}
                  onShouldStartLoadWithRequest={request => {
                    const { url } = request;
                    if (
                      url.startsWith('intent://') &&
                      Platform.OS === 'android'
                    ) {
                      SendIntentAndroid.openChromeIntent(url);
                      return false;
                    } else {
                      return true;
                    }
                  }}
                />
              </View>
            ) : null}
          </KeyboardAvoidingView>
        </ScrollView>

        {this.state.loading &&
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
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({
              showDialog: false,
            });
            if (
              this.state.errorMessage ===
              translate('Account Created')
            ) {
              this.props.navigation.navigate('Login');
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
  },
  greeting: {
    marginTop: 40,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    //fontFamily: 'monospace',
    color: '#180D59',
    marginBottom: 35,
  },
  disclaimer: {
    fontSize: 10,
    textAlign: 'justify',
    color: '#180D59',
    margin: 15,
    marginTop: 130,
    marginBottom: 10,
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
  form: {
    marginBottom: 48,
    marginHorizontal: 30,
  },

  inputView: {
    marginTop: 32,
  },
  inputR: {
    fontSize: 16,
    padding: 10,
    color: '#161F3D',
  },
  inputTitle: {
    color: '#180D59',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  inputEditable: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
    fontSize: 15,
    color: '#161F3D',
  },
  inputUneditable: {
    height: 50,
    fontSize: 15,
    color: '#5B6277',
  },
  button: {
    marginHorizontal: 30,
    borderRadius: 8,
    witdh: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: '500',
  },
  register: {
    alignSelf: 'center',
  },
  newtext: {
    color: '#414959',
    fontSize: 16,
    marginBottom: 50,
  },
  signin: {
    fontWeight: '500',
    color: themeVariables.brandPrimary,
  },
  ImageTop: {
    height: 130,
    width: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    top: 15,
    left: 15,
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
  }
});

const mapStateToProps = state => {
  const { main } = state;
  return { loading: main.loading };
};

export default connect(mapStateToProps, { setLoading })(RegisterScreen);