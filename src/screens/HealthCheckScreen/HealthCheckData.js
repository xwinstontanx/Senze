import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Vibration,
  ScrollView,
  Modal,
  Image
} from 'react-native';
import { Button } from 'native-base';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import SimpleDialog from '../../components/SimpleDialog';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firestore from '@react-native-firebase/firestore';
import HealthCheckContain from '../../components/HealthCheckContain';

import { connect } from 'react-redux';
import { translate } from '../../../translations'
import moment from 'moment';

import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

class HealthCheckData extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      uid: this.props.navigation.state.params.Uid,
      currentDate: new Date(),
      seniorDetail: "",
      showDialog: false,
      errorMessage: '',

      HeartRate: '-- ',
      Spo2: '-- ',
      Temperature: '-- ',
      Systolic: '-- ',
      Diastolic: '-- ',
      BloodGlucose: '-- ',
      Weight: '-- ',
      Height: '-- ',
      BMI: '-- ',

      modalVisible: false
    };

  }

  componentDidMount() {
    this._isMounted = true;

    // Get User Detail
    dbRefUser = firestore().collection('Users').doc(this.state.uid);
    dbRefUser.get().then(data => {
      this.setState({ seniorDetail: data.data() })

      this.getHealthData();
    });
  }


  getHealthData = async () => {
    let startTime = moment().utcOffset(0);
    startTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    let endTime = moment().utcOffset(0).add(1, 'd');
    endTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    // Get today's latest Health data (DeviceType: 5 (BG), 4 (Weight), 3 (BP), 2 (Desktop), 1 (Wearable))
    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 1)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(wearSnapshot => {
        wearSnapshot.forEach(wearDetailSnapshot => {
          this.setState({
            HeartRate: wearDetailSnapshot.data().HeartRate,
            Spo2: wearDetailSnapshot.data().Spo2,
            Temperature: wearDetailSnapshot.data().Temperature
          })
        })
      })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 2)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(deskSnapshot => {
        deskSnapshot.forEach(deskDetailSnapshot => {
          this.setState({
            HeartRate: deskDetailSnapshot.data().HeartRate,
            Spo2: deskDetailSnapshot.data().Spo2,
            Temperature: deskDetailSnapshot.data().Temperature
          })
        })
      })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 3)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(bpSnapshot => {
        bpSnapshot.forEach(bpDetailSnapshot => {
          this.setState({
            Systolic: bpDetailSnapshot.data().Systolic,
            Diastolic: bpDetailSnapshot.data().Diastolic
          })
        })
      })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 5)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(bgSnapshot => {
        bgSnapshot.forEach(bgDetailSnapshot => {
          this.setState({ BloodGlucose: bgDetailSnapshot.data().BloodGlucose })
        })
      })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 4)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(weightSnapshot => {
        weightSnapshot.forEach(weightDetailSnapshot => {
          this.setState({ Weight: weightDetailSnapshot.data().Weight })
        })
      })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 6)
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(heightSnapshot => {
        heightSnapshot.forEach(heightDetailSnapshot => {
          this.setState({ Height: heightDetailSnapshot.data().Height })
        })
      })

    await dbRefUser.collection('SeniorData')
      .where("DeviceType", "==", 7)
      .where("CreatedAt", ">=", new Date(startTime))
      .where("CreatedAt", "<", new Date(endTime))
      .orderBy("CreatedAt", "asc")
      .limitToLast(1)
      .get()
      .then(bmiSnapshot => {
        bmiSnapshot.forEach(bmiDetailSnapshot => {
          this.setState({ BMI: bmiDetailSnapshot.data().BMI })
        })
      })
  }

  done = () => {
    this.props.navigation.navigate('healthCheckHome');
  }

  render() {
    return (
      <SafeAreaView style={styles.container} >
        {/* <View
          style={{
            flex: 1,
            alignItems: 'center',
            marginTop: 10,
          }}>

          <Text style={styles.title}>
            {translate('Health Check')}
          </Text>
        </View> */}
        <ScrollView>
          <View
            style={{
              flex: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: '95%',
                padding: 10,
                margin: 10,
                borderWidth: 1,
                borderRadius: 10
              }}>
              <Text style={{
                fontSize: RFValue(25),
                fontWeight: 'bold',
                color: '#180D59',
                alignSelf: 'center',
              }}>
                {translate('Health Check')}
              </Text>
              <Text style={{
                fontSize: RFValue(15),
              }}>
                {`${translate('HELLO')} `}
                {this.state.seniorDetail.Name}
                {', '}
                {`${translate('YOUR LATEST HEALTH VITALS')} `}
                {'on '}
                {moment(this.state.currentDate, 'YYYY-MM-DDTHH:MM:SS.sssZ').format('DD MMM YYYY')}
                {':'}
              </Text>

              <View style={styles.container2_1}>
                <HealthCheckContain
                  icon={require('../../assets/heartRate.png')}
                  title={translate("HEART RATE")}
                  value={this.state.HeartRate}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckVitals', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="BPM"
                />
                <HealthCheckContain
                  icon={require('../../assets/spo.png')}
                  title={translate("SPO2")}
                  value={this.state.Spo2}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckVitals', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="%"
                />
                <HealthCheckContain
                  icon={require('../../assets/temp.png')}
                  title={translate("TEMPERATURE")}
                  value={this.state.Temperature}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckVitals', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="°C"
                />
              </View>

              <View style={styles.container2_1}>
                <HealthCheckContain
                  icon={require('../../assets/bp.png')}
                  title={translate("BLOOD PRESSURE") + "\n(" + translate("SYSTOLIC") + ")"}
                  value={this.state.Systolic}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckBloodPressureW', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="mmHg"
                />
                <HealthCheckContain
                  icon={require('../../assets/bp.png')}
                  title={translate("BLOOD PRESSURE") + "\n(" + translate("DIASTOLIC") + ")"}
                  value={this.state.Diastolic}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckBloodPressureW', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="mmHg"
                />
              </View>

              <View style={styles.container2_1}>
                <HealthCheckContain
                  icon={require('../../assets/bloodGlucose.png')}
                  title={translate("BLOOD GLUCOSE")}
                  value={this.state.BloodGlucose}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckBloodGlucose', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="mmol/L"
                />
                <HealthCheckContain
                  icon={require('../../assets/weight.jpeg')}
                  title={translate("WEIGHT")}
                  value={this.state.Weight}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckWeight', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="kg"
                />
                <HealthCheckContain
                  icon={require('../../assets/height.png')}
                  title={translate("Height")}
                  value={this.state.Height}
                  onClick={() => {
                    this.props.navigation.navigate('healthCheckHeight', {
                      Uid: this.state.uid,
                      onGoBack: () => this.getHealthData(),
                    });
                  }}
                  unit="cm"
                />
                <HealthCheckContain
                  icon={require('../../assets/bmi.png')}
                  title={"BMI"}
                  value={this.state.BMI}
                  onClick={() => {
                    this.setState({ modalVisible: true })
                  }}
                  unit="kg/m2"
                />
              </View>
            </View>

            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modalVisible}
              onRequestClose={() => {
                this.setState({ modalVisible: false });
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <TouchableOpacity
                    style={{ marginTop: 5, marginRight: 5, alignItems: 'flex-end' }}
                    onPress={() => {
                      this.setState({ modalVisible: false });
                    }}>
                    <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                  </TouchableOpacity>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      textDecorationLine: 'underline',
                      fontSize: 25,
                    }}>
                    BMI Risk Chart
                  </Text>

                  <Image
                    style={styles.ImageTop}
                    source={require('../../assets/bmi_risk.png')}
                  />
                </View>
              </View>
            </Modal>

            <Button
              style={{
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 5,
                marginBottom: 20,
                backgroundColor: '#180D59',
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#180D59",
              }}
              onPress={this.done}>
              <Text style={{
                color: '#ffffff',
                fontSize: RFValue(16),
              }}>{translate('Done')}</Text>
            </Button>
          </View>
        </ScrollView>
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
  title: {
    fontSize: RFValue(25),
    fontWeight: 'bold',
    color: '#180D59',
  },
  title2: {
    color: '#180D59',
    textAlign: 'center',
    fontSize: RFValue(13),
  },
  container2_1: {
    flexDirection: 'column',
    margin: 5,
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  text: {
    color: '#2196f3',
    fontWeight: '700',
    fontSize: 18,
  },

  centeredView: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 150,
  },
  modalView: {
    margin: 5,
    backgroundColor: 'white',
    borderColor: '#180D59',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#180D59',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 5,
  },
  ImageTop: {
    flex: 1,
    width: 350,
    resizeMode: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: '-5%',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(HealthCheckData);
