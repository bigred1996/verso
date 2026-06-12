import React,{useState,useRef} from 'react';
import {View,Text,TouchableOpacity,Modal,ScrollView,SafeAreaView,StatusBar,TextInput,ActivityIndicator} from 'react-native';
import Svg,{Circle,Polyline,Text as SvgText} from 'react-native-svg';
import {colors,spacing,fonts,type,radius,shadow,pastels,pastelText} from '../constants/theme';
import {BOOKS,PAGE_COUNTS,BOOK_TAGS,BOOK_VIBES,FRIENDS} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';
import BookDetailModal from './BookDetailModal';

const COMMUNITY_AVG=4.1;
const fmtK=(n:number)=>n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':String(n);

// ── Create-tab backend. Set endpoint to power "Build your own chart" with your API.
//    Leave endpoint empty to use the on-device generator. Expected POST response shape:
//    { title:string, insight:string, rows:[{ label:string, value:number, display?:string, bookIds?:string[] }] }
const INSIGHTS_API={ endpoint:'', apiKey:'' };

const sec:any={marginHorizontal:spacing.lg,marginBottom:12,backgroundColor:colors.surface,borderRadius:radius.lg,...shadow.soft};
const quote:any={fontFamily:fonts.serif,fontStyle:'italic',fontSize:12,color:colors.text3,lineHeight:18,marginTop:12,paddingLeft:10,borderLeftWidth:2,borderLeftColor:colors.accent};
const STAT_TINTS=[{bg:pastels.sage,fg:pastelText.sage},{bg:pastels.sky,fg:pastelText.sky},{bg:pastels.butter,fg:pastelText.butter},{bg:pastels.blush,fg:pastelText.blush}];

const SECTIONS:{key:string;label:string}[]=[
  {key:'wrap',label:'Your Year, So Far'},
  {key:'glance',label:'Year at a Glance'},
  {key:'highlights',label:'Standout Books'},
  {key:'streak',label:'Reading Streak'},
  {key:'goal',label:'Annual Reading Goal'},
  {key:'pace',label:'Pace Breakdown'},
  {key:'length',label:'Book Length'},
  {key:'rating',label:'How You Rate'},
  {key:'velocity',label:'Reading Velocity'},
  {key:'mood',label:'Mood Breakdown'},
  {key:'genre',label:'Genre Breakdown'},
  {key:'decade',label:'When Were They Written'},
  {key:'tropes',label:'Your Tropes'},
  {key:'profile',label:'Reader Profile'},
];

const SEGMENTS=['Overview','Reading','Taste','Create'] as const;
type Seg=typeof SEGMENTS[number];
const GROUP:Record<string,Seg>={
  wrap:'Overview',glance:'Overview',highlights:'Overview',streak:'Overview',goal:'Overview',
  pace:'Reading',length:'Reading',rating:'Reading',velocity:'Reading',
  mood:'Taste',genre:'Taste',decade:'Taste',tropes:'Taste',profile:'Taste',
};

type Drill={title:string;subtitle?:string;ids:string[]}|null;
type GenRow={label:string;value:number;display:string;ids:string[]};
type GenChart={id:string;title:string;rows:GenRow[];insight:string;prompt:string};

const SUGGESTIONS=['Ratings by genre','Favourite moods','Books by length','Decades I read','Pace of my reads','Top authors'];

export default function StatsView(){
  const {shelf,ratings,favorites,lists,bookMoods,customBooks,annualGoal,setAnnualGoal,statsHidden,toggleStat}=useStore();
  const [customize,setCustomize]=useState(false);
  const [seg,setSeg]=useState<Seg>('Overview');
  const [exp,setExp]=useState<string|null>(null);          // inline-expanded breakdown row inside a card
  const [drill,setDrill]=useState<Drill>(null);
  const [detailId,setDetailId]=useState<string|null>(null);
  // Create-tab state
  const [prompt,setPrompt]=useState('');
  const [generating,setGenerating]=useState(false);
  const [result,setResult]=useState<GenChart|null>(null);
  const [pinned,setPinned]=useState<GenChart[]>([]);
  const genCount=useRef(0);

  const show=(k:string)=>!statsHidden[k];
  const firstVisible=(s:Seg)=>SECTIONS.find(x=>GROUP[x.key]===s&&show(x.key))?.key||null;
  const [openSection,setOpenSection]=useState<string|null>(()=>SECTIONS.find(x=>GROUP[x.key]==='Overview'&&!statsHidden[x.key])?.key||null);

  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const pageOf=(b:typeof BOOKS[number])=>PAGE_COUNTS[b.id]||b.pages||280;
  const read=all.filter(b=>shelf[b.id]==='read');
  const dnf=all.filter(b=>shelf[b.id]==='dnf');
  const pages=read.reduce((s,b)=>s+pageOf(b),0);
  const vals=Object.values(ratings).filter(Number.isFinite) as number[];
  const avg=vals.length?(vals.reduce((a,v)=>a+v,0)/vals.length).toFixed(1):'—';
  const ratedIds=Object.keys(ratings).filter(id=>Number.isFinite(ratings[id]));

  const engagedIds=new Set<string>();
  all.forEach(b=>{ if(shelf[b.id]||ratings[b.id]) engagedIds.add(b.id); });
  favorites.forEach(id=>engagedIds.add(id));
  lists.forEach(l=>l.bookIds.forEach(id=>engagedIds.add(id)));
  Object.keys(bookMoods).forEach(id=>engagedIds.add(id));
  const engaged=all.filter(b=>engagedIds.has(b.id));
  const poolReal=engaged.length>=6;
  const pool=poolReal?engaged:all;
  const poolNote=poolReal?'Based on your shelves, ratings & lists':'Across the Verso catalogue';

  const yours=all.filter(b=>shelf[b.id]==='read'||shelf[b.id]==='reading'||ratings[b.id]||favorites.includes(b.id));

  const openDrill=(title:string,ids:string[],subtitle?:string)=>{ if(ids.length) setDrill({title,subtitle,ids}); };
  const toggleExp=(k:string)=>setExp(p=>p===k?null:k);
  const toggleSection=(k:string)=>{ setExp(null); setOpenSection(o=>o===k?null:k); };

  const tally=(fn:(b:typeof BOOKS[number])=>string[])=>{const c:Record<string,number>={};const ids:Record<string,string[]>={};
    pool.forEach(b=>fn(b).forEach(k=>{c[k]=(c[k]||0)+1;(ids[k]=ids[k]||[]).push(b.id);}));return {c,ids};};

  const genreT=tally(b=>b.genres);
  const genreRows=Object.entries(genreT.c).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const genreMax=Math.max(1,...genreRows.map(g=>g[1]));

  const moodT=tally(b=>BOOK_VIBES[b.id]?.moods||[]);
  const moodRows=Object.entries(moodT.c).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const moodMax=Math.max(1,...moodRows.map(m=>m[1]));

  const PACE_KEYS=['slow burn','measured','propulsive'] as const;
  const PACE_LABEL:Record<string,string>={'slow burn':'Slow Burn','measured':'Measured','propulsive':'Propulsive'};
  const PACE_COLOR:Record<string,string>={'slow burn':'#4F7A5B','measured':'#7B9EA6','propulsive':'#A6794F'};
  const paceT=tally(b=>{const p=BOOK_VIBES[b.id]?.pace;return p?[p]:[];});
  const paceTotal=Math.max(1,Object.values(paceT.c).reduce((a,b)=>a+b,0));
  const pace=PACE_KEYS.map(k=>({k,l:PACE_LABEL[k],c:PACE_COLOR[k],n:paceT.c[k]||0,p:Math.round((paceT.c[k]||0)/paceTotal*100)}));
  const topPace=[...pace].sort((a,b)=>b.n-a.n)[0];
  const R=42,C=2*Math.PI*R,GAP=4; let acc=0;
  const arcs=pace.filter(s=>s.p>0).map(s=>{const len=s.p/100*C-GAP;const off=-acc;acc+=s.p/100*C;return {len,gap:C-len,off,c:s.c};});

  const decadeT=tally(b=>b.year>0?[Math.floor(b.year/10)*10+'s']:[]);
  const decadeRows=Object.entries(decadeT.c).sort((a,b)=>parseInt(a[0])-parseInt(b[0]));
  const maxD=Math.max(1,...decadeRows.map(d=>d[1]));
  const topDecade=[...decadeRows].sort((a,b)=>b[1]-a[1])[0];

  const tropeT=tally(b=>BOOK_TAGS[b.id]?.tropes||[]);
  const tropes=Object.entries(tropeT.c).sort((a,b)=>b[1]-a[1]).slice(0,14);

  const LEN_BUCKETS=[{l:'Under 250',lo:0,hi:249},{l:'250–399',lo:250,hi:399},{l:'400–599',lo:400,hi:599},{l:'600+',lo:600,hi:99999}];
  const lengthRows=LEN_BUCKETS.map(bk=>{const ids=pool.filter(b=>{const p=pageOf(b);return p>=bk.lo&&p<=bk.hi;}).map(b=>b.id);return {...bk,n:ids.length,ids};});
  const lenMax=Math.max(1,...lengthRows.map(r=>r.n));
  const topLength=[...lengthRows].sort((a,b)=>b.n-a.n)[0];

  const ratingCounts=[5,4,3,2,1].map(s=>({s,n:vals.filter(v=>Math.round(v)===s).length,ids:ratedIds.filter(id=>Math.round(ratings[id])===s)}));
  const maxR=Math.max(1,...ratingCounts.map(d=>d.n));

  const withPages=yours.filter(b=>pageOf(b)>0);
  const withReaders=yours.filter(b=>b.readers>0);
  const longest=withPages.length?withPages.reduce((a,b)=>pageOf(b)>pageOf(a)?b:a):null;
  const shortest=withPages.length?withPages.reduce((a,b)=>pageOf(b)<pageOf(a)?b:a):null;
  const mostPop=withReaders.length?withReaders.reduce((a,b)=>b.readers>a.readers?b:a):null;
  const mostNiche=withReaders.length?withReaders.reduce((a,b)=>b.readers<a.readers?b:a):null;
  const highlights=[
    longest&&{b:longest,label:'Longest',val:`${pageOf(longest)} pages`,tint:STAT_TINTS[0]},
    shortest&&shortest!==longest&&{b:shortest,label:'Shortest',val:`${pageOf(shortest)} pages`,tint:STAT_TINTS[1]},
    mostPop&&{b:mostPop,label:'Most popular',val:`${fmtK(mostPop.readers)} readers`,tint:STAT_TINTS[2]},
    mostNiche&&mostNiche!==mostPop&&{b:mostNiche,label:'Most niche',val:`${fmtK(mostNiche.readers)} readers`,tint:STAT_TINTS[3]},
  ].filter(Boolean) as {b:typeof BOOKS[number];label:string;val:string;tint:{bg:string;fg:string}}[];

  const months=[{m:'J',n:3},{m:'F',n:4},{m:'M',n:2},{m:'A',n:5},{m:'M',n:3},{m:'J',n:4,cur:true},{m:'J',n:0},{m:'A',n:0},{m:'S',n:0},{m:'O',n:0},{m:'N',n:0},{m:'D',n:0}];
  const vMax=Math.max(...months.map(m=>m.n),1);
  const spark=months.map((m,i)=>`${(i/(months.length-1))*236+2},${38-(m.n/vMax)*34}`).join(' ');

  const GOAL=annualGoal,done=read.length||7,gp=Math.min(1,done/GOAL),GR=52,GC=2*Math.PI*GR;
  const gfill=gp*GC;
  const avgNum=vals.length?parseFloat(avg):0;
  const wrap=`So far in 2026 you've read ${done} book${done!==1?'s':''} (${pages.toLocaleString()} pages), rating them ${avg!=='—'?avg+'★ on average — '+(avgNum>=COMMUNITY_AVG?'more generous':'tougher')+' than the Verso crowd':'as yet unrated'}. You lean ${topPace?topPace.l.toLowerCase():'slow-burn'} and emotionally devastating, you DNF'd ${dnf.length}, and you're ${Math.round(gp*100)}% of the way to your goal of ${GOAL}. Slow down; you have all year.`;
  const base=[1,1,1,0,1,0,0, 1,1,1,1,0,1,0, 1,0,1,1,1,0,0, 1,1,1,0,1,1,0, 1,0,1,1,1,1,1, 0,1,1,1,0,1,0];
  const daysLogged=base.filter(Boolean).length;

  // ── Teasers shown on collapsed cards ──
  const teasers:Record<string,string>={
    wrap:`${avgNum>=COMMUNITY_AVG?'A generous':avg==='—'?'An early':'A tough'} year, in a paragraph`,
    glance:`${read.length} read · ${pages.toLocaleString()} pp · ${avg}${avg!=='—'?'★':''} avg`,
    highlights:longest?`Longest, shortest, most-loved`:'Your superlatives',
    streak:`${daysLogged} of ${base.length} days active`,
    goal:`${done}/${GOAL} books · ${Math.round(gp*100)}%`,
    pace:topPace?`${topPace.l} · ${topPace.p}%`:'',
    length:topLength?`Mostly ${topLength.l} pages`:'',
    rating:vals.length?`${vals.length} rated · ${avg}★ avg`:'Nothing rated yet',
    velocity:'Books per month, this year',
    mood:moodRows[0]?`Mostly ${moodRows[0][0]}`:'',
    genre:genreRows[0]?`Mostly ${genreRows[0][0]}`:'',
    decade:topDecade?`Mostly the ${topDecade[0]}`:'',
    tropes:tropes[0]?`Top: ${tropes[0][0]}`:'',
    profile:'Your reading personality',
  };

  // ── Custom chart generator ──
  const cap=(d:string)=>({genre:'Genre',mood:'Mood',pace:'Pace',decade:'Decade',length:'Length',author:'Author',rating:'Rating'} as any)[d]||d;
  function buildChart(text:string):GenChart{
    const t=text.toLowerCase();
    const wantAvg=/(average|avg|highest|best|top[- ]?rated|how .*rate|rating|rate|stars?|score)/.test(t);
    let dim='genre';
    if(/mood|feel|emotion|vibe/.test(t)) dim='mood';
    else if(/pace|fast|slow|speed|propuls/.test(t)) dim='pace';
    else if(/decade|year|era|when|written|old|modern|century/.test(t)) dim='decade';
    else if(/length|page|long|short|chunky|thick|brief/.test(t)) dim='length';
    else if(/author|writer|wrote|by who/.test(t)) dim='author';
    else if(/genre|category/.test(t)) dim='genre';
    else if(wantAvg&&/rating|rate|star|score/.test(t)) dim='rating';

    let groups:[string,string[]][]=[];
    if(dim==='genre') groups=Object.entries(genreT.ids);
    else if(dim==='mood') groups=Object.entries(moodT.ids);
    else if(dim==='pace') groups=PACE_KEYS.map(k=>[PACE_LABEL[k],paceT.ids[k]||[]]);
    else if(dim==='decade') groups=Object.entries(decadeT.ids).sort((a,b)=>parseInt(a[0])-parseInt(b[0]));
    else if(dim==='length') groups=lengthRows.map(r=>[r.l+' pages',r.ids]);
    else if(dim==='author'){const am:Record<string,string[]>={};pool.forEach(b=>{(am[b.author]=am[b.author]||[]).push(b.id);});groups=Object.entries(am);}
    else if(dim==='rating') groups=ratingCounts.map(d=>[d.s+'★',d.ids]);

    const measureAvg=wantAvg&&dim!=='rating';
    let rows:GenRow[]=groups.map(([label,ids])=>{
      if(measureAvg){const rs=ids.map(id=>ratings[id]??(all.find(b=>b.id===id)?.avgRating||0)).filter(x=>x>0);
        const v=rs.length?rs.reduce((a,b)=>a+b,0)/rs.length:0;return {label,value:v,display:v?v.toFixed(1)+'★':'—',ids};}
      return {label,value:ids.length,display:String(ids.length),ids};
    });
    if(dim!=='decade'&&dim!=='length'&&dim!=='rating') rows=rows.filter(r=>r.value>0).sort((a,b)=>b.value-a.value);
    rows=rows.slice(0,8);

    const top=rows.filter(r=>r.value>0)[0];
    const title=measureAvg?`Average Rating by ${cap(dim)}`:dim==='rating'?'How You Rate':`Books by ${cap(dim)}`;
    let insight='Not enough on your shelf yet — add a few books and try again.';
    if(top){
      insight=measureAvg?`You rate ${top.label} highest, at ${top.display} on average.`
        :dim==='rating'?`Most of your ratings land at ${top.label}.`
        :`The ${dim} you reach for most is ${top.label} — ${top.value} book${top.value!==1?'s':''}.`;
    }
    genCount.current+=1;
    return {id:'g'+genCount.current,title,rows,insight,prompt:text};
  }
  async function runGenerate(p:string){
    const text=p.trim(); if(!text||generating) return;
    setPrompt(text); setGenerating(true); setResult(null);
    if(INSIGHTS_API.endpoint){
      try{
        const res=await fetch(INSIGHTS_API.endpoint,{method:'POST',
          headers:{'Content-Type':'application/json',...(INSIGHTS_API.apiKey?{Authorization:'Bearer '+INSIGHTS_API.apiKey}:{})},
          body:JSON.stringify({prompt:text,library:pool.map(b=>({id:b.id,title:b.title,author:b.author,year:b.year,genres:b.genres,pages:pageOf(b),rating:ratings[b.id]??null,communityRating:b.avgRating,readers:b.readers,moods:BOOK_VIBES[b.id]?.moods||[],pace:BOOK_VIBES[b.id]?.pace||null,tropes:BOOK_TAGS[b.id]?.tropes||[]}))})});
        if(res.ok){
          const spec=await res.json();
          const rows:GenRow[]=(spec.rows||[]).map((r:any)=>({label:String(r.label),value:Number(r.value)||0,display:r.display||String(r.value),ids:Array.isArray(r.bookIds)?r.bookIds:[]}));
          genCount.current+=1;
          setResult({id:'g'+genCount.current,title:spec.title||text,rows,insight:spec.insight||'',prompt:text});
          setGenerating(false); return;
        }
      }catch(e){ /* fall through to on-device generator */ }
    }
    setTimeout(()=>{ setResult(buildChart(text)); setGenerating(false); },850);
  }
  function pinChart(c:GenChart){ if(!pinned.find(x=>x.id===c.id)) setPinned(p=>[c,...p]); setResult(null); setPrompt(''); }
  function unpin(id:string){ setPinned(p=>p.filter(x=>x.id!==id)); }

  // ── Inline cover strip ──
  function CoverStrip({ids}:{ids:string[]}){
    if(!ids.length) return <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,paddingVertical:10}}>No books here yet.</Text>;
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingTop:12,paddingBottom:4,paddingRight:4}}>
      {ids.map(id=>{const b=all.find(x=>x.id===id);if(!b)return null;const rat=ratings[id];
        return <TouchableOpacity key={id} activeOpacity={0.8} onPress={()=>setDetailId(id)} style={{width:64}}>
          <BookCover bookId={id} size="sm"/>
          <Text numberOfLines={2} style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text2,marginTop:5,lineHeight:13}}>{b.title}</Text>
          {rat?<Text style={{fontFamily:fonts.sansBold,fontSize:9,color:colors.accent,marginTop:1}}>{rat}★</Text>:null}
        </TouchableOpacity>;})}
    </ScrollView>;
  }
  function StatBar({k,label,count,pct,ids,labelWidth=92,valueText}:{k:string;label:string;count:number;pct:number;ids:string[];labelWidth?:number;valueText?:string}){
    const open=exp===k;
    return <View>
      <TouchableOpacity activeOpacity={0.7} onPress={()=>toggleExp(k)} style={{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:6}}>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:open?colors.accent:colors.text2,width:labelWidth,textTransform:'capitalize'}} numberOfLines={1}>{label}</Text>
        <View style={{flex:1,height:6,backgroundColor:colors.surface2,borderRadius:3,overflow:'hidden'}}><View style={{width:`${pct}%` as any,height:6,backgroundColor:colors.accent,borderRadius:3}}/></View>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3,width:valueText?34:24,textAlign:'right'}}>{valueText??count}</Text>
        <Text style={{fontSize:12,color:open?colors.accent:colors.text3,width:14,textAlign:'center'}}>{open?'⌄':'›'}</Text>
      </TouchableOpacity>
      {open&&<CoverStrip ids={ids}/>}
    </View>;
  }
  function StatCell({tint,value,label,onPress}:{tint:{bg:string;fg:string};value:string;label:string;onPress:()=>void}){
    return <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{width:'47%',flexGrow:1,backgroundColor:tint.bg,padding:16,borderRadius:radius.md}}>
      <Text style={{fontFamily:fonts.serifBold,fontSize:26,color:tint.fg}}>{value}</Text>
      <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:tint.fg,opacity:0.75,marginTop:4}}>{label}  ›</Text>
    </TouchableOpacity>;
  }
  function ChartCard({chart,onPin,onRemove}:{chart:GenChart;onPin?:()=>void;onRemove?:()=>void}){
    const mx=Math.max(1,...chart.rows.map(r=>r.value));
    return <View style={[sec,{padding:spacing.lg,borderWidth:1,borderColor:colors.accentDim}]}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
        <View style={{flex:1}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:17,color:colors.text}}>{chart.title}</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2}}>✦ from your reading data</Text>
        </View>
        {onRemove&&<TouchableOpacity onPress={onRemove} style={{padding:4}}><Text style={{fontSize:15,color:colors.text3}}>✕</Text></TouchableOpacity>}
      </View>
      {chart.rows.filter(r=>r.value>0).length>0
        ? chart.rows.map(r=><StatBar key={r.label} k={'gen:'+chart.id+':'+r.label} label={r.label} count={r.value} valueText={r.display} pct={Math.round(r.value/mx*100)} ids={r.ids} labelWidth={110}/>)
        : <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,paddingVertical:10}}>Not enough books on your shelf to chart this yet.</Text>}
      <Text style={quote}>{chart.insight}</Text>
      {onPin&&<TouchableOpacity onPress={onPin} style={{marginTop:14,alignSelf:'flex-start',paddingHorizontal:14,paddingVertical:9,backgroundColor:colors.accent,borderRadius:radius.pill}}>
        <Text style={{fontFamily:fonts.sansBold,fontSize:12,color:colors.accentText}}>📌 Pin to my stats</Text>
      </TouchableOpacity>}
    </View>;
  }

  // ── Per-section content (no title — the card header provides it) ──
  function renderSection(k:string){switch(k){
    case 'wrap': return <Text style={{fontFamily:fonts.serif,fontSize:15,color:colors.text2,lineHeight:24}}>{wrap}</Text>;
    case 'glance': return <>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
        <StatCell tint={STAT_TINTS[0]} value={String(read.length)} label="Books read" onPress={()=>openDrill('Books Read',read.map(b=>b.id),'Everything on your Read shelf')}/>
        <StatCell tint={STAT_TINTS[1]} value={pages>=1000?(pages/1000).toFixed(1)+'k':String(pages)} label="Pages read" onPress={()=>openDrill('Pages Read',[...read].sort((a,b)=>pageOf(b)-pageOf(a)).map(b=>b.id),'Longest first')}/>
        <StatCell tint={STAT_TINTS[2]} value={avg+(avg!=='—'?' ★':'')} label="Avg rating" onPress={()=>openDrill('Your Ratings',[...ratedIds].sort((a,b)=>ratings[b]-ratings[a]),'Highest first')}/>
        <StatCell tint={STAT_TINTS[3]} value={String(dnf.length)} label="DNF'd" onPress={()=>openDrill("Did Not Finish",dnf.map(b=>b.id),'Books you set down')}/>
      </View>
      {avg!=='—'&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:12}}>Your {avg}★ average is {avgNum>=COMMUNITY_AVG?'above':'below'} the Verso community's {COMMUNITY_AVG}★ — {avgNum>=COMMUNITY_AVG?'a soft touch':'a hard marker'}.</Text>}
    </>;
    case 'highlights': return <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
      {highlights.map(h=><TouchableOpacity key={h.label} activeOpacity={0.85} onPress={()=>setDetailId(h.b.id)} style={{width:'47%',flexGrow:1,flexDirection:'row',gap:12,backgroundColor:h.tint.bg,padding:12,borderRadius:radius.md,alignItems:'center'}}>
        <BookCover bookId={h.b.id} size="sm"/>
        <View style={{flex:1}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:10,color:h.tint.fg,letterSpacing:0.6,textTransform:'uppercase',marginBottom:3}}>{h.label}</Text>
          <Text style={{fontFamily:fonts.serifBold,fontSize:13,color:colors.text,lineHeight:17}} numberOfLines={2}>{h.b.title}</Text>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:h.tint.fg,opacity:0.85,marginTop:3}}>{h.val}</Text>
        </View>
      </TouchableOpacity>)}
    </View>;
    case 'streak': return <>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:3,maxWidth:7*16}}>
        {base.map((v,i)=><View key={i} style={{width:13,height:13,borderRadius:3,backgroundColor:v?colors.accent:colors.surface2}}/>)}
      </View>
      <Text style={quote}>"Consistency beats intensity. You've got both."</Text>
    </>;
    case 'goal': return <View style={{alignItems:'center'}}>
      <Svg width={140} height={140} viewBox="0 0 140 140">
        <Circle cx={70} cy={70} r={GR} fill="none" stroke={colors.surface2} strokeWidth={9}/>
        <Circle cx={70} cy={70} r={GR} fill="none" stroke={colors.accent} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${gfill} ${GC-gfill}`}/>
        <SvgText x={70} y={66} textAnchor="middle" fontSize={30} fontStyle="italic" fontWeight="bold" fill={colors.text}>{done}</SvgText>
        <SvgText x={70} y={86} textAnchor="middle" fontSize={10} fill={colors.text3}>of {GOAL} books</SvgText>
      </Svg>
      <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,marginTop:10}}>{Math.round(gp*100)}% there — {Math.max(0,GOAL-done)} to go</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:16,marginTop:14}}>
        <TouchableOpacity onPress={()=>setAnnualGoal(GOAL-1)} style={{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:18,color:colors.text2}}>−</Text></TouchableOpacity>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text2}}>Goal: {GOAL}</Text>
        <TouchableOpacity onPress={()=>setAnnualGoal(GOAL+1)} style={{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:18,color:colors.text2}}>+</Text></TouchableOpacity>
      </View>
    </View>;
    case 'pace': return <>
      <View style={{flexDirection:'row',alignItems:'center',gap:20}}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          <Circle cx={60} cy={60} r={R} fill="none" stroke={colors.surface2} strokeWidth={12}/>
          {arcs.map((a,i)=><Circle key={i} cx={60} cy={60} r={R} fill="none" stroke={a.c} strokeWidth={12} strokeDasharray={`${a.len} ${a.gap}`} strokeDashoffset={a.off}/>)}
          <SvgText x={60} y={57} textAnchor="middle" fontSize={20} fontStyle="italic" fontWeight="bold" fill={colors.accent}>{topPace?topPace.p+'%':'—'}</SvgText>
          <SvgText x={60} y={71} textAnchor="middle" fontSize={8} fill={colors.text3}>{topPace?topPace.l.toUpperCase():''}</SvgText>
        </Svg>
        <View style={{flex:1}}>
          {pace.map(d=><TouchableOpacity key={d.l} activeOpacity={0.7} disabled={d.n===0} onPress={()=>toggleExp('pace:'+d.k)} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:9}}>
            <View style={{width:9,height:9,borderRadius:3,backgroundColor:d.c}}/>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:exp==='pace:'+d.k?colors.accent:colors.text2}}>{d.l}</Text>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.accent,marginLeft:'auto'}}>{d.p}%</Text>
            {d.n>0&&<Text style={{fontSize:12,color:exp==='pace:'+d.k?colors.accent:colors.text3}}>{exp==='pace:'+d.k?'⌄':'›'}</Text>}
          </TouchableOpacity>)}
        </View>
      </View>
      {pace.filter(d=>exp==='pace:'+d.k).map(d=><CoverStrip key={d.k} ids={paceT.ids[d.k]||[]}/>)}
      <Text style={quote}>"Infinite patience for a slow burn. Respect."</Text>
    </>;
    case 'length': return <>
      {lengthRows.map(r=><StatBar key={r.l} k={'len:'+r.l} label={r.l+' pages'} count={r.n} pct={Math.round(r.n/lenMax*100)} ids={r.ids} labelWidth={104}/>)}
      <Text style={quote}>"You don't flinch at a long book. Six-hundred pages is a Tuesday."</Text>
    </>;
    case 'rating': return <>
      {ratingCounts.map(d=><StatBar key={d.s} k={'rat:'+d.s} label={d.s+'★'} count={d.n} pct={Math.round(d.n/maxR*100)} ids={d.ids} labelWidth={28}/>)}
      <Text style={quote}>"Mostly 4s and 5s. Either discerning, or you DNF the ones you'd hate."</Text>
    </>;
    case 'velocity': return <>
      <Svg width="100%" height={44} viewBox="0 0 240 44">
        <Polyline points={spark} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
      <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:6}}>
        {months.map((m,i)=><Text key={i} style={{fontFamily:fonts.sans,fontSize:9,color:m.cur?colors.accent:colors.text3}}>{m.m}</Text>)}
      </View>
      <Text style={quote}>"Books per month. Peaks are good months. Troughs are honest."</Text>
    </>;
    case 'mood': return <>
      {moodRows.map(([m,n])=><StatBar key={m} k={'mood:'+m} label={m} count={n} pct={Math.round(n/moodMax*100)} ids={moodT.ids[m]||[]}/>)}
      <Text style={quote}>"You have a type. It's called feelings."</Text>
    </>;
    case 'genre': return <>
      {genreRows.map(([g,n])=><StatBar key={g} k={'genre:'+g} label={g} count={n} pct={Math.round(n/genreMax*100)} ids={genreT.ids[g]||[]} labelWidth={118}/>)}
    </>;
    case 'decade': return <>
      {decadeRows.map(([d,n])=><StatBar key={d} k={'dec:'+d} label={d} count={n} pct={Math.round(n/maxD*100)} ids={decadeT.ids[d]||[]} labelWidth={56}/>)}
      <Text style={quote}>"Mostly contemporary. You like your fiction breathing."</Text>
    </>;
    case 'tropes': return <>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:7}}>
        {tropes.map(([t,n])=>{const open=exp==='trope:'+t;return <TouchableOpacity key={t} activeOpacity={0.7} onPress={()=>toggleExp('trope:'+t)} style={{paddingHorizontal:11,paddingVertical:6,borderRadius:999,backgroundColor:open||n>=3?colors.accentDim:colors.surface2,borderWidth:1,borderColor:open?colors.accent:n>=3?'rgba(79,122,91,0.4)':colors.border}}>
          <Text style={{fontFamily:fonts.sans,fontSize:n>=3?13:11,color:open||n>=3?colors.accent:colors.text2}}>{t}{n>1?` ·${n}`:''}</Text>
        </TouchableOpacity>;})}
      </View>
      {tropes.filter(([t])=>exp==='trope:'+t).map(([t])=><CoverStrip key={t} ids={tropeT.ids[t]||[]}/>)}
      <Text style={quote}>"Unreliable narrators and found family. You contain multitudes."</Text>
    </>;
    case 'profile': return <>
      <Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:24,marginBottom:10}}>You gravitate toward <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>slow-burn literary fiction</Text> with emotionally devastating payoffs. You have a high tolerance for <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>unreliable narrators</Text> and an unusual appetite for books that make you feel worse about everything.</Text>
      <Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:24}}>Your comfort zone: <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>Ireland, New York, and anywhere with repressed feelings</Text>. You read for prose over plot, and you have never once picked up a thriller.</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:14}}>
        {FRIENDS.filter(f=>f.match>=70).map(f=><Text key={f.id} style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>{f.name.split(' ')[0]} <Text style={{color:colors.accent}}>{f.match}%</Text>{'   '}</Text>)}
      </View>
    </>;
    default: return null;
  }}

  function SectionCard({k,title}:{k:string;title:string}){
    const open=openSection===k;
    return <View style={[sec,{overflow:'hidden'}]}>
      <TouchableOpacity activeOpacity={0.7} onPress={()=>toggleSection(k)} style={{flexDirection:'row',alignItems:'center',gap:12,padding:spacing.lg}}>
        <View style={{flex:1}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text}}>{title}</Text>
          {!open&&!!teasers[k]&&<Text numberOfLines={1} style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:3}}>{teasers[k]}</Text>}
        </View>
        <View style={{width:28,height:28,borderRadius:14,backgroundColor:open?colors.accent:colors.surface2,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:13,color:open?colors.accentText:colors.text3}}>{open?'⌄':'›'}</Text>
        </View>
      </TouchableOpacity>
      {open&&<View style={{paddingHorizontal:spacing.lg,paddingBottom:spacing.lg}}>
        <View style={{height:1,backgroundColor:colors.border,marginBottom:spacing.md}}/>
        {renderSection(k)}
      </View>}
    </View>;
  }

  const segSections=SECTIONS.filter(s=>GROUP[s.key]===seg&&show(s.key));

  return <View>
    {/* Header */}
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:customize?0:spacing.sm}}>
      <Text style={type.label}>Statistics</Text>
      {seg!=='Create'&&<TouchableOpacity onPress={()=>setCustomize(c=>!c)} style={{paddingHorizontal:12,paddingVertical:6,borderWidth:1,borderColor:customize?colors.accent:colors.border,borderRadius:999,backgroundColor:customize?colors.accentDim:colors.surface}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:customize?colors.accent:colors.text3}}>{customize?'✓ Done':'Customize'}</Text>
      </TouchableOpacity>}
    </View>
    {customize&&<View style={[sec,{padding:spacing.lg,paddingTop:spacing.md}]}>
      <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:12,lineHeight:18}}>Tap a section to show or hide it. Hidden sections won't appear as cards under any tab.</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
        {SECTIONS.map(s=>{const on=show(s.key);return <TouchableOpacity key={s.key} onPress={()=>toggleStat(s.key)} style={{paddingHorizontal:11,paddingVertical:7,backgroundColor:on?colors.accentDim:colors.surface2,borderWidth:1,borderColor:on?colors.accent:colors.border,borderRadius:999}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:on?colors.accent:colors.text3}}>{on?'✓ ':''}{s.label}</Text>
        </TouchableOpacity>;})}
      </View>
      <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:14}}>{SECTIONS.filter(s=>show(s.key)).length} of {SECTIONS.length} sections shown</Text>
    </View>}

    {/* Segmented control */}
    {!customize&&<View style={{flexDirection:'row',gap:6,paddingHorizontal:spacing.lg,paddingTop:spacing.xs,paddingBottom:spacing.xs}}>
      {SEGMENTS.map(g=>{const on=seg===g;const create=g==='Create';
        return <TouchableOpacity key={g} onPress={()=>{setSeg(g);setExp(null);setOpenSection(firstVisible(g));}} style={{flex:1,paddingVertical:9,borderRadius:radius.pill,backgroundColor:on?colors.accent:colors.surface,borderWidth:1,borderColor:on?colors.accent:colors.border,alignItems:'center'}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:11.5,color:on?colors.accentText:create?colors.accent:colors.text2}}>{create?'✦ Create':g}</Text>
        </TouchableOpacity>;})}
    </View>}

    {/* Contextual hint */}
    {!customize&&seg!=='Create'&&<View style={{paddingHorizontal:spacing.lg,paddingTop:4,paddingBottom:6}}>
      <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>{seg==='Overview'?'Tap any stat to reveal the books behind it.':`Tap a card to open it · tap any stat inside for the books.${seg==='Taste'?` ${poolNote}.`:''}`}</Text>
    </View>}

    {/* ═══ OVERVIEW — original scrolling cards ═══ */}
    {!customize&&seg==='Overview'&&<View>
      {show('wrap')&&<View style={[sec,{padding:spacing.lg,backgroundColor:pastels.sage}]}>
        <Text style={[type.label,{marginBottom:10,color:pastelText.sage,opacity:0.8}]}>Your 2026, So Far</Text>
        <Text style={{fontFamily:fonts.serif,fontSize:15,color:'#2C3A2D',lineHeight:24}}>{wrap}</Text>
      </View>}
      {show('glance')&&<View style={[sec,{padding:spacing.lg}]}>
        <Text style={[type.label,{marginBottom:14}]}>Year at a Glance · 2026</Text>
        {renderSection('glance')}
      </View>}
      {show('highlights')&&highlights.length>0&&<View style={[sec,{padding:spacing.lg}]}>
        <Text style={[type.label,{marginBottom:14}]}>Standout Books</Text>
        {renderSection('highlights')}
      </View>}
      {show('streak')&&<View style={[sec,{padding:spacing.lg}]}>
        <Text style={[type.label,{marginBottom:14}]}>Reading Streak · 12 weeks</Text>
        {renderSection('streak')}
      </View>}
      {show('goal')&&<View style={[sec,{padding:spacing.lg}]}>
        <Text style={[type.label,{marginBottom:14}]}>Annual Reading Goal</Text>
        {renderSection('goal')}
      </View>}
      <View style={{height:24}}/>
    </View>}

    {/* ═══ READING / TASTE — accordion cards ═══ */}
    {!customize&&(seg==='Reading'||seg==='Taste')&&<View>
      {segSections.map(s=><SectionCard key={s.key} k={s.key} title={s.label}/>)}
      {segSections.length===0&&<View style={[sec,{padding:spacing.xl,alignItems:'center'}]}>
        <Text style={{fontFamily:fonts.serifItalic,fontSize:14,color:colors.text3}}>No sections here — enable some in Customize.</Text>
      </View>}
      <View style={{height:24}}/>
    </View>}

    {/* ═══ CREATE TAB ═══ */}
    {!customize&&seg==='Create'&&<View>
      <View style={[sec,{padding:spacing.lg,backgroundColor:pastels.lavender,marginTop:spacing.xs}]}>
        <Text style={{fontFamily:fonts.serifBold,fontSize:19,color:pastelText.lavender,marginBottom:6}}>Build your own chart</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:13,color:pastelText.lavender,opacity:0.85,lineHeight:19,marginBottom:14}}>Describe what you want to see. Verso turns your shelf into a chart you can tap through.</Text>
        <View style={{flexDirection:'row',gap:8}}>
          <TextInput value={prompt} onChangeText={setPrompt} placeholder="e.g. my average rating by decade" placeholderTextColor="rgba(87,75,114,0.5)"
            onSubmitEditing={()=>runGenerate(prompt)} returnKeyType="go"
            style={{flex:1,fontFamily:fonts.sans,backgroundColor:colors.surface,borderRadius:radius.md,paddingHorizontal:14,paddingVertical:12,fontSize:13,color:colors.text,borderWidth:1,borderColor:'rgba(87,75,114,0.2)'}}/>
          <TouchableOpacity onPress={()=>runGenerate(prompt)} disabled={!prompt.trim()||generating} style={{paddingHorizontal:16,justifyContent:'center',backgroundColor:prompt.trim()?pastelText.lavender:'rgba(87,75,114,0.3)',borderRadius:radius.md}}>
            <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:'#fff'}}>{generating?'…':'✦'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:14}}>
          {SUGGESTIONS.map(s=><TouchableOpacity key={s} onPress={()=>runGenerate(s)} style={{paddingHorizontal:11,paddingVertical:7,backgroundColor:colors.surface,borderRadius:999,borderWidth:1,borderColor:'rgba(87,75,114,0.18)'}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:pastelText.lavender}}>{s}</Text>
          </TouchableOpacity>)}
        </View>
        <Text style={{fontFamily:fonts.sans,fontSize:10,color:pastelText.lavender,opacity:0.7,marginTop:14,lineHeight:15}}>{INSIGHTS_API.endpoint?'Powered by Verso AI.':'Verso matches your request to your data. Connect your AI backend to ask anything in plain English.'}</Text>
      </View>

      {generating&&<View style={[sec,{padding:spacing.lg,alignItems:'center',paddingVertical:32}]}>
        <ActivityIndicator color={colors.accent}/>
        <Text style={{fontFamily:fonts.serifItalic,fontSize:14,color:colors.text2,marginTop:12}}>Reading your shelf…</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:4}}>"{prompt}"</Text>
      </View>}

      {result&&!generating&&<ChartCard chart={result} onPin={()=>pinChart(result)} onRemove={()=>setResult(null)}/>}

      {pinned.length>0&&<Text style={[type.label,{paddingHorizontal:spacing.lg,paddingTop:8,paddingBottom:6}]}>Your Pinned Charts</Text>}
      {pinned.map(c=><ChartCard key={c.id} chart={c} onRemove={()=>unpin(c.id)}/>)}

      {!result&&!generating&&pinned.length===0&&<View style={[sec,{padding:spacing.lg,alignItems:'center',paddingVertical:28}]}>
        <Text style={{fontFamily:fonts.serifItalic,fontSize:15,color:colors.text3,textAlign:'center'}}>Your custom charts will appear here.</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,textAlign:'center',marginTop:6}}>Try a suggestion above to start.</Text>
      </View>}
      <View style={{height:24}}/>
    </View>}

    {/* DRILL-DOWN SHEET */}
    <Modal visible={!!drill} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setDrill(null)}>
      <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
        <StatusBar barStyle="dark-content"/>
        <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <TouchableOpacity onPress={()=>setDrill(null)} style={{paddingRight:16,paddingVertical:4}}>
            <Text style={{fontSize:22,color:colors.text3}}>←</Text>
          </TouchableOpacity>
          <View style={{flex:1}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:17,color:colors.text}} numberOfLines={1}>{drill?.title}</Text>
            {drill?.subtitle&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:1}}>{drill.ids.length} book{drill.ids.length!==1?'s':''} · {drill.subtitle}</Text>}
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:spacing.lg}}>
          {drill?.ids.map(id=>{const b=all.find(x=>x.id===id);if(!b)return null;const rat=ratings[id];const st=shelf[id];
            return <TouchableOpacity key={id} onPress={()=>setDetailId(id)} activeOpacity={0.8}
              style={{flexDirection:'row',gap:14,padding:14,marginBottom:10,backgroundColor:colors.surface,borderRadius:radius.lg,alignItems:'center',...shadow.soft}}>
              <BookCover bookId={id} size="sm"/>
              <View style={{flex:1}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={2}>{b.title}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:2}}>{b.author}{b.year?` · ${b.year}`:''}</Text>
                <View style={{flexDirection:'row',gap:10,marginTop:6,alignItems:'center'}}>
                  {rat?<Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent}}>You: {rat}★</Text>:null}
                  {st?<View style={{paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.surface2,borderRadius:999,borderWidth:1,borderColor:colors.border}}><Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,textTransform:'capitalize'}}>{st}</Text></View>:null}
                  {b.readers>0?<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>★ {b.avgRating}</Text>:null}
                </View>
              </View>
              <Text style={{color:colors.text3,fontSize:16}}>›</Text>
            </TouchableOpacity>;})}
          <View style={{height:32}}/>
        </ScrollView>
        <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
      </SafeAreaView>
    </Modal>

    {!drill&&<BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>}
  </View>;
}
