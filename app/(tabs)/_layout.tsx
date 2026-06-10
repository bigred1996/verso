import {Tabs} from 'expo-router';
import {Text} from 'react-native';
import {colors} from '../../constants/theme';
export default function TabLayout(){
  return <Tabs screenOptions={{tabBarActiveTintColor:colors.accent,tabBarInactiveTintColor:colors.text3,tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border,borderTopWidth:1,height:60,paddingBottom:8},tabBarLabelStyle:{fontSize:10,letterSpacing:0.3},headerShown:false}}>
    <Tabs.Screen name="index"   options={{title:'Home',   tabBarIcon:({color})=><Text style={{fontSize:18,color}}>⌂</Text>}}/>
    <Tabs.Screen name="shelf"   options={{title:'Shelf',  tabBarIcon:({color})=><Text style={{fontSize:18,color}}>📚</Text>}}/>
    <Tabs.Screen name="search"  options={{title:'Search', tabBarIcon:({color})=><Text style={{fontSize:18,color}}>🔍</Text>}}/>
    <Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:({color})=><Text style={{fontSize:18,color}}>◯</Text>}}/>
    <Tabs.Screen name="two" options={{href:null}}/>
  </Tabs>;
}
