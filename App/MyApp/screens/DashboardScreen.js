import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Appbar, Drawer } from 'react-native-paper';
import { DrawerLayout } from 'react-native-gesture-handler';
import Charts from './components/Charts';
import { registerForPushNotificationsAsync, sendPushNotification } from './components/NotificationUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export default function DashboardScreen({ navigation }) {
  const drawer = useRef(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    async function setup() {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    }
    setup();

    const ws = new WebSocket("wss://e3c4-2409-40c0-103f-7654-ad52-3a0f-f8cd-568e.ngrok-free.app");

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.title && data.message) {
        setAlertMessage(data.message);
        if (expoPushToken) {
          sendPushNotification(data.title, data.message); 
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => ws.close();
  }, [expoPushToken]);

  useEffect(() => {
    
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    return () => subscription.remove();
  }, []);


  const renderDrawerContent = () => (
    <View style={styles.drawerContent}>
      <Drawer.Section  style={styles.sidebarTitle}>
        <Text style={styles.sidebarTitleText}>HSE.SHIELDIFY</Text>
        <Drawer.Item label="Dashboard" onPress={() => navigation.navigate('Dashboard')} />
        <Drawer.Item label="Employee Logs" onPress={() => navigation.navigate('EmployeeLogs')} />
        <Drawer.Item label="Settings" onPress={() => navigation.navigate('Settings')} />
      </Drawer.Section>
      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <DrawerLayout
      ref={drawer}
      drawerWidth={250}
      drawerPosition="left"
      renderNavigationView={renderDrawerContent}
    >
      <View style={styles.mainContainer}>
        <Appbar.Header style={{ backgroundColor: '#1ABC9C' }}>
          <Appbar.Action icon="menu" onPress={() => drawer.current.openDrawer()} />
          <Appbar.Content title="Dashboard" />
        </Appbar.Header>
        {alertMessage && <Text style={styles.alert}>Alert: {alertMessage}</Text>}
        {/* <Button title="Send Test Notification" onPress={() => sendPushNotification('Test Title', 'Test message')} /> */}

        <ScrollView style={styles.scrollContainer}>
          <Charts />
        </ScrollView>

        {/* Footer */}
        {/* <View style={styles.footer}>
          <TouchableOpacity style={styles.notificationButton} onPress={handleSendNotification}>
            <Text style={styles.notificationText}>Send Notification</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </DrawerLayout>
  );
}


const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 40,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2C3E50',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  footer: {
    backgroundColor: '#1ABC9C',
    padding: 10,
    alignItems: 'center',
  },
  notificationButton: {
    backgroundColor: '#16A085',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  notificationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sidebarTitle: {

  },
  sidebarTitleText: {
    padding: 20,
    color: '#2C3E50',

    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginRight:10,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  alert: {
    color: '#E74C3C',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
});
