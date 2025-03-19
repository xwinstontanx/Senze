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
import SettingButton from '../../components/SettingButton';

import RNImmediatePhoneCall from 'react-native-immediate-phone-call';

import { connect } from 'react-redux';
import { translate } from '../../../translations';

class cgSeniorDetails extends Component {
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

  vitalshistory = () => {
    this.props.navigation.navigate('cgseniorvitalshistory', {
      senior: this.state.senior,
    });
  };

  medication = () => {
    this.props.navigation.navigate('cgmedications', {
      senior: this.state.senior,
    });
  };

  chat = () => {
    this.props.navigation.navigate('cgchat', {
      senior: this.state.senior,
    });
  };

  caseNotes = () => {
    this.props.navigation.navigate('cgcasenotes', {
      senior: this.state.senior,
    });
  };

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

  addOtherDevices = () => {
    this.props.navigation.navigate('cgaddotherdevices', {
      senior: this.state.senior,
    });
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
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
                  this.props.navigation.navigate('cghome');
                }}>
                <Icon name="arrow-circle-left" size={40} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.greeting}>
                {this.state.senior.data.Name}'s {translate('DETAILS')}
              </Text>
            </View>

            <SettingButton
              title={translate("VITALS HISTORY")}
              icon="history"
              onClick={() => {
                this.vitalshistory();
              }}
            />
            <SettingButton
              title={translate("Other Devices")}
              icon="plus"
              onClick={() => {
                this.addOtherDevices();
              }}
            />
            <SettingButton
              title={translate("MEDICATIONS")}
              icon="pills"
              onClick={() => {
                this.medication();
              }}
            />

            <SettingButton
              title={translate("Chat")}
              icon="comments"
              onClick={() => {
                this.chat();
              }}
            />
            <SettingButton
              title={translate("CASE NOTES")}
              icon="book-medical"
              onClick={() => {
                this.caseNotes();
              }}
            />

            <SettingButton
              title={translate("SETTINGS")}
              icon="users-cog"
              onClick={() => {
                this.settings();
              }}
            />

            <SettingButton
              title={translate("QUICK CALL")}
              icon="phone"
              onClick={() => {
                this.phoneCall();
              }}
            />

            <SettingButton
              title={translate("LAST KNOWN LOCATION")}
              icon="map-marker-alt"
              onClick={() => {
                this.viewMap();
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
    textAlign: 'left',
    color: '#ffffff',
    flex: 1,
    flexWrap: 'wrap'
  },
  back: {
    top: 15,
    left: 15,
    flexDirection: 'column'
  },
});

const Container = styled.ScrollView`
  flex: 1;
`;

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(cgSeniorDetails);
