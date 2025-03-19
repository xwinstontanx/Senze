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

import ToggleSwitch from 'toggle-switch-react-native';
import SimpleDialog from '../../components/SimpleDialog';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import { logout } from '../../redux/actions';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { translate } from '../../../translations';

import UserAvatar from 'react-native-user-avatar';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import moment from 'moment';

let dbRefOrgId;
let orgAdmin;
let dbRefUser;

class GymProfile extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      email: auth().currentUser.email,
      name: this.props.profile.Name,
      phonenumber: this.props.profile.PhoneNumber,
      address: this.props.profile.Address,
      postalcode: this.props.profile.PostalCode,
      cpStatus: this.props.profile.CommonPool,

      errorMessage: null,
      showDialog: false,

      countryOpen: false,
      countryValue: this.props.profile.Country,
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

      orgOpen: false,
      orgValue: 'None',
      orgItems: [
        {
          label: 'None',
          value: 'none',
        },
      ],

      FileName: '',
      LocalFileURI: '',
      FilePath: this.props.profile.ProfilePic === undefined ? '' : this.props.profile.ProfilePic
    };

    this.setOpenOrg = this.setOpenOrg.bind(this);
    this.setValueOrg = this.setValueOrg.bind(this);
    this.setItemsOrg = this.setItemsOrg.bind(this);

    this.setOpenCountry = this.setOpenCountry.bind(this);
    this.setValueCountry = this.setValueCountry.bind(this);
    this.setItemsCountry = this.setItemsCountry.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);

    dbRefOrgId = firestore().collection('Organization');

    dbRefOrgId.get().then(orgSnapshot => {
      // Get organization list
      orgSnapshot.forEach(org => {
        this.state.orgItems.push({
          label: org.data().OrganizationName,
          value: org.id,
        });
      });

      // Update the orgValue
      this.setState({
        orgValue: this.props.profile.OrganizationId,
      });
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
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

  toggleCP = () => {
    if (this.state.cpStatus === false) {
      this.setState({
        cpStatus: true,
        errorMessage: translate('I AM IN THE COMMON POOL OF VOLUNTEERS'),
        showDialog: true,
      });

      dbRefUser
        .update({
          CommonPool: true,
        })
        .then(() => {
          // Update User Data to redux
          let newProfile = this.props.profile;
          newProfile.CommonPool = this.state.cpStatus;
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
        cpStatus: false,
        errorMessage: translate('I am not in the common pool of volunteers'),
        showDialog: true,
      });

      dbRefUser
        .update({
          CommonPool: false,
        })
        .then(() => {
          // Update User Data to redux
          let newProfile = this.props.profile;
          newProfile.CommonPool = this.state.cpStatus;
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

  //Function to Handle update Profile
  handleUpdate = () => {
    // Update the VolunteerUnderCare
    // if (this.state.orgValue !== this.props.profile.OrganizationId) {
    //   orgAdmin = firestore().collection('Users').where('Role', '==', '4');

    //   // Remove user from the last organization
    //   orgAdmin
    //     .where('OrganizationId', '==', this.props.profile.OrganizationId)
    //     .get()
    //     .then(orgSnapshot => {
    //       orgSnapshot.forEach(orgDetailSnapshot => {
    //         dbRefUser = firestore().collection('Users');

    //         dbRefUser
    //           .doc(orgDetailSnapshot.id)
    //           .collection('VolunteerUnderCare')
    //           .where('Uid', '==', this.props.profile.Uid)
    //           .get()
    //           .then(gymSnapshot => {
    //             gymSnapshot.forEach(element => {
    //               dbRefUser
    //                 .doc(orgDetailSnapshot.id)
    //                 .collection('VolunteerUnderCare')
    //                 .doc(element.id)
    //                 .delete();
    //             });
    //           })
    //           .catch(error =>
    //             this.setState({
    //               errorMessage: error.message,
    //               showDialog: true,
    //             }),
    //           );
    //       });
    //     })
    //     .catch(error =>
    //       this.setState({
    //         errorMessage: error.message,
    //         showDialog: true,
    //       }),
    //     );

    //   // Add user from the last organization
    //   orgAdmin
    //     .where('OrganizationId', '==', this.state.orgValue)
    //     .get()
    //     .then(orgSnapshot => {
    //       orgSnapshot.forEach(orgDetailSnapshot => {
    //         dbRefUser = firestore().collection('Users');

    //         dbRefUser
    //           .doc(orgDetailSnapshot.id)
    //           .collection('VolunteerUnderCare')
    //           .add({
    //             Uid: auth().currentUser.uid,
    //             CreatedAt: firestore.FieldValue.serverTimestamp(),
    //           });
    //       });
    //     })
    //     .catch(error =>
    //       this.setState({
    //         errorMessage: error.message,
    //         showDialog: true,
    //       }),
    //     );
    // }

    // Update User Data to firebase
    dbRefUser = firestore().collection('Users');

    dbRefUser
      .doc(this.props.profile.Uid)
      .update({
        PhoneNumber: this.state.phonenumber,
        Address: this.state.address,
        PostalCode: this.state.postalcode,
        OrganizationId: this.state.orgValue,
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
        newProfile.OrganizationId = this.state.orgValue;
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
              request(PERMISSIONS.IOS.CAMERA).then((requestResult) => {
                console.log(requestResult)
                if (requestResult === RESULTS.GRANTED) {
                  this.camera();
                }
              })
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
    const {
      countryOpen,
      countryValue,
      countryItems,
      orgOpen,
      orgValue,
      orgItems,
    } = this.state;

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
                    this.props.navigation.navigate('gymsettings');
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
                  this.props.navigation.navigate('gymsettings');
                }}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>
              <Text style={styles.greeting}>Profile</Text> */}
              <View style={styles.form}>
                <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>{translate('EMAIL ADDRESS').toLocaleLowerCase()}</Text>
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
                  />
                </View>
                <View style={{ flexDirection: 'row', marginTop: 30 }}>
                  <View
                    style={{
                      flex: 3,
                    }}>
                    <Text style={styles.inputTitle}>
                      {translate('I AM IN THE COMMON POOL OF VOLUNTEERS')}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: 'center',
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
              this.props.navigation.navigate('gymsettings');
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
  inputView: {
    marginTop: 32,
  },
  inputTitle: {
    color: '#180D59',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
    fontSize: 15,
    color: '#161F3D',
  },
  inputR: {
    fontSize: 16,
    padding: 10,
    color: '#161F3D',
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
    top: 15,
    left: 15,
  },
  delete: {
    top: 15,
    right: 15,
    flexDirection: 'column'
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

export default connect(mapStateToProps, { setUserProfile, logout })(GymProfile);
