import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styled from 'styled-components';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default class VitalsHistoryButton extends React.Component {
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
          <DataImage source={this.props.icon} />
          <Text style={styles.buttonText}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const DataImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 8px;
`;

const styles = StyleSheet.create({
  button: {
    color: '#180D59',
    textAlign: 'center',
    borderColor: '#180D59',
    borderWidth: 2,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    paddingLeft: 25,
    backgroundColor: '#FFFFFFAA',
    borderRadius: 25,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#180D59',
    textAlign: 'center',
    marginLeft: 20,
    fontSize: 23,
  },
  icon: {
    marginTop: 5,
    height: 30,
  },
});
