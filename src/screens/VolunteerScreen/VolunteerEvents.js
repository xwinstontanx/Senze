import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  LayoutAnimation,
  SafeAreaView,
  ImageBackground,
  Linking,
  RefreshControl,
} from 'react-native';
import { Text } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UpcomingEvent from '../../components/UpcomingEvent';
import PastEvent from '../../components/PastEvent';
import EmptyListEvent from '../../components/EmptyListEvent';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { mainStyles } from '../../styles/styles';
import Spinner from 'react-native-loading-spinner-overlay';

import { connect } from 'react-redux';
import { setUserProfile, fetchVolunteerEvents } from '../../redux/actions';
import moment from 'moment';
import { translate } from '../../../translations';


const Tab = createMaterialTopTabNavigator();
let dbRefEventDetails;
let dbRefJointEvents;
let dbRefOrgDetail;
let unsubscribeEvent = null;

class VolunteerEvents extends Component {
  _isMounted = false;
  state = {
    OrgId: '',
    dataUpcomingEvents: [],
    dataPastEvents: [],
    isFetching: false,
  };

  componentDidMount() {
    this._isMounted = true;

    dbRefJointEvents = firestore().collection('JoinEvents');
    dbRefBBDetails = firestore().collection('BefriendBuddyDetails');

    // Collect all the events
    dbRefEventDetails = firestore().collection('EventDetails');

    firestore()
      .collection('Organization')
      .doc(this.props.profile.OrganizationId)
      .get()
      .then(Orgid => {
        if (Orgid.exists) {
          this.setState({ OrgId: Orgid.data().Uid });
          this.getData();
        }
      });

    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.getData();
      }
    );
  }

  getData = () => {
    this.setState({ isLoading: true });
    this.props.fetchVolunteerEvents().then(() => {
      this.setState({ isLoading: false });
    });
  };

  componentWillUnmount() {
    this._isMounted = false;
    if (unsubscribeEvent !== null) {
      unsubscribeEvent();
    }
    this.willFocusSubscription.remove();
  }

  Response = event => {
    this.setState({ isLoading: true });
    dbRefJointEvents.add({
      EventDetails: event.id,
      AttendedStatus: 'false',
      CreatedBy: this.props.profile.Uid,
      CreatedAt: firestore.FieldValue.serverTimestamp(),
      Address: this.props.profile.Address,
      OrganizationId: this.props.profile.OrganizationId,
      Postal: this.props.profile.PostalCode
    }).then(() => { this.getData() });
  };

  ResponseCancel = event => {
    this.setState({ isLoading: true });
    dbRefJointEvents
      .where('CreatedBy', '==', this.props.profile.Uid)
      .where('EventDetails', '==', event.id)
      .get()
      .then(jointEventSnapshot => {
        if (!jointEventSnapshot.empty) {
          jointEventSnapshot.forEach(jointEvent => {
            // dbRefJointEvents.doc(jointEvent.id).delete();
            dbRefJointEvents.doc(jointEvent.id).update({
              Delete: "true",
            })
          });
        }
      }).then(() => { this.getData() });
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
    return <EmptyListEvent />;
  };

  //render List
  renderListEvent = ({ item }) => {
    return (
      <UpcomingEvent
        item={item}
        navigation={this.props.navigation}
        slideAttend={id => {
          this.Response(id);
        }}
        slideCancel={id => {
          this.ResponseCancel(id);
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
      <PastEvent
        item={item}
        navigation={this.props.navigation}
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
            {translate('EVENTS')}
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
                    keyExtractor={item => item.id}
                    renderItem={this.renderListEvent}
                    ListEmptyComponent={this.ListEmpty()}
                    // Performance settings
                    removeClippedSubviews={true} // Unmount components when outside of window
                    initialNumToRender={2} // Reduce initial render amount
                    maxToRenderPerBatch={1} // Reduce number in each render batch
                    updateCellsBatchingPeriod={200} // Increase time between renders
                    windowSize={2} // Reduce the window size
                  />
                )}
              </Tab.Screen>
              <Tab.Screen name={translate("PAST")}>
                {() => (
                  <FlatList
                    onRefresh={() => this.getData()}
                    refreshing={this.state.isFetching}
                    data={this.props.pastActivities}
                    keyExtractor={item => item.id}
                    renderItem={this.renderList}
                    ListEmptyComponent={this.ListEmpty()}
                    // Performance settings
                    removeClippedSubviews={true} // Unmount components when outside of window
                    initialNumToRender={2} // Reduce initial render amount
                    maxToRenderPerBatch={1} // Reduce number in each render batch
                    updateCellsBatchingPeriod={200} // Increase time between renders
                    windowSize={2} // Reduce the window size
                  />
                )}
              </Tab.Screen>
            </Tab.Navigator>
          </NavigationContainer>
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
    fontSize: 30,
    textAlign: 'left',
    color: '#ffffff',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
  upcomingActivities: state.main.upcomingActivities,
  pastActivities: state.main.pastActivities,
});

export default connect(mapStateToProps, { setUserProfile, fetchVolunteerEvents })(VolunteerEvents);
