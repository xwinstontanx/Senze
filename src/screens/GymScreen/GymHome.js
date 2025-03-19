import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  ImageBackground,
  Image,
  Linking,
  TouchableOpacity
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { Text } from 'native-base';
import getToken from '../Functions/FCMToken';

import { connect } from 'react-redux';
import { setUserProfile } from '../../redux/actions';

import ButtonIcons from '../../components/ButtonIcons';
import SimpleDialog from '../../components/SimpleDialog';

// Localizations
import { translate } from '../../../translations.js'

let dbRefUser;

class GymHome extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      showDialog: false,
      geoStatus: false,
      geoLocation: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;

    // Get FCM token
    getToken();

    // Set the firebase reference
    dbRefUser = firestore().collection('Users').doc(auth().currentUser.uid);

    // Get user profile
    dbRefUser.get().then(data => {
      this.props.setUserProfile(data.data());
      this.updateFCMToken();
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateFCMToken = () => {
    firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('ElderlyUnderCare')
      .get()
      .then((granted) => {
        if (!granted.empty) {
          granted.forEach(doc => {
            // Update volunteer list with FCM & Uid
            firestore()
              .collection('Users')
              .doc(doc.data().Uid)
              .collection('VolunteersList')
              .where('PhoneNumber', '==', this.props.profile.PhoneNumber)
              .get()
              .then((vol) => {
                if (!vol.empty) {
                  vol.forEach(volDoc => {
                    firestore()
                      .collection('Users')
                      .doc(doc.data().Uid)
                      .collection('VolunteersList')
                      .doc(volDoc.id)
                      .update({
                        Uid: this.props.profile.Uid,
                        FcmToken: this.props.profile.FcmToken,
                      })
                  })
                }
              })
          });
        }
      });
  }

  volunnteer = () => {
    //this.props.navigation.navigate('Store');
    Linking.openURL('http://www.tinyurl.com/gymvolunteer22');
  };

  caregiver = () => {
    //this.props.navigation.navigate('Store');
    Linking.openURL('https://www.senzehealth.com/');
  };

  senior = () => {
    //this.props.navigation.navigate('Store');
    Linking.openURL('https://www.senzehealth.com/');
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.topLeft}>{translate("HELLO")} {this.props.profile.Name},</Text>
          <Text style={styles.topLeft2}>
            {''}
          </Text>
          <View style={styles.container}>
            <Text style={[{ color: '#180D59', fontSize: 20, textAlign: 'left', }]}>
              {'Click to join GYM2022:'}
            </Text>

            <TouchableOpacity
              onPress={() => {
                this.volunnteer();
              }}
              style={
                {
                  alignContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#180D59',
                  padding: 10,
                  width: '80%',
                  // height: 100,
                  backgroundColor: '#ffffff',
                  marginBottom: 20,
                }
              }>
              <Image
                style={styles.ImageTop}
                source={require('../../assets/gym_promo.png')}
              />
              <Text style={[{ color: '#180D59', fontSize: 25 }]}>
                {'For Volunteer'}
              </Text>
            </TouchableOpacity>

            <Text style={[{ color: '#180D59', fontSize: 20, alignItems: 'flex-start', }]}>
              {'More information for caregiving:'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.caregiver();
              }}
              style={
                {
                  alignContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#180D59',
                  padding: 10,
                  width: '80%',
                  // height: 100,
                  backgroundColor: '#ffffff',
                  marginBottom: 20,
                }
              }>
              <Image
                style={styles.ImageTop}
                source={require('../../assets/gym_promo2.png')}
              />
              <Text style={[{ color: '#180D59', fontSize: 25 }]}>
                {'For Senior / Caregiver'}
              </Text>
            </TouchableOpacity>

            {/* <ButtonIcons
              title={('VOLUNTEER (GYM 2022)')}
              icon={'dumbbell'}
              click={() => {
                this.volunnteer();
              }}
            /> */}
            {/* <ButtonIcons
              title={('CAREGIVER')}
              icon={'handshake'}
              click={() => {
                this.caregiver();
              }}
            />
            <ButtonIcons
              title={('SENIOR')}
              icon={'handshake'}
              click={() => {
                this.senior();
              }}
            /> */}
          </View>
          <SimpleDialog
            modalVisible={this.state.showDialog}
            onModalClosed={() => this.setState({ showDialog: false })}
            errorMessage={this.state.errorMessage}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  topLeft: {
    alignItems: 'flex-start',
    top: 15,
    marginBottom: 40,
    left: 16,
    fontSize: 24,
    textAlign: 'left',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  topLeft2: {
    alignItems: 'center',
    top: 10,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 30,
    fontSize: 16,
    textAlign: 'justify',
    color: '#180D59',
  },
  ImageTop: {
    height: 120,
    width: '100%',
    resizeMode: 'center',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { setUserProfile })(GymHome);
