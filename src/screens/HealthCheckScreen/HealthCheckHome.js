import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Vibration
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import SimpleDialog from '../../components/SimpleDialog';

import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';

import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { translate } from '../../../translations';
import { RNCamera, RNCameraProps } from 'react-native-camera';
import moment from 'moment';
import CryptoJS from 'react-native-crypto-js';


class HealthCheckHome extends Component {
  constructor(props) {
    super(props);

    this.camera = null;

    this.state = {
      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
      },
      detected: false,

      showDialog: false,
      errorMessage: ''
    };
  }

  onBarCodeRead(scanResult) {
    if (scanResult.data != null && scanResult.type === 'QR_CODE' && !this.state.detected) {
      Vibration.vibrate(1 * 300);
      // this.setState({ detected: true })

      try {
        //decrypt
        let decryptedUidTimestamp = CryptoJS.AES.decrypt(
          scanResult.data,
          'SenzeHub is the best',
        );
        let originalText = decryptedUidTimestamp.toString(CryptoJS.enc.Utf8);
        if (originalText.includes("-")) {
          let splited = originalText.split("-");
          let currentDateTime = moment();
          let decryptedDateTime = splited[1];

          let duration = moment.duration(currentDateTime.diff(new Date(decryptedDateTime)));
          if (duration.asMinutes() < 1.0) {

            firestore().collection('Users').doc(splited[0]).get().then(data => {
              if (data.exists) {
                this.props.navigation.navigate('healthCheckData', {
                  Uid: splited[0]
                });
              }
              else {
                this.setState({
                  errorMessage: "Senior not found",
                  showDialog: true,
                });
              }
            });
          }
          else {
            this.setState({
              errorMessage: "Kindly use the latest QR code",
              showDialog: true,
            });
          }
        }
        else {
          this.setState({
            errorMessage: "Invalid QR code",
            showDialog: true,
          });
        }
      } catch (error) {
        this.setState({
          errorMessage: error,
          showDialog: true,
        });
      }
      return;
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>

          <Text style={styles.title}>
            {translate('Health Check')}
          </Text>
        </View>

        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          defaultTouchToFocus
          flashMode={this.state.camera.flashMode}
          mirrorImage={false}
          onBarCodeRead={this.onBarCodeRead.bind(this)}
          onFocusChanged={() => { }}
          onZoomChanged={() => { }}
          // permissionDialogTitle={'Permission to use camera'}
          // permissionDialogMessage={'We need your permission to use your camera phone'}
          style={styles.preview}
          type={this.state.camera.type}
        />
        <View style={[styles.overlay, styles.topOverlay]}>
          <Text style={styles.scanScreenMessage}> {translate('Please scan senior\'s QR code to start the session')}</Text>
        </View>

        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            if (this.state.errorMessage === translate('Everything is good now') || this.state.errorMessage === translate('You are not granted to visit this senior')) {
              // Checkin and back to event
              this.props.navigation.pop();
            }
            this.setState({ showDialog: false })
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
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  name: {
    top: 15,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
    color: '#180D59',
  },
  title: {
    top: 15,
    fontSize: RFValue(28),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#180D59',
    flex: 1,
    alignItems: 'center',
  },
  scanner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  topOverlay: {
    top: 100,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanScreenMessage: {
    fontSize: RFValue(20),
    color: '#180D59',
    backgroundColor: '#FFFFFFCC',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(HealthCheckHome);
