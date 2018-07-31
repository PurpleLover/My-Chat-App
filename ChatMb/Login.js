import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity
} from 'react-native';
import SocketIOClient from 'socket.io-client';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    };

    // this.socket = SocketIOClient('http://localhost:3000', { jsonp: false });
  }

  _handleChangeText = (text) => {
    this.setState({
      username: text
    });
  }

  sendUsername = () => {
    if (this._checkvalid(this.state.username)) {
      this.props.navigation.navigate('ChatScreen', {
        username: this.state.username
      });
    }
  }

  _checkvalid = (username) => username.match(/[A-Z]\w{4,}/);

  render() {
    return (
      <View style={{ marginTop: 40, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Your Username</Text>
        <TextInput
          style={{ height: 36, alignSelf: 'stretch' }}
          value={this.state.username}
          onChangeText={this._handleChangeText}
          placeholder={'Your designated username'}
          autoFocus
        />
        <TouchableOpacity onPress={this.sendUsername}>
          <Text>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}