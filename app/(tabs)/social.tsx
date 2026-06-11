import React,{useState} from 'react';
import {ScrollView,View,Text,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {useRouter} from 'expo-router';
import {colors,spacing,fonts,type} from '../../constants/theme';
import {BOOKS,FRIENDS,CHALLENGES,ACTIVITY,AUTHOR_DATA} from '../../data/books';
import {TextInput} from 'react-native';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import BookClubModal from '../../components/BookClubModal';
import ChallengeModal from '../../components/ChallengeModal';
import AuthorModal from '../../components/AuthorModal';
import CompareModal from '../../components/CompareModal';
import FriendProfileModal from '../../components/FriendProfileModal';

const SUBS=['Feed','Clubs','Challenges','Authors','Buddies'] as const;
type Sub=typeof SUBS[number];
const fr=(id:string)=>FRIENDS.find(f=>f.id===id);

export default function SocialScreen(){
  const router=useRouter();
  const {buddyReads,authorFollows,toggleAuthorFollow,customBooks,shelf,userClubs,userChallenges,createClub,createChallenge}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [sub,setSub]=useState<Sub>('Feed');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [showClub,setShowClub]=useState(false);
  const [clubOpenId,setClubOpenId]=useState<string|null>(null);
  const [challengeId,setChallengeId]=useState<string|null>(null);
  const [authorOpen,setAuthorOpen]=useState<string|null>(null);
  const [showCompare,setShowCompare]=useState(false);
  const [friendOpen,setFriendOpen]=useState<string|null>(null);
  const [reacted,setReacted]=useState<Record<string,boolean>>({});
  const [clubQ,setClubQ]=useState(''); const [clubName,setClubName]=useState(''); const [clubBook,setClubBook]=useState<string|null>(null); const [clubCreating,setClubCreating]=useState(false);
  const [chQ,setChQ]=useState(''); const [chTitle,setChTitle]=useState(''); const [chDesc,setChDesc]=useState(''); const [chGoal,setChGoal]=useState('12'); const [chCreating,setChCreating]=useState(false);
  const shelfBooks=all.filter(b=>shelf[b.id]==='reading'||shelf[b.id]==='want'||shelf[b.id]==='read');

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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0}} contentContainerStyle={{paddingHorizontal:spacing.lg,paddingVertical:10,gap:8}}>
      {SUBS.map(s=><TouchableOpacity key={s} onPress={()=>setSub(s)} style={{paddingHorizontal:16,paddingVertical:7,borderRadius:999,backgroundColor:sub===s?colors.accent:colors.surface2,borderWidth:1,borderColor:sub===s?colors.accent:colors.border}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:sub===s?colors.text:colors.text2}}>{s}</Text>
      </TouchableOpacity>)}
    </ScrollView>

    <ScrollView showsVerticalScrollIndicator={false}>
      {/* FEED */}
      {sub==='Feed'&&<View>
        {/* taste-twins strip */}
        <View style={{borderBottomWidth:1,borderBottomColor:colors.border,paddingVertical:spacing.md}}>
          <Text style={[type.label,{paddingHorizontal:spacing.lg,marginBottom:10}]}>Your Taste-Twins</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:14}}>
            {twins.map(f=><TouchableOpacity key={f.id} onPress={()=>setFriendOpen(f.id)} style={{alignItems:'center',width:60}}>
              <View style={{width:46,height:46,borderRadius:23,backgroundColor:f.color+'28',alignItems:'center',justifyContent:'center',marginBottom:5}}><Text style={{fontFamily:fonts.sansBold,fontSize:16,color:f.color}}>{f.init}</Text></View>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}} numberOfLines={1}>{f.name.split(' ')[0]}</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent}}>{f.match}%</Text>
            </TouchableOpacity>)}
          </ScrollView>
        </View>
        {ACTIVITY.map(it=>{const f=fr(it.user);const b=it.bookId?all.find(x=>x.id===it.bookId):null;
          return <View key={it.id} style={{padding:spacing.lg,backgroundColor:colors.surface,borderRadius:12,marginHorizontal:spacing.lg,marginBottom:8,marginTop:4}}>
            <View style={{flexDirection:'row',gap:10}}>
              <TouchableOpacity disabled={!f} onPress={()=>f&&setFriendOpen(f.id)} style={{width:34,height:34,borderRadius:17,backgroundColor:(f?.color||colors.accent)+'28',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:f?.color||colors.accent}}>{f?.init}</Text></TouchableOpacity>
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
      {sub==='Clubs'&&(()=>{
        const seeded=[{id:'lit-salon',name:'The Lit Salon',sub:'Reading Intermezzo · Elif, Juno'},{id:'dark-reads',name:'Dark & Dense',sub:'Reading A Little Life · Marcus, Priya'}];
        const userC=userClubs.map(c=>({id:c.id,name:c.name,sub:`Reading ${all.find(b=>b.id===c.bookId)?.title||'a book'} · you`}));
        const allC=[...seeded,...userC].filter(c=>c.name.toLowerCase().includes(clubQ.toLowerCase()));
        return <View style={{padding:spacing.lg}}>
          <TextInput style={inp} placeholder="Search clubs…" placeholderTextColor={colors.text3} value={clubQ} onChangeText={setClubQ}/>
          {clubCreating?<View style={{marginTop:spacing.md,gap:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:14,borderRadius:16}}>
            <TextInput style={inp} placeholder="Club name — make it good" placeholderTextColor={colors.text3} value={clubName} onChangeText={setClubName}/>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>Current read:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={{flexDirection:'row',gap:8}}>
              {shelfBooks.slice(0,12).map(b=><TouchableOpacity key={b.id} onPress={()=>setClubBook(b.id)} style={[chip,clubBook===b.id&&activeChip]}><Text style={{fontFamily:fonts.sans,fontSize:11,color:clubBook===b.id?colors.accent:colors.text2}} numberOfLines={1}>{b.title}</Text></TouchableOpacity>)}
            </View></ScrollView>
            <View style={{flexDirection:'row',gap:8}}>
              <TouchableOpacity style={{flex:1,backgroundColor:colors.accent,padding:11,alignItems:'center',borderRadius:999}} onPress={()=>{if(clubName.trim()&&clubBook){createClub(clubName.trim(),clubBook);setClubName('');setClubBook(null);setClubCreating(false);}}}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Create club</Text></TouchableOpacity>
              <TouchableOpacity style={{paddingHorizontal:16,justifyContent:'center'}} onPress={()=>setClubCreating(false)}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Cancel</Text></TouchableOpacity>
            </View>
          </View>:<TouchableOpacity onPress={()=>setClubCreating(true)} style={{marginTop:spacing.md,padding:13,borderWidth:1,borderColor:colors.border,borderStyle:'dashed',alignItems:'center',borderRadius:12}}><Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text2}}>+ Start a club</Text></TouchableOpacity>}
          <View style={{height:spacing.md}}/>
          {allC.map(c=><TouchableOpacity key={c.id} onPress={()=>{setClubOpenId(c.id.startsWith('club-')?c.id:null);setShowClub(true);}} style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:spacing.lg,marginBottom:10,borderRadius:16}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text,marginBottom:4}}>{c.name}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>{c.sub} · tap to open</Text>
          </TouchableOpacity>)}
          {allC.length===0&&<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.lg}}>No clubs match. Start one. Name it something good.</Text>}
        </View>;
      })()}

      {/* CHALLENGES */}
      {sub==='Challenges'&&(()=>{
        const allCh=[...CHALLENGES.map(c=>({id:c.id,title:c.title,featured:c.featured,sub:`${c.done.length}/${c.goal} · ${c.readers.toLocaleString()} readers`})),...userChallenges.map(c=>({id:c.id,title:c.title,featured:false,sub:`0/${c.goal} · your challenge`}))].filter(c=>c.title.toLowerCase().includes(chQ.toLowerCase()));
        return <View style={{padding:spacing.lg}}>
          <TextInput style={inp} placeholder="Search challenges…" placeholderTextColor={colors.text3} value={chQ} onChangeText={setChQ}/>
          {chCreating?<View style={{marginTop:spacing.md,gap:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:14,borderRadius:16}}>
            <TextInput style={inp} placeholder="Challenge title" placeholderTextColor={colors.text3} value={chTitle} onChangeText={setChTitle}/>
            <TextInput style={inp} placeholder="Description" placeholderTextColor={colors.text3} value={chDesc} onChangeText={setChDesc}/>
            <TextInput style={inp} placeholder="Goal (# of books)" placeholderTextColor={colors.text3} keyboardType="numeric" value={chGoal} onChangeText={setChGoal}/>
            <View style={{flexDirection:'row',gap:8}}>
              <TouchableOpacity style={{flex:1,backgroundColor:colors.accent,padding:11,alignItems:'center',borderRadius:999}} onPress={()=>{if(chTitle.trim()){createChallenge(chTitle.trim(),chDesc.trim(),parseInt(chGoal)||12);setChTitle('');setChDesc('');setChGoal('12');setChCreating(false);}}}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Create challenge</Text></TouchableOpacity>
              <TouchableOpacity style={{paddingHorizontal:16,justifyContent:'center'}} onPress={()=>setChCreating(false)}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Cancel</Text></TouchableOpacity>
            </View>
          </View>:<TouchableOpacity onPress={()=>setChCreating(true)} style={{marginTop:spacing.md,padding:13,borderWidth:1,borderColor:colors.border,borderStyle:'dashed',alignItems:'center',borderRadius:12}}><Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text2}}>+ Create a challenge</Text></TouchableOpacity>}
          <View style={{height:spacing.md}}/>
          {allCh.map(ch=><TouchableOpacity key={ch.id} onPress={()=>setChallengeId(ch.id)} style={{backgroundColor:colors.surface,borderWidth:1,borderColor:ch.featured?colors.accent:colors.border,padding:spacing.lg,marginBottom:10,borderRadius:16}}>
            {ch.featured&&<Text style={{fontFamily:fonts.sansBold,fontSize:8,color:colors.accent,letterSpacing:1.6,textTransform:'uppercase',marginBottom:6}}>Featured</Text>}
            <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text,marginBottom:6}}>{ch.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{ch.sub}</Text>
          </TouchableOpacity>)}
        </View>;
      })()}

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
            <TouchableOpacity onPress={()=>toggleAuthorFollow(name)} style={{paddingHorizontal:12,paddingVertical:6,backgroundColor:following?colors.accentDim:colors.accent,borderWidth:1,borderColor:colors.accent,borderRadius:999}}>
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
            <View style={{alignSelf:'center',paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,borderRadius:999}}><Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:colors.accent}}>BUDDY READ</Text></View>
          </TouchableOpacity>;}):<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>No buddy reads yet. Open a book and start one.</Text>}
      </View>}
    </ScrollView>

    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
    {showClub&&<BookClubModal visible initialClubId={clubOpenId} onClose={()=>{setShowClub(false);setClubOpenId(null);}} onOpenBook={id=>{setShowClub(false);setDetailId(id);}}/>}
    <ChallengeModal challengeId={challengeId} onClose={()=>setChallengeId(null)} onOpenBook={id=>{setChallengeId(null);setDetailId(id);}}/>
    <AuthorModal author={authorOpen} onClose={()=>setAuthorOpen(null)} onOpenBook={id=>{setAuthorOpen(null);setDetailId(id);}}/>
    {showCompare&&<CompareModal visible onClose={()=>setShowCompare(false)}/>}
    <FriendProfileModal friendId={friendOpen} onClose={()=>setFriendOpen(null)} onOpenBook={id=>{setFriendOpen(null);setDetailId(id);}}/>
  </SafeAreaView>;
}
const fline:any={fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:19};
const fb:any={fontFamily:fonts.sansMedium,color:colors.text};
const inp:any={fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10,borderRadius:12};
const chip:any={paddingHorizontal:12,paddingVertical:7,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,maxWidth:150,borderRadius:999};
const activeChip:any={backgroundColor:colors.accentDim,borderColor:colors.accent};
