import React,{useState} from 'react';
import {ScrollView,View,Text,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts,type} from '../../constants/theme';
import {BOOKS,FRIENDS,PAGE_COUNTS} from '../../data/books';
import {useStore} from '../../store';
import CompareModal from '../../components/CompareModal';
import BookstoreModal from '../../components/BookstoreModal';
import ImportExportModal from '../../components/ImportExportModal';
import BookDetailModal from '../../components/BookDetailModal';

const TAGS=['Literary Fiction','Kazuo Ishiguro','Sally Rooney','Irish Literature','Unreliable Narrators','Pulitzer Winners','Repressed Feelings'];

export default function ProfileScreen(){
  const {shelf,ratings,customBooks,streakDays,logToday,rereads}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const read=all.filter(b=>shelf[b.id]==='read');
  const pages=read.reduce((s,b)=>s+(PAGE_COUNTS[b.id]||b.pages||280),0);
  const vals=Object.values(ratings).filter(Number.isFinite) as number[];
  const avg=vals.length?(vals.reduce((a,v)=>a+v,0)/vals.length).toFixed(1):'—';
  const rrCount=Object.values(rereads).flat().length;

  const [showCompare,setShowCompare]=useState(false);
  const [showBookstore,setShowBookstore]=useState(false);
  const [showIE,setShowIE]=useState(false);
  const [detailId,setDetailId]=useState<string|null>(null);

  const TODAY='Jun 9';
  const hasLoggedToday=streakDays.includes(TODAY);

  function calcStreak(){
    const labels=['Jun 9','Jun 8','Jun 7','Jun 6','Jun 5','Jun 4','Jun 3'];
    let s=0; for(const l of labels){ if(streakDays.includes(l)) s++; else break; }
    return s;
  }
  const streak=calcStreak();

  return <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
    <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Import/Export banner */}
      <View style={{margin:spacing.lg,marginBottom:0,padding:11,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>Moving from Goodreads?</Text>
        <TouchableOpacity onPress={()=>setShowIE(true)}><Text style={{fontFamily:fonts.sansBold,fontSize:12,color:colors.accent}}>Import / Export →</Text></TouchableOpacity>
      </View>

      {/* Avatar + bio */}
      <View style={{padding:spacing.lg,flexDirection:'row',gap:14,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <View style={{width:56,height:56,borderRadius:28,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.serifBold,fontSize:24,color:colors.accent}}>C</Text></View>
        <View style={{flex:1}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:18,color:colors.text,marginBottom:2}}>Cody</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:6}}>@cody</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,lineHeight:18}}>Literary fiction enjoyer. Cried at Stoner. Currently blaming Ishiguro for everything wrong with my emotional life.</Text>
        </View>
      </View>

      {/* Reading streak */}
      <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <Text style={type.label}>Reading Streak</Text>
          <TouchableOpacity onPress={()=>logToday()} style={{paddingHorizontal:12,paddingVertical:5,backgroundColor:hasLoggedToday?colors.accentDim:colors.accent,borderWidth:1,borderColor:colors.accent}}>
            <Text style={{fontFamily:fonts.sansBold,fontSize:11,color:hasLoggedToday?colors.accent:colors.bg}}>{hasLoggedToday?'✓ Logged today':'Log today'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}}>
          {['Jun 3','Jun 4','Jun 5','Jun 6','Jun 7','Jun 8','Jun 9'].map(d=>{
            const active=streakDays.includes(d);
            return <View key={d} style={{alignItems:'center',gap:3}}>
              <View style={{width:28,height:28,backgroundColor:active?colors.accent:colors.surface,borderWidth:1,borderColor:active?colors.accent:colors.border}}/>
              <Text style={{fontFamily:fonts.sans,fontSize:9,color:colors.text3}}>{d.split(' ')[1]}</Text>
            </View>;
          })}
        </View>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,marginTop:8}}>{streak>0?`🔥 ${streak} day streak`:'No streak yet — log today to start!'}</Text>
      </View>

      {/* Taste tags */}
      <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <Text style={[type.label,{marginBottom:10}]}>Verso thinks you love</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{TAGS.map(t=><View key={t} style={{paddingHorizontal:10,paddingVertical:5,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border}}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2}}>{t}</Text></View>)}</View>
      </View>

      {/* Stats grid */}
      <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <Text style={[type.label,{marginBottom:12}]}>2026 in Books</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
          {[{v:String(read.length),l:'Books read'},{v:avg,l:'Avg rating'},{v:pages>=1000?(pages/1000).toFixed(1)+'k':String(pages),l:'Pages'},{v:String(rrCount),l:'Re-reads'},{v:String(vals.length),l:'Rated'},{v:String(FRIENDS.filter(f=>f.match>=70).length),l:'Taste matches'}].map(c=>
            <View key={c.l} style={{flex:1,minWidth:'40%',alignItems:'center',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,paddingVertical:12}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:24,color:colors.text,marginBottom:3}}>{c.v}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{c.l}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View style={{padding:spacing.lg,gap:10}}>
        <TouchableOpacity style={{backgroundColor:colors.accent,padding:15,alignItems:'center'}} onPress={()=>setShowCompare(true)}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:colors.bg}}>Compare Stats with a Friend →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,padding:14,alignItems:'center'}} onPress={()=>setShowBookstore(true)}>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text}}>Find a Local Bookstore →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,padding:14,alignItems:'center'}} onPress={()=>setShowIE(true)}>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text}}>Import / Export Data →</Text>
        </TouchableOpacity>
      </View>
      <View style={{height:40}}/>
    </ScrollView>

    {showCompare&&<CompareModal visible onClose={()=>setShowCompare(false)}/>}
    {showBookstore&&<BookstoreModal visible onClose={()=>setShowBookstore(false)}/>}
    {showIE&&<ImportExportModal visible onClose={()=>setShowIE(false)}/>}
    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
  </SafeAreaView>;
}
