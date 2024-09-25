import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import EmployeeLogsScreen from './screens/EmployeeLogs'; 
import SettingsScreen from './screens/SettingsScreen';

const AppNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    Dashboard: DashboardScreen,
    EmployeeLogs: EmployeeLogsScreen,
    Settings: SettingsScreen,
  },
  {
    initialRouteName: 'Login',
    defaultNavigationOptions: {
      headerShown: false,
      headerStyle: {
        backgroundColor: '#1ABC9C',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
);

export default createAppContainer(AppNavigator);
