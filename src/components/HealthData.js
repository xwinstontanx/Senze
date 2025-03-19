import React from 'react';
import { View, StyleSheet } from 'react-native';
import styled from 'styled-components';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default class HealthData extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <DataImage source={this.props.icon} />
        <View style={styles.container1}>

          <Text
            style={[
              {
                color: '#180D59',
                fontSize: 18,
                textAlign: 'center',
              },
            ]}>
            {this.props.title}
          </Text>
        </View>

        <View style={styles.container2}>
          <Text
            style={[
              {
                color: '#180D59',
                fontSize: 20,
                textAlign: 'center',
                paddingRight: 5,
                fontWeight: 'bold',
              },
            ]}>
            {this.props.value}
          </Text>
          <Text style={[{ color: '#180D59', fontSize: this.props.unit === 'mmHg' || this.props.unit === 'mmol/L' || this.props.unit === 'kg' ? 14 : 14, textAlign: 'center' }]}>
            {this.props.unit}
          </Text>
        </View>
      </View>
    );
  }
}

const DataImage = styled.Image`
  width: 35px;
  height: 35px;
  border-radius: 8px;
`;

const Text = styled.Text`
  color: ${props => (props.dark ? '#000' : '#fff')};
  font-family: 'AvenirNext-Regular';
  ${({ title, large, small }) => {
    switch (true) {
      case title:
        return `font-size: 32px`;
      case large:
        return `font-size: 24px`;
      case small:
        return `font-size: 14px`;
    }
  }}
  ${({ bold, heavy }) => {
    switch (true) {
      case bold:
        return `font-weight: 600`;
      case heavy:
        return `font-weight: 700`;
    }
  }}
`;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderColor: '#180D59',
    borderWidth: 0,
    borderRadius: 10,
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffaa',
    paddingLeft: 10,

  },
  container1: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    alignContent: 'space-between',
    alignItems: 'center',
  },
  container2: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    alignContent: 'flex-end',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10
  },
});
