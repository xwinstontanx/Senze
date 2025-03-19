import React, { Component } from 'react';
import {
  Text,
  StyleSheet
} from 'react-native';
import { Left, Body, Card, CardItem, Grid, Row, Icon } from 'native-base';

import themeVariables from '../../native-base-theme/variables/material_copy';
import firestore from '@react-native-firebase/firestore';
import { translate } from '../../translations';


export default class MedicationReminder extends React.Component {
  render() {
    const { item } = this.props;
    const { id, title, Reminder1, Reminder2, Reminder3, dosage, numberOfTime, afterMeal } = item;
    return (
      <Card
        style={styles.cardContainer}>
        <CardItem
          header
          bordered
          style={styles.card}>
          <Left
            style={styles.left}>
            <Icon
              type="FontAwesome5"
              style={{ color: '#180D59' }}
              name="pills"
            />
            <Grid>
              <Row>
                <Text style={styles.cardTitleText}>{title}</Text>
              </Row>
            </Grid>
          </Left>
        </CardItem>
        <CardItem
          style={{
            borderRadius: 10,
          }}>
          <Body>
            <Section title={translate('DOSAGE') + ': '} content={dosage + (afterMeal ? ', ' + translate('AFTER MEAL') : ', ' + translate('BEFORE MEAL'))} />
            <Section title={translate('FREQUENCY') + ': '} content={`${numberOfTime} times / day`} />
            <Section title={translate('REMINDER TIME(S)') + ': '}content={Reminder1 + ' ' + Reminder2+ ' ' + Reminder3} />
          </Body>
        </CardItem>

      </Card>
    );
  }
}

const Section = ({ title, content }) => (
  <>
    <Text
      note
      style={styles.titleText}>{title}</Text>
    <Text
      note
      style={styles.contentText}>{content}</Text>
  </>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F4EA56',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardContainer: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 10,
  },
  cardTitleText: {
    color: '#180D59',
    fontWeight: 'bold',
    fontSize: 22,
    marginLeft: 10,
  },
  left: {
    marginTop: -10,
    marginBottom: -10,
  },
  titleText: {
    color: '#180D5988',
    fontSize: 16,
    marginTop: 10,
  },
  contentText: {
    color: '#180D59',
    fontSize: 18,
  },
  button: {
    borderRadius: 20,
    elevation: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#ff8157',
    flex: 1,
  },
  buttonEdit: {
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
