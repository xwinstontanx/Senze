import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,

} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import SimpleDialog from '../../components/SimpleDialog';

import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';

import { translate } from '../../../translations';
import { RNCamera, RNCameraProps } from 'react-native-camera';
import moment from 'moment';
import CryptoJS from 'react-native-crypto-js';


let dbRefCaseNote;

class VolunteerQRScanner extends Component {

  constructor(props) {
    super(props);

    this.camera = null;

    this.state = {
      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
      },
      detected: false,
      bbUid: this.props.navigation.state.params.item.id,

      showDialog: false,
      errorMessage: ''
    };
  }

  onBarCodeRead(scanResult) {
    if (scanResult.data != null && scanResult.type === 'QR_CODE' && !this.state.detected) {

      this.setState({ detected: true })

      try {
        //decrypt
        let decryptedUidTimestamp = CryptoJS.AES.decrypt(
          scanResult.data,
          'SenzeHub is the best',
        );
        let originalText = decryptedUidTimestamp.toString(CryptoJS.enc.Utf8);
        if (originalText.includes("-")) {
          let splited = originalText.split("-");
          let currentDateTime = moment(new Date());
          let decryptedDateTime = splited[1];

          let duration = moment.duration(currentDateTime.diff(decryptedDateTime));
          if (duration.asMinutes() < 1.0) {

            firestore().collection('Users').doc(splited[0]).get().then(data => {
              if (data.exists) {
                firestore()
                  .collection('Users')
                  .doc(splited[0])
                  .collection('VolunteersList')
                  .where('PhoneNumber', '==', this.props.profile.PhoneNumber)
                  .get()
                  .then(snapshot => {

                    // Volunteer Verified
                    if (!snapshot.empty) {

                      dbRefCaseNote = firestore().collection('Users').doc(splited[0]).collection('CaseNotesHistory');

                      // Check whether case note has created for today
                      dbRefCaseNote
                        .orderBy("CreatedAt", "desc")
                        .limit(1)
                        .get()
                        .then((caseNoteSnapshot) => {

                          let date = new Date()
                          dbRefCaseNote.doc(this.state.bbUid).set({
                            TimeIn: date.toLocaleString(),
                            CreatedAt: firestore.FieldValue.serverTimestamp(),
                            VisitBy: this.props.profile.Uid,
                            Type: "Befriending"
                          }).then(() => {

                            // Update event status and casenote ID
                            firestore()
                              .collection('BefriendBuddyDetails')
                              .doc(this.state.bbUid)
                              .update({
                                CasenoteID: this.state.bbUid,
                                Status: 1
                              })
                              .then(() => {
                                this.setState({
                                  showDialog: true,
                                  errorMessage: translate('Everything is good now')
                                })
                              });
                          })
                          // if case note is not created in last 24 hours, then create new case note
                          //if (moment().diff(caseNoteSnapshot.docs[0].data().CreatedAt.toDate(), 'hours') > 24) {
                          // 
                          //}
                          // else {
                          //   this.setState({
                          //     showDialog: true,
                          //     errorMessage: translate('Case note has been created earlier')
                          //   })
                          // }
                        })
                    }
                    else {
                      this.setState({
                        showDialog: true,
                        errorMessage: translate('You are not granted to visit this senior')
                      })
                    }
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

    }
    return;
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
          <TouchableOpacity
            style={styles.back}
            onPress={() => {
              this.props.navigation.pop();
            }}>
            <Icon name="arrow-circle-left" size={40} color="#2196f3" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {translate('QR CODE SCANNER')}
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
    left: 26,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#180D59',
    flex: 1,
    flexWrap: 'wrap'
  },
  back: {
    top: 15,
    left: 15,
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
    alignItems: 'center'
  },
  topOverlay: {
    top: 100,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  scanScreenMessage: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(VolunteerQRScanner);
