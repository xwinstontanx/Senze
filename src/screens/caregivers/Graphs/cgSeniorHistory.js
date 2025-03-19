/* eslint-disable no-undef */
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Schema from './Schema/DataSchema.json';
import FusionCharts from 'react-native-fusioncharts';

import Spo2 from './cgSeniorSpo2';
import Temperature from './cgSeniorTemperature';
import CheckInHistory from './cgSeniorCheckIn';

import firestore from '@react-native-firebase/firestore';

const Tab = createMaterialTopTabNavigator();

export default class cgSeniorHistory extends Component {
  _isMounted = false;
  heartRate = [];

  constructor(props) {
    super(props);

    this.state = {
      senior: this.props.navigation.state.params.senior,

      // type: 'timeseries',
      // width: '100%',
      // height: '100%',
      // dataFormat: 'json',
      // dataSource: {
      //   data: null,
      //   caption: {
      //     text: '',
      //   },
      //   subcaption: {
      //     // text: '60 - 100 bpm',
      //   },
      //   yAxis: [
      //     {
      //       plot: {
      //         value: 'HealthData',
      //       },
      //       title: 'Heart Rate',
      //     },
      //   ],
      //   xAxis: {
      //     plot: 'Time',
      //   },
      // },
      // schemaJson: null,
      // dataJson: null,
      // HealthData: ' ',

      // index: 0,
      // routes: [
      //   {key: 'first', title: 'First'},
      //   {key: 'second', title: 'Second'},
      // ],
    };

    // this.libraryPath = Platform.select({
    //   // Specify fusioncharts.html file location
    //   ios: require('../../../../assets/fusioncharts.html'),
    //   android: {uri: 'file:///android_asset/fusioncharts.html'},
    // });
  }

  componentDidMount() {
    this._isMounted = true;
    this.getHeartRate();
  }

  componentWillUnmount() {
    this.is_Mounted = false;
  }

  // getHeartRate = () => {
  //   let dbRef = firestore()
  //     .collection('Users')
  //     .doc(this.state.senior.data.Uid)
  //     .collection('SeniorData');

  //   dbRef
  //     .orderBy('CreatedAt', 'desc')
  //     .get()
  //     .then(queryData => {
  //       queryData.forEach(heartData => {
  //         if (parseInt(heartData.data().HeartRate) > 0) {
  //           const HealthData = parseFloat(heartData.data().HeartRate);
  //           const Time = heartData
  //             .data()
  //             .CreatedAt.toDate()
  //             .toISOString()
  //             .slice(0, 10);
  //           this.heartRate.push({HealthData, Time});
  //         }
  //       });
  //       this.fetchDataAndSchema();
  //     });
  // };

  // fetchDataAndSchema() {
  //   this.setState({
  //     dataJson: this.heartRate,
  //     schemaJson: Schema,
  //   });
  // }

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../../assets/bg.png')}>
        <SafeAreaView style={styles.container}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => {
              this.props.navigation.navigate('cgseniordetails');
            }}>
            <Icon name="arrow-circle-left" size={40} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.greeting}>
            {this.state.senior.data.Name}'s History
          </Text>

          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                tabBarLabelStyle: {
                  fontSize: 12,
                },
                lazy: true,
                activeTintColor: '#2196f3',
                inactiveTintColor: '#2196f355',
                style: {
                  backgroundColor: '#ffffff',
                },
                indicatorStyle: { backgroundColor: '#2196f3' },
              }}>
              <Tab.Screen name="Heart Rate">
                {() => (
                  <View style={styles.container}>
                    <View style={styles.chartContainer}>
                      <FusionCharts
                        dataJson={this.state.dataJson}
                        schemaJson={this.state.schemaJson}
                        type={this.state.type}
                        width={this.state.width}
                        height={this.state.height}
                        dataFormat={this.state.dataFormat}
                        dataSource={this.state.dataSource}
                        libraryPath={this.libraryPath}
                      />
                    </View>
                  </View>
                )}
              </Tab.Screen>
              <Tab.Screen name="SpO2">
                {() => <Spo2 seniorUid={this.state.senior.data.Uid} />}
              </Tab.Screen>
              <Tab.Screen name="Temperature">
                {() => <Temperature seniorUid={this.state.senior.data.Uid} />}
              </Tab.Screen>
              <Tab.Screen name="CheckIn">
                {() => (
                  <CheckInHistory seniorUid={this.state.senior.data.Uid} />
                )}
              </Tab.Screen>
            </Tab.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  container: {
    flex: 1,
  },
  chartContainer: {
    height: '100%',
  },
  back: {
    top: 15,
    left: 15,
  },
  greeting: {
    top: 15,
    marginBottom: 20,
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
  },
});
