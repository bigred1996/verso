import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg,{Path} from 'react-native-svg';
import {colors,spacing,fonts,type,radius,shadow,pastels,pastelText} from '../../constants/theme';
import {BOOKS,PAGE_COUNTS} from '../../data/books';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import SwipeModal from '../../components/SwipeModal';

// Fixed "today" to match the store's seed date (Jun 9, 2026)
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const lbl=(d:Date)=>MONTHS[d.getMonth()]+' '+d.getDate();
const TODAY=new Date(2026,5,9);
const WEEKDAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function Flame({size=22,color}:{size?:number;color:string}){
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 2c1.5 3.5-1.5 5-1.5 7.5C10.5 11 11.5 12 12 12s1.5-1 1.5-2.5C13.5 9 13 8 13.5 7c2 1.5 4 4 4 7.5a5.5 5.5 0 0 1-11 0C6.5 10 9.5 6 12 2z" fill={color}/></Svg>;
}

export default function TodayScreen(){
  const insets=useSafeAreaInsets();
  const {streakDays,logToday,annualGoal,shelf,journal,ratings,customBooks}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [detailId,setDetailId]=useState<string|null>(null);
  const [showSwipe,setShowSwipe]=useState(false);

  const todayLbl=lbl(TODAY);
  const loggedToday=streakDays.includes(todayLbl);

  // Current streak: run of consecutive logged days ending today (or yesterday if today not yet logged)
  const streak=(()=>{
    let c=0;const d=new Date(TODAY);
    if(!streakDays.includes(lbl(d))) d.setDate(d.getDate()-1);
    while(streakDays.includes(lbl(d))){c++;d.setDate(d.getDate()-1);}
    return c;
  })();

  // Last 7 days strip
  const week=Array.from({length:7},(_,i)=>{const d=new Date(TODAY);d.setDate(d.getDate()-(6-i));return {label:lbl(d),wd:WEEKDAY[d.getDay()][0],logged:streakDays.includes(lbl(d)),isToday:lbl(d)===todayLbl};});

  const reading=all.filter(b=>shelf[b.id]==='reading');
  const unrated=all.filter(b=>!shelf[b.id]&&!ratings[b.id]);
  const read=all.filter(b=>shelf[b.id]==='read');
  const done=read.length||7;
  const goalPct=Math.min(100,Math.round(done/annualGoal*100));

  return <View style={{flex:1,backgroundColor:colors.bg,paddingTop:insets.top}}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.bg}/>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:32}}>
      {/* Greeting */}
      <View style={{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:spacing.sm}}>
        <Text style={[type.label,{marginBottom:3}]}>{WEEKDAY[TODAY.getDay()]==='Sun'?'Sunday':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][TODAY.getDay()]} · {todayLbl}</Text>
        <Text style={{fontFamily:fonts.serifItalic,fontSize:30,color:colors.text}}>Good evening, Cody</Text>
      </View>

      {/* STREAK HERO */}
      <View style={{marginHorizontal:spacing.lg,marginTop:spacing.sm,backgroundColor:pastels.clay,borderRadius:radius.xl,padding:spacing.lg,...shadow.card}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:14,marginBottom:18}}>
          <View style={{width:58,height:58,borderRadius:29,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',...shadow.soft}}>
            <Flame size={30} color={pastelText.clay}/>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:38,color:pastelText.clay,lineHeight:42}}>{streak}<Text style={{fontFamily:fonts.sansMedium,fontSize:15,color:pastelText.clay}}>  day{streak===1?'':'s'}</Text></Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:pastelText.clay,opacity:0.8}}>reading streak{loggedToday?' · going strong':' · keep it alive today'}</Text>
          </View>
        </View>
        {/* 7-day strip */}
        <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:16}}>
          {week.map(d=><View key={d.label} style={{alignItems:'center',gap:5}}>
            <View style={{width:30,height:30,borderRadius:15,backgroundColor:d.logged?pastelText.clay:'rgba(122,82,56,0.12)',alignItems:'center',justifyContent:'center',borderWidth:d.isToday?2:0,borderColor:'#fff'}}>
              {d.logged&&<Text style={{color:'#fff',fontSize:13,fontFamily:fonts.sansBold}}>✓</Text>}
            </View>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:pastelText.clay,opacity:0.7}}>{d.wd}</Text>
          </View>)}
        </View>
        <TouchableOpacity onPress={logToday} disabled={loggedToday} activeOpacity={0.85}
          style={{backgroundColor:loggedToday?'rgba(122,82,56,0.15)':pastelText.clay,borderRadius:radius.pill,paddingVertical:13,alignItems:'center'}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:loggedToday?pastelText.clay:'#fff'}}>{loggedToday?'✓ Logged today':'Log today’s reading'}</Text>
        </TouchableOpacity>
      </View>

      {/* CONTINUE READING */}
      {reading.length>0&&<View style={{marginTop:spacing.lg}}>
        <Text style={[type.label,{paddingHorizontal:spacing.lg,marginBottom:10}]}>Pick up where you left off</Text>
        {reading.map(b=>{const j=journal[b.id];const total=PAGE_COUNTS[b.id]||b.pages||300;const pct=j?Math.min(100,Math.round(j.page/total*100)):0;
          return <TouchableOpacity key={b.id} onPress={()=>setDetailId(b.id)} activeOpacity={0.85}
            style={{flexDirection:'row',gap:14,marginHorizontal:spacing.lg,marginBottom:10,backgroundColor:colors.surface,borderRadius:radius.lg,padding:14,...shadow.soft}}>
            <BookCover bookId={b.id} size="sm"/>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text}} numberOfLines={1}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:8}}>{b.author}</Text>
              <View style={{height:5,borderRadius:radius.pill,backgroundColor:colors.surface2,overflow:'hidden'}}><View style={{height:5,borderRadius:radius.pill,backgroundColor:colors.accent,width:`${pct}%` as any}}/></View>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,marginTop:5}}>p.{j?.page||0} · {pct}%</Text>
            </View>
            <View style={{justifyContent:'center'}}><Text style={{fontSize:22,color:colors.accent}}>›</Text></View>
          </TouchableOpacity>;})}
      </View>}

      {/* BOOK TINDER NUDGE */}
      <Text style={[type.label,{paddingHorizontal:spacing.lg,marginTop:spacing.md,marginBottom:10}]}>Find your next read</Text>
      <TouchableOpacity onPress={()=>setShowSwipe(true)} activeOpacity={0.9}
        style={{marginHorizontal:spacing.lg,backgroundColor:pastels.sky,borderRadius:radius.xl,padding:spacing.lg,...shadow.card}}>
        {/* peek deck */}
        <View style={{flexDirection:'row',justifyContent:'center',marginBottom:16,height:96}}>
          {unrated.slice(0,3).map((b,i)=><View key={b.id} style={{position:'absolute',transform:[{translateX:(i-1)*46},{rotate:`${(i-1)*8}deg`}],...shadow.soft}}>
            <BookCover bookId={b.id} size="sm"/>
          </View>)}
        </View>
        <Text style={{fontFamily:fonts.serifBold,fontSize:20,color:pastelText.sky,textAlign:'center'}}>Book Tinder</Text>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:pastelText.sky,opacity:0.85,textAlign:'center',marginTop:3,marginBottom:14}}>{unrated.length} books awaiting your verdict · swipe to build your taste</Text>
        <View style={{backgroundColor:pastelText.sky,borderRadius:radius.pill,paddingVertical:13,alignItems:'center'}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:'#fff'}}>Start swiping →</Text>
        </View>
      </TouchableOpacity>

      {/* GOAL MINI */}
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginHorizontal:spacing.lg,marginTop:spacing.lg,backgroundColor:pastels.sage,borderRadius:radius.lg,padding:spacing.lg}}>
        <View>
          <Text style={[type.label,{color:pastelText.sage,opacity:0.8,marginBottom:4}]}>2026 reading goal</Text>
          <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:pastelText.sage}}>{done} <Text style={{fontFamily:fonts.sansMedium,fontSize:14}}>of {annualGoal} books</Text></Text>
        </View>
        <View style={{alignItems:'flex-end'}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:30,color:pastelText.sage}}>{goalPct}%</Text>
          <View style={{width:70,height:5,borderRadius:radius.pill,backgroundColor:'rgba(62,90,64,0.18)',marginTop:4,overflow:'hidden'}}><View style={{height:5,borderRadius:radius.pill,backgroundColor:pastelText.sage,width:`${goalPct}%` as any}}/></View>
        </View>
      </View>
    </ScrollView>
    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
    {showSwipe&&<SwipeModal visible onClose={()=>setShowSwipe(false)} onOpenBook={id=>{setShowSwipe(false);setDetailId(id);}}/>}
  </View>;
}
