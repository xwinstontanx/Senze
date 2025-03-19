import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import { connect } from 'react-redux';
import QRCode from 'react-qr-code';
import { translate } from '../../../translations';
import CryptoJS from 'react-native-crypto-js';

class SeniorQR extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
      encryptedUidTimestamp: '',
      codeTimer: 10
    };
  }

  async componentDidMount() {
    this._isMounted = true;

    this.generateQR();
    this.interval = setInterval(
      () => this.setState({
        codeTimer: this.state.codeTimer - 1
      }, () => {
        if (this.state.codeTimer === 0) {
          this.generateQR();
          this.setState({
            codeTimer: 10
          })
        }
      }),
      1000
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.interval);
  }

  generateQR = () => {
    let currentTimeStamp = new Date().toString();

    console.log(currentTimeStamp)
    // encrypt
    let encrypt = CryptoJS.AES.encrypt(
      this.props.profile.Uid + "-" + currentTimeStamp,
      'SenzeHub is the best'
    ).toString();
    this.setState({
      encryptedUidTimestamp: encrypt
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <KeyboardAvoidingView>
            <View style={styles.container}>
              <StatusBar barStyle="light-content" />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 40,
                }}>
                <TouchableOpacity
                  style={styles.back}
                  onPress={() => {
                    this.props.navigation.navigate('seniorSettingScreen');
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.greeting}>
                  {translate('QR CODE')}
                </Text>
              </View>

              {/* <TouchableOpacity
                style={styles.back}
                onPress={() => {
                  this.props.navigation.navigate('seniorSettingScreen');
                }}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>
              <Text style={styles.greeting}>QR Code</Text> */}
            </View>

            <View style={styles.centeredView}>
              <View style={{ flexDirection: 'column' }}>
                <QRCode value={this.state.encryptedUidTimestamp} />
              </View>
            </View>
            <View style={styles.centeredView2}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.greeting2}>{this.props.profile.Name}</Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
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
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    top: 15,
    left: 30,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#180D59',
    flex: 1,
    flexWrap: 'wrap'
  },
  greeting2: {
    top: 15,
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: '#2196F3',
  },
  form: {
    marginHorizontal: '8%',
    margin: '4%',
  },
  back: {
    top: 15,
    left: 15,
    flexDirection: 'column'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#2196F3',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 10,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const mapStateToProps = (state) => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(SeniorQR);
