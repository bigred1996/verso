import React,{useState} from 'react';
import {ScrollView,View,Text,TextInput,TouchableOpacity,StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors,spacing,fonts,type,radius,shadow,pastels,pastelText} from '../../constants/theme';
import {BOOKS,FRIENDS,BOOK_VIBES,FRIEND_BOOK,recommendBooks} from '../../data/books';
import {useStore,MOODS,PACES} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import SwipeModal from '../../components/SwipeModal';
import AddBookModal from '../../components/AddBookModal';

const SUBS=['For You','Mood'] as const;
type Sub=typeof SUBS[number];

export default function DiscoverScreen(){
  const insets=useSafeAreaInsets();
  const {shelf,ratings,favorites,swipeData,customBooks}=useStore();
  const allBooks=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [sub,setSub]=useState<Sub>('For You');
  const [q,setQ]=useState('');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [showSwipe,setShowSwipe]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [addPrefill,setAddPrefill]=useState('');
  const [moods,setMoods]=useState<string[]>([]);
  const [pace,setPace]=useState<string|null>(null);

  const searching=q.trim().length>0;
  const results=allBooks.filter(b=>b.title.toLowerCase().includes(q.toLowerCase())||b.author.toLowerCase().includes(q.toLowerCase()));

  function toggleMood(m:string){ setMoods(p=>p.includes(m)?p.filter(x=>x!==m):p.length>=3?p:[...p,m]); }

  // Mood filter results
  const moodMatches=allBooks.filter(b=>{const v=BOOK_VIBES[b.id];if(!v)return false;
    const moodOk=moods.length===0||moods.some(m=>v.moods.includes(m));
    const paceOk=!pace||v.pace===pace;
    return moodOk&&paceOk;}).filter(b=>moods.length>0||pace);

  // Recommendations from your likes (ratings ≥4 / Book Swipe likes / favourites)
  const likedIds=allBooks.filter(b=>(ratings[b.id]||0)>=4||swipeData[b.id]==='like'||favorites.includes(b.id)).map(b=>b.id);
  const recExclude=new Set<string>([...allBooks.filter(b=>shelf[b.id]).map(b=>b.id),...Object.keys(swipeData),...likedIds]);
  const recs=recommendBooks(likedIds,allBooks,recExclude,8);

  // Trending this week
  const trending=[...allBooks].filter(b=>BOOK_VIBES[b.id]).sort((a,b)=>BOOK_VIBES[b.id].weekly-BOOK_VIBES[a.id].weekly).slice(0,10);

  // Taste-twin picks: high-match friends' 4★+ books you haven't shelved
  const twins=FRIENDS.filter(f=>f.match>=70);
  const feed:{bookId:string;friend:typeof FRIENDS[number];r:number}[]=[];
  allBooks.forEach(b=>{const ft=FRIEND_BOOK[b.id];if(!ft)return;
    twins.forEach(f=>{const e=ft[f.id];if(e&&e.r>=4&&!shelf[b.id]) feed.push({bookId:b.id,friend:f,r:e.r});});});
  feed.sort((a,b)=>(b.r-a.r)||(b.friend.match-a.friend.match));

  function Row({id,extra}:{id:string;extra?:React.ReactNode}){
    const b=allBooks.find(x=>x.id===id); if(!b) return null;
    return <TouchableOpacity onPress={()=>setDetailId(id)} activeOpacity={0.8} style={{flexDirection:'row',gap:14,padding:14,backgroundColor:colors.surface,borderRadius:radius.lg,marginHorizontal:spacing.lg,marginBottom:10,...shadow.soft}}>
      <BookCover bookId={id} size="sm"/>
      <View style={{flex:1,justifyContent:'center'}}>
        <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{b.title}</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:1}}>{b.author}{b.year?` · ${b.year}`:''}</Text>
        {extra}
      </View>
      <Text style={{color:colors.text3,fontSize:16,alignSelf:'center'}}>›</Text>
    </TouchableOpacity>;
  }

  function PosterCard({id,caption}:{id:string;caption?:React.ReactNode}){
    const b=allBooks.find(x=>x.id===id); if(!b) return null;
    return <TouchableOpacity onPress={()=>setDetailId(id)} activeOpacity={0.85} style={{width:124,marginRight:12,backgroundColor:colors.surface,borderRadius:radius.lg,padding:10,...shadow.soft}}>
      <BookCover bookId={id} size="sm"/>
      <Text style={{fontFamily:fonts.serifBold,fontSize:12,color:colors.text,marginTop:8,lineHeight:16}} numberOfLines={2}>{b.title}</Text>
      <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:2}} numberOfLines={1}>{b.author}</Text>
      {caption}
    </TouchableOpacity>;
  }

  return <View style={{flex:1,backgroundColor:colors.bg,paddingTop:insets.top}}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.bg}/>
    {/* Header */}
    <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'}}>
      <View>
        <Text style={[type.label,{marginBottom:2}]}>Discover</Text>
        <Text style={{fontFamily:fonts.serifItalic,fontSize:30,lineHeight:40,color:colors.text}}>Verso</Text>
      </View>
      <TouchableOpacity onPress={()=>setShowAdd(true)} style={{paddingHorizontal:15,paddingVertical:9,backgroundColor:colors.accent,borderRadius:radius.pill,...shadow.soft}}>
        <Text style={{fontFamily:fonts.sansBold,fontSize:12,color:colors.accentText}}>+ Add Book</Text>
      </TouchableOpacity>
    </View>
    {/* Search */}
    <View style={{paddingHorizontal:spacing.lg,paddingBottom:10}}>
      <TextInput style={{fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:14,paddingHorizontal:16,paddingVertical:13,borderRadius:radius.md,...shadow.soft}}
        placeholder="Search title, author, ISBN…" placeholderTextColor={colors.text3} value={q} onChangeText={setQ} autoCapitalize="none" autoCorrect={false}/>
    </View>
    {/* Pill sub-nav */}
    {!searching&&<View style={{flexDirection:'row',gap:8,paddingHorizontal:spacing.lg,paddingVertical:8}}>
      {SUBS.map(s=><TouchableOpacity key={s} onPress={()=>setSub(s)} style={{flex:1,paddingVertical:9,borderRadius:radius.pill,alignItems:'center',backgroundColor:sub===s?colors.accent:colors.surface,borderWidth:1,borderColor:sub===s?colors.accent:colors.border}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:sub===s?colors.accentText:colors.text2}}>{s}</Text>
      </TouchableOpacity>)}
    </View>}

    <ScrollView showsVerticalScrollIndicator={false}>
      {/* SEARCH RESULTS override */}
      {searching?<View>
        <Text style={[type.label,{padding:spacing.lg,paddingBottom:8}]}>{results.length} result{results.length!==1?'s':''}</Text>
        {results.map(b=><Row key={b.id} id={b.id} extra={<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:3}}>★ {b.avgRating||'—'}{BOOK_VIBES[b.id]?` · ${BOOK_VIBES[b.id].pace}`:''}</Text>}/>)}
        <TouchableOpacity onPress={()=>{setAddPrefill(q.trim());setShowAdd(true);}} style={{margin:spacing.lg,padding:14,borderWidth:1,borderColor:colors.accent,backgroundColor:colors.accentDim,alignItems:'center',borderRadius:12}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.accent}}>{results.length?'Not the right one? ':''}Add "{q.trim()}" to Verso →</Text>
        </TouchableOpacity>
        {results.length===0&&<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingHorizontal:spacing.xl}}>We don't have it yet — but we can. Tap above and we'll pull it from Open Library.</Text>}
      </View>:<>

      {/* FOR YOU */}
      {sub==='For You'&&<View style={{paddingTop:spacing.xs}}>
        {/* Recommended for you — the centerpiece, driven by your likes */}
        {recs.length>0&&<View style={{marginBottom:spacing.sm}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:spacing.lg,paddingBottom:10}}>
            <Text style={[type.label]}>Recommended for you</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>from your likes</Text>
          </View>
          {recs.slice(0,5).map(r=>{const seed=allBooks.find(x=>x.id===r.reasonId);
            return <Row key={r.id} id={r.id} extra={seed?<Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent,marginTop:4}}>Because you loved {seed.title}</Text>:undefined}/>;})}
        </View>}

        {/* Book Swipe — feeds the recs above */}
        <TouchableOpacity style={card} activeOpacity={0.85} onPress={()=>setShowSwipe(true)}>
          <View style={{flex:1}}>
            <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:pastelText.sky,marginBottom:3}}>{allBooks.filter(b=>!swipeData[b.id]&&!shelf[b.id]).length} books to react to</Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:pastelText.sky,opacity:0.8}}>Book Swipe · the more you swipe, the better these get</Text>
          </View>
          <Text style={{fontSize:20,color:pastelText.sky}}>→</Text>
        </TouchableOpacity>

        {/* Your taste-twins loved */}
        {feed.length>0&&<View style={{marginTop:spacing.md}}>
          <Text style={[type.label,{paddingHorizontal:spacing.lg,paddingBottom:10}]}>Your Taste-Twins Loved</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:spacing.lg,paddingRight:spacing.sm}}>
            {feed.slice(0,8).map(({bookId,friend,r})=><PosterCard key={bookId+friend.id} id={bookId}
              caption={<View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:6}}>
                <View style={{width:16,height:16,borderRadius:8,backgroundColor:friend.color+'28',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.sansBold,fontSize:8,color:friend.color}}>{friend.init}</Text></View>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:colors.accent}}>{friend.name.split(' ')[0]} · {r}★</Text>
              </View>}/>)}
          </ScrollView>
        </View>}

        {/* Trending this week */}
        <View style={{marginTop:spacing.lg}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:spacing.lg,paddingBottom:10}}>
            <Text style={[type.label]}>Trending This Week</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>on Verso</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:spacing.lg,paddingRight:spacing.sm}}>
            {trending.map(b=><PosterCard key={b.id} id={b.id}
              caption={<Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:colors.accent,marginTop:6}}>↑ {BOOK_VIBES[b.id].weekly>=1000?(BOOK_VIBES[b.id].weekly/1000).toFixed(1)+'k':BOOK_VIBES[b.id].weekly} readers</Text>}/>)}
          </ScrollView>
        </View>

        {/* Picked by editors */}
        <View style={{marginTop:spacing.lg}}>
          <Text style={[type.label,{paddingHorizontal:spacing.lg,paddingBottom:10}]}>Picked by Editors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:spacing.lg,paddingRight:spacing.sm,paddingBottom:8}}>
            {BOOKS.slice(0,6).map(b=><TouchableOpacity key={b.id} style={{width:110,marginRight:14}} activeOpacity={0.8} onPress={()=>setDetailId(b.id)}>
              <BookCover bookId={b.id} size="md"/>
              <Text style={{fontFamily:fonts.serifItalic,fontSize:13,color:colors.text,marginTop:7,marginBottom:2}} numberOfLines={2}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{b.author}</Text>
            </TouchableOpacity>)}
          </ScrollView>
        </View>
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
      </>}
    </ScrollView>

    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
    {showSwipe&&<SwipeModal visible onClose={()=>setShowSwipe(false)} onOpenBook={id=>{setShowSwipe(false);setDetailId(id);}}/>}
    {showAdd&&<AddBookModal visible prefill={addPrefill} onClose={()=>{setShowAdd(false);setAddPrefill('');}}/>}
  </View>;
}
const card:any={marginHorizontal:spacing.lg,marginTop:spacing.sm,marginBottom:spacing.sm,padding:18,backgroundColor:pastels.sky,flexDirection:'row',alignItems:'center',borderRadius:radius.lg};
const chip:any={paddingHorizontal:15,paddingVertical:9,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:999};
const activeChip:any={backgroundColor:colors.accentDim,borderColor:colors.accent};
