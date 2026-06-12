import React,{useState} from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,TextInput,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts,radius,shadow} from '../constants/theme';
import {BOOKS,FRIENDS,ACTIVITY} from '../data/books';
import type {ActivityItem} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';
import {tick,impact} from '../utils/haptics';

interface Props { postId:string|null; onClose:()=>void; onOpenBook:(id:string)=>void; }
const fr=(id:string)=>FRIENDS.find(f=>f.id===id);

function feedLine(it:ActivityItem,all:typeof BOOKS){
  const b=it.bookId?all.find(x=>x.id===it.bookId):null;
  switch(it.type){
    case 'reading': return <Text style={fline}>is reading <Text style={fb}>{b?.title}</Text> · {it.text}</Text>;
    case 'rated': return <Text style={fline}>rated <Text style={fb}>{b?.title}</Text>  <Text style={{color:colors.accent}}>{'★'.repeat(it.rating||0)}</Text></Text>;
    case 'hot': return <Text style={fline}>hot take on <Text style={fb}>{b?.title}</Text></Text>;
    case 'dnf': return <Text style={fline}>DNF'd <Text style={fb}>{b?.title}</Text></Text>;
    case 'milestone': return <Text style={fline}>{it.text}</Text>;
  }
}

export default function SocialPostModal({postId,onClose,onOpenBook}:Props){
  const {customBooks,feedComments,addComment}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const it=postId?ACTIVITY.find(a=>a.id===postId):null;
  const [liked,setLiked]=useState(false);
  const [draft,setDraft]=useState('');
  if(!it) return null;

  const f=fr(it.user);
  const b=it.bookId?all.find(x=>x.id===it.bookId):null;
  const seed=it.id.split('').reduce((n,c)=>n+c.charCodeAt(0),0);
  const likeCount=(seed%19)+3+(liked?1:0);
  const thread=feedComments[it.id]||[];
  const handle='@'+(f?.name.split(' ')[0].toLowerCase()||'reader')+'.reads';
  const typeLabel=it.type==='hot'?'Hot take':it.type==='rated'?'Rated':it.type==='reading'?'Reading':it.type==='dnf'?'DNF':'Milestone';
  function submit(){ const t=draft.trim(); if(!t) return; addComment(it!.id,t); setDraft(''); impact('light'); }

  return <Modal visible={!!postId} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="dark-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{f?.name.split(' ')[0]}'s post</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{backgroundColor:colors.surface,borderRadius:radius.lg,margin:spacing.lg,padding:spacing.lg,...shadow.soft}}>
          {/* post header */}
          <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12}}>
            <View style={{width:44,height:44,borderRadius:22,backgroundColor:(f?.color||colors.accent)+'28',alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontFamily:fonts.sansBold,fontSize:16,color:f?.color||colors.accent}}>{f?.init}</Text>
            </View>
            <View style={{flex:1}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:15,color:colors.text}}>{f?.name.split(' ')[0]}</Text>
                <View style={{paddingHorizontal:6,paddingVertical:2,backgroundColor:colors.accentDim,borderRadius:999}}><Text style={{fontFamily:fonts.sansBold,fontSize:9,color:colors.accent}}>{f?.match}%</Text></View>
              </View>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{handle} · {it.ts} ago</Text>
            </View>
            <View style={{paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.surface2,borderRadius:999}}><Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:colors.text3,textTransform:'uppercase',letterSpacing:0.5}}>{typeLabel}</Text></View>
          </View>

          {/* body */}
          {(it.type==='hot'||it.type==='dnf')&&it.text
            ?<Text style={{fontFamily:fonts.serif,fontSize:19,color:colors.text,lineHeight:29,marginBottom:14}}>"{it.text}"</Text>
            :<View style={{marginBottom:12}}>{feedLine(it,all)}</View>}

          {/* embedded book card */}
          {b&&<TouchableOpacity activeOpacity={0.85} onPress={()=>onOpenBook(b.id)}
            style={{flexDirection:'row',gap:12,padding:12,backgroundColor:colors.bg,borderRadius:radius.md,borderWidth:1,borderColor:colors.border,alignItems:'center',marginBottom:14}}>
            <BookCover bookId={b.id} size="sm"/>
            <View style={{flex:1}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:1}}>{b.author}</Text>
              {b.readers>0&&<Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent,marginTop:4}}>★ {b.avgRating} · {(b.readers/1000).toFixed(0)}k readers</Text>}
            </View>
            <Text style={{fontSize:14,color:colors.text3}}>›</Text>
          </TouchableOpacity>}

          {/* action bar */}
          <View style={{flexDirection:'row',alignItems:'center',gap:24,paddingTop:4,borderTopWidth:1,borderTopColor:colors.border,marginTop:2,paddingVertical:12}}>
            <TouchableOpacity onPress={()=>{const w=!liked;setLiked(w);if(w)impact('light');else tick();}} style={{flexDirection:'row',alignItems:'center',gap:6}}>
              <Text style={{fontSize:18,color:liked?colors.danger:colors.text3}}>{liked?'♥':'♡'}</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:liked?colors.danger:colors.text3}}>{likeCount}</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
              <Text style={{fontSize:15,color:colors.text3}}>💬</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text3}}>{thread.length}</Text>
            </View>
          </View>
        </View>

        {/* comments */}
        <View style={{paddingHorizontal:spacing.lg}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginBottom:12}}>Comments</Text>
          {thread.length===0&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,fontStyle:'italic',marginBottom:14}}>No comments yet — start the thread.</Text>}
          <View style={{gap:12,marginBottom:14}}>
            {thread.map((c,ci)=>{const cf=c.user==='you'?null:fr(c.user);const isYou=c.user==='you';
              const cInit=isYou?'C':(cf?.init||'?');const cColor=isYou?colors.accent:(cf?.color||colors.accent);const cName=isYou?'You':(cf?.name.split(' ')[0]||'Reader');
              return <View key={ci} style={{flexDirection:'row',gap:10,alignItems:'flex-start'}}>
                <View style={{width:32,height:32,borderRadius:16,backgroundColor:cColor+'28',alignItems:'center',justifyContent:'center',marginTop:1}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:12,color:cColor}}>{cInit}</Text>
                </View>
                <View style={{flex:1,backgroundColor:colors.surface,borderRadius:radius.md,paddingHorizontal:12,paddingVertical:9,...shadow.soft}}>
                  <View style={{flexDirection:'row',alignItems:'center',gap:6,marginBottom:2}}>
                    <Text style={{fontFamily:fonts.sansBold,fontSize:12,color:colors.text}}>{cName}</Text>
                    <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{c.ts}</Text>
                  </View>
                  <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:19}}>{c.text}</Text>
                </View>
              </View>;})}
          </View>
        </View>
        <View style={{height:24}}/>
      </ScrollView>

      {/* composer */}
      <View style={{flexDirection:'row',gap:8,alignItems:'center',padding:spacing.lg,paddingTop:12,borderTopWidth:1,borderTopColor:colors.border}}>
        <TextInput style={inp} placeholder="Add a comment…" placeholderTextColor={colors.text3} value={draft} onChangeText={setDraft}
          returnKeyType="send" onSubmitEditing={submit} blurOnSubmit={false}/>
        <TouchableOpacity disabled={!draft.trim()} onPress={submit} style={{paddingHorizontal:18,paddingVertical:11,borderRadius:radius.pill,backgroundColor:draft.trim()?colors.accent:colors.surface2}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:draft.trim()?colors.accentText:colors.text3}}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>;
}

const fline:any={fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:21};
const fb:any={fontFamily:fonts.sansMedium,color:colors.text};
const inp:any={flex:1,fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:14,paddingVertical:11,borderRadius:radius.pill};
