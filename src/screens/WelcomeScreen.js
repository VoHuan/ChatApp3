import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Alert,
    BackHandler,
    PermissionsAndroid
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Constants from '../ultils/Constants';

import RNBluetoothClassic, { BluetoothEventType } from 'react-native-bluetooth-classic';





const WelcomeScreen = (props) => {



    //navigation
    const { navigation, route } = (props)
    // functions of navigate to/back
    const { navigate, goBack } = navigation

    const [start, setStart] = useState(false)
    const [name, setName] = useState('')

    
    useEffect(() => {
        checkBluetoothStatus();
    }, []);

    
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
                // if (res != true) {
                //     BackHandler.exitApp();
                // }
            } catch (error) {
                console.log(error)
                if (error.message === "User did not enable Bluetooth") {
                    BackHandler.exitApp();
                }
            }

        }
    };

    const requestAccessFineLocationPermission = async () => {
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
      };

    return <View style={styles.container}>


        <ImageBackground
            source={Constants.BACKGROUND}
            style={styles.background}></ImageBackground>

        <View style={styles.title}>
            <Text style={styles.textTitle}>Welcome To Chat App</Text>
        </View>



        <View style={styles.center}>
            <View style={styles.backgroundCenter}>
                <TextInput
                    style={styles.textInput}
                    maxLength={25}
                    onChangeText={setName}
                    placeholder="Enter your Name"
                //value={"Enter your Name"}
                ></TextInput>
                <TouchableOpacity
                    activeOpacity={0.5}
                    //disabled={start}
                    onPress={() => {
                        //checkBluetoothStatus()
                        navigate('ListUserScreen')
                    }}
                    style={styles.button}>
                    <Text style={styles.textButton}>Start</Text>
                </TouchableOpacity>
            </View>

        </View>



        <View style={{
            flex: 1,
        }}>
        </View>

    </View>

}
export default WelcomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 100,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    title: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        // backgroundColor: "green"
    },
    textTitle: {
        fontSize: 50,
        fontWeight: "bold",
        color: "white",
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    center: {
        flex: 1,
        //backgroundColor:"green",
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: "center",
    },
    backgroundCenter: {
        width: 300,
        height: 180,
        backgroundColor: "white",
        borderRadius: 15,
        justifyContent: 'center',
        //flexDirection: 'row',
        //alignItems: "center",
    },
    textInput: {
        height: 48,
        backgroundColor: "white",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CCDAF1',
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginBottom: 15
    },
    button: {
        backgroundColor: "#4657ED",
        //width: 300,
        height: 48,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
    },
    textButton: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold"
    }
})