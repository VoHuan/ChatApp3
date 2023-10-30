import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    Dimensions,
    TextInput,
    TouchableOpacity,
    FlatList,
    BackHandler
} from 'react-native';
import React, { useEffect, useRef, useState, } from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome5'
import Constants from '../ultils/Constants';
import UserItem from './UserItem';
//import { BleManager } from 'react-native-ble-plx';
//import BleManager from 'react-native-ble-manager';
import { DeviceEventEmitter, PermissionsAndroid } from 'react-native';

import RNBluetoothClassic from 'react-native-bluetooth-classic';



const ListUserScreen = (props) => {

    //navigation
    const { navigation, route } = (props)
    // functions of navigate to/back
    const { navigate, goBack } = navigation



    const [scannedDevices, setScannedDevices] = useState([]);
    const [isoading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        scanDevices();
    }, []);
    useEffect(() => {
        console.log(scannedDevices)
    }, [scannedDevices]);

    const scanDevices = async () => {
        const available = await RNBluetoothClassic.isBluetoothAvailable();
        const enabled = await RNBluetoothClassic.isBluetoothEnabled();

        if (available && enabled) {
            try {
                //Scan devices
                const unpaired = await RNBluetoothClassic.startDiscovery();
                const paired = await RNBluetoothClassic.getBondedDevices();


                const outputList = [...unpaired, ...paired]
                    //get phone device (deviceClass === 524, majorClass === 512)
                    .filter((obj) => {
                        return (
                            obj.deviceClass &&
                            obj.deviceClass.deviceClass === 524 &&
                            obj.deviceClass.majorClass === 512
                        )
                    })
                    //Get the necessary information
                    .map(obj => ({
                        address: obj.address,
                        bonded: obj.bonded,
                        deviceClass: obj.deviceClass,
                        extra: obj.extra,
                        name: obj.name
                    }));

                setScannedDevices(outputList);
                setIsLoading(false)
            } catch (err) {
                console.log(err);
            } finally {
                //setLoading(false);
                //setLoadingText('');
            }
        }
    };


    // getter/setter
    const [searchText, setSearchText] = useState('')
    // get list food after fillter
    const filteredUser = () => scannedDevices.filter(eachUser => eachUser.name.toLowerCase().includes(searchText.toLowerCase()))



    const [selectAllButton, setSelectAllButton] = useState(true)
    return <View style={styles.container}>
        <View style={styles.header}>
            <Icon
                name="arrow-left"
                style={{ padding: 15 }}
                size={20}
                color='white'
                onPress={() => {
                    goBack()
                }}
            />
            <View style={styles.switchButton}>
                <TouchableOpacity style={styles.button}
                    onPress={() => {
                        setSelectAllButton(true)
                    }}>
                    {selectAllButton == true ? <ImageBackground
                        source={Constants.BACKGROUND_All_BUTTON}
                        style={styles.backgroundSmallBlueButton}>
                        <Text style={styles.textAllButton}>All</Text>
                    </ImageBackground> : <Text style={styles.textNearByButton}>All</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}
                    onPress={() => {
                        setSelectAllButton(false)
                    }}>
                    {selectAllButton == false ? <ImageBackground
                        source={Constants.BACKGROUND_NEARBY_BUTTON}
                        style={styles.backgroundSmallBlueButton}
                    >
                        <Text style={styles.textAllButton}>NearBy</Text>
                    </ImageBackground>
                        : <Text style={styles.textNearByButton}>NearBy</Text>}
                </TouchableOpacity>
            </View>

            <View style={{ padding: 15 }}>

            </View>

        </View>


        <View style={styles.SearchBar}>
            <TextInput style={styles.SearchText}
                onChangeText={(text) => {
                    setSearchText(text)
                }}
                maxLength={25}
                placeholder="Enter Name Here"
                underlineColorAndroid="transparent"
                autoCorrect={false}>

            </TextInput>
            <Icon
                name="search"
                style={{ paddingRight: 15 }}
                size={20}
                color='black'
                onPress={() => {

                }}
            />


        </View>

        {/* loading animated */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Spinner visible={isLoading}
                color='#357FEE'
                textContent={'Scanning Deivices...'}
                textStyle={styles.spinnerTextStyle}
                animation="fade" />
        </View>


        {filteredUser().length > 0 ? (
            <FlatList
                style={{}}
                data={filteredUser()}
                renderItem={({ item }) => (
                    <UserItem
                        onPress={() => {
                            navigate('Chat', { user: item });
                        }}
                        users={item}
                        key={item.name}
                    />
                )}
            // keyExtractor={item => item.url}
            />
        ) : isLoading === false ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontSize: 16 }}>No user found</Text>
            </View>
        ) : (
            <View></View>
        )}
    </View>

}
export default ListUserScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 50,
        backgroundColor: "#357FEE",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },

    switchButton: {
        width: 180,
        height: 35,
        backgroundColor: "white",
        flexDirection: 'row',
        borderRadius: 8,
        borderColor: '#0056D533',
        paddingHorizontal: 1
    },
    backgroundSmallBlueButton: {
        width: 180 / 2,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 8
    },
    button: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor:'pink'
    },
    textAllButton: {
        fontSize: 18,
        color: "white"
    },
    textNearByButton: {
        fontSize: 18,
        color: "blue"
    },
    SearchBar: {
        height: 50,
        backgroundColor: "#E0E0E0",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    SearchText: {
        width: 300,
        paddingLeft: 15
    },
    spinnerTextStyle: {
        color: '#357FEE'
    }
})