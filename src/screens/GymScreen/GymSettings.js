import React, { Component } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, Platform, TouchableOpacity } from 'react-native';

import styled from 'styled-components';
import VersionInfo from 'react-native-version-info';
import SimpleDialog from '../../components/SimpleDialog';

import { connect } from 'react-redux';
import { logout } from '../../redux/actions';

import { LanguageBottomSheet, translate } from '../../../translations';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

class GymSettings extends Component {
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
    this.props.navigation.navigate('gymprofile');
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  helpInfo = () => {
    this.setState({
      errorMessage: "For enquiries, please email us at contact@senzehub.com",
      showDialog: true,
    });
  }

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('../../assets/bg.png')}>
        <SafeAreaView style={{ flex: 1 }}>
          <Container>
            <Text style={styles.topLeft} bold>
              {/* {translate('SETTINGS')} */}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.props.navigation.navigate('Auth');
              }}>
              <View style={styles.buttonContent}>
                <FontAwesome5
                  name={'home'}
                  size={30}
                  color="#180D59"
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>{'SenzeHub App'}</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.version} bold>
              V{VersionInfo.appVersion}
            </Text>

            <Text style={{
              fontSize: 18,
              textAlign: 'center',
              color: '#180D59',
              marginTop: 100
            }}>{translate('For enquiries')}</Text>

            <TouchableOpacity
              onPress={async () => await Linking.openURL('mailto:contact@senzehub.com')}>
              <Text style={{
                fontSize: 20,
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
    marginTop: 30,
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
  button: {
    color: '#180D59',
    textAlign: 'center',
    borderColor: '#180D59',
    borderWidth: 2,
    marginTop: 70,
    marginLeft: 40,
    marginRight: 40,
    padding: 10,
    backgroundColor: '#FFFFFFAA',
    borderRadius: 25,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonText: {
    color: '#180D59',
    textAlign: 'center',
    fontSize: 26,
  },
  icon: {
    marginTop: 5,
    height: 31,
  },
});

const Container = styled.ScrollView`
  flex: 1;
`;

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps, { logout })(GymSettings);
