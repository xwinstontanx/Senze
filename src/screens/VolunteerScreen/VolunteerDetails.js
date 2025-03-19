import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import SimpleDialog from '../../components/SimpleDialog';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import { connect } from 'react-redux';
import { translate } from '../../../translations';
import UserAvatar from 'react-native-user-avatar';

class VolunteerDetails extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      OrganizationName: '',
      errorMessage: null,
      showDialog: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    
    // Get organization name
    firestore()
      .collection('Organization')
      .doc(this.props.profile.OrganizationId)
      .get()
      .then((snapshot) => {
        const data = snapshot.data()
        if (data != null) {
          this.setState({
            OrganizationName: data.OrganizationName
          })
        }
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <KeyboardAvoidingView>
            <View style={styles.container}>
              <StatusBar barStyle="light-content" />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                <TouchableOpacity
                  style={styles.back}
                  onPress={() => {
                    this.props.navigation.pop();
                  }}>
                  <Icon name="arrow-circle-left" size={40} color="#2196f3" />
                </TouchableOpacity>
                <Text style={styles.title}>
                  {translate('Profile Badge')}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.centeredView}>
                <View style={{ flexDirection: 'column' }}>
                  <UserAvatar size={250} name={this.props.profile.Name} src={this.props.profile.ProfilePic} />
                </View>
              </View>

              <View style={styles.centeredView2}>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.name}>{this.props.profile.Name}</Text>
                  <Text style={styles.org}>{this.state.OrganizationName}</Text>
                </View>
              </View>
            </View>

          </KeyboardAvoidingView>
        </ScrollView>
        
        <SimpleDialog
          modalVisible={this.state.showDialog}
          onModalClosed={() => {
            this.setState({ showDialog: false });
          }}
          errorMessage={this.state.errorMessage}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  card: {
    margin: 10,
    marginTop: 70,
    borderWidth: 3,
    borderRadius: 20,
    borderColor: '#A9A9A9',
    backgroundColor: '#DCDCDC'
  },
  name: {
    top: 15,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
    color: '#180D59',
  },
  org: {
    top: 15,
    marginTop: 10,
    fontSize: 22,
    textAlign: 'center',
    color: '#180D59',
  },
  title: {
    top: 15,
    left: 26,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#180D59',
    flex: 1,
    flexWrap: 'wrap'
  },
  form: {
    marginHorizontal: '8%',
    margin: '4%',
  },
  back: {
    top: 15,
    left: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
  },
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 70,
  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#2196F3',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 10,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(VolunteerDetails);
