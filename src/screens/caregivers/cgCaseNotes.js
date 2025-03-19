import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  ImageBackground,
  Alert,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { Text } from 'native-base';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FloatingAction } from 'react-native-floating-action';
import { connect } from 'react-redux';

import { mainStyles } from '../../styles/styles';
import Spinner from 'react-native-loading-spinner-overlay';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Swipeout from 'react-native-swipeout';

import CaseNoteCard from '../../components/CaseNoteCard';
import EmptyCaseNotesHistory from '../../components/EmptyCaseNotesHistory';
import { translate } from '../../../translations';

let dbRefCaseNotes;

class cgCaseNotes extends Component {
  _isMounted = false;
  state = {
    senior: this.props.navigation.state.params.senior,
    caseNotesData: [],
    isFetching: false,
    isLoading: false,
  };

  componentDidMount() {
    this._isMounted = true;
    dbRefCaseNotes = firestore().collection('Users').doc(this.state.senior.data.Uid).collection('CaseNotesHistory');
    this.getData();
  }

  getData = () => {
    let res = []

    this.setState({ isFetching: true });
    dbRefCaseNotes
      .get()
      .then(snapshot => {

        if (!snapshot.empty) {
          let caseNotes = snapshot.docs;
          caseNotes.forEach(caseNote => {
            data = caseNote.data();
            
            // Serialize the array into string
            let activities = ""
            if (data['Activity'] !== undefined) {
              data['Activity'].forEach((act) => {
                if (activities === "") {
                  activities = act
                }
                else {
                  activities = activities + ", " + act
                }
              })
            }


            if (data.Remark === '') {
              data.Remark = "----"
            }

            res.push({
              id: caseNote.id,
              CreatedAt: data.createdAt,
              FilePath: data.FilePath,
              LastUpdated: data.LastUpdated,
              VisitBy: data.VisitBy,
              Type: data.Type,
              TimeIn: data.TimeIn,
              TimeOut: data.TimeOut,
              Activity: activities,
              OtherActivity: data.OtherActivity,
              HeartRate: data.HeartRate,
              SpO2: data.SpO2,
              Temperature: data.Temperature,
              BloodPressure: data.BloodPressure,
              BloodGlucose: data.BloodGlucose,
              TimeIn: data.TimeIn,
              TimeOut: data.TimeOut,
              Remark: data.Remark,
              FilePath: data.FilePath,
              Duration: data.Duration,
              Followup: data.Followup,
              Remark: data.Remark
            });
          })
        }

        this.setState({
          isFetching: false,
          caseNotesData: res
        });
      })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  ListEmpty = () => {
    return <EmptyCaseNotesHistory />;
  };

  //render List
  renderListActivity = ({ item }) => {

    return (
      <Swipeout right={this.swipeBtns(item)}
        autoClose={true}
        backgroundColor='transparent'>
        <CaseNoteCard
          item={item}
          navigation={this.props.navigation}
          refreshList={this.getData}
        />
      </Swipeout>
    );
  };

  swipeBtns = item => [{
    text: translate('Edit'),
    backgroundColor: 'grey',
    underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    onPress: () => {
      this.edit(item);
    }
  }, {
    text: translate('Delete'),
    backgroundColor: 'red',
    underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    onPress: () => {
      this.delete(item);
    }
  }];

  delete(item) {
    Alert.alert('', translate('ARE YOU SURE YOU WANT TO REMOVE THIS CASE NOTE?'), [
      {
        text: translate('CANCEL'),
        onPress: () => {
          console.log('Cancel Pressed');
        },
        style: 'cancel',
      },
      {
        text: translate('OK'),
        onPress: () => {
          this.setState({ isLoading: true });
          dbRefCaseNotes
            .doc(item.id)
            .delete()
            .then(() => {
              this.getData();
              this.setState({ isLoading: false });
            })
        },
      },
    ]);
  }

  edit(item) {
    this.props.navigation.navigate('cgaddcasenote',
      {
        refreshList: this.getData,
        id: item.id,
        senior: this.state.senior,
        time: firestore.FieldValue.serverTimestamp()
      })
  }

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <TouchableOpacity
              style={styles.back}
              onPress={() => {
                this.props.navigation.navigate('cgseniordetails');
              }}>
              <Icon name="arrow-circle-left" size={40} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.greeting}>
              {translate('CASE NOTES HISTORY')}
            </Text>
          </View>
          <FlatList
            onRefresh={() => this.getData()}
            refreshing={this.state.isFetching}
            data={this.state.caseNotesData}
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
        </SafeAreaView>
        <FloatingAction
          color="#180D59"
          actions={actions}
          overrideWithAction={true}
          onPressItem={() => this.props.navigation.navigate('cgaddcasenote',
            {
              refreshList: this.getData,
              senior: this.state.senior,
              time: firestore.FieldValue.serverTimestamp()
            })}
        />

        {this.state.isLoading &&
          <Spinner
            color={'#2196f3'}
            overlayColor={'#ffffff99'}
            visible={true}
            tintColor="#123456"
            textContent={translate('LOADING') + '...'}
            textStyle={mainStyles.spinnerTextStyle} />}
      </ImageBackground>
    );
  }
}

const actions = [
  {
    text: 'Add Reminder',
    icon: <FontAwesome5 name="plus" size={25} color="#ffffff" />,
    name: 'add_reminder',
    position: 1,
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  greeting: {
    top: 15,
    left: 26,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#ffffff',
    flex: 1,
    flexWrap: 'wrap'
  },
  back: {
    top: 15,
    left: 15,
  },
  topLeft: {
    alignItems: 'flex-start',
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
});

export default connect(mapStateToProps)(cgCaseNotes);
