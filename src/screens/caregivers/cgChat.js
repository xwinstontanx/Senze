import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { Text } from 'native-base';
import { connect } from 'react-redux';

import { mainStyles } from '../../styles/styles';
import Spinner from 'react-native-loading-spinner-overlay';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { translate } from '../../../translations';

import Swipeout from 'react-native-swipeout';
import EmptyChat from '../../components/EmptyChat';
import ChatCard from '../../components/ChatCard';

let dbRefChat;

class cgChat extends Component {
  _isMounted = false;
  state = {
    senior: this.props.navigation.state.params.senior,
    isFetching: true,
    isLoading: false,
    content: '',
    chats: []
  };

  componentDidMount() {
    this._isMounted = true;
    dbRefChat = firestore().collection('VolunteerChats').doc(this.state.senior.data.Uid).collection('Chats');
    this.getData();
  }

  getData = () => {
    dbRefChat.orderBy('CreatedAt', 'desc')
      .onSnapshot(snapshot => {
        this.setState({ chats: [] })
        if (!snapshot.empty) {
          let chats = snapshot.docs;
          chats.forEach(chat => {
            data = chat.data();
            this.setState({ chats: [...this.state.chats, data] })
          })
        }

        this.setState({
          isFetching: false,
        });
      });


  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  //render List
  renderListActivity = ({ item }) => {

    return (
      <ChatCard
        item={item}
        myUid={this.props.profile.Uid}
      />
    );
  };

  ListEmpty = () => {
    return <EmptyChat />;
  };

  render() {
    return (
      // <ImageBackground
      //   style={styles.imgBackground}
      //   resizeMode="cover"
      //   source={require('../../assets/bg.png')}>
      <SafeAreaView style={styles.container}>
        <View style={{
          flex: 1,
        }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <TouchableOpacity
              style={styles.back}
              onPress={() => {
                this.props.navigation.navigate('cgseniordetails');
              }}>
              <Icon name="arrow-circle-left" size={40} color="#2196f3" />
            </TouchableOpacity>
            <Text style={styles.greeting}>
              {translate('Chat')}
            </Text>
          </View>

          <View style={{ margin: 8, flex: 10, }}>
            <FlatList
              inverted={true}
              // onRefresh={() => this.getData()}
              refreshing={this.state.isFetching}
              data={this.state.chats}
              keyExtractor={(item, index) => index}
              renderItem={this.renderListActivity}
              // Performance settings
              removeClippedSubviews={true} // Unmount components when outside of window
              initialNumToRender={2} // Reduce initial render amount
              maxToRenderPerBatch={1} // Reduce number in each render batch
              updateCellsBatchingPeriod={200} // Increase time between renders
              windowSize={4} // Reduce the window size
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              margin: 8
            }}>
            <TextInput
              style={[styles.input, { flex: 8 }]}
              autoCapitalize="none"
              onChangeText={content => this.setState({ content })}
              value={this.state.content}
            />
            <TouchableOpacity
              style={{ flex: 1, alignSelf: 'center' }}
              onPress={() => {
                if (this.state.content !== "") {
                  firestore().collection('VolunteerChats').doc(this.state.senior.data.Uid).collection('Chats')
                    .add({
                      "Content": this.state.content,
                      "CreatedAt": firestore.FieldValue.serverTimestamp(),
                      "IsSystem": false,
                      "Name": this.props.profile.Name,
                      "Uid": this.props.profile.Uid
                    }).then(() => {
                      this.setState({ content: "", isFetching: true, })
                    })
                }
              }}>
              <Icon style={{
                top: 10,
                left: 10,
              }} name="paper-plane" size={25} color="#2196f3" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      // {this.state.isLoading &&
      //   <Spinner
      //     color={'#2196f3'}
      //     overlayColor={'#ffffff99'}
      //     visible={true}
      //     tintColor="#123456"
      //     textContent={translate('LOADING') + '...'}
      //     textStyle={mainStyles.spinnerTextStyle} />}
      // </ImageBackground>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  back: {
    top: 15,
    left: 15,
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  greeting: {
    top: 15,
    left: 26,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#2196f3',
    flex: 1,
    flexWrap: 'wrap'
  },
  topLeft: {
    alignItems: 'flex-start',
    top: 15,
    marginBottom: 30,
    left: 16,
    fontSize: 30,
    textAlign: 'left',
    color: '#ffffff',
  },
  input: {
    borderBottomColor: '#2196f3',
    borderBottomWidth: 1,
    height: 50,
    fontSize: 16,
    color: '#161F3D',
  },
});

const mapStateToProps = state => ({
  profile: state.main.profile,
});

export default connect(mapStateToProps)(cgChat);
