import React,{useState} from 'react';
import {Modal,View,Text,TouchableOpacity,TextInput,ScrollView,Linking,SafeAreaView,StatusBar,Platform} from 'react-native';
import {colors,spacing,fonts} from '../constants/theme';

const STORES=[
  {city:'New York',stores:[{name:'The Strand',note:'828 Broadway · est. 1927'},{name:'McNally Jackson',note:'52 Prince St'},{name:'Greenlight Bookstore',note:'686 Fulton St, Brooklyn'}]},
  {city:'London',stores:[{name:'Hatchards',note:'187 Piccadilly · est. 1797'},{name:'Daunt Books',note:'83 Marylebone High St'},{name:'Foyles',note:'107 Charing Cross Rd'}]},
  {city:'Paris',stores:[{name:'Shakespeare and Company',note:'37 Rue de la Bûcherie'},{name:'Librairie Galignani',note:'224 Rue de Rivoli'}]},
  {city:'Los Angeles',stores:[{name:"Book Soup",note:'8818 Sunset Blvd'},{name:'The Last Bookstore',note:'453 S Spring St'},{name:'Vroman\'s',note:'695 E Colorado Blvd, Pasadena'}]},
  {city:'Chicago',stores:[{name:'Powell\'s Books',note:'2207 N Lincoln Ave'},{name:'Unabridged Bookstore',note:'3251 N Broadway'}]},
  {city:'San Francisco',stores:[{name:'City Lights',note:'261 Columbus Ave'},{name:'Green Apple Books',note:'506 Clement St'}]},
];

interface Props { visible:boolean; onClose:()=>void; }

export default function BookstoreModal({visible,onClose}:Props){
  const [city,setCity]=useState('');
  const [searched,setSearched]=useState('');

  function openMaps(){
    const q=encodeURIComponent((city||'bookstores near me')+' independent bookstore');
    const url=Platform.OS==='ios'?`maps://?q=${q}`:`https://maps.google.com/?q=${q}`;
    Linking.openURL(url);
  }

  function openIndieBound(){
    Linking.openURL(`https://www.indiebound.org/indie-store-finder/browse?zip=${encodeURIComponent(city||'')}`);
  }

  const match=city?STORES.filter(s=>s.city.toLowerCase().includes(city.toLowerCase())):STORES;

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:16,color:colors.text}}>Find a Bookstore</Text>
      </View>
      <ScrollView contentContainerStyle={{padding:spacing.lg}} showsVerticalScrollIndicator={false}>
        <TextInput style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10,marginBottom:spacing.md}}
          placeholder="Enter city or postcode…" placeholderTextColor={colors.text3} value={city} onChangeText={setCity}/>
        <View style={{flexDirection:'row',gap:8,marginBottom:spacing.lg}}>
          <TouchableOpacity onPress={openMaps} style={{flex:1,backgroundColor:colors.accent,padding:12,alignItems:'center'}}>
            <Text style={{color:colors.bg,fontSize:12,fontWeight:'600'}}>📍 Open in Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openIndieBound} style={{flex:1,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,padding:12,alignItems:'center'}}>
            <Text style={{color:colors.text,fontSize:12}}>🏪 IndieBound</Text>
          </TouchableOpacity>
        </View>
        {match.map(group=><View key={group.city} style={{marginBottom:spacing.lg}}>
          <Text style={sec}>{group.city}</Text>
          {group.stores.map(s=><TouchableOpacity key={s.name}
            onPress={()=>Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(s.name+' '+group.city)}`)}
            style={{paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={{fontSize:13,color:colors.text,fontWeight:'600',marginBottom:2}}>{s.name}</Text>
            <Text style={{fontSize:11,color:colors.text3}}>{s.note}</Text>
          </TouchableOpacity>)}
        </View>)}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
const sec:any={fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:8};
