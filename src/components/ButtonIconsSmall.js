import React from 'react';
import { Text, TouchableOpacity, Animated } from 'react-native';
import { mainStyles } from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { translate } from '../../translations';

export default class ButtonIconsSmall extends React.Component {

  onPress() {
    if (this.props.click != null) {
      this.props.click();
    }
  }

  onLongPressButton() {
    if (this.props.onLongPress != null) {
      this.props.onLongPress();
    }
  };

  render() {
    return (
      <Animated.View>
        <TouchableOpacity
          onPress={() => {
            this.onPress();
          }}
          onLongPress={() => {
            this.onLongPressButton();
          }}
          style={[
            {
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              borderColor: '#ffffff',
              borderWidth: 2,
              width: 135,
              height: 100,
              backgroundColor:
                this.props.title === translate('EMERGENCY') ? '#f3212d' : '#96f321',
            },
          ]}>
          <FontAwesome5
            name={this.props.icon}
            size={35}
            color={this.props.title === translate('EMERGENCY') ? '#ffffff' : '#180D59'}
          />
          <Text
            style={[
              {
                color: this.props.title === translate('EMERGENCY') ? '#ffffff' : '#180D59',
                fontSize: 15,
                textAlign: 'center'
              },
            ]}>
            {this.props.title}
          </Text>
        </TouchableOpacity>
      </Animated.View>

    );
  }
}
