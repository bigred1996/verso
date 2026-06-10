import React from 'react';
import {View,Text,TouchableOpacity} from 'react-native';
import Svg,{Circle,Polyline,Text as SvgText} from 'react-native-svg';
import {colors,spacing,fonts,type} from '../constants/theme';
import {BOOKS,PAGE_COUNTS,BOOK_TAGS,FRIENDS} from '../data/books';
import {useStore} from '../store';

const COMMUNITY_AVG=4.1;

const sec={padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border};
const quote:any={fontFamily:fonts.serif,fontStyle:'italic',fontSize:12,color:colors.text3,lineHeight:18,marginTop:10,paddingLeft:10,borderLeftWidth:2,borderLeftColor:colors.text3};

function Bars({rows,labelWidth=90}:{rows:{l:string;p:number;v?:string}[];labelWidth?:number}){
  return <View>{rows.map(d=><View key={d.l} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:7}}>
    <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2,width:labelWidth,textTransform:'capitalize'}}>{d.l}</Text>
    <View style={{flex:1,height:4,backgroundColor:colors.surface2}}><View style={{width:`${d.p}%`,height:4,backgroundColor:colors.accent}}/></View>
    <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,width:34,textAlign:'right'}}>{d.v??d.p+'%'}</Text>
  </View>)}</View>;
}

export default function StatsView(){
  const {shelf,ratings,customBooks,annualGoal,setAnnualGoal}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const read=all.filter(b=>shelf[b.id]==='read');
  const dnf=all.filter(b=>shelf[b.id]==='dnf');
  const pages=read.reduce((s,b)=>s+(PAGE_COUNTS[b.id]||b.pages||280),0);
  const vals=Object.values(ratings).filter(Number.isFinite) as number[];
  const avg=vals.length?(vals.reduce((a,v)=>a+v,0)/vals.length).toFixed(1):'—';

  // rating distribution (live)
  const ratingCounts=[5,4,3,2,1].map(s=>({s,n:vals.filter(v=>Math.round(v)===s).length}));
  const maxR=Math.max(1,...ratingCounts.map(d=>d.n));

  // pace donut
  const pace=[{l:'Slow Burn',p:55,c:'#3D6B48'},{l:'Measured',p:30,c:'#7B9EA6'},{l:'Propulsive',p:15,c:'#5A4E3A'}];
  const R=42,C=2*Math.PI*R,GAP=4;
  let acc=0;
  const arcs=pace.map(seg=>{const len=seg.p/100*C-GAP;const off=-acc;acc+=seg.p/100*C;return {len,gap:C-len,off,c:seg.c};});

  // monthly chart
  const months=[{m:'J',n:3},{m:'F',n:4},{m:'M',n:2},{m:'A',n:5},{m:'M',n:3},{m:'J',n:4,cur:true},{m:'J',n:0},{m:'A',n:0},{m:'S',n:0},{m:'O',n:0},{m:'N',n:0},{m:'D',n:0}];
  const maxM=Math.max(...months.map(m=>m.n),1);

  // decade chart
  const decades=[{d:'1940s',n:1},{d:'1960s',n:1},{d:'1980s',n:2},{d:'2000s',n:3},{d:'2010s',n:8},{d:'2020s',n:9}];
  const maxD=Math.max(...decades.map(d=>d.n));

  // goal ring (settable)
  const GOAL=annualGoal,done=read.length||7,gp=Math.min(1,done/GOAL),GR=52,GC=2*Math.PI*GR;
  const gfill=gp*GC;

  // velocity sparkline points (books/month, 12 pts in a 240x40 box)
  const vMax=Math.max(...months.map(m=>m.n),1);
  const spark=months.map((m,i)=>`${(i/(months.length-1))*236+2},${38-(m.n/vMax)*34}`).join(' ');

  const avgNum=vals.length?parseFloat(avg):0;
  const wrap=`So far in 2026 you've read ${done} book${done!==1?'s':''} (${pages.toLocaleString()} pages), rating them ${avg!=='—'?avg+'★ on average — '+(avgNum>=COMMUNITY_AVG?'more generous':'tougher')+' than the Verso crowd':'as yet unrated'}. You lean slow-burn and emotionally devastating, you DNF'd ${dnf.length}, and you're ${Math.round(gp*100)}% of the way to your goal of ${GOAL}. Slow down; you have all year.`;

  // 12-week streak grid from streakDays + a seeded base
  const base=[1,1,1,0,1,0,0, 1,1,1,1,0,1,0, 1,0,1,1,1,0,0, 1,1,1,0,1,1,0, 1,0,1,1,1,1,1, 0,1,1,1,0,1,0];

  // Tropes aggregated from books the user has engaged with (shelved/rated)
  const engaged=all.filter(b=>shelf[b.id]||ratings[b.id]);
  const tropeCounts:Record<string,number>={};
  (engaged.length?engaged:all).forEach(b=>{(BOOK_TAGS[b.id]?.tropes||[]).forEach(t=>{tropeCounts[t]=(tropeCounts[t]||0)+1;});});
  const tropes=Object.entries(tropeCounts).sort((a,b)=>b[1]-a[1]).slice(0,12);

  return <View>
    {/* Wrap-up card */}
    <View style={[sec,{backgroundColor:colors.surface}]}>
      <Text style={[type.label,{marginBottom:10}]}>Your 2026, So Far</Text>
      <Text style={{fontFamily:fonts.serif,fontSize:15,color:colors.text,lineHeight:24}}>{wrap}</Text>
    </View>

    {/* Year at a glance */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Year at a Glance · 2026</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:9}}>
        {[{v:String(read.length),l:'Books read'},{v:pages>=1000?(pages/1000).toFixed(1)+'k':String(pages),l:'Pages read'},{v:avg+(avg!=='—'?' ★':''),l:'Avg rating'},{v:String(dnf.length),l:"DNF'd"}].map(c=>
          <View key={c.l} style={{width:'47%',flexGrow:1,backgroundColor:colors.surface2,padding:14}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:25,color:colors.accent}}>{c.v}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2,marginTop:4}}>{c.l}</Text>
          </View>)}
      </View>
      {avg!=='—'&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:12}}>Your {avg}★ average is {avgNum>=COMMUNITY_AVG?'above':'below'} the Verso community's {COMMUNITY_AVG}★ — {avgNum>=COMMUNITY_AVG?'a soft touch':'a hard marker'}.</Text>}
    </View>

    {/* Reading velocity sparkline */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Reading Velocity</Text>
      <Svg width="100%" height={44} viewBox="0 0 240 44">
        <Polyline points={spark} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
      <Text style={quote}>"Books per month. Peaks are good months. Troughs are honest."</Text>
    </View>

    {/* Pace donut */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Pace Breakdown</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:20}}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          <Circle cx={60} cy={60} r={R} fill="none" stroke={colors.surface2} strokeWidth={12}/>
          {arcs.map((a,i)=><Circle key={i} cx={60} cy={60} r={R} fill="none" stroke={a.c} strokeWidth={12}
            strokeDasharray={`${a.len} ${a.gap}`} strokeDashoffset={a.off}/>)}
          <SvgText x={60} y={57} textAnchor="middle" fontSize={20} fontStyle="italic" fontWeight="bold" fill={colors.accent}>55%</SvgText>
          <SvgText x={60} y={71} textAnchor="middle" fontSize={8} fill={colors.text3}>SLOW BURN</SvgText>
        </Svg>
        <View style={{flex:1}}>
          {pace.map(d=><View key={d.l} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:9}}>
            <View style={{width:8,height:8,backgroundColor:d.c}}/>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>{d.l}</Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.accent,marginLeft:'auto'}}>{d.p}%</Text>
          </View>)}
        </View>
      </View>
      <Text style={quote}>"Infinite patience for a slow burn. Respect."</Text>
    </View>

    {/* Mood */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Mood Breakdown</Text>
      <Bars rows={[{l:'emotional',p:68},{l:'dark',p:52},{l:'reflective',p:47},{l:'tense',p:29},{l:'sad',p:24},{l:'mysterious',p:18},{l:'funny',p:12}]}/>
      <Text style={quote}>"You have a type. It's called feelings."</Text>
    </View>

    {/* Genre */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Genre Breakdown</Text>
      <Bars labelWidth={110} rows={[{l:'Literary Fiction',p:72},{l:'Contemporary',p:33},{l:'Historical',p:21},{l:'Translated',p:17},{l:'Short Stories',p:8}]}/>
    </View>

    {/* Rating distribution (live) */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>How You Rate</Text>
      <Bars labelWidth={28} rows={ratingCounts.map(d=>({l:d.s+'★',p:Math.round(d.n/maxR*100),v:String(d.n)}))}/>
      <Text style={quote}>"Mostly 4s and 5s. Either discerning, or you DNF the ones you'd hate."</Text>
    </View>

    {/* Books by month */}
    <View style={sec}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}>
        <Text style={type.label}>Books by Month</Text>
        <Text style={{fontFamily:fonts.sansBold,fontSize:12,color:colors.accent}}>2026</Text>
      </View>
      <View style={{flexDirection:'row',alignItems:'flex-end',gap:4,height:56}}>
        {months.map((m,i)=><View key={i} style={{flex:1,alignItems:'center',gap:3}}>
          <View style={{width:'100%',height:m.n?Math.max(4,Math.round(m.n/maxM*44)):2,backgroundColor:m.cur?colors.accent:colors.text3,opacity:m.n?(m.cur?1:0.7):0.2}}/>
          <Text style={{fontFamily:fonts.sans,fontSize:9,color:colors.text3}}>{m.m}</Text>
        </View>)}
      </View>
      <Text style={quote}>"June is looking like your best month yet."</Text>
    </View>

    {/* Decades */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>When Were They Written?</Text>
      {decades.map(d=><View key={d.d} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8}}>
        <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2,width:48}}>{d.d}</Text>
        <View style={{flex:1,height:4,backgroundColor:colors.surface2}}><View style={{width:`${Math.round(d.n/maxD*100)}%`,height:4,backgroundColor:colors.accent}}/></View>
        <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,width:18,textAlign:'right'}}>{d.n}</Text>
      </View>)}
      <Text style={quote}>"Mostly contemporary. You like your fiction breathing."</Text>
    </View>

    {/* Reading streak grid */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Reading Streak · 12 weeks</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:3,maxWidth:7*16}}>
        {base.map((v,i)=><View key={i} style={{width:13,height:13,backgroundColor:v?colors.accent:colors.surface2,opacity:v?1:1}}/>)}
      </View>
      <Text style={quote}>"Consistency beats intensity. You've got both."</Text>
    </View>

    {/* Tropes cloud */}
    {tropes.length>0&&<View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Your Tropes</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:7}}>
        {tropes.map(([t,n])=><View key={t} style={{paddingHorizontal:10,paddingVertical:5,backgroundColor:n>=3?colors.accentDim:colors.surface2,borderWidth:1,borderColor:n>=3?'rgba(61,107,72,0.4)':colors.border}}>
          <Text style={{fontFamily:fonts.sans,fontSize:n>=3?13:11,color:n>=3?colors.accent:colors.text2}}>{t}</Text>
        </View>)}
      </View>
      <Text style={quote}>"Unreliable narrators and found family. You contain multitudes."</Text>
    </View>}

    {/* Reader profile */}
    <View style={sec}>
      <Text style={[type.label,{marginBottom:14}]}>Your Reader Profile</Text>
      <Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:24,marginBottom:10}}>You gravitate toward <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>slow-burn literary fiction</Text> with emotionally devastating payoffs. You have a high tolerance for <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>unreliable narrators</Text> and an unusual appetite for books that make you feel worse about everything.</Text>
      <Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:24}}>Your comfort zone: <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>Ireland, New York, and anywhere with repressed feelings</Text>. You read for prose over plot, and you have never once picked up a thriller.</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:14}}>
        {FRIENDS.filter(f=>f.match>=70).map(f=><Text key={f.id} style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>{f.name.split(' ')[0]} <Text style={{color:colors.accent}}>{f.match}%</Text>{'   '}</Text>)}
      </View>
    </View>

    {/* Goal ring */}
    <View style={[sec,{borderBottomWidth:0,alignItems:'center'}]}>
      <Text style={[type.label,{marginBottom:14,alignSelf:'flex-start'}]}>Annual Reading Goal</Text>
      <Svg width={140} height={140} viewBox="0 0 140 140">
        <Circle cx={70} cy={70} r={GR} fill="none" stroke={colors.surface2} strokeWidth={9}/>
        <Circle cx={70} cy={70} r={GR} fill="none" stroke={colors.accent} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${gfill} ${GC-gfill}`}/>
        <SvgText x={70} y={66} textAnchor="middle" fontSize={30} fontStyle="italic" fontWeight="bold" fill={colors.text}>{done}</SvgText>
        <SvgText x={70} y={86} textAnchor="middle" fontSize={10} fill={colors.text3}>of {GOAL} books</SvgText>
      </Svg>
      <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,marginTop:10}}>{Math.round(gp*100)}% there — {Math.max(0,GOAL-done)} to go</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:16,marginTop:14}}>
        <TouchableOpacity onPress={()=>setAnnualGoal(GOAL-1)} style={{width:34,height:34,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:18,color:colors.text2}}>−</Text></TouchableOpacity>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text2}}>Goal: {GOAL}</Text>
        <TouchableOpacity onPress={()=>setAnnualGoal(GOAL+1)} style={{width:34,height:34,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:18,color:colors.text2}}>+</Text></TouchableOpacity>
      </View>
    </View>
    <View style={{height:24}}/>
  </View>;
}
