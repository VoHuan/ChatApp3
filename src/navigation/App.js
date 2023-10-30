import {
    Alert,
    BackHandler,
    PermissionsAndroid,
    Platform
} from 'react-native';
import React, { useEffect, useState } from "react";
import WelcomeScreen from '../screens/WelcomeScreen'
import ListUserScreen from "../screens/ListUserScreen"
import Chat from "../screens/Chat";
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { MenuProvider } from 'react-native-popup-menu';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

const Stack = createNativeStackNavigator()

function App(props) {
    const [enable, setEnable] = useState(false)
    useEffect(() => {
        checkBluetoothStatus();
    }, []);

    useEffect(() => {
        if (enable) {
            try {
                let device = RNBluetoothClassic.accept({
                    CONNECTOR_TYPE: "rfcomm",
                    DELIMITER: '\r',
                    SECURE_SOCKET: false,
                    DEVICE_CHARSET: "utf-8",
                })
                console.log("device accept:")
                console.log(device)
            } catch (error) {
                console.log("error of accept")
            }
        }

    }, [enable]);

    const checkBluetoothStatus = async () => {
        const available = await RNBluetoothClassic.isBluetoothAvailable();
        const enabled = await RNBluetoothClassic.isBluetoothEnabled();
        const request = await requestAccessFineLocationPermission();
        if (!request) {
            Alert.alert("you have denied the access Fine Location Permission ")
            BackHandler.exitApp();
        }
        if (!available) {
            Alert.alert("Your device cannot operate this application ")
            BackHandler.exitApp();
        }
        if (!enabled) {
            try {
                const res = await RNBluetoothClassic.requestBluetoothEnabled();
                console.log(res)
                setEnable(res)
            } catch (error) {
                console.log(error)
                if (error.message === "User did not enable Bluetooth") {
                    BackHandler.exitApp();
                }
            }

        }
    };

    const requestAccessFineLocationPermission = async () => {
        if (Platform.Version >= 31) {
            permissions = [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ];
            const granted = await PermissionsAndroid.requestMultiple(permissions);
            return granted
        }
        else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Access fine location required for discovery',
                    message:
                        'In order to perform discovery, you must enable/allow ' +
                        'fine location access.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

    };
    return <ActionSheetProvider>
        <MenuProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName='WelcomeScreen' screenOptions={{
                    headerShown: false
                }}>
                    <Stack.Screen name={"WelcomeScreen"} component={WelcomeScreen} />
                    <Stack.Screen name={"ListUserScreen"} component={ListUserScreen} />
                    <Stack.Screen name={"Chat"} component={Chat} />
                </Stack.Navigator>
            </NavigationContainer>
        </MenuProvider>
    </ActionSheetProvider>
}
export default App