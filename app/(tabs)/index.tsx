import React,{useState} from 'react';
import {ScrollView,View,Text,TextInput,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts,type} from '../../constants/theme';
import {BOOKS,FRIENDS,PAGE_COUNTS,BOOK_VIBES,FRIEND_BOOK} from '../../data/books';
import {useStore,MOODS,PACES} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import SwipeModal from '../../components/SwipeModal';
import AddBookModal from '../../components/AddBookModal';

const SUBS=['For You','Mood','Zeitgeist','Matches'] as const;
type Sub=typeof SUBS[number];

export default function DiscoverScreen(){
  const {shelf,journal,customBooks}=useStore();
  const allBooks=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [sub,setSub]=useState<Sub>('For You');
  const [q,setQ]=useState('');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [showSwipe,setShowSwipe]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [addPrefill,setAddPrefill]=useState('');
  const [moods,setMoods]=useState<string[]>([]);
  const [pace,setPace]=useState<string|null>(null);
  const [zTab,setZTab]=useState<'trending'|'new'>('trending');

  const reading=allBooks.filter(b=>shelf[b.id]==='reading');
  const searching=q.trim().length>0;
  const results=allBooks.filter(b=>b.title.toLowerCase().includes(q.toLowerCase())||b.author.toLowerCase().includes(q.toLowerCase()));

  function toggleMood(m:string){ setMoods(p=>p.includes(m)?p.filter(x=>x!==m):p.length>=3?p:[...p,m]); }

  // Mood filter results
  const moodMatches=allBooks.filter(b=>{const v=BOOK_VIBES[b.id];if(!v)return false;
    const moodOk=moods.length===0||moods.some(m=>v.moods.includes(m));
    const paceOk=!pace||v.pace===pace;
    return moodOk&&paceOk;}).filter(b=>moods.length>0||pace);

  // Zeitgeist
  const trending=[...allBooks].filter(b=>BOOK_VIBES[b.id]).sort((a,b)=>BOOK_VIBES[b.id].weekly-BOOK_VIBES[a.id].weekly);
  const newReleases=[...allBooks].filter(b=>b.year>0).sort((a,b)=>b.year-a.year);

  // Taste match feed: friends with 70%+ match, books they rated >=5 (then >=4)
  const twins=FRIENDS.filter(f=>f.match>=70);
  const feed:{bookId:string;friend:typeof FRIENDS[number];r:number}[]=[];
  allBooks.forEach(b=>{const ft=FRIEND_BOOK[b.id];if(!ft)return;
    twins.forEach(f=>{const e=ft[f.id];if(e&&e.r>=4&&!shelf[b.id]) feed.push({bookId:b.id,friend:f,r:e.r});});});
  feed.sort((a,b)=>(b.r-a.r)||(b.friend.match-a.friend.match));

  function Row({id,extra}:{id:string;extra?:React.ReactNode}){
    const b=allBooks.find(x=>x.id===id); if(!b) return null;
    return <TouchableOpacity onPress={()=>setDetailId(id)} activeOpacity={0.8} style={{flexDirection:'row',gap:12,padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
      <BookCover bookId={id} size="sm"/>
      <View style={{flex:1,justifyContent:'center'}}>
        <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{b.title}</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:1}}>{b.author}{b.year?` · ${b.year}`:''}</Text>
        {extra}
      </View>
      <Text style={{color:colors.text3,fontSize:16,alignSelf:'center'}}>›</Text>
    </TouchableOpacity>;
  }

  return <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
    <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
    {/* Header */}
    <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
      <Text style={{fontFamily:fonts.serifItalic,fontSize:24,color:colors.text}}>Verso</Text>
      <TouchableOpacity onPress={()=>setShowAdd(true)} style={{paddingHorizontal:12,paddingVertical:6,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text}}>+ Add Book</Text>
      </TouchableOpacity>
    </View>
    {/* Search */}
    <View style={{paddingHorizontal:spacing.lg,paddingBottom:10}}>
      <TextInput style={{fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:14,paddingHorizontal:14,paddingVertical:10}}
        placeholder="Search title, author, ISBN…" placeholderTextColor={colors.text3} value={q} onChangeText={setQ} autoCapitalize="none" autoCorrect={false}/>
    </View>
    {/* Pill sub-nav */}
    {!searching&&<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,borderBottomWidth:1,borderBottomColor:colors.border}} contentContainerStyle={{paddingHorizontal:spacing.lg}}>
      {SUBS.map(s=><TouchableOpacity key={s} onPress={()=>setSub(s)} style={{paddingHorizontal:14,paddingVertical:12,borderBottomWidth:2,borderBottomColor:sub===s?colors.accent:'transparent'}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:sub===s?colors.accent:colors.text3,letterSpacing:0.4}}>{s}</Text>
      </TouchableOpacity>)}
    </ScrollView>}

    <ScrollView showsVerticalScrollIndicator={false}>
      {/* SEARCH RESULTS override */}
      {searching?<View>
        <Text style={[type.label,{padding:spacing.lg,paddingBottom:8}]}>{results.length} result{results.length!==1?'s':''}</Text>
        {results.map(b=><Row key={b.id} id={b.id} extra={<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:3}}>★ {b.avgRating||'—'}{BOOK_VIBES[b.id]?` · ${BOOK_VIBES[b.id].pace}`:''}</Text>}/>)}
        {/* Add-from-search: always offer when searching, prominent when nothing matches */}
        <TouchableOpacity onPress={()=>{setAddPrefill(q.trim());setShowAdd(true);}} style={{margin:spacing.lg,padding:14,borderWidth:1,borderColor:colors.accent,backgroundColor:colors.accentDim,alignItems:'center'}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.accent}}>{results.length?'Not the right one? ':''}Add "{q.trim()}" to Verso →</Text>
        </TouchableOpacity>
        {results.length===0&&<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingHorizontal:spacing.xl}}>We don't have it yet — but we can. Tap above and we'll pull it from Open Library.</Text>}
      </View>:<>

      {/* FOR YOU */}
      {sub==='For You'&&<View>
        {reading.length>0&&<View style={{borderBottomWidth:1,borderBottomColor:colors.border,paddingBottom:6}}>
          <Text style={[type.label,{padding:spacing.lg,paddingBottom:8}]}>Currently Reading</Text>
          {reading.map(b=>{const j=journal[b.id];const total=PAGE_COUNTS[b.id]||b.pages||300;const pct=j?Math.min(100,Math.round(j.page/total*100)):0;
            return <TouchableOpacity key={b.id} onPress={()=>setDetailId(b.id)} style={{flexDirection:'row',padding:spacing.lg,paddingTop:0,gap:12}} activeOpacity={0.8}>
              <BookCover bookId={b.id} size="sm"/>
              <View style={{flex:1,justifyContent:'center'}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text,marginBottom:3}}>{b.title}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:6}}>{b.author}</Text>
                <View style={{height:2,backgroundColor:colors.surface2}}><View style={{height:2,backgroundColor:colors.accent,width:`${pct}%` as any}}/></View>
                <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:3}}>{j?`p.${j.page}`:'not started'} · {pct}%</Text>
              </View>
            </TouchableOpacity>;})}
        </View>}
        <TouchableOpacity style={card} activeOpacity={0.85} onPress={()=>setShowSwipe(true)}>
          <View style={{flex:1}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text,marginBottom:3}}>{allBooks.filter(b=>!shelf[b.id]).length} books awaiting your verdict</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>Book Tinder · build your taste profile</Text>
          </View>
          <Text style={{fontSize:18,color:colors.accent}}>→</Text>
        </TouchableOpacity>
        <Text style={[type.label,{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:8}]}>Picked by Editors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:spacing.lg,paddingBottom:8}}>
          {BOOKS.slice(0,6).map(b=><TouchableOpacity key={b.id} style={{width:110,marginRight:14}} activeOpacity={0.8} onPress={()=>setDetailId(b.id)}>
            <BookCover bookId={b.id} size="md"/>
            <Text style={{fontFamily:fonts.serifItalic,fontSize:13,color:colors.text,marginTop:7,marginBottom:2}} numberOfLines={2}>{b.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{b.author}</Text>
          </TouchableOpacity>)}
        </ScrollView>
        <View style={{height:24}}/>
      </View>}

      {/* MOOD */}
      {sub==='Mood'&&<View style={{padding:spacing.lg}}>
        <Text style={[type.label,{marginBottom:4}]}>Tonight's Mood</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:12}}>Pick up to 3.</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:spacing.lg}}>
          {MOODS.map(m=><TouchableOpacity key={m} onPress={()=>toggleMood(m)} style={[chip,moods.includes(m)&&activeChip]}>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:moods.includes(m)?colors.accent:colors.text3}}>{m}</Text>
          </TouchableOpacity>)}
        </View>
        <Text style={[type.label,{marginBottom:12}]}>How fast do you want to move?</Text>
        <View style={{flexDirection:'row',gap:8,marginBottom:spacing.lg}}>
          {PACES.map(p=><TouchableOpacity key={p} onPress={()=>setPace(pace===p?null:p)} style={[chip,pace===p&&activeChip]}>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:pace===p?colors.accent:colors.text3}}>{p}</Text>
          </TouchableOpacity>)}
        </View>
        {(moods.length>0||pace)?<View style={{marginHorizontal:-spacing.lg}}>
          <Text style={[type.label,{paddingHorizontal:spacing.lg,marginBottom:4}]}>{moodMatches.length} books match</Text>
          {moodMatches.map(b=><Row key={b.id} id={b.id} extra={<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:3}}>{BOOK_VIBES[b.id].moods.join(' · ')} · {BOOK_VIBES[b.id].pace}</Text>}/>)}
        </View>:<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>Tell us how you want to feel tonight.</Text>}
      </View>}

      {/* ZEITGEIST */}
      {sub==='Zeitgeist'&&<View>
        <View style={{flexDirection:'row',gap:8,padding:spacing.lg,paddingBottom:8}}>
          {([['trending','Trending this week'],['new','New releases']] as const).map(([k,l])=><TouchableOpacity key={k} onPress={()=>setZTab(k)}
            style={{paddingHorizontal:12,paddingVertical:7,backgroundColor:zTab===k?colors.accentDim:colors.surface,borderWidth:1,borderColor:zTab===k?colors.accent:colors.border}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:zTab===k?colors.accent:colors.text3}}>{l}</Text>
          </TouchableOpacity>)}
        </View>
        {(zTab==='trending'?trending:newReleases).map((b,i)=><TouchableOpacity key={b.id} onPress={()=>setDetailId(b.id)} activeOpacity={0.8}
          style={{flexDirection:'row',gap:12,paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border,alignItems:'center'}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:18,color:colors.text3,width:26}}>{i+1}</Text>
          <View style={{flex:1}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text}} numberOfLines={1}>{b.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:1}}>{b.author}</Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent,marginTop:4}}>{zTab==='trending'?`${BOOK_VIBES[b.id]?.weekly.toLocaleString()||'—'} readers this week`:b.year}</Text>
          </View>
        </TouchableOpacity>)}
        <View style={{height:24}}/>
      </View>}

      {/* MATCHES — taste match feed */}
      {sub==='Matches'&&<View>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,padding:spacing.lg,paddingBottom:8}}>Books your taste-twins loved</Text>
        {feed.map(({bookId,friend,r},i)=>{const b=allBooks.find(x=>x.id===bookId);if(!b)return null;
          return <TouchableOpacity key={bookId+friend.id+i} onPress={()=>setDetailId(bookId)} activeOpacity={0.8}
            style={{flexDirection:'row',gap:12,padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <BookCover bookId={bookId} size="sm"/>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:1}}>{b.author}</Text>
              <View style={{flexDirection:'row',alignItems:'center',gap:6,marginTop:5}}>
                <View style={{width:20,height:20,borderRadius:10,backgroundColor:friend.color+'24',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.sansBold,fontSize:9,color:friend.color}}>{friend.init}</Text></View>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2}}>{friend.name.split(' ')[0]} ({friend.match}% match) gave this {'★'.repeat(r)}</Text>
              </View>
            </View>
          </TouchableOpacity>;})}
        {feed.length===0&&<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',padding:spacing.xl}}>Your taste-twins have run out of recommendations. Suspicious.</Text>}
        <View style={{height:24}}/>
      </View>}
      </>}
    </ScrollView>

    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
    {showSwipe&&<SwipeModal visible onClose={()=>setShowSwipe(false)} onOpenBook={id=>{setShowSwipe(false);setDetailId(id);}}/>}
    {showAdd&&<AddBookModal visible prefill={addPrefill} onClose={()=>{setShowAdd(false);setAddPrefill('');}}/>}
  </SafeAreaView>;
}
const card:any={marginHorizontal:spacing.lg,marginTop:spacing.md,marginBottom:spacing.sm,padding:14,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center'};
const chip:any={paddingHorizontal:14,paddingVertical:7,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border};
const activeChip:any={backgroundColor:colors.accentDim,borderColor:colors.accent};
