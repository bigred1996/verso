import React,{useState,useRef} from 'react';
import {Modal,View,Text,TextInput,TouchableOpacity,ScrollView,SafeAreaView,StatusBar,ActivityIndicator} from 'react-native';
import {colors,spacing} from '../constants/theme';
import {useStore} from '../store';
import type {Book} from '../data/books';
import BookCover from './BookCover';

interface Props { visible:boolean; onClose:()=>void; }
interface OLDoc { key:string;title:string;author_name?:string[];first_publish_year?:number;number_of_pages_median?:number;cover_i?:number; }

export default function AddBookModal({visible,onClose}:Props){
  const {addCustomBook}=useStore();
  const [tab,setTab]=useState<'search'|'manual'>('search');
  const [q,setQ]=useState('');
  const [loading,setLoading]=useState(false);
  const [results,setResults]=useState<OLDoc[]>([]);
  const [added,setAdded]=useState<Set<string>>(new Set());
  const timer=useRef<any>(null);

  // Manual form
  const [mTitle,setMTitle]=useState('');
  const [mAuthor,setMAuthor]=useState('');
  const [mYear,setMYear]=useState('');
  const [mPages,setMPages]=useState('');
  const [mGenre,setMGenre]=useState('');
  const [mISBN,setMISBN]=useState('');
  const [manualDone,setManualDone]=useState(false);

  function handleSearch(text:string){
    setQ(text);
    if(timer.current) clearTimeout(timer.current);
    if(!text.trim()){ setResults([]); return; }
    timer.current=setTimeout(async()=>{
      setLoading(true);
      try{
        const url=`https://openlibrary.org/search.json?q=${encodeURIComponent(text)}&limit=10&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i`;
        const r=await fetch(url);
        const data=await r.json();
        setResults(data.docs||[]);
      }catch(e){ setResults([]); }
      setLoading(false);
    },450);
  }

  function addOLBook(doc:OLDoc){
    const id='ol-'+doc.key.replace('/works/','');
    if(added.has(id)) return;
    const book:Book={
      id, title:doc.title,
      author:doc.author_name?doc.author_name[0]:'Unknown',
      year:doc.first_publish_year||0,
      genres:[], synopsis:'',
      avgRating:0, readers:0, dist:[0,0,0,0,0],
      takes:[], ci:Date.now(),
      olCoverId:doc.cover_i||null,
      pages:doc.number_of_pages_median||280,
      isCustom:true,
    };
    addCustomBook(book);
    setAdded(s=>new Set([...s,id]));
  }

  function addManual(){
    if(!mTitle.trim()||!mAuthor.trim()) return;
    const id='custom-'+Date.now();
    const book:Book={
      id, title:mTitle.trim(), author:mAuthor.trim(),
      year:parseInt(mYear)||0,
      genres:mGenre?[mGenre]:[],
      synopsis:'', avgRating:0, readers:0, dist:[0,0,0,0,0],
      takes:[], ci:Date.now(),
      pages:parseInt(mPages)||280,
      isCustom:true,
    };
    addCustomBook(book);
    setMTitle(''); setMAuthor(''); setMYear(''); setMPages(''); setMGenre(''); setMISBN('');
    setManualDone(true);
    setTimeout(()=>setManualDone(false),2000);
  }

  function close(){
    setQ(''); setResults([]); setTab('search');
    onClose();
  }

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={close} style={{paddingRight:16}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontSize:14,color:colors.text,fontWeight:'600'}}>Add a Book</Text>
      </View>
      <View style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border}}>
        {(['search','manual'] as const).map(t=><TouchableOpacity key={t} onPress={()=>setTab(t)}
          style={{flex:1,paddingVertical:11,alignItems:'center',borderBottomWidth:2,borderBottomColor:tab===t?colors.accent:'transparent'}}>
          <Text style={{fontSize:12,color:tab===t?colors.accent:colors.text3}}>{t==='search'?'Search Open Library':'Add Manually'}</Text>
        </TouchableOpacity>)}
      </View>

      {tab==='search'&&<View style={{flex:1}}>
        <View style={{padding:spacing.lg,paddingBottom:8}}>
          <TextInput style={inp} placeholder="Search by title or author…" placeholderTextColor={colors.text3} value={q} onChangeText={handleSearch} autoCorrect={false} autoCapitalize="none"/>
        </View>
        {loading&&<ActivityIndicator color={colors.accent} style={{marginTop:spacing.lg}}/>}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:32}}>
          {results.map((doc,i)=>{
            const id='ol-'+doc.key.replace('/works/','');
            const isAdded=added.has(id);
            return <View key={doc.key} style={{flexDirection:'row',padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border,gap:12,alignItems:'center'}}>
              {doc.cover_i?<BookCover bookId={id} size="sm" olCoverId={doc.cover_i}/>:
                <View style={{width:40,height:56,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:18,color:colors.text3}}>📖</Text>
                </View>}
              <View style={{flex:1}}>
                <Text style={{fontSize:13,color:colors.text,fontWeight:'600',marginBottom:2}} numberOfLines={2}>{doc.title}</Text>
                <Text style={{fontSize:11,color:colors.text3}}>{doc.author_name?.[0]||'Unknown'}{doc.first_publish_year?` · ${doc.first_publish_year}`:''}</Text>
                {doc.number_of_pages_median?<Text style={{fontSize:10,color:colors.text3,marginTop:2}}>{doc.number_of_pages_median} pages</Text>:null}
              </View>
              <TouchableOpacity onPress={()=>addOLBook(doc)}
                style={{paddingHorizontal:14,paddingVertical:8,backgroundColor:isAdded?colors.surface2:colors.accent,borderWidth:1,borderColor:isAdded?colors.border:colors.accent}}>
                <Text style={{fontSize:12,color:isAdded?colors.text3:colors.bg,fontWeight:'600'}}>{isAdded?'Added':'+ Add'}</Text>
              </TouchableOpacity>
            </View>;
          })}
          {!loading&&q.trim()&&results.length===0&&<View style={{padding:spacing.xl,alignItems:'center'}}>
            <Text style={{fontSize:13,color:colors.text3}}>No results found.</Text>
          </View>}
        </ScrollView>
      </View>}

      {tab==='manual'&&<ScrollView style={{flex:1}} contentContainerStyle={{padding:spacing.lg,gap:10}}>
        {manualDone&&<View style={{backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,padding:12,marginBottom:8}}>
          <Text style={{fontSize:13,color:colors.accent,textAlign:'center'}}>✓ Book added to your library</Text>
        </View>}
        <Text style={{fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:4}}>Title *</Text>
        <TextInput style={inp} placeholder="Book title" placeholderTextColor={colors.text3} value={mTitle} onChangeText={setMTitle}/>
        <Text style={{fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginTop:10,marginBottom:4}}>Author *</Text>
        <TextInput style={inp} placeholder="Author name" placeholderTextColor={colors.text3} value={mAuthor} onChangeText={setMAuthor}/>
        <View style={{flexDirection:'row',gap:10,marginTop:10}}>
          <View style={{flex:1}}>
            <Text style={{fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:4}}>Year</Text>
            <TextInput style={inp} placeholder="2024" placeholderTextColor={colors.text3} value={mYear} onChangeText={setMYear} keyboardType="numeric"/>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:4}}>Pages</Text>
            <TextInput style={inp} placeholder="280" placeholderTextColor={colors.text3} value={mPages} onChangeText={setMPages} keyboardType="numeric"/>
          </View>
        </View>
        <Text style={{fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginTop:10,marginBottom:4}}>Genre</Text>
        <TextInput style={inp} placeholder="Literary Fiction, etc." placeholderTextColor={colors.text3} value={mGenre} onChangeText={setMGenre}/>
        <TouchableOpacity style={{backgroundColor:colors.accent,padding:14,alignItems:'center',marginTop:16}} onPress={addManual}>
          <Text style={{color:colors.bg,fontSize:13,fontWeight:'600'}}>Add to Library</Text>
        </TouchableOpacity>
        <View style={{height:40}}/>
      </ScrollView>}
    </SafeAreaView>
  </Modal>;
}

const inp:any={backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10};
