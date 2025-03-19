import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Linking,
} from 'react-native';
import styled from 'styled-components';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import SettingButton from '../../../components/SettingButton';

import RNImmediatePhoneCall from 'react-native-immediate-phone-call';

import { connect } from 'react-redux';

import VitalsHistoryButton from '../../../components/VitalsHistoryButton';
import { translate } from '../../../../translations';

class cgSeniorVitalsHistory extends Component {
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

  history = () => {
    this.props.navigation.navigate('cgseniorhistory', {
      senior: this.state.senior,
    });
  };

  seniorHeartRate() {
    this.props.navigation.navigate('cgseniorheartrate', {
      senior: this.state.senior,
    });
  }

  seniorSpo2() {
    this.props.navigation.navigate('cgseniorspo2', {
      senior: this.state.senior,
    });
  }

  seniorTemperature() {
    this.props.navigation.navigate('cgseniortemperature', {
      senior: this.state.senior,
    });
  }

  seniorBloodPressure() {
    this.props.navigation.navigate('cgseniorbloodpressure', {
      senior: this.state.senior,
    });
  }

  seniorBloodGlucose() {
    this.props.navigation.navigate('cgseniorbloodglucose', {
      senior: this.state.senior,
    });
  }

  seniorWeight() {
    this.props.navigation.navigate('cgseniorweight', {
      senior: this.state.senior,
    });
  }

  seniorCheckIn() {
    this.props.navigation.navigate('cgseniorcheckin', {
      senior: this.state.senior,
    });
  }

  settings = () => {
    this.props.navigation.navigate('cgseniorsetting', {
      senior: this.state.senior,
    });
  };

  phoneCall = () => {
    const phoneNumber = this.state.senior.data.PhoneNumber;
    RNImmediatePhoneCall.immediatePhoneCall(phoneNumber);
  };

  viewMap = () => {
    const geo = this.state.senior.data.GeoLocation;
    const latitude = geo.coordinates._latitude;
    const longitude = geo.coordinates._longitude;

    var formatted_address = '';

    fetch(
      'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
      latitude +
      ',' +
      longitude +
      '&key=AIzaSyCiFq4GNcoTfbIt3TbVLL48WQEUX3MhpXM',
    )
      .then(response => {
        return response.json();
      })
      .then(json => {
        formatted_address = json.results[0].formatted_address;
        const url = Platform.select({
          ios: 'maps:' + latitude + ',' + longitude + '?q=' + formatted_address,
          android:
            'geo:' + latitude + ',' + longitude + '?q=' + formatted_address,
        });

        Linking.openURL(url);
      })
      .catch(error => {
        console.error(error);
      });
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../../assets/bg.png')}>
        <SafeAreaView style={styles.container}>
          <Container>
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
                {this.state.senior.data.Name}'s {translate('VITALS HISTORY')}

              </Text>
            </View>

            <VitalsHistoryButton
              title={translate("HEART RATE")}
              icon={require('../../../assets/heartRate.png')}
              onClick={() => {
                this.seniorHeartRate();
              }}
            />

            <VitalsHistoryButton
              title={translate("SPO2")}
              icon={require('../../../assets/spo.png')}
              onClick={() => {
                this.seniorSpo2();
              }}
            />
            <VitalsHistoryButton
              title={translate("TEMPERATURE")}
              icon={require('../../../assets/temp.png')}
              onClick={() => {
                this.seniorTemperature();
              }}
            />

            {/* <VitalsHistoryButton
            title="Check In"
            icon={require('../../../assets/temp.png')}
            onClick={() => {
              // this.profile();
            }}
          /> */}

            <VitalsHistoryButton
              title={translate("BLOOD PRESSURE")}
              icon={require('../../../assets/bp.png')}
              onClick={() => {
                this.seniorBloodPressure();
              }}
            />

            <VitalsHistoryButton
              title={translate("BLOOD GLUCOSE")}
              icon={require('../../../assets/bloodGlucose.png')}
              onClick={() => {
                this.seniorBloodGlucose();
              }}
            />

            <VitalsHistoryButton
              title={translate("WEIGHT")}
              icon={require('../../../assets/weight.jpeg')}
              onClick={() => {
                this.seniorWeight();
              }}
            />

            <VitalsHistoryButton
              title={translate("CHECK IN")}
              icon={require('../../../assets/checkin.png')}
              onClick={() => {
                this.seniorCheckIn();
              }}
            />

          </Container>
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
  greeting: {
    top: 15,
    left: 26,
    fontSize: 20,
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
});

const Container = styled.ScrollView`
  flex: 1;
`;

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(cgSeniorVitalsHistory);
