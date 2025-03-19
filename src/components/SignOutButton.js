import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { translate } from '../../translations';

export default class SignOutButton extends React.Component {
  render() {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (this.props.onClick != null) {
            this.props.onClick();
          }
        }}>
        <View style={styles.buttonContent}>
          <FontAwesome5
            name="sign-out-alt"
            size={30}
            color="#ffffff"
            style={styles.icon}
          />
          <Text style={styles.buttonTextWhite}>{translate('SIGN OUT')}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    textAlign: 'center',
    borderColor: '#ff5b24',
    borderWidth: 2,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    paddingLeft: 25,
    backgroundColor: '#ff5b24',
    borderRadius: 25,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
  },
  buttonTextWhite: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginLeft: 20,
    fontSize: 23,
  },
  icon: {
    marginTop: 5,
    height: 30,
  },
});
