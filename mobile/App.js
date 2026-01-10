// Polyfill for TextEncoder (required for QRCode)
import { TextEncoder, TextDecoder } from 'text-encoding';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import React from 'react';
import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Home from './src/pages/Home';
import ScanQR from './src/pages/ScanQR';
import ConfirmParking from './src/pages/ConfirmParking';
import ParkingTicket from './src/pages/ParkingTicket';
import RetrievalProgress from './src/pages/RetrievalProgress';
import CustomerRetrievalProgress from './src/pages/CustomerRetrievalProgress';
import ParkingSessions from './src/pages/ParkingSessions';
import History from './src/pages/History';
import Settings from './src/pages/Settings';
import Dashboard from './src/pages/Dashboard';
import Profile from './src/pages/Profile';
import Vehicles from './src/pages/Vehicles';
import Transactions from './src/pages/Transactions';
import RegisterVehicle from './src/pages/RegisterVehicle';
import HelpSupport from './src/pages/HelpSupport';
import FAQ from './src/pages/FAQ';
import ManagerDashboard from './src/pages/ManagerDashboard';
import AddDriver from './src/pages/AddDriver';
import ApprovalSuccess from './src/pages/ApprovalSuccess';
import SuperAdmin from './src/pages/SuperAdmin';
import DriverConsole from './src/pages/DriverConsole';
import TaskSuccess from './src/pages/TaskSuccess';
import DriverApprovalDetail from './src/pages/DriverApprovalDetail';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="ScanQR" component={ScanQR} />
          <Stack.Screen name="ConfirmParking" component={ConfirmParking} />
          <Stack.Screen name="ParkingTicket" component={ParkingTicket} />
          <Stack.Screen name="RetrievalProgress" component={RetrievalProgress} />
          <Stack.Screen name="CustomerRetrievalProgress" component={CustomerRetrievalProgress} />
          <Stack.Screen name="ParkingSessions" component={ParkingSessions} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Vehicles" component={Vehicles} />
          <Stack.Screen name="RegisterVehicle" component={RegisterVehicle} />
          <Stack.Screen name="Transactions" component={Transactions} />
          <Stack.Screen name="HelpSupport" component={HelpSupport} />
          <Stack.Screen name="FAQ" component={FAQ} />
          <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
          <Stack.Screen name="AddDriver" component={AddDriver} />
          <Stack.Screen name="ApprovalSuccess" component={ApprovalSuccess} />
          <Stack.Screen name="SuperAdmin" component={SuperAdmin} />
          <Stack.Screen name="DriverConsole" component={DriverConsole} />
          <Stack.Screen name="TaskSuccess" component={TaskSuccess} />
          <Stack.Screen name="DriverApprovalDetail" component={DriverApprovalDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;

AppRegistry.registerComponent('main', () => App);
