import {createStackNavigator} from 'react-navigation';
import Login from './Login';
import Chat from './Chat';

export default createStackNavigator({
  LoginScreen: {
    screen: Login,
    navigationOptions: () => ({
      title: `Login`,
      headerBackTitle: null
    }),
  },
  ChatScreen: {
    screen: Chat,
    navigationOptions: () => ({
      title: `Group Chat`,
      headerBackTitle: null
    }),
  }
})