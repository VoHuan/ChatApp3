import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, DeviceEventEmitter, NativeModules, NativeEventEmitter } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Constants from '../ultils/Constants';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';

import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice } from 'react-native-bluetooth-classic';
import { Console } from 'console';


const Chat = (props) => {

  const { address, bonded, deviceClass, extra, name } = props.route.params.user
  const { navigate, goBack, replace } = props.navigation

  const [connect, setConnect] = useState(false)
  //navigation
  // const { navigation, route } = (props)
  // // functions of navigate to/back
  // const { navigate, goBack } = navigation

  const [messages, setMessages] = useState([])

  useEffect(() => {
    setMessages([])
  }, [])


  const { BluetoothManager } = NativeModules;
  const bluetoothEventEmitter = new NativeEventEmitter(BluetoothManager);


  const [datam, setDatam] = useState('')
  const [dataReceived, setDataReceived] = useState('')

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages),)
    console.log("tin nhắn gửi đi : " + messages[messages.length - 1].text)
    console.log("ID tin nhắn gửi đi : " + messages[messages.length - 1]._id)
    senData(messages[messages.length - 1].text)
  }, [])



  const openSocket = async () => {
    await RNBluetoothClassic.connect({
      CONNECTOR_TYPE: "rfcomm",
      DELIMITER: '\r',
      SECURE_SOCKET: false,
      DEVICE_CHARSET: "utf-8",
    })
  }



  const connectToDevice = async () => {
    try {

      const device = await RNBluetoothClassic.connectToDevice(address,
        {
          CONNECTOR_TYPE: "rfcomm",
          DELIMITER: '\r',
          SECURE_SOCKET: false,
          DEVICE_CHARSET: "utf-8",
        });
      console.log('Đã kết nối thành công tới thiết bị:', name);
      console.log(device)



      // let data = await device.read();
      // console.log(data+'123')
      device.onDataReceived((data) => {
        console.log('Dữ liệu nhận được:', data);
        setDataReceived(data)
        // Xử lý dữ liệu nhận được từ thiết bị
      });

    } catch (error) {
      console.log('Lỗi khi kết nối tới thiết bị:', address, error);
    }
  }

  const disconnectDevice = async (addr) => {
    try {
      let device = await RNBluetoothClassic.getConnectedDevice(address);
      console.log("device disconnected: " + device)
      let isDisconnect = device.disconnect();
      console.log('Disconnect to :'+ name + isDisconnect)
    } catch (error) {
      Console.log("Lỗi khi disconnect thiết bị: "+ name)
    }

  }


  const senData = async (text) => {
    try {
      let message = text + '\r';
      //let message = text ;
      await RNBluetoothClassic.writeToDevice(
        address,
        message
      );

      // let data = Buffer.alloc(10, 0xEF);
      // RNBluetoothClassic.write(data);
    } catch (error) {
      console.log('Lỗi gửi data đến :' + name + " : ", error);
    }
  }


  useEffect(() => {
    const handlerConnect = async () => {
      await connectToDevice()
    }

    handlerConnect()
  }, []);


  useEffect(() => {
    console.log("data nhận từ :" + name + dataReceived)
  }, [dataReceived]);


  useEffect(() => {
    //example obj
    let myObject = {
      _id: 40,
      text: "Hi there! How can I help you?",
      createdAt: 1641654220000,
      user: {
        _id: 'sender',
        name: 'Sender User',
        avatar: Constants.USER_ICON
      }
    };
    myObject.text = dataReceived != null ? dataReceived.data : ""
    myObject.user._id = "receiver"
    myObject.user.name = "Receiver User"
    myObject.createdAt = new Date().getTime();//Timestamp
    const id = generateUUID();
    myObject._id = id
    if (dataReceived != "") {
      setMessages(previousMessages => GiftedChat.append(previousMessages, myObject),)
    }


  }, [dataReceived]);


  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {//Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  return (<View style={styles.container}>
    <View style={styles.header}>
      <Icon
        name="arrow-left"
        style={{ padding: 15 }}
        size={20}
        color="white"
        onPress={() => {
          disconnectDevice(address)
          goBack()
        }}
      />

      <Text style={styles.NameUserChat}>{name}</Text>

      <View style={{ padding: 15 }}></View>
    </View>

    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      showAvatarForEveryMessage={true}
      //showUserAvatar={true}
      //renderUsernameOnMessage ={true}
      messagesContainerStyle={{
        backgroundColor: '#fff'
      }}
      textInputStyle={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
      user={{
        _id: "sender",
        name: 'Sender User',
      }}
    />
  </View>
  );
}

export default Chat

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  header: {
    height: 50,
    backgroundColor: '#23B85E',
    //backgroundColor: 'green',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  NameUserChat: {
    fontSize: 16,
    color: 'white',
  },
});