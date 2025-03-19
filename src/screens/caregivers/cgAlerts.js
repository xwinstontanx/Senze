import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  LayoutAnimation,
  SafeAreaView,
  ImageBackground,
  Linking,
  Modal,
  View,
  TouchableHighlight,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Spinner from 'react-native-loading-spinner-overlay';
import { mainStyles } from '../../styles/styles';
import NewAlerts from '../../components/NewAlert';
import AttendedAlert from '../../components/AttendedAlert';
import EmptyList from '../../components/EmptyList';
import auth from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';

import { connect } from 'react-redux';
import { setUserProfile, fetchAlerts } from '../../redux/actions';
import SimpleDialog from '../../components/SimpleDialog';
import { translate } from '../../../translations';

const Tab = createMaterialTopTabNavigator();
let dbRefNotification;
let unsubscribeNotification = null;

class cgAlerts extends Component {
  _isMounted = false;
  state = {
    isLoading: false,
    dataNew: [],
    dataAttended: [],

    modalVisible: false,
    comments: '',
    tempId: '',
    isAdditionalComments: false,
    elderlyUidList: [],

    errorMessage: null,
    showDialog: false,

    isFetching: false,
  };

  componentDidMount() {
    this._isMounted = true;
    dbRefNotification = firestore().collection('Notification');

    unsubscribeNotification = dbRefNotification.orderBy('CreatedAt', 'desc').onSnapshot(_ => { });

    this.getData();
  }

  getData() {
    this.setState({ isFetching: true })
    this.props.fetchAlerts(() => this.setState({ isFetching: false }));
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (unsubscribeNotification !== null) {
      unsubscribeNotification();
    }
  }

  call = phoneNumber => {
    RNImmediatePhoneCall.immediatePhoneCall(phoneNumber);
  };

  confirmUpdate = () => {
    if (unsubscribeNotification !== null) {
      unsubscribeNotification();
    }


    if (!this.state.isAdditionalComments) {
      dbRefNotification.doc(this.state.tempId).update({
        Attendee: this.props.profile.Name,
        AttendedAt: firestore.FieldValue.serverTimestamp(),
        NotifyStatus: 'close',
      });
    }

    dbRefNotification.doc(this.state.tempId).collection('Comments').add({
      Comments: this.state.comments,
      Attendee: this.props.profile.Name,
      AttendedAt: firestore.FieldValue.serverTimestamp(),
    });

    this.setState({
      modalVisible: false,
      tempId: '',
    });

    this.getData();
  };

  Attended = (id, SeniorUid) => {
    if (unsubscribeNotification !== null) {
      unsubscribeNotification();
    }

    dbRefNotification.doc(id).update({
      Attendee: this.props.profile.Name,
      AttendedAt: firestore.FieldValue.serverTimestamp(),
      NotifyStatus: 'close',
    });

    firestore().collection('VolunteerChats').doc(SeniorUid).collection('Chats')
      .add({
        "Content": translate('ATTENDED BY') + " " + this.props.profile.Name,
        "CreatedAt": firestore.FieldValue.serverTimestamp(),
        "IsSystem": true,
        "Name": this.props.profile.Name,
        "Uid": this.props.profile.Uid
      });

    this.getData();
  };

  onPressComments = id => {
    this.setState({
      modalVisible: true,
      tempId: id,
      isAdditionalComments: true
    });
  };

  viewMap = (lat, long) => {
    if (lat !== null && long !== null) {
      const latitude = lat;
      const longitude = long;
      var formatted_address = '';

      fetch(
        'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
        latitude +
        ',' +
        longitude +
        '&key=AIzaSyCiFq4GNcoTfbIt3TbVLL48WQEUX3MhpXM',
      )
        .then(response => {
          return response.json();
        })
        .then(json => {
          formatted_address = json.results[0].formatted_address;
          const url = Platform.select({
            ios:
              'maps:' + latitude + ',' + longitude + '?q=' + formatted_address,
            android:
              'geo:' + latitude + ',' + longitude + '?q=' + formatted_address,
          });

          Linking.canOpenURL(url).then(supported => {
            if (supported === true) {
              return Linking.openURL(url);
            } else {
              browser_url =
                'https://www.google.com/maps/@' +
                latitude +
                ',' +
                longitude +
                ',15z,?q=' +
                formatted_address;
              return Linking.openURL(browser_url);
            }
          });
        });
    } else {
      this.setState({
        errorMessage: translate('Invalid address was found'),
        showDialog: true,
      });
    }
  };

  ListEmpty = () => {
    return <EmptyList />;
  };

  //render List
  renderListNew = ({ item }) => {
    return (
      <NewAlerts
        item={item}
        slideCall={phoneNumber => {
          this.call(phoneNumber);
        }}
        slideAttended={(id, SeniorUid) => {
          this.Attended(id, SeniorUid);
        }}
        map={(lat, long) => {
          this.viewMap(lat, long);
        }}
      />
    );
  };

  renderList = ({ item }) => {
    return <AttendedAlert item={item} attendee={this.props.profile.Name} map={(lat, long) => {
      this.viewMap(lat, long);
    }} onPressComments={(id) => {
      this.onPressComments(id);
    }} />;
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <Spinner
          visible={this.state.isLoading}
          textContent={translate('LOADING') + '...'}
          textStyle={mainStyles.spinnerTextStyle}
        />
        <SafeAreaView style={styles.container}>
          <Text style={styles.topLeft} bold>
            {translate('ALERTS')}
          </Text>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                lazy: true,
                activeTintColor: '#2196f3',
                inactiveTintColor: '#2196f355',
                indicatorStyle: { backgroundColor: '#2196f3' },
              }}>
              <Tab.Screen name={translate("NEW")}>
                {() => (
                  <FlatList
                    onRefresh={() => this.getData()}
                    refreshing={this.state.isFetching}
                    data={this.props.newAlerts}
                    keyExtractor={item => item.id}
                    renderItem={this.renderListNew}
                    ListEmptyComponent={this.ListEmpty()}
                    // Performance settings
                    removeClippedSubviews={true} // Unmount components when outside of window
                    initialNumToRender={2} // Reduce initial render amount
                    maxToRenderPerBatch={1} // Reduce number in each render batch
                    updateCellsBatchingPeriod={200} // Increase time between renders
                    windowSize={4} // Reduce the window size
                  />
                )}
              </Tab.Screen>
              <Tab.Screen name={translate("ATTENDED")}>
                {() => (
                  <FlatList
                    onRefresh={() => this.getData()}
                    refreshing={this.state.isFetching}
                    data={this.props.attendedAlerts}
                    keyExtractor={item => item.id}
                    renderItem={this.renderList}
                    ListEmptyComponent={this.ListEmpty()}
                    // Performance settings
                    removeClippedSubviews={true} // Unmount components when outside of window
                    initialNumToRender={2} // Reduce initial render amount
                    maxToRenderPerBatch={1} // Reduce number in each render batch
                    updateCellsBatchingPeriod={200} // Increase time between renders
                    windowSize={4} // Reduce the window size
                  />
                )}
              </Tab.Screen>
            </Tab.Navigator>
          </NavigationContainer>

          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}>
            <View style={styles.modalView}>
              <ScrollView>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#180D59',
                    marginBottom: 10
                  }}>
                  {translate('COMMENTS')}
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#180D59',
                  }}>
                  {translate('Leave message here so other carers can be seen')}
                </Text>
                <TextInput
                  style={styles.input}
                  autoCapitalize="none"
                  multiline={true}
                  onChangeText={comments =>
                    this.setState({ comments: comments })
                  }
                  value={this.state.comments}
                />

                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Pressable
                      style={[styles.button, styles.buttonClose]}
                      onPress={() => {
                        this.confirmUpdate();
                        this.setState({ comments: '', modalVisible: false });
                      }}>
                      <Text style={styles.textStyle}>{translate('Submit')}</Text>
                    </Pressable>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Pressable
                      style={[styles.button, styles.buttonClose]}
                      onPress={() => {
                        this.setState({ comments: '', modalVisible: false });
                      }}>
                      <Text style={styles.textStyle}>{translate('CANCEL')}</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>

          <SimpleDialog
            modalVisible={this.state.showDialog}
            onModalClosed={() => this.setState({ showDialog: false })}
            errorMessage={this.state.errorMessage}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topLeft: {
    alignItems: 'flex-start',
    // position: 'absolute',
    top: 15,
    marginBottom: 30,
    left: 16,
    fontSize: 23,
    textAlign: 'left',
    color: '#ffffff',
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    marginTop: 70,
    marginBottom: 70,
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#180D59',
    borderWidth: 1,
    padding: 15,
    elevation: 5,
    flexDirection: 'column'
  },
  button: {
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    textAlignVertical: 'top',
    margin: 15,
    height: 150,
    width: 300,
    alignItems: 'stretch',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8A8F9E',
    fontSize: 16,
    color: '#161F3D',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
  newAlerts: state.main.newAlerts,
  attendedAlerts: state.main.attendedAlerts,
});

export default connect(mapStateToProps, { setUserProfile, fetchAlerts })(cgAlerts);
