import React, { Component } from 'react';
import { ScrollView, StyleSheet, View, Platform, SafeAreaView, TouchableOpacity, Text, ImageBackground, ActivityIndicator } from 'react-native';

import FusionCharts from 'react-native-fusioncharts';
import Schema from './Schema/DataSchema.json';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import firestore from '@react-native-firebase/firestore';

import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import moment from 'moment';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { translate } from '../../../../translations';
const Tab = createMaterialTopTabNavigator();

export default class cgSeniorBloodGlucose extends Component {
  _isMounted = false;
  bloodglucose = [];

  constructor(props) {
    super(props);

    this.state = {
      senior: this.props.navigation.state.params.senior,
      tableData: [],
      tableHead: [translate('RECORDED AT'), translate('BLOOD GLUCOSE') + ' (mmol/L)'],
      type: 'timeseries',
      width: '100%',
      height: '100%',
      dataFormat: 'json',
      dataSource: {
        data: null,
        caption: {
          text: '',
        },
        subcaption: {
          // text: '36 - 37°C',
        },
        series: "Type",
        yAxis: [
          {
            plot: {
              value: 'HealthData',
            },
            title: translate('BLOOD GLUCOSE') + ' (mmol/L)',
          },
        ],
        xAxis: {
          plot: 'Time',
        },
      },
      schemaJson: null,
      dataJson: null,
      HealthData: ' ',
      isLoading: false,
    };

    this.libraryPath = Platform.select({
      // Specify fusioncharts.html file location
      ios: require('../../../../assets/fusioncharts.html'),
      android: { uri: 'file:///android_asset/fusioncharts.html' },
    });
  }

  componentDidMount() {
    this._isMounted = true;

    this.setState({
      isLoading: true
    })

    dbRefUser = firestore()
      .collection('Users')
      .doc(this.state.senior.data.Uid)
      .collection('SeniorData');

    dbRefUser
      .orderBy('CreatedAt', 'desc')
      .get()
      .then((queryData) => {
        queryData.forEach((bloodglucoseData) => {
          if (parseInt(bloodglucoseData.data().BloodGlucose) > 0 && bloodglucoseData.data().DeviceType === 5) {
            const HealthData = parseFloat(bloodglucoseData.data().BloodGlucose);
            let date = bloodglucoseData.data().CreatedAt.toDate();
            let time =
              moment(date).format('dddd') +
              ', ' +
              moment(date).format('DD MMM YYYY') +
              ' ' +
              moment(date).format('h:mm a');

            const Time = moment(date).format('DD MMM YYYY') +
              ' ' +
              moment(date).format('h:mm A');
            this.state.tableData.push([time, HealthData]);

            this.bloodglucose.push({ HealthData: HealthData, Type: 'Blood Glucose', Time: Time });
          }
        });
        this.setState({
          dataJson: this.bloodglucose,
          schemaJson: Schema,
          isLoading: false,
        });
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }



  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../../assets/bg.png')}>
        <SafeAreaView style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                flex: 0,
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('cgseniorvitalshistory');
                }}>
                <Icon name="arrow-circle-left" size={38} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.topLeft} bold>
              {translate('BLOOD GLUCOSE')}
            </Text>
          </View>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                tabBarLabelStyle: {
                  fontSize: 12,
                },
                lazy: true,
                activeTintColor: '#2196f3',
                inactiveTintColor: '#2196f355',
                indicatorStyle: { backgroundColor: '#2196f3' },
              }}>
              <Tab.Screen name={translate("NUMERIAL")}>
                {() => (
                  <ScrollView>
                    {this.state.isLoading == true ? (
                      <View style = {styles.spinnerStyle}>
                        <ActivityIndicator size="large"  />
                      </View>
                      ) : 
                      (<View style={styles.tableContainer}>
                      <Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
                        <Row data={this.state.tableHead} style={styles.head} textStyle={styles.textData} />
                        <Rows data={this.state.tableData} textStyle={styles.textData} />
                      </Table>
                    </View>)}
                  </ScrollView>
                )}
              </Tab.Screen>
              <Tab.Screen name={translate("GRAPH")}>
                {() => (
                  <View style={styles.chartContainer}>
                    <FusionCharts
                      dataJson={this.state.dataJson}
                      schemaJson={this.state.schemaJson}
                      type={this.state.type}
                      width={this.state.width}
                      height={this.state.height}
                      dataFormat={this.state.dataFormat}
                      dataSource={this.state.dataSource}
                      libraryPath={this.libraryPath} // set the libraryPath property
                    />
                  </View>
                )}
              </Tab.Screen>

            </Tab.Navigator>
          </NavigationContainer>


          {/* <View style={styles.chartContainer}>
          <FusionCharts
            dataJson={this.state.dataJson}
            schemaJson={this.state.schemaJson}
            type={this.state.type}
            width={this.state.width}
            height={this.state.height}
            dataFormat={this.state.dataFormat}
            dataSource={this.state.dataSource}
            libraryPath={this.libraryPath} // set the libraryPath property
          />
        </View> */}
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    paddingTop: 10,
  },
  head: {
    height: 60,
    backgroundColor: '#f1f8ff'
  },
  textData: {
    margin: 10,
    alignSelf: 'center'
  },
  chartContainer: {
    height: '100%',
    height: '100%',
    flex: 1,
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topLeft: {
    // alignItems: 'flex-start',
    // // position: 'absolute',
    // top: 30,
    // left: 16,
    // fontSize: 30,
    // fontWeight: 'bold',
    // textAlign: 'left',
    // color: '#ffffff',
    // marginBottom: 40,

    alignItems: 'flex-start',
    // position: 'absolute',
    top: 15,
    marginBottom: 30,
    left: 16,
    fontSize: 20,
    textAlign: 'left',
    color: '#ffffff',
  },
  spinnerStyle: {
    marginTop: 15,
  },
});
