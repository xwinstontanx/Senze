import React, { Component } from 'react';
import { ScrollView, StyleSheet, View, Platform, TouchableOpacity, SafeAreaView, Text, ImageBackground, ActivityIndicator } from 'react-native';

import FusionCharts from 'react-native-fusioncharts';
import Schema from './Schema/DataSchema.json';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import firestore from '@react-native-firebase/firestore';

import { NavigationContainer } from '@react-navigation/native';
import { translate } from '../../../../translations';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import moment from 'moment';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
const Tab = createMaterialTopTabNavigator();



export default class cgSeniorCheckIn extends Component {
  is_Mounted = false;

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isFetching: false,

      senior: this.props.navigation.state.params.senior,

      tableData: [],
      tableHead: [translate('RECORDED AT')],
      isLoading: false,
    };
  }

  componentDidMount() {
    this.is_Mounted = true;
    this.setState({
      isLoading: true
    })
    this.getCheckIn();
  }

  componentWillUnmount() {
    this.is_Mounted = false;
  }

  getCheckIn = () => {
    this.setState({ isFetching: true });
    let dbRef = firestore()

    dbRefUser = firestore()

    dbRefUser = firestore()

      .collection('Users')
      .doc(this.state.senior.data.Uid)
      .collection('CheckInHistory');

    dbRefUser
      .orderBy('CreatedAt', 'desc')
      .get()
      .then(queryData => {
        if (!queryData.empty) {
          let newData = [];
          queryData.forEach(checkinData => {
            let date = checkinData.data().CreatedAt.toDate();
            let time =

              moment(date).format('DD MMM YYYY') +
              ' ' +
              moment(date).format('h:mm a') +
              ', ' +
              moment(date).format('dddd');

            newData.push([time]);
          });

          this.setState({ tableData: newData });
        } else {
          this.setState({
            data: [],
            isFetching: false,
          })
        }
        this.setState({
          isFetching: false,
          isLoading: false,
        });
      });
  }

  componentWillUnmount() {
    this.is_Mounted = false;
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
              {translate('CHECK IN')}
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
                      <View style={styles.spinnerStyle}>
                        <ActivityIndicator size="large" />
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

            </Tab.Navigator>
          </NavigationContainer>
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
    // paddingTop: 10,
    backgroundColor: '#f1f8ff'
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


