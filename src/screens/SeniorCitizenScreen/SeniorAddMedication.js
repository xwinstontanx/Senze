import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Text } from 'native-base';
import { mainStyles } from '../../styles/styles';
import Spinner from 'react-native-loading-spinner-overlay';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setLoading } from '../../redux/actions';

import DatePicker from 'react-native-date-picker'
import { translate } from '../../../translations';

let dbRefUser;
let dbRefSingpass;

class SeniorAddMedicationScreen extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      showDialog: false,
      loading: false,

      MedicineName: '',
      Reminder1: new Date(),
      Reminder2: new Date(),
      Dosage: '1',
      Unit: 'Tablet(s)',
      NumberOfTime: '1',
      Meal: true,

      isFirstDatePickerVisible: false,
      setFirstDatePickerVisibility: false,

      showSecondReminder: false,
      isSecondDatePickerVisible: false,
      setSecondDatePickerVisibility: false,

      isUnitPickerVisible: false,
      isMealPickerVisbile: false,
    }
  }

  componentDidMount() {
    this._isMounted = true;
    time = this.state.Reminder1
    time.setMinutes(0);
    this.setState({ Reminder1: time, Reminder2: time });
    if (this.props.navigation.state.params != null) {
      id = this.props.navigation.state.params.id
      this.setState({ loading: true });


      firestore().collection('Medication').doc(id).get().then((medication) => {
        const { MedicineName, Dosage, Unit, NumberOfTime, Meal } = medication.data();
        const firstReminder = medication.data().Reminder1.split(':');
        const Reminder1 = new Date();
        Reminder1.setHours(parseInt(firstReminder[0]))
        Reminder1.setMinutes(parseInt(firstReminder[1]))

        const secondReminder = medication.data().Reminder2.split(':');

        if (secondReminder.length == 2) {
          const Reminder2 = new Date();
          Reminder2.setHours(parseInt(secondReminder[0]))
          Reminder2.setMinutes(parseInt(secondReminder[1]))
          this.setState({ Reminder2, showSecondReminder: true })
        }

        this.setState({
          MedicineName,
          Dosage: Dosage.toString(),
          Unit,
          NumberOfTime: NumberOfTime.toString(),
          Meal,
          Reminder1,
        })
      })
        .finally(() => this.setState({ loading: false }))
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async handle(medication) {
    const id = this.props.navigation.state.params.id
    id != null
      ? firestore().collection('Medication').doc(id).update(medication)
      : firestore().collection('Medication').add({ ...medication, CreatedAt: firestore.FieldValue.serverTimestamp() })
  }

  handleConfirm = () => {
    this.setState({ loading: true });
    const { MedicineName, Reminder1, Reminder2, Dosage, Unit, NumberOfTime, Meal, showSecondReminder } = this.state;

    if (MedicineName.trim()) {
      const medication = {
        CreatedBy: auth().currentUser.uid,
        UpdatedAt: firestore.FieldValue.serverTimestamp(),
        MedicineName: MedicineName,
        Reminder1: this.convertDateObjectToTimeString(Reminder1),
        Reminder2: showSecondReminder ? this.convertDateObjectToTimeString(Reminder2) : '',
        Dosage: parseInt(Dosage),
        Unit: Unit,
        NumberOfTime: parseInt(NumberOfTime),
        Meal: Meal,
      };

      this.handle(medication)
        .then(() => {
          this.navigateBack();
        })
        .catch(error => {
          this.setState({
            errorMessage: error.message,
            showDialog: true,
          });
        })
    } else {
      this.setState({ loading: false });
      this.setState({
        errorMessage: translate("ENTER A NAME FOR YOUR MEDICATION"),
        showDialog: true,
      });
    }
  };

  navigateBack() {
    this.props.navigation.state.params.refreshList();
    this.props.navigation.goBack();
  }

  showFirstDatePicker = () => {
    this.setState({
      isFirstDatePickerVisible: true,
    });
  };

  hideFirstDatePicker = () => {
    this.setState({
      isFirstDatePickerVisible: false,
    });
  };

  handleConfirmFirstReminder = Reminder1 => {
    this.setState({ Reminder1 }),
      this.hideFirstDatePicker();
  };

  showSecondDatePicker = () => {
    this.setState({
      isSecondDatePickerVisible: true,
    });
  };

  hideSecondDatePicker = () => {
    this.setState({
      isSecondDatePickerVisible: false,
    });
  };

  handleConfirmSecondReminder = Reminder2 => {
    this.setState({ Reminder2 }),
      this.hideSecondDatePicker();
  };

  convertDateObjectToTimeString(date) {
    return this.pad(date.getHours()) + ':' + this.pad(date.getMinutes());
  }

  pad(t) {
    // To display time properly when it ends with zeros
    var st = "" + t;

    while (st.length < 2)
      st = "0" + st;

    return st;
  }

  render() {
    const {
      MedicineName,
      Reminder1,
      Reminder2,
      Dosage,
      Unit,
      NumberOfTime,
      Meal,
      loading,
      isUnitPickerVisible,
      isMealPickerVisbile,
      showSecondReminder,
    } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ backgroundColor: '#FFFFFF' }}>
          <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
            <View style={styles.container}>
              <Text style={styles.greeting}>{translate('ADD MEDICATION')}</Text>
              <TouchableOpacity
                style={styles.back}
                onPress={() => this.navigateBack()}>
                <Icon name="arrow-circle-left" size={40} color="#2196f3" />
              </TouchableOpacity>
              <View style={styles.form}>
                <View >
                  <Text style={styles.inputTitle}>{translate('MEDICINE NAME')}</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    onChangeText={MedicineName => this.setState({ MedicineName })}
                    value={MedicineName}
                  />
                  <Text style={styles.inputTitle}>{translate('DOSAGE')}</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType='numeric'
                    onChangeText={Dosage => this.setState({ Dosage })}
                    value={Dosage}
                  />

                  <Text style={styles.inputTitle}>{translate('UNIT')}</Text>
                  <DropDownPicker
                    open={isUnitPickerVisible}
                    value={Unit}
                    items={[{ label: translate('TABLET(S)'), value: 'Tablet(s)' }, { label: 'ml', value: 'ml' }]}
                    onClose={() => this.setState({ isUnitPickerVisible: false })}
                    onOpen={() => this.setState({ isUnitPickerVisible: true })}
                    setValue={(callback) => this.setState(state => ({ Unit: callback(state.Unit) }))}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      marginTop: 15,
                      marginBottom: 15
                    }}
                    dropDownDirection="TOP"
                  />
                  <Text style={styles.inputTitle}>{translate('NUMBER OF TIME(S) / DAY')}</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType='numeric'
                    onChangeText={NumberOfTime => this.setState({ NumberOfTime })}
                    value={NumberOfTime}
                  />

                  <DropDownPicker
                    open={isMealPickerVisbile}
                    value={Meal}
                    items={[{ label: translate('BEFORE MEAL'), value: true }, { label: translate('AFTER MEAL'), value: false }]}
                    onClose={() => this.setState({ isMealPickerVisbile: false })}
                    onOpen={() => this.setState({ isMealPickerVisbile: true })}
                    setValue={(callback) => this.setState(state => ({ Meal: callback(state.Meal) }))}
                    listMode="SCROLLVIEW"
                    style={{
                      backgroundColor: '#FFFFFF',
                      marginBottom: 30
                    }}
                    dropDownDirection="TOP"
                  />

                </View>

                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={{
                      flex: 3,
                    }}>
                    <Text style={styles.inputTitle}>
                      {translate('FIRST REMINDER AT')} {this.convertDateObjectToTimeString(Reminder1)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: 'center',
                    }}>
                    <FontAwesome5
                      name="edit"
                      size={26}
                      color="#2196f3"
                      onPress={this.showFirstDatePicker}
                      style={{ marginEnd: 15 }}
                    />
                  </View>

                  <DatePicker
                    modal
                    open={this.state.isFirstDatePickerVisible}
                    mode='time'
                    date={Reminder1}
                    minuteInterval={30}
                    locale="en_GB"
                    onConfirm={(date) => {
                      this.handleConfirmFirstReminder(date)
                    }}
                    onCancel={() => {
                      this.hideFirstDatePicker()
                    }}
                    theme='light'
                  />
                </View>

                {showSecondReminder
                  ? (<View style={{ flexDirection: 'row', marginTop: 30 }}>
                    <View
                      style={{
                        flex: 3,
                      }}>
                      <Text style={styles.inputTitle}>
                        {translate('SECOND REMINDER AT')} {this.convertDateObjectToTimeString(Reminder2)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 0.5,
                        alignItems: 'center',
                        flexDirection: 'row'
                      }}>
                      <FontAwesome5
                        name="edit"
                        size={26}
                        color="#2196f3"
                        onPress={this.showSecondDatePicker}
                        style={{ marginEnd: 15 }}
                      />
                      <FontAwesome5
                        name="trash-alt"
                        size={26}
                        color="#2196f3"
                        onPress={() => this.setState({ showSecondReminder: false })}
                      />
                    </View>

                    <DatePicker
                      modal
                      open={this.state.isSecondDatePickerVisible}
                      mode='time'
                      date={Reminder2}
                      minuteInterval={30}
                      locale="en_GB"
                      onConfirm={(date) => {
                        this.handleConfirmSecondReminder(date)
                      }}
                      onCancel={() => {
                        this.hideSecondDatePicker()
                      }}
                      theme='light'
                    />
                  </View>)
                  : (
                    <FontAwesome5
                      name="plus"
                      size={26}
                      color="#2196f3"
                      onPress={() => this.setState({ showSecondReminder: true })}
                      style={{ alignSelf: 'center', marginTop: 30 }}
                    />
                  )}
              </View>
              <View style={styles.ButtonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={this.handleConfirm}>
                  <Text style={styles.text}>{translate('CONFIRM')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        {loading && (
          <Spinner
            visible={true}
            textContent={translate('UPDATING MEDICATIONS') + '...'}
            textStyle={mainStyles.spinnerTextStyle}
          />)}
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => this.setState({ showDialog: false })}
          errorMessage={this.state.errorMessage} />
      </SafeAreaView>
    )
  }
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
    color: '#180D59',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 50,
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

export default connect(mapStateToProps, { setLoading })(SeniorAddMedicationScreen);