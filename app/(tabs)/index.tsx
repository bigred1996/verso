import React,{useState} from 'react';
import {ScrollView,View,Text,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing} from '../../constants/theme';
import {BOOKS,FRIENDS} from '../../data/books';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import SwipeModal from '../../components/SwipeModal';
import BookClubModal from '../../components/BookClubModal';
import AddBookModal from '../../components/AddBookModal';

const MOODS=['emotional','dark','reflective','tense','sad','mysterious','funny','inspiring'];

export default function HomeScreen(){
  const {shelf,ratings,customBooks}=useStore();
  const allBooks=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [mood,setMood]=useState<string|null>(null);
  const [detailId,setDetailId]=useState<string|null>(null);
  const [showSwipe,setShowSwipe]=useState(false);
  const [showClub,setShowClub]=useState(false);
  const [showAdd,setShowAdd]=useState(false);

  const reading=allBooks.filter(b=>shelf[b.id]==='reading');
  const moodBooks=mood?allBooks.filter(b=>b.genres.some(g=>g.toLowerCase().includes('fiction'))).slice(0,5):BOOKS.slice(0,5);

  return (
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:4,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={lbl}>Verso</Text>
          <TouchableOpacity onPress={()=>setShowAdd(true)} style={{paddingHorizontal:12,paddingVertical:6,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
            <Text style={{fontSize:12,color:colors.text}}>+ Add Book</Text>
          </TouchableOpacity>
        </View>

        {/* Currently Reading */}
        {reading.length>0&&<View style={{marginTop:spacing.lg,borderTopWidth:1,borderTopColor:colors.border,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:8}}>
            <Text style={lbl}>Currently Reading</Text>
          </View>
          {reading.map(b=>{
            const j=useStore.getState().journal[b.id];
            const total=require('../../data/books').PAGE_COUNTS[b.id]||300;
            const pct=j?Math.min(100,Math.round(j.page/total*100)):0;
            return <TouchableOpacity key={b.id} onPress={()=>setDetailId(b.id)}
              style={{flexDirection:'row',padding:spacing.lg,gap:12,paddingTop:0}} activeOpacity={0.8}>
              <BookCover bookId={b.id} size="sm"/>
              <View style={{flex:1,justifyContent:'center'}}>
                <Text style={{fontSize:14,color:colors.text,fontWeight:'600',marginBottom:3}}>{b.title}</Text>
                <Text style={{fontSize:12,color:colors.text3,marginBottom:6}}>{b.author}</Text>
                <View style={{height:2,backgroundColor:colors.surface2,overflow:'hidden'}}>
                  <View style={{height:2,backgroundColor:colors.accent,width:`${pct}%` as any}}/>
                </View>
                <Text style={{fontSize:10,color:colors.text3,marginTop:3}}>{j?`p.${j.page}`:'not started'} · {pct}%</Text>
              </View>
            </TouchableOpacity>;
          })}
        </View>}

        {/* Friends activity */}
        <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:4}}>
          <Text style={lbl}>Right Now</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:spacing.lg,paddingBottom:8}}>
          {FRIENDS.map(f=><View key={f.id} style={{alignItems:'center',marginRight:18,paddingVertical:6}}>
            <View style={{width:44,height:44,borderRadius:22,backgroundColor:f.color+'28',alignItems:'center',justifyContent:'center',marginBottom:5}}>
              <Text style={{fontSize:16,fontWeight:'700',color:f.color}}>{f.init}</Text>
            </View>
            <Text style={{fontSize:10,color:colors.text3}}>{f.name.split(' ')[0]}</Text>
            <Text style={{fontSize:9,color:colors.text3,marginTop:1}}>{f.status}</Text>
          </View>)}
        </ScrollView>

        {/* Rate books card */}
        <TouchableOpacity style={card} activeOpacity={0.8} onPress={()=>setShowSwipe(true)}>
          <View style={{flex:1}}>
            <Text style={{fontSize:13,color:colors.text,fontWeight:'500',marginBottom:3}}>{allBooks.filter(b=>!shelf[b.id]).length} books awaiting your verdict</Text>
            <Text style={{fontSize:11,color:colors.text3}}>Swipe to rate · build your ELO rankings</Text>
          </View>
          <Text style={{fontSize:18,color:colors.accent}}>→</Text>
        </TouchableOpacity>

        {/* Book Clubs card */}
        <TouchableOpacity style={[card,{marginTop:0}]} activeOpacity={0.8} onPress={()=>setShowClub(true)}>
          <View style={{flex:1}}>
            <Text style={{fontSize:13,color:colors.text,fontWeight:'500',marginBottom:3}}>Book Clubs</Text>
            <Text style={{fontSize:11,color:colors.text3}}>The Lit Salon · Dark & Dense</Text>
          </View>
          <Text style={{fontSize:18,color:colors.accent}}>→</Text>
        </TouchableOpacity>

        {/* Mood */}
        <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={lbl}>Tonight's Mood</Text>
          {mood&&<TouchableOpacity onPress={()=>setMood(null)}><Text style={{fontSize:11,color:colors.accent}}>Clear ✕</Text></TouchableOpacity>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:spacing.lg,paddingBottom:8}}>
          {MOODS.map(m=><TouchableOpacity key={m} onPress={()=>setMood(mood===m?null:m)} style={[chip,mood===m&&{backgroundColor:colors.accentDim,borderColor:colors.accent}]}>
            <Text style={{fontSize:12,color:mood===m?colors.accent:colors.text3}}>{m}</Text>
          </TouchableOpacity>)}
        </ScrollView>

        {/* Editor picks */}
        <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.lg,paddingBottom:8}}>
          <Text style={lbl}>{mood?`Picked for "${mood}"`:'Picked by Editors'}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:spacing.lg,paddingBottom:8}}>
          {moodBooks.map(b=><TouchableOpacity key={b.id} style={{width:110,marginRight:14}} activeOpacity={0.8} onPress={()=>setDetailId(b.id)}>
            <BookCover bookId={b.id} size="md"/>
            <Text style={{fontSize:11,color:colors.text,fontStyle:'italic',marginTop:7,marginBottom:2}} numberOfLines={2}>{b.title}</Text>
            <Text style={{fontSize:10,color:colors.text3}}>{b.author}</Text>
          </TouchableOpacity>)}
        </ScrollView>

        <View style={{height:32}}/>
      </ScrollView>

      <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
      {showSwipe&&<SwipeModal visible onClose={()=>setShowSwipe(false)} onOpenBook={id=>{setShowSwipe(false);setDetailId(id);}}/>}
      {showClub&&<BookClubModal visible onClose={()=>setShowClub(false)} onOpenBook={id=>{setShowClub(false);setDetailId(id);}}/>}
      {showAdd&&<AddBookModal visible onClose={()=>setShowAdd(false)}/>}
    </SafeAreaView>
  );
}
const lbl:any={fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600'};
const card:any={marginHorizontal:spacing.lg,marginTop:spacing.md,marginBottom:spacing.sm,padding:14,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center'};
const chip:any={paddingHorizontal:14,paddingVertical:7,marginRight:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border};
