import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import styled from 'styled-components';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default class HealthCheckContain extends React.Component {

  onClick = () => {
    if (this.props.onClick != null) {
      this.props.onClick();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container1}>
          <DataImage source={this.props.icon} />
          <Text
            onPress={() => {
              this.onClick();
            }}
            style={[
              {
                marginLeft: 10,
                color: '#180D59',
                fontSize: RFValue(16),
                textAlign: 'left',
              },
            ]}>
            {this.props.title}
          </Text>
        </View>


        <View style={styles.container2}>
          <Text
            onPress={() => {
              this.onClick();
            }}
            style={[
              {
                color: '#180D59',
                fontSize: RFValue(28),
                textAlign: 'center',
              },
            ]}>
            {this.props.value}
          </Text>
          <Text
            onPress={() => {
              this.onClick();
            }}
            style={[{ color: '#180D59', fontSize: RFValue(12), textAlign: 'center', marginLeft:3 }]}>
            {this.props.unit}
          </Text>
        </View>
      </View>
    );
  }
}

const DataImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 12px;
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
    borderRadius: 10,
    // borderWidth: 1,
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  container1: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    alignContent: 'flex-start',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  container2: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    alignContent: 'flex-end',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
