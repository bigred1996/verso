import React,{useState} from 'react';
import {ScrollView,View,Text,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {useRouter} from 'expo-router';
import {colors,spacing,fonts,type} from '../../constants/theme';
import {BOOKS,FRIENDS,CHALLENGES,ACTIVITY,AUTHOR_DATA} from '../../data/books';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import BookClubModal from '../../components/BookClubModal';
import ChallengeModal from '../../components/ChallengeModal';
import AuthorModal from '../../components/AuthorModal';
import CompareModal from '../../components/CompareModal';

const SUBS=['Feed','Clubs','Challenges','Authors','Buddies'] as const;
type Sub=typeof SUBS[number];
const fr=(id:string)=>FRIENDS.find(f=>f.id===id);

export default function SocialScreen(){
  const router=useRouter();
  const {buddyReads,authorFollows,toggleAuthorFollow,customBooks}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [sub,setSub]=useState<Sub>('Feed');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [showClub,setShowClub]=useState(false);
  const [challengeId,setChallengeId]=useState<string|null>(null);
  const [authorOpen,setAuthorOpen]=useState<string|null>(null);
  const [showCompare,setShowCompare]=useState(false);
  const [reacted,setReacted]=useState<Record<string,boolean>>({});

  const twins=[...FRIENDS].sort((a,b)=>b.match-a.match);
  const authors=Object.keys(AUTHOR_DATA);

  function feedLine(it:typeof ACTIVITY[number]){
    const b=it.bookId?all.find(x=>x.id===it.bookId):null;
    switch(it.type){
      case 'reading': return <Text style={fline}>is reading <Text style={fb}>{b?.title}</Text> · {it.text}</Text>;
      case 'rated': return <Text style={fline}>rated <Text style={fb}>{b?.title}</Text>  <Text style={{color:colors.accent}}>{'★'.repeat(it.rating||0)}</Text></Text>;
      case 'hot': return <Text style={fline}>hot take on <Text style={fb}>{b?.title}</Text></Text>;
      case 'dnf': return <Text style={fline}>DNF'd <Text style={fb}>{b?.title}</Text></Text>;
      case 'milestone': return <Text style={fline}>{it.text}</Text>;
    }
  }

  return <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
    <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
    <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
      <Text style={{fontFamily:fonts.serifItalic,fontSize:24,color:colors.text}}>Social</Text>
      <TouchableOpacity onPress={()=>router.push('/profile')} style={{width:34,height:34,borderRadius:17,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.accent}}>C</Text>
      </TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,borderBottomWidth:1,borderBottomColor:colors.border}} contentContainerStyle={{paddingHorizontal:spacing.lg}}>
      {SUBS.map(s=><TouchableOpacity key={s} onPress={()=>setSub(s)} style={{paddingHorizontal:14,paddingVertical:12,borderBottomWidth:2,borderBottomColor:sub===s?colors.accent:'transparent'}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:sub===s?colors.accent:colors.text3,letterSpacing:0.4}}>{s}</Text>
      </TouchableOpacity>)}
    </ScrollView>

    <ScrollView showsVerticalScrollIndicator={false}>
      {/* FEED */}
      {sub==='Feed'&&<View>
        {/* taste-twins strip */}
        <View style={{borderBottomWidth:1,borderBottomColor:colors.border,paddingVertical:spacing.md}}>
          <Text style={[type.label,{paddingHorizontal:spacing.lg,marginBottom:10}]}>Your Taste-Twins</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:14}}>
            {twins.map(f=><TouchableOpacity key={f.id} onPress={()=>setShowCompare(true)} style={{alignItems:'center',width:60}}>
              <View style={{width:46,height:46,borderRadius:23,backgroundColor:f.color+'28',alignItems:'center',justifyContent:'center',marginBottom:5}}><Text style={{fontFamily:fonts.sansBold,fontSize:16,color:f.color}}>{f.init}</Text></View>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}} numberOfLines={1}>{f.name.split(' ')[0]}</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent}}>{f.match}%</Text>
            </TouchableOpacity>)}
          </ScrollView>
        </View>
        {ACTIVITY.map(it=>{const f=fr(it.user);const b=it.bookId?all.find(x=>x.id===it.bookId):null;
          return <View key={it.id} style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <View style={{flexDirection:'row',gap:10}}>
              <View style={{width:34,height:34,borderRadius:17,backgroundColor:(f?.color||colors.accent)+'28',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:f?.color||colors.accent}}>{f?.init}</Text></View>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                  <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>{f?.name.split(' ')[0]}</Text>
                  <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.accent}}>{f?.match}%</Text>
                  <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>· {it.ts}</Text>
                </View>
                <View style={{marginTop:2}}>{feedLine(it)}</View>
                {(it.type==='hot'||it.type==='dnf')&&it.text?<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text2,lineHeight:19,marginTop:6}}>"{it.text}"</Text>:null}
                <View style={{flexDirection:'row',gap:16,marginTop:10}}>
                  <TouchableOpacity onPress={()=>setReacted(r=>({...r,[it.id]:!r[it.id]}))}><Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:reacted[it.id]?colors.accent:colors.text3}}>{reacted[it.id]?'♥ Liked':'♡ Like'}</Text></TouchableOpacity>
                  {b&&<TouchableOpacity onPress={()=>setDetailId(b.id)}><Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3}}>View book</Text></TouchableOpacity>}
                </View>
              </View>
            </View>
          </View>;})}
        <View style={{height:24}}/>
      </View>}

      {/* CLUBS */}
      {sub==='Clubs'&&<View style={{padding:spacing.lg,gap:12}}>
        <TouchableOpacity onPress={()=>setShowClub(true)} style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:spacing.lg}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text,marginBottom:4}}>The Lit Salon</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Reading Intermezzo · Elif, Juno · tap to open</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setShowClub(true)} style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:spacing.lg}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text,marginBottom:4}}>Dark & Dense</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Reading A Little Life · Marcus, Priya · tap to open</Text>
        </TouchableOpacity>
        <Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:12,color:colors.text3,marginTop:6}}>No other clubs yet. Start one. Name it something good.</Text>
      </View>}

      {/* CHALLENGES */}
      {sub==='Challenges'&&<View style={{padding:spacing.lg,gap:12}}>
        {CHALLENGES.map(ch=>{const pct=Math.round(ch.done.length/ch.goal*100);return <TouchableOpacity key={ch.id} onPress={()=>setChallengeId(ch.id)}
          style={{backgroundColor:colors.surface,borderWidth:1,borderColor:ch.featured?colors.accent:colors.border,padding:spacing.lg}}>
          {ch.featured&&<Text style={{fontFamily:fonts.sansBold,fontSize:8,color:colors.accent,letterSpacing:1.6,textTransform:'uppercase',marginBottom:6}}>Featured</Text>}
          <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text,marginBottom:8}}>{ch.title}</Text>
          <View style={{height:3,backgroundColor:colors.surface2,marginBottom:6}}><View style={{width:`${pct}%`,height:3,backgroundColor:colors.accent}}/></View>
          <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{ch.done.length}/{ch.goal} · {ch.readers.toLocaleString()} readers</Text>
        </TouchableOpacity>;})}
      </View>}

      {/* AUTHORS */}
      {sub==='Authors'&&<View>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:spacing.lg,paddingBottom:8}}>
          <Text style={type.label}>Authors You Follow</Text>
          <View style={{paddingHorizontal:8,paddingVertical:3,borderWidth:1,borderColor:colors.border}}><Text style={{fontFamily:fonts.sans,fontSize:9,color:colors.text3,letterSpacing:0.5}}>FOR AUTHORS →</Text></View>
        </View>
        {authors.map(name=>{const a=AUTHOR_DATA[name];const following=!!authorFollows[name];const init=name.split(' ').map(w=>w[0]).join('').slice(0,2);
          return <View key={name} style={{flexDirection:'row',alignItems:'center',gap:12,padding:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <TouchableOpacity onPress={()=>setAuthorOpen(name)} style={{width:42,height:42,borderRadius:21,backgroundColor:colors.surface2,alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.serifItalic,fontSize:16,color:colors.text2}}>{init}</Text></TouchableOpacity>
            <TouchableOpacity style={{flex:1}} onPress={()=>setAuthorOpen(name)}>
              <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}}>{name}</Text>
                <View style={{width:13,height:13,borderRadius:7,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:8,color:colors.bg}}>✓</Text></View>
              </View>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:1}}>{a.books.length} book{a.books.length>1?'s':''} on Verso</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>toggleAuthorFollow(name)} style={{paddingHorizontal:12,paddingVertical:6,backgroundColor:following?colors.accentDim:colors.accent,borderWidth:1,borderColor:colors.accent}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:following?colors.accent:colors.bg}}>{following?'Following':'Follow'}</Text>
            </TouchableOpacity>
          </View>;})}
        <View style={{height:24}}/>
      </View>}

      {/* BUDDIES */}
      {sub==='Buddies'&&<View style={{padding:spacing.lg}}>
        {buddyReads.length>0?buddyReads.map(br=>{const b=all.find(x=>x.id===br.bookId);const f=fr(br.partner);if(!b)return null;
          const total=BOOKS.find(x=>x.id===br.bookId)?.pages||400;
          return <TouchableOpacity key={br.bookId} onPress={()=>setDetailId(br.bookId)} style={{flexDirection:'row',gap:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <BookCover bookId={br.bookId} size="sm"/>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:1}}>with {f?.name.split(' ')[0]} · you p.{br.myPage} / them p.{br.theirPage}</Text>
            </View>
            <View style={{alignSelf:'center',paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent}}><Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:colors.accent}}>BUDDY READ</Text></View>
          </TouchableOpacity>;}):<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>No buddy reads yet. Open a book and start one.</Text>}
      </View>}
    </ScrollView>

    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
    {showClub&&<BookClubModal visible onClose={()=>setShowClub(false)} onOpenBook={id=>{setShowClub(false);setDetailId(id);}}/>}
    <ChallengeModal challengeId={challengeId} onClose={()=>setChallengeId(null)} onOpenBook={id=>{setChallengeId(null);setDetailId(id);}}/>
    <AuthorModal author={authorOpen} onClose={()=>setAuthorOpen(null)} onOpenBook={id=>{setAuthorOpen(null);setDetailId(id);}}/>
    {showCompare&&<CompareModal visible onClose={()=>setShowCompare(false)}/>}
  </SafeAreaView>;
}
const fline:any={fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:19};
const fb:any={fontFamily:fonts.sansMedium,color:colors.text};
