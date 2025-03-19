import React from 'react';
import {Text} from 'react-native';
import {Left, Body, Card, CardItem, Grid, Row, Icon} from 'native-base';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import dateformat from 'dateformat';
import themeVariables from '../../native-base-theme/variables/material_copy';
import { translate } from '../../translations';

export default class AttendedEvent extends React.Component {
  onSlideAttended(id, Name) {
    if (this.props.slideAttended != null) {
      this.props.slideAttended(id, Name);
    }
  }

  viewMap(address) {
    if (this.props.map != null) {
      this.props.map(address);
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
              this.props.item.AttendedStatus == 'true'
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
            {this.props.item.AttendedStatus == 'true' && (
              <Icon
                type="FontAwesome"
                style={{color: '#180D59'}}
                name="thumbs-up"
              />
            )}
            {this.props.item.AttendedStatus == 'false' && (
              <Icon
                type="FontAwesome"
                style={{color: '#180D59'}}
                name="warning"
              />
            )}
            <Grid>
              <Row>
                <Text
                  style={{
                    color:
                      this.props.item.AttendedStatus == 'true'
                        ? '#180D59'
                        : '#180D59',
                    fontWeight: 'bold',
                    fontSize: 22,
                    marginLeft: 10,
                  }}>
                  {this.props.item.event.Title}
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
              }}>
              {dateformat(this.props.item.event.Date, 'ddd mmm d yyyy - ')}
              {this.props.item.event.Time}
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
              {this.props.item.event.Details}
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
              onPress={() => this.viewMap(this.props.item.event.Address)}>
              <FontAwesome5 name="map-pin" size={23} color="#180D59" />
              {translate('MAP')}
            </Text>

            <Text
              note
              style={{
                color: '#180D59',
                fontSize: 18,
                marginTop: 30,
              }}>
              You have responsed on{' '}
              {dateformat(
                this.props.item.data.CreatedAt.Date,
                'ddd mmm d yyyy ',
              )}
              and
              {this.props.item.data.AttendedStatus == 'true'
                ? ' agreed '
                : ' refuse '}
              to join the event
            </Text>
          </Body>
        </CardItem>
      </Card>
    );
  }
}
