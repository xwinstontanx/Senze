import React, { Component } from 'react';
import { Text, StyleSheet, ImageBackground, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Icon } from 'native-base';
import styled from 'styled-components';
import VersionInfo from 'react-native-version-info';
import SimpleDialog from '../../components/SimpleDialog';

import { connect } from 'react-redux';
import { logout } from '../../redux/actions';

import SettingButton from '../../components/SettingButton';
import SignOutButton from '../../components/SignOutButton';
import { showLanguageOptions, LanguageBottomSheet, translate } from '../../../translations';
import { changeIcon } from 'react-native-change-icon';


class VolunteerSettings extends Component {
  _isMounted = false;
  rbSheet = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
    };
  }

  profile = () => {
    this.props.navigation.navigate('volunteerprofile');
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  qrcode = () => {
    this.props.navigation.navigate('volunteerqr');
  };

  helpInfo = () => {
    this.setState({
      errorMessage: "For enquiries, please email us at contact@senzehub.com",
      showDialog: true,
    });
  }

  signOutUser = () => {
    let dbRef = firestore().collection('Users').doc(auth().currentUser.uid);
    dbRef
      .update({
        FcmToken: '',
      })
      .then(() => {
        firestore().collection('Users')
          .doc(auth().currentUser.uid)
          .collection('LogHistory')
          .add({
            From: "Mobile",
            Action: "Logout",
            CreatedAt: firestore.FieldValue.serverTimestamp(),
          }).then(() => {
            auth()
              .signOut()
              .then(() => {
                this.props.logout();
                this.props.navigation.navigate('Login');
              })
              .catch((error) => {
                this.setState({
                  errorMessage: error,
                  showDialog: true,
                })
              });
          })
      });
  };

  render() {

    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={{ flex: 1 }}>
          <Container>
            <Text style={styles.topLeft} bold>
              {translate('SETTINGS')}
            </Text>

            <SettingButton
              title={translate("Profile")}
              icon="user"
              onClick={() => {
                this.profile();
              }}
            />
            <SettingButton
              title={translate("SHOW QR CODE")}
              icon="qrcode"
              onClick={() => {
                this.qrcode();
              }}
            />

            <SettingButton
              title={translate("CHANGE LANGUAGE")}
              icon="globe"
              onClick={() => {
                showLanguageOptions();
              }}
            />

            {/* <SettingButton
              title={translate("CHANGE ICON")}
              icon="exchange-alt"
              onClick={() => {
                changeIcon('thk').then((res) => console.log('Changed Icon'));
              }}
            /> */}

            <SignOutButton
              onClick={() => {
                this.signOutUser();
              }}
            />

            <Text style={styles.version} bold>
              V{VersionInfo.appVersion}
              {/* <Icon
                  type="FontAwesome"
                  style={{ color: '#180D59' }}
                  name="question-circle"
                  onPress={() => this.helpInfo()}
                /> */}
            </Text>


            <Text style={{
              fontSize: 13,
              textAlign: 'center',
              color: '#180D59',
              marginTop: 10
            }}>{translate('For enquiries')}</Text>

            <TouchableOpacity
              onPress={async () => await Linking.openURL('mailto:contact@senzehub.com')}>
              <Text style={{
                fontSize: 15,
                textAlign: 'center',
                color: '#2196f3',
                marginBottom: 30,
              }}>contact@senzehub.com</Text>
            </TouchableOpacity>
          </Container>
          <LanguageBottomSheet />
          <SimpleDialog
            modalVisible={this.state.showDialog}
            onModalClosed={() => {
              this.setState({ showDialog: false });
            }}
            errorMessage={this.state.errorMessage}
          />
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
  topLeft: {
    alignItems: 'flex-start',
    // position: 'absolute',
    top: 15,
    marginBottom: 30,
    left: 16,
    fontSize: 30,
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

export default connect(mapStateToProps, { logout })(VolunteerSettings);
