import React,{useState,useEffect} from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,TextInput,SafeAreaView,StatusBar,Platform,Share} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {colors,spacing,fonts,type} from '../constants/theme';
import {BOOKS,PAGE_COUNTS,AUTHOR_DATA,BOOK_TAGS,FRIEND_BOOK,FRIENDS} from '../data/books';
import type {ShelfStatus,Format} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';
import AuthorModal from './AuthorModal';

const SHELF_OPTS:{k:ShelfStatus;l:string}[]=[
  {k:'reading',l:'Reading'},{k:'read',l:'Read'},{k:'want',l:'Want'},{k:'dnf',l:'DNF'},
];
const FORMAT_OPTS:{k:Format;l:string}[]=[
  {k:'print',l:'Print'},{k:'ebook',l:'eBook'},{k:'audio',l:'Audiobook'},
];
const HOT_PLACEHOLDERS=[
  'One sentence. No mercy.','The take you\'d defend at a dinner party.',
  'Sum it up before you overthink it.','140 characters of pure opinion.',
];

interface Props { bookId:string|null; onClose:()=>void; }

export default function BookDetailModal({bookId,onClose}:Props){
  const {shelf,ratings,formats,rereads,journal,userTags,reviews,buddyReads,customBooks,setShelf,setRating,setFormat,addReread,updateJournal,addJournalEntry,setUserTags,setReview,startBuddyRead,endBuddyRead}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  // Internal active id so tapping a book inside the author sheet navigates here
  const [localId,setLocalId]=useState<string|null>(bookId);
  useEffect(()=>{ setLocalId(bookId); },[bookId]);
  const activeId=localId||bookId;
  const book=activeId?all.find(b=>b.id===activeId):null;

  const [tab,setTab]=useState<'detail'|'journal'|'rereads'|'review'>('detail');
  const [journalPage,setJournalPage]=useState('');
  const [journalNote,setJournalNote]=useState('');
  const [rrRating,setRrRating]=useState(0);
  const [rrNote,setRrNote]=useState('');
  const [showRrForm,setShowRrForm]=useState(false);
  const [tagInput,setTagInput]=useState('');
  const [shareFeedback,setShareFeedback]=useState<string|null>(null);
  const [revMode,setRevMode]=useState<'long'|'hot'>('long');
  const [hot,setHot]=useState('');
  const [overall,setOverall]=useState('');
  const [best,setBest]=useState('');
  const [forWhom,setForWhom]=useState('');
  const [revSaved,setRevSaved]=useState(false);
  const [authorOpen,setAuthorOpen]=useState<string|null>(null);
  const [buddyPicking,setBuddyPicking]=useState(false);

  // hydrate review fields when the active book changes
  useEffect(()=>{
    const r=activeId?reviews[activeId]:null;
    setHot(r?.hotTake||''); setOverall(r?.overall||''); setBest(r?.best||''); setForWhom(r?.forWhom||'');
  },[activeId]);

  if(!book||!activeId) return null;
  const bid=activeId as string;

  const sh=shelf[bid];
  const rat=ratings[bid];
  const fmt=formats[bid];
  const j=journal[bid];
  const rr=rereads[bid]||[];
  const tags=userTags[bid]||[];
  const savedReview=reviews[bid];
  const meta=BOOK_TAGS[bid];
  const friendTakes=FRIEND_BOOK[bid]||{};
  const friendIds=Object.keys(friendTakes);
  const buddy=buddyReads.find(b=>b.bookId===bid);
  const total=PAGE_COUNTS[bid]||book.pages||280;
  const pct=j?Math.min(100,Math.round(j.page/total*100)):0;
  const hasAuthorPage=!!AUTHOR_DATA[book.author]||all.filter(b=>b.author===book.author).length>1;
  const TODAY_LABEL=()=>{const d=new Date(2026,5,9);return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate();};

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
    updateJournal(bid,p);
    if(journalNote.trim()) addJournalEntry(bid,{date:TODAY_LABEL(),page:p,note:journalNote.trim()});
    setJournalPage(''); setJournalNote('');
  }
  function saveReread(){
    if(!rrRating||!bid) return;
    addReread(bid,{date:TODAY_LABEL(),rating:rrRating,note:rrNote.trim()});
    setRrRating(0); setRrNote(''); setShowRrForm(false);
  }
  function addTag(){
    const t=tagInput.trim();
    if(!t||tags.includes(t)){ setTagInput(''); return; }
    setUserTags(bid,[...tags,t]); setTagInput('');
  }
  function removeTag(t:string){ setUserTags(bid,tags.filter(x=>x!==t)); }

  function postReview(){
    if(revMode==='hot'){ setReview(bid,{hotTake:hot.trim()}); }
    else { setReview(bid,{overall:overall.trim(),best:best.trim(),forWhom:forWhom.trim()}); }
    setRevSaved(true); setTimeout(()=>setRevSaved(false),1800);
  }

  const shareText=`"${book.title}" by ${book.author}${rat?` — ${rat}★`:''}${savedReview?.hotTake?` · "${savedReview.hotTake}"`:''} · on my Verso shelf`;
  async function doCopy(){ try{ await Clipboard.setStringAsync(shareText); setShareFeedback('Copied'); }catch{ setShareFeedback('Copy failed'); } setTimeout(()=>setShareFeedback(null),1500); }
  async function doShare(){
    try{
      if(Platform.OS==='web'){
        const nav:any=typeof navigator!=='undefined'?navigator:null;
        if(nav?.share){ await nav.share({text:shareText}); } else { await Clipboard.setStringAsync(shareText); setShareFeedback('Copied (no share sheet here)'); }
      } else { await Share.share({message:shareText}); }
    }catch{}
    setTimeout(()=>setShareFeedback(null),1800);
  }

  const hotPh=HOT_PLACEHOLDERS[book.title.length%HOT_PLACEHOLDERS.length];

  return <Modal visible={!!bookId} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
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
            <TouchableOpacity disabled={!hasAuthorPage} onPress={()=>setAuthorOpen(book.author)}>
              <Text style={{fontFamily:fonts.sans,fontSize:13,color:hasAuthorPage?colors.accent:colors.text3,marginBottom:8}}>
                {book.author}{book.year?` · ${book.year}`:''}{hasAuthorPage?'  ›':''}
              </Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:5,marginBottom:8}}>
              {book.genres.map(g=><View key={g} style={pill}><Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{g}</Text></View>)}
            </View>
            {book.readers>0&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2}}>★ {book.avgRating} · {book.readers.toLocaleString()} readers</Text>}
          </View>
        </View>

        {book.synopsis?<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20}}>{book.synopsis}</Text>
        </View>:null}

        {/* Shelf */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Shelf</Text>
          <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
            {SHELF_OPTS.map(o=>{const active=sh===o.k;return <TouchableOpacity key={o.l} onPress={()=>setShelf(bid,active?null:o.k)}
              style={[chip,active&&activeChip]}><Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:active?colors.accent:colors.text2}}>{o.l}</Text></TouchableOpacity>;})}
          </View>
        </View>

        {/* Rating */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Your Rating{rat?` · ${rat} ★`:''}</Text>
          <View style={{flexDirection:'row'}}>{[1,2,3,4,5].map(s=><Star key={s} n={s} value={rat||0} onPress={v=>setRating(bid,v)}/>)}</View>
          <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:4}}>tap a star twice for half</Text>
        </View>

        {/* Format */}
        {(sh==='reading'||sh==='read'||sh==='dnf')&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Format</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {FORMAT_OPTS.map(o=>{const active=fmt===o.k;return <TouchableOpacity key={o.k} onPress={()=>setFormat(bid,active?null:o.k)}
              style={[chip,active&&activeChip]}><Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:active?colors.accent:colors.text2}}>{o.l}</Text></TouchableOpacity>;})}
          </View>
        </View>}

        {/* Tags */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Your Tags</Text>
          {tags.length>0&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:10}}>
            {tags.map(t=><TouchableOpacity key={t} onPress={()=>removeTag(t)} style={{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:5,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent}}>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>{t}</Text>
              <Text style={{fontSize:10,color:colors.accent}}>✕</Text>
            </TouchableOpacity>)}
          </View>}
          <View style={{flexDirection:'row',gap:8}}>
            <TextInput style={[inp,{flex:1}]} placeholder="Add a tag… (e.g. comfort read)" placeholderTextColor={colors.text3} value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} returnKeyType="done"/>
            <TouchableOpacity onPress={addTag} style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,justifyContent:'center'}}><Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>Add</Text></TouchableOpacity>
          </View>
        </View>

        {/* Share */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Share</Text>
          <View style={{flexDirection:'row',gap:8}}>
            <TouchableOpacity onPress={doCopy} style={[chip,{flex:1,alignItems:'center'}]}><Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text2}}>Copy</Text></TouchableOpacity>
            <TouchableOpacity onPress={doShare} style={[chip,{flex:1,alignItems:'center'}]}><Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text2}}>Share</Text></TouchableOpacity>
          </View>
          {shareFeedback&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent,marginTop:8}}>{shareFeedback}</Text>}
        </View>

        {/* Buddy Read */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Buddy Read</Text>
          {buddy?(()=>{const f=FRIENDS.find(x=>x.id===buddy.partner);const myPct=Math.min(100,Math.round(buddy.myPage/total*100));const thPct=Math.min(100,Math.round(buddy.theirPage/total*100));
            return <View style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:14}}>
              <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,marginBottom:10}}>You and <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>{f?.name.split(' ')[0]}</Text> are reading together.</Text>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:4}}>
                <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>You · p.{buddy.myPage}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{f?.name.split(' ')[0]} · p.{buddy.theirPage}</Text>
              </View>
              <View style={{height:4,backgroundColor:colors.surface2,marginBottom:10}}>
                <View style={{position:'absolute',height:4,backgroundColor:'rgba(123,158,166,0.5)',width:`${thPct}%`}}/>
                <View style={{position:'absolute',height:4,backgroundColor:colors.accent,width:`${myPct}%`}}/>
              </View>
              <Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:12,color:colors.text3,marginBottom:10}}>"{buddy.note}"</Text>
              <TouchableOpacity onPress={()=>endBuddyRead(bid)}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>End buddy read</Text></TouchableOpacity>
            </View>;})():buddyPicking?<View>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,marginBottom:10}}>Who do you want to read with?</Text>
              {FRIENDS.map(f=><TouchableOpacity key={f.id} onPress={()=>{startBuddyRead(bid,f.id);setBuddyPicking(false);}}
                style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:9}}>
                <View style={{width:30,height:30,borderRadius:15,backgroundColor:f.color+'24',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.sansBold,fontSize:12,color:f.color}}>{f.init}</Text></View>
                <View style={{flex:1}}><Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text}}>{f.name}</Text><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{f.match}% taste match</Text></View>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent}}>Invite</Text>
              </TouchableOpacity>)}
              <TouchableOpacity onPress={()=>setBuddyPicking(false)}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:6}}>Cancel</Text></TouchableOpacity>
            </View>:<TouchableOpacity onPress={()=>setBuddyPicking(true)} style={[chip,{alignSelf:'flex-start'}]}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text2}}>+ Start a Buddy Read</Text>
            </TouchableOpacity>}
        </View>

        {/* Friends on this book */}
        {friendIds.length>0&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={[type.label,{marginBottom:10}]}>Friends on This Book</Text>
          {friendIds.map(fid=>{const f=FRIENDS.find(x=>x.id===fid);const ft=friendTakes[fid];if(!f)return null;
            return <View key={fid} style={{flexDirection:'row',gap:10,paddingVertical:8,alignItems:'flex-start'}}>
              <View style={{width:30,height:30,borderRadius:15,backgroundColor:f.color+'24',alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.sansBold,fontSize:12,color:f.color}}>{f.init}</Text></View>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                  <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>{f.name.split(' ')[0]}</Text>
                  <Text style={{fontSize:11,color:colors.accent}}>{'★'.repeat(ft.r)}</Text>
                </View>
                <Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text2,lineHeight:19,marginTop:2}}>"{ft.t}"</Text>
              </View>
            </View>;})}
        </View>}

        {/* Sub-tabs */}
        <View style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border}}>
          {([['detail','Details'],['review','Review'],['journal','Journal'],['rereads','Re-reads']] as const).map(([k,label])=><TouchableOpacity key={k} onPress={()=>setTab(k)}
            style={{flex:1,paddingVertical:11,alignItems:'center',borderBottomWidth:2,borderBottomColor:tab===k?colors.accent:'transparent'}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:tab===k?colors.accent:colors.text3,letterSpacing:0.3}}>{label}</Text>
          </TouchableOpacity>)}
        </View>

        {/* DETAIL */}
        {tab==='detail'&&<View>
          {book.dist.some(d=>d>0)&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Rating Distribution</Text>
            {[5,4,3,2,1].map((star,i)=>{const count=book.dist[4-i]||0;const t2=book.dist.reduce((a,b)=>a+b,0)||1;const p2=Math.round(count/t2*100);
              return <View key={star} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:5}}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,width:18}}>{star}★</Text>
                <View style={{flex:1,height:4,backgroundColor:colors.surface2,overflow:'hidden'}}><View style={{width:`${p2}%`,height:4,backgroundColor:colors.accent}}/></View>
                <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,width:28,textAlign:'right'}}>{p2}%</Text>
              </View>;})}
          </View>}
          {book.takes.length>0&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Verso Takes</Text>
            {book.takes.map((tk,i)=><View key={i} style={{paddingLeft:12,borderLeftWidth:2,borderLeftColor:colors.accent,marginBottom:10}}>
              <Text style={{fontFamily:fonts.serif,fontSize:14,color:colors.text,fontStyle:'italic',lineHeight:21,marginBottom:3}}>"{tk.t}"</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>— {tk.u}</Text>
            </View>)}
          </View>}
          {meta&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Tropes & Themes</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:12}}>
              {meta.tropes.map(t=><View key={t} style={{paddingHorizontal:9,paddingVertical:4,backgroundColor:colors.accentDim,borderWidth:1,borderColor:'rgba(61,107,72,0.35)'}}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>{t}</Text></View>)}
            </View>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
              {meta.themes.map(t=><View key={t} style={pill}><Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{t}</Text></View>)}
            </View>
          </View>}
          {meta&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Form & Setting</Text>
            <View style={{gap:6}}>
              <View style={{flexDirection:'row'}}><Text style={metaK}>Subgenre</Text><Text style={metaV}>{meta.subgenres.join(' · ')}</Text></View>
              <View style={{flexDirection:'row'}}><Text style={metaK}>Perspective</Text><Text style={metaV}>{meta.perspective}</Text></View>
              <View style={{flexDirection:'row'}}><Text style={metaK}>Setting</Text><Text style={metaV}>{meta.setting}</Text></View>
            </View>
          </View>}
          {meta&&meta.cw.length>0&&<View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Content Warnings</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
              {meta.cw.map(c=><View key={c} style={{paddingHorizontal:9,paddingVertical:4,borderWidth:1,borderColor:'rgba(166,90,90,0.4)'}}><Text style={{fontFamily:fonts.sans,fontSize:11,color:'#C97B7B'}}>{c}</Text></View>)}
            </View>
          </View>}
          <View style={{padding:spacing.lg}}>
            <Text style={[type.label,{marginBottom:10}]}>Book Info</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,marginBottom:4}}>{total} pages</Text>
            {fmt&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2}}>You read: {FORMAT_OPTS.find(f=>f.k===fmt)?.l}</Text>}
          </View>
        </View>}

        {/* REVIEW */}
        {tab==='review'&&<View style={{padding:spacing.lg}}>
          {savedReview&&(savedReview.hotTake||savedReview.overall)&&<View style={{marginBottom:spacing.lg,paddingBottom:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={[type.label,{marginBottom:10}]}>Your Review · {savedReview.date}</Text>
            {savedReview.hotTake?<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:15,color:colors.text,lineHeight:23,marginBottom:savedReview.overall?12:0}}>"{savedReview.hotTake}"</Text>:null}
            {savedReview.overall?<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20,marginBottom:8}}>{savedReview.overall}</Text>:null}
            {savedReview.best?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,lineHeight:18,marginBottom:4}}><Text style={{color:colors.text2}}>Best thing: </Text>{savedReview.best}</Text>:null}
            {savedReview.forWhom?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,lineHeight:18}}><Text style={{color:colors.text2}}>For: </Text>{savedReview.forWhom}</Text>:null}
          </View>}

          <View style={{flexDirection:'row',gap:0,marginBottom:spacing.md}}>
            {(['long','hot'] as const).map(m=><TouchableOpacity key={m} onPress={()=>setRevMode(m)}
              style={{flex:1,paddingVertical:9,alignItems:'center',borderBottomWidth:2,borderBottomColor:revMode===m?colors.accent:colors.border}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:revMode===m?colors.accent:colors.text3}}>{m==='long'?'Long Take':'Hot Take'}</Text>
            </TouchableOpacity>)}
          </View>

          {revMode==='long'?<View style={{gap:6}}>
            <Text style={[type.label,{marginBottom:2}]}>Overall thoughts</Text>
            <TextInput style={[inp,{height:80,textAlignVertical:'top'}]} multiline placeholder="What did you make of it?" placeholderTextColor={colors.text3} value={overall} onChangeText={setOverall}/>
            <Text style={[type.label,{marginTop:8,marginBottom:2}]}>Best thing about it</Text>
            <TextInput style={[inp,{height:60,textAlignVertical:'top'}]} multiline placeholder="The thing that's going to stick with you." placeholderTextColor={colors.text3} value={best} onChangeText={setBest}/>
            <Text style={[type.label,{marginTop:8,marginBottom:2}]}>Who should read this</Text>
            <TextInput style={[inp,{height:60,textAlignVertical:'top'}]} multiline placeholder="Recommend it to someone specific. Be honest." placeholderTextColor={colors.text3} value={forWhom} onChangeText={setForWhom}/>
            <TouchableOpacity style={btn} onPress={postReview}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Post Long Take</Text></TouchableOpacity>
          </View>:<View style={{gap:6}}>
            <TextInput style={[inp,{height:70,textAlignVertical:'top'}]} multiline maxLength={140} placeholder={hotPh} placeholderTextColor={colors.text3} value={hot} onChangeText={setHot}/>
            <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,textAlign:'right'}}>{140-hot.length}</Text>
            <TouchableOpacity style={btn} onPress={postReview}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Post Hot Take</Text></TouchableOpacity>
          </View>}
          {revSaved&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.accent,marginTop:10,textAlign:'center'}}>Review saved</Text>}
        </View>}

        {/* JOURNAL */}
        {tab==='journal'&&<View style={{padding:spacing.lg}}>
          {sh==='reading'&&<View style={{marginBottom:spacing.lg}}>
            <Text style={[type.label,{marginBottom:10}]}>Progress</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8}}>
              <View style={{flex:1,height:4,backgroundColor:colors.surface2,overflow:'hidden'}}><View style={{width:`${pct}%`,height:4,backgroundColor:colors.accent}}/></View>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{pct}%</Text>
            </View>
            {j&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:spacing.md}}>Currently on p.{j.page} of {total}</Text>}
            <View style={{gap:8}}>
              <TextInput style={inp} placeholder="Current page" placeholderTextColor={colors.text3} value={journalPage} onChangeText={setJournalPage} keyboardType="numeric"/>
              <TextInput style={[inp,{height:72,textAlignVertical:'top'}]} placeholder="Note (optional)" placeholderTextColor={colors.text3} value={journalNote} onChangeText={setJournalNote} multiline/>
              <TouchableOpacity style={btn} onPress={saveJournalEntry}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Update Progress</Text></TouchableOpacity>
            </View>
          </View>}
          {(j?.entries||[]).length>0&&<View>
            <Text style={[type.label,{marginBottom:10}]}>Reading Log</Text>
            {[...(j?.entries||[])].reverse().map((e,i)=><View key={i} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{e.date}</Text><Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent}}>p.{e.page}</Text></View>
              {e.note?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,lineHeight:17}}>{e.note}</Text>:null}
            </View>)}
          </View>}
          {(!j||!(j.entries||[]).length)&&sh!=='reading'&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>No journal entries yet.</Text>}
        </View>}

        {/* REREADS */}
        {tab==='rereads'&&<View style={{padding:spacing.lg}}>
          {rr.length>0&&<View style={{marginBottom:spacing.lg}}>
            <Text style={[type.label,{marginBottom:10}]}>Read History</Text>
            {rr.map((e,i)=><View key={i} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Read #{i+1} · {e.date}</Text><Text style={{fontSize:12,color:colors.accent}}>{'★'.repeat(e.rating)}</Text></View>
              {e.note?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>{e.note}</Text>:null}
            </View>)}
          </View>}
          {sh==='read'&&<View>
            <Text style={[type.label,{marginBottom:10}]}>Log a Re-read</Text>
            {!showRrForm&&<TouchableOpacity style={[btn,{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border}]} onPress={()=>setShowRrForm(true)}><Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>+ Log a Re-read</Text></TouchableOpacity>}
            {showRrForm&&<View style={{gap:8}}>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:4}}>Rating</Text>
              <View style={{flexDirection:'row',gap:8}}>{[1,2,3,4,5].map(s=><TouchableOpacity key={s} onPress={()=>setRrRating(rrRating===s?0:s)}><Text style={{fontSize:26,color:rrRating>=s?colors.accent:colors.text3}}>★</Text></TouchableOpacity>)}</View>
              <TextInput style={[inp,{height:72,textAlignVertical:'top',marginTop:8}]} placeholder="Notes (optional)" placeholderTextColor={colors.text3} value={rrNote} onChangeText={setRrNote} multiline/>
              <TouchableOpacity style={btn} onPress={saveReread}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Save Re-read</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>setShowRrForm(false)}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,textAlign:'center',paddingVertical:4}}>Cancel</Text></TouchableOpacity>
            </View>}
          </View>}
          {sh!=='read'&&rr.length===0&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>Add to "Read" shelf to log re-reads.</Text>}
        </View>}

        <View style={{height:48}}/>
      </ScrollView>

      <AuthorModal author={authorOpen} onClose={()=>setAuthorOpen(null)} onOpenBook={id=>{setAuthorOpen(null);setLocalId(id);setTab('detail');}}/>
    </SafeAreaView>
  </Modal>;
}

const pill:any={paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border};
const chip:any={paddingHorizontal:14,paddingVertical:9,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border};
const activeChip:any={backgroundColor:colors.accentDim,borderColor:colors.accent};
const inp:any={fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10};
const btn:any={backgroundColor:colors.accent,padding:13,alignItems:'center',marginTop:6};
const metaK:any={fontFamily:fonts.sans,fontSize:12,color:colors.text3,width:96};
const metaV:any={fontFamily:fonts.sans,fontSize:12,color:colors.text2,flex:1};
