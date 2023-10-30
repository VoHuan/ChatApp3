import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const ConfirmPopup = (props) =>{
    const visible = props.visible
    const callback = props.callback
    return (
        <Modal visible={visible} transparent>
            <View style={styles.container}>
                <View style={styles.alert}>
                    <Text style={styles.bigTitle}>Bạn có muốn xóa toàn bộ tin nhắn?</Text>
                    <Text style={styles.smallTitle}>Tin nhắn đã xóa không thể khôi phục lại !</Text>
                    <View style={styles.groupButton}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => {
                            callback(false, false)
                        }}>
                            <Text style={styles.closeButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.okButton} onPress={() => {
                            callback(false, true)
                        }}>
                            <Text style={styles.okButtonText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    )
} 

export default ConfirmPopup

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alert: {
        width: 324,
        height: 161,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    closeButton: {
        width: 132,
        height: 48,
        backgroundColor: 'white',
        borderRadius: 8,
        justifyContent: "center",
        borderColor: '#336CC8',
        borderWidth: 1,
        marginRight: 8

    },
    closeButtonText: {
        color: '#336CC8',
        fontSize: 18,
        textAlign: 'center',
    },
    okButton: {
        width: 132,
        height: 48,
        backgroundColor: '#336CC8',
        borderRadius: 8,
        justifyContent: "center",
        //marginLeft:10
        marginLeft: 8
    },
    okButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    groupButton: {
        width: 280,
        height: 48,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    bigTitle: {
        color: '#00122F',
        fontSize: 18,
        fontWeight:'bold'
    },
    smallTitle: {
        color: '#707172',
        fontSize: 14,
        marginTop: 10,
        marginBottom: 20
    }
});