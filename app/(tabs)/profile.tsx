import React from 'react';
import {ScrollView,View,Text,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts} from '../../constants/theme';
import ProfilePanel from '../../components/ProfilePanel';

export default function ProfileScreen(){
  return <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
    <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
    <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:10}}>
      <Text style={{fontFamily:fonts.serifItalic,fontSize:24,color:colors.text}}>Profile</Text>
    </View>
    <ScrollView showsVerticalScrollIndicator={false}><ProfilePanel/></ScrollView>
  </SafeAreaView>;
}
