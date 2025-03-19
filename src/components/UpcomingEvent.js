import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Pressable,
} from 'react-native';
import { Left, Body, Card, CardItem, Grid, Row, Icon } from 'native-base';
import DatePicker from 'react-native-date-picker'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import dateformat from 'dateformat';
import themeVariables from '../../native-base-theme/variables/material_copy';
import styled from 'styled-components';
import { translate } from '../../translations';
import moment from 'moment';

let forceResetAttendedButton = null;

export default class UpcomingEvent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      Time: new Date(),
      DatePickerVisible: false
    }
  }

  onSlideAttend = event => {
    if (this.props.slideAttend != null) {
      this.props.slideAttend(event);
    }
  };

  onSlideCancel = event => {
    if (this.props.slideCancel != null) {
      this.props.slideCancel(event);
    }
  }

  viewMap(address) {
    if (this.props.map != null) {
      this.props.map(address);
    }
  }

  isBBEvent(props) {
    return this.props.item.eventResponse !== null && (this.props.item.data.Type === "Befriending (Weekly)" || this.props.item.data.Type === "Buddying (Monthly)")
  }

  updateDateTime = (event, newDateTime) => {
    if (this.props.UpdateDateTime != null) {
      this.props.UpdateDateTime(event, newDateTime);
    }
  }

  render() {

    const qrScannerButtonStyle = this.props.item.data.Status == 0 ? styles.buttonCancel : { ...styles.buttonCancel, backgroundColor: '#808080' }
    const caseNoteButtonStyle = this.props.item.data.Status == 1 ? styles.buttonCancel : { ...styles.buttonCancel, backgroundColor: '#808080' }

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
              this.props.item.eventResponse !== null
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
            {this.isBBEvent(this.props) && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="users"
              />
            )}
            {this.props.item.eventResponse !== null && this.props.item.data.Type === undefined && (<Icon
              type="FontAwesome"
              style={{ color: '#180D59' }}
              name="check"
            />
            )}
            {this.props.item.eventResponse === null && (
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
            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 18,
              }}
              onPress={() => this.setState({
                DatePickerVisible: true,
              })}>
              {this.isBBEvent(this.props) && (
                <Icon
                  type="FontAwesome"
                  style={{ color: '#180D59', marginLeft: 10, marginRight: 10 }}
                  name="edit"
                  size={23}
                />
              )}

              {dateformat(this.props.item.data.Date, 'ddd mmm d yyyy - ')}
              {moment(this.props.item.data.Time, "HH:mm").format("hh:mm A")}

            </Text>

            <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 16,
                marginTop: 10,
              }}>
              {translate('DETAILS') + ":"}
            </Text>
            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 18,
              }}>
              {this.props.item.data.Details}
            </Text>

            <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 16,
                marginTop: 10,
              }}>
              {translate('ADDRESS') + ":"}
            </Text>
            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 18,
              }}
              onPress={() => this.viewMap(this.props.item.data.Address)}>
              <FontAwesome5 name="map-pin" size={23} color="#180D59" />
              {' '}{translate('MAP')}
            </Text>

            {/* <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 16,
                marginTop: 10,
              }}>
              Number of Required Volunteer(s):
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
              Number of Signed Up Volunteer(s):
            </Text>

            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 18,
              }}>
              {this.props.item.data.TotalPaxAccepted}
            </Text> */}

            {this.props.item.eventResponse === null &&
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

            {this.isBBEvent(this.props) && (
              <View style={[{ marginTop: 10, flexDirection: 'column', alignSelf: 'stretch', justifyContent: 'space-between', }]}>
                <Pressable
                  style={[{ flex: 1 }, styles.buttonCancel]}
                  onPress={() => {
                    this.props.navigation.navigate('volunteerdetails');
                  }}>
                  <Text style={styles.textStyle}>{translate('Profile Badge')}</Text>
                </Pressable>
                <Pressable
                  style={[{ flex: 1 }, qrScannerButtonStyle]}
                  onPress={() => {
                    if (this.props.item.data.Status == 0) {
                      this.props.navigation.navigate('volunteerqrscanner', {
                        item: this.props.item
                      });
                    }
                  }}>
                  <Text style={styles.textStyle}>{translate('Start Session')}</Text>
                </Pressable>
                <Pressable
                  style={[{ flex: 1 }, caseNoteButtonStyle]}
                  onPress={() => {
                    // if (this.props.item.data.Status == 1) {
                    this.props.navigation.navigate('volunteerbbcasenotes', {
                      item: this.props.item
                    });
                    // }
                  }}>
                  <Text style={styles.textStyle}>{translate('Submit Case Note')}</Text>
                </Pressable>
              </View>
            )}

            {this.props.item.eventResponse === null &&
              Number(this.props.item.data.TotalPaxAccepted) >=
              Number(this.props.item.data.TotalPaxNeeded) && (
                <Text
                  note
                  style={{
                    color: '#180D5988',
                    fontSize: 16,
                    marginTop: 10,
                  }}>
                  {translate('REMARK') + ":"}
                </Text>
              )}

            {this.props.item.eventResponse === null &&
              Number(this.props.item.data.TotalPaxAccepted) >=
              Number(this.props.item.data.TotalPaxNeeded) && (
                <Text
                  style={{
                    color: '#180D59',
                    fontSize: 18,
                  }}>
                  {translate('NUMBER OF REQUIRED VOLUNTEER(S) HAS BEEN ACHIEVED')}
                </Text>
              )}

            {this.props.item.eventResponse !== null && this.props.item.data.Type === undefined && (
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

            {this.props.item.eventResponse !== null && this.props.item.data.Type === undefined && (
              <><Text
                style={{
                  color: '#180D59',
                  fontSize: 18,
                }}>
                {translate('YOU HAVE SIGNED UP THIS EVENT')}
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

            <DatePicker
              modal
              open={this.state.DatePickerVisible}
              mode='datetime'
              date={moment(this.props.item.data.Date+"T"+this.props.item.data.Time).toDate()}
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

        {/* {this.props.item.eventResponse === null &&
          Number(this.props.item.data.TotalPaxAccepted) <
            Number(this.props.item.data.TotalPaxNeeded) && (
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
      </Card>
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
  container: {
    flex: 1,
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
});
