import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  ImageBackground,
  Linking,
  Modal,
  View,
  Image,
  Pressable,
  TouchableOpacity
} from 'react-native';
import { Text } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UpcomingActivity from '../../components/UpcomingActivity';
import PastActivity from '../../components/PastActivity';
import EmptyListActivity from '../../components/EmptyListActivity';

import { mainStyles } from '../../styles/styles';
import Spinner from 'react-native-loading-spinner-overlay';

import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setUserProfile, fetchActivities } from '../../redux/actions';
import { translate } from '../../../translations';
import UserAvatar from 'react-native-user-avatar';

const Tab = createMaterialTopTabNavigator();
let dbRefJointActivities;
let unsubscribeActivity = null;

class SeniorActivities extends Component {
  _isMounted = false;
  state = {
    isFetching: false,
    isLoading: false,

    showVolProfile: false,
    VolName: '',
    VolProfilePic: '',
    VolOrgId: ''
  };

  componentDidMount() {
    this._isMounted = true;

    dbRefJointActivities = firestore().collection('JoinActivities');
    dbRefBBDetails = firestore().collection('BefriendBuddyDetails');

    this.getData();
  }

  getData = () => {
    this.props.fetchActivities().then(() => {
      this.setState({
        isLoading: false,
      });
    });
  };

  componentWillUnmount() {
    this._isMounted = false;
    if (unsubscribeActivity !== null) {
      unsubscribeActivity();
    }
  }

  Response = activity => {
    this.setState({ isLoading: true });
    dbRefJointActivities.add({
      ActivityDetails: activity.id,
      SignUpStatus: 'true',
      AttendedStatus: 'false',
      CreatedBy: this.props.profile.Uid,
      CreatedAt: firestore.FieldValue.serverTimestamp(),
      Address: this.props.profile.Address,
      Duration: activity.data.Duration,
      OrganizationId: this.props.profile.OrganizationId,
      Postal: this.props.profile.PostalCode
    }).then(() => this.getData());
  };

  ResponseCancel = activity => {
    this.setState({ isLoading: true });
    dbRefJointActivities
      .where('CreatedBy', '==', this.props.profile.Uid)
      .where('ActivityDetails', '==', activity.id)
      .get()
      .then(jointActivitySnapshot => {
        if (!jointActivitySnapshot.empty) {
          jointActivitySnapshot.forEach(jointActivity => {
            // dbRefJointActivities.doc(jointActivity.id).delete();
            dbRefJointActivities.doc(jointActivity.id).update({
              Delete: "true",
            })
          });
        }
        this.getData();
      });
  };

  UpdateDateTime = (data, newDateTime) => {
    let date = newDateTime.getFullYear() + "-" + (newDateTime.getMonth() + 1) + "-" + newDateTime.getDate()
    this.setState({ isLoading: true });
    dbRefBBDetails
      .doc(data.id)
      .update({
        Date: date,
        Time: newDateTime.getHours() + ":" + newDateTime.getMinutes(),
      })
      .then(() => { this.getData() });
  };

  ResponseVolunteerProfile = activity => {
    firestore()
      .collection('Organization')
      .doc(activity.activityResponse.VolunteerDetails.OrganizationId)
      .get()
      .then(Orgid => {
        if (Orgid.exists) {
          this.setState({
            VolName: activity.activityResponse.VolunteerDetails.Name,
            VolProfilePic: activity.activityResponse.VolunteerDetails.ProfilePic,
            VolOrgId: Orgid.data().OrganizationName,
            showVolProfile: true
          });
        }
      });
  };

  viewMap = address => {
    var formatted_address = address;

    fetch(
      'https://www.google.com/maps/search/' + address,
      // '&key=AIzaSyCiFq4GNcoTfbIt3TbVLL48WQEUX3MhpXM',
    )
      .then(response => {
        // return response.json();
      })
      .then(json => {
        // formatted_address = json.results[0].formatted_address;
        const url = Platform.select({
          ios: 'maps:' + '?q=' + formatted_address,
          android: 'geo:' + '?q=' + formatted_address,
        });

        Linking.canOpenURL(url).then(supported => {
          if (supported === true) {
            return Linking.openURL(url);
          } else {
            browser_url =
              'https://www.google.com/maps/search/' + formatted_address;
            return Linking.openURL(browser_url);
          }
        });
      });
  };

  ListEmpty = () => {
    return <EmptyListActivity />;
  };

  //render List
  renderListActivity = ({ item }) => {
    return (
      <UpcomingActivity
        item={item}
        slideAttend={id => {
          this.Response(id);
        }}
        slideCancel={id => {
          this.ResponseCancel(id);
        }}
        slideVolunteerProfile={id => {
          this.ResponseVolunteerProfile(id);
        }}
        map={address => {
          this.viewMap(address);
        }}
        UpdateDateTime={(data, newDateTime) => {
          this.UpdateDateTime(data, newDateTime)
        }}
      />
    );
  };

  renderList = ({ item }) => {
    return (
      <PastActivity
        item={item}
        map={address => {
          this.viewMap(address);
        }}
      />
    );
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.topLeft} bold>
            {translate('ACTIVITIES')}
          </Text>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                activeTintColor: '#2196f3',
                inactiveTintColor: '#2196f355',
                indicatorStyle: { backgroundColor: '#2196f3' },
              }}>
              <Tab.Screen name={translate("UPCOMING")}>
                {() => (
                  <FlatList
                    onRefresh={() => this.getData()}
                    refreshing={this.state.isFetching}
                    data={this.props.upcomingActivities}
                    keyExtractor={(item, index) => index}
                    renderItem={this.renderListActivity}
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
              {/* <Tab.Screen name={translate("PAST")}>
                {() => (
                  <FlatList
                    onRefresh={() => this.getData()}
                    refreshing={this.state.isFetching}
                    data={this.props.pastActivities}
                    keyExtractor={(item, index) => index}
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
              </Tab.Screen> */}
            </Tab.Navigator>
          </NavigationContainer>
          {this.state.showVolProfile &&
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.showVolProfile}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                this.setState({ showVolProfile: false });
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <UserAvatar size={250} name={this.state.VolName} src={this.state.VolProfilePic} />

                  <View style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    marginBottom: 40,
                  }}>
                    <Text style={styles.name}>{this.state.VolName}</Text>
                    <Text style={styles.org}>{this.state.VolOrgId}</Text>
                  </View>

                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => {
                      this.setState({ showVolProfile: false });
                    }}>
                    <Text style={styles.textStyle}>{translate('Close')} </Text>
                  </Pressable>

                </View>
              </View>
            </Modal>}
          {this.state.isLoading &&
            <Spinner
              color={'#2196f3'}
              overlayColor={'#ffffff99'}
              visible={true}
              tintColor="#123456"
              textContent={translate('LOADING') + '...'}
              textStyle={mainStyles.spinnerTextStyle} />}
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
  card: {
    margin: 10,
    marginTop: 20,
    borderWidth: 3,
    borderRadius: 20,
    borderColor: '#A9A9A9',
    backgroundColor: '#DCDCDC'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
  },
  modalView: {
    height: 500,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderColor: '#180D59',
    borderWidth: 2,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    elevation: 2,
    color: '#180D59',
    textAlign: 'center',
    borderColor: '#180D59',
    borderWidth: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  name: {
    top: 15,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
    color: '#180D59',
  },
  org: {
    top: 15,
    marginTop: 10,
    fontSize: 22,
    textAlign: 'center',
    color: '#180D59',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
  upcomingActivities: state.main.upcomingActivities,
  pastActivities: state.main.pastActivities,
});

export default connect(mapStateToProps, { setUserProfile, fetchActivities })(SeniorActivities);
