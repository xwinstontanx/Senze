import React, { Component } from 'react';
import { Text, StyleSheet, SafeAreaView, ImageBackground, TouchableOpacity } from 'react-native';
import styled from 'styled-components';

import SettingButton from '../../components/SettingButton';
import SignOutButton from '../../components/SignOutButton';
import { Icon } from 'native-base';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import VersionInfo from 'react-native-version-info';
import SimpleDialog from '../../components/SimpleDialog';

import { connect } from 'react-redux';
import { logout } from '../../redux/actions';
import { showLanguageOptions, LanguageBottomSheet, translate } from '../../../translations';

class cgSettings extends Component {
  _isMounted = false;
  rbSheet = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  profile = () => {
    this.props.navigation.navigate('cgProfileSetting');
  };

  helpInfo = () => {
    this.setState({
      errorMessage: "For enquiries, please email us at contact@senzehub.com",
      showDialog: true,
    });
  }

  //SignOut
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
        <SafeAreaView style={styles.container}>
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
              title={translate("CHANGE LANGUAGE")}
              icon="globe"
              onClick={() => {
                showLanguageOptions();
              }}
            />

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
              if (this.state.errorMessage === translate('Succesfully Updated')) {
                this.props.navigation.navigate('cgSettingScreen');
              }
            }}
            errorMessage={this.state.errorMessage}
          />
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
  topLeft: {
    alignItems: 'flex-start',
    top: 30,
    left: 16,
    fontSize: 30,
    textAlign: 'left',
    color: '#ffffff',
    marginBottom: 40,
  },
  version: {
    marginTop: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  signup: {
    fontWeight: '500',
    color: '#E9446A',
  },
});

const Container = styled.ScrollView`
  flex: 1;
`;

const mapStateToProps = (state) => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { logout })(cgSettings);
