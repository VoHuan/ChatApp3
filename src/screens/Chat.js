import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert } from 'react-native';
import { GiftedChat, Message } from 'react-native-gifted-chat';
import SQLite from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Constants from '../ultils/Constants';
import Spinner from 'react-native-loading-spinner-overlay';
import { MenuProvider } from 'react-native-popup-menu';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { useActionSheet } from '@expo/react-native-action-sheet';
import Clipboard from '@react-native-community/clipboard';
import ConfirmPopup from '../components/ConfirmPopup';



import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice } from 'react-native-bluetooth-classic';

const icon = (name) => (
  <Icon key={name} name={name} size={24} color='black' />
);

const Chat = (props) => {

  const { showActionSheetWithOptions } = useActionSheet();
  const { address, bonded, deviceClass, extra, name } = props.route.params.user
  const { navigate, goBack, replace } = props.navigation
  const db = SQLite.openDatabase({ name: 'chat.db' });

  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteData, setDeleteData] = useState(false)
  //navigation
  // const { navigation, route } = (props)
  // // functions of navigate to/back
  // const { navigate, goBack } = navigation

  const [messages, setMessages] = useState([])

  useEffect(() => {
    setMessages([])
  }, [])

  const [dataReceived, setDataReceived] = useState('')

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages),)
    console.log("tin nhắn gửi đi : " + messages[messages.length - 1].text)
    console.log("ID tin nhắn gửi đi : " + messages[messages.length - 1]._id)
    senData(messages[messages.length - 1].text)

    //insert message to DB
    insertMessage(address, messages[messages.length - 1]._id,
      messages[messages.length - 1].text,
      messages[messages.length - 1].createdAt.toString(),
      messages[messages.length - 1].user._id,
      messages[messages.length - 1].user.name)
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
      device.onDataReceived((data) => {
        console.log('Dữ liệu nhận được:', data);
        setDataReceived(data)

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
      console.log('Disconnect to :' + name + isDisconnect)
    } catch (error) {
      Console.log("Disconnect error: " + name)
    }

  }


  const senData = async (text) => {
    try {
      let message = text + '\r';
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
    createTableOfDB(address)
    fetchMessages(address)
  }, []);


  useEffect(() => {
    console.log("data nhận từ :" + name + dataReceived)
  }, [dataReceived]);

  useEffect(() => {
    if (deleteData) {
      deleteAllData(address)
      setMessages([])
    }
  }, [deleteData]);


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
    let time = new Date()
    myObject.createdAt = time.toString();
    const id = generateUUID();
    myObject._id = id

    //display message Received
    if (dataReceived != "") {
      setMessages(previousMessages => GiftedChat.append(previousMessages, myObject),)

      // add message to DB 
      insertMessage(address, myObject._id, myObject.text, myObject.createdAt, myObject.user._id, myObject.user.name)
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

  // create table messages in DB
  const createTableOfDB = (addr) => {
    let tableName = replaceInvalidCharacters(addr)
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' + tableName + '(_id text, text TEXT, createdAt TEXT, userId TEXT, userName TEXT)',
        [],
        () => {
          console.log('Created table messages successfully !')
        },
        (error) => {
          console.log('Created table messages failed ! : ' + JSON.stringify(error))
        },
      );
    });
  }

  // get all messages
  const fetchMessages = (addr) => {
    let tableName = replaceInvalidCharacters(addr)
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ' + tableName,
        [],
        (tx, results) => {
          const len = results.rows.length
          if (len > 0) {
            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              //console.log(`_id: ${row._id}, text: ${row.text},createdAt :${row.createdAt},userId:${row.userId},userName : ${row.userName}`);

              // //example obj
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
              myObject.text = `${row.text}`
              myObject.user._id = `${row.userId}`
              myObject.user.name = `${row.userName}`
              myObject.createdAt = `${row.createdAt}`
              myObject._id = `${row._id}`
              setMessages(previousMessages => GiftedChat.append(previousMessages, myObject),)
            }
          }
        },
        (error) => {
          console.log('Fetch Messages failed ! : ' + JSON.stringify(error))
        },
      )
      setIsLoading(false)
    })
  }

  //Insert new Message to DB
  const insertMessage = (table, _id, text, createdAt, userId, userName) => {
    let tableName = replaceInvalidCharacters(table)
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO ' + tableName + ' (_id, text, createdAt, userId, userName) VALUES (?, ?, ?, ?, ?)',
        [_id, text, createdAt, userId, userName],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('Insert message successfully' + userName);
          } else {
            console.log('Insert message failed');
          }
        },
        (error) => {
          console.log('Insert message failed :' + error);
        },
      );
    });
  }

  //delete all message
  const deleteAllData = (table) => {
    let tableName = replaceInvalidCharacters(table);
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM ' + tableName,
        [],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('Delete all data successfully');
          } else {
            console.log('No data to delete');
          }
        },
        (error) => {
          console.log('Delete all data failed: ' + JSON.stringify(error));
        },
      );
    });
  };

  //delete 1 message
  const deleteRowById = (table, id) => {
    let tableName = replaceInvalidCharacters(table);
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM ' + tableName + ' WHERE _id = ?',
        [id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('Delete row successfully');
          } else {
            console.log('No row to delete with ID: ' + id);
          }
        },
        (error) => {
          console.log('Delete row failed: ' + error);
        },
      )
    })

    //update message on view
    const updatedMessages = messages.filter(message => message._id !== id);
    setMessages(updatedMessages);
  }

 
  const replaceInvalidCharacters = (addr) => {
    let temp1 = addr.replaceAll(":", "_")
    let temp2 = "TB" + temp1
    return temp2
  }

  const handlerGetValuePopupConfirm = (confirmed, valueConfirmed) => {
    setConfirmDelete(confirmed)
    setDeleteData(valueConfirmed)
    console.log(valueConfirmed)
  }


  const onLongPressMessageItem = (context, message) => {
    const options = ['Delete', 'Copy', 'Cancel'];
    const icons = [icon('trash'), icon('save'), icon('ban')]
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    const handleDeleteMessage = () => {
      deleteRowById(address, message._id)
    }

    const handleCopyText = ()=>{
      console.log(message.text)
      console.log(message._id)
      Clipboard.setString(message.text);
    }

    showActionSheetWithOptions({
      options,
      icons,
      cancelButtonIndex,
      destructiveButtonIndex,

    }, (selectedIndex) => {
      switch (selectedIndex) {
        case 1:
          // copy
          handleCopyText()
          break;

        case destructiveButtonIndex:
          // Delete
          handleDeleteMessage()
          break;

        case cancelButtonIndex:
        // Canceled
      }
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
          // disconnectDevice(address)
          goBack()
        }}
      />

      <Text style={styles.NameUserChat}>{name}</Text>

      <Menu>
        <MenuTrigger>
          <Icon name="bars" style={{ padding: 15 }} size={20} color="white" />
        </MenuTrigger>
        <MenuOptions customStyles={menuOptionsStyles}>
          <MenuOption onSelect={() => {
            setConfirmDelete(true)
          }}>
            <Text style={styles.menuOptionDeleteText}>Delete All Message</Text>
          </MenuOption>
          <View style={styles.separator} />
          <MenuOption onSelect={() => {

          }}>
            <Text style={styles.menuOptionBlockText}>Block User</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>

    </View>

    {/* loading animated */}
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Spinner visible={isLoading}
        color='#FFF'
        animation="fade" />
    </View>


    <View>
      <ConfirmPopup callback={handlerGetValuePopupConfirm} visible={confirmDelete} />
    </View>

    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      showAvatarForEveryMessage={true}
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
      renderMessage={props => (
        <Message
          {...props}
          //  onLongPress={(context, message) => onLongPressMessageItem(context,message)}
          onLongPress={(context, message) => onLongPressMessageItem(context, message)}

        />
      )}

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
  line: {
    height: 1,
    backgroundColor: 'black',
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginHorizontal: 5,
  },
  menuOptionDeleteText: {
    fontSize: 16,
    color: 'black'
  },
  menuOptionBlockText: {
    fontSize: 16,
    color: 'red'
  },
});

const menuOptionsStyles = {
  optionsContainer: {
    // position: 'absolute',
    // top: 40,
    // right: 0,
    width: 160,
    padding: 5,

  },
};