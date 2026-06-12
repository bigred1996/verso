import React,{useState,useEffect} from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,TextInput,SafeAreaView,StatusBar,Platform,Share} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {colors,spacing,fonts,type,radius,shadow} from '../constants/theme';
import {BOOKS,PAGE_COUNTS,AUTHOR_DATA,BOOK_TAGS,FRIEND_BOOK,FRIENDS,BOOK_VIBES,BOOK_QUOTES} from '../data/books';
import type {ShelfStatus,Format} from '../data/books';
import {useStore,MOODS,PACES,DNF_REASONS} from '../store';
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
  const {shelf,ratings,formats,rereads,journal,userTags,reviews,buddyReads,favorites,dnfReasons,bookMoods,lists,customBooks,setShelf,setRating,setFormat,addReread,updateJournal,addJournalEntry,setUserTags,setReview,startBuddyRead,endBuddyRead,toggleFavorite,setDnfReason,setBookMoods,toggleListBook}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  const [localId,setLocalId]=useState<string|null>(bookId);
  useEffect(()=>{ setLocalId(bookId); },[bookId]);
  const activeId=localId||bookId;
  const book=activeId?all.find(b=>b.id===activeId):null;

  const [tab,setTab]=useState<'about'|'reviews'|'shelf'>('about');
  const [journalPage,setJournalPage]=useState('');
  const [journalNote,setJournalNote]=useState('');
  const [rrRating,setRrRating]=useState(0);
  const [rrNote,setRrNote]=useState('');
  const [showRrForm,setShowRrForm]=useState(false);
  const [tagInput,setTagInput]=useState('');
  const [shareFeedback,setShareFeedback]=useState<string|null>(null);
  const [revMode,setRevMode]=useState<'long'|'hot'>('hot');
  const [hot,setHot]=useState('');
  const [overall,setOverall]=useState('');
  const [best,setBest]=useState('');
  const [forWhom,setForWhom]=useState('');
  const [revSaved,setRevSaved]=useState(false);
  const [authorOpen,setAuthorOpen]=useState<string|null>(null);
  const [buddyPicking,setBuddyPicking]=useState(false);
  const [feelMoods,setFeelMoods]=useState<string[]>([]);
  const [feelPace,setFeelPace]=useState<string|null>(null);
  const [dnfPage,setDnfPage]=useState('');

  useEffect(()=>{
    const r=activeId?reviews[activeId]:null;
    setHot(r?.hotTake||''); setOverall(r?.overall||''); setBest(r?.best||''); setForWhom(r?.forWhom||'');
    const bm=activeId?bookMoods[activeId]:null;
    setFeelMoods(bm?.moods||[]); setFeelPace(bm?.pace||null);
    setDnfPage('');
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
  const vibe=BOOK_VIBES[bid];
  const isFav=favorites.includes(bid);
  const dnfInfo=dnfReasons[bid];
  const total=PAGE_COUNTS[bid]||book.pages||280;
  const paceIdx=vibe?PACES.indexOf(vibe.pace):-1;
  const bookQuotes=BOOK_QUOTES[bid]||[];
  const hasAuthorPage=!!AUTHOR_DATA[book.author]||all.filter(b=>b.author===book.author).length>1;
  const TODAY_LABEL=()=>{const d=new Date(2026,5,9);return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate();};
  const pct=j?Math.min(100,Math.round(j.page/total*100)):0;

  function toggleFeel(m:string){ setFeelMoods(p=>p.includes(m)?p.filter(x=>x!==m):p.length>=3?p:[...p,m]); }
  function saveFeel(){ setBookMoods(bid,feelMoods,feelPace||''); }

  function Star({n,value,onPress,size=28}:{n:number;value:number;onPress:(v:number)=>void;size?:number}){
    const fill=value>=n?1:value>=n-0.5?0.5:0;
    return <TouchableOpacity onPress={()=>onPress(value===n?n-0.5:value===n-0.5?0:n)} style={{padding:2}}>
      <View>
        <Text style={{fontSize:size,color:colors.text3}}>★</Text>
        {fill>0&&<View style={{position:'absolute',overflow:'hidden',width:fill===1?'100%':'50%'}}>
          <Text style={{fontSize:size,color:colors.accent}}>★</Text>
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
      <StatusBar barStyle="dark-content"/>

      {/* Header */}
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:15,color:colors.text}} numberOfLines={1}>{book.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO CARD ── */}
        <View style={[card,{marginTop:spacing.md}]}>
          <View style={{flexDirection:'row',gap:16,marginBottom:14}}>
            <BookCover bookId={bid} size="md"/>
            <View style={{flex:1}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:19,color:colors.text,lineHeight:25,marginBottom:4}}>{book.title}</Text>
              <TouchableOpacity disabled={!hasAuthorPage} onPress={()=>setAuthorOpen(book.author)}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:hasAuthorPage?colors.accent:colors.text2,marginBottom:2}}>
                  {book.author}{hasAuthorPage?'  ›':''}
                </Text>
              </TouchableOpacity>
              {book.year?<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginBottom:8}}>{book.year}</Text>:null}
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:5,marginBottom:10}}>
                {book.genres.map(g=><View key={g} style={pill}><Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{g}</Text></View>)}
              </View>
              {book.readers>0&&<View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:24,color:colors.accent,lineHeight:26}}>{book.avgRating}</Text>
                <View>
                  <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>{'★'.repeat(Math.round(book.avgRating))}{'☆'.repeat(5-Math.round(book.avgRating))}</Text>
                  <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{book.readers.toLocaleString()} readers</Text>
                </View>
              </View>}
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:3}}>{total} pages</Text>
            </View>
          </View>

          {/* Favourite + your rating */}
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:12,borderTopWidth:1,borderTopColor:colors.border}}>
            <TouchableOpacity onPress={()=>toggleFavorite(bid)} style={{flexDirection:'row',alignItems:'center',gap:6}}>
              <Text style={{fontSize:18,color:isFav?colors.accent:colors.text3}}>{isFav?'♥':'♡'}</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:isFav?colors.accent:colors.text3}}>{isFav?'Favourite':'Favourite'}</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{rat?`${rat}★`:'Rate'}</Text>
              <View style={{flexDirection:'row'}}>{[1,2,3,4,5].map(s=><Star key={s} n={s} value={rat||0} size={22} onPress={v=>setRating(bid,v)}/>)}</View>
            </View>
          </View>
        </View>

        {/* ── TAB BAR ── */}
        <View style={{flexDirection:'row',paddingHorizontal:spacing.lg,paddingBottom:4,paddingTop:4,gap:6}}>
          {(['about','reviews','shelf'] as const).map(k=><TouchableOpacity key={k} onPress={()=>setTab(k)}
            style={{flex:1,paddingVertical:9,alignItems:'center',borderRadius:radius.pill,
              backgroundColor:tab===k?colors.accent:colors.surface,borderWidth:1,
              borderColor:tab===k?colors.accent:colors.border,...(tab===k?{}:shadow.soft)}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:tab===k?colors.accentText:colors.text3}}>
              {k==='about'?'About':k==='reviews'?'Reviews':'My Shelf'}
            </Text>
          </TouchableOpacity>)}
        </View>

        {/* ══════════════════════════════════
            ABOUT TAB — all public book info
            ══════════════════════════════════ */}
        {tab==='about'&&<>

          {/* Synopsis */}
          <View style={card}>
            <Text style={secTitle}>About this Book</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:24}}>{book.synopsis}</Text>
          </View>

          {/* Quotes from the pages */}
          {bookQuotes.length>0&&<View style={card}>
            <Text style={secTitle}>From the Pages</Text>
            {bookQuotes.map((q,i)=><View key={i} style={{paddingLeft:14,borderLeftWidth:3,borderLeftColor:colors.accentDim,marginBottom:i<bookQuotes.length-1?18:0}}>
              <Text style={{fontFamily:fonts.serifItalic,fontSize:15,color:colors.text,lineHeight:24,marginBottom:q.ctx?5:0}}>"{q.q}"</Text>
              {q.ctx?<Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3}}>— {q.ctx}</Text>:null}
            </View>)}
          </View>}

          {/* Community Vibe */}
          {vibe&&<View style={card}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}>
              <Text style={secTitle}>The Vibe</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{vibe.weekly.toLocaleString()} reading this week</Text>
            </View>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:16}}>
              {vibe.moods.map((m,i)=><View key={m} style={{paddingHorizontal:11,paddingVertical:5,backgroundColor:i<3?colors.accentDim:colors.surface2,borderWidth:1,borderColor:i<3?'rgba(61,107,72,0.4)':colors.border,borderRadius:999}}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:i<3?colors.accent:colors.text3}}>{m}</Text>
              </View>)}
            </View>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3,marginBottom:6}}>Pace</Text>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>slow burn</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>propulsive</Text>
            </View>
            <View style={{height:16,justifyContent:'center',marginBottom:14}}>
              <View style={{height:4,backgroundColor:colors.surface2,borderRadius:2}}/>
              <View style={{position:'absolute',left:`${paceIdx===0?8:paceIdx===1?50:88}%` as any,marginLeft:-6,top:2,width:12,height:12,borderRadius:6,backgroundColor:colors.accent,...shadow.soft}}/>
            </View>
            {vibe.vibes.length>0&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
              {vibe.vibes.map(v=><Text key={v} style={{fontFamily:fonts.serifItalic,fontSize:13,color:colors.text2}}>"{v}"</Text>)}
            </View>}
          </View>}

          {/* Tropes & Themes */}
          {meta&&<View style={card}>
            <Text style={secTitle}>Tropes & Themes</Text>
            {meta.tropes.length>0&&<>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginBottom:8}}>Tropes</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:16}}>
                {meta.tropes.map(t=><View key={t} style={{paddingHorizontal:11,paddingVertical:5,backgroundColor:colors.accentDim,borderWidth:1,borderColor:'rgba(61,107,72,0.35)',borderRadius:999}}><Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent}}>{t}</Text></View>)}
              </View>
            </>}
            {meta.themes.length>0&&<>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginBottom:8}}>Themes</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
                {meta.themes.map(t=><View key={t} style={pill}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{t}</Text></View>)}
              </View>
            </>}
          </View>}

          {/* Form & Setting */}
          {meta&&<View style={card}>
            <Text style={secTitle}>Form & Setting</Text>
            <View style={{gap:12}}>
              <View style={{flexDirection:'row'}}><Text style={metaK}>Subgenre</Text><Text style={metaV}>{meta.subgenres.join(' · ')}</Text></View>
              <View style={{flexDirection:'row'}}><Text style={metaK}>Perspective</Text><Text style={metaV}>{meta.perspective}</Text></View>
              <View style={{flexDirection:'row'}}><Text style={metaK}>Setting</Text><Text style={metaV}>{meta.setting}</Text></View>
            </View>
          </View>}

          {/* Content Warnings */}
          {meta&&meta.cw.length>0&&<View style={card}>
            <Text style={secTitle}>Content Warnings</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
              {meta.cw.map(c=><View key={c} style={{paddingHorizontal:10,paddingVertical:5,borderWidth:1,borderColor:'rgba(166,90,90,0.4)',borderRadius:6}}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:'#C97B7B'}}>{c}</Text>
              </View>)}
            </View>
          </View>}

        </>}

        {/* ══════════════════════════════════
            REVIEWS TAB — public reviews + write your own
            ══════════════════════════════════ */}
        {tab==='reviews'&&<>

          {/* Your saved review at top */}
          {savedReview&&(savedReview.hotTake||savedReview.overall)&&<View style={card}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <Text style={secTitle}>Your Review</Text>
              {savedReview.date&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:4}}>{savedReview.date}</Text>}
            </View>
            {rat&&<View style={{flexDirection:'row',marginBottom:12}}>
              {[1,2,3,4,5].map(s=><Text key={s} style={{fontSize:20,color:s<=Math.round(rat)?colors.accent:colors.text3}}>★</Text>)}
            </View>}
            {savedReview.hotTake?<Text style={{fontFamily:fonts.serifItalic,fontSize:16,color:colors.text,lineHeight:26,marginBottom:savedReview.overall?14:0}}>"{savedReview.hotTake}"</Text>:null}
            {savedReview.overall?<Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:23,marginBottom:10}}>{savedReview.overall}</Text>:null}
            {savedReview.best?<View style={{backgroundColor:colors.surface2,padding:12,borderRadius:radius.md,marginBottom:8}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginBottom:4}}>Best thing</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20}}>{savedReview.best}</Text>
            </View>:null}
            {savedReview.forWhom?<View style={{backgroundColor:colors.surface2,padding:12,borderRadius:radius.md}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginBottom:4}}>Read if you</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20}}>{savedReview.forWhom}</Text>
            </View>:null}
          </View>}

          {/* Community rating distribution */}
          {book.dist.some(d=>d>0)&&<View style={card}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <Text style={secTitle}>Community Rating</Text>
              <View style={{alignItems:'flex-end'}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:28,color:colors.accent,lineHeight:30}}>{book.avgRating}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{book.readers.toLocaleString()} ratings</Text>
              </View>
            </View>
            {[5,4,3,2,1].map((star,i)=>{const count=book.dist[4-i]||0;const t2=book.dist.reduce((a,b)=>a+b,0)||1;const p2=Math.round(count/t2*100);
              return <View key={star} style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:8}}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text3,width:24}}>{star}★</Text>
                <View style={{flex:1,height:6,backgroundColor:colors.surface2,borderRadius:3,overflow:'hidden'}}>
                  <View style={{width:`${p2}%` as any,height:6,backgroundColor:colors.accent,borderRadius:3}}/>
                </View>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,width:36,textAlign:'right'}}>{p2}%</Text>
              </View>;})}
          </View>}

          {/* Verso community takes */}
          {book.takes.length>0&&<View style={card}>
            <Text style={secTitle}>Verso Takes</Text>
            {book.takes.map((tk,i)=><View key={i} style={{paddingLeft:14,borderLeftWidth:3,borderLeftColor:colors.accentDim,marginBottom:i<book.takes.length-1?16:0}}>
              <Text style={{fontFamily:fonts.serifItalic,fontSize:15,color:colors.text,lineHeight:23,marginBottom:5}}>"{tk.t}"</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3}}>— {tk.u}</Text>
            </View>)}
          </View>}

          {/* Friends on this book */}
          {friendIds.length>0&&<View style={card}>
            <Text style={secTitle}>Friends on This Book</Text>
            {friendIds.map((fid,idx)=>{const f=FRIENDS.find(x=>x.id===fid);const ft=friendTakes[fid];if(!f)return null;
              return <View key={fid} style={{flexDirection:'row',gap:12,paddingVertical:12,borderTopWidth:idx>0?1:0,borderTopColor:colors.border}}>
                <View style={{width:38,height:38,borderRadius:19,backgroundColor:f.color+'22',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:f.color}}>{f.init}</Text>
                </View>
                <View style={{flex:1}}>
                  <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:4}}>
                    <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>{f.name.split(' ')[0]}</Text>
                    <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.accent}}>{'★'.repeat(ft.r)}</Text>
                  </View>
                  <Text style={{fontFamily:fonts.serifItalic,fontSize:14,color:colors.text2,lineHeight:22}}>"{ft.t}"</Text>
                </View>
              </View>;})}
          </View>}

          {/* Write / update review */}
          <View style={card}>
            <Text style={secTitle}>{savedReview?.hotTake||savedReview?.overall?'Edit Your Review':'Write a Review'}</Text>
            <View style={{flexDirection:'row',gap:6,marginBottom:spacing.md}}>
              {(['hot','long'] as const).map(m=><TouchableOpacity key={m} onPress={()=>setRevMode(m)}
                style={{flex:1,paddingVertical:9,alignItems:'center',borderRadius:radius.pill,
                  backgroundColor:revMode===m?colors.accent:colors.surface2,borderWidth:1,borderColor:revMode===m?colors.accent:colors.border}}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:revMode===m?colors.accentText:colors.text3}}>
                  {m==='long'?'Long Take':'Hot Take'}
                </Text>
              </TouchableOpacity>)}
            </View>
            {revMode==='long'?<View style={{gap:8}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginBottom:2}}>Overall thoughts</Text>
              <TextInput style={[inp,{height:80,textAlignVertical:'top'}]} multiline placeholder="What did you make of it?" placeholderTextColor={colors.text3} value={overall} onChangeText={setOverall}/>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginTop:8,marginBottom:2}}>Best thing about it</Text>
              <TextInput style={[inp,{height:60,textAlignVertical:'top'}]} multiline placeholder="The thing that's going to stick with you." placeholderTextColor={colors.text3} value={best} onChangeText={setBest}/>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginTop:8,marginBottom:2}}>Who should read this</Text>
              <TextInput style={[inp,{height:60,textAlignVertical:'top'}]} multiline placeholder="Recommend it to someone specific. Be honest." placeholderTextColor={colors.text3} value={forWhom} onChangeText={setForWhom}/>
              <TouchableOpacity style={btn} onPress={postReview}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.accentText}}>Post Long Take</Text></TouchableOpacity>
            </View>:<View style={{gap:6}}>
              <TextInput style={[inp,{height:70,textAlignVertical:'top'}]} multiline maxLength={140} placeholder={hotPh} placeholderTextColor={colors.text3} value={hot} onChangeText={setHot}/>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,textAlign:'right'}}>{140-hot.length} remaining</Text>
              <TouchableOpacity style={btn} onPress={postReview}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.accentText}}>Post Hot Take</Text></TouchableOpacity>
            </View>}
            {revSaved&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.accent,marginTop:10,textAlign:'center'}}>✓ Review saved</Text>}
          </View>

        </>}

        {/* ══════════════════════════════════
            SHELF TAB — all personal/private actions
            ══════════════════════════════════ */}
        {tab==='shelf'&&<>

          {/* Shelf status */}
          <View style={card}>
            <Text style={secTitle}>Your Shelf</Text>
            <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
              {SHELF_OPTS.map(o=>{const active=sh===o.k;return <TouchableOpacity key={o.l} onPress={()=>setShelf(bid,active?null:o.k)}
                style={[chip,active&&activeChip]}><Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:active?colors.accent:colors.text2}}>{o.l}</Text></TouchableOpacity>;})}
            </View>
          </View>

          {/* Format */}
          {(sh==='reading'||sh==='read'||sh==='dnf')&&<View style={card}>
            <Text style={secTitle}>Format</Text>
            <View style={{flexDirection:'row',gap:8}}>
              {FORMAT_OPTS.map(o=>{const active=fmt===o.k;return <TouchableOpacity key={o.k} onPress={()=>setFormat(bid,active?null:o.k)}
                style={[chip,active&&activeChip]}><Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:active?colors.accent:colors.text2}}>{o.l}</Text></TouchableOpacity>;})}
            </View>
          </View>}

          {/* How did it feel? */}
          {!!rat&&<View style={card}>
            <Text style={secTitle}>How Did It Feel?</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,lineHeight:18,marginBottom:14}}>Pick up to 3 moods + a pace. Your input shapes the community vibe for everyone.</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:12}}>
              {MOODS.map(m=><TouchableOpacity key={m} onPress={()=>toggleFeel(m)} style={[chip,feelMoods.includes(m)&&activeChip,{paddingHorizontal:11,paddingVertical:7}]}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:feelMoods.includes(m)?colors.accent:colors.text3}}>{m}</Text>
              </TouchableOpacity>)}
            </View>
            <View style={{flexDirection:'row',gap:6,marginBottom:14}}>
              {PACES.map(p=><TouchableOpacity key={p} onPress={()=>setFeelPace(feelPace===p?null:p)} style={[chip,feelPace===p&&activeChip,{paddingHorizontal:11,paddingVertical:7}]}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:feelPace===p?colors.accent:colors.text3}}>{p}</Text>
              </TouchableOpacity>)}
            </View>
            <TouchableOpacity style={btn} onPress={saveFeel}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.accentText}}>Add to the tally</Text></TouchableOpacity>
            {bookMoods[bid]&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent,marginTop:10,textAlign:'center'}}>Logged: {bookMoods[bid].moods.join(', ')||'—'}{bookMoods[bid].pace?` · ${bookMoods[bid].pace}`:''}</Text>}
          </View>}

          {/* DNF reason */}
          {sh==='dnf'&&<View style={card}>
            <Text style={secTitle}>Why Did You Stop?</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:12}}>
              {DNF_REASONS.map(r=><TouchableOpacity key={r} onPress={()=>setDnfReason(bid,r,parseInt(dnfPage)||dnfInfo?.page||0)} style={[chip,dnfInfo?.reason===r&&activeChip,{paddingHorizontal:11,paddingVertical:7}]}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:dnfInfo?.reason===r?colors.accent:colors.text3}}>{r}</Text>
              </TouchableOpacity>)}
            </View>
            <TextInput style={inp} placeholder="Page you stopped on" placeholderTextColor={colors.text3} keyboardType="numeric"
              value={dnfPage||(dnfInfo?String(dnfInfo.page):'')} onChangeText={t=>{setDnfPage(t);if(dnfInfo)setDnfReason(bid,dnfInfo.reason,parseInt(t)||0);}}/>
          </View>}

          {/* Your Tags */}
          <View style={card}>
            <Text style={secTitle}>Your Tags</Text>
            {tags.length>0&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:12}}>
              {tags.map(t=><TouchableOpacity key={t} onPress={()=>removeTag(t)} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:11,paddingVertical:6,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,borderRadius:999}}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>{t}</Text>
                <Text style={{fontSize:10,color:colors.accent}}>✕</Text>
              </TouchableOpacity>)}
            </View>}
            <View style={{flexDirection:'row',gap:8}}>
              <TextInput style={[inp,{flex:1}]} placeholder="Add a tag… (e.g. comfort read)" placeholderTextColor={colors.text3} value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} returnKeyType="done"/>
              <TouchableOpacity onPress={addTag} style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,justifyContent:'center',borderRadius:12}}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lists */}
          {lists.length>0&&<View style={card}>
            <Text style={secTitle}>Add to a List</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
              {lists.map(l=>{const inList=l.bookIds.includes(bid);return <TouchableOpacity key={l.id} onPress={()=>toggleListBook(l.id,bid)}
                style={[chip,inList&&activeChip]}><Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:inList?colors.accent:colors.text2}}>{inList?'✓ ':''}{l.name}</Text></TouchableOpacity>;})}
            </View>
          </View>}

          {/* Buddy Read */}
          <View style={card}>
            <Text style={secTitle}>Buddy Read</Text>
            {buddy?(()=>{const f=FRIENDS.find(x=>x.id===buddy.partner);const myPct=Math.min(100,Math.round(buddy.myPage/total*100));const thPct=Math.min(100,Math.round(buddy.theirPage/total*100));
              return <View style={{backgroundColor:colors.surface2,padding:14,borderRadius:radius.md}}>
                <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,marginBottom:12}}>You and <Text style={{color:colors.text,fontFamily:fonts.sansMedium}}>{f?.name.split(' ')[0]}</Text> are reading together.</Text>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
                  <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>You · p.{buddy.myPage}</Text>
                  <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3}}>{f?.name.split(' ')[0]} · p.{buddy.theirPage}</Text>
                </View>
                <View style={{height:5,backgroundColor:colors.surface,borderRadius:3,marginBottom:12,overflow:'hidden'}}>
                  <View style={{position:'absolute',height:5,backgroundColor:'rgba(123,158,166,0.4)',width:`${thPct}%` as any}}/>
                  <View style={{position:'absolute',height:5,backgroundColor:colors.accent,width:`${myPct}%` as any}}/>
                </View>
                {buddy.note?<Text style={{fontFamily:fonts.serifItalic,fontSize:12,color:colors.text3,marginBottom:10}}>"{buddy.note}"</Text>:null}
                <TouchableOpacity onPress={()=>endBuddyRead(bid)}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>End buddy read</Text></TouchableOpacity>
              </View>;})():buddyPicking?<View>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,marginBottom:12}}>Who do you want to read with?</Text>
              {FRIENDS.map((f,idx)=><TouchableOpacity key={f.id} onPress={()=>{startBuddyRead(bid,f.id);setBuddyPicking(false);}}
                style={{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,borderTopWidth:idx>0?1:0,borderTopColor:colors.border}}>
                <View style={{width:36,height:36,borderRadius:18,backgroundColor:f.color+'22',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:f.color}}>{f.init}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text}}>{f.name}</Text>
                  <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{f.match}% taste match</Text>
                </View>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.accent}}>Invite →</Text>
              </TouchableOpacity>)}
              <TouchableOpacity onPress={()=>setBuddyPicking(false)} style={{marginTop:12}}>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,textAlign:'center'}}>Cancel</Text>
              </TouchableOpacity>
            </View>:<TouchableOpacity onPress={()=>setBuddyPicking(true)} style={[chip,{alignSelf:'flex-start'}]}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text2}}>+ Start a Buddy Read</Text>
            </TouchableOpacity>}
          </View>

          {/* Share */}
          <View style={card}>
            <Text style={secTitle}>Share</Text>
            <View style={{flexDirection:'row',gap:8}}>
              <TouchableOpacity onPress={doCopy} style={[chip,{flex:1,alignItems:'center'}]}><Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text2}}>Copy Link</Text></TouchableOpacity>
              <TouchableOpacity onPress={doShare} style={[chip,{flex:1,alignItems:'center'}]}><Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text2}}>Share</Text></TouchableOpacity>
            </View>
            {shareFeedback&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent,marginTop:8}}>{shareFeedback}</Text>}
          </View>

          {/* Reading Journal */}
          <View style={card}>
            <Text style={secTitle}>Reading Journal</Text>
            {sh==='reading'&&<View style={{marginBottom:16}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:8}}>
                <View style={{flex:1,height:5,backgroundColor:colors.surface2,borderRadius:3,overflow:'hidden'}}>
                  <View style={{width:`${pct}%` as any,height:5,backgroundColor:colors.accent,borderRadius:3}}/>
                </View>
                <Text style={{fontFamily:fonts.sansBold,fontSize:12,color:colors.accent,width:36}}>{pct}%</Text>
              </View>
              {j&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:12}}>Currently on p.{j.page} of {total}</Text>}
              <View style={{gap:8}}>
                <TextInput style={inp} placeholder="Current page" placeholderTextColor={colors.text3} value={journalPage} onChangeText={setJournalPage} keyboardType="numeric"/>
                <TextInput style={[inp,{height:72,textAlignVertical:'top'}]} placeholder="Note (optional)" placeholderTextColor={colors.text3} value={journalNote} onChangeText={setJournalNote} multiline/>
                <TouchableOpacity style={btn} onPress={saveJournalEntry}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.accentText}}>Update Progress</Text></TouchableOpacity>
              </View>
            </View>}
            {(j?.entries||[]).length>0?<View>
              {sh==='reading'&&<Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.8,textTransform:'uppercase',marginBottom:10}}>Reading Log</Text>}
              {[...(j?.entries||[])].reverse().map((e,i)=><View key={i} style={{paddingVertical:10,borderTopWidth:i>0?1:0,borderTopColor:colors.border}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}>
                  <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{e.date}</Text>
                  <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.accent}}>p.{e.page}</Text>
                </View>
                {e.note?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2,lineHeight:18}}>{e.note}</Text>:null}
              </View>)}
            </View>:sh!=='reading'&&<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.md}}>No journal entries yet.</Text>}
          </View>

          {/* Re-reads */}
          <View style={card}>
            <Text style={secTitle}>Re-reads</Text>
            {rr.length>0&&<View style={{marginBottom:sh==='read'?16:0}}>
              {rr.map((e,i)=><View key={i} style={{paddingVertical:10,borderTopWidth:i>0?1:0,borderTopColor:colors.border}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}>
                  <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Read #{i+1} · {e.date}</Text>
                  <Text style={{fontSize:14,color:colors.accent}}>{'★'.repeat(e.rating)}</Text>
                </View>
                {e.note?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>{e.note}</Text>:null}
              </View>)}
            </View>}
            {sh==='read'&&<>
              {!showRrForm&&<TouchableOpacity style={[btn,{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border}]} onPress={()=>setShowRrForm(true)}>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>+ Log a Re-read</Text>
              </TouchableOpacity>}
              {showRrForm&&<View style={{gap:8}}>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginBottom:4}}>Rating</Text>
                <View style={{flexDirection:'row',gap:8}}>{[1,2,3,4,5].map(s=><TouchableOpacity key={s} onPress={()=>setRrRating(rrRating===s?0:s)}><Text style={{fontSize:26,color:rrRating>=s?colors.accent:colors.text3}}>★</Text></TouchableOpacity>)}</View>
                <TextInput style={[inp,{height:72,textAlignVertical:'top',marginTop:8}]} placeholder="Notes (optional)" placeholderTextColor={colors.text3} value={rrNote} onChangeText={setRrNote} multiline/>
                <TouchableOpacity style={btn} onPress={saveReread}><Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.accentText}}>Save Re-read</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>setShowRrForm(false)}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,textAlign:'center',paddingVertical:4}}>Cancel</Text></TouchableOpacity>
              </View>}
            </>}
            {sh!=='read'&&rr.length===0&&<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,textAlign:'center',paddingVertical:spacing.md}}>Add to "Read" shelf to log re-reads.</Text>}
          </View>

        </>}

        <View style={{height:48}}/>
      </ScrollView>

      <AuthorModal author={authorOpen} onClose={()=>setAuthorOpen(null)} onOpenBook={id=>{setAuthorOpen(null);setLocalId(id);setTab('about');}}/>
    </SafeAreaView>
  </Modal>;
}

const card:any={marginHorizontal:spacing.lg,marginBottom:spacing.md,backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.lg,...shadow.soft};
const secTitle:any={fontFamily:fonts.serifBold,fontSize:17,color:colors.text,marginBottom:14};
const pill:any={paddingHorizontal:9,paddingVertical:4,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,borderRadius:999};
const chip:any={paddingHorizontal:14,paddingVertical:9,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:999};
const activeChip:any={backgroundColor:colors.accentDim,borderColor:colors.accent};
const inp:any={fontFamily:fonts.sans,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10,borderRadius:12};
const btn:any={backgroundColor:colors.accent,padding:13,alignItems:'center',marginTop:6,borderRadius:999};
const metaK:any={fontFamily:fonts.sansMedium,fontSize:12,color:colors.text3,width:96};
const metaV:any={fontFamily:fonts.sans,fontSize:12,color:colors.text2,flex:1,lineHeight:18};
