import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts,type} from '../../constants/theme';
import {BOOKS,PAGE_COUNTS} from '../../data/books';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';

const TABS=[{k:'reading',l:'Reading'},{k:'read',l:'Read'},{k:'want',l:'Want'},{k:'stats',l:'Stats'},{k:'rankings',l:'Rankings'},{k:'dnf',l:'DNF'}] as const;
type K=typeof TABS[number]['k'];

export default function ShelfScreen(){
  const [tab,setTab]=useState<K>('reading');
  const [detailId,setDetailId]=useState<string|null>(null);
  const {shelf,ratings,journal,eloRatings,customBooks,rereads,formats}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  function Row({id}:{id:string}){
    const b=all.find(x=>x.id===id); if(!b) return null;
    const rat=ratings[b.id]; const j=journal[b.id]; const total=PAGE_COUNTS[b.id]||b.pages||300; const pct=j?Math.round(j.page/total*100):0;
    return <TouchableOpacity style={s.item} activeOpacity={0.75} onPress={()=>setDetailId(b.id)}>
      <BookCover bookId={b.id} size="sm"/>
      <View style={{flex:1}}>
        <Text style={s.title} numberOfLines={2}>{b.title}</Text>
        <Text style={s.author}>{b.author}</Text>
        <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:4}}>
          {rat?<Text style={{fontSize:11,color:colors.accent}}>{'★'.repeat(Math.round(rat))}</Text>:null}
          {shelf[b.id]==='reading'&&j?<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>p.{j.page} · {pct}%</Text>:null}
        </View>
        {shelf[b.id]==='reading'&&j?<View style={{height:2,backgroundColor:colors.surface2,marginTop:6,overflow:'hidden'}}><View style={{height:2,backgroundColor:colors.accent,width:`${pct}%` as any}}/></View>:null}
      </View>
      <Text style={{fontSize:16,color:colors.text3,alignSelf:'center'}}>›</Text>
    </TouchableOpacity>;
  }

  function Stats(){
    const read=all.filter(b=>shelf[b.id]==='read'); const dnf=all.filter(b=>shelf[b.id]==='dnf');
    const vals=Object.values(ratings).filter(Number.isFinite) as number[];
    const avg=vals.length?(vals.reduce((a,v)=>a+v,0)/vals.length).toFixed(1):'—';
    const pages=read.reduce((s2,b)=>s2+(PAGE_COUNTS[b.id]||b.pages||280),0);
    const rrCount=Object.values(rereads).flat().length;
    const print=Object.values(formats).filter(f=>f==='print').length;
    const ebook=Object.values(formats).filter(f=>f==='ebook').length;
    const audio=Object.values(formats).filter(f=>f==='audio').length;
    return <View>
      <View style={{flexDirection:'row',flexWrap:'wrap',padding:spacing.lg,gap:10}}>
        {[{v:String(read.length),l:'Books read'},{v:pages>=1000?(pages/1000).toFixed(1)+'k':String(pages),l:'Pages'},{v:avg+(avg!=='—'?' ★':''),l:'Avg rating'},{v:String(dnf.length),l:"DNF'd"},{v:String(rrCount),l:'Re-reads'},{v:String(vals.length),l:'Rated'}].map(c=>
          <View key={c.l} style={{flex:1,minWidth:'40%',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:16,alignItems:'center'}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:26,color:colors.text,marginBottom:4}}>{c.v}</Text>
            <Text style={type.label}>{c.l}</Text>
          </View>
        )}
      </View>
      {(print+ebook+audio)>0&&<View style={{paddingHorizontal:spacing.lg,paddingBottom:spacing.lg}}>
        <Text style={[type.label,{marginBottom:10}]}>Format breakdown</Text>
        <View style={{flexDirection:'row',gap:8}}>
          {print>0&&<View style={fmtPill}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>📖 {print}</Text></View>}
          {ebook>0&&<View style={fmtPill}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>📱 {ebook}</Text></View>}
          {audio>0&&<View style={fmtPill}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>🎧 {audio}</Text></View>}
        </View>
      </View>}
    </View>;
  }

  function Rankings(){
    const r=[...all].filter(b=>eloRatings[b.id]).sort((a,b2)=>(eloRatings[b2.id]??1000)-(eloRatings[a.id]??1000));
    if(!r.length) return <View style={{padding:spacing.xl,alignItems:'center'}}><Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center'}}>No rankings yet.{'\n'}Tap "Rate Books" on Home, then use Versus mode.</Text></View>;
    return <>{r.map((b,i)=><TouchableOpacity key={b.id} style={[s.item,{alignItems:'center'}]} onPress={()=>setDetailId(b.id)}>
      <Text style={{fontFamily:fonts.serifBold,width:24,fontSize:15,color:i<3?colors.accent:colors.text3,textAlign:'center'}}>{i+1}</Text>
      <BookCover bookId={b.id} size="sm"/>
      <View style={{flex:1}}><Text style={s.title}>{b.title}</Text><Text style={s.author}>{b.author}</Text><Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent,marginTop:2}}>{eloRatings[b.id]} ELO</Text></View>
    </TouchableOpacity>)}</>;
  }

  const books=tab==='reading'?all.filter(b=>shelf[b.id]==='reading'):tab==='read'?all.filter(b=>shelf[b.id]==='read'):tab==='want'?all.filter(b=>shelf[b.id]==='want'):all.filter(b=>shelf[b.id]==='dnf');

  return <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
    <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,borderBottomWidth:1,borderBottomColor:colors.border}} contentContainerStyle={{paddingHorizontal:spacing.lg}}>
      {TABS.map(t=><TouchableOpacity key={t.k} onPress={()=>setTab(t.k)} style={{paddingHorizontal:14,paddingVertical:12,borderBottomWidth:2,borderBottomColor:tab===t.k?colors.accent:'transparent'}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:tab===t.k?colors.accent:colors.text3,letterSpacing:0.4}}>{t.l}</Text>
      </TouchableOpacity>)}
    </ScrollView>
    <ScrollView showsVerticalScrollIndicator={false}>
      {tab==='stats'&&<Stats/>}
      {tab==='rankings'&&<Rankings/>}
      {!['stats','rankings'].includes(tab)&&(books.length?books.map(b=><Row key={b.id} id={b.id}/>):<View style={{padding:spacing.xl,alignItems:'center'}}><Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3}}>Nothing here yet.</Text></View>)}
      <View style={{height:32}}/>
    </ScrollView>
    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
  </SafeAreaView>;
}

const fmtPill:any={paddingHorizontal:14,paddingVertical:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border};
const s={item:{flexDirection:'row' as const,padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border,gap:12},title:{fontFamily:fonts.serifBold,fontSize:15,color:colors.text,marginBottom:3},author:{fontFamily:fonts.sans,fontSize:12,color:colors.text3}};
