import React,{useState} from 'react';
import {ScrollView,View,Text,TouchableOpacity,StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {colors,spacing,fonts,type,radius,shadow} from '../../constants/theme';
import {BOOKS,FRIENDS,CHALLENGES,ACTIVITY,AUTHOR_DATA} from '../../data/books';
import {TextInput} from 'react-native';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import ChallengeModal from '../../components/ChallengeModal';
import AuthorModal from '../../components/AuthorModal';
import FriendProfileModal from '../../components/FriendProfileModal';

const SUBS=['Feed','Challenges','Authors'] as const;
type Sub=typeof SUBS[number];
const fr=(id:string)=>FRIENDS.find(f=>f.id===id);

export default function SocialScreen(){
  const insets=useSafeAreaInsets();
  const router=useRouter();
  const {authorFollows,toggleAuthorFollow,customBooks,userChallenges,createChallenge}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [sub,setSub]=useState<Sub>('Feed');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [challengeId,setChallengeId]=useState<string|null>(null);
  const [authorOpen,setAuthorOpen]=useState<string|null>(null);
  const [friendOpen,setFriendOpen]=useState<string|null>(null);
  const [reacted,setReacted]=useState<Record<string,boolean>>({});
  const [chQ,setChQ]=useState(''); const [chTitle,setChTitle]=useState(''); const [chDesc,setChDesc]=useState(''); const [chGoal,setChGoal]=useState('12'); const [chCreating,setChCreating]=useState(false);

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

  return <View style={{flex:1,backgroundColor:colors.bg,paddingTop:insets.top}}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.bg}/>
    <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:4,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'}}>
      <View>
        <Text style={[type.label,{marginBottom:2}]}>Community</Text>
        <Text style={{fontFamily:fonts.serifItalic,fontSize:30,lineHeight:40,color:colors.text}}>Social</Text>
      </View>
      <TouchableOpacity onPress={()=>router.push('/profile')} style={{width:40,height:40,borderRadius:20,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center',...shadow.soft}}>
        <Text style={{fontFamily:fonts.serifBold,fontSize:17,color:colors.accentText}}>C</Text>
      </TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,height:60}} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:8,alignItems:'center'}}>
      {SUBS.map(s=><TouchableOpacity key={s} onPress={()=>setSub(s)} style={{paddingHorizontal:16,paddingVertical:9,borderRadius:radius.pill,backgroundColor:sub===s?colors.accent:colors.surface,borderWidth:1,borderColor:sub===s?colors.accent:colors.border}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:sub===s?colors.accentText:colors.text2}}>{s}</Text>
      </TouchableOpacity>)}
    </ScrollView>

    <ScrollView showsVerticalScrollIndicator={false}>
      {/* FEED */}
      {sub==='Feed'&&<View>
        {/* story-ring taste-twins strip */}
        <View style={{paddingVertical:spacing.md}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:14}}>
            {twins.map(f=><TouchableOpacity key={f.id} onPress={()=>setFriendOpen(f.id)} style={{alignItems:'center',width:64}}>
              <View style={{width:58,height:58,borderRadius:29,borderWidth:2.5,borderColor:f.color,alignItems:'center',justifyContent:'center',marginBottom:5}}>
                <View style={{width:48,height:48,borderRadius:24,backgroundColor:f.color+'28',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.sansBold,fontSize:17,color:f.color}}>{f.init}</Text></View>
              </View>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text2}} numberOfLines={1}>{f.name.split(' ')[0]}</Text>
              <Text style={{fontFamily:fonts.sansBold,fontSize:9,color:colors.accent}}>{f.match}% match</Text>
            </TouchableOpacity>)}
          </ScrollView>
        </View>

        {ACTIVITY.map(it=>{
          const f=fr(it.user);const b=it.bookId?all.find(x=>x.id===it.bookId):null;
          const seed=it.id.split('').reduce((n,c)=>n+c.charCodeAt(0),0);
          const likeCount=(seed%19)+3+(reacted[it.id]?1:0);
          const commentCount=seed%7;
          const liked=!!reacted[it.id];
          const handle='@'+(f?.name.split(' ')[0].toLowerCase()||'reader')+'.reads';
          return <View key={it.id} style={{backgroundColor:colors.surface,borderRadius:radius.lg,marginHorizontal:spacing.lg,marginBottom:12,padding:spacing.lg,...shadow.soft}}>
            {/* post header */}
            <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10}}>
              <TouchableOpacity disabled={!f} onPress={()=>f&&setFriendOpen(f.id)} style={{width:40,height:40,borderRadius:20,backgroundColor:(f?.color||colors.accent)+'28',alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:15,color:f?.color||colors.accent}}>{f?.init}</Text>
              </TouchableOpacity>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:colors.text}}>{f?.name.split(' ')[0]}</Text>
                  <View style={{paddingHorizontal:6,paddingVertical:2,backgroundColor:colors.accentDim,borderRadius:999}}><Text style={{fontFamily:fonts.sansBold,fontSize:9,color:colors.accent}}>{f?.match}%</Text></View>
                </View>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{handle} · {it.ts}</Text>
              </View>
              <View style={{marginTop:-6}}>{feedLine(it)?<View style={{paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.surface2,borderRadius:999}}><Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:colors.text3,textTransform:'uppercase',letterSpacing:0.5}}>{it.type==='hot'?'Hot take':it.type==='rated'?'Rated':it.type==='reading'?'Reading':it.type==='dnf'?'DNF':'Milestone'}</Text></View>:null}</View>
            </View>

            {/* post body — hot takes read like tweets */}
            {(it.type==='hot'||it.type==='dnf')&&it.text
              ?<Text style={{fontFamily:fonts.serif,fontSize:17,color:colors.text,lineHeight:26,marginBottom:12}}>"{it.text}"</Text>
              :<View style={{marginBottom:10}}>{feedLine(it)}</View>}

            {/* media: embedded book card — tap for full details */}
            {b&&<TouchableOpacity activeOpacity={0.85} onPress={()=>setDetailId(b.id)}
              style={{flexDirection:'row',gap:12,padding:12,backgroundColor:colors.bg,borderRadius:radius.md,borderWidth:1,borderColor:colors.border,alignItems:'center',marginBottom:12}}>
              <BookCover bookId={b.id} size="sm"/>
              <View style={{flex:1}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text}} numberOfLines={1}>{b.title}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:1}}>{b.author}</Text>
                {b.readers>0&&<Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent,marginTop:4}}>★ {b.avgRating} · {(b.readers/1000).toFixed(0)}k readers</Text>}
              </View>
              <Text style={{fontSize:14,color:colors.text3}}>›</Text>
            </TouchableOpacity>}

            {/* action bar */}
            <View style={{flexDirection:'row',alignItems:'center',gap:22,paddingTop:2}}>
              <TouchableOpacity onPress={()=>setReacted(r=>({...r,[it.id]:!r[it.id]}))} style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <Text style={{fontSize:16,color:liked?colors.danger:colors.text3}}>{liked?'♥':'♡'}</Text>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:liked?colors.danger:colors.text3}}>{likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={!f} onPress={()=>f&&setFriendOpen(f.id)} style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <Text style={{fontSize:14,color:colors.text3}}>💬</Text>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text3}}>{commentCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <Text style={{fontSize:14,color:colors.text3}}>↗</Text>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text3}}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>;})}
        <View style={{height:24}}/>
      </View>}

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

    </ScrollView>

    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
    <ChallengeModal challengeId={challengeId} onClose={()=>setChallengeId(null)} onOpenBook={id=>{setChallengeId(null);setDetailId(id);}}/>
    <AuthorModal author={authorOpen} onClose={()=>setAuthorOpen(null)} onOpenBook={id=>{setAuthorOpen(null);setDetailId(id);}}/>
    <FriendProfileModal friendId={friendOpen} onClose={()=>setFriendOpen(null)} onOpenBook={id=>{setFriendOpen(null);setDetailId(id);}}/>
  </View>;
}
const fline:any={fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:19};
const fb:any={fontFamily:fonts.sansMedium,color:colors.text};
const inp:any={fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10,borderRadius:12};
const chip:any={paddingHorizontal:12,paddingVertical:7,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,maxWidth:150,borderRadius:999};
const activeChip:any={backgroundColor:colors.accentDim,borderColor:colors.accent};
