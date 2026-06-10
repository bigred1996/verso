import React,{useState,useRef} from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,TextInput,StyleSheet,SafeAreaView,StatusBar,Platform} from 'react-native';
import {colors,spacing} from '../constants/theme';
import {BOOKS,PAGE_COUNTS} from '../data/books';
import type {ShelfStatus,Format} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

const SHELF_OPTS:{k:ShelfStatus|null;l:string;ic:string}[]=[
  {k:'reading',l:'Reading',ic:'📖'},
  {k:'read',l:'Read',ic:'✓'},
  {k:'want',l:'Want',ic:'♡'},
  {k:'dnf',l:'DNF',ic:'✕'},
];
const FORMAT_OPTS:{k:Format;l:string;ic:string}[]=[
  {k:'print',l:'Print',ic:'📖'},
  {k:'ebook',l:'eBook',ic:'📱'},
  {k:'audio',l:'Audio',ic:'🎧'},
];
const STARS=[1,2,3,4,5];

interface Props { bookId:string|null; onClose:()=>void; }

export default function BookDetailModal({bookId,onClose}:Props){
  const {shelf,ratings,formats,rereads,journal,setShelf,setRating,setFormat,addReread,updateJournal,addJournalEntry}=useStore();
  const all=[...BOOKS,...(useStore.getState().customBooks||[])];
  const book=bookId?all.find(b=>b.id===bookId):null;
  const [tab,setTab]=useState<'detail'|'journal'|'rereads'>('detail');
  const [journalPage,setJournalPage]=useState('');
  const [journalNote,setJournalNote]=useState('');
  const [rrRating,setRrRating]=useState(0);
  const [rrNote,setRrNote]=useState('');
  const [showRrForm,setShowRrForm]=useState(false);

  if(!book||!bookId) return null;
  const bid=bookId as string; // narrowed: bookId is non-null past this point

  const sh=shelf[bid];
  const rat=ratings[bookId];
  const fmt=formats[bookId];
  const j=journal[bookId];
  const rr=rereads[bookId]||[];
  const total=PAGE_COUNTS[bookId]||book.pages||280;
  const pct=j?Math.min(100,Math.round(j.page/total*100)):0;
  const TODAY_LABEL=()=>{const d=new Date(2026,5,9);return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate();};

  function StarRow({value,onChange}:{value:number;onChange:(v:number)=>void}){
    return <View style={{flexDirection:'row',gap:4}}>
      {[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map(v=>{
        const filled=value>=v;
        const isHalf=v%1!==0;
        return <TouchableOpacity key={v} onPress={()=>onChange(value===v?0:v)}
          style={{paddingHorizontal:2,paddingVertical:4}}>
          <Text style={{fontSize:20,color:filled?colors.accent:colors.text3}}>{isHalf?'½':'★'}</Text>
        </TouchableOpacity>;
      })}
    </View>;
  }

  function saveJournalEntry(){
    if(!bookId) return;
    const p=parseInt(journalPage,10);
    if(isNaN(p)||p<0) return;
    const entry={date:TODAY_LABEL(),page:p,note:journalNote.trim()};
    updateJournal(bookId,p);
    if(journalNote.trim()) addJournalEntry(bookId,entry);
    setJournalPage(''); setJournalNote('');
  }

  function saveReread(){
    if(!rrRating||!bookId) return;
    addReread(bookId,{date:TODAY_LABEL(),rating:rrRating,note:rrNote.trim()});
    setRrRating(0); setRrNote(''); setShowRrForm(false);
  }

  return <Modal visible={!!bookId} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      {/* Header */}
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontSize:14,color:colors.text,fontWeight:'600'}} numberOfLines={1}>{book.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{flexDirection:'row',padding:spacing.lg,gap:16,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <BookCover bookId={bookId} size="md"/>
          <View style={{flex:1,justifyContent:'center'}}>
            <Text style={{fontSize:18,color:colors.text,fontWeight:'700',lineHeight:24,marginBottom:4}}>{book.title}</Text>
            <Text style={{fontSize:13,color:colors.text3,marginBottom:8}}>{book.author} · {book.year}</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:5,marginBottom:8}}>
              {book.genres.map(g=><View key={g} style={pill}><Text style={{fontSize:10,color:colors.text3}}>{g}</Text></View>)}
            </View>
            <Text style={{fontSize:11,color:colors.text2}}>★ {book.avgRating} · {book.readers.toLocaleString()} readers</Text>
          </View>
        </View>

        {/* Synopsis */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={{fontSize:12,color:colors.text2,lineHeight:19}}>{book.synopsis}</Text>
        </View>

        {/* Shelf status */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={sec}>Shelf</Text>
          <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
            {SHELF_OPTS.map(o=>{
              const active=sh===o.k;
              return <TouchableOpacity key={o.l} onPress={()=>setShelf(bookId,active?null:o.k as ShelfStatus)}
                style={[shelfBtn,active&&{backgroundColor:colors.accentDim,borderColor:colors.accent}]}>
                <Text style={{fontSize:13,color:active?colors.accent:colors.text2}}>{o.ic} {o.l}</Text>
              </TouchableOpacity>;
            })}
          </View>
        </View>

        {/* Rating */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={sec}>Your Rating {rat?`· ${rat} ★`:''}</Text>
          <StarRow value={rat||0} onChange={v=>setRating(bookId,v)}/>
        </View>

        {/* Format */}
        {(sh==='reading'||sh==='read'||sh==='dnf')&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={sec}>Format</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {FORMAT_OPTS.map(o=>{
              const active=fmt===o.k;
              return <TouchableOpacity key={o.k} onPress={()=>setFormat(bookId,active?null:o.k)}
                style={[shelfBtn,active&&{backgroundColor:colors.accentDim,borderColor:colors.accent}]}>
                <Text style={{fontSize:12,color:active?colors.accent:colors.text2}}>{o.ic} {o.l}</Text>
              </TouchableOpacity>;
            })}
          </View>
        </View>}

        {/* Sub-tab bar */}
        <View style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border}}>
          {(['detail','journal','rereads'] as const).map(t=><TouchableOpacity key={t} onPress={()=>setTab(t)}
            style={{flex:1,paddingVertical:11,alignItems:'center',borderBottomWidth:2,borderBottomColor:tab===t?colors.accent:'transparent'}}>
            <Text style={{fontSize:12,color:tab===t?colors.accent:colors.text3,textTransform:'capitalize',letterSpacing:0.3}}>{t==='rereads'?'Re-reads':t==='journal'?'Journal':'Details'}</Text>
          </TouchableOpacity>)}
        </View>

        {/* DETAIL TAB */}
        {tab==='detail'&&<View>
          {/* Rating dist */}
          <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={sec}>Rating Distribution</Text>
            {[5,4,3,2,1].map((star,i)=>{
              const count=book.dist[4-i]||0;
              const total2=book.dist.reduce((a,b)=>a+b,0)||1;
              const pct2=Math.round(count/total2*100);
              return <View key={star} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:5}}>
                <Text style={{fontSize:11,color:colors.text3,width:16}}>{star}★</Text>
                <View style={{flex:1,height:4,backgroundColor:colors.surface2,overflow:'hidden'}}>
                  <View style={{width:`${pct2}%`,height:4,backgroundColor:colors.accent}}/>
                </View>
                <Text style={{fontSize:10,color:colors.text3,width:28,textAlign:'right'}}>{pct2}%</Text>
              </View>;
            })}
          </View>
          {/* Takes */}
          {book.takes.length>0&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={sec}>Verso Takes</Text>
            {book.takes.map((tk,i)=><View key={i} style={{paddingLeft:12,borderLeftWidth:2,borderLeftColor:colors.accent,marginBottom:10}}>
              <Text style={{fontSize:13,color:colors.text,fontStyle:'italic',lineHeight:19,marginBottom:3}}>"{tk.t}"</Text>
              <Text style={{fontSize:11,color:colors.text3}}>— {tk.u}</Text>
            </View>)}
          </View>}
          {/* Pages info */}
          <View style={{padding:spacing.lg}}>
            <Text style={sec}>Book Info</Text>
            <Text style={{fontSize:13,color:colors.text2,marginBottom:4}}>{total} pages</Text>
            {fmt&&<Text style={{fontSize:13,color:colors.text2,marginBottom:4}}>You read: {fmt==='print'?'📖 Print':fmt==='ebook'?'📱 eBook':'🎧 Audiobook'}</Text>}
          </View>
        </View>}

        {/* JOURNAL TAB */}
        {tab==='journal'&&<View style={{padding:spacing.lg}}>
          {sh==='reading'&&<View style={{marginBottom:spacing.lg}}>
            <Text style={sec}>Progress</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8}}>
              <View style={{flex:1,height:4,backgroundColor:colors.surface2,overflow:'hidden'}}>
                <View style={{width:`${pct}%`,height:4,backgroundColor:colors.accent}}/>
              </View>
              <Text style={{fontSize:11,color:colors.text3}}>{pct}%</Text>
            </View>
            {j&&<Text style={{fontSize:12,color:colors.text3,marginBottom:spacing.md}}>Currently on p.{j.page} of {total}</Text>}
            <View style={{gap:8}}>
              <TextInput style={inp} placeholder="Current page" placeholderTextColor={colors.text3} value={journalPage} onChangeText={setJournalPage} keyboardType="numeric"/>
              <TextInput style={[inp,{height:72,textAlignVertical:'top'}]} placeholder="Note (optional)" placeholderTextColor={colors.text3} value={journalNote} onChangeText={setJournalNote} multiline/>
              <TouchableOpacity style={btn} onPress={saveJournalEntry}>
                <Text style={{color:colors.bg,fontSize:13,fontWeight:'600'}}>Update Progress</Text>
              </TouchableOpacity>
            </View>
          </View>}
          {(j?.entries||[]).length>0&&<View>
            <Text style={sec}>Reading Log</Text>
            {[...(j?.entries||[])].reverse().map((e,i)=><View key={i} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}>
                <Text style={{fontSize:11,color:colors.text3}}>{e.date}</Text>
                <Text style={{fontSize:11,color:colors.accent}}>p.{e.page}</Text>
              </View>
              {e.note?<Text style={{fontSize:12,color:colors.text2,lineHeight:17}}>{e.note}</Text>:null}
            </View>)}
          </View>}
          {(!j||!(j.entries||[]).length)&&sh!=='reading'&&<Text style={{fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>No journal entries yet.</Text>}
        </View>}

        {/* REREADS TAB */}
        {tab==='rereads'&&<View style={{padding:spacing.lg}}>
          {rr.length>0&&<View style={{marginBottom:spacing.lg}}>
            <Text style={sec}>Read History</Text>
            {rr.map((e,i)=><View key={i} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}>
                <Text style={{fontSize:12,color:colors.text3}}>Read #{i+1} · {e.date}</Text>
                <Text style={{fontSize:12,color:colors.accent}}>{'★'.repeat(e.rating)}</Text>
              </View>
              {e.note?<Text style={{fontSize:12,color:colors.text2}}>{e.note}</Text>:null}
            </View>)}
          </View>}
          {sh==='read'&&<View>
            <Text style={sec}>Log a Re-read</Text>
            {!showRrForm&&<TouchableOpacity style={[btn,{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border}]} onPress={()=>setShowRrForm(true)}>
              <Text style={{color:colors.text,fontSize:13}}>+ Log a Re-read</Text>
            </TouchableOpacity>}
            {showRrForm&&<View style={{gap:8}}>
              <Text style={{fontSize:12,color:colors.text3,marginBottom:4}}>Rating</Text>
              <View style={{flexDirection:'row',gap:8}}>
                {STARS.map(s=><TouchableOpacity key={s} onPress={()=>setRrRating(rrRating===s?0:s)}>
                  <Text style={{fontSize:24,color:rrRating>=s?colors.accent:colors.text3}}>★</Text>
                </TouchableOpacity>)}
              </View>
              <TextInput style={[inp,{height:72,textAlignVertical:'top',marginTop:8}]} placeholder="Notes (optional)" placeholderTextColor={colors.text3} value={rrNote} onChangeText={setRrNote} multiline/>
              <TouchableOpacity style={btn} onPress={saveReread}>
                <Text style={{color:colors.bg,fontSize:13,fontWeight:'600'}}>Save Re-read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setShowRrForm(false)}>
                <Text style={{fontSize:12,color:colors.text3,textAlign:'center',paddingVertical:4}}>Cancel</Text>
              </TouchableOpacity>
            </View>}
          </View>}
          {sh!=='read'&&rr.length===0&&<Text style={{fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>Add to "Read" shelf to log re-reads.</Text>}
        </View>}

        <View style={{height:48}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const sec:any={fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:10};
const pill:any={paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border};
const shelfBtn:any={paddingHorizontal:14,paddingVertical:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border};
const inp:any={backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10};
const btn:any={backgroundColor:colors.accent,padding:13,alignItems:'center'};
