import React, { Component } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Image
} from 'react-native';
import { Left, Body, Card, CardItem, Grid, Row, Icon } from 'native-base';

import themeVariables from '../../native-base-theme/variables/material_copy';
import firestore from '@react-native-firebase/firestore';
import { translate } from '../../translations';
import moment from 'moment';
import RBSheet from "react-native-raw-bottom-sheet";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import dateformat from 'dateformat';

export default class ChatCard extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { item } = this.props;
    const { myUid } = this.props;
    const { Content, CreatedAt, IsSystem, Name, Uid } = item;

    let timestamp = "";
    if (item.CreatedAt === null) {
      timestamp = "";
    }
    else {
      timestamp = dateformat(
        item.CreatedAt.toDate(),
        'yyyy-mm-dd hh:MM:ss',
      )
    }

    return (
      IsSystem ? (Content === "Emergency Triggered" ?
        <View style={{ marginBottom: 15 }}>
          <Text
            style={[styles.contentSystemRedText, { fontWeight: 'bold' }]}>{item.Content}</Text>
          <Text
            style={styles.contentSystemRedText}>{timestamp}</Text>
        </View > : <View style={{ marginBottom: 15 }}>
          <Text
            style={[styles.contentSystemGreenText, { fontWeight: 'bold' }]}>{item.Content}</Text>
          <Text
            style={styles.contentSystemGreenText}>{timestamp}</Text>
        </View >)
        : myUid === Uid ? <View style={{ marginBottom: 15 }}>
          <Text
            style={styles.contentMyselfText}>{item.Name}, {timestamp}</Text>
          <Text
            note
            style={styles.contentBGMyselfText}>{item.Content}</Text>
        </View> : <View style={{ marginBottom: 15 }}>
          <Text
            style={styles.contentText}>{item.Name}, {timestamp}</Text>
          <Text
            note
            style={styles.contentBGText}>{item.Content}</Text>
        </View>

    );
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: themeVariables.brandSuccess,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardContainer: {
    flex: 1,
    flexWrap: 'wrap',
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
  contentTitleText: {
    color: '#180D59',
    fontSize: 14,
  },
  contentText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  contentMyselfText: {
    alignSelf: 'flex-end',
    color: '#A0A0A0',
    fontSize: 12,
  },
  contentBGText: {
    padding: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#D5D5D5',
    borderRadius: 10,
    color: '#000000',
    fontSize: 14,
  },
  contentBGMyselfText: {
    padding: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#2196f3',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  contentSystemRedText: {
    alignSelf: "center",
    color: '#ff0000',
    fontSize: 14,
  },
  contentSystemGreenText: {
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    color: '#66AA00',
    fontSize: 14,
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
  button: {
    borderRadius: 20,
    elevation: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: themeVariables.brandSuccess,
  },
  stretch: {
    height: '85%',
    resizeMode: 'contain'
  },
  icon: {
    width: 45,
    height: 45,

    marginRight: 20,
    justifyContent: 'center',
  },
  healthContainer: {
    flexDirection: 'row',
    margin: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
});
