import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { mainStyles } from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { translate } from '../../translations';

export default class ButtonAlertSmall extends React.Component {
  onPress() {
    if (this.props.click != null) {
      this.props.click();
    }
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.onPress();
        }}
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            borderColor: '#ffffff',
            borderWidth: 2,
            width: 120,
            height: 70,
            backgroundColor:
              this.props.title === translate('CALL') ? '#f3212d' : '#96f321',
          },
        ]}>
        <FontAwesome5
          name={this.props.icon}
          size={25}
          color={this.props.title === translate('CALL') ? '#ffffff' : '#180D59'}
        />
        <Text
          style={[
            {
              color: this.props.title === translate('CALL') ? '#ffffff' : '#180D59',
              fontSize: 14,
            },
          ]}>
          {this.props.title}
        </Text>
      </TouchableOpacity>
    );
  }
}
