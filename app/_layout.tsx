import 'react-native-gesture-handler';
import {useFonts} from 'expo-font';
import {PlayfairDisplay_700Bold_Italic,PlayfairDisplay_700Bold,PlayfairDisplay_400Regular} from '@expo-google-fonts/playfair-display';
import {DMSans_400Regular,DMSans_500Medium,DMSans_700Bold} from '@expo-google-fonts/dm-sans';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {colors} from '../constants/theme';
export {ErrorBoundary} from 'expo-router';
export const unstable_settings={initialRouteName:'(tabs)'};
SplashScreen.preventAutoHideAsync();
export default function RootLayout(){
  const [loaded,error]=useFonts({PlayfairDisplay_700Bold_Italic,PlayfairDisplay_700Bold,PlayfairDisplay_400Regular,DMSans_400Regular,DMSans_500Medium,DMSans_700Bold});
  useEffect(()=>{if(error) throw error;},[error]);
  useEffect(()=>{if(loaded) SplashScreen.hideAsync();},[loaded]);
  if(!loaded) return <View style={{flex:1,backgroundColor:colors.bg}}/>;
  return <GestureHandlerRootView style={{flex:1}}>
    <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.bg}}}><Stack.Screen name="(tabs)"/></Stack>
  </GestureHandlerRootView>;
}
