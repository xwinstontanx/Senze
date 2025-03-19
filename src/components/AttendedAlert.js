import React from 'react';
import { StyleSheet, Text, FlatList, View, TouchableOpacity } from 'react-native';
import { Left, Body, Card, CardItem, Grid, Row, Icon } from 'native-base';

import dateformat from 'dateformat';
import themeVariables from '../../native-base-theme/variables/material_copy';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { translate } from '../../translations';

export default class AttendedAlerts extends React.Component {
  onSlidePhone(phoneNumber) {
    if (this.props.slideCall != null) {
      this.props.slideCall(phoneNumber);
    }
  }

  onSlideAttended(id, Name) {
    if (this.props.slideAttended != null) {
      this.props.slideAttended(id, Name);
    }
  }

  viewMap(lat, long) {
    if (this.props.map != null) {
      this.props.map(lat, long);
    }
  }

  onPressComments(id) {
    if (this.props.onPressComments != null) {
      this.props.onPressComments(id);
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
              this.props.item.data.NotifyStatus != 'open'
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
            {this.props.item.data.NotifyStatus != 'open' && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="thumbs-up"
              />
            )}
            {this.props.item.data.NotifyStatus == 'open' && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="warning"
              />
            )}
            <Grid>
              <Row>
                <Text
                  style={{
                    color:
                      this.props.item.data.NotifyStatus != 'open'
                        ? '#180D59'
                        : '#180D59',
                    fontWeight: 'bold',
                    fontSize: 18,
                    marginLeft: 10,
                  }}>
                  {translate("FROM") + " " + this.props.item.data.Name}
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
                fontSize: 13,
              }}>
              {translate('ALERT TRIGGERED ON:')}
            </Text>
            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 16,
              }}>
              {dateformat(
                this.props.item.data.CreatedAt.toDate(),
                'd mmm yyyy (ddd) h:MM TT',
              )}
            </Text>

            {/* <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 13,
                marginTop: 10,
              }}>
              {translate('LAST KNOWN LOCATION:')}
            </Text>

            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 16,
              }}
              onPress={() => {
                if (this.props.item.data.CurrentLocation.coordinates !== null) {
                  this.viewMap(
                    this.props.item.data.CurrentLocation.coordinates._latitude,
                    this.props.item.data.CurrentLocation.coordinates._longitude,
                  );
                } else {
                  this.viewMap(null, null);
                }
              }}>
              <FontAwesome5 name="map-pin" size={23} color="#180D59" />
              {translate('MAP')}
            </Text> */}

            <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 13,
                marginTop: 10,
              }}>
              {translate('REMARK')}:
            </Text>
            {this.props.item.data.NotifyStatus === 'close' && this.props.item.data.ReadingName !== undefined && this.props.item.data.ReadingValue !== undefined ? (
              <Text
                note
                style={{
                  color: '#180D59',
                  fontSize: 16,
                }}>
                {translate(this.props.item.data.ReadingName.toLocaleUpperCase())} {': '}{this.props.item.data.ReadingValue}
              </Text>) : <Text
                note
                style={{
                  color: '#180D59',
                  fontSize: 16,
                }}>

              {translate('EMERGENCY TRIGGERED') + " "} {this.props.item.data.ReadingValue === undefined ? "" : this.props.item.data.ReadingValue}
            </Text>}

            {/* {this.props.item.data.Attendee === this.props.attendee ? (
              <Text
                note
                style={{
                  color: '#180D59CC',
                  fontSize: 16,
                  marginTop: 15,
                }}>
                <FontAwesome5 name="check" size={20} color="#180D59" /> {translate('ATTENDED BY YOU')}
              </Text>
            ) : (
              <Text
                note
                style={{
                  color: '#180D59CC',
                  fontSize: 16,
                  marginTop: 15,
                }}>
                <FontAwesome5 name="check" size={20} color="#180D59" />  {translate("ATTENDED BY") + " " + this.props.item.data.Attendee}
              </Text>
            )} */}

            <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 13,
                marginTop: 10,
              }}>
              {translate('ATTENDED BY') + ':'}
            </Text>

            {this.props.item.data.Attendee === this.props.attendee ? (
              <Text
                note
                style={{
                  color: '#180D59CC',
                  fontSize: 16
                }}>
                {translate('YOU')}
              </Text>
            ) : (
              <Text
                note
                style={{
                  color: '#180D59CC',
                  fontSize: 16
                }}>
                {this.props.item.data.Attendee}
              </Text>
            )}


            {/* <Text
              note
              style={{
                color: '#180D5988',
                fontSize: 13,
                marginTop: 10,
              }}>
              {translate('COMMENTS') + ':'}
            </Text>

            <FlatList
              data={this.props.item.comments}
              renderItem={({ item }) => (
                <View style={styles.list}>
                  <Text note
                    style={{
                      color: '#180D5966',
                      fontSize: 16,
                    }}>
                    {dateformat(
                      item?.AttendedAt.toDate(),
                      'd mmm yyyy (ddd) h:MM TT',
                    )}: </Text>
                  {item.Attendee === this.props.attendee ? (
                    <Text note
                      style={{
                        color: '#180D59',
                        fontSize: 16,
                      }}>    You: {item?.Comments}</Text>
                  ) : (
                    <Text note
                      style={{
                        color: '#180D59',
                        fontSize: 16,
                      }}>    {item?.Attendee}: {item?.Comments}</Text>
                  )}

                </View>
              )}
            />

            <TouchableOpacity
              onPress={() => {
                this.onPressComments(this.props.item.id);
              }}
              style={[
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  borderColor: '#180D59',
                  borderWidth: 1,
                  width: '100%',
                  height: 40,
                  marginTop: 10,
                },
              ]}>
              <Text
                style={[
                  {
                    color: '#180D59',
                    fontSize: 16,
                  },
                ]}>
                {translate("Add Comments")}
              </Text>
            </TouchableOpacity> */}
          </Body>
        </CardItem>
      </Card>
    );
  }

}

const styles = StyleSheet.create({
  list: {
    marginTop: 5,
  },
});
