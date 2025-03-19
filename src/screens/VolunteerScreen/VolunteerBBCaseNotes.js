import React, { Component } from 'react';
require('../../Firebase');
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
import { Text } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'
import 'firebase/compat/storage'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { connect } from 'react-redux';
import { setLoading } from '../../redux/actions';
import { translate } from '../../../translations';
import { launchImageLibrary } from 'react-native-image-picker';
import moment from 'moment'
import RadioGroup from 'react-native-radio-buttons-group';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { color } from 'react-native-reanimated';

let dbRefCaseNotes;

class VolunteerBBCaseNotes extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
      loading: false,

      Activities: [],
      OtherActivity: '',
      CreatedAt: '',
      TimeIn: new Date(),
      TimeOut: new Date(),
      Duration: '',

      Type: '',
      VisitBy: '',
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

      isTimeInDatePickerVisible: false,
      isTimeOutDatePickerVisible: false,
      isTypePickerVisible: false,
      isActivityPickerVisbile: false,

      FileName: '',
      FilePath: '',
      LocalFileURI: '',

      toggleCheckbox: '',
      newValue: '',
      checked1Array: [],
      checked1: false,


      checked2Array: [],
      checked2: false,

      livingConditionsArray: [],
      medicationsManagementArray: [],
      signsWorseningConditionsArray: [],

      requiresHouseCleanlinessData: [
        {
          id: '1',
          label: translate("Good"),
          selected: false,
          value: translate("House Cleanliness") + " " + translate("Good")
        },
        {
          id: '2',
          label: translate("Not so Good"),
          selected: false,
          value: translate("House Cleanliness") + " " + translate("Not so Good")
        },
        {
          id: '3',
          label: translate("Needs Help"),
          selected: false,
          value: translate("House Cleanliness") + " " + translate("Needs Help")
        },
        {
          id: '4',
          label: translate("Not applicable"),
          selected: false,
          value: translate("House Cleanliness") + " " + translate("Not applicable")
        }
      ],

      requiresFlooringConditionData: [
        {
          id: '1',
          label: translate("Good"),
          selected: false,
          value: translate("Flooring Condition") + " " + translate("Good")
        },
        {
          id: '2',
          label: translate("Not so Good"),
          selected: false,
          value: translate("Flooring Condition") + " " + translate("Not so Good")
        },
        {
          id: '3',
          label: translate("Needs Help"),
          selected: false,
          value: translate("Flooring Condition") + " " + translate("Needs Help")
        },
        {
          id: '4',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Flooring Condition") + " " + translate("Not applicable")
        }
      ],

      requiresHouseLightingData: [
        {
          id: '1',
          label: translate("Good"),
          selected: false,
          value: translate("House Lighting") + " " + translate("Good")
        },
        {
          id: '2',
          label: translate("Not so Good"),
          selected: false,
          value: translate("House Lighting") + " " + translate("Not so Good")
        },
        {
          id: '3',
          label: translate("Needs Help"),
          selected: false,
          value: translate("House Lighting") + " " + translate("Needs Help")
        },
        {
          id: '4',
          label: translate("Not applicable"),
          selected: false,
          value: translate("House Lighting") + " " + translate("Not applicable")
        }
      ],

      requiresTelephoneMobilephoneData: [
        {
          id: '1',
          label: translate("Good"),
          selected: false,
          value: translate("Telephone/Mobile phone condition") + " " + translate("Good")
        },
        {
          id: '2',
          label: translate("Not so Good"),
          selected: false,
          value: translate("Telephone/Mobile phone condition") + " " + translate("Not so Good")
        },
        {
          id: '3',
          label: translate("Needs Help"),
          selected: false,
          value: translate("Telephone/Mobile phone condition") + " " + translate("Needs Help")
        },
        {
          id: '4',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Telephone/Mobile phone condition") + " " + translate("Not applicable")
        }
      ],

      requiresMorningMedicationsData: [
        {
          id: '1',
          label: translate("Taken"),
          selected: false,
          value: translate("Morning Medications") + " " + translate("Taken")
        },
        {
          id: '2',
          label: translate("No/Not sure"),
          selected: false,
          value: translate("Morning Medications") + " " + translate("No/Not sure")
        },
        {
          id: '3',
          label: translate("Ran out"),
          selected: false,
          value: translate("Morning Medications") + " " + translate("Ran out")
        },
        {
          id: '4',
          label: translate("Needs Help"),
          selected: false,
          value: translate("Morning Medications") + " " + translate("Needs Help")
        },
        {
          id: '5',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Morning Medications") + " " + translate("Not applicable")
        }
      ],

      requiresAfternoonMedicationsData: [
        {
          id: '1',
          label: translate("Taken"),
          selected: false,
          value: translate("Afternoon Medications") + " " + translate("Taken")
        },
        {
          id: '2',
          label: translate("No/Not sure"),
          selected: false,
          value: translate("Afternoon Medications") + " " + translate("No/Not sure")
        },
        {
          id: '3',
          label: translate("Ran out"),
          selected: false,
          value: translate("Afternoon Medications") + " " + translate("Ran out")
        },
        {
          id: '4',
          label: translate("Needs Help"),
          selected: false,
          value: translate("Afternoon Medications") + " " + translate("Needs Help")
        },
        {
          id: '5',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Afternoon Medications") + " " + translate("Not applicable")
        }
      ],

      requiresNightMedicationsData: [
        {
          id: '1',
          label: translate("Taken"),
          selected: false,
          value: translate("Night Medications") + " " + translate("Taken")
        },
        {
          id: '2',
          label: translate("No/Not sure"),
          selected: false,
          value: translate("Night Medications") + " " + translate("No/Not sure")
        },
        {
          id: '3',
          label: translate("Ran out"),
          selected: false,
          value: translate("Night Medications") + " " + translate("Ran out")
        },
        {
          id: '4',
          label: translate("Needs Help"),
          selected: false,
          value: translate("Night Medications") + " " + translate("Needs Help")
        },
        {
          id: '5',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Night Medications") + " " + translate("Not applicable")
        }
      ],

      requiresSeemsAgitatedData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Seems agitated") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Seems agitated") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Seems agitated") + " " + translate("Not applicable")
        }
      ],

      requiresConstantRepetitionData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Constant repetition") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Constant repetition") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Constant repetition") + " " + translate("Not applicable")
        }
      ],

      requiresFellRecentlyData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Fell recently") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Fell recently") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Fell recently") + " " + translate("Not applicable")
        }
      ],

      requiresPhysicalWoundsRashesData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Physical wounds / rashes") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Physical wounds / rashes") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Physical wounds / rashes") + " " + translate("Not applicable")
        }
      ],

      requiresLossWeightData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Loss of weight") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Loss of weight") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Loss of weight") + " " + translate("Not applicable")
        }
      ],

      requiresLossAppetiteData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Loss of appetite") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Loss of appetite") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Loss of appetite") + " " + translate("Not applicable")
        }
      ],

      requiresDifficultySwallowingData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Difficulty in swallowing") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Difficulty in swallowing") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Difficulty in swallowing") + " " + translate("Not applicable")
        }
      ],

      requiresDifficultyGettingUpSittingDownData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Difficulty in getting up/sitting down") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Difficulty in getting up/sitting down") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Difficulty in getting up/sitting down") + " " + translate("Not applicable")
        }
      ],

      requiresLongerTimeToiletBathData: [
        {
          id: '1',
          label: translate("Yes/Not Sure"),
          selected: false,
          value: translate("Take longer time to toilet/bath") + " " + translate("Yes/Not Sure")
        },
        {
          id: '2',
          label: translate("No"),
          selected: false,
          value: translate("Take longer time to toilet/bath") + " " + translate("No")
        },
        {
          id: '3',
          label: translate("Not applicable"),
          selected: false,
          value: translate("Take longer time to toilet/bath") + " " + translate("Not applicable")
        }
      ],

      seniorUid: this.props.navigation.state.params.item.data.Elderly,
      id: this.props.navigation.state.params.item.id,
    }

    dbRefCaseNotes = firestore()
      .collection('Users')
      .doc(this.state.seniorUid)
      .collection('CaseNotesHistory')
      .doc(this.state.id);
  }

  componentDidMount() {
    this._isMounted = true;

    dbRefCaseNotes.get().then((scSnapshot) => {
      if (!scSnapshot.empty) {
        // New case note
        try {
          if (scSnapshot.data().caseNote === undefined) {
            const {
              CreatedAt,
              TimeIn,
              Type,
              VisitBy
            } = scSnapshot.data()

            let start = moment(TimeIn, 'MM/DD/YYYY, h:mm:ss a');
            let end = moment();
            let diff = end.diff(start);

            let duration = moment.utc(diff).format("HH:mm");

            this.setState({
              CreatedAt,
              TimeIn: moment(TimeIn, 'MM/DD/YYYY, h:mm:ss a').utc().toDate(),
              Duration: duration,
              Type,
              VisitBy
            })
          }
          else {
            // View / update case note
            const {
              Type,
              Activities,
              OtherActivity,
              Remark,
              TimeIn,
              TimeOut,
              Duration,
              FileName,
              Followup,
              CreatedAt,
              VisitBy
            } = scSnapshot.data().caseNote;

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

            let start = moment(TimeIn, 'MM/DD/YYYY, h:mm:ss a');
            let end = moment(TimeOut, 'MM/DD/YYYY, h:mm:ss a');
            let diff = end.diff(start);

            let duration = moment.duration(end.diff(startTime)).format("HH:mm");

            this.setState({
              Type,
              Activities,
              OtherActivity: OtherActivity === undefined ? "" : OtherActivity,
              Remark,
              TimeIn: moment(TimeIn, 'MM/DD/YYYY, h:mm:ss a').utc().toDate(),
              TimeOut: moment(TimeOut, 'MM/DD/YYYY, h:mm:ss a').utc().toDate(),
              Duration: duration,
              CreatedAt,
              VisitBy,
              FileName
            })
          }
        }
        catch (error) {
          console.log(error)
        }
      }
    })
  }

  setChecked1Array(value) {
    let found = this.state.checked1Array.indexOf(value);
    if (found > -1) {
      this.state.checked1Array.splice(found, 1);
    }
    else {
      this.state.checked1Array.push(value);
    }
  }


  setChecked2Array(value) {
    let found = this.state.checked2Array.indexOf(value);
    if (found > -1) {
      this.state.checked2Array.splice(found, 1);
    }
    else {
      this.state.checked2Array.push(value);
    }
  }

  onSelectedRadioHouseCleanliness(array) {
    for (let i = 0; i < array.requiresHouseCleanlinessData.length; i++) {
      if (array.requiresHouseCleanlinessData[i].selected === true) {
        let found = this.state.livingConditionsArray.findIndex(e => e.HouseCleanliness);
        if (found > -1) {
          this.state.livingConditionsArray.splice(found, 1);
          this.state.livingConditionsArray.splice(found, 0, array.requiresHouseCleanlinessData[i].value);
        }
        else {
          this.state.livingConditionsArray.push(array.requiresHouseCleanlinessData[i].value);
        }
      }
    }
  }

  onSelectedRadioFlooringCondition(array) {
    for (let i = 0; i < array.requiresFlooringConditionData.length; i++) {
      if (array.requiresFlooringConditionData[i].selected === true) {
        let found = this.state.livingConditionsArray.findIndex(e => e.FlooringCondition);
        if (found > -1) {
          this.state.livingConditionsArray.splice(found, 1);
          this.state.livingConditionsArray.splice(found, 0, array.requiresFlooringConditionData[i].value);
        }
        else {
          this.state.livingConditionsArray.push(array.requiresFlooringConditionData[i].value);
        }
      }
    }
  }

  onSelectedRadioHouseLighting(array) {
    for (let i = 0; i < array.requiresHouseLightingData.length; i++) {
      if (array.requiresHouseLightingData[i].selected === true) {
        let found = this.state.livingConditionsArray.findIndex(e => e.HouseLighting);
        if (found > -1) {
          this.state.livingConditionsArray.splice(found, 1);
          this.state.livingConditionsArray.splice(found, 0, array.requiresHouseLightingData[i].value);
        }
        else {
          this.state.livingConditionsArray.push(array.requiresHouseLightingData[i].value);
        }
      }
    }
  }

  onSelectedRadioTelephoneMobilephone(array) {
    for (let i = 0; i < array.requiresTelephoneMobilephoneData.length; i++) {
      if (array.requiresTelephoneMobilephoneData[i].selected === true) {
        let found = this.state.livingConditionsArray.findIndex(e => e.TelephoneMobilephone);
        if (found > -1) {
          this.state.livingConditionsArray.splice(found, 1);
          this.state.livingConditionsArray.splice(found, 0, array.requiresTelephoneMobilephoneData[i].value);
        }
        else {
          this.state.livingConditionsArray.push(array.requiresTelephoneMobilephoneData[i].value);
        }
      }
    }
  }

  onSelectedMorningMedications(array) {
    for (let i = 0; i < array.requiresMorningMedicationsData.length; i++) {
      if (array.requiresMorningMedicationsData[i].selected === true) {
        let found = this.state.medicationsManagementArray.findIndex(e => e.MorningMedications);
        if (found > -1) {
          this.state.medicationsManagementArray.splice(found, 1);
          this.state.medicationsManagementArray.splice(found, 0, array.requiresMorningMedicationsData[i].value);
        }
        else {
          this.state.medicationsManagementArray.push(array.requiresMorningMedicationsData[i].value);
        }
      }
    }
  }
  onSelectedAfternoonMedications(array) {
    for (let i = 0; i < array.requiresAfternoonMedicationsData.length; i++) {
      if (array.requiresAfternoonMedicationsData[i].selected === true) {
        let found = this.state.medicationsManagementArray.findIndex(e => e.AfternoonMedications);
        if (found > -1) {
          this.state.medicationsManagementArray.splice(found, 1);
          this.state.medicationsManagementArray.splice(found, 0, array.requiresAfternoonMedicationsData[i].value);
        }
        else {
          this.state.medicationsManagementArray.push(array.requiresAfternoonMedicationsData[i].value);
        }
      }
    }
  }
  onSelectedNightMedications(array) {
    for (let i = 0; i < array.requiresNightMedicationsData.length; i++) {
      if (array.requiresNightMedicationsData[i].selected === true) {
        let found = this.state.medicationsManagementArray.findIndex(e => e.NightMedications);
        if (found > -1) {
          this.state.medicationsManagementArray.splice(found, 1);
          this.state.medicationsManagementArray.splice(found, 0, array.requiresNightMedicationsData[i].value);
        }
        else {
          this.state.medicationsManagementArray.push(array.requiresNightMedicationsData[i].value);
        }
      }
    }
  }

  onSelectedSeemsAgitated(array) {
    for (let i = 0; i < array.requiresSeemsAgitatedData.length; i++) {
      if (array.requiresSeemsAgitatedData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.SeemsAgitated);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresSeemsAgitatedData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresSeemsAgitatedData[i].value);
        }
      }
    }
  }

  onSelectedConstantRepetition(array) {
    for (let i = 0; i < array.requiresConstantRepetitionData.length; i++) {
      if (array.requiresConstantRepetitionData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.ConstantRepetition);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresConstantRepetitionData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresConstantRepetitionData[i].value);
        }
      }
    }
  }

  onSelectedFellRecently(array) {
    for (let i = 0; i < array.requiresFellRecentlyData.length; i++) {
      if (array.requiresFellRecentlyData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.FellRecently);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresFellRecentlyData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresFellRecentlyData[i].value);
        }
      }
    }
  }

  onSelectedPhysicalWoundsRashes(array) {
    for (let i = 0; i < array.requiresPhysicalWoundsRashesData.length; i++) {
      if (array.requiresPhysicalWoundsRashesData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.PhysicalWoundsRashes);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresPhysicalWoundsRashesData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresPhysicalWoundsRashesData[i].value);
        }
      }
    }
  }

  onSelectedLossWeight(array) {
    for (let i = 0; i < array.requiresLossWeightData.length; i++) {
      if (array.requiresLossWeightData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.LossWeight);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresLossWeightData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresLossWeightData[i].value);
        }
      }
    }
  }

  onSelectedLossAppetite(array) {
    for (let i = 0; i < array.requiresLossAppetiteData.length; i++) {
      if (array.requiresLossAppetiteData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.LossAppetite);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresLossAppetiteData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresLossAppetiteData[i].value);
        }
      }
    }
  }

  onSelectedDifficultySwallowing(array) {
    for (let i = 0; i < array.requiresDifficultySwallowingData.length; i++) {
      if (array.requiresDifficultySwallowingData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.DifficultySwallowing);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresDifficultySwallowingData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresDifficultySwallowingData[i].value);
        }
      }
    }
  }

  onSelectedDifficultyGettingUpSittingDown(array) {
    for (let i = 0; i < array.requiresDifficultyGettingUpSittingDownData.length; i++) {
      if (array.requiresDifficultyGettingUpSittingDownData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.DifficultyGettingUpSittingDown);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresDifficultyGettingUpSittingDownData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresDifficultyGettingUpSittingDownData[i].value);
        }
      }
    }
  }

  onSelectedLongerTimeToiletBath(array) {
    for (let i = 0; i < array.requiresLongerTimeToiletBathData.length; i++) {
      if (array.requiresLongerTimeToiletBathData[i].selected === true) {
        let found = this.state.signsWorseningConditionsArray.findIndex(e => e.LongerTimeToiletBath);
        if (found > -1) {
          this.state.signsWorseningConditionsArray.splice(found, 1);
          this.state.signsWorseningConditionsArray.splice(found, 0, array.requiresLongerTimeToiletBathData[i].value);
        }
        else {
          this.state.signsWorseningConditionsArray.push(array.requiresLongerTimeToiletBathData[i].value);
        }
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handle(caseNote) {
    dbRefCaseNotes = firestore().collection('Users').doc(this.state.seniorUid).collection('CaseNotesHistory')
    dbRefCaseNotes.doc(this.state.id).set(caseNote)
  }

  handleConfirm = async () => {
    this.setState({ loading: true });
    const { Activities, TimeIn, TimeOut, OtherActivity, Remark, VisitBy, Type, CreatedAt, requiresFollowupData, Duration, FileName } = this.state;

    if (Activities.length === 0) {
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
        Remark: Remark,
        TimeIn: TimeIn.toLocaleString(),
        TimeOut: TimeOut.toLocaleString(),
        Activities: Activities,
        OtherActivity: OtherActivity.trim() == '' ? '' : OtherActivity,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
        Type: Type,
        VisitBy: VisitBy,
        Duration: Duration,
        Followup: requiresFollowupData[0].selected,
        Remark: Remark,
        FileName: FileName,
        FilePath: '',
        selfRateMood: this.state.checked1Array,
        livingCondition: this.state.livingConditionsArray,
        medicationsManagement: this.state.medicationsManagementArray,
        signsWorseningConditions: this.state.signsWorseningConditionsArray,
        OtherNeedsIdentified: this.state.checked2Array,

      };

      if (this.state.LocalFileURI != '') {
        const response = await fetch(this.state.LocalFileURI);
        const blob = await response.blob();

        const seniorUid = this.state.seniorUid
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

              this.setState({ loading: false });
              dbRefCaseNotes = firestore()
                .collection('BefriendBuddyDetails')
                .doc(this.state.id)
                .update({ Status: 2 })
                .then(() => {
                  this.navigateBack();
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

        this.setState({ loading: false });
        dbRefCaseNotes = firestore()
          .collection('BefriendBuddyDetails')
          .doc(this.props.navigation.state.params.item.id)
          .update({ Status: 2 })
          .then(() => {
            this.navigateBack();
          });
      }
    }
  };

  navigateBack() {
    this.props.navigation.pop();
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
        alert(res.customButton);
      } else {
        this.setState({ LocalFileURI: res.assets[0].uri });
      }
    });
  }

  render() {
    const {
      Activities,
      OtherActivity,
      requiresFollowupData,
      Type,
      TimeIn,
      TimeOut,
      Remark,
      loading,
      isActivityPickerVisbile,
      FileName,
      requiresHouseCleanlinessData,
      requiresFlooringConditionData,
      requiresHouseLightingData,
      requiresTelephoneMobilephoneData,
      requiresMorningMedicationsData,
      requiresAfternoonMedicationsData,
      requiresNightMedicationsData,
      requiresSeemsAgitatedData,
      requiresConstantRepetitionData,
      requiresFellRecentlyData,
      requiresPhysicalWoundsRashesData,
      requiresLossWeightData,
      requiresLossAppetiteData,
      requiresDifficultySwallowingData,
      requiresDifficultyGettingUpSittingDownData,
      requiresLongerTimeToiletBathData
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
                <View>
                  <Text style={styles.inputTitle}>{translate('ACTIVITY')}</Text>
                  <DropDownPicker
                    open={isActivityPickerVisbile}
                    value={Activities}
                    multiple={true}
                    items={[{ label: 'Art', value: 'Art' },
                    { label: 'Fitness', value: 'Fitness' },
                    { label: 'Drawing', value: 'Drawing' },
                    { label: 'Tidying', value: 'Tidying' },
                    { label: 'Chatting', value: 'Chatting' },
                    { label: 'Other', value: 'Other' },
                    ]}
                    onClose={() => this.setState({ isActivityPickerVisbile: false })}
                    onOpen={() => this.setState({ isActivityPickerVisbile: true })}
                    setValue={(callback) => this.setState(state => ({ Activities: callback(state.Activities) }))}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      marginTop: 15,
                      marginBottom: 15
                    }}
                    dropDownDirection="BOTTOM"
                  />

                  {/* {Activities.indexOf("Other") !== -1 &&
                    <>
                      <Text style={styles.inputTitle}>{translate('Other')}:</Text>
                      <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        onChangeText={OtherActivity => this.setState({ OtherActivity })}
                        value={OtherActivity}
                        placeholder={translate("Elaborate the activity")}
                        multiline={true}
                      />
                    </>} */}

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
                      let start = moment(date);
                      let end = moment(TimeOut);
                      let diff = end.diff(start);

                      let duration = moment.utc(diff).format("HH:mm");
                      this.setState({ TimeOut: date, isTimeInDatePickerVisible: false, Duration: duration })
                    }}
                    onCancel={() => {
                      this.setState({
                        isTimeOutDatePickerVisible: false,
                      });
                    }}
                    theme='light'
                  />

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

                  <View style={{ flexDirection: 'column', alignItems: "flex-start", marginBottom: 20 }}>
                    <Text style={[styles.inputTitle, { marginBottom: 10, flex: 1, alignItems: 'flex-start', textDecorationLine: 'underline', fontWeight: 'bold' }]}>
                      {translate('Client/Caregiver self-rate mood (Choose whichever appropriate)')}
                    </Text>
                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Happy')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('Happy'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('In Pain/Teary')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('In Pain/Teary'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Angry')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('Angry'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Confused')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('Confused'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Anxious')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('Anxious'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Suicidal ldeas')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('Suicidal ldeas'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Depressed')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('Depressed'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Other')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked1}
                      onPress={() => this.setChecked1Array(translate('Other'))} />

                  </View>

                  <View style={{ flexDirection: 'column', alignItems: "flex-start", marginBottom: 20 }}>
                    <Text style={[styles.inputTitle, { marginBottom: 10, flex: 1, alignItems: 'flex-start', textDecorationLine: 'underline', fontWeight: 'bold' }]}>
                      {translate('Living Conditions (Choose whichever appropriate)')}
                    </Text>

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('House Cleanliness')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresHouseCleanlinessData}
                      onPress={(requiresHouseCleanlinessData) => {
                        this.onSelectedRadioHouseCleanliness({ requiresHouseCleanlinessData })
                      }}
                    />
                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Flooring Condition')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresFlooringConditionData}
                      onPress={(requiresFlooringConditionData) => {
                        this.onSelectedRadioFlooringCondition({ requiresFlooringConditionData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('House Lighting')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresHouseLightingData}
                      onPress={(requiresHouseLightingData) => {
                        this.onSelectedRadioHouseLighting({ requiresHouseLightingData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Telephone/Mobile phone condition')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresTelephoneMobilephoneData}
                      onPress={(requiresTelephoneMobilephoneData) => {
                        this.onSelectedRadioTelephoneMobilephone({ requiresTelephoneMobilephoneData })
                      }}
                    />
                  </View>

                  <View style={{ flexDirection: 'column', alignItems: "flex-start", marginBottom: 20 }}>
                    <Text style={[styles.inputTitle, { marginBottom: 10, flex: 1, alignItems: 'flex-start', textDecorationLine: 'underline', fontWeight: 'bold' }]}>
                      {translate('Medications Management (Choose whichever appropriate)')}
                    </Text>

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Morning Medications')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresMorningMedicationsData}
                      onPress={(requiresMorningMedicationsData) => {
                        this.onSelectedMorningMedications({ requiresMorningMedicationsData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Afternoon Medications')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresAfternoonMedicationsData}
                      onPress={(requiresAfternoonMedicationsData) => {
                        this.onSelectedAfternoonMedications({ requiresAfternoonMedicationsData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Night Medications')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresNightMedicationsData}
                      onPress={(requiresNightMedicationsData) => {
                        this.onSelectedNightMedications({ requiresNightMedicationsData })
                      }}
                    />
                  </View>

                  <View style={{ flexDirection: 'column', alignItems: "flex-start", marginBottom: 20 }}>
                    <Text style={[styles.inputTitle, { marginBottom: 10, flex: 1, alignItems: 'flex-start', textDecorationLine: 'underline', fontWeight: 'bold' }]}>
                      {translate('Signs of worsening conditions (Choose whichever appropriate)')}
                    </Text>

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Seems agitated')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresSeemsAgitatedData}
                      onPress={(requiresSeemsAgitatedData) => {
                        this.onSelectedSeemsAgitated({ requiresSeemsAgitatedData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Constant repetition')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresConstantRepetitionData}
                      onPress={(requiresConstantRepetitionData) => {
                        this.onSelectedConstantRepetition({ requiresConstantRepetitionData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Fell recently')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresFellRecentlyData}
                      onPress={(requiresFellRecentlyData) => {
                        this.onSelectedFellRecently({ requiresFellRecentlyData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Physical wounds / rashes')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresPhysicalWoundsRashesData}
                      onPress={(requiresPhysicalWoundsRashesData) => {
                        this.onSelectedPhysicalWoundsRashes({ requiresPhysicalWoundsRashesData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Loss of weight')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresLossWeightData}
                      onPress={(requiresLossWeightData) => {
                        this.onSelectedLossWeight({ requiresLossWeightData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Loss of appetite')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresLossAppetiteData}
                      onPress={(requiresLossAppetiteData) => {
                        this.onSelectedLossAppetite({ requiresLossAppetiteData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Difficulty in swallowing')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresDifficultySwallowingData}
                      onPress={(requiresDifficultySwallowingData) => {
                        this.onSelectedDifficultySwallowing({ requiresDifficultySwallowingData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Difficulty in getting up/sitting down')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresDifficultyGettingUpSittingDownData}
                      onPress={(requiresDifficultyGettingUpSittingDownData) => {
                        this.onSelectedDifficultyGettingUpSittingDown({ requiresDifficultyGettingUpSittingDownData })
                      }}
                    />

                    <Text style={[styles.inputTitle, { marginBottom: 5, flex: 1, alignItems: 'flex-start' }]}>
                      {translate('Take longer time to toilet/bath')}
                    </Text>

                    <RadioGroup
                      containerStyle={{ marginBottom: 20, alignItems: 'flex-start' }}
                      radioButtons={requiresLongerTimeToiletBathData}
                      onPress={(requiresLongerTimeToiletBathData) => {
                        this.onSelectedLongerTimeToiletBath({ requiresLongerTimeToiletBathData })
                      }}
                    />
                  </View>

                  <View style={{ flexDirection: 'column', alignItems: "flex-start", marginBottom: 30 }}>
                    <Text style={[styles.inputTitle, { marginBottom: 10, flex: 1, alignItems: 'flex-start', textDecorationLine: 'underline', fontWeight: 'bold' }]}>
                      {translate('Other needs identified (Choose whichever appropriate)')}
                    </Text>
                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Escort services')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Escort services'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Meals Delivery/ food ration')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Meals Delivery/ food ration'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Financial Help/ Utilities Arrears')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Financial Help/ Utilities Arrears'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Medical Consumables/ Non-consumables')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Medical Consumables/ Non-consumables'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Social Interaction/ Activities')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Social Interaction/ Activities'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Mobility Equipment')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Mobility Equipment'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Caregiver Respite')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Caregiver Respite'))} />

                    <BouncyCheckbox
                      size={25}
                      innerIconStyle={{ borderRadius: 0 }}
                      fillColor="#000000"
                      unfillColor="#ffffff"
                      text={translate('Other')}
                      textStyle={{ textDecorationLine: "none", color: "black", marginBottom: 8 }}
                      isChecked={this.state.checked2}
                      onPress={() => this.setChecked2Array(translate('Other'))} />
                  </View>


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
                        this.setState(requiresFollowupData)
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
            textContent={'Updating Case Notes...'}
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
  return (<><Text style={styles.inputTitle}>{vital}</Text><View style={{ flexDirection: 'row', flex: 1 }}>
    <TextInput
      style={{ ...styles.input, textAlign: 'center' }}
      autoCapitalize="none"
      keyboardType='numeric'
      onChangeText={() => onChangeText()}
      value={value} />
    <Text style={styles.unit}>{unit}</Text>
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

export default connect(mapStateToProps, { setLoading })(VolunteerBBCaseNotes);