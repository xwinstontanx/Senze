import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import SimpleDialog from '../components/SimpleDialog';
import themeVariables from '../../native-base-theme/variables/material_copy';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Text } from 'native-base';
import ToggleSwitch from 'toggle-switch-react-native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setLoading } from '../redux/actions';

import { translate } from '../../translations';

import AsyncStorage from '@react-native-async-storage/async-storage';


let dbRefUser;

class GymRegisterScreen extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
      loading: false,

      name: '',
      email: '',
      // password: '',
      // confirmPassword: '',
      phonenumber: '',
      address: '',
      postalcode: '',
      geoLocation: '',

      Uid: null,
      role: null,

      countryCode: '+65',
      phoneConfirm: null,

      cpStatus: true
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  //Function to Handle Login
  handleSignUp = () => {

    if (
      this.state.name.trim() &&
      this.state.phonenumber.trim() &&
      this.state.email.trim()) {

      // SignUp with anonymously
      auth()
        .signInAnonymously()
        .then(userCredentials => {
          this.updateUserProfile(userCredentials.user.uid)
        })
        .catch(error => {
          this.setState({
            errorMessage: error.message,
            showDialog: true,
          });
        });

    } else {
      this.setState({
        errorMessage: translate('Kindly fill up all the fields'),
        showDialog: true,
      });
    }

    // if (this.state.password !== this.state.confirmPassword) {
    //   this.setState({
    //     loading: false,
    //     errorMessage: translate('Password is not identical'),
    //     showDialog: true,
    //   });
    // }
    // else if (
    //   this.state.name.trim() &&
    //   this.state.phonenumber.trim()
    // ) {
    //   if (this.state.password.trim().length < 8) {
    //     this.setState({
    //       errorMessage: translate('Password requires at least 8 characters'),
    //       showDialog: true,
    //     });
    //   }
    //   else {
    //     // SignUp with email
    //     auth()
    //       .createUserWithEmailAndPassword(this.state.email, this.state.password)
    //       .then(userCredentials => {
    //         this.updateUserProfile(userCredentials.user.uid)
    //       })
    //       .catch(error => {
    //         this.setState({
    //           errorMessage: error.message,
    //           showDialog: true,
    //         });
    //       });
    //   }
    // } else {
    //   this.setState({
    //     errorMessage: translate('Kindly fill up all the fields'),
    //     showDialog: true,
    //   });
    // }
  };

  updateUserProfile = (uid) => {
    dbRefUser = firestore()
      .collection('Users')
      .doc(uid);

    dbRefUser
      .set({
        Name: this.state.name,
        Email: this.state.email,
        // Password: cipherPassword,
        Country: "Singapore",
        Role: "-1",
        CountryCode: this.state.countryCode,
        PhoneNumber: this.state.phonenumber,
        // GeoLocation: '',
        Uid: uid,
        FcmToken: '',
        CreatedAt: firestore.FieldValue.serverTimestamp(),
        CreatedFrom: "Senzehub Mobile",
        CommonPool: this.state.cpStatus,
      })
      .then(() => {
        //Save login credential

        AsyncStorage.setItem(
          'gym2022'.toString(),
          true.toString(),
          err => {
            if (err) {
              this.notifyMessage(err);
            }
          },
        ).catch(err => {
          this.notifyMessage(err);
        });

        // navigate to gym2020 screen
        this.props.navigation.navigate('Gym');
      });
  }

  notifyMessage(msg) {
    if (this._isMounted) {
      this.setState({
        errorMessage: msg,
        showDialog: true,
      });
    }
  }

  toggleCP = () => {
    if (this.state.cpStatus === false) {
      this.setState({ cpStatus: true })
    } else {
      this.setState({ cpStatus: false })
    }
  };

  render() {
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
              <Text style={styles.greeting}>{'GYM2022'}</Text>
              <TouchableOpacity
                style={styles.back}
                onPress={() => this.props.navigation.goBack()}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>


              <View style={styles.form}>
                <View>
                  <Text style={styles.inputTitle}>Name</Text>
                  <TextInput
                    style={styles.inputEditable}
                    editable={this.state.myInfoEditable}
                    autoCapitalize="none"
                    onChangeText={name => this.setState({ name })}
                    value={this.state.name}
                    autoFocus={true}
                  />
                </View>

                {/* <View style={styles.inputView}>
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
                  </View> */}

                {/* <View style={styles.inputView}>
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

                  {/* <View style={styles.inputView}>
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
                  </View> */}
                </>


                {/* <View style={styles.inputView}>
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
                  </View> */}
                <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'center' }}>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: 'center',
                      marginTop: 3,
                    }}>
                    <ToggleSwitch
                      isOn={this.state.cpStatus}
                      onColor="#2196f3"
                      offColor="grey"
                      label=""
                      labelStyle={{ color: 'black', fontWeight: '900' }}
                      size="0"
                      onToggle={isOn => this.toggleCP()}
                    />
                  </View>
                  <View
                    style={{
                      flex: 3,
                      alignItems: 'center',
                    }}>
                    <Text style={{
                      color: '#180D59',
                      fontSize: 10,
                    }}>
                      {translate('I wish to receive others volunteering event details also')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: '#2196f3', marginTop: 30 },
                  ]}
                  onPress={this.handleSignUp}>
                  <Text style={styles.text}>I am interested to join</Text>
                </TouchableOpacity>
              </View>
            </View>
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

export default connect(mapStateToProps, { setLoading })(GymRegisterScreen);