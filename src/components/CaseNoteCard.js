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

export default class CaseNoteCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showHealthVitals: false,
      showAttachment: false,
    };
  }

  getActivity(item) {
    if (item.Activity != "Other") {
      return item.Activity
    } else {
      return item.OtherActivity
    }
  }

  render() {
    const { item } = this.props;
    const { Type, TimeIn, TimeOut, LastUpdated, HeartRate, SpO2, Temperature, BloodPressure, BloodGlucose, Duration, Followup, Remark, FilePath, OtherActivity } = item;
    const Activity = this.getActivity(item)

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
              name="file-medical"
            />
            <Grid>
              <Row>
                <Text style={styles.cardTitleText}>{Type}</Text>
              </Row>
            </Grid>
          </Left>
        </CardItem>
        <CardItem
          style={{
            borderRadius: 10,
          }}>
          <Body>

            <Section title={translate('ACTIVITY') + ':'} content={Activity} />
            {OtherActivity !== '' &&
              <>
                <Section title={translate('Other Activity') + ':'} content={OtherActivity} />
              </>}

            <Section title={translate('TIME IN') + ':'} content={TimeIn} />
            <Section title={translate('TIME OUT') + ':'} content={TimeOut} />
            <Section title={translate('DURATION') + ':'} content={Duration} />
            <Section title={translate('REQUIRES FOLLOW-UP') + ':'} content={Followup === true ? translate('YES') : translate('NO')} />
            <Section title={translate('REMARK') + ':'} content={Remark} />

            <View style={[{ marginTop: 10, flexDirection: 'column', alignSelf: 'stretch', justifyContent: 'space-between', }]}>
              {Type == "Home Nursing" && <>
                <Pressable
                  style={[{ flex: 1 }, styles.button]}
                  onPress={() => {
                    this.RBSheet.open()
                    this.setState({ showHealthVitals: true, showAttachment: false })
                  }}>
                  <Text style={styles.textStyle}>{translate('HEALTH VITALS')}</Text>
                </Pressable>
              </>}

              {FilePath !== undefined && <>
                <Pressable
                  style={[{ flex: 1 }, styles.button]}
                  onPress={() => {
                    this.RBSheet.open()
                    this.setState({ showHealthVitals: false, showAttachment: true })
                  }}>
                  <Text style={styles.textStyle}>{translate('Attachment')}</Text>
                </Pressable>
              </>}
            </View>

            <View style={{ flex: 0, justifyContent: "flex-start", alignItems: "stretch" }}>
              <RBSheet
                ref={ref => {
                  this.RBSheet = ref;
                }}
                height={450}
                openDuration={250}
                customStyles={{
                  container: {
                    justifyContent: "center",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 10
                  },
                }}
              >

                <View style={{ flex: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  {this.state.showHealthVitals === true &&
                    <>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#180D59',
                        marginLeft: 10
                      }}>{translate('HEALTH VITALS')}:</Text>
                    </>}
                  {this.state.showAttachment === true &&
                    <>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#180D59',
                        marginLeft: 10
                      }}>{translate('Attachment')}:</Text>
                    </>}
                  <TouchableOpacity
                    style={{ marginTop: 5, marginRight: 5, alignItems: 'flex-end' }}
                    onPress={() => {
                      this.RBSheet.close();
                      this.setState({ showHealthVitals: false, showAttachment: false })
                    }}>
                    <FontAwesome5 name="times-circle" size={35} color="#180D59" />
                  </TouchableOpacity>

                </View>

                {this.state.showHealthVitals === true && <>

                  <View style={styles.healthContainer}>
                    <Image style={styles.icon} source={require('../assets/heartRate.png')} />
                    <View>
                      <Section title={translate('HEART RATE') + ' (BPM):'} content={HeartRate} />
                    </View>
                  </View>
                  <View style={styles.healthContainer}>
                    <Image style={styles.icon} source={require('../assets/spo.png')} />
                    <View>
                      <Section title={translate('SPO2') + ' (%):'} content={SpO2} />
                    </View>
                  </View>

                  <View style={styles.healthContainer}>
                    <Image style={styles.icon} source={require('../assets/temp.png')} />
                    <View>
                      <Section title={translate('TEMPERATURE') + ' (\u00b0C):'} content={Temperature} />
                    </View>
                  </View>

                  <View style={styles.healthContainer}>
                    <Image style={styles.icon} source={require('../assets/bp.png')} />
                    <View>
                      <Section title={translate('BLOOD PRESSURE') + ' (mmHg):'} content={BloodPressure} />
                    </View>
                  </View>

                  <View style={styles.healthContainer}>
                    <Image style={styles.icon} source={require('../assets/bloodGlucose.png')} />
                    <View>
                      <Section title={translate('BLOOD GLUCOSE') + ' (mmol/L):'} content={BloodGlucose} />
                    </View>
                  </View>
                </>}
                {this.state.showAttachment === true && <>
                  <Image
                    style={styles.stretch}
                    source={{ uri: FilePath }}
                  />
                </>}
              </RBSheet>
            </View>

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
    backgroundColor: themeVariables.brandSuccess,
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
