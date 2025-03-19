/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  Platform,
  Button,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
// import {DateTimePickerModal as DateTimePicker} from 'react-native-modal-datetime-picker';
import DatePicker from 'react-native-date-picker'

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';
import SeniorSettings from './SeniorSettings';

import { logout } from '../../redux/actions';
import styled from 'styled-components';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { translate } from '../../../translations';

import UserAvatar from 'react-native-user-avatar';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import moment from 'moment';

let dbRefOrgId;
let orgAdmin;
let dbRefUser;

class SeniorProfileSetting extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      email: auth().currentUser.email,
      name: this.props.profile.Name,
      dateofbirth: this.props.profile.DateOfBirth,
      isDatePickerVisible: false,
      setDatePickerVisibility: false,
      height: this.props.profile.Height,
      weight: this.props.profile.Weight,
      gender: this.props.profile.Gender,
      chronicillness: this.props.profile.ChronicIllness,
      phonenumber: this.props.profile.PhoneNumber,
      Sos:
        this.props.profile.SosNumber === '123'
          ? ''
          : this.props.profile.SosNumber,
      address: this.props.profile.Address,
      postalcode: this.props.profile.PostalCode,
      wearableid: this.props.profile.WearableId,

      genderOpen: false,
      genderValue: this.props.profile.Gender,
      genderItems: [
        {
          label: 'Male',
          value: 'MALE',
        },
        {
          label: 'Female',
          value: 'FEMALE',
        },
      ],

      raceOpen: false,
      raceValue: this.props.profile.Race,
      raceItems: [
        {
          label: 'Chinese',
          value: 'CHINESE',
        },
        {
          label: 'Malay',
          value: 'MALAY',
        },
        {
          label: 'Indian',
          value: 'INDIAN',
        },
        {
          label: 'Others',
          value: 'OTHERS',
        },
      ],

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

      errorMessage: null,
      showDialog: false,

      time: new Date(),

      FileName: '',
      LocalFileURI: '',
      FilePath: this.props.profile.ProfilePic === undefined ? '' : this.props.profile.ProfilePic
    };

    this.setOpenGender = this.setOpenGender.bind(this);
    this.setValueGender = this.setValueGender.bind(this);
    this.setItemsGender = this.setItemsGender.bind(this);

    this.setOpenRace = this.setOpenRace.bind(this);
    this.setValueRace = this.setValueRace.bind(this);
    this.setItemsRace = this.setItemsRace.bind(this);

    this.setOpenCountry = this.setOpenCountry.bind(this);
    this.setValueCountry = this.setValueCountry.bind(this);
    this.setItemsCountry = this.setItemsCountry.bind(this);

    this.setOpenOrg = this.setOpenOrg.bind(this);
    this.setValueOrg = this.setValueOrg.bind(this);
    this.setItemsOrg = this.setItemsOrg.bind(this);
  }

  componentDidMount() {
    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);

    if (this.props.profile.DateOfBirth != null) {
      var getyear = this.props.profile.DateOfBirth.split('-');
      var countAge = new Date().getFullYear() - getyear[2];
      dbRefUser
        .update({
          Age: countAge,
          UpdatedAt: firestore.FieldValue.serverTimestamp(),
        })
        .catch(error =>
          this.setState({
            errorMessage: error.message,
            showDialog: true,
          }),
        );
    }

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

  setOpenGender(genderOpen) {
    this.setState({
      genderOpen,
    });
  }

  setValueGender(callback) {
    this.setState(state => ({
      genderValue: callback(state.genderValue),
    }));
  }

  setItemsGender(callback) {
    this.setState(state => ({
      genderItems: callback(state.genderItems),
    }));
  }

  setOpenRace(raceOpen) {
    this.setState({
      raceOpen,
    });
  }

  setValueRace(callback) {
    this.setState(state => ({
      raceValue: callback(state.raceValue),
    }));
  }

  setItemsRace(callback) {
    this.setState(state => ({
      raceItems: callback(state.raceItems),
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

  successDelete = () => {
    this.setState({
      errorMessage: translate('Succesfully Deleted'),
      showDialog: true,
    });
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

  handleDateConfirm = date => {
    var setdob =
      new Date(date).getFullYear() +
      '-' +
      (new Date(date).getMonth() + 1) +
      '-' +
      new Date(date).getDate();

    this.setState({
      dateofbirth: setdob,
    }),
      this.hideDatePicker();
  };

  fieldValidation = () => {
    if (
      this.state.height !== undefined &&
      this.state.weight !== undefined &&
      this.state.chronicillness !== undefined &&
      this.state.Sos !== undefined
    ) {
      return true;
    }
    return false;
  };

  //Function to Handle update Profile
  handleUpdate = () => {
    // Update the ElderlyUnderCare
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
    //           .collection('ElderlyUnderCare')
    //           .where('Uid', '==', this.props.profile.Uid)
    //           .get()
    //           .then(volunteerSnapshot => {
    //             volunteerSnapshot.forEach(element => {
    //               dbRefUser
    //                 .doc(orgDetailSnapshot.id)
    //                 .collection('ElderlyUnderCare')
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
    //           .collection('ElderlyUnderCare')
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

    // Update user data
    dbRefUser
      .update({
        PhoneNumber: this.state.phonenumber,
        Address: this.state.address,
        PostalCode: this.state.postalcode,
        WearableId: this.state.wearableid,
        SosNumber: this.state.Sos,
        DateOfBirth: this.state.dateofbirth,
        Height: this.state.height,
        Weight: this.state.weight,
        Gender: this.state.genderValue,
        Country: this.state.countryValue,
        Race: this.state.raceValue,
        ChronicIllness: this.state.chronicillness,
        OrganizationId: this.state.orgValue,
        ProfilePic: this.state.FilePath,
        UpdatedAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        // Update User Data to redux
        let newProfile = this.props.profile;
        newProfile.PhoneNumber = this.state.phonenumber;
        newProfile.Address = this.state.address;
        newProfile.PostalCode = this.state.postalcode;
        newProfile.WearableId = this.state.wearableid;
        newProfile.SosNumber = this.state.Sos;
        newProfile.DateOfBirth = this.state.dateofbirth;
        newProfile.Height = this.state.height;
        newProfile.Weight = this.state.weight;
        newProfile.Gender = this.state.genderValue;
        newProfile.Country = this.state.countryValue;
        newProfile.Race = this.state.raceValue;
        newProfile.ChronicIllness = this.state.chronicillness;
        newProfile.OrganizationId = this.state.orgValue;
        newProfile.UpdatedAt = firestore.FieldValue.serverTimestamp();
        newProfile.ProfilePic = this.state.FilePath
        this.props.setUserProfile(newProfile);

        this.successUpdate();
      })
      .catch(error =>
        this.setState({
          errorMessage: error.message,
        }),
      );
  };

  confirmUpdate = () => {
    if (this.fieldValidation()) {
      Alert.alert(
        translate('Are you sure?'),
        translate('This will update your profile'),
        [
          {
            text: translate('CANCEL'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: translate('OK'), onPress: () => this.handleUpdate() },
        ],
      );
    } else {
      this.setState({
        errorMessage: translate('Kindly fill up all the fields'),
        showDialog: true,
      });
    }
  };



  handleDelete = () => {
    this.props.navigation.navigate('Login');
    firestore().collection("Users").doc(firebase.auth().currentUser.uid).delete()
    firebase.auth().currentUser.delete()
    this.successDelete();
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
    const {
      genderOpen,
      genderValue,
      genderItems,
      raceOpen,
      raceValue,
      raceItems,
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
            <Container>
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
                      this.props.navigation.navigate('seniorSettingScreen');
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

                {/* <TouchableOpacity
                  style={styles.back}
                  onPress={() => {
                    this.props.navigation.navigate('seniorSettingScreen');
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.greeting}>Profile</Text> */}
                <View style={styles.errorMessage}>
                  {this.state.errorMessage && (
                    <Text style={styles.errorMessage}>
                      {this.state.errorMessage}
                    </Text>
                  )}
                </View>

                <View style={[styles.centeredView, { flexDirection: 'column', alignSelf: 'center' }]}>
                  <TouchableOpacity
                    onPress={() => {
                      this.upload()
                    }}>
                    <UserAvatar size={140} name={this.props.profile.Name} src={this.state.FilePath} />
                    <Text style={{ color: '#2196f3', fontSize: 12 }}>{translate('Upload Profile Picture')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('EMAIL ADDRESS')}</Text>
                    <TextInput
                      style={styles.inputR}
                      autoCapitalize="none"
                      onChangeText={email => this.setState({ email })}
                      value={this.state.email}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('NAME')}</Text>
                    <TextInput
                      style={styles.inputR}
                      autoCapitalize="none"
                      onChangeText={name => this.setState({ name })}
                      value={this.state.name}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('DATE OF BIRTH')}:</Text>
                    <Text style={styles.inputR}>{this.state.dateofbirth}</Text>
                    <Button
                      title={translate("SET DATE OF BIRTH")}
                      style={{ backgroundColor: '#180D59' }}
                      onPress={this.showDatePicker}
                    />
                    {/* <DateTimePicker
                    isVisible={this.state.isDatePickerVisible}
                    mode="date"
                    onConfirm={this.handleDateConfirm}
                    onCancel={this.hideDatePicker}
                  /> */}

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
                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('HEIGHT (IN CM)')}</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      onChangeText={height => this.setState({ height })}
                      value={this.state.height}
                    />
                  </View>
                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('WEIGHT (IN KG)')}</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      onChangeText={weight => this.setState({ weight })}
                      value={this.state.weight}
                    />
                  </View>
                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('GENDER')}</Text>
                    <DropDownPicker
                      open={genderOpen}
                      value={genderValue}
                      items={genderItems}
                      setOpen={this.setOpenGender}
                      setValue={this.setValueGender}
                      setItems={this.setItemsGender}
                      listMode="SCROLLVIEW"
                      style={{
                        backgroundColor: '#FFFFFF',
                        fontSize: 16,
                      }}
                      dropDownDirection="TOP"
                      placeholder="Select Gender"
                    />
                  </View>
                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('RACE')}</Text>
                    <DropDownPicker
                      open={raceOpen}
                      value={raceValue}
                      items={raceItems}
                      setOpen={this.setOpenRace}
                      setValue={this.setValueRace}
                      setItems={this.setItemsRace}
                      listMode="SCROLLVIEW"
                      style={{
                        backgroundColor: '#FFFFFF',
                        fontSize: 16,
                      }}
                      dropDownDirection="TOP"
                      placeholder="Select Race"
                    />
                  </View>
                  <View style={styles.inputView}>
                    <Text style={styles.inputTitle}>{translate('CHRONIC ILLNESS')}</Text>
                    <TextInput
                      style={styles.input}
                      autoCapitalize="none"
                      onChangeText={chronicillness =>
                        this.setState({ chronicillness })
                      }
                      value={this.state.chronicillness}
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
                    <Text style={styles.inputTitle}>
                      {translate('NEXT OF KIN (NOK) NUMBER')}
                    </Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      maxLength={11}
                      onChangeText={Sos => this.setState({ Sos })}
                      value={this.state.Sos}
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
                  {/* <View style={styles.inputView}>
                  <Text style={styles.inputTitle}>Wearable ID</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    onChangeText={wearableid => this.setState({wearableid})}
                    value={this.state.wearableid}
                  />
                </View> */}
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
            </Container>


          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
            if (this.state.errorMessage === translate('Succesfully Updated')) {
              this.props.navigation.navigate('seniorSettingScreen');
            }
            // if (this.state.errorMessage === 'Succesfully Deleted') {
            //   this.props.navigation.navigate('loginScreen');
            // }
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
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    top: 15,
    left: 30,
    fontSize: 23,
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
    padding: 10,
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
    textAlign: 'center'
  },
  back: {
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

const Container = styled.ScrollView`
  flex: 1;
`;

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile, logout })(SeniorProfileSetting);


