import {
  SET_LOADING_SCREEN,
  SET_LOAD_ELDERLYREADING_SCREEN,
  SET_USER_PROFILE,
  LOGOUT,
  SET_UPCOMING_ACTIVITIES,
  SET_PAST_ACTIVITIES,
  SET_NEW_ALERTS,
  SET_ATTENDED_ALERTS
} from '../actionTypes';

const initialState = {
  loading: false,
  elderlyLoading: false,
  profile: {Name: ''},
  upcomingActivities: [],
  pastActivities: [],
  newAlerts: [],
  attendedAlerts: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_LOADING_SCREEN: {
      return {
        ...state,
        loading: action.payload,
      };
    }
    case SET_LOAD_ELDERLYREADING_SCREEN: {
      return {
        ...state,
        elderlyLoading: action.payload,
      };
    }
    case SET_USER_PROFILE: {
      return {
        ...state,
        profile: action.payload,
      };
    }
    case LOGOUT: {
      return initialState;
    }
    case SET_UPCOMING_ACTIVITIES: {
      return {
        ...state,
        upcomingActivities: action.payload,
      }
    }
    case SET_PAST_ACTIVITIES: {
      return {
        ...state,
        pastActivities: action.payload,
      }
    }
    case SET_NEW_ALERTS: {
      return {
        ...state,
        newAlerts: action.payload,
      }
    }
    case SET_ATTENDED_ALERTS: {
      return {
        ...state,
        attendedAlerts: action.payload,
      }
    }
    default:
      return state;
  }
}
