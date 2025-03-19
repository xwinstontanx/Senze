import React from 'react';
import { Text, View } from 'react-native';
import { Left, Body, Card, CardItem, Grid, Row, Icon } from 'native-base';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import dateformat from 'dateformat';
import themeVariables from '../../native-base-theme/variables/material_copy';
import { translate } from '../../translations';

export default class PastEvent extends React.Component {
  onSlidePast(id, Name) {
    if (this.props.slidePast != null) {
      this.props.slidePast(id, Name);
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
              this.props.item.eventResponse.AttendedStatus === 'true'
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
            {(this.props.item.eventResponse.AttendedStatus === 'true' || this.props.item.data.VerifiedQR === 'true') && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="check"
              />
            )}
            {(this.props.item.eventResponse.AttendedStatus === 'false' || this.props.item.data.VerifiedQR === 'false') && (
              <Icon
                type="FontAwesome"
                style={{ color: '#180D59' }}
                name="close"
              />
            )}
            <Grid>
              <Row>
                <Text
                  style={{
                    color:
                      this.props.item.PastStatus == 'true'
                        ? '#180D59'
                        : '#180D59',
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
              }}>
              {dateformat(this.props.item.data.Date, 'ddd mmm d yyyy - ')}
              {this.props.item.data.Time}
            </Text>

            {this.props.item.eventResponse !== null && this.props.item.data.Type === undefined && (
              <View>
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
              </View>
            )}

            {this.props.item.eventResponse !== null && (this.props.item.data.Type === "Befriending (Weekly)" || this.props.item.data.Type === "Buddying (Monthly)") && (
              <View>
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
                  {this.props.item.data.VerifiedQR === 'false' ? <Text
                    note
                    style={{
                      color: '#180D59',
                      fontSize: 18,
                    }}>
                    You did not meet {this.props.item.data.Senior}
                  </Text> : <Text
                    note
                    style={{
                      color: '#180D59',
                      fontSize: 18,
                    }}>
                    You have visited {this.props.item.data.Senior}
                  </Text>}
                </Text>
              </View>
            )}

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
              {translate('MAP')}
            </Text>

            {this.props.item.eventResponse !== null && this.props.item.data.Type === undefined && (
              <View>

                <Text
                  note
                  style={{
                    color: '#180D5988',
                    fontSize: 16,
                    marginTop: 10,
                  }}>
                  {translate('REMARK')}:
                </Text>
                {this.props.item.eventResponse.AttendedStatus === 'true' ? (
                  <Text
                    style={{
                      color: '#180D59',
                      fontSize: 18,
                    }}>
                    {translate('THANK YOU SO MUCH, YOU HAVE ATTENDED THIS ACTIVITY')}
                  </Text>
                ) : (

                  <Text
                    style={{
                      color: '#180D59',
                      fontSize: 18,
                    }}>
                    {translate('YOU SIGNED UP BUT DID NOT APPEAR')}
                  </Text>
                )}
              </View>
            )}
            {/* <Text
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
              {this.props.item.data.PastStatus == 'true'
                ? ' agreed '
                : ' refuse '}
              to join the event
            </Text> */}
          </Body>
        </CardItem>
      </Card>
    );
  }
}
