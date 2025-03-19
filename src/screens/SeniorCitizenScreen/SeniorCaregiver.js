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
  Alert
} from 'react-native';
import { Form, Input, List, ListItem } from 'native-base';
import SimpleDialog from '../../components/SimpleDialog';
import styled from 'styled-components';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { FloatingAction } from 'react-native-floating-action';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { mainStyles } from '../../styles/styles';
import Spinner from 'react-native-loading-spinner-overlay';
import Swipeout from 'react-native-swipeout';
import { connect } from 'react-redux';
import { translate } from '../../../translations';

let dbRefCaregivers;
let dbRefVolunteers;

class SeniorCaregiver extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,

      showAddUser: false,
      caregiverList: [],
      volunteerList: [],
      emptyCaregiverList: true,
      emptyVolunteerList: true,

      caregiverNickname: null,
      caregiverPhoneNumber: null,
      loading: false
    };
  }

  componentDidMount() {
    this._isMounted = true;

    // Set the firebase reference
    dbRefCaregivers = firestore().collection('Users').doc(auth().currentUser.uid).collection('CaregiversList');
    dbRefVolunteers = firestore().collection('Users').doc(auth().currentUser.uid).collection('VolunteersList');

    this.getCaregiverList();
    this.getVolunteerList();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  submit = () => {
    if (this.state.caregiverNickname === null) {
      this.setState({
        errorMessage: translate('Please enter caregiver nickname'),
        showDialog: true,
      });
    }
    else if (this.state.caregiverPhoneNumber === null) {
      this.setState({
        errorMessage: translate('Please enter caregiver phone number'),
        showDialog: true,
      });
    } else {
      this.setState({
        loading: true,
      });

      // Add new caregiver
      dbRefCaregivers.add({
        CreatedAt: firestore.FieldValue.serverTimestamp(),
        NickName: this.state.caregiverNickname,
        PhoneNumber: this.state.caregiverPhoneNumber,
      })
        .finally(() => {
          this.setState({
            loading: false,
            showAddUser: false,
            caregiverNickname: null,
            caregiverPhoneNumber: null,
          });

          this.getCaregiverList();
        });
    }
  };

  getCaregiverList = () => {
    this.setState({
      caregiverList: [],
    });

    // Get list of elderly under this user
    dbRefCaregivers.get().then(caregiverListSnapshot => {
      if (!caregiverListSnapshot.empty) {
        caregiverListSnapshot.forEach(caregiver => {
          this.setState({
            caregiverList: this.state.caregiverList.concat({
              docID: caregiver.id,
              data: caregiver.data(),
            }),
            emptyCaregiverList: false,
          });
        });
      } else {
        this.setState({
          emptyCaregiverList: true
        });
      }
    });
  };

  getVolunteerList = () => {
    this.setState({
      volunteerList: [],
    });

    // Get list of elderly under this user
    dbRefVolunteers.get().then(volunteerListSnapshot => {
      if (!volunteerListSnapshot.empty) {
        volunteerListSnapshot.forEach(volunteer => {
          this.setState({
            volunteerList: this.state.volunteerList.concat({
              docID: volunteer.id,
              data: volunteer.data(),
            }),
            emptyVolunteerList: false,
          });
        });
      } else {
        this.setState({
          emptyVolunteerList: true
        });
      }
    });
  };

  openTwoButtonAlert = item => {
    Alert.alert(
      '',
      translate('Are you sure to remove this caregiver?'),
      [
        {
          text: translate('NO'),
          style: 'cancel',
        },
        {
          text: translate('YES'),
          onPress: () => {
            this.removed(item);
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  removed = item => {
    console.log(item.data.Uid)
    if (item.data.Uid !== undefined) {
      firestore()
        .collection('Users')
        .doc(item.data.Uid)
        .collection('ElderlyUnderCare')
        .where('Uid', '==', this.props.profile.Uid)
        .get()
        .then(docs => {
          docs.forEach(doc => {
            // Update senior caregiver list with FCM & UID
            firestore()
              .collection('Users')
              .doc(item.data.Uid)
              .collection('ElderlyUnderCare')
              .doc(doc.id)
              .delete();
          });
        });
    }
    dbRefCaregivers.doc(item.docID).delete();
    this.setState({
      errorMessage: translate('Caregiver has been removed'),
      showDialog: true,
    });
    this.getCaregiverList();
  };

  swipeBtns = item => [{
    text: 'Delete',
    backgroundColor: 'red',
    underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    onPress: () => {
      this.removed(item);
    }
  }];

  render() {
    const actions = [
      {
        text: translate('Add Caregiver'),
        textColor: '#180D59',
        color: '#ffffff',
        tintColor: '#180D59',
        icon: <FontAwesome5 name="users" size={25} color="#180D59" />,
        name: 'new_caregiver',
        position: 1,
      }
    ];

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
                  {translate('USERS LIST')}
                </Text>
              </View>
            </View>

            {this.state.showAddUser == true ? (
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
                        marginLeft: 35,
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#180D59',
                      }}>
                      {translate('Add Caregiver')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{ alignItems: 'flex-end' }}
                    onPress={() => {
                      this.setState({ showAddUser: false });
                    }}>
                    <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                  </TouchableOpacity>
                </View>

                <Input
                  autoFocus
                  style={{
                    margin: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    textAlign: 'center',
                  }}
                  placeholder={translate('Enter Caregiver Nickname')}
                  placeholderTextColor="#b6b6b4"
                  onChangeText={text => {
                    this.setState({ caregiverNickname: text });
                  }}
                  backgroundColor="#ffffff"
                />

                <Input
                  style={{
                    margin: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    textAlign: 'center',
                  }}
                  keyboardType="numeric"
                  maxLength={11}
                  placeholder={translate('Enter Caregiver Phone Number')}
                  placeholderTextColor="#b6b6b4"
                  onChangeText={text => {
                    this.setState({ caregiverPhoneNumber: text });
                  }}
                  backgroundColor="#ffffff"
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    this.submit()
                  }>
                  <Text style={styles.text}>{translate('Submit')}</Text>
                </TouchableOpacity>
              </Form>
            ) : null}

            <View style={styles.content}>
              <Text style={styles.title0}>
                {translate('CAREGIVER LIST')}
              </Text>

              {this.state.emptyCaregiverList == true &&
                this.state.showAddUser == false ? (
                <View style={[styles.EmptyContainer]}>
                  <Text
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      fontSize: 20,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#2196f3',
                    }}>
                    {translate('Add Caregiver')}
                  </Text>
                  <Text
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      textAlign: 'center',
                      color: '#2196f3',
                    }}>
                    {translate('Click the button below to add caregiver')}
                  </Text>
                </View>
              ) : null}

              <List>
                {this.state.caregiverList.map((item, index) => (

                  <Swipeout right={this.swipeBtns(item)}
                    autoClose={true}
                    backgroundColor='transparent'>
                    <ListItem
                      // Performance settings
                      removeClippedSubviews={true} // Unmount components when outside of window
                      initialNumToRender={2} // Reduce initial render amount
                      maxToRenderPerBatch={1} // Reduce number in each render batch
                      updateCellsBatchingPeriod={200} // Increase time between renders
                      windowSize={4} // Reduce the window size
                      key={item.docID}
                      thumbnail
                      onLongPress={() => this.openTwoButtonAlert(item)}
                      onPress={() => {
                      }}>
                      <DataContainer>

                        <DataInside>
                          <DataInfo>
                            <Text darkBlue small>
                              {item.data.NickName}{' '}
                            </Text>
                          </DataInfo>
                          <Text darkBlue large heavy>
                            {item.data.PhoneNumber}
                          </Text>
                        </DataInside>

                      </DataContainer>
                    </ListItem>
                  </ Swipeout>
                ))}
              </List>

              {this.state.emptyCaregiverList === false ? (
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    textAlign: 'center',
                    color: '#2196F3',
                  }}>
                  ** {translate('SWIPE TO REMOVE ANY OF THE CAREGIVER')} **
                </Text>
              ) : null}
            </View>


            <View style={styles.content}>
              <Text style={styles.title0}>
                {translate('VOLUNTEER LIST')}
              </Text>
              <List>
                {this.state.volunteerList.map((item, index) => (
                  <ListItem
                    // Performance settings
                    removeClippedSubviews={true} // Unmount components when outside of window
                    initialNumToRender={2} // Reduce initial render amount
                    maxToRenderPerBatch={1} // Reduce number in each render batch
                    updateCellsBatchingPeriod={200} // Increase time between renders
                    windowSize={4} // Reduce the window size
                    key={item.docID}
                    thumbnail
                    // onLongPress={() => this.openTwoButtonAlert(item)}
                    onPress={() => {
                    }}>
                    <DataContainer>

                      <DataInside>
                        <DataInfo>
                          <Text darkBlue small>
                            {item.data.NickName}{' '}
                          </Text>
                        </DataInfo>
                        <Text darkBlue large heavy>
                          {item.data.PhoneNumber}
                        </Text>
                      </DataInside>

                    </DataContainer>
                  </ListItem>
                ))}
              </List>
            </View>

          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
          }}
          errorMessage={this.state.errorMessage}
        />
        <FloatingAction
          color="#180D59"
          overlayColor="#180D5960"
          showBackground={true}
          actions={actions}
          onPressItem={name => {
            switch (name) {
              case 'new_caregiver':
                this.setState({ showAddUser: true });
                break;
            }
          }}
        />
        <Spinner
          color={'#2196f3'}
          overlayColor={'#ffffff99'}
          visible={this.state.loading}
          tintColor="#123456"
          textContent={translate('LOADING') + '...'}
          textStyle={mainStyles.spinnerTextStyle}
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
  back: {
    top: 15,
    left: 15,
    flexDirection: 'column'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 70,
  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#2196F3',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 10,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    color: '#FFF',
  },
  button: {
    marginHorizontal: 20,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  EmptyContainer: {
    backgroundColor: '#ffffffaa',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderRadius: 10,
    borderColor: '#2196f3',
    borderWidth: 1,
    margin: 35,
    padding: 10,
  },
  title0: {
    color: '#2196f3',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 21,
    // textDecorationLine: 'underline',
    alignItems: 'center',
    marginBottom: 10
  },
  content: {
    borderWidth: 1,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderColor: '#2196F3',
  },
});

const Container = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const DataContainer = styled.View`
  margin: 1%;
  padding: 1%;
  width: 94%;
  align-items: center;
  border-radius: 12px;
  border-width: 1px;
  border-color: #000000;
`;

const DataInside = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const DataImage = styled.Image`
  width: 40px;
  height: 40px;
  margin-right: 3%;
`;

const DataInfo = styled.View`
  flex: 1;
`;

const mapStateToProps = (state) => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(SeniorCaregiver);
