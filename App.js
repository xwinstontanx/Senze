import React from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import * as Sentry from '@sentry/react-native';
import {
  StackActions,
  createSwitchNavigator,
  createAppContainer,
} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

// Redux
import { connect } from 'react-redux';

// Badges
import { Text, View, StyleSheet, SafeAreaView } from 'react-native';
import IconBadge from 'react-native-icon-badge';

// Localisation
import * as RNLocalize from "react-native-localize";
import { getLanguage, setI18nConfig } from './translations';
import i18n from "i18n-js";

// Common Screens
import LoadingScreen from './src/screens/LoadingScreen';

// Login Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import GymRegisterScreen from './src/screens/GymRegisterScreen';
import ForgetpwScreen from './src/screens/ForgetpwScreen';

// Senior Citizen
import SeniorHomeScreen from './src/screens/SeniorCitizenScreen/SeniorHomeScreen';
import BLE from './src/screens/SeniorCitizenScreen/BluetoothManager';
import SeniorActivities from './src/screens/SeniorCitizenScreen/SeniorActivities';
import SeniorHealthData from './src/screens/SeniorCitizenScreen/SeniorHealthData';
import SeniorHistory from './src/screens/SeniorCitizenScreen/Graphs/SeniorHistory';
import SeniorNewReading from './src/screens/SeniorCitizenScreen/SeniorNewReading';
import SeniorSettingscreen from './src/screens/SeniorCitizenScreen/SeniorSettings';
import SeniorProfileSetting from './src/screens/SeniorCitizenScreen/SeniorProfileSetting';
import SeniorNotificationSetting from './src/screens/SeniorCitizenScreen/SeniorNotificationSetting';
import SeniorHealthSetting from './src/screens/SeniorCitizenScreen/SeniorHealthSetting';
import SeniorQR from './src/screens/SeniorCitizenScreen/SeniorQR';
import SeniorCaregiver from './src/screens/SeniorCitizenScreen/SeniorCaregiver';
import SeniorVitalsReadings from './src/screens/SeniorCitizenScreen/SeniorVitalsReadings';
import SeniorBloodPressureW from './src/screens/SeniorCitizenScreen/SeniorBloodPressureW';
import SeniorBloodGlucose from './src/screens/SeniorCitizenScreen/SeniorBloodGlucose';
import SeniorWeight from './src/screens/SeniorCitizenScreen/SeniorWeight';
import SeniorHeight from './src/screens/SeniorCitizenScreen/SeniorHeight';
import SeniorBloodPressure from './src/screens/SeniorCitizenScreen/SeniorBloodPressure';

import SeniorHeartRateHistory from './src/screens/SeniorCitizenScreen/Graphs/HeartRate';
import SeniorSpo2History from './src/screens/SeniorCitizenScreen/Graphs/Spo2';
import SeniorTemperatureHistory from './src/screens/SeniorCitizenScreen/Graphs/Temperature';
import SeniorBloodPressureHistory from './src/screens/SeniorCitizenScreen/Graphs/BloodPressure';
import SeniorBloodGlucoseHistory from './src/screens/SeniorCitizenScreen/Graphs/BloodGlucose';
import SeniorWeightHistory from './src/screens/SeniorCitizenScreen/Graphs/Weight';
import SeniorCheckInHistory from './src/screens/SeniorCitizenScreen/Graphs/CheckIn';

// Caregiver
import cgHome from './src/screens/caregivers/cgHome';
import cgProfile from './src/screens/caregivers/cgProfile';
import cgAlerts from './src/screens/caregivers/cgAlerts';
import cgSettings from './src/screens/caregivers/cgSettings';
import cgSeniorDetails from './src/screens/caregivers/cgSeniorDetails';
import cgSeniorHistory from './src/screens/caregivers/Graphs/cgSeniorHistory';
import cgSeniorVitalsHistory from './src/screens/caregivers/Graphs/cgSeniorVitalsHistory';
import cgAddOtherDevices from './src/screens/caregivers/cgAddOtherDevices';
import cgAddSeniorBloodPressureW from './src/screens/caregivers/cgAddSeniorBloodPressureW';
import cgSeniorSettings from './src/screens/caregivers/cgSeniorSettings';
import cgMedications from './src/screens/caregivers/cgMedications';
import cgAddMedication from './src/screens/caregivers/cgAddMedication';

// Volunteer
import VolunteerHome from './src/screens/VolunteerScreen/VolunteerHome';
import VolunteerEvents from './src/screens/VolunteerScreen/VolunteerEvents';
import VolunteerAlerts from './src/screens/VolunteerScreen/VolunteerAlerts';
import VolnteerProfile from './src/screens/VolunteerScreen/VolunteerProfile';
import VolunteerSettings from './src/screens/VolunteerScreen/VolunteerSettings';
import VolunteerDetails from './src/screens/VolunteerScreen/VolunteerDetails';
import VolunteerQR from './src/screens/VolunteerScreen/VolunteerQR';
import VolunteerQRScanner from './src/screens/VolunteerScreen/VolunteerQRScanner';

// Gym
import GymHome from './src/screens/GymScreen/GymHome';
import GymProfile from './src/screens/GymScreen/GymProfile';
import GymSettings from './src/screens/GymScreen/GymSettings';

//HealthCheck
import HealthCheckHome from './src/screens/HealthCheckScreen/HealthCheckHome';
import HealthCheckData from './src/screens/HealthCheckScreen/HealthCheckData';
import HealthCheckSettings from './src/screens/HealthCheckScreen/HealthCheckSettings';
import HealthCheckBloodPressureW from './src/screens/HealthCheckScreen/HealthCheckBloodPressureW';
import HealthCheckWeight from './src/screens/HealthCheckScreen/HealthCheckWeight';
import HealthCheckHeight from './src/screens/HealthCheckScreen/HealthCheckHeight';
import HealthCheckBloodGlucose from './src/screens/HealthCheckScreen/HealthCheckBloodGlucose';
import HealthCheckVitals from './src/screens/HealthCheckScreen/HealthCheckVitals';

import { LogBox } from 'react-native';
import cgSeniorTemperature from './src/screens/caregivers/Graphs/cgSeniorTemperature';
import cgSeniorHeartRate from './src/screens/caregivers/Graphs/cgSeniorHeartRate';
import cgSeniorSpo2 from './src/screens/caregivers/Graphs/cgSeniorSpo2';
import cgSeniorWeight from './src/screens/caregivers/Graphs/cgSeniorWeight';
import cgSeniorCheckIn from './src/screens/caregivers/Graphs/cgSeniorCheckIn';
import cgSeniorBloodGlucose from './src/screens/caregivers/Graphs/cgSeniorBloodGlucose';
import cgSeniorBloodPressure from './src/screens/caregivers/Graphs/cgSeniorBloodPressure';

import SeniorMedications from './src/screens/SeniorCitizenScreen/SeniorMedications';
import SeniorAddMedication from './src/screens/SeniorCitizenScreen/SeniorAddMedication';
import cgAddSeniorBloodGlucose from './src/screens/caregivers/cgAddSeniorBloodGlucose';
import cgAddSeniorWeight from './src/screens/caregivers/cgAddSeniorWeight';
import cgAddSenioVitalsReadings from './src/screens/caregivers/cgAddSeniorVitalsReadings';
import { fetchUpcomingActivities } from './src/redux/actions';
import cgCaseNotes from './src/screens/caregivers/cgCaseNotes';
import cgChat from './src/screens/caregivers/cgChat';
import cgAddCaseNote from './src/screens/caregivers/cgAddCaseNote';
import VolunteerBBCaseNotes from './src/screens/VolunteerScreen/VolunteerBBCaseNotes';


LogBox.ignoreLogs(['NativeEventEmitter']);
LogBox.ignoreLogs(['EventEmitter.removeListener']);
LogBox.ignoreLogs(['Require cycle:']);

Sentry.init({
  dsn: 'https://711899e7ca1d4881817fff5836a4e974@o861643.ingest.sentry.io/5823168',
});

const SettingStack = createStackNavigator({
  seniorSettingScreen: {
    screen: SeniorSettingscreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorCaregiver: {
    screen: SeniorCaregiver,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorQR: {
    screen: SeniorQR,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorProfileSetting: {
    screen: SeniorProfileSetting,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorNotificationSetting: {
    screen: SeniorNotificationSetting,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorHealthVitalsSetting: {
    screen: SeniorHealthSetting,
    navigationOptions: {
      headerShown: false,
    },
  },
  loginScreen: {
    screen: LoginScreen,
    navigationOptions: {
      headerShown: false,
    },
  }
});

const SeniorMedicationsStack = createStackNavigator({
  seniorMedications: {
    screen: SeniorMedications,
    navigationOptions: {
      headerShown: false,
    }
  },
  seniorAddMedication: {
    screen: SeniorAddMedication,
    navigationOptions: {
      headerShown: false,
    }
  }
});

const HomeStack = createStackNavigator({
  seniorHomeScreen: {
    screen: SeniorHomeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorHistory: {
    screen: SeniorHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorNewReading: {
    screen: SeniorNewReading,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorHeartRateHistory: {
    screen: SeniorHeartRateHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorSpo2History: {
    screen: SeniorSpo2History,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorTemperatureHistory: {
    screen: SeniorTemperatureHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorBloodPressureHistory: {
    screen: SeniorBloodPressureHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorBloodGlucoseHistory: {
    screen: SeniorBloodGlucoseHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorWeightHistory: {
    screen: SeniorWeightHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorCheckInHistory: {
    screen: SeniorCheckInHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorVitalsReadings: {
    screen: SeniorVitalsReadings,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorBloodPressureW: {
    screen: SeniorBloodPressureW,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorBloodPressure: {
    screen: SeniorBloodPressure,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorBloodGlucose: {
    screen: SeniorBloodGlucose,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorWeight: {
    screen: SeniorWeight,
    navigationOptions: {
      headerShown: false,
    },
  },
  seniorHeight: {
    screen: SeniorHeight,
    navigationOptions: {
      headerShown: false,
    },
  },
});

const SeniorTabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('HOME'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="home" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        tabBarBadge: 3
      }),
    },
    Activities: {
      screen: SeniorActivities,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('ACTIVITIES'),
        tabBarIcon: ({ tintColor }) => (
          <IconBadge
            MainElement={
              <FontAwesome5 name="calendar-week" size={23} color={tintColor} style={styles.icon} />
            }
            BadgeElement={
              <Text style={{ color: '#FFFFFF', fontSize: 10, paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4 }}>{screenProps.numUpcomingActivities}</Text>
            }
            IconBadgeStyle={styles.badge}
            Hidden={screenProps.numUpcomingActivities == 0}
          />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
    Medications: {
      screen: SeniorMedicationsStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('MEDICATIONS'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="pills" size={23} color={tintColor} style={styles.icon} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
    // Data: {
    //   screen: SeniorHealthData,
    //   navigationOptions: {
    //     tabBarIcon: ({tintColor}) => (
    //       <FontAwesome5 name="hand-holding-heart" size={23} color={tintColor} />
    //     ),
    //     tabBarOnPress: ({navigation, defaultHandler}) => {
    //       navigation.dispatch(StackActions.popToTop());
    //       defaultHandler();
    //     },
    //   },
    // },
    // History: {
    //   screen: SeniorHistory,
    //   navigationOptions: {
    //     tabBarIcon: ({tintColor}) => (
    //       <FontAwesome5 name="history" size={23} color={tintColor} />
    //     ),
    //     tabBarOnPress: ({navigation, defaultHandler}) => {
    //       navigation.dispatch(StackActions.popToTop());
    //       defaultHandler();
    //     },
    //   },
    // },
    Settings: {
      screen: SettingStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('SETTINGS'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="user-cog" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
      }),
    },
  },
  {
    screenOptions: {
      activeTintColor: '#fff',
      inactiveTintColor: '#2196f3',
      showLabel: false,
      // labelPosition: 'below-icon',
      activeBackgroundColor: '#2196f3',
    },
  },
);

const VolunteerSettingStack = createStackNavigator({
  volunteersettings: {
    screen: VolunteerSettings,
    navigationOptions: {
      headerShown: false,
    },
  },
  volunteerprofile: {
    screen: VolnteerProfile,
    navigationOptions: {
      headerShown: false,
    },
  },
  volunteerqr: {
    screen: VolunteerQR,
    navigationOptions: {
      headerShown: false,
    },
  },
});

const VolunteerEventsStack = createStackNavigator({
  volunteerEvents: {
    screen: VolunteerEvents,
    navigationOptions: {
      headerShown: false,
    },
  },
  volunteerdetails: {
    screen: VolunteerDetails,
    navigationOptions: {
      headerShown: false,
    },
  },
  volunteerqrscanner: {
    screen: VolunteerQRScanner,
    navigationOptions: {
      headerShown: false,
    },
  },
  volunteerbbcasenotes: {
    screen: VolunteerBBCaseNotes,
    navigationOptions: {
      headerShown: false,
    },
  }
});

const VolunteerTabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: VolunteerHome,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('HOME'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="home" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
    Events: {
      screen: VolunteerEventsStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('EVENTS'),
        tabBarIcon: ({ tintColor }) => (
          <IconBadge
            MainElement={
              <FontAwesome5 name="calendar-week" size={23} color={tintColor} style={styles.icon} />
            }
            BadgeElement={
              <Text style={{ color: '#FFFFFF', fontSize: 10, paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4 }}>{screenProps.numUpcomingActivities}</Text>
            }
            IconBadgeStyle={styles.badge}
            Hidden={screenProps.numUpcomingActivities == 0}
          />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
    Alerts: {
      screen: VolunteerAlerts,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('ALERTS'),
        tabBarIcon: ({ tintColor }) => (
          <IconBadge
            MainElement={
              <FontAwesome5 name="bell" size={23} color={tintColor} style={styles.icon} />
            }
            BadgeElement={
              <Text style={{ color: '#FFFFFF', fontSize: 10, paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4 }}>{screenProps.numAlerts}</Text>
            }
            IconBadgeStyle={styles.badge}
            Hidden={screenProps.numAlerts == 0}
          />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
    Settings: {
      screen: VolunteerSettingStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('SETTINGS'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="user-cog" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
  },
  {
    screenOptions: {
      activeTintColor: '#fff',
      inactiveTintColor: '#2196f3',
      showLabel: false,
      // labelPosition: 'below-icon',
      activeBackgroundColor: '#2196f3',
    },
  },
);

const cgSettingStack = createStackNavigator({
  cgSettingScreen: {
    screen: cgSettings,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgProfileSetting: {
    screen: cgProfile,
    navigationOptions: {
      headerShown: false,
    },
  },
});

const cgSeniorSettingStack = createStackNavigator({
  cghome: {
    screen: cgHome,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniordetails: {
    screen: cgSeniorDetails,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgmedications: {
    screen: cgMedications,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgaddmedication: {
    screen: cgAddMedication,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgchat: {
    screen: cgChat,
    navigationOptions: {
      headerShown: false,
      
    }
  },
  cgcasenotes: {
    screen: cgCaseNotes,
    navigationOptions: {
      headerShown: false,
    }
  },
  cgaddcasenote: {
    screen: cgAddCaseNote,
    navigationOptions: {
      headerShown: false,
    }
  },
  cgseniorhistory: {
    screen: cgSeniorHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorvitalshistory: {
    screen: cgSeniorVitalsHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgaddotherdevices: {
    screen: cgAddOtherDevices,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgaddseniorbloodpressurew: {
    screen: cgAddSeniorBloodPressureW,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgaddseniorbloodglucose: {
    screen: cgAddSeniorBloodGlucose,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgaddseniorvitalsreadings: {
    screen: cgAddSenioVitalsReadings,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgaddseniorweight: {
    screen: cgAddSeniorWeight,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniortemperature: {
    screen: cgSeniorTemperature,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorheartrate: {
    screen: cgSeniorHeartRate,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorspo2: {
    screen: cgSeniorSpo2,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorbloodpressure: {
    screen: cgSeniorBloodPressure,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorbloodglucose: {
    screen: cgSeniorBloodGlucose,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorweight: {
    screen: cgSeniorWeight,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorcheckin: {
    screen: cgSeniorCheckIn,
    navigationOptions: {
      headerShown: false,
    },
  },
  cgseniorsetting: {
    screen: cgSeniorSettings,
    navigationOptions: {
      headerShown: false,
    },
  },
});

const CaregiverTabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: cgSeniorSettingStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('HOME'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="home" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
      }),
    },
    Alerts: {
      screen: cgAlerts,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('ALERTS'),
        tabBarIcon: ({ tintColor }) => (
          <IconBadge
            MainElement={
              <FontAwesome5 name="bell" size={23} color={tintColor} style={styles.icon} />
            }
            BadgeElement={
              <Text style={{ color: '#FFFFFF', fontSize: 10, paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4 }}>{screenProps.numAlerts}</Text>
            }
            IconBadgeStyle={styles.badge}
            Hidden={screenProps.numAlerts == 0}
          />

        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
      }),
    },
    Settings: {
      // screen: cgProfile,
      screen: cgSettingStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('SETTINGS'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="user-cog" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
      }),
    },
  },
  {
    screenOptions: {
      activeTintColor: '#fff',
      inactiveTintColor: '#2196f3',
      showLabel: false,
      // labelPosition: 'below-icon',
      activeBackgroundColor: '#2196f3',
    },
  },
);

const GymSettingStack = createStackNavigator({
  gymsettings: {
    screen: GymSettings,
    navigationOptions: {
      headerShown: false,
    },
  },
  gymprofile: {
    screen: GymProfile,
    navigationOptions: {
      headerShown: false,
    },
  },
});

const GymTabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: GymHome,
      navigationOptions: ({ screenProps }) => ({
        // tabBarLabel: screenProps.i18n.t('HOME'),
        tabBarLabel: 'GYM2022',
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="calendar" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
    Settings: {
      screen: GymSettingStack,
      navigationOptions: ({ screenProps }) => ({
        // tabBarLabel: screenProps.i18n.t('SETTINGS'),
        tabBarLabel: 'More',
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="user-cog" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
  },
  {
    screenOptions: {
      activeTintColor: '#fff',
      inactiveTintColor: '#2196f3',
      showLabel: false,
      // labelPosition: 'below-icon',
      activeBackgroundColor: '#2196f3',
    },
  },
);

const HealthCheckHomeStack = createStackNavigator({
  healthCheckHome: {
    screen: HealthCheckHome,
    navigationOptions: {
      headerShown: false,
    },
  },
  healthCheckData: {
    screen: HealthCheckData,
    navigationOptions: {
      headerShown: false,
    },
  },
  healthCheckBloodPressureW: {
    screen: HealthCheckBloodPressureW,
    navigationOptions: {
      headerShown: false,
    },
  },
  healthCheckWeight: {
    screen: HealthCheckWeight,
    navigationOptions: {
      headerShown: false,
    },
  },
  healthCheckHeight: {
    screen: HealthCheckHeight,
    navigationOptions: {
      headerShown: false,
    },
  },
  healthCheckBloodGlucose: {
    screen: HealthCheckBloodGlucose,
    navigationOptions: {
      headerShown: false,
    },
  },
  healthCheckVitals: {
    screen: HealthCheckVitals,
    navigationOptions: {
      headerShown: false,
    },
  },
});



const HealthCheckTabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: HealthCheckHomeStack,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('HOME'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="home" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
    Settings: {
      screen: HealthCheckSettings,
      navigationOptions: ({ screenProps }) => ({
        tabBarLabel: screenProps.i18n.t('SETTINGS'),
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome5 name="user-cog" size={23} color={tintColor} />
        ),
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.dispatch(StackActions.popToTop());
          defaultHandler();
        },
        swipeEnabled: false,
      }),
    },
  },
  {
    screenOptions: {
      activeTintColor: '#fff',
      inactiveTintColor: '#2196f3',
      showLabel: false,
      // labelPosition: 'below-icon',
      activeBackgroundColor: '#2196f3',
    },
  },
);


const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: () => ({
      headerShown: false,
    }),
  },

  Register: {
    screen: RegisterScreen,
    navigationOptions: () => ({
      headerShown: false,
    }),
  },

  GymRegister: {
    screen: GymRegisterScreen,
    navigationOptions: () => ({
      headerShown: false,
    }),
  },

  Forgetpw: {
    screen: ForgetpwScreen,
    navigationOptions: () => ({
      headerShown: false,
    }),
  },
});

const styles = StyleSheet.create({
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    top: '-40%',
    right: '-10%',
    backgroundColor: '#FF453A',
  }
})


const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      Auth: AuthStack,
      Senior: SeniorTabNavigator,
      Volunteer: VolunteerTabNavigator,
      Caregiver: CaregiverTabNavigator,
      Gym: GymTabNavigator,
      HealthCheck: HealthCheckHomeStack,
      BLE: BLE,
    },
    {
      initialRouteName: 'Loading',
    },
  ),
);


class App extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig();
  }

  componentDidMount() {
    RNLocalize.addEventListener("change", this.handleLocalizationChange);
    getLanguage();
  }

  componentWillUnmount() {
    RNLocalize.removeEventListener("change", this.handleLocalizationChange);
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  render() {
    return (
      <AppContainer screenProps={{ i18n: i18n, numUpcomingActivities: this.props.upcomingActivities.length, numAlerts: this.props.newAlerts.length }} />
    );
  }
}

const mapStateToProps = state => ({
  upcomingActivities: state.main.upcomingActivities,
  newAlerts: state.main.newAlerts,
});


export default connect(mapStateToProps)(App);