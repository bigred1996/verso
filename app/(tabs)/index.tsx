import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg,{Path} from 'react-native-svg';
import {colors,spacing,fonts,type,radius,shadow,pastels,pastelText} from '../../constants/theme';
import {BOOKS,PAGE_COUNTS,BOOK_VIBES,ACTIVITY,FRIENDS,CHALLENGES,recommendBooks} from '../../data/books';
import type {ActivityItem} from '../../data/books';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import SwipeModal from '../../components/SwipeModal';
import SocialPostModal from '../../components/SocialPostModal';
import ChallengeModal from '../../components/ChallengeModal';
import GoalModal from '../../components/GoalModal';

const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const lbl=(d:Date)=>MONTHS[d.getMonth()]+' '+d.getDate();
const TODAY=new Date(2026,5,9);
const WEEKDAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function Flame({size=22,color}:{size?:number;color:string}){
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 2c1.5 3.5-1.5 5-1.5 7.5C10.5 11 11.5 12 12 12s1.5-1 1.5-2.5C13.5 9 13 8 13.5 7c2 1.5 4 4 4 7.5a5.5 5.5 0 0 1-11 0C6.5 10 9.5 6 12 2z" fill={color}/></Svg>;
}

function activityLine(item:ActivityItem,books:typeof BOOKS):string {
  const b=item.bookId?books.find(x=>x.id===item.bookId):null;
  if(item.type==='rated') return `rated ${b?`"${b.title}" `:''} ${item.rating}★`;
  if(item.type==='reading') return `is reading ${b?`"${b.title}"`:''} ${item.text?`· ${item.text}`:''}`;
  if(item.type==='hot') return `posted a take on ${b?`"${b.title}"`:item.text||''}`;
  if(item.type==='dnf') return `abandoned ${b?`"${b.title}"`:''} ${item.text?`— ${item.text}`:''}`;
  if(item.type==='milestone') return item.text||'hit a milestone';
  return '';
}

export default function TodayScreen(){
  const insets=useSafeAreaInsets();
  const {streakDays,logToday,annualGoal,shelf,journal,ratings,customBooks,favorites,swipeData}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [detailId,setDetailId]=useState<string|null>(null);
  const [detailTab,setDetailTab]=useState<'about'|'reviews'|'shelf'>('about');
  const [showSwipe,setShowSwipe]=useState(false);
  const [postId,setPostId]=useState<string|null>(null);
  const [challengeId,setChallengeId]=useState<string|null>(null);
  const [showGoal,setShowGoal]=useState(false);
  const [trackerOpen,setTrackerOpen]=useState(false);
  const openBook=(id:string,t:'about'|'reviews'|'shelf'='about')=>{setDetailTab(t);setDetailId(id);};

  const todayLbl=lbl(TODAY);
  const loggedToday=streakDays.includes(todayLbl);

  const streak=(()=>{
    let c=0;const d=new Date(TODAY);
    if(!streakDays.includes(lbl(d))) d.setDate(d.getDate()-1);
    while(streakDays.includes(lbl(d))){c++;d.setDate(d.getDate()-1);}
    return c;
  })();

  const week=Array.from({length:7},(_,i)=>{const d=new Date(TODAY);d.setDate(d.getDate()-(6-i));return {label:lbl(d),wd:WEEKDAY[d.getDay()][0],logged:streakDays.includes(lbl(d)),isToday:lbl(d)===todayLbl};});

  // 4-week calendar grid (28 cells), aligned to weekday columns, ending this week.
  const gridStart=new Date(TODAY);gridStart.setDate(gridStart.getDate()-TODAY.getDay()-21);
  const calendar=Array.from({length:28},(_,i)=>{const d=new Date(gridStart);d.setDate(d.getDate()+i);
    return {label:lbl(d),day:d.getDate(),logged:streakDays.includes(lbl(d)),isToday:lbl(d)===todayLbl,future:d>TODAY};});
  const loggedDays=streakDays.length;

  const reading=all.filter(b=>shelf[b.id]==='reading');
  const wantBooks=all.filter(b=>shelf[b.id]==='want');
  const unrated=all.filter(b=>!shelf[b.id]&&!ratings[b.id]);
  const read=all.filter(b=>shelf[b.id]==='read');
  const done=read.length||7;
  const goalPct=Math.min(100,Math.round(done/annualGoal*100));

  // Top books by weekly readers
  const trendingBooks=all
    .filter(b=>BOOK_VIBES[b.id])
    .sort((a,b)=>(BOOK_VIBES[b.id]?.weekly||0)-(BOOK_VIBES[a.id]?.weekly||0))
    .slice(0,8);

  // Featured challenge (first incomplete featured one, else first any)
  const featuredChallenge=CHALLENGES.find(c=>c.featured&&c.done.length<c.goal)||CHALLENGES[0];
  const challengePct=featuredChallenge?Math.round(featuredChallenge.done.length/featuredChallenge.goal*100):0;

  // Recommendations from what you've liked (ratings ≥4, Book Swipe likes, favourites)
  const likedIds=all.filter(b=>(ratings[b.id]||0)>=4||swipeData[b.id]==='like'||favorites.includes(b.id)).map(b=>b.id);
  const recExclude=new Set<string>([...all.filter(b=>shelf[b.id]).map(b=>b.id),...Object.keys(swipeData),...likedIds]);
  const recs=recommendBooks(likedIds,all,recExclude,8);

  return <View style={{flex:1,backgroundColor:colors.bg,paddingTop:insets.top}}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.bg}/>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:32}}>

      {/* GREETING + STREAK TRACKER — combined, tap to expand calendar */}
      <TouchableOpacity activeOpacity={0.92} onPress={()=>setTrackerOpen(o=>!o)}
        style={{marginHorizontal:spacing.lg,marginTop:spacing.md,backgroundColor:pastels.clay,borderRadius:radius.xl,padding:spacing.lg,...shadow.card}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:14}}>
          <View style={{flex:1}}>
            <Text style={[type.label,{color:pastelText.clay,opacity:0.85,marginBottom:3}]}>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][TODAY.getDay()]} · {todayLbl}</Text>
            <Text style={{fontFamily:fonts.serifItalic,fontSize:26,lineHeight:32,color:colors.text}}>Good evening, Cody</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#fff',borderRadius:radius.pill,paddingVertical:8,paddingHorizontal:13,...shadow.soft}}>
            <Flame size={20} color={pastelText.clay}/>
            <Text style={{fontFamily:fonts.serifBold,fontSize:20,color:pastelText.clay,lineHeight:22}}>{streak}</Text>
            <Text style={{fontSize:12,color:pastelText.clay,opacity:0.6,marginLeft:2}}>{trackerOpen?'⌃':'⌄'}</Text>
          </View>
        </View>

        {/* Collapsed: this week's dots */}
        {!trackerOpen&&<View style={{flexDirection:'row',justifyContent:'space-between',marginTop:16}}>
          {week.map(d=><View key={d.label} style={{alignItems:'center',gap:5}}>
            <View style={{width:26,height:26,borderRadius:13,backgroundColor:d.logged?pastelText.clay:'rgba(122,82,56,0.12)',alignItems:'center',justifyContent:'center',borderWidth:d.isToday?2:0,borderColor:'#fff'}}>
              {d.logged&&<Text style={{color:'#fff',fontSize:11,fontFamily:fonts.sansBold}}>✓</Text>}
            </View>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:pastelText.clay,opacity:0.7}}>{d.wd}</Text>
          </View>)}
        </View>}

        {/* Expanded: last 4 weeks calendar */}
        {trackerOpen&&<View style={{marginTop:16}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:10}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:pastelText.clay}}>{streak}-day streak · {loggedDays} days this season</Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:pastelText.clay,opacity:0.7}}>Last 4 weeks</Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            {['S','M','T','W','T','F','S'].map((w,i)=><Text key={i} style={{fontFamily:fonts.sansMedium,fontSize:9,color:pastelText.clay,opacity:0.55,width:`${100/7}%` as any,textAlign:'center'}}>{w}</Text>)}
          </View>
          <View style={{flexDirection:'row',flexWrap:'wrap'}}>
            {calendar.map((d,i)=><View key={i} style={{width:`${100/7}%` as any,alignItems:'center',marginBottom:7}}>
              <View style={{width:30,height:30,borderRadius:15,
                backgroundColor:d.logged?pastelText.clay:d.future?'transparent':'rgba(122,82,56,0.10)',
                alignItems:'center',justifyContent:'center',borderWidth:d.isToday?2:0,borderColor:'#fff'}}>
                <Text style={{fontFamily:d.isToday?fonts.sansBold:fonts.sansMedium,fontSize:11,
                  color:d.logged?'#fff':d.future?'rgba(122,82,56,0.3)':pastelText.clay,opacity:d.future?0.8:1}}>{d.day}</Text>
              </View>
            </View>)}
          </View>
        </View>}

        <TouchableOpacity onPress={logToday} disabled={loggedToday} activeOpacity={0.85}
          style={{backgroundColor:loggedToday?'rgba(122,82,56,0.15)':pastelText.clay,borderRadius:radius.pill,paddingVertical:12,alignItems:'center',marginTop:16}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:loggedToday?pastelText.clay:'#fff'}}>{loggedToday?'✓ Logged today':'Log today\'s reading'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* BOOK SWIPE — primary daily loop, right under the streak */}
      <TouchableOpacity onPress={()=>setShowSwipe(true)} activeOpacity={0.9}
        style={{marginHorizontal:spacing.lg,marginTop:spacing.lg,backgroundColor:pastels.sky,borderRadius:radius.xl,padding:spacing.lg,...shadow.card}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:16}}>
          <View style={{width:96,height:84,justifyContent:'center',alignItems:'center'}}>
            {unrated.slice(0,3).map((b,i)=><View key={b.id} style={{position:'absolute',transform:[{translateX:(i-1)*22},{rotate:`${(i-1)*9}deg`}],...shadow.soft}}>
              <BookCover bookId={b.id} size="sm"/>
            </View>)}
          </View>
          <View style={{flex:1}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:21,color:pastelText.sky}}>Book Swipe</Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:pastelText.sky,opacity:0.85,marginTop:2,lineHeight:17}}>{unrated.length} books to react to · sharpen your recs</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:6,marginTop:10,alignSelf:'flex-start',backgroundColor:pastelText.sky,borderRadius:radius.pill,paddingVertical:8,paddingHorizontal:16}}>
              <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:'#fff'}}>Start swiping →</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* CONTINUE READING */}
      {reading.length>0&&<View style={{marginTop:spacing.lg}}>
        <Text style={[type.label,{paddingHorizontal:spacing.lg,marginBottom:10}]}>Pick up where you left off</Text>
        {reading.map(b=>{const j=journal[b.id];const total=PAGE_COUNTS[b.id]||b.pages||300;const pct=j?Math.min(100,Math.round(j.page/total*100)):0;
          return <TouchableOpacity key={b.id} onPress={()=>openBook(b.id,'shelf')} activeOpacity={0.85}
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

      {/* WANT TO READ — next on your list */}
      {wantBooks.length>0&&reading.length===0&&<View style={{marginTop:spacing.lg}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:spacing.lg,marginBottom:10}}>
          <Text style={[type.label]}>Next on your list</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{wantBooks.length} books</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:10}}>
          {wantBooks.slice(0,6).map(b=><TouchableOpacity key={b.id} onPress={()=>setDetailId(b.id)} activeOpacity={0.85}
            style={{width:110,backgroundColor:colors.surface,borderRadius:radius.lg,padding:10,...shadow.soft}}>
            <BookCover bookId={b.id} size="sm"/>
            <Text style={{fontFamily:fonts.serifBold,fontSize:12,color:colors.text,marginTop:8,lineHeight:16}} numberOfLines={2}>{b.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:2}} numberOfLines={1}>{b.author}</Text>
          </TouchableOpacity>)}
        </ScrollView>
      </View>}

      {/* FRIENDS ACTIVITY */}
      <View style={{marginTop:spacing.lg}}>
        <Text style={[type.label,{paddingHorizontal:spacing.lg,marginBottom:10}]}>Friends' Activity</Text>
        {ACTIVITY.slice(0,3).map(item=>{
          const friend=FRIENDS.find(f=>f.id===item.user);
          const bookObj=item.bookId?all.find(b=>b.id===item.bookId):null;
          return <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={()=>setPostId(item.id)} style={{flexDirection:'row',gap:12,marginHorizontal:spacing.lg,marginBottom:8,backgroundColor:colors.surface,borderRadius:radius.lg,padding:14,...shadow.soft}}>
            {bookObj&&item.type!=='milestone'
              ?<TouchableOpacity onPress={()=>openBook(bookObj.id)} style={{flexShrink:0}}>
                  <BookCover bookId={bookObj.id} size="sm"/>
                </TouchableOpacity>
              :<View style={{width:36,height:36,borderRadius:18,backgroundColor:friend?.color+'22',alignItems:'center',justifyContent:'center',flexShrink:0,alignSelf:'center'}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:friend?.color||colors.text3}}>{friend?.init||'?'}</Text>
              </View>}
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text,marginBottom:2}}>
                {friend?.name.split(' ')[0]}
                <Text style={{fontFamily:fonts.sans,color:colors.text2}}>{' '}{activityLine(item,all)}</Text>
              </Text>
              {(item.type==='hot'||item.type==='dnf')&&item.text&&item.bookId&&
                <Text style={{fontFamily:fonts.serifItalic,fontSize:12,color:colors.text3,lineHeight:18,marginTop:2}} numberOfLines={2}>"{item.text}"</Text>}
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:4}}>{item.ts} ago</Text>
            </View>
            <Text style={{fontSize:18,color:colors.text3,alignSelf:'center'}}>›</Text>
          </TouchableOpacity>;
        })}
      </View>

      {/* RECOMMENDED FOR YOU — driven by your likes */}
      {recs.length>0&&<View style={{marginTop:spacing.lg}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:spacing.lg,marginBottom:10}}>
          <Text style={[type.label]}>Recommended for you</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>from your likes</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:10}}>
          {recs.slice(0,6).map(r=>{const b=all.find(x=>x.id===r.id);if(!b)return null;
            return <TouchableOpacity key={r.id} onPress={()=>setDetailId(r.id)} activeOpacity={0.85}
              style={{width:124,backgroundColor:colors.surface,borderRadius:radius.lg,padding:10,...shadow.soft}}>
              <BookCover bookId={r.id} size="sm"/>
              <Text style={{fontFamily:fonts.serifBold,fontSize:12,color:colors.text,marginTop:8,lineHeight:16}} numberOfLines={2}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:2}} numberOfLines={1}>{b.author}</Text>
            </TouchableOpacity>;})}
        </ScrollView>
      </View>}

      {/* TRENDING THIS WEEK */}
      <View style={{marginTop:spacing.lg}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:spacing.lg,marginBottom:10}}>
          <Text style={[type.label]}>Trending on Verso</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>this week</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:10}}>
          {trendingBooks.map(b=>{
            const vibe=BOOK_VIBES[b.id];
            return <TouchableOpacity key={b.id} onPress={()=>setDetailId(b.id)} activeOpacity={0.85}
              style={{width:120,backgroundColor:colors.surface,borderRadius:radius.lg,padding:10,...shadow.soft}}>
              <BookCover bookId={b.id} size="sm"/>
              <Text style={{fontFamily:fonts.serifBold,fontSize:12,color:colors.text,marginTop:8,lineHeight:17}} numberOfLines={2}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:2}} numberOfLines={1}>{b.author}</Text>
              {vibe&&<Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent,marginTop:6}}>↑ {vibe.weekly>=1000?(vibe.weekly/1000).toFixed(1)+'k':vibe.weekly} this week</Text>}
            </TouchableOpacity>;})}
        </ScrollView>
      </View>

      {/* READING GOAL + FEATURED CHALLENGE row */}
      <View style={{flexDirection:'row',gap:spacing.sm,marginHorizontal:spacing.lg,marginTop:spacing.lg}}>
        {/* Goal */}
        <TouchableOpacity activeOpacity={0.85} onPress={()=>setShowGoal(true)} style={{flex:1,backgroundColor:pastels.sage,borderRadius:radius.lg,padding:spacing.md}}>
          <Text style={[type.label,{color:pastelText.sage,opacity:0.8,marginBottom:4,fontSize:10}]}>2026 goal</Text>
          <Text style={{fontFamily:fonts.serifBold,fontSize:20,color:pastelText.sage}}>{done}<Text style={{fontFamily:fonts.sansMedium,fontSize:12}}> / {annualGoal}</Text></Text>
          <View style={{width:'100%',height:4,borderRadius:radius.pill,backgroundColor:'rgba(62,90,64,0.18)',marginTop:8,overflow:'hidden'}}>
            <View style={{height:4,borderRadius:radius.pill,backgroundColor:pastelText.sage,width:`${goalPct}%` as any}}/>
          </View>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:pastelText.sage,marginTop:5,opacity:0.8}}>{goalPct}% done</Text>
        </TouchableOpacity>

        {/* Featured challenge */}
        {featuredChallenge&&<TouchableOpacity activeOpacity={0.85} onPress={()=>setChallengeId(featuredChallenge.id)} style={{flex:1.4,backgroundColor:pastels.lavender,borderRadius:radius.lg,padding:spacing.md}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:pastelText.lavender,opacity:0.8,letterSpacing:0.6,textTransform:'uppercase',marginBottom:4}}>Challenge</Text>
          <Text style={{fontFamily:fonts.serifBold,fontSize:13,color:pastelText.lavender,lineHeight:18,marginBottom:8}} numberOfLines={2}>{featuredChallenge.title}</Text>
          <View style={{width:'100%',height:4,borderRadius:radius.pill,backgroundColor:'rgba(80,50,100,0.15)',overflow:'hidden',marginBottom:5}}>
            <View style={{height:4,borderRadius:radius.pill,backgroundColor:pastelText.lavender,width:`${challengePct}%` as any}}/>
          </View>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:pastelText.lavender,opacity:0.9}}>{featuredChallenge.done.length} / {featuredChallenge.goal} books</Text>
        </TouchableOpacity>}
      </View>

    </ScrollView>
    <BookDetailModal bookId={detailId} initialTab={detailTab} onClose={()=>setDetailId(null)}/>
    <SocialPostModal postId={postId} onClose={()=>setPostId(null)} onOpenBook={id=>{setPostId(null);openBook(id);}}/>
    <ChallengeModal challengeId={challengeId} onClose={()=>setChallengeId(null)} onOpenBook={id=>{setChallengeId(null);openBook(id);}}/>
    <GoalModal visible={showGoal} onClose={()=>setShowGoal(false)} onOpenBook={id=>{setShowGoal(false);openBook(id);}}/>
    {showSwipe&&<SwipeModal visible onClose={()=>setShowSwipe(false)} onOpenBook={id=>{setShowSwipe(false);openBook(id);}}/>}
  </View>;
}
