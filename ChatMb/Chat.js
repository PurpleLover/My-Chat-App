/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  AsyncStorage, StyleSheet, View, Text, FlatList,
  TextInput, TouchableOpacity,
} from 'react-native';
import {
  Tabs, Tab, TabHeading, Content
} from 'native-base';

import SocketIOClient from 'socket.io-client';
import { convertDateTimeToString } from './ModifyTime';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      onlUsers: [],
      textMessage: '',
      isTyping: false,
      whoTyping: '',
      refreshing: false,
      countLoadMore: 1,
      username: this.props.navigation.state.params.username,
      currentTabIndex: 0,
    };

    this.socket = SocketIOClient('http://localhost:3000', { jsonp: false });
    this.socket.on('load_message_history', (data) => {
      this.setState({
        data: this.state.data.concat(data.reverse())
      })
    });
    this.socket.on('new_message', (data) => {
      this.setState({
        data: this.state.data.concat(data),
        isTyping: false
      })
    });
    this.socket.on('typing', (data) => {
      this.setState({
        isTyping: true,
        whoTyping: data.username
      });
    });
    this.socket.on('load_more_message_history', (data) => {
      this.setState({
        data: data.reverse().concat(this.state.data)
      });
    });
    this.socket.on('change_username', (data) => {
      alert(isArray(data.isArray()));
      this.setState({
        onlUsers: this.state.onlUsers.concat(data)
      })
    });
  }

  _renderOnlineUsers = (item, index) => {
    return (
      <View style={{marginTop: 30}}>
        <TouchableOpacity>
          <Text>{item}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderItems = ({ item }) => {
    //alert(item.created);
    if (item.username === this.state.username) {
      return (
        <View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={[styles.chatterMessageContainer, { alignItems: 'flex-end' }]}>
              <View style={[styles.chatterMessageContent, { backgroundColor: '#0082ba', justifyContent: 'flex-end', marginLeft: 50 }]}>
                <Text style={[styles.chatterReadMessage, { color: '#fff', textAlign: 'left' }]}>
                  {item.message}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.timeCreatedText}>
                  {convertDateTimeToString(item.created)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={[styles.chatterMessageContainer, { alignItems: 'flex-start' }]}>
              <Text style={styles.chatterUnreadMessage}>
                {item.username}
              </Text>
              <View style={[styles.chatterMessageContent, { backgroundColor: '#bdc6cf', justifyContent: 'flex-start', marginRight: 50 }]}>
                <Text style={[styles.chatterReadMessage, { color: '#000', textAlign: 'left' }]}>
                  {item.message}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={styles.timeCreatedText}>
                  {convertDateTimeToString(item.created)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
  }

  _handleTextChange = (text) => {
    this.setState({
      textMessage: text
    });
  }

  _onSendMessage = () => {
    this.socket.emit('new_message', { message: this.state.textMessage, created: new Date() }, (err) => {
      console.log('Error: ' + err);
    });
    this.setState({
      textMessage: ''
    });
    this._scrollToEnd();
  }

  componentDidMount = () => {
    this.socket.emit('change_username', { username: this.state.username }, (data) => {
      if (data) {
        //Navigate to chat room
        console.log(data);
      } else {
        //Modal error
        console.log('err');
      }
    });
    this._scrollToEnd();
  }

  _scrollToEnd = () => {
    setTimeout(() => this.flatList.scrollToEnd(), 200);
  }

  componentDidUpdate = () => {
    // setTimeout(() => this.flatList.scrollToEnd(), 200);
  }

  _onTypingMessage = () => {
    this.socket.emit('typing');
  }

  _handleRefresh = () => {
    this.setState({
      refreshing: true,
    }, () => this._loadMoreHistory());
  }

  _loadMoreHistory = () => {
    this.socket.emit('load_more_message_history', this.state.countLoadMore);
    this.setState({
      refreshing: false,
      countLoadMore: ++this.state.countLoadMore
    });
  }

  render() {
    let sendButtonStatus = false,
      sendButtonStyle = { color: 'blue', fontStyle: 'italic' };
    if (this.state.textMessage.trim() === '') {
      sendButtonStatus = true;
      sendButtonStyle = { color: 'grey', fontWeight: 'bold' };
    }

    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }} >
        <Tabs
          initialPage={this.state.currentTabIndex}
          onChangeTab={(currentTabIndex) => this.setState({ currentTabIndex })}
        >
          <Tab
            heading={
              <TabHeading>
                <Text>Group Chat</Text>
              </TabHeading>
            }>
            <Content>
              <View style={{ flex: 10 }}>
                <FlatList
                  data={this.state.data}
                  renderItem={this._renderItems}
                  keyExtractor={(item, index) => index.toString()}
                  ref={ref => this.flatList = ref}
                  refreshing={this.state.refreshing}
                  onRefresh={this._handleRefresh}
                  onEndReached={this._scrollToEnd}
                />
              </View>
              {
                this.state.isTyping && <Text style={{ fontStyle: 'italic', fontSize: 12 }}>{this.state.whoTyping} is typing...</Text>
              }
              <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', backgroundColor: 'lightGrey' }}>
                <TextInput
                  style={{ height: 36, marginLeft: 20 }}
                  placeholder={'Send here'}
                  onChangeText={this._handleTextChange}
                  onKeyPress={this._onTypingMessage}
                  value={this.state.textMessage}
                />
                <TouchableOpacity
                  onPress={this._onSendMessage}
                  style={{ marginHorizontal: 10 }}
                  disabled={sendButtonStatus}
                >
                  <Text style={sendButtonStyle}>Send</Text>
                </TouchableOpacity>
              </View>
            </Content>
          </Tab>

          <Tab
            heading={
              <TabHeading>
                <Text>Online Users</Text>
              </TabHeading>
            }>
            <Content>
              <View style={{ flex: 10 }}>
                <FlatList
                  data={this.state.data}
                  renderItem={this._renderOnlineUsers}
                  keyExtractor={(item, index) => index.toString()}
                  // ref={ref => this.flatList = ref}
                  // refreshing={this.state.refreshing}
                  // onRefresh={this._handleRefresh}
                  // onEndReached={this._scrollToEnd}
                />
              </View>
            </Content>
          </Tab>
        </Tabs>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  timeCreatedText: {
    fontStyle: 'italic',
    fontSize: 12,
    color: 'black'
  }, chatterReadMessage: {
    fontSize: 14
  }, chatterUnreadMessage: {
    fontWeight: 'bold',
    fontSize: 14
  }, chatterMessageContent: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 15
  }, chatterMessageContainer: {
    flex: 6,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
    marginBottom: 15,
  }
});