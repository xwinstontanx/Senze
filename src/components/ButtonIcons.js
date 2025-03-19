import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {mainStyles} from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default class ButtonIcons extends React.Component {
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
        style={
          {
            alignContent:'center',
            alignItems:'center',
            borderRadius: 10,
            borderWidth: 2,
            borderColor: '#180D59',
            padding: 10,
            width: '80%',
            height: 100,
            backgroundColor: '#ffffff',
            marginBottom: 20,
          }
        }>
        <Text style={[{color: '#180D59', fontSize: 23, textAlign:'center'}]}>
          {this.props.title}
        </Text>
        <FontAwesome5 name={this.props.icon} size={40} color="#180D59" />
      </TouchableOpacity>
    );
  }
}
