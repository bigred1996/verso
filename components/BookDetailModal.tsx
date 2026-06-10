import React,{useState} from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,TextInput,SafeAreaView,StatusBar,Platform,Share} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {colors,spacing,fonts,type} from '../constants/theme';
import {BOOKS,PAGE_COUNTS} from '../data/books';
import type {ShelfStatus,Format} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

const SHELF_OPTS:{k:ShelfStatus;l:string;ic:string}[]=[
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

interface Props { bookId:string|null; onClose:()=>void; }

export default function BookDetailModal({bookId,onClose}:Props){
  const {shelf,ratings,formats,rereads,journal,userTags,customBooks,setShelf,setRating,setFormat,addReread,updateJournal,addJournalEntry,setUserTags}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const book=bookId?all.find(b=>b.id===bookId):null;
  const [tab,setTab]=useState<'detail'|'journal'|'rereads'>('detail');
  const [journalPage,setJournalPage]=useState('');
  const [journalNote,setJournalNote]=useState('');
  const [rrRating,setRrRating]=useState(0);
  const [rrNote,setRrNote]=useState('');
  const [showRrForm,setShowRrForm]=useState(false);
  const [tagInput,setTagInput]=useState('');
  const [shareFeedback,setShareFeedback]=useState<string|null>(null);

  if(!book||!bookId) return null;
  const bid=bookId as string;

  const sh=shelf[bid];
  const rat=ratings[bid];
  const fmt=formats[bid];
  const j=journal[bid];
  const rr=rereads[bid]||[];
  const tags=userTags[bid]||[];
  const total=PAGE_COUNTS[bid]||book.pages||280;
  const pct=j?Math.min(100,Math.round(j.page/total*100)):0;
  const TODAY_LABEL=()=>{const d=new Date(2026,5,9);return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate();};

  // 5 stars: tap = full, tap same again = half, tap half again = clear
  function Star({n,value,onPress}:{n:number;value:number;onPress:(v:number)=>void}){
    const fill=value>=n?1:value>=n-0.5?0.5:0;
    return <TouchableOpacity onPress={()=>onPress(value===n?n-0.5:value===n-0.5?0:n)} style={{padding:3}}>
      <View>
        <Text style={{fontSize:30,color:colors.text3}}>★</Text>
        {fill>0&&<View style={{position:'absolute',overflow:'hidden',width:fill===1?'100%':'50%'}}>
          <Text style={{fontSize:30,color:colors.accent}}>★</Text>
        </View>}
      </View>
    </TouchableOpacity>;
  }

  function saveJournalEntry(){
    if(!bid) return;
    const p=parseInt(journalPage,10);
    if(isNaN(p)||p<0) return;
    const entry={date:TODAY_LABEL(),page:p,note:journalNote.trim()};
    updateJournal(bid,p);
    if(journalNote.trim()) addJournalEntry(bid,entry);
    setJournalPage(''); setJournalNote('');
  }

  function saveReread(){
    if(!rrRating||!bid) return;
    addReread(bid,{date:TODAY_LABEL(),rating:rrRating,note:rrNote.trim()});
    setRrRating(0); setRrNote(''); setShowRrForm(false);
  }

  function addTag(){
    const t=tagInput.trim();
    if(!t||tags.includes(t)) { setTagInput(''); return; }
    setUserTags(bid,[...tags,t]);
    setTagInput('');
  }
  function removeTag(t:string){ setUserTags(bid,tags.filter(x=>x!==t)); }

  const shareText=`"${book.title}" by ${book.author}${rat?` — ${rat}★`:''} · on my Verso shelf`;
  async function doCopy(){
    try{ await Clipboard.setStringAsync(shareText); setShareFeedback('Copied!'); }
    catch{ setShareFeedback('Copy failed'); }
    setTimeout(()=>setShareFeedback(null),1500);
  }
  async function doShare(){
    try{
      if(Platform.OS==='web'){
        const nav:any=typeof navigator!=='undefined'?navigator:null;
        if(nav?.share){ await nav.share({text:shareText}); setShareFeedback('Shared!'); }
        else { await Clipboard.setStringAsync(shareText); setShareFeedback('Copied (no share sheet on this browser)'); }
      } else {
        await Share.share({message:shareText});
        setShareFeedback('Shared!');
      }
    }catch{ /* user cancelled */ }
    setTimeout(()=>setShareFeedback(null),1800);
  }

  return <Modal visible={!!bookId} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      {/* Header */}
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{book.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{flexDirection:'row',padding:spacing.lg,gap:16,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <BookCover bookId={bid} size="md"/>
          <View style={{flex:1,justifyContent:'center'}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:20,color:colors.text,lineHeight:26,marginBottom:4}}>{book.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,marginBottom:8}}>{book.author}{book.year?` · ${book.year}`:''}</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:5,marginBottom:8}}>
              {book.genres.map(g=><View key={g} style={pill}><Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{g}</Text></View>)}
            </View>
            {book.readers>0&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2}}>★ {book.avgRating} · {book.readers.toLocaleString()} readers</Text>}
          </View>
        </View>

        {/* Synopsis */}
        {book.synopsis?<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20}}>{book.synopsis}</Text>
        </View>:null}

        {/* Shelf status */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Shelf</Text>
          <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
            {SHELF_OPTS.map(o=>{
              const active=sh===o.k;
              return <TouchableOpacity key={o.l} onPress={()=>setShelf(bid,active?null:o.k)}
                style={[shelfBtn,active&&{backgroundColor:colors.accentDim,borderColor:colors.accent}]}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:active?colors.accent:colors.text2}}>{o.ic} {o.l}</Text>
              </TouchableOpacity>;
            })}
          </View>
        </View>

        {/* Rating */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Your Rating{rat?` · ${rat} ★`:''}</Text>
          <View style={{flexDirection:'row'}}>
            {[1,2,3,4,5].map(s=><Star key={s} n={s} value={rat||0} onPress={v=>setRating(bid,v)}/>)}
          </View>
          <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:4}}>tap a star twice for half</Text>
        </View>

        {/* Format */}
        {(sh==='reading'||sh==='read'||sh==='dnf')&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Format</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {FORMAT_OPTS.map(o=>{
              const active=fmt===o.k;
              return <TouchableOpacity key={o.k} onPress={()=>setFormat(bid,active?null:o.k)}
                style={[shelfBtn,active&&{backgroundColor:colors.accentDim,borderColor:colors.accent}]}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:active?colors.accent:colors.text2}}>{o.ic} {o.l}</Text>
              </TouchableOpacity>;
            })}
          </View>
        </View>}

        {/* Tags */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Your Tags</Text>
          {tags.length>0&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:10}}>
            {tags.map(t=><TouchableOpacity key={t} onPress={()=>removeTag(t)} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:5,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent}}>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>{t}</Text>
              <Text style={{fontSize:10,color:colors.accent}}>✕</Text>
            </TouchableOpacity>)}
          </View>}
          <View style={{flexDirection:'row',gap:8}}>
            <TextInput style={[inp,{flex:1}]} placeholder="Add a tag… (e.g. comfort read)" placeholderTextColor={colors.text3} value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} returnKeyType="done"/>
            <TouchableOpacity onPress={addTag} style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,justifyContent:'center'}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Share</Text>
          <View style={{flexDirection:'row',gap:8}}>
            <TouchableOpacity onPress={doCopy} style={[shelfBtn,{flex:1,alignItems:'center'}]}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text2}}>📋 Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={doShare} style={[shelfBtn,{flex:1,alignItems:'center'}]}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text2}}>↗ Share</Text>
            </TouchableOpacity>
          </View>
          {shareFeedback&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent,marginTop:8}}>{shareFeedback}</Text>}
        </View>

        {/* Sub-tab bar */}
        <View style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border}}>
          {(['detail','journal','rereads'] as const).map(t=><TouchableOpacity key={t} onPress={()=>setTab(t)}
            style={{flex:1,paddingVertical:11,alignItems:'center',borderBottomWidth:2,borderBottomColor:tab===t?colors.accent:'transparent'}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:tab===t?colors.accent:colors.text3,letterSpacing:0.3}}>{t==='rereads'?'Re-reads':t==='journal'?'Journal':'Details'}</Text>
          </TouchableOpacity>)}
        </View>

        {/* DETAIL TAB */}
        {tab==='detail'&&<View>
          {book.dist.some(d=>d>0)&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Rating Distribution</Text>
            {[5,4,3,2,1].map((star,i)=>{
              const count=book.dist[4-i]||0;
              const total2=book.dist.reduce((a,b)=>a+b,0)||1;
              const pct2=Math.round(count/total2*100);
              return <View key={star} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:5}}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,width:18}}>{star}★</Text>
                <View style={{flex:1,height:4,backgroundColor:colors.surface2,overflow:'hidden'}}>
                  <View style={{width:`${pct2}%`,height:4,backgroundColor:colors.accent}}/>
                </View>
                <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,width:28,textAlign:'right'}}>{pct2}%</Text>
              </View>;
            })}
          </View>}
          {book.takes.length>0&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Verso Takes</Text>
            {book.takes.map((tk,i)=><View key={i} style={{paddingLeft:12,borderLeftWidth:2,borderLeftColor:colors.accent,marginBottom:10}}>
              <Text style={{fontFamily:fonts.serif,fontSize:14,color:colors.text,fontStyle:'italic',lineHeight:21,marginBottom:3}}>"{tk.t}"</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>— {tk.u}</Text>
            </View>)}
          </View>}
          <View style={{padding:spacing.lg}}>
            <Text style={[type.label,{marginBottom:10}]}>Book Info</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,marginBottom:4}}>{total} pages</Text>
            {fmt&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,marginBottom:4}}>You read: {fmt==='print'?'📖 Print':fmt==='ebook'?'📱 eBook':'🎧 Audiobook'}</Text>}
          </View>
        </View>}

        {/* JOURNAL TAB */}
        {tab==='journal'&&<View style={{padding:spacing.lg}}>
          {sh==='reading'&&<View style={{marginBottom:spacing.lg}}>
            <Text style={[type.label,{marginBottom:10}]}>Progress</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8}}>
              <View style={{flex:1,height:4,backgroundColor:colors.surface2,overflow:'hidden'}}>
                <View style={{width:`${pct}%`,height:4,backgroundColor:colors.accent}}/>
              </View>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{pct}%</Text>
            </View>
            {j&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:spacing.md}}>Currently on p.{j.page} of {total}</Text>}
            <View style={{gap:8}}>
              <TextInput style={inp} placeholder="Current page" placeholderTextColor={colors.text3} value={journalPage} onChangeText={setJournalPage} keyboardType="numeric"/>
              <TextInput style={[inp,{height:72,textAlignVertical:'top'}]} placeholder="Note (optional)" placeholderTextColor={colors.text3} value={journalNote} onChangeText={setJournalNote} multiline/>
              <TouchableOpacity style={btn} onPress={saveJournalEntry}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Update Progress</Text>
              </TouchableOpacity>
            </View>
          </View>}
          {(j?.entries||[]).length>0&&<View>
            <Text style={[type.label,{marginBottom:10}]}>Reading Log</Text>
            {[...(j?.entries||[])].reverse().map((e,i)=><View key={i} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{e.date}</Text>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent}}>p.{e.page}</Text>
              </View>
              {e.note?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,lineHeight:17}}>{e.note}</Text>:null}
            </View>)}
          </View>}
          {(!j||!(j.entries||[]).length)&&sh!=='reading'&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>No journal entries yet.</Text>}
        </View>}

        {/* REREADS TAB */}
        {tab==='rereads'&&<View style={{padding:spacing.lg}}>
          {rr.length>0&&<View style={{marginBottom:spacing.lg}}>
            <Text style={[type.label,{marginBottom:10}]}>Read History</Text>
            {rr.map((e,i)=><View key={i} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Read #{i+1} · {e.date}</Text>
                <Text style={{fontSize:12,color:colors.accent}}>{'★'.repeat(e.rating)}</Text>
              </View>
              {e.note?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>{e.note}</Text>:null}
            </View>)}
          </View>}
          {sh==='read'&&<View>
            <Text style={[type.label,{marginBottom:10}]}>Log a Re-read</Text>
            {!showRrForm&&<TouchableOpacity style={[btn,{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border}]} onPress={()=>setShowRrForm(true)}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>+ Log a Re-read</Text>
            </TouchableOpacity>}
            {showRrForm&&<View style={{gap:8}}>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:4}}>Rating</Text>
              <View style={{flexDirection:'row',gap:8}}>
                {[1,2,3,4,5].map(s=><TouchableOpacity key={s} onPress={()=>setRrRating(rrRating===s?0:s)}>
                  <Text style={{fontSize:26,color:rrRating>=s?colors.accent:colors.text3}}>★</Text>
                </TouchableOpacity>)}
              </View>
              <TextInput style={[inp,{height:72,textAlignVertical:'top',marginTop:8}]} placeholder="Notes (optional)" placeholderTextColor={colors.text3} value={rrNote} onChangeText={setRrNote} multiline/>
              <TouchableOpacity style={btn} onPress={saveReread}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Save Re-read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setShowRrForm(false)}>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,textAlign:'center',paddingVertical:4}}>Cancel</Text>
              </TouchableOpacity>
            </View>}
          </View>}
          {sh!=='read'&&rr.length===0&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>Add to "Read" shelf to log re-reads.</Text>}
        </View>}

        <View style={{height:48}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const pill:any={paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border};
const shelfBtn:any={paddingHorizontal:14,paddingVertical:9,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border};
const inp:any={fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10};
const btn:any={backgroundColor:colors.accent,padding:13,alignItems:'center'};
