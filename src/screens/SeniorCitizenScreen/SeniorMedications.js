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

import MedicationReminder from '../../components/MedicationReminder';
import EmptyListMedication from '../../components/EmptyListMedication';
import { translate } from '../../../translations';


class SeniorMedications extends Component {
  _isMounted = false;
  state = {
    medicationData: [],
    isFetching: false,
    isLoading: false,
  };

  componentDidMount() {
    this._isMounted = true;
    this.getData();
  }

  getData = () => {
    let res = []

    this.setState({ isFetching: true });

    firestore()
      .collection('Medication')
      .where('CreatedBy', '==', auth().currentUser.uid)
      .get()
      .then(snapshot => {

        if (!snapshot.empty) {
          medications = snapshot.docs;
          medications.forEach(medication => {
            data = medication.data();
            res.push({
              id: medication.id,
              title: data.MedicineName,
              dosage: `${data.Dosage} ${data.Unit}`,
              Reminder1: data.Reminder1,
              Reminder2: data.Reminder2 === undefined ? "" : data.Reminder2,
              Reminder3: data.Reminder3 === undefined ? "" : data.Reminder3,
              afterMeal: data.Meal,
              numberOfTime: data.NumberOfTime,
            });
          })
        }

        this.setState({
          isFetching: false,
          medicationData: res
        });
      })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  ListEmpty = () => {
    return <EmptyListMedication />;
  };

  //render List
  renderListActivity = ({ item }) => {

    return (
      <Swipeout right={this.swipeBtns(item)}
        autoClose={true}
        backgroundColor='transparent'>
        <MedicationReminder
          item={item}
          navigation={this.props.navigation}
          refreshList={this.getData}
        />
      </Swipeout>
    );
  };

  swipeBtns = item => [{
    text: 'Edit',
    backgroundColor: 'grey',
    underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    onPress: () => {
      this.edit(item);
    }
  }, {
    text: 'Delete',
    backgroundColor: 'red',
    underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    onPress: () => {
      this.delete(item);
    }
  }];

  delete(item) {
    Alert.alert('', translate('Are you sure you want to remove this medication reminders?'), [
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
          firestore().collection('Medication')
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
    this.props.navigation.navigate('seniorAddMedication', { refreshList: this.getData, id: item.id, senior: this.state.senior })
  }

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.topLeft} bold>
            {translate('MEDICATIONS')}
          </Text>
          <FlatList
            onRefresh={() => this.getData()}
            refreshing={this.state.isFetching}
            data={this.state.medicationData}
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
          onPressItem={() => this.props.navigation.navigate('seniorAddMedication', { refreshList: this.getData })}
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
  topLeft: {
    alignItems: 'flex-start',
    top: 15,
    marginBottom: 30,
    left: 16,
    fontSize: 23,
    textAlign: 'left',
    color: '#ffffff',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(SeniorMedications);
