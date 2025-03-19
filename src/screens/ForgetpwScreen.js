import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { mainStyles } from '../styles/styles';
import { Button, Text } from 'native-base';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import SimpleDialog from '../components/SimpleDialog';
import themeVariables from '../../native-base-theme/variables/material_copy';

import auth from '@react-native-firebase/auth';
import { translate } from '../../translations';

export default class ForgetpwScreen extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      resetSuccess: false,
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

  handleReset = () => {
    if (this.state.email != '') {
      auth()
        .sendPasswordResetEmail(this.state.email)
        .then(() => {
          this.setState({
            resetSuccess: true,
            errorMessage: translate('please check your email'),
            showDialog: true,
          });
        })
        .catch(error => {
          switch (error.code) {
            case 'auth/invalid-email':
              this.setState({
                errorMessage: translate('The email address is badly formatted'),
                showDialog: true,
              });
              break;
            case 'auth/user-not-found':
              this.setState({
                errorMessage:
                  translate('There is no user record corresponding to this identifier'),
                showDialog: true,
              });
              break;
          }
        });
    } else {
      this.setState({
        errorMessage: translate('Please fill in your email address'),
        showDialog: true,
      });
    }
  };

  loginScreen() {
    if (this.state.resetSuccess) {
      this.props.navigation.navigate('Login');
      this.setState({ showDialog: false, resetSuccess: false });
    } else {
      this.setState({ showDialog: false });
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <StatusBar barStyle="light-content" />

          <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
            <TouchableOpacity
              style={styles.back}
              onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-circle-left" size={40} color="#2196f3" />
            </TouchableOpacity>

            <Text style={styles.greeting}>{translate('RESET PASSWORD')}</Text>

            <Text style={styles.greeting2}>
              {translate('ENTER EMAIL ADDRESS TO RESET PASSWORD')}
            </Text>
            <View style={{ margin: 5, padding: 15 }}>
              <Text style={styles.inputTitle}>{translate('EMAIL ADDRESS')}</Text>
              <TextInput
                style={styles.input}
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={() => {
                  this.handleReset();
                }}
              />
              <Button
                style={[
                  {
                    marginTop: 10,
                    backgroundColor: '#2196f3',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  },
                ]}
                onPress={this.handleReset}>
                <Text>{translate('RESET')}</Text>
              </Button>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.loginScreen();
          }}
          errorMessage={this.state.errorMessage}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  name: {
    marginTop: 2,
    fontWeight: 'bold',
    fontSize: 50,
    textAlign: 'center',
    color: themeVariables.brandPrimary,
  },
  greeting: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    //fontFamily: 'monospace',
    color: '#180D59',
  },
  greeting2: {
    fontWeight: '500',
    fontSize: 18,
    textAlign: 'center',
    color: '#180D59',
    marginTop: 35,
  },
  errorMessage: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  error: {
    color: '#E9446A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputTitle: {
    marginTop: 35,
    color: '#180D59',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
    fontSize: 15,
    color: '#161F3D',
  },
  ImageTop: {
    height: 155,
    width: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 210,
    width: 400,
    resizeMode: 'center',
  },
  back: {
    //position: 'absolute',
    top: 15,
    left: 15,
  },
});
