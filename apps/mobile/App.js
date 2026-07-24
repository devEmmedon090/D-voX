import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Register  from './screens/Register';
import Login from './screens/Login';
import Welcome from './screens/Welcome';  
import ElectionList from './screens/ElectionList';
import Vote from './screens/Vote';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="ElectionList" component={ElectionList} />
        <Stack.Screen name="Vote" component={Vote} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
