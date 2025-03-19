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
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


import NewReadingButton from '../../components/NewReadingButton';
import { translate } from '../../../translations';

const Tab = createMaterialTopTabNavigator();

export default class cgAddOtherDevices extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      senior: this.props.navigation.state.params.senior,
    };
  }


  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  VitalsReadingsScreen() {
    this.props.navigation.navigate('cgaddseniorvitalsreadings', {
      senior: this.state.senior,
    });
  }

  BloodPressureScreen() {
    this.props.navigation.navigate('cgaddseniorbloodpressurew', {
      senior: this.state.senior,
    });
  }

  BloodGlucoseScreen() {
    this.props.navigation.navigate('cgaddseniorbloodglucose', {
      senior: this.state.senior,
    });
  }

  WeightScreen() {
    this.props.navigation.navigate('cgaddseniorweight', {
      senior: this.state.senior,
    });
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
                  this.props.navigation.navigate('cgseniordetails');
                }}>
                <Icon name="arrow-circle-left" size={38} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.topLeft} bold>
              {translate('OTHER DEVICES')}
            </Text>
          </View>

          <Container>
            <NewReadingButton
              title={translate('Vitals Readings')}
              icon={require('../../assets/heartRate.png')}
              onClick={() => {
                this.VitalsReadingsScreen();
              }}
            />
            <NewReadingButton
              title={translate("BLOOD PRESSURE")}
              icon={require('../../assets/bp.png')}
              onClick={() => {
                this.BloodPressureScreen();
              }}
            />
            <NewReadingButton
              title={translate("BLOOD GLUCOSE")}
              icon={require('../../assets/bloodGlucose.png')}
              onClick={() => {
                this.BloodGlucoseScreen();
              }}
            />
            <NewReadingButton
              title={translate("WEIGHT")}
              icon={require('../../assets/weight.jpeg')}
              onClick={() => {
                this.WeightScreen();
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
