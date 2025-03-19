import React, {Component} from 'react';
import {
  View,
  Platform,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styled from 'styled-components';
import HealthData from '../../components/HealthData';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

import {connect} from 'react-redux';
import { translate } from '../../../translations';

let dbRefUser;

class SeniorHealthData extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      HeartRate: '',
      Spo2: '',
      Temperature: '',
      CreatedAt: '',
      bleStatus: '',
      timeDay: moment().format('dddd'),
      timeDate: moment().format('DD MMM YYYY'),
      time: moment().format('h:mm a'),
    };
  }

  componentDidMount() {
    this._isMounted = true;

    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);

    dbRefUser
      .collection('SeniorData')
      .orderBy('CreatedAt', 'desc')
      .limit(1)
      .onSnapshot((healthDataSnapshot) => {
        if (!healthDataSnapshot.empty) {
          healthDataSnapshot.forEach((data) => {
            if (data.data().CreatedAt !== null) {
              if (data.data().HeartRate > 0) {
                if (this._isMounted) {
                  this.setState({
                    timeDay: moment(data.data().CreatedAt.toDate()).format(
                      'dddd',
                    ),
                    timeDate: moment(data.data().CreatedAt.toDate()).format(
                      'DD MMM YYYY',
                    ),
                    time: moment(data.data().CreatedAt.toDate()).format(
                      'h:mm a',
                    ),
                    HeartRate: data.data().HeartRate,
                    Spo2: data.data().Spo2,
                    Temperature: data.data().Temperature,
                    CreatedAt: data
                      .data()
                      .CreatedAt.toDate()
                      .toString()
                      .substring(0, 21),
                  });
                }
              } else {
                if (this._isMounted) {
                  this.setState({
                    HeartRate: 'NA',
                    Spo2: 'NA',
                    Temperature: 'NA',
                    CreatedAt: data
                      .data()
                      .CreatedAt.toDate()
                      .toString()
                      .substring(0, 21),
                  });
                }
              }
            }
          });
        }
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  //Ble Manager
  Ble = () => {
    this.props.navigation.navigate('BLE');
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <Container>
          <Text style={styles.topLeft} bold>
            {translate('LATEST VITALS')}
          </Text>
          {/* <TouchableOpacity style={styles.topRight3} onPress={this.Ble}>
            <TouchableOpacity style={styles.topRight3}>
            <FontAwesome5 name="bluetooth" size={20} color="#ffffff" />

            {this.props.profile.WearableId !== null &&
            this.props.profile.WearableId !== '' ? (
              <Text style={styles.topRight3Text} bold>
                Paired
              </Text>
            ) : (
              <Text style={styles.topRight3Text} bold>
                Not Paired
              </Text>
            )}
          </TouchableOpacity> */}

          <Text style={styles.topRight}>Updated on:</Text>
          <Text style={styles.topRight1} bold>
            {this.state.timeDay} {this.state.timeDate} {this.state.time}
          </Text>

          <View style={styles.containerData}>
            <HealthData
              icon={require('../../assets/heartRate.png')}
              title={translate("HEART RATE")}
              value={this.state.HeartRate}
              unit="BPM"
            />
            <HealthData
              icon={require('../../assets/spo.png')}
              title={translate('SPO2')}
              value={this.state.Spo2}
              unit=" % "
            />
            <HealthData
              icon={require('../../assets/temp.png')}
              title={translate('TEMPERATURE')}
              value={this.state.Temperature}
              unit="°C "
            />
          </View>
        </Container>
      </ImageBackground>
    );
  }
}

const Container = styled.ScrollView`
  flex: 1;
`;

const Text = styled.Text`
  color: ${(props) => (props.dark ? '#000' : '#fff')};
  font-family: 'AvenirNext-Regular';
  ${({title, large, small}) => {
    switch (true) {
      case title:
        return `font-size: 32px`;
      case large:
        return `font-size: 24px`;
      case small:
        return `font-size: 14px`;
    }
  }}
  ${({bold, heavy}) => {
    switch (true) {
      case bold:
        return `font-weight: 600`;
      case heavy:
        return `font-weight: 700`;
    }
  }}
`;

const styles = StyleSheet.create({
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topRight: {
    top: 90,
    fontSize: 15,
    textAlign: 'center',
    color: '#ffffffAA',
  },
  topRight1: {
    top: 90,
    fontSize: 20,
    textAlign: 'center',
    color: '#ffffffCC',
    marginBottom: 10,
  },
  topLeft: {
    alignItems: 'flex-start',
    position: 'absolute',
    top: 30,
    left: 16,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#ffffff',
  },
  topRight3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 35,
    right: 16,
    fontSize: 24,
    textAlign: 'right',
    color: '#ffffff',
  },
  topRight3Text: {
    marginLeft: 5,
    fontSize: 15,
    textAlign: 'right',
    color: '#ffffff',
  },
  containerData: {
    borderColor: '#180D59',
    borderRadius: 10,
    marginTop: '20%',
    marginLeft: '5%',
    marginRight: '5%',
    marginBottom: '10%',
  },
});

const mapStateToProps = (state) => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(SeniorHealthData);
