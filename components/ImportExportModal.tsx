import React,{useState} from 'react';
import {Modal,View,Text,TouchableOpacity,TextInput,ScrollView,SafeAreaView,StatusBar,Alert,Platform} from 'react-native';
import {colors,spacing} from '../constants/theme';
import {useStore} from '../store';
import {BOOKS} from '../data/books';
import type {Book} from '../data/books';

const SAMPLE_CSV=`Title,Author,My Rating,Exclusive Shelf,Date Read
Normal People,Sally Rooney,5,read,2024/03/15
The Road,Cormac McCarthy,4,read,2024/01/20
Intermezzo,Sally Rooney,0,to-read,
Pachinko,Min Jin Lee,5,read,2023/11/02`;

interface Props { visible:boolean; onClose:()=>void; }
interface Preview { title:string;author:string;shelf:string;rating:number; }

export default function ImportExportModal({visible,onClose}:Props){
  const {shelf,ratings,rereads,customBooks,setCustomBooks,setShelf,setRating}=useStore();
  const [tab,setTab]=useState<'export'|'import'>('export');
  const [csv,setCsv]=useState('');
  const [preview,setPreview]=useState<Preview[]|null>(null);
  const [imported,setImported]=useState(false);

  const allBooks=[...BOOKS,...(customBooks||[])];

  function doExport(){
    const data={
      shelf,ratings,rereads,
      customBooks:customBooks||[],
      exportDate:new Date(2026,5,9).toISOString(),
      version:1,
    };
    const json=JSON.stringify(data,null,2);
    // On web/RN we show the data in an alert for copying
    Alert.alert('Export Data','Copy the JSON below and save it somewhere safe.\n\n'+json.slice(0,300)+'...',[{text:'OK'}]);
  }

  function parseCSV(){
    const lines=csv.trim().split('\n');
    if(lines.length<2){ Alert.alert('Error','Paste a valid Goodreads CSV'); return; }
    const rows:Preview[]=[];
    for(let i=1;i<lines.length;i++){
      const parts=lines[i].split(',');
      if(parts.length<4) continue;
      const title=parts[0]?.replace(/^"|"$/g,'').trim();
      const author=parts[1]?.replace(/^"|"$/g,'').trim();
      const rat=parseInt(parts[2])||0;
      const rawShelf=parts[3]?.replace(/^"|"$/g,'').trim()||'want';
      const shelfMap:Record<string,string>={'read':'read','currently-reading':'reading','to-read':'want'};
      const sh=shelfMap[rawShelf]||'want';
      if(title) rows.push({title,author,shelf:sh,rating:rat});
    }
    setPreview(rows);
  }

  function confirmImport(){
    if(!preview) return;
    const existing=customBooks||[];
    const existIds=new Set([...BOOKS.map(b=>b.id),...existing.map(b=>b.id)]);
    const newBooks:Book[]=[];
    preview.forEach((p,i)=>{
      const id='import-'+Date.now()+'-'+i;
      if(!existIds.has(id)){
        newBooks.push({id,title:p.title,author:p.author,year:0,genres:[],synopsis:'',avgRating:0,readers:0,dist:[0,0,0,0,0],takes:[],ci:Date.now()+i,isCustom:true,pages:280});
        setShelf(id,p.shelf as any);
        if(p.rating>0) setRating(id,p.rating);
      }
    });
    setCustomBooks([...existing,...newBooks]);
    setImported(true);
    setPreview(null);
    setTimeout(()=>setImported(false),3000);
  }

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontSize:14,color:colors.text,fontWeight:'600'}}>Import / Export</Text>
      </View>
      <View style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border}}>
        {(['export','import'] as const).map(t=><TouchableOpacity key={t} onPress={()=>setTab(t)}
          style={{flex:1,paddingVertical:11,alignItems:'center',borderBottomWidth:2,borderBottomColor:tab===t?colors.accent:'transparent'}}>
          <Text style={{fontSize:12,color:tab===t?colors.accent:colors.text3,textTransform:'capitalize'}}>{t}</Text>
        </TouchableOpacity>)}
      </View>

      <ScrollView contentContainerStyle={{padding:spacing.lg}} showsVerticalScrollIndicator={false}>
        {tab==='export'&&<View style={{gap:12}}>
          <Text style={{fontSize:13,color:colors.text2,lineHeight:20}}>Export your Verso data as JSON. You can re-import it later or keep it as a backup.</Text>
          <View style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:14,gap:6}}>
            <Text style={{fontSize:12,color:colors.text3}}>📚 {allBooks.filter(b=>shelf[b.id]).length} books on shelf</Text>
            <Text style={{fontSize:12,color:colors.text3}}>⭐ {Object.keys(ratings).length} ratings</Text>
            <Text style={{fontSize:12,color:colors.text3}}>🔁 {Object.values(rereads).flat().length} re-reads logged</Text>
            <Text style={{fontSize:12,color:colors.text3}}>📝 {customBooks?.length||0} custom books</Text>
          </View>
          <TouchableOpacity style={{backgroundColor:colors.accent,padding:14,alignItems:'center'}} onPress={doExport}>
            <Text style={{color:colors.bg,fontSize:13,fontWeight:'600'}}>Export as JSON</Text>
          </TouchableOpacity>
        </View>}

        {tab==='import'&&<View style={{gap:12}}>
          {imported&&<View style={{backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,padding:12}}>
            <Text style={{fontSize:13,color:colors.accent,textAlign:'center'}}>✓ Books imported successfully!</Text>
          </View>}
          <Text style={{fontSize:13,color:colors.text2,lineHeight:20}}>Export your Goodreads library as CSV (Account → Settings → Export Library), then paste it below.</Text>
          <TouchableOpacity onPress={()=>setCsv(SAMPLE_CSV)} style={{paddingVertical:8}}>
            <Text style={{fontSize:11,color:colors.accent}}>Load sample CSV to preview →</Text>
          </TouchableOpacity>
          <TextInput style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:11,paddingHorizontal:12,paddingVertical:10,height:120,textAlignVertical:'top',fontFamily:Platform.OS==='ios'?'Courier':'monospace'}}
            placeholder={SAMPLE_CSV.split('\n').slice(0,3).join('\n')+'…'} placeholderTextColor={colors.text3}
            value={csv} onChangeText={setCsv} multiline/>
          <TouchableOpacity style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,padding:14,alignItems:'center'}} onPress={parseCSV}>
            <Text style={{color:colors.text,fontSize:13}}>Preview Import</Text>
          </TouchableOpacity>
          {preview&&<View>
            <Text style={sec}>{preview.length} books found</Text>
            {preview.slice(0,8).map((p,i)=><View key={i} style={{paddingVertical:8,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <Text style={{fontSize:12,color:colors.text,fontWeight:'600'}} numberOfLines={1}>{p.title}</Text>
              <Text style={{fontSize:11,color:colors.text3}}>{p.author} · {p.shelf}{p.rating>0?` · ${p.rating}★`:''}</Text>
            </View>)}
            {preview.length>8&&<Text style={{fontSize:11,color:colors.text3,paddingVertical:6}}>… and {preview.length-8} more</Text>}
            <TouchableOpacity style={{backgroundColor:colors.accent,padding:14,alignItems:'center',marginTop:12}} onPress={confirmImport}>
              <Text style={{color:colors.bg,fontSize:13,fontWeight:'600'}}>Import {preview.length} Books</Text>
            </TouchableOpacity>
          </View>}
        </View>}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
const sec:any={fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:8};
