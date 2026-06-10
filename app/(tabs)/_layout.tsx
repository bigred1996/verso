import {Tabs} from 'expo-router';
import Svg,{Path,Circle,Rect,Line} from 'react-native-svg';
import {colors,fonts} from '../../constants/theme';

function Icon({name,color}:{name:string;color:any}){
  const p={stroke:color,strokeWidth:1.6,fill:'none',strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  switch(name){
    case 'home': return <Svg width={22} height={22} viewBox="0 0 24 24"><Path {...p} d="M3 11l9-7 9 7"/><Path {...p} d="M5 10v10h14V10"/></Svg>;
    case 'shelf': return <Svg width={22} height={22} viewBox="0 0 24 24"><Rect {...p} x={4} y={3} width={6} height={18}/><Rect {...p} x={13} y={3} width={6} height={18}/><Line {...p} x1={4} y1={9} x2={10} y2={9}/></Svg>;
    case 'search': return <Svg width={22} height={22} viewBox="0 0 24 24"><Circle {...p} cx={10.5} cy={10.5} r={6.5}/><Line {...p} x1={15.5} y1={15.5} x2={21} y2={21}/></Svg>;
    case 'profile': return <Svg width={22} height={22} viewBox="0 0 24 24"><Circle {...p} cx={12} cy={8} r={4}/><Path {...p} d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></Svg>;
    default: return null;
  }
}

export default function TabLayout(){
  return <Tabs screenOptions={{tabBarActiveTintColor:colors.accent,tabBarInactiveTintColor:colors.text3,tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border,borderTopWidth:1,height:60,paddingBottom:8},tabBarLabelStyle:{fontFamily:fonts.sansMedium,fontSize:10,letterSpacing:0.3},headerShown:false}}>
    <Tabs.Screen name="index"   options={{title:'Home',   tabBarIcon:({color})=><Icon name="home" color={color}/>}}/>
    <Tabs.Screen name="shelf"   options={{title:'Shelf',  tabBarIcon:({color})=><Icon name="shelf" color={color}/>}}/>
    <Tabs.Screen name="search"  options={{title:'Search', tabBarIcon:({color})=><Icon name="search" color={color}/>}}/>
    <Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:({color})=><Icon name="profile" color={color}/>}}/>
  </Tabs>;
}
