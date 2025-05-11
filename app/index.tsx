import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import SignInScreen from './screens/SignInScreen';

const Stack = createNativeStackNavigator();

export default function Index() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '548563707987-ldb5g2h9382vd7cfaeb5qm2l27m2obl5.apps.googleusercontent.com',
      profileImageSize: 150,
    });
  }, []);

  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}
