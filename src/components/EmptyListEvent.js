import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { translate } from '../../translations';

export default class EmptyListEvent extends React.Component {
  render() {
    return (
      <View style={[styles.EmptyContainer]}>
        <FontAwesome5
          name="calendar-week"
          size={50}
          color="#180D59"
          textAlign="center"
        />
        <Text
          style={{
            margin: 10,
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#180D59',
          }}>
          {translate("No Events")}
        </Text>
        <Text
          style={{
            fontSize: 14,
            textAlign: 'center',
            color: '#180D59',
          }}>
          {translate("Relevant events will appear in this space")}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  EmptyContainer: {
    backgroundColor: '#ffffffaa',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderRadius: 10,
    borderColor: '#180D59',
    borderWidth: 1,
    margin: 35,
    padding: 10,
  },
});
