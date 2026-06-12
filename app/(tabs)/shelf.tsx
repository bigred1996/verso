import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors,spacing,fonts,type,radius,shadow} from '../../constants/theme';
import {BOOKS,PAGE_COUNTS} from '../../data/books';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import StatsView from '../../components/StatsView';
import ListsView from '../../components/ListsView';
import ProfilePanel from '../../components/ProfilePanel';

const SUBS=['Stats','Library','Journal','Profile'] as const;
type Sub=typeof SUBS[number];
const SHELF_TABS=[{k:'read',l:'Read'},{k:'reading',l:'Reading'},{k:'want',l:'TBR'},{k:'dnf',l:'DNF'}] as const;
const LIB_VIEWS=[{k:'lists',l:'Lists'},{k:'favorites',l:'Favorites'},{k:'rankings',l:'Rankings'}] as const;
const SORTS=['Date','Title','Author','Rating'] as const;

export default function ShelfScreen(){
  const insets=useSafeAreaInsets();
  const [sub,setSub]=useState<Sub>('Stats');
  const [libMode,setLibMode]=useState<'shelf'|'lists'|'favorites'|'rankings'>('shelf');
  const [shelfTab,setShelfTab]=useState<'read'|'reading'|'want'|'dnf'>('read');
  const [sort,setSort]=useState<typeof SORTS[number]>('Date');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [rankPublic,setRankPublic]=useState(false);
  const {shelf,ratings,journal,eloRatings,customBooks,dnfReasons,favorites,toggleFavorite}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  function sorted(list:typeof all){
    const c=[...list];
    if(sort==='Title') c.sort((a,b)=>a.title.localeCompare(b.title));
    else if(sort==='Author') c.sort((a,b)=>a.author.localeCompare(b.author));
    else if(sort==='Rating') c.sort((a,b)=>(ratings[b.id]||0)-(ratings[a.id]||0));
    return c;
  }

  function Row({id,sub2}:{id:string;sub2?:React.ReactNode}){
    const b=all.find(x=>x.id===id); if(!b) return null;
    const rat=ratings[b.id]; const j=journal[b.id]; const total=PAGE_COUNTS[b.id]||b.pages||300; const pct=j?Math.round(j.page/total*100):0;
    return <TouchableOpacity style={s.item} activeOpacity={0.75} onPress={()=>setDetailId(b.id)}>
      <BookCover bookId={b.id} size="sm"/>
      <View style={{flex:1}}>
        <Text style={s.title} numberOfLines={2}>{b.title}</Text>
        <Text style={s.author}>{b.author}</Text>
        <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:4}}>
          {rat?<Text style={{fontSize:11,color:colors.accent}}>{'★'.repeat(Math.round(rat))}</Text>:null}
          {shelfTab==='reading'&&j?<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>p.{j.page} · {pct}%</Text>:null}
        </View>
        {sub2}
        {shelfTab==='reading'&&j?<View style={{height:2,backgroundColor:colors.surface2,marginTop:6}}><View style={{height:2,backgroundColor:colors.accent,width:`${pct}%` as any}}/></View>:null}
      </View>
      <Text style={{fontSize:16,color:colors.text3,alignSelf:'center'}}>›</Text>
    </TouchableOpacity>;
  }

  function Rankings(){
    const r=[...all].filter(b=>eloRatings[b.id]).sort((a,b2)=>(eloRatings[b2.id]??1000)-(eloRatings[a.id]??1000));
    return <View>
      <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text2,lineHeight:20,marginBottom:12}}>Star ratings are what you thought. Rankings are what you felt.</Text>
        <TouchableOpacity onPress={()=>setRankPublic(p=>!p)} style={{flexDirection:'row',alignItems:'center',gap:8}}>
          <View style={{width:36,height:20,borderRadius:10,backgroundColor:rankPublic?colors.accent:colors.surface2,borderWidth:1,borderColor:colors.border,justifyContent:'center',paddingHorizontal:2,alignItems:rankPublic?'flex-end':'flex-start'}}>
            <View style={{width:14,height:14,borderRadius:7,backgroundColor:rankPublic?colors.bg:colors.text3}}/>
          </View>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>{rankPublic?'Public — on your profile':'Private to you'}</Text>
        </TouchableOpacity>
      </View>
      {r.length?r.map((b,i)=><TouchableOpacity key={b.id} style={[s.item,{alignItems:'center'}]} onPress={()=>setDetailId(b.id)}>
        <Text style={{fontFamily:fonts.serifBold,width:24,fontSize:15,color:i<3?colors.accent:colors.text3,textAlign:'center'}}>{i+1}</Text>
        <BookCover bookId={b.id} size="sm"/>
        <View style={{flex:1}}><Text style={s.title}>{b.title}</Text><Text style={s.author}>{b.author}</Text><Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent,marginTop:2}}>{eloRatings[b.id]} ELO</Text></View>
      </TouchableOpacity>):<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center',padding:spacing.xl}}>No rankings yet. Use Versus mode in Book Swipe to build them.</Text>}
    </View>;
  }

  function Journal(){
    const reading=all.filter(b=>journal[b.id]&&(journal[b.id].entries||[]).length>0);
    if(!reading.length) return <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center',padding:spacing.xl}}>No journal entries yet. Log progress on a book you're reading.</Text>;
    return <View style={{paddingTop:8}}>{reading.map(b=>{const j=journal[b.id];return <View key={b.id} style={{padding:spacing.lg,backgroundColor:colors.surface,borderRadius:16,marginHorizontal:spacing.lg,marginBottom:8}}>
      <TouchableOpacity onPress={()=>setDetailId(b.id)} style={{flexDirection:'row',gap:12,marginBottom:10}}>
        <BookCover bookId={b.id} size="sm"/>
        <View style={{flex:1,justifyContent:'center'}}><Text style={s.title}>{b.title}</Text><Text style={s.author}>{b.author} · p.{j.page}</Text></View>
      </TouchableOpacity>
      <View style={{paddingLeft:8,borderLeftWidth:1,borderLeftColor:colors.border}}>
        {[...j.entries].reverse().map((e,i)=><View key={i} style={{marginBottom:10,paddingLeft:10}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{e.date}</Text><Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent}}>p.{e.page}</Text></View>
          {e.note?<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:19,marginTop:2}}>{e.note}</Text>:null}
        </View>)}
      </View>
    </View>;})}</View>;
  }

  function Favorites(){
    const favs=favorites.map(id=>all.find(b=>b.id===id)).filter(Boolean) as typeof all;
    return <View style={{padding:spacing.lg}}>
      <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:14}}>Five slots. Choose carefully. Your taste is on the line.</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>
        {[0,1,2,3,4].map(i=>{const b=favs[i];return b?<TouchableOpacity key={i} onPress={()=>setDetailId(b.id)} onLongPress={()=>toggleFavorite(b.id)} style={{width:'29%'}}>
          <BookCover bookId={b.id} size="md"/>
          <Text style={{fontFamily:fonts.serifItalic,fontSize:12,color:colors.text,marginTop:6}} numberOfLines={2}>{b.title}</Text>
        </TouchableOpacity>:<View key={i} style={{width:'29%',aspectRatio:0.66,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,borderStyle:'dashed',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontFamily:fonts.serifItalic,fontSize:22,color:colors.text3}}>{i+1}</Text>
        </View>;})}
      </View>
      {favs.length>0&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:14}}>Long-press a favourite to remove it.</Text>}
    </View>;
  }

  const list=sorted(all.filter(b=>shelf[b.id]===shelfTab));

  return <View style={{flex:1,backgroundColor:colors.bg,paddingTop:insets.top}}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.bg}/>
    <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:4}}>
      <Text style={[type.label,{marginBottom:2}]}>Your library</Text>
      <Text style={{fontFamily:fonts.serifItalic,fontSize:30,lineHeight:40,color:colors.text}}>Shelf</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,height:60}} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:8,alignItems:'center'}}>
      {SUBS.map(t=><TouchableOpacity key={t} onPress={()=>setSub(t)} style={{paddingHorizontal:16,paddingVertical:9,borderRadius:radius.pill,backgroundColor:sub===t?colors.accent:colors.surface,borderWidth:1,borderColor:sub===t?colors.accent:colors.border}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:sub===t?colors.accentText:colors.text2}}>{t}</Text>
      </TouchableOpacity>)}
    </ScrollView>

    <ScrollView showsVerticalScrollIndicator={false}>
      {sub==='Stats'&&<StatsView/>}
      {sub==='Profile'&&<ProfilePanel/>}
      {sub==='Journal'&&<Journal/>}

      {/* LIBRARY = shelves + lists + favorites + rankings, unified under one chip row */}
      {sub==='Library'&&<View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,height:56}} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:8,alignItems:'center'}}>
          {SHELF_TABS.map(t=>{const active=libMode==='shelf'&&shelfTab===t.k;return <TouchableOpacity key={t.k} onPress={()=>{setShelfTab(t.k);setLibMode('shelf');}} style={{paddingHorizontal:14,paddingVertical:8,backgroundColor:active?colors.accentDim:colors.surface,borderWidth:1,borderColor:active?colors.accent:colors.border,borderRadius:999}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:active?colors.accent:colors.text2}}>{t.l}</Text>
          </TouchableOpacity>;})}
          <View style={{width:1,height:20,backgroundColor:colors.border,marginHorizontal:2}}/>
          {LIB_VIEWS.map(v=>{const active=libMode===v.k;return <TouchableOpacity key={v.k} onPress={()=>setLibMode(v.k)} style={{paddingHorizontal:14,paddingVertical:8,backgroundColor:active?colors.accentDim:colors.surface,borderWidth:1,borderColor:active?colors.accent:colors.border,borderRadius:999}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:active?colors.accent:colors.text2}}>{v.l}</Text>
          </TouchableOpacity>;})}
        </ScrollView>

        {libMode==='lists'?<ListsView onOpenBook={setDetailId}/>
        :libMode==='favorites'?<Favorites/>
        :libMode==='rankings'?<Rankings/>
        :<View>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:spacing.lg,paddingBottom:8}}>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>{list.length} book{list.length!==1?'s':''}</Text>
            <TouchableOpacity onPress={()=>setSort(SORTS[(SORTS.indexOf(sort)+1)%SORTS.length])}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>Sort: <Text style={{color:colors.accent}}>{sort}</Text></Text></TouchableOpacity>
          </View>
          {list.length?list.map(b=><Row key={b.id} id={b.id} sub2={shelfTab==='dnf'&&dnfReasons[b.id]?<Text style={{fontFamily:fonts.sans,fontSize:11,color:'#C97B7B',marginTop:3}}>{dnfReasons[b.id].reason} · stopped p.{dnfReasons[b.id].page}</Text>:undefined}/>):
            <Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',padding:spacing.xl}}>{shelfTab==='dnf'?'Nothing abandoned. Yet.':'Nothing here yet.'}</Text>}
        </View>}
      </View>}
      <View style={{height:32}}/>
    </ScrollView>
    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
  </View>;
}
const s={item:{flexDirection:'row' as const,padding:14,backgroundColor:colors.surface,borderRadius:radius.lg,marginHorizontal:spacing.lg,marginBottom:10,gap:14,...shadow.soft},title:{fontFamily:fonts.serifBold,fontSize:15,color:colors.text,marginBottom:3},author:{fontFamily:fonts.sans,fontSize:12,color:colors.text3}};
