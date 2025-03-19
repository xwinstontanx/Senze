import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Left, Body, Card, CardItem, Grid, Row, Icon } from 'native-base';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import dateformat from 'dateformat';
import themeVariables from '../../native-base-theme/variables/material_copy';

import ButtonAlertSmall from '../components/ButtonAlertSmall';
import { translate } from '../../translations';

let forceResetPhoneButton = null;
let forceResetAttendedButton = null;

export default class NewAlerts extends React.Component {
  onSlidePhone(phoneNumber) {
    if (this.props.slideCall != null) {
      this.props.slideCall(phoneNumber);
    }
  }

  onSlideAttended(id, SeniorUid) {
    if (this.props.slideAttended != null) {
      this.props.slideAttended(id, SeniorUid);
    }
  }

  viewMap(lat, long) {
    if (this.props.map != null) {
      this.props.map(lat, long);
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
              (this.props.item.data.NotifyStatus === 'close')
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
            {this.props.item.data.NotifyStatus === 'close' && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="thumbs-up"
              />
            )}
            {this.props.item.data.NotifyStatus !== 'close' && (
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
                    color: '#180D59',
                    fontWeight: 'bold',
                    fontSize: 18,
                    marginLeft: 10,
                  }}>
                  {translate('FROM') + ' ' + this.props.item.data.Name}
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
                'ddd mmm d yyyy - h:MM TT',
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
              {translate("REMARK")}:
            </Text>
            {this.props.item.data.NotifyStatus === 'open' && (
              <Text
                note
                style={{
                  color: '#FF1100',
                  fontSize: 16,
                  fontWeight: "bold"
                }}>
                <FontAwesome5 name="sad-cry" size={23} color="#FF1100" />
                {' ' + translate("EMERGENCY TRIGGERED")}
              </Text>)}
            {this.props.item.data.NotifyStatus === 'healthdDataOFR' && (
              <Text
                note
                style={{
                  color: '#180D59',
                  fontSize: 16,
                }}>
                <FontAwesome5 name="surprise" size={23} color="#180D59" />
                {' '} {this.props.item.data.ReadingName} {': '}{this.props.item.data.ReadingValue}
              </Text>)}
          </Body>
        </CardItem>
        <View>
          {(this.props.item.data.NotifyStatus == 'open' || this.props.item.data.NotifyStatus === 'healthdDataOFR') && (
            <View style={styles.container3}>
              <ButtonAlertSmall
                title={translate('CALL')}
                icon={'phone'}
                click={() => {
                  this.onSlidePhone(this.props.item.data.PhoneNumber);
                }}
              />
              <ButtonAlertSmall
                title={translate('ATTENDED')}
                icon={'thumbs-up'}
                click={() => {
                  this.onSlideAttended(this.props.item.id, this.props.item.data.SeniorUid);
                }}
              />
            </View>
          )}
        </View>
        {/* <View>
          {(this.props.item.data.NotifyStatus == 'open' || this.props.item.data.NotifyStatus === 'healthdDataOFR') && (
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
              title="Slide After Attending"
              onSwipeSuccess={() => {
                this.onSlideAttended(this.props.item.id);
                forceResetAttendedButton && forceResetAttendedButton();
              }}
              forceReset={reset => {
                forceResetAttendedButton = reset;
              }}
            />
          )}
        </View> */}
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  container3: {
    flexDirection: 'row',
    margin: 10,
    alignSelf: 'stretch',
    justifyContent: 'space-around',
  },
});
