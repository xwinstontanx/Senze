import {
  SET_LOADING_SCREEN,
  SET_LOAD_ELDERLYREADING_SCREEN,
  SET_USER_PROFILE,
  LOGOUT,
  SET_UPCOMING_ACTIVITIES,
  SET_PAST_ACTIVITIES,
  SET_ALERTS_COUNT,
  SET_NEW_ALERTS,
  SET_ATTENDED_ALERTS
} from './actionTypes';

import auth from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

// export const setLoading = (loading) => ({
//   type: SET_LOADING_SCREEN,
//   payload: {
//     loading,
//   },
// });

export function setLoading(loading) {
  return function (dispatch) {
    dispatch({
      type: SET_LOADING_SCREEN,
      payload: loading,
    });
  };
}

/**
 * Action to store the elderlyLoading to redux store after BluetoothManager is clicked.
 * @param {object} elderlyLoading is the boolean.
 * @return {function} dispatch
 */
export function setElderly(elderlyLoading) {
  return function (dispatch) {
    dispatch({
      type: SET_LOAD_ELDERLYREADING_SCREEN,
      payload: elderlyLoading,
    });
  };
}

export function setUserProfile(profile) {
  return function (dispatch) {
    dispatch({
      type: SET_USER_PROFILE,
      payload: profile,
    });
  };
}

export function logout() {
  return function (dispatch) {
    dispatch({
      type: LOGOUT,
    });
  };
}

export function setAlertsCount(newCount) {
  return {
    type: SET_ALERTS_COUNT,
    payload: newCount,
  }
}

export function fetchAlerts(callback) {
  return async function (dispatch, getState) {
    // Get Elderly list
    const elderlyListSnapshot = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('ElderlyUnderCare')
      .get();
    let elderlyUidList = [];

    if (!elderlyListSnapshot.empty) {
      for (const elderlyList of elderlyListSnapshot.docs) {

        elderlyUidList.push({
          docID: elderlyList.id,
          data: elderlyList.data(),
        });
      }
    }

    console.log('FETCHING ALERTS');
    dbRefNotification = firestore().collection('Notification');

    unsubscribeNotification = dbRefNotification
      .orderBy('CreatedAt', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {

          let newData = [];
          let attendedData = [];

          snapshot.forEach(doc => {

            let index = elderlyUidList.findIndex(
              item => item.data.Uid === doc.data().SeniorUid,
            );
            if (
              (doc.data().NotifyStatus == "open" || doc.data().NotifyStatus == 'healthdDataOFR') &&
              doc.data().Attendee === "" &&
              index != -1
            ) {
              newData.push({
                id: doc.id,
                data: doc.data(),
              });
            } else if (
              doc.data().NotifyStatus == 'close' &&
              index != -1
            ) {
              dbRefNotification.doc(doc.id).collection('Comments').orderBy('AttendedAt', 'asc').get().then((value) => {
                let commentsRaw = [];
                value.forEach((val) => {
                  commentsRaw.push(val._data)
                })
                attendedData.push({
                  id: doc.id,
                  data: doc.data(),
                  comments: commentsRaw
                });
              })
            }
          });

          dispatch({
            type: SET_NEW_ALERTS,
            payload: newData,
          });
          dispatch({
            type: SET_ATTENDED_ALERTS,
            payload: attendedData,
          });
          callback();
        }
      });
  }
};

export function fetchVolunteerAlerts(callback) {
  return async function (dispatch, getState) {
    // Get Elderly list
    const elderlyListSnapshot = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('ElderlyUnderCare')
      .get();
    let elderlyUidList = [];

    if (!elderlyListSnapshot.empty) {
      for (const elderlyList of elderlyListSnapshot.docs) {
        elderlyUidList.push(elderlyList.data().Uid);
      }
    }
    dbRefNotification = firestore().collection('Notification');
    dbRefNotification
      .orderBy('CreatedAt', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {

          let newData = [];
          let attendedData = [];

          snapshot.forEach(doc => {
            let data = doc.data();
            if (elderlyUidList.includes(data.SeniorUid)) {
              if (
                doc.data().NotifyStatus == 'open' &&
                doc.data().Attendee === ""
              ) {
                newData.push({
                  id: doc.id,
                  data: doc.data()
                });
              } else if (doc.data().NotifyStatus == 'close') {

                dbRefNotification.doc(doc.id).collection('Comments').orderBy('AttendedAt', 'asc').get().then((value) => {
                  let commentsRaw = [];
                  value.forEach((val) => {
                    commentsRaw.push(val._data)
                  })
                  attendedData.push({
                    id: doc.id,
                    data: doc.data(),
                    comments: commentsRaw
                  });
                })
              }
            }
          });

          dispatch({
            type: SET_NEW_ALERTS,
            payload: newData,
          });
          dispatch({
            type: SET_ATTENDED_ALERTS,
            payload: attendedData,
          });

          callback();
        }
      });
  }
}
export function fetchVolunteerEvents() {
  return async function (dispatch, getState) {
    const state = getState().main;
    let activityUpcomingData = [];
    let activityPastData = [];

    console.log('Fetching Activities');

    const Orgid = await firestore()
      .collection('Organization')
      .doc(state.profile.OrganizationId)
      .get();

    if (Orgid.exists) {

      const orgId = Orgid.data().Uid;
      const uid = state.profile.Uid;

      dbRefBBDetails = await firestore().collection('BefriendBuddyDetails');
      dbRefJointEvents = await firestore().collection('JoinEvents');

      // Collect all the activities
      dbRefEventDetails = await firestore().collection('EventDetails');

      const bbSnapshot = await dbRefBBDetails
        .where('Volunteer', '==', state.profile.Uid)
        .get();

      if (!bbSnapshot.empty) {

        bbSnapshot.forEach(async (bbDoc) => {

          const elderlySnapshot = await firestore().collection('Users')
            .doc(bbDoc.data().Elderly)
            .get();

          if (!elderlySnapshot.empty) {
            bbResponse = {
              ...bbDoc.data(),
              Title: bbDoc.data().Type,
              Details: `Visiting ${elderlySnapshot.data().Name}`,
              Senior: elderlySnapshot.data().Name
            };

            var date = moment(
              bbDoc.data().Date + 'T' + bbDoc.data().Time + 'Z',
            );
            var now = moment();

            if (now > date && bbResponse != null) {
              // past activity
              activityPastData.push({
                id: bbDoc.id,
                data: bbResponse,
                eventTime: date,
                eventResponse: bbResponse,
              });
            } else if (now <= date) {
              // upcoming activity
              activityUpcomingData.push({
                id: bbDoc.id,
                data: bbResponse,
                eventTime: date,
                eventResponse: bbResponse,
              });
            }
          }
        });
      }

      const querySnapshot = await dbRefEventDetails
        .where('CreatedBy', '==', orgId)
        .get();

      if (!querySnapshot.empty) {
        for (const event of querySnapshot.docs) {

          let eventResponse = null;

          const jointActivitySnapshot = await dbRefJointEvents
            .where('CreatedBy', '==', uid)
            .where('EventDetails', '==', event.id)
            .get();

          if (!jointActivitySnapshot.empty) {
            jointActivitySnapshot.forEach(jointActivity => {
              if (jointActivity.data().Delete != "true") {
                eventResponse = jointActivity.data();
              }
            });
          }

          //Split into upcoming and past activity
          var date = moment(
            event.data().Date + 'T' + event.data().Time + 'Z',
          );
          var now = moment();

          if (now > date && eventResponse !== null) {
            // past activity
            activityPastData.push({
              id: event.id,
              data: event.data(),
              eventTime: date,
              eventResponse: eventResponse,
            });

          } else if (now <= date) {
            // upcoming activity
            activityUpcomingData.push({
              id: event.id,
              data: event.data(),
              eventTime: date,
              eventResponse: eventResponse,
            });
          }
        }
      }

      //Sort with activityTime
      activityUpcomingData.sort((val1, val2) => {
        return new Date(val1.activityTime) - new Date(val2.activityTime);
      });

      activityPastData.sort((val1, val2) => {
        return new Date(val2.activityTime) - new Date(val1.activityTime);
      });

      dispatch({
        type: SET_PAST_ACTIVITIES,
        payload: activityPastData,
      });
      dispatch({
        type: SET_UPCOMING_ACTIVITIES,
        payload: activityUpcomingData,
      });
    }
  }

}

export function fetchActivities() {
  return async function (dispatch, getState) {
    const state = getState().main;
    let activityUpcomingData = [];
    let activityPastData = [];

    console.log('Fetching Activities');

    const Orgid = await firestore()
      .collection('Organization')
      .doc(state.profile.OrganizationId)
      .get();

    if (Orgid.exists) {

      const orgId = Orgid.data().Uid;
      const uid = state.profile.Uid;

      dbRefBBDetails = await firestore().collection('BefriendBuddyDetails');
      dbRefJointActivities = await firestore().collection('JoinActivities');

      // Collect all the activities
      dbRefActivityDetails = await firestore().collection('ActivityDetails');

      const bbSnapshot = await dbRefBBDetails
        .where('Elderly', '==', uid)
        .get();

      if (!bbSnapshot.empty) {

        bbSnapshot.forEach(async (bbDoc) => {

          const volunteerSnapshot = await firestore().collection('volunteers')
            .doc(bbDoc.data().Volunteer)
            .get();

          if (!volunteerSnapshot.empty) {
            bbResponse = {
              ...bbDoc.data(),
              Title: bbDoc.data().Type,
              Details: `Visit by ${bbDoc.data().VolunteerName}`,
              Volunteer: bbDoc.data().Volunteer,
              VolunteerDetails: volunteerSnapshot.data()
            };

            var date = moment(
              bbDoc.data().Date + 'T' + bbDoc.data().Time + 'Z',
            );
            var now = moment();

            if (now > date && bbResponse != null) {
              // past activity
              activityPastData.push({
                id: bbDoc.id,
                data: bbResponse,
                activityTime: date,
                activityResponse: bbResponse,
              });
            } else if (now <= date) {
              // upcoming activity
              activityUpcomingData.push({
                id: bbDoc.id,
                data: bbResponse,
                activityTime: date,
                activityResponse: bbResponse,
              });
            }
          }
        });
      }

      const querySnapshot = await dbRefActivityDetails
        .where('CreatedBy', '==', orgId)
        .get();

      if (!querySnapshot.empty) {
        for (const activity of querySnapshot.docs) {

          let activityResponse = null;
          let bbResponse = null;


          const jointActivitySnapshot = await dbRefJointActivities
            .where('CreatedBy', '==', uid)
            .where('ActivityDetails', '==', activity.id)
            .get();

          if (!jointActivitySnapshot.empty) {
            jointActivitySnapshot.forEach(jointActivity => {
              if (jointActivity.data().Delete != "true") {
                activityResponse = jointActivity.data();
              }
            });
          }

          //Split into upcoming and past activity
          var date = moment(
            activity.data().Date + 'T' + activity.data().StartTime + 'Z',
          );
          var now = moment(Date.now());



          // Check if all was invited or no setting
          let allInvited = false;
          if (activity.data().AllInvited != undefined) {
            allInvited = activity.data().AllInvited;
          } else {
            allInvited = true;
          }

          // Check if individual was invited or no setting
          let invited = false;
          if ((activity.data().UserList != undefined) && !allInvited) {
            let userList = activity.data().UserList;
            let data = userList.filter(user => user.item_id == uid);

            if (data.length > 0) {
              invited = true
            }
          }

          if (allInvited || invited) {
            if (now > date && activityResponse !== null) {
              // past activity
              activityPastData.push({
                id: activity.id,
                data: activity.data(),
                activityTime: date,
                activityResponse: activityResponse,
              });

            } else if (now <= date) {
              // upcoming activity
              activityUpcomingData.push({
                id: activity.id,
                data: activity.data(),
                activityTime: date,
                activityResponse: activityResponse,
              });
            }
          }
        }
      }

      //Sort with activityTime
      activityUpcomingData.sort((val1, val2) => {
        return new Date(val1.activityTime) - new Date(val2.activityTime);
      });

      activityPastData.sort((val1, val2) => {
        return new Date(val2.activityTime) - new Date(val1.activityTime);
      });

      dispatch({
        type: SET_PAST_ACTIVITIES,
        payload: activityPastData,
      });
      dispatch({
        type: SET_UPCOMING_ACTIVITIES,
        payload: activityUpcomingData,
      });
    }
  }

}