import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  Text,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

import SimpleDialog from '../../components/SimpleDialog';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import { logout } from '../../redux/actions';
import { translate } from '../../../translations';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import UserAvatar from 'react-native-user-avatar';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import moment from 'moment';

class cgProfile extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      name: '',
      address: '',
      postalcode: '',
      phonenumber: '',

      errorMessage: null,
      showDialog: false,

      countryOpen: false,
      countryValue: 'Select Country',
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

      FileName: '',
      LocalFileURI: '',
      FilePath: this.props.profile.ProfilePic === undefined ? '' : this.props.profile.ProfilePic
    };

    this.setOpenCountry = this.setOpenCountry.bind(this);
    this.setValueCountry = this.setValueCountry.bind(this);
    this.setItemsCountry = this.setItemsCountry.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    this.setState({
      email: auth().currentUser.email,
      name: this.props.profile.Name,
      address: this.props.profile.Address,
      postalcode: this.props.profile.PostalCode,
      phonenumber: this.props.profile.PhoneNumber,
      countryValue: this.props.profile.Country,
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
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

  successUpdate = () => {
    this.setState({
      errorMessage: translate('Succesfully Updated'),
      showDialog: true,
    });
  };

  handleUpdate = () => {
    this.setState({
      country: this.state.valueC,
    });

    let dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);

    dbRefUser
      .update({
        PhoneNumber: this.state.phonenumber,
        Address: this.state.address,
        PostalCode: this.state.postalcode,
        Country: this.state.countryValue,
        ProfilePic: this.state.FilePath,
        UpdatedAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        // Update User Data to redux
        let newProfile = this.props.profile;
        newProfile.PhoneNumber = this.state.phonenumber;
        newProfile.Address = this.state.address;
        newProfile.PostalCode = this.state.postalcode;
        newProfile.Country = this.state.countryValue;
        newProfile.UpdatedAt = firestore.FieldValue.serverTimestamp();
        newProfile.ProfilePic = this.state.FilePath
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
    Alert.alert(translate('Are you sure?'), translate('This will update your profile'), [
      {
        text: translate('CANCEL'),
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: translate('OK'), onPress: () => this.handleUpdate() },
    ]);
  };

  handleDelete = () => {
    this.props.navigation.navigate('Login');
    firestore().collection("Users").doc(firebase.auth().currentUser.uid).delete()
    firebase.auth().currentUser.delete()

  };

  confirmDelete = () => {
    Alert.alert(
      translate('Delete Profile'),
      translate('Are you sure you want to delete profile'),
      [
        {
          text: translate('CANCEL'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: translate('OK'), onPress: () => {
            // No action required for now (No deletion of the user)
            //this.handleDelete() 

            // Add to DisabledAccount collection
            firestore().collection('DisabledAccount').add({
              Uid: auth().currentUser.uid,
              CreatedAt: firestore.FieldValue.serverTimestamp(),
            }).then(() => {
              // Update FCM token to prevent receiving notification
              firestore().collection('Users').doc(auth().currentUser.uid)
                .update({
                  FcmToken: '',
                })
                .then(() => {
                  // Force sign out the user
                  auth()
                    .signOut()
                    .then(() => {
                      this.props.logout();
                      this.props.navigation.navigate('Login');
                    });
                });
            });
          }
        },
      ])
  };

  upload = () => {
    if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.CAMERA)
        .then((result) => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              console.log('This feature is not available (on this device / in this context)');
              break;
            case RESULTS.DENIED:
              request(PERMISSIONS.ANDROID.CAMERA).then((requestResult) => {
                console.log(requestResult)
                if (requestResult === RESULTS.GRANTED) {
                  this.camera();
                }
              })
              console.log('The permission has not been requested / is denied but requestable');
              break;
            case RESULTS.LIMITED:
              console.log('The permission is limited: some actions are possible');
              break;
            case RESULTS.GRANTED:
              this.camera();
              console.log('The permission is granted');
              break;
            case RESULTS.BLOCKED:
              console.log('The permission is denied and not requestable anymore');
              break;
          }
        }).catch((error) => {

        });
    }
    else if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.CAMERA)
        .then((result) => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              console.log('This feature is not available (on this device / in this context)');
              break;
            case RESULTS.DENIED:
              request(PERMISSIONS.IOS.CAMERA).then((requestResult) => {
                console.log(requestResult)
                if (requestResult === RESULTS.GRANTED) {
                  this.camera();
                }
              })
              console.log('The permission has not been requested / is denied but requestable');
              break;
            case RESULTS.LIMITED:
              console.log('The permission is limited: some actions are possible');
              break;
            case RESULTS.GRANTED:
              this.camera();
              console.log('The permission is granted');
              break;
            case RESULTS.BLOCKED:
              console.log('The permission is denied and not requestable anymore');
              break;
          }
        }).catch((error) => {

        });
    }
  }

  camera = () => {

    let options = {
      mediaType: 'photo'
    };

    launchCamera(options, async (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {

        let src = response.assets[0].uri;

        this.setState({
          LocalFileURI: src
        });

        console.log(src)

        if (src !== undefined) {
          const response = await fetch(src);
          const blob = await response.blob();

          const task = firebase
            .storage()
            .ref()
            .child(`ProfilePic/${this.props.profile.Uid}/${this.state.FileName}`)
            .put(blob);

          const taskCompleted = () => {
            task.snapshot
              .ref
              .getDownloadURL()
              .then((filePath) => {
                this.setState({ FilePath: filePath })

                console.log(filePath)
                dbRefCaseNotes = firestore()
                  .collection('Users')
                  .doc(this.props.profile.Uid)
                  .update({ ProfilePic: filePath })
                  .then(() => {
                    console.log("Done")
                  });
              })
          }

          const taskProgress = (snapshot) => {
            let uploadProgress = snapshot.bytesTransferred / snapshot.totalBytes;
          }

          const taskError = (error) => {
            console.log(error)
          }

          task.on(firebase.storage.TaskEvent.STATE_CHANGED, taskProgress, taskError, taskCompleted)
        }
      }
    });
  }

  render() {
    const { countryOpen, countryValue, countryItems } = this.state;

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
                  marginBottom: 20,
                }}>
                <TouchableOpacity
                  style={styles.back}
                  onPress={() => {
                    this.props.navigation.navigate('cgSettingScreen');
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.greeting}>
                  {translate('PROFILE')}
                </Text>
                <View style={styles.delete}>
                  <FontAwesome5
                    name="trash-alt"
                    size={26}
                    color="#ff0000"
                    onPress={() => {
                      this.confirmDelete()
                    }}
                  />
                </View>
              </View>

              <View style={[styles.centeredView, { flexDirection: 'column' }]}>
                <TouchableOpacity
                  onPress={() => {
                    this.upload()
                  }}>
                  <UserAvatar size={140} name={this.props.profile.Name} src={this.state.FilePath} />
                  <Text style={{ color: '#2196f3', fontSize: 12 }}>{translate('Upload Profile Picture')}</Text>
                </TouchableOpacity>
              </View>

              {/* <TouchableOpacity
                style={styles.back}
                onPress={() => {
                  this.props.navigation.navigate('cgSettingScreen');
                }}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>
              <Text style={styles.greeting}>Profile</Text> */}

              <View style={styles.form}>
                <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>{translate('EMAIL ADDRESS')}</Text>
                  <TextInput
                    style={styles.inputR}
                    onChangeText={email => this.setState({ email })}
                    value={this.state.email}
                    editable={false}
                  />
                </View>

                <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>{translate('NAME')}</Text>
                  <TextInput
                    style={styles.inputR}
                    onChangeText={name => this.setState({ name })}
                    value={this.state.name}
                    editable={false}
                  />
                </View>
                <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>{translate('PHONE NUMBER')}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={11}
                    onChangeText={phonenumber => this.setState({ phonenumber })}
                    value={this.state.phonenumber}
                  />
                </View>
                <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>{translate('COUNTRY')}</Text>
                  <DropDownPicker
                    open={countryOpen}
                    value={countryValue}
                    items={countryItems}
                    setOpen={this.setOpenCountry}
                    setValue={this.setValueCountry}
                    setItems={this.setItemsCountry}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      fontSize: 16,
                    }}
                    dropDownDirection="TOP"
                    placeholder={this.state.countryValue}
                  />
                </View>
                <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>{translate('ADDRESS')}</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    onChangeText={address => this.setState({ address })}
                    value={this.state.address}
                  />
                </View>

                <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>{translate('POSTAL CODE')}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={6}
                    onChangeText={postalcode => this.setState({ postalcode })}
                    value={this.state.postalcode}
                  />
                </View>
              </View>
            </View>

            <View style={styles.ButtonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={this.confirmUpdate}>
                <Text style={styles.text}>{translate('UPDATE PROFILE')}</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={styles.ButtonContainer}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={this.confirmDelete}>
                <Text style={styles.text}>Delete Profile</Text>
              </TouchableOpacity>
            </View> */}
          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
            if (this.state.errorMessage === translate('Succesfully Updated')) {
              this.props.navigation.navigate('cgSettingScreen');
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
  form: {
    // marginBottom: 16,
    // marginHorizontal: 30,
    marginHorizontal: '8%',
    margin: '4%',
  },

  inputView: {
    marginTop: 32,
  },
  inputTitle: {
    color: '#2196f3',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  inputR: {
    fontSize: 16,
    color: '#161F3D',
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
    fontSize: 16,
    color: '#161F3D',
  },
  button: {
    marginHorizontal: 20,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: 150,
  },
  deleteButton: {
    marginHorizontal: 20,
    backgroundColor: '#d11a2a',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    width: 150,
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  back: {
    // position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'column'
  },
  delete: {
    top: 15,
    right: 15,
    flexDirection: 'column'
  },
  ButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile, logout })(cgProfile);
