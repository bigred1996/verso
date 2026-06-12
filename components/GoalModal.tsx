import React from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import Svg,{Circle} from 'react-native-svg';
import {colors,spacing,fonts,radius,shadow,pastels,pastelText} from '../constants/theme';
import {BOOKS,PAGE_COUNTS} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';
import {tick} from '../utils/haptics';

interface Props { visible:boolean; onClose:()=>void; onOpenBook:(id:string)=>void; }

// Today is fixed to Jun 9 2026 across the app.
const TODAY=new Date(2026,5,9);
const DAY_OF_YEAR=Math.floor((TODAY.getTime()-new Date(2026,0,0).getTime())/86400000);
const DAYS_IN_YEAR=365;

function Ring({pct,size=132}:{pct:number;size?:number}){
  const r=(size-16)/2, c=2*Math.PI*r, off=c*(1-Math.min(1,pct/100));
  return <Svg width={size} height={size}>
    <Circle cx={size/2} cy={size/2} r={r} stroke={'rgba(62,90,64,0.16)'} strokeWidth={11} fill="none"/>
    <Circle cx={size/2} cy={size/2} r={r} stroke={pastelText.sage} strokeWidth={11} fill="none"
      strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
      transform={`rotate(-90 ${size/2} ${size/2})`}/>
  </Svg>;
}

export default function GoalModal({visible,onClose,onOpenBook}:Props){
  const {shelf,ratings,annualGoal,setAnnualGoal,customBooks}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  const readBooks=all.filter(b=>shelf[b.id]==='read');
  const done=readBooks.length;
  const goalPct=Math.min(100,Math.round(done/annualGoal*100));
  const pagesRead=readBooks.reduce((n,b)=>n+(PAGE_COUNTS[b.id]||b.pages||300),0);

  const yearPct=Math.round(DAY_OF_YEAR/DAYS_IN_YEAR*100);
  const expected=annualGoal*DAY_OF_YEAR/DAYS_IN_YEAR;
  const ahead=done-expected;
  const remaining=Math.max(0,annualGoal-done);
  const weeksLeft=Math.max(1,Math.round((DAYS_IN_YEAR-DAY_OF_YEAR)/7));
  const paceLabel=ahead>=1?`${Math.round(ahead)} ahead of pace`:ahead<=-1?`${Math.round(-ahead)} behind pace`:'right on pace';
  const paceColor=ahead>=-0.5?pastelText.sage:'#C97B7B';

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="dark-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:15,color:colors.text}}>2026 Reading Goal</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero ring */}
        <View style={{backgroundColor:pastels.sage,borderRadius:radius.xl,margin:spacing.lg,padding:spacing.lg,alignItems:'center',...shadow.card}}>
          <View style={{justifyContent:'center',alignItems:'center'}}>
            <Ring pct={goalPct}/>
            <View style={{position:'absolute',alignItems:'center'}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:40,color:pastelText.sage,lineHeight:44}}>{done}</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:pastelText.sage,opacity:0.8}}>of {annualGoal} books</Text>
            </View>
          </View>
          <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:paceColor,marginTop:16}}>{goalPct}% · {paceLabel}</Text>
          {/* Goal stepper */}
          <View style={{flexDirection:'row',alignItems:'center',gap:16,marginTop:16,backgroundColor:'rgba(255,255,255,0.5)',borderRadius:radius.pill,paddingHorizontal:8,paddingVertical:6}}>
            <TouchableOpacity onPress={()=>{tick();setAnnualGoal(annualGoal-1);}} style={stepBtn}><Text style={stepTxt}>−</Text></TouchableOpacity>
            <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:pastelText.sage,minWidth:78,textAlign:'center'}}>Goal: {annualGoal}</Text>
            <TouchableOpacity onPress={()=>{tick();setAnnualGoal(annualGoal+1);}} style={stepBtn}><Text style={stepTxt}>+</Text></TouchableOpacity>
          </View>
        </View>

        {/* Stat row */}
        <View style={{flexDirection:'row',gap:spacing.sm,marginHorizontal:spacing.lg,marginBottom:spacing.md}}>
          <Stat label="Remaining" value={`${remaining}`} sub={`${weeksLeft} weeks left`}/>
          <Stat label="Pages read" value={pagesRead>=1000?(pagesRead/1000).toFixed(1)+'k':`${pagesRead}`} sub="this year"/>
          <Stat label="Year" value={`${yearPct}%`} sub="elapsed"/>
        </View>

        {/* Pace bar — your progress vs where the calendar is */}
        <View style={{backgroundColor:colors.surface,borderRadius:radius.lg,marginHorizontal:spacing.lg,marginBottom:spacing.md,padding:spacing.lg,...shadow.soft}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text,marginBottom:14}}>On track?</Text>
          <View style={{height:8,backgroundColor:colors.surface2,borderRadius:radius.pill,overflow:'hidden',marginBottom:6}}>
            <View style={{height:8,backgroundColor:colors.accent,width:`${goalPct}%` as any,borderRadius:radius.pill}}/>
          </View>
          <View style={{height:14,marginBottom:10}}>
            <View style={{position:'absolute',left:`${yearPct}%` as any,marginLeft:-1,width:2,height:14,backgroundColor:colors.text3}}/>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>You · {done} read</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>Calendar pace · {Math.round(expected)}</Text>
          </View>
        </View>

        {/* Read this year */}
        <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginHorizontal:spacing.lg,marginBottom:12}}>Finished this year</Text>
        {readBooks.length>0?<View style={{flexDirection:'row',flexWrap:'wrap',gap:14,paddingHorizontal:spacing.lg}}>
          {readBooks.map(b=><TouchableOpacity key={b.id} onPress={()=>onOpenBook(b.id)} style={{width:'29%'}}>
            <BookCover bookId={b.id} size="md"/>
            <Text style={{fontFamily:fonts.serifItalic,fontSize:12,color:colors.text,marginTop:6}} numberOfLines={2}>{b.title}</Text>
            {ratings[b.id]?<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent,marginTop:1}}>{'★'.repeat(Math.round(ratings[b.id]))}</Text>:null}
          </TouchableOpacity>)}
        </View>:<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.lg}}>Nothing finished yet — your shelf is waiting.</Text>}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

function Stat({label,value,sub}:{label:string;value:string;sub:string}){
  return <View style={{flex:1,backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.md,...shadow.soft}}>
    <Text style={{fontFamily:fonts.sansMedium,fontSize:9,color:colors.text3,letterSpacing:0.6,textTransform:'uppercase',marginBottom:6}}>{label}</Text>
    <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:colors.text,lineHeight:24}}>{value}</Text>
    <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:3}}>{sub}</Text>
  </View>;
}

const stepBtn:any={width:30,height:30,borderRadius:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',...shadow.soft};
const stepTxt:any={fontFamily:fonts.sansBold,fontSize:18,color:pastelText.sage,lineHeight:20};
