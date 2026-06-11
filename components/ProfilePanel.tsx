import React,{useState} from 'react';
import {View,Text,TouchableOpacity} from 'react-native';
import {colors,spacing,fonts,type,radius,shadow} from '../constants/theme';
import {BOOKS,FRIENDS,PAGE_COUNTS} from '../data/books';
import {useStore} from '../store';
import CompareModal from './CompareModal';
import BookstoreModal from './BookstoreModal';
import ImportExportModal from './ImportExportModal';

const TAGS=['Literary Fiction','Kazuo Ishiguro','Sally Rooney','Irish Literature','Unreliable Narrators','Pulitzer Winners','Repressed Feelings'];

export default function ProfilePanel(){
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
  const hasLoggedToday=streakDays.includes('Jun 9');
  const streak=(()=>{const labels=['Jun 9','Jun 8','Jun 7','Jun 6','Jun 5','Jun 4','Jun 3'];let s=0;for(const l of labels){if(streakDays.includes(l))s++;else break;}return s;})();

  return <View>
    <View style={{margin:spacing.lg,marginBottom:0,padding:11,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderRadius:12}}>
      <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>Moving from Goodreads or StoryGraph?</Text>
      <TouchableOpacity onPress={()=>setShowIE(true)}><Text style={{fontFamily:fonts.sansBold,fontSize:12,color:colors.accent}}>Import →</Text></TouchableOpacity>
    </View>
    <View style={{padding:spacing.lg,flexDirection:'row',gap:14,borderBottomWidth:1,borderBottomColor:colors.border}}>
      <View style={{width:56,height:56,borderRadius:28,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.serifBold,fontSize:24,color:colors.accent}}>C</Text></View>
      <View style={{flex:1}}>
        <Text style={{fontFamily:fonts.serifBold,fontSize:18,color:colors.text,marginBottom:2}}>Cody</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:6}}>@cody</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,lineHeight:18}}>Literary fiction enjoyer. Cried at Stoner. Currently blaming Ishiguro for everything wrong with my emotional life.</Text>
      </View>
    </View>
    <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <Text style={type.label}>Reading Streak</Text>
        <TouchableOpacity onPress={()=>logToday()} style={{paddingHorizontal:12,paddingVertical:5,backgroundColor:hasLoggedToday?colors.accentDim:colors.accent,borderWidth:1,borderColor:colors.accent,borderRadius:999}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:11,color:hasLoggedToday?colors.accent:colors.bg}}>{hasLoggedToday?'✓ Logged today':'Log today'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}}>
        {['Jun 3','Jun 4','Jun 5','Jun 6','Jun 7','Jun 8','Jun 9'].map(d=>{const active=streakDays.includes(d);
          return <View key={d} style={{alignItems:'center',gap:3}}>
            <View style={{width:28,height:28,backgroundColor:active?colors.accent:colors.surface,borderWidth:1,borderColor:active?colors.accent:colors.border,borderRadius:8}}/>
            <Text style={{fontFamily:fonts.sans,fontSize:9,color:colors.text3}}>{d.split(' ')[1]}</Text>
          </View>;})}
      </View>
      <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,marginTop:8}}>{streak>0?`${streak}-day streak${streak>=3?' · on a roll':''}`:'No streak yet — log today to start.'}</Text>
    </View>
    <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
      <Text style={[type.label,{marginBottom:10}]}>Verso thinks you love</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{TAGS.map(t=><View key={t} style={{paddingHorizontal:10,paddingVertical:5,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,borderRadius:999}}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2}}>{t}</Text></View>)}</View>
    </View>
    <View style={{padding:spacing.lg,gap:10}}>
      <TouchableOpacity style={{backgroundColor:colors.accent,padding:15,alignItems:'center',borderRadius:999}} onPress={()=>setShowCompare(true)}>
        <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:colors.bg}}>Compare Stats with a Friend →</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,padding:14,alignItems:'center',borderRadius:12}} onPress={()=>setShowBookstore(true)}>
        <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text}}>Find a Local Bookstore →</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,padding:14,alignItems:'center',borderRadius:12}} onPress={()=>setShowIE(true)}>
        <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text}}>Import / Export Data →</Text>
      </TouchableOpacity>
    </View>
    <View style={{height:24}}/>

    {showCompare&&<CompareModal visible onClose={()=>setShowCompare(false)}/>}
    {showBookstore&&<BookstoreModal visible onClose={()=>setShowBookstore(false)}/>}
    {showIE&&<ImportExportModal visible onClose={()=>setShowIE(false)}/>}
  </View>;
}
