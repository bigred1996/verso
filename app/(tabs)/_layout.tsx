import {Tabs} from 'expo-router';
import Svg,{Path,Circle,Rect,Line,Polygon} from 'react-native-svg';
import {colors,fonts} from '../../constants/theme';

function Icon({name,color}:{name:string;color:any}){
  const p={stroke:color,strokeWidth:1.6,fill:'none',strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  switch(name){
    case 'discover': return <Svg width={22} height={22} viewBox="0 0 24 24"><Circle {...p} cx={12} cy={12} r={9}/><Polygon {...p} points="15.5,8.5 11,11 8.5,15.5 13,13"/></Svg>;
    case 'social': return <Svg width={22} height={22} viewBox="0 0 24 24"><Circle {...p} cx={9} cy={8} r={3.2}/><Path {...p} d="M3.5 19c0-3.3 2.5-5.2 5.5-5.2s5.5 1.9 5.5 5.2"/><Path {...p} d="M16 5.5a3 3 0 0 1 0 5.8"/><Path {...p} d="M17.5 13.6c2.2.5 3.8 2.1 3.8 4.6"/></Svg>;
    case 'shelf': return <Svg width={22} height={22} viewBox="0 0 24 24"><Rect {...p} x={4} y={3} width={6} height={18}/><Rect {...p} x={13} y={3} width={6} height={18}/><Line {...p} x1={4} y1={9} x2={10} y2={9}/></Svg>;
    default: return null;
  }
}

export default function TabLayout(){
  return <Tabs screenOptions={{tabBarActiveTintColor:colors.accent,tabBarInactiveTintColor:colors.text3,tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border,borderTopWidth:1,height:60,paddingBottom:8},tabBarLabelStyle:{fontFamily:fonts.sansMedium,fontSize:10,letterSpacing:0.3},headerShown:false}}>
    <Tabs.Screen name="index"  options={{title:'Discover',tabBarIcon:({color})=><Icon name="discover" color={color}/>}}/>
    <Tabs.Screen name="social" options={{title:'Social',  tabBarIcon:({color})=><Icon name="social" color={color}/>}}/>
    <Tabs.Screen name="shelf"  options={{title:'Shelf',   tabBarIcon:({color})=><Icon name="shelf" color={color}/>}}/>
    <Tabs.Screen name="search"  options={{href:null}}/>
    <Tabs.Screen name="profile" options={{href:null}}/>
  </Tabs>;
}
