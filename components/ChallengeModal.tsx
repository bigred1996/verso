import React from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts,type} from '../constants/theme';
import {BOOKS,CHALLENGES} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

interface Props { challengeId:string|null; onClose:()=>void; onOpenBook:(id:string)=>void; }

export default function ChallengeModal({challengeId,onClose,onOpenBook}:Props){
  const {challengeJoined,joinChallenge,customBooks,userChallenges}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const base=challengeId?CHALLENGES.find(c=>c.id===challengeId):null;
  const userCh=!base&&challengeId?userChallenges.find(c=>c.id===challengeId):null;
  const ch=base||(userCh?{id:userCh.id,title:userCh.title,desc:userCh.desc,readers:1,goal:userCh.goal,featured:false,books:[] as string[],done:[] as string[]}:null);
  if(!ch) return null;
  const joined=!!challengeJoined[ch.id];
  const done=new Set(ch.done);
  const progress=ch.done.length;
  const pct=Math.round(progress/ch.goal*100);

  return <Modal visible={!!challengeId} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{ch.title}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          {ch.featured&&<Text style={{fontFamily:fonts.sansBold,fontSize:9,color:colors.accent,letterSpacing:1.8,textTransform:'uppercase',marginBottom:8}}>Featured Challenge</Text>}
          <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:colors.text,lineHeight:28,marginBottom:8}}>{ch.title}</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:21,marginBottom:10}}>{ch.desc}</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{ch.readers.toLocaleString()} readers · {ch.goal} books</Text>
        </View>

        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>Your progress</Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text2}}>{progress} / {ch.goal} · {pct}%</Text>
          </View>
          <View style={{height:4,backgroundColor:colors.surface2,borderRadius:999}}><View style={{width:`${pct}%`,height:4,backgroundColor:colors.accent,borderRadius:999}}/></View>
          <TouchableOpacity onPress={()=>joinChallenge(ch.id)}
            style={{marginTop:14,padding:13,alignItems:'center',backgroundColor:joined?colors.accentDim:colors.accent,borderWidth:1,borderColor:colors.accent,borderRadius:999}}>
            <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:joined?colors.accent:colors.bg}}>{joined?'Joined ✓':'Join Challenge'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{padding:spacing.lg}}>
          {ch.books.map((id,i)=>{const b=all.find(x=>x.id===id); if(!b) return null; const d=done.has(id);
            return <TouchableOpacity key={id} onPress={()=>onOpenBook(id)} style={{flexDirection:'row',gap:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border,alignItems:'center'}}>
              <View style={{width:24,height:24,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:d?colors.accent:colors.surface2,borderWidth:1,borderColor:d?colors.accent:colors.border}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:11,color:d?colors.bg:colors.text3}}>{d?'✓':i+1}</Text>
              </View>
              <BookCover bookId={id} size="sm"/>
              <View style={{flex:1}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text}}>{b.title}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>{b.author}</Text>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:d?colors.accent:colors.text3,marginTop:3}}>{d?'Completed':`★ ${b.avgRating}`}</Text>
              </View>
            </TouchableOpacity>;})}
        </View>
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
