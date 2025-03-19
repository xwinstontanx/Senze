import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Pressable,
  Modal,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { Left, Body, Card, CardItem, Grid, Row, Icon } from 'native-base';
import DatePicker from 'react-native-date-picker'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import dateformat from 'dateformat';
import themeVariables from '../../native-base-theme/variables/material_copy';
import styled from 'styled-components';
import { translate } from '../../translations';
import moment from 'moment';
import RBSheet from "react-native-raw-bottom-sheet";
import ImageZoom from 'react-native-image-pan-zoom';

let forceResetAttendedButton = null;

export default class UpcomingActivity extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      Time: new Date(),
      DatePickerVisible: false,
      showBigBrochure: false,
      bigBrochureURL: ""
    }
  }

  onSlideAttend(activity) {
    if (this.props.slideAttend != null) {
      this.props.slideAttend(activity);
    }
  }

  onSlideCancel(activity) {
    Alert.alert('', translate('Are you sure you want to cancel joining the activity?'), [
      {
        text: translate('NO'),
        onPress: () => {

        },
        style: 'cancel',
      },
      {
        text: translate('YES'),
        onPress: () => {
          if (this.props.slideAttend != null) {
            this.props.slideCancel(activity);
          }
        },
      },
    ]);
  }

  onSlideVolunteerProfile(activity) {
    if (this.props.slideVolunteerProfile != null) {
      this.props.slideVolunteerProfile(activity);
    }
  }

  viewMap(address) {
    if (this.props.map != null) {
      this.props.map(address);
    }
  }

  updateDateTime = (event, newDateTime) => {
    if (this.props.UpdateDateTime != null) {
      this.props.UpdateDateTime(event, newDateTime);
    }
  }

  render() {
    return (
      <Card
        style={{
          marginTop: 8,
          marginBottom: 8,
          marginLeft: 16,
          marginRight: 16,
          borderRadius: 10,
        }}>
        <CardItem
          header
          bordered
          style={{
            backgroundColor:
              this.props.item.activityResponse !== null
                ? themeVariables.brandSuccess
                : themeVariables.brandWarning,
            borderRadius: 10,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}>
          <Left
            style={{
              marginTop: -10,
              marginBottom: -10,
            }}>
            {this.props.item.activityResponse !== null && (this.props.item.data.Type === "Befriending (Weekly)" || this.props.item.data.Type === "Buddying (Monthly)") && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="users"
              />
            )}
            {this.props.item.activityResponse !== null && this.props.item.data.Type === undefined && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="check"
              />
            )}
            {this.props.item.activityResponse === null && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="calendar"
              />
            )}
            <Grid>
              <Row>
                <Text
                  style={{
                    color: '#180D59',
                    fontWeight: 'bold',
                    fontSize: 22,
                    marginLeft: 10,
                  }}>
                  {this.props.item.data.Title}
                </Text>
              </Row>
            </Grid>
          </Left>
        </CardItem>
        {this.props.item.data !== null && this.props.item.data.Brochure !== undefined && this.props.item.data.Brochure !== "" && (
          <CardItem>
            <TouchableOpacity
              style={{ width: '100%' }}
              onPress={() => {
                this.RBSheet.open()
                this.setState({
                  showBigBrochure: true,
                  bigBrochureURL: this.props.item.data.Brochure
                })
              }}>
              <Image
                style={styles.ImageTop}
                source={{ uri: this.props.item.data.Brochure }}
              />
              <Text
                note
                style={{
                  color: '#180D5988',
                  fontSize: 14,
                  marginTop: 5,
                  alignSelf: 'center'
                }}>
                {translate('Click to zoom')}
              </Text>
            </TouchableOpacity>
          </CardItem>
        )}
        <CardItem
          style={{
            borderRadius: 10,
          }}>
          <Body>

            <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 16,
              }}>
              {translate('DATE') + " / " + translate('TIME') + ":"}
            </Text>
            {this.props.item.data.Type !== "Befriending (Weekly)" && this.props.item.data.Type !== "Buddying (Monthly)" && (
              <Text
                note
                style={{
                  color: '#180D59',
                  fontSize: 18,
                }}>
                {dateformat(this.props.item.data.Date, 'ddd mmm d yyyy - ')}
                {moment(this.props.item.data.StartTime, "HH:mm").format("hh:mm A")}
              </Text>
            )}
            {this.props.item.activityResponse !== null && (this.props.item.data.Type === "Befriending (Weekly)" || this.props.item.data.Type === "Buddying (Monthly)") && (
              <Text
                note
                style={{
                  color: '#180D59',
                  fontSize: 18,
                }}

                onPress={() => this.setState({
                  DatePickerVisible: true,
                })}>
                <Icon
                  type="FontAwesome"
                  style={{ color: '#180D59', marginLeft: 10, marginRight: 10 }}
                  name="edit"
                  size={23}
                />
                {dateformat(this.props.item.data.Date, 'ddd mmm d yyyy - ')}
                {moment(this.props.item.data.Time, "HH:mm").format("hh:mm A")}
              </Text>
            )}

            {this.props.item.data !== null && this.props.item.data.Details !== undefined && this.props.item.data.Details !== "" && (
              <View>
                <Text
                  note
                  style={{
                    color: '#180D5988',
                    fontSize: 16,
                    marginTop: 10,
                  }}>
                  {translate('DETAILS')}:
                </Text>
                <Text
                  note
                  style={{
                    color: '#180D59',
                    fontSize: 18,
                  }}>
                  {this.props.item.data.Details}
                </Text>
              </View>
            )}

            {this.props.item.data !== null && this.props.item.data.Address !== undefined && this.props.item.data.Address !== "" && (
              <View>
                <Text
                  note
                  style={{
                    color: '#180D5988',
                    fontSize: 16,
                    marginTop: 10,
                  }}>
                  {translate('ADDRESS')}:
                </Text>
                <Text
                  note
                  style={{
                    color: '#180D59',
                    fontSize: 18,
                  }}>
                  {this.props.item.data.Address}
                  <Text
                    note
                    style={{
                      color: '#180D59',
                      fontSize: 18,
                    }}
                    onPress={() => this.viewMap(this.props.item.data.Address)}>
                    {"  "}
                    <FontAwesome5 name="route" size={23} color="#93C572" />
                  </Text>
                </Text>

              </View>
            )}



            {/* <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 16,
                marginTop: 10,
              }}>
              Number of Required Elderly(s):
            </Text>

            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 18,
              }}>
              {this.props.item.data.TotalPaxNeeded}
            </Text>

            <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 16,
                marginTop: 10,
              }}>
              Number of Signed Up Elderly(s):
            </Text>

            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 18,
              }}>
              {this.props.item.data.TotalPaxAccepted}
            </Text> */}

            {this.props.item.activityResponse === null &&
              Number(this.props.item.data.TotalPaxAccepted) <
              Number(this.props.item.data.TotalPaxNeeded) && (
                <View style={[{ width: '100%', marginTop: 10 }]}>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => {
                      this.onSlideAttend(this.props.item);
                    }}>
                    <Text style={styles.textStyle}>{translate('SIGN UP')}</Text>
                  </Pressable>
                </View>
              )}

            {this.props.item.activityResponse === null &&
              Number(this.props.item.data.TotalPaxAccepted) >=
              Number(this.props.item.data.TotalPaxNeeded) && (
                <Text
                  note
                  style={{
                    color: '#180D5988',
                    fontSize: 16,
                    marginTop: 10,
                  }}>
                  {translate('REMARK')}:
                </Text>
              )}

            {this.props.item.activityResponse === null &&
              Number(this.props.item.data.TotalPaxAccepted) >=
              Number(this.props.item.data.TotalPaxNeeded) && (
                <Text
                  style={{
                    color: '#180D59',
                    fontSize: 18,
                  }}>
                  {translate('NUMBER OF REQUIRED ELDERLY(S) HAS ACHIVED')}
                </Text>
              )}

            {this.props.item.activityResponse !== null && this.props.item.data.Type === undefined && (
              <Text
                note
                style={{
                  color: '#180D5988',
                  fontSize: 16,
                  marginTop: 10,
                }}>
                {translate('REMARK')}:
              </Text>
            )}

            {this.props.item.activityResponse !== null && this.props.item.data.Type === undefined && (
              <><Text
                style={{
                  color: '#180D59',
                  fontSize: 18,
                }}>
                {translate('YOU HAVE SIGNED UP THIS ACTIVITY')}
              </Text>
                <View style={[{ width: '100%', marginTop: 10 }]}>
                  <Pressable
                    style={[styles.buttonCancel]}
                    onPress={() => {
                      this.onSlideCancel(this.props.item);
                    }}>
                    <Text style={styles.textStyle}>{translate('CANCEL')}</Text>
                  </Pressable>
                </View></>
            )}

            {this.props.item.activityResponse !== null && (this.props.item.data.Type === "Befriending (Weekly)" || this.props.item.data.Type === "Buddying (Monthly)") && (
              <View style={[{ width: '100%', marginTop: 10 }]}>
                <Pressable
                  style={[styles.buttonCancel]}
                  onPress={() => {
                    this.onSlideVolunteerProfile(this.props.item);
                  }}>
                  <Text style={styles.textStyle}>{translate('View Volunteer Profile')}</Text>
                </Pressable>
              </View>
            )}

            <DatePicker
              modal
              open={this.state.DatePickerVisible}
              mode='datetime'
              date={this.state.Time}
              minuteInterval={1}
              locale="en_GB"
              onConfirm={(date) => {
                this.setState({ DatePickerVisible: false })
                this.updateDateTime(this.props.item, date);
              }}
              onCancel={() => {
                this.setState({
                  DatePickerVisible: false,
                });
              }}
              theme='light'
            />
          </Body>
        </CardItem>

        <View style={{ flex: 0, justifyContent: "flex-start", alignItems: "stretch" }}>
          <RBSheet
            ref={ref => {
              this.RBSheet = ref;
            }}
            height={650}
            openDuration={250}
            customStyles={{
              container: {
                justifyContent: "center",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 10
              },
            }}
          >
            <View style={{ flex: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#180D59',
                  marginLeft: 10
                }}>{""}</Text>
              </>
              <TouchableOpacity
                style={{ marginTop: 5, marginBottom: 5, marginRight: 5, alignItems: 'flex-end' }}
                onPress={() => {
                  this.RBSheet.close();
                  this.setState({ showHealthVitals: false, showAttachment: false })
                }}>
                <FontAwesome5 name="times-circle" size={35} color="#180D59" />
              </TouchableOpacity>
            </View>

            {this.state.showBigBrochure === true &&
              <ImageZoom
                cropWidth={Dimensions.get('window').width * 0.95}
                cropHeight={Dimensions.get('window').height * 0.75}
                imageWidth={Dimensions.get('window').width * 0.95}
                imageHeight={Dimensions.get('window').height * 0.8}
              >
                <Image style={styles.stretch}
                  source={{ uri: this.state.bigBrochureURL }} />
              </ImageZoom>
              // <Image
              //   style={styles.stretch}
              //   source={{ uri: this.state.bigBrochureURL }}
              // />
            }
          </RBSheet>
        </View>
        {/* <View style={styles.ButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={this.confirmUpdate}>
            <Text style={styles.text}>Update Profile</Text>
          </TouchableOpacity>
        </View> */}

        {/* {this.props.item.activityResponse === null &&
          this.props.item.data.TotalPaxAccepted <
            this.props.item.data.TotalPaxNeeded && (
            <SwipeButton
              railStyles={{
                borderRadius: 10,
                backgroundColor: '#ff5b2444',
                borderColor: '#ff5b2444',
              }}
              thumbIconStyles={{
                borderRadius: 10,
              }}
              thumbIconBackgroundColor="#ff5b24bb"
              thumbIconBorderColor="#FFFFFF"
              containerStyles={{
                borderRadius: 10,
                marginLeft: 10,
                marginRight: 10,
              }}
              railBackgroundColor={themeVariables.containerBgColor}
              title="Slide to Sign Up"
              onSwipeSuccess={() => {
                this.onSlideAttend(this.props.item);
                forceResetAttendedButton && forceResetAttendedButton();
              }}
              forceReset={reset => {
                forceResetAttendedButton = reset;
              }}
            />
          )} */}
      </Card >
    );
  }
}

const DataContainer = styled.View`
  margin-top: 25%;
  margin-left: 2%;
  margin-right: 2%;
  padding-top: 20px;
  border-width: 2px;
  border-color: #000000;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
`;

const DataInside = styled.View`
  align-items: center;
`;

const styles = StyleSheet.create({
  container2: {
    borderColor: '#180D59',
    borderRadius: 10,
    marginLeft: '5%',
    marginRight: '5%',
    marginBottom: 30,
    alignSelf: 'stretch',
  },
  ButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 20,
    elevation: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: themeVariables.brandWarning,
  },
  buttonCancel: {
    borderRadius: 20,
    elevation: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: themeVariables.brandSuccess,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ImageTop: {
    height: 130,
    // width: '100%',
    resizeMode: 'center',
  },
  stretch: {
    height: '90%',
    resizeMode: 'center'
  },
});
