import React from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts,type} from '../constants/theme';
import {BOOKS,FRIENDS,FRIEND_BOOK,BOOK_VIBES} from '../data/books';
import BookCover from './BookCover';

const STATS:Record<string,{books:number;pages:string;avg:number;genre:string;streak:number;bio:string}>={
  elif:{books:31,pages:'10.3k',avg:4.4,genre:'Literary Fiction',streak:12,bio:'Reads like it\'s a competitive sport. Will out-argue you about Rooney.'},
  marcus:{books:24,pages:'7.8k',avg:3.8,genre:'Post-Apocalyptic',streak:4,bio:'Bleak kings only. Has never finished a book with a happy ending on purpose.'},
  juno:{books:19,pages:'5.7k',avg:4.2,genre:'Literary Fiction',streak:8,bio:'Here for the emotional damage. Rates everything by how hard she cried.'},
  priya:{books:27,pages:'8.9k',avg:4.5,genre:'Historical Fiction',streak:6,bio:'Quietly has the best taste of anyone you know. Recommends with surgical precision.'},
};

interface Props { friendId:string|null; onClose:()=>void; onOpenBook:(id:string)=>void; }

export default function FriendProfileModal({friendId,onClose,onOpenBook}:Props){
  const f=friendId?FRIENDS.find(x=>x.id===friendId):null;
  if(!f) return null;
  const st=STATS[f.id];
  const theirBooks=BOOKS.filter(b=>FRIEND_BOOK[b.id]?.[f.id]).map(b=>({b,r:FRIEND_BOOK[b.id][f.id].r,t:FRIEND_BOOK[b.id][f.id].t})).sort((a,b)=>b.r-a.r);
  const moreSci=f.id==='marcus';

  return <Modal visible={!!friendId} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:15,color:colors.text}}>{f.name}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{padding:spacing.lg,alignItems:'center',borderBottomWidth:1,borderBottomColor:colors.border}}>
          <View style={{width:72,height:72,borderRadius:36,backgroundColor:f.color+'28',alignItems:'center',justifyContent:'center',marginBottom:10}}><Text style={{fontFamily:fonts.serifBold,fontSize:30,color:f.color}}>{f.init}</Text></View>
          <Text style={{fontFamily:fonts.serifBold,fontSize:20,color:colors.text}}>{f.name}</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:2}}>@{f.name.split(' ')[0].toLowerCase()} · {f.status}</Text>
          {st&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,textAlign:'center',lineHeight:19,marginTop:10}}>{st.bio}</Text>}
        </View>
        {/* Taste match — the differentiator */}
        <View style={{padding:spacing.lg,alignItems:'center',borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:52,color:colors.accent}}>{f.match}%</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,marginTop:2}}>taste match with you</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,textAlign:'center',lineHeight:19,marginTop:10}}>
            You both love <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>slow-burn literary fiction</Text>. {moreSci?'They read more bleak post-apocalyptic than you.':`They read more ${st?.genre.toLowerCase()} than you.`}
          </Text>
        </View>
        {/* Stats */}
        {st&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:12}]}>Their year</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:9}}>
            {[{v:String(st.books),l:'Books read'},{v:st.pages,l:'Pages'},{v:st.avg.toFixed(1)+'★',l:'Avg rating'},{v:st.streak+'d',l:'Streak'}].map(c=>
              <View key={c.l} style={{width:'47%',flexGrow:1,backgroundColor:colors.surface2,padding:14}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:colors.accent}}>{c.v}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2,marginTop:4}}>{c.l}</Text>
              </View>)}
          </View>
        </View>}
        {/* Their books */}
        <View style={{padding:spacing.lg}}>
          <Text style={[type.label,{marginBottom:10}]}>What they've rated</Text>
          {theirBooks.map(({b,r,t})=><TouchableOpacity key={b.id} onPress={()=>onOpenBook(b.id)} style={{flexDirection:'row',gap:12,paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <BookCover bookId={b.id} size="sm"/>
            <View style={{flex:1}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text}} numberOfLines={1}>{b.title}</Text><Text style={{fontSize:11,color:colors.accent}}>{'★'.repeat(r)}</Text></View>
              <Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:12,color:colors.text2,marginTop:2}}>"{t}"</Text>
            </View>
          </TouchableOpacity>)}
        </View>
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
