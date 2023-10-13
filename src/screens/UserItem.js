import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'
import { icons, fontSizes, colors } from '../../constants/index'
import Constants from '../ultils/Constants';


function UserItem(props) {

    const {address,bonded,deviceClass,extra,name} = props.users
    const { onPress } = props

    let status = Object.keys(extra).length === 0 ? "disconnected" : "Nearby";
    let statusTextColor = status === "Nearby" ? "#3CC11A" : "#988181";

    return <TouchableOpacity onPress={onPress}>
        <View style={styles.container}>
            <Image source={Constants.USER_ICON}
                style={styles.userIcon}></Image>
            <View style={{
                height: 60,
                width: 270,
                flexDirection: 'column',
                justifyContent: 'space-between',
                // backgroundColor: 'pink'
            }}>
                <Text style={styles.nameUser}>{name}</Text>
                <Text style={[styles.textStatus,{color: statusTextColor}]}>{status}</Text>
                <View style={styles.line}></View>
            </View>
        </View>
    </TouchableOpacity>
}
export default UserItem

const styles = StyleSheet.create({
    container: {
        height: 80,
        paddingTop: 10,
        paddingStart: 10,
        flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor:'green'
    },
    userIcon: {
        width: 60,
        height: 60,
        resizeMode: 'cover',
        marginRight: 10
    },
    nameUser: {
        fontSize: 18,
        //fontWeight: "bold",
        color: "black"
    },
    textStatus: {
        marginStart: 20,
        fontSize: 14,
        textAlign: 'right',
        writingDirection: 'rtl',
        
    },
    line: {
        height: 1,
        backgroundColor: 'black',
        
      },
})

