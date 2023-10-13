import React from "react";
import WelcomeScreen from '../screens/WelcomeScreen'
import ListUserScreen from "../screens/ListUserScreen"
import Chat from "../screens/Chat";
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'


const Stack = createNativeStackNavigator()

function App(props) {
    return  <NavigationContainer>
                <Stack.Navigator initialRouteName='WelcomeScreen' screenOptions={{
                    headerShown: false
                }}>
                    <Stack.Screen name={"WelcomeScreen"} component={WelcomeScreen} />
                    <Stack.Screen name={"ListUserScreen"} component={ListUserScreen} />
                    <Stack.Screen name={"Chat"} component={Chat} />
                </Stack.Navigator>
            </NavigationContainer>
}
export default App