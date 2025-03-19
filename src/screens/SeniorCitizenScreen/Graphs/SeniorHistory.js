import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FusionCharts from 'react-native-fusioncharts';
import Schema from './Schema/DataSchema.json';
import Spo2 from './Spo2';
import Temperature from './Temperature';
import CheckInHistory from './CheckIn';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


import VitalsHistoryButton from '../../../components/VitalsHistoryButton';
import { translate } from '../../../../translations';

const Tab = createMaterialTopTabNavigator();
let dbRefUser;

export default class SeniorHistory extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);


  }

  componentDidMount() {
    this._isMounted = true;


  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  HeartRateScreen() {
    this.props.navigation.navigate('seniorHeartRateHistory');
  }

  Spo2Screen() {
    this.props.navigation.navigate('seniorSpo2History');
  }

  TemperatureScreen() {
    this.props.navigation.navigate('seniorTemperatureHistory');
  }

  BloodPressureScreen() {
    this.props.navigation.navigate('seniorBloodPressureHistory');
  }

  BloodGlucoseScreen() {
    this.props.navigation.navigate('seniorBloodGlucoseHistory');
  }

  WeightScreen() {
    this.props.navigation.navigate('seniorWeightHistory');
  }

  CheckInScreen() {
    this.props.navigation.navigate('seniorCheckInHistory');
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
                  this.props.navigation.navigate('seniorHomeScreen');
                }}>
                <Icon name="arrow-circle-left" size={38} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.topLeft} bold>
              {translate('VITALS HISTORY')}
            </Text>
          </View>

          <Container>

            <VitalsHistoryButton
              title={translate("HEART RATE")}
              icon={require('../../../assets/heartRate.png')}
              onClick={() => {
                this.HeartRateScreen();
              }}
            />

            <VitalsHistoryButton
              title={translate("SPO2")}
              icon={require('../../../assets/spo.png')}
              onClick={() => {
                this.Spo2Screen();
              }}
            />
            <VitalsHistoryButton
              title={translate("TEMPERATURE")}
              icon={require('../../../assets/temp.png')}
              onClick={() => {
                this.TemperatureScreen();
              }}
            />

            <VitalsHistoryButton
              title={translate("BLOOD PRESSURE")}
              icon={require('../../../assets/bp.png')}
              onClick={() => {
                this.BloodPressureScreen();
              }}
            />

            <VitalsHistoryButton
              title={translate("BLOOD GLUCOSE")}
              icon={require('../../../assets/bloodGlucose.png')}
              onClick={() => {
                this.BloodGlucoseScreen();
              }}
            />

            <VitalsHistoryButton
              title={translate("WEIGHT")}
              icon={require('../../../assets/weight.jpeg')}
              onClick={() => {
                this.WeightScreen();
              }}
            />

            <VitalsHistoryButton
              title={translate("CHECK IN")}
              icon={require('../../../assets/checkin.png')}
              onClick={() => {
                this.CheckInScreen();
              }}
            />

          </Container>
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
    fontSize: 23,
    textAlign: 'left',
    color: '#ffffff',
  },
  version: {
    marginTop: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
});

const Container = styled.ScrollView`
  flex: 1;
`;

const mapStateToProps = state => ({
  profile: state.main.profile,
});
