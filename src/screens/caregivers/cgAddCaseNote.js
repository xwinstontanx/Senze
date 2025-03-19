import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import DatePicker from 'react-native-date-picker'
import DropDownPicker from 'react-native-dropdown-picker';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Spinner from 'react-native-loading-spinner-overlay';
import RadioGroup from 'react-native-radio-buttons-group';
import { Text } from 'native-base';
import { translate } from '../../../translations';

import moment from 'moment'
import { launchImageLibrary } from 'react-native-image-picker';

require('../../Firebase');
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'
import 'firebase/compat/storage'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { connect } from 'react-redux';
import { setLoading } from '../../redux/actions';


let dbRefCaseNotes;
let seniorUid;
let dbRefUser;

class cgAddCaseNote extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
      loading: false,

      Type: 'Home Nursing',
      Activity: [],
      OtherActivity: '',
      Remark: '',
      requiresFollowupData: [
        {
          id: '1',
          label: translate('YES'),
          selected: false,
          value: true
        },
        {
          id: '2',
          label: translate('NO'),
          selected: false,
          value: false
        }
      ],

      HeartRate: '',
      SpO2: '',
      Temperature: '',
      Systolic: '',
      Diastolic: '',
      BloodGlucose: '',
      Systolic: '',
      Diastolic: '',

      TimeIn: new Date(),
      TimeOut: new Date(),
      Duration: '',

      isTimeInDatePickerVisible: false,
      isTimeOutDatePickerVisible: false,
      isTypePickerVisible: false,
      isActivityPickerVisbile: false,

      FileName: '',
      FilePath: '',
      LocalFileURI: '',
      senior: this.props.navigation.state.params.senior,
    }
  }

  componentDidMount() {
    this._isMounted = true;
    seniorUid = this.state.senior.data.Uid
    dbRefCaseNotes = firestore().collection('Users').doc(seniorUid).collection('CaseNotesHistory');

    // For editing
    if (this.props.navigation.state.params.id !== undefined) {
      const id = this.props.navigation.state.params.id

      dbRefCaseNotes.doc(id).get().then((caseNote) => {
        const {
          Type,
          Activity,
          OtherActivity,
          Remark,
          TimeIn,
          TimeOut,
          HeartRate,
          SpO2,
          Temperature,
          BloodPressure,
          BloodGlucose,
          FileName,
          Systolic,
          Diastolic,
          Followup,
          Duration
        } = caseNote.data();

        if (Followup === true) {
          const follow = [
            {
              id: '1',
              label: translate('YES'),
              selected: true,
              value: true
            },
            {
              id: '2',
              label: translate('NO'),
              selected: false,
              value: false
            }
          ];
          this.setState({
            requiresFollowupData: follow
          })
        }
        else {
          const follow = [
            {
              id: '1',
              label: translate('YES'),
              selected: false,
              value: true
            },
            {
              id: '2',
              label: translate('NO'),
              selected: true,
              value: false
            }
          ];
          this.setState({
            requiresFollowupData: follow
          })
        }
        this.setState({
          Type,
          Activity,
          OtherActivity,
          Remark,
          TimeIn: moment(TimeIn, 'MM/DD/YYYY, h:mm:ss a').utc().toDate(),
          TimeOut: moment(TimeOut, 'MM/DD/YYYY, h:mm:ss a').utc().toDate(),
          Duration,
          HeartRate,
          SpO2,
          Temperature,
          BloodPressure,
          BloodGlucose,
          FileName,
          Systolic,
          Diastolic,
        })
      })
    }
    else {
      // For new case note
      this.getData()
    }
  }

  getData = async () => {
    this.setState({ loading: true });
    // Get latest health data if new case note
    dbRefUser = firestore().collection('Users').doc(seniorUid);
    await dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 1).orderBy("CreatedAt", "desc").limit(1)
      .get()
      .then((value) => {
        this.setState({
          HeartRate: value.docs[0].data().HeartRate.toString(),
          SpO2: value.docs[0].data().Spo2.toString(),
          Temperature: value.docs[0].data().Temperature.toString(),
        });
      })
    await dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 3).orderBy("CreatedAt", "desc").limit(1)
      .get()
      .then((value) => {
        this.setState({
          Systolic: value.docs[0].data().Systolic.toString(),
          Diastolic: value.docs[0].data().Diastolic.toString(),
        });
      })
    await dbRefUser
      .collection('SeniorData')
      .where("DeviceType", "==", 5).orderBy("CreatedAt", "desc").limit(1)
      .get()
      .then((value) => {
        this.setState({
          BloodGlucose: value.docs[0].data().BloodGlucose.toString(),
        });
      })
    this.setState({ loading: false });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async handle(caseNote) {
    dbRefCaseNotes = firestore().collection('Users').doc(seniorUid).collection('CaseNotesHistory')
    this.props.navigation.state.params.id === undefined
      ? dbRefCaseNotes.add({ ...caseNote, CreatedAt: firestore.FieldValue.serverTimestamp() })
      : dbRefCaseNotes.doc(this.props.navigation.state.params.id).update(caseNote)
  }

  handleConfirm = async () => {
    this.setState({ loading: true });
    const {
      Type,
      Activity,
      OtherActivity,
      Remark,
      TimeIn,
      TimeOut,
      HeartRate,
      SpO2,
      Temperature,
      Systolic,
      Diastolic,
      BloodGlucose,
      requiresFollowupData,
      Duration,
      FileName
    } = this.state;


    if (Activity.length === 0) {
      this.setState({
        loading: false,
        errorMessage: translate("Please select activity"),
        showDialog: true,
      });
    }
    else if (Duration === "") {
      this.setState({
        loading: false,
        errorMessage: translate("Please set time in and time out"),
        showDialog: true,
      });
    }
    else {
      const caseNote = {
        LastUpdated: firestore.FieldValue.serverTimestamp(),
        VisitBy: auth().currentUser.uid,
        Type: Type,
        Activity: Activity,
        OtherActivity: OtherActivity.trim() === '' ? '' : OtherActivity,
        TimeIn: TimeIn.toLocaleString(),
        TimeOut: TimeOut.toLocaleString(),
        HeartRate: HeartRate,
        SpO2: SpO2,
        Temperature: Temperature,
        BloodPressure: Systolic + " / " + Diastolic,
        Systolic: Systolic,
        Diastolic: Diastolic,
        BloodGlucose: BloodGlucose,
        Duration: Duration,
        Followup: requiresFollowupData[0].selected,
        Remark: Remark,
        FileName: FileName
      };

      if (this.state.LocalFileURI !== '') {
        const response = await fetch(this.state.LocalFileURI);
        const blob = await response.blob();

        const seniorUid = this.state.senior.data.Uid
        const task = firebase
          .storage()
          .ref()
          .child(`ocs/${seniorUid}/CaseNotesHistory/${this.state.FileName}`)
          .put(blob);

        const taskCompleted = () => {
          task.snapshot
            .ref
            .getDownloadURL()
            .then((FilePath) => {

              caseNote.FilePath = FilePath
              caseNote.FileName = FileName
              this.setState({ FilePath })

              // Continue to push to firebase
              this.handle(caseNote)
                .then(() => {
                  this.setState({ loading: false });
                  this.navigateBack();
                })
                .catch(error => {
                  console.log(error.message)
                  this.setState({
                    loading: false,
                    errorMessage: error.message,
                    showDialog: true,
                  });
                });
            })
        }

        const taskProgress = (snapshot) => {
          let uploadProgress = snapshot.bytesTransferred / snapshot.totalBytes;
        }

        const taskError = (error) => {
          console.log(error)
        }

        task.on(firebase.storage.TaskEvent.STATE_CHANGED, taskProgress, taskError, taskCompleted)
      }
      else {
        // Continue to push to firebase
        this.handle(caseNote)
          .then(() => {
            this.setState({ loading: false });
            this.navigateBack();
          })
          .catch(error => {
            console.log(error.message)
            this.setState({
              loading: false,
              errorMessage: error.message,
              showDialog: true,
            });
          });
      }
    }

  };

  navigateBack() {
    this.props.navigation.state.params.refreshList();
    this.props.navigation.goBack();
  }

  upload = () => {
    let options = {
      // mediaType: 'mixed',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    // Somehow does not work if Firebase storage Rules is:
    // if request.auth != null
    // We get an error: User does not have permission to access...

    launchImageLibrary(options, async res => {

      this.setState({ FileName: moment().unix() + '.jpeg' })
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        this.setState({ LocalFileURI: res.assets[0].uri });
      }
    });
  }

  render() {
    const {
      Type,
      Activity,
      OtherActivity,
      Remark,
      requiresFollowupData,
      TimeIn,
      TimeOut,
      HeartRate,
      SpO2,
      Temperature,
      Systolic,
      Diastolic,
      BloodGlucose,
      loading,
      isTypePickerVisible,
      isActivityPickerVisbile,
      FileName,
    } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ backgroundColor: '#FFFFFF' }}>
          <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
            <View style={styles.container}>
              <Text style={styles.greeting}>{translate('CASE NOTES')}</Text>
              <TouchableOpacity
                style={styles.back}
                onPress={() => this.navigateBack()}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>
              <View style={styles.form}>
                <View >
                  <Text style={styles.inputTitle}>{translate('TYPE')}</Text>
                  <DropDownPicker
                    open={isTypePickerVisible}
                    value={Type}
                    items={[{ label: 'Befriending', value: 'Befriending' }, { label: 'Buddying', value: 'Buddying' }, { label: 'Home Nusing', value: 'Home Nursing' }]}
                    onClose={() => this.setState({ isTypePickerVisible: false })}
                    onOpen={() => this.setState({ isTypePickerVisible: true })}
                    setValue={(callback) => this.setState(state => ({ Type: callback(state.Type) }))}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      marginTop: 15,
                      marginBottom: 15
                    }}
                    dropDownDirection="TOP"
                  />
                  <Text style={styles.inputTitle}>{translate('ACTIVITY')}</Text>
                  <DropDownPicker
                    open={isActivityPickerVisbile}
                    value={Activity}
                    multiple={true}
                    items={[{ label: 'Medicine Packing', value: 'Medicine Packing' },
                    { label: 'Wound Dressing', value: 'Wound Dressing' },
                    { label: 'Change Feeding Tube', value: 'Change Feeding Tube' },
                    { label: 'Change Urinary Tube', value: 'Change Urinary Tube' },
                    { label: 'Change Stroma Pack', value: 'Change Stroma Pack' },
                    { label: 'Other', value: 'Other' },]}
                    onClose={() => this.setState({ isActivityPickerVisbile: false })}
                    onOpen={() => this.setState({ isActivityPickerVisbile: true })}
                    setValue={(callback) => this.setState(state => ({ Activity: callback(state.Activity) }))}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      marginTop: 15,
                      marginBottom: 15
                    }}
                    dropDownDirection="TOP"
                  />

                  {Activity.indexOf("Other") != -1 &&
                    <>
                      <Text style={styles.inputTitle}>{translate('PLEASE ENTER THE ACTIVITY')}</Text><TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        onChangeText={OtherActivity => this.setState({ OtherActivity })}
                        value={OtherActivity} placeholder={translate("Elaborate the activity")}
                        multiline={true} />
                    </>}

                  <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
                    <View
                      style={{
                        flex: 3,
                      }}>
                      <Text style={styles.inputTitle}>
                        {translate("Time in")}:
                      </Text>
                      <Text>
                        {TimeIn.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'flex-end',
                        alignContent: 'center'
                      }}>
                      <FontAwesome5
                        name="edit"
                        size={26}
                        color="#2196f3"
                        onPress={() => {
                          this.setState({
                            isTimeInDatePickerVisible: true,
                          })
                        }}
                        style={{ marginEnd: 15 }}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View
                      style={{
                        flex: 3,
                      }}>
                      <Text style={styles.inputTitle}>
                        {translate("Time Out")}:
                      </Text>
                      <Text>
                        {TimeOut.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'flex-end',
                        alignContent: 'center',
                      }}>
                      <FontAwesome5
                        name="edit"
                        size={26}
                        color="#2196f3"
                        onPress={() => {
                          this.setState({
                            isTimeOutDatePickerVisible: true,
                          })
                        }}
                        style={{ marginEnd: 15 }}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={styles.inputTitle}>
                        {translate("DURATION")}:
                      </Text>
                      <Text>
                        {this.state.Duration}
                      </Text>
                    </View>
                  </View>

                  <DatePicker
                    modal
                    open={this.state.isTimeInDatePickerVisible}
                    mode='datetime'
                    date={TimeIn}
                    minuteInterval={1}
                    locale="en_GB"
                    onConfirm={(date) => {
                      let start = moment(date);
                      let end = moment(TimeOut);
                      let diff = end.diff(start);

                      let duration = moment.utc(diff).format("HH:mm");
                      this.setState({ TimeIn: date, isTimeInDatePickerVisible: false, Duration: duration })
                    }}
                    onCancel={() => {
                      this.setState({
                        isTimeInDatePickerVisible: false,
                      });
                    }}
                    theme='light'
                  />

                  <DatePicker
                    modal
                    open={this.state.isTimeOutDatePickerVisible}
                    mode='datetime'
                    date={TimeOut}
                    minuteInterval={1}
                    locale="en_GB"
                    onConfirm={(date) => {
                      let start = moment(TimeIn);
                      let end = moment(date);
                      let diff = end.diff(start);

                      let duration = moment.utc(diff).format("HH:mm");
                      this.setState({ TimeOut: date, isTimeOutDatePickerVisible: false, Duration: duration })
                    }}
                    onCancel={() => {
                      this.setState({
                        isTimeOutDatePickerVisible: false,
                      });
                    }}
                    theme='light'
                  />

                  {Type == "Home Nursing" &&
                    <>
                      <VitalsInput
                        vital={translate('HEART RATE')}
                        unit={'BPM'}
                        value={HeartRate}
                        onChangeText={HeartRate => this.setState({ HeartRate })} />
                      <VitalsInput
                        vital={translate('SPO2')}
                        unit={'%'}
                        value={SpO2}
                        onChangeText={SpO2 => this.setState({ SpO2 })} />
                      <VitalsInput
                        vital={translate('TEMPERATURE')}
                        unit={'\u00b0C'}
                        value={Temperature}
                        onChangeText={Temperature => this.setState({ Temperature })} />
                      <VitalsInput
                        vital={translate('BLOOD PRESSURE') + " -- " + translate('SYSTOLIC')}
                        unit={'mmHg'}
                        value={Systolic}
                        onChangeText={Systolic => this.setState({ Systolic })} />
                      <VitalsInput
                        vital={translate('BLOOD PRESSURE') + " -- " + translate('DIASTOLIC')}
                        unit={'mmHg'}
                        value={Diastolic}
                        onChangeText={Diastolic => this.setState({ Diastolic })} />
                      <VitalsInput
                        vital={translate('BLOOD GLUCOSE')}
                        unit={'mmol/L'}
                        value={BloodGlucose}
                        onChangeText={BloodGlucose => this.setState({ BloodGlucose })} />
                    </>}

                  <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View
                      style={{
                        flex: 3,
                      }}>
                      <Text style={styles.inputTitle}>
                        {translate('Attachment')}:
                      </Text>
                      <Text>
                        {FileName}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'flex-end',
                        marginBottom: 30
                      }}>
                      <FontAwesome5
                        name="upload"
                        size={26}
                        color="#2196f3"
                        onPress={() => {
                          this.upload()
                        }}
                        style={{ marginEnd: 15 }}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'column', alignItems: "flex-start", marginBottom: 20 }}>
                    <Text style={[styles.inputTitle, { marginBottom: 10, flex: 1, alignItems: 'flex-start' }]}>{translate('REQUIRES FOLLOW-UP')}:</Text>
                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresFollowupData}
                      onPress={(requiresFollowupData) => {
                        this.setState({ requiresFollowupData })
                      }}
                    />
                  </View>

                  <Text style={styles.inputTitle}>{translate('REMARK')}:</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    onChangeText={Remark => this.setState({ Remark })}
                    value={Remark}
                    multiline={true} />
                </View>
              </View>

              <View style={styles.ButtonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={this.handleConfirm}>
                  <Text style={styles.text}>{translate('Submit')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        {loading ? (
          <Spinner
            visible={true}
          // textContent={translate('Updating Case Notes')}
          />)
          :
          <></>}
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => this.setState({ showDialog: false })}
          errorMessage={this.state.errorMessage} />
      </SafeAreaView>
    )
  }
}

const VitalsInput = ({ vital, unit, value, onChangeText }) => {
  return (<>
    <Text style={styles.inputTitle}>{vital} ({unit})</Text>
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <TextInput
        style={{ ...styles.input2, textAlign: 'left' }}
        autoCapitalize="none"
        keyboardType='numeric'
        onChangeText={(val) => onChangeText(val)}
        value={value} />
      {/* <Text style={styles.unit}>{unit}</Text> */}
    </View></>)
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    top: 15,
    marginBottom: 50,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: '#180D59',
  },
  errorMessage: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  form: {
    marginBottom: 48,
    marginHorizontal: 30,
  },
  inputTitle: {
    color: '#2196f3',
    fontSize: 16,
  },
  unit: {
    color: '#180D59',
    flex: 5,
    marginTop: 8,
    marginStart: 15
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 100,
    fontSize: 15,
    color: '#161F3D',
    marginBottom: 20
  },
  input2: {
    width: '100%',
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
    fontSize: 15,
    color: '#161F3D',
    marginBottom: 40,
  },
  text: {
    color: '#FFF',
    fontWeight: '500',
  },
  ImageTop: {
    height: 130,
    width: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    top: 15,
    left: 15,
  },
  ButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: 20,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    width: 150,
  },
});

const mapStateToProps = state => {
  const { main } = state;
  return { loading: main.loading };
};

export default connect(mapStateToProps, { setLoading })(cgAddCaseNote);