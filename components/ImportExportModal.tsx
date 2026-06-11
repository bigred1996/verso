import React,{useState} from 'react';
import {Modal,View,Text,TouchableOpacity,TextInput,ScrollView,SafeAreaView,StatusBar,Alert,Platform} from 'react-native';
import {colors,spacing,fonts,type} from '../constants/theme';
import {useStore} from '../store';
import {BOOKS} from '../data/books';
import type {Book} from '../data/books';

const SAMPLE_GOODREADS=`Title,Author,My Rating,Exclusive Shelf,Date Read
Normal People,Sally Rooney,5,read,2024/03/15
The Road,Cormac McCarthy,4,read,2024/01/20
Intermezzo,Sally Rooney,0,to-read,
Pachinko,Min Jin Lee,5,read,2023/11/02`;

const SAMPLE_STORYGRAPH=`Title,Authors,Read Status,Star Rating,Review,Tags
Stoner,John Williams,read,4.5,"Quietly devastating.",literary
Demon Copperhead,Barbara Kingsolver,read,5,"Furious and tender.",pulitzer
James,Percival Everett,currently-reading,,,""
A Little Life,Hanya Yanagihara,did-not-finish,2,"Too much.",heavy`;

interface Props { visible:boolean; onClose:()=>void; }
interface Preview { title:string;author:string;shelf:string;rating:number;review?:string;tags?:string[]; }
type Source='goodreads'|'storygraph';

// CSV line splitter that respects double-quoted fields containing commas
function splitCSVLine(line:string):string[]{
  const out:string[]=[]; let cur=''; let q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){ if(q&&line[i+1]==='"'){ cur+='"'; i++; } else q=!q; }
    else if(c===','&&!q){ out.push(cur); cur=''; }
    else cur+=c;
  }
  out.push(cur);
  return out.map(s=>s.trim());
}

const SHELF_MAP:Record<string,string>={read:'read','currently-reading':'reading','to-read':'want','did-not-finish':'dnf',dnf:'dnf'};

export default function ImportExportModal({visible,onClose}:Props){
  const {shelf,ratings,rereads,reviews,userTags,customBooks,setCustomBooks,setShelf,setRating,setReview,setUserTags}=useStore();
  const [tab,setTab]=useState<'export'|'import'>('export');
  const [source,setSource]=useState<Source>('goodreads');
  const [csv,setCsv]=useState('');
  const [preview,setPreview]=useState<Preview[]|null>(null);
  const [imported,setImported]=useState(0);

  const allBooks=[...BOOKS,...(customBooks||[])];
  const sample=source==='goodreads'?SAMPLE_GOODREADS:SAMPLE_STORYGRAPH;

  function doExport(){
    const data={shelf,ratings,rereads,reviews,userTags,customBooks:customBooks||[],exportDate:new Date(2026,5,9).toISOString(),version:2};
    const json=JSON.stringify(data,null,2);
    Alert.alert('Export Data','Copy this JSON and keep it as a backup.\n\n'+json.slice(0,300)+'…',[{text:'OK'}]);
  }

  function parseCSV(){
    const lines=csv.trim().split('\n').filter(l=>l.trim());
    if(lines.length<2){ Alert.alert('Nothing to import','Paste a valid CSV with a header row first.'); return; }
    const header=splitCSVLine(lines[0]).map(h=>h.toLowerCase());
    const col=(...names:string[])=>{ for(const n of names){ const i=header.indexOf(n); if(i>=0) return i; } return -1; };

    const iTitle=col('title');
    const iAuthor=col('authors','author');
    const iRating=col('star rating','my rating','rating');
    const iShelf=col('read status','exclusive shelf','shelf');
    const iReview=col('review');
    const iTags=col('tags');

    const rows:Preview[]=[];
    for(let i=1;i<lines.length;i++){
      const p=splitCSVLine(lines[i]);
      const title=(p[iTitle]||'').replace(/^"|"$/g,'').trim();
      if(!title) continue;
      const author=(p[iAuthor]||'').replace(/^"|"$/g,'').split(',')[0].trim();
      const rawShelf=(p[iShelf]||'').toLowerCase().trim();
      const shelf=SHELF_MAP[rawShelf]||'want';
      const rating=iRating>=0?parseFloat(p[iRating])||0:0;
      const review=iReview>=0?(p[iReview]||'').trim():'';
      const tags=iTags>=0&&p[iTags]?p[iTags].split(/[,;]/).map(t=>t.trim()).filter(Boolean):[];
      rows.push({title,author,shelf,rating,review,tags});
    }
    if(!rows.length){ Alert.alert('No rows found','Couldn\'t find a Title column. Make sure you pasted the full export.'); return; }
    setPreview(rows);
  }

  function confirmImport(){
    if(!preview) return;
    const existing=customBooks||[];
    const byTitle=new Map([...BOOKS,...existing].map(b=>[b.title.toLowerCase(),b.id]));
    const newBooks:Book[]=[];
    preview.forEach((p,i)=>{
      let id=byTitle.get(p.title.toLowerCase());
      if(!id){
        id='import-'+Date.now()+'-'+i;
        newBooks.push({id,title:p.title,author:p.author,year:0,genres:[],synopsis:'',avgRating:0,readers:0,dist:[0,0,0,0,0],takes:[],ci:Date.now()+i,isCustom:true,pages:280});
      }
      setShelf(id,p.shelf as any);
      if(p.rating>0) setRating(id,p.rating);
      if(p.review) setReview(id,{overall:p.review});
      if(p.tags&&p.tags.length) setUserTags(id,p.tags);
    });
    if(newBooks.length) setCustomBooks([...existing,...newBooks]);
    setImported(preview.length); setPreview(null); setCsv('');
    setTimeout(()=>setImported(0),3500);
  }

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="dark-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:16,color:colors.text}}>Import / Export</Text>
      </View>
      <View style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.border}}>
        {(['export','import'] as const).map(t=><TouchableOpacity key={t} onPress={()=>setTab(t)}
          style={{flex:1,paddingVertical:11,alignItems:'center',borderBottomWidth:2,borderBottomColor:tab===t?colors.accent:'transparent'}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:tab===t?colors.accent:colors.text3,textTransform:'capitalize'}}>{t}</Text>
        </TouchableOpacity>)}
      </View>

      <ScrollView contentContainerStyle={{padding:spacing.lg}} showsVerticalScrollIndicator={false}>
        {tab==='export'&&<View style={{gap:12}}>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20}}>Export your Verso data as JSON — re-import it later or keep it as a backup.</Text>
          <View style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:14,gap:7}}>
            {[[allBooks.filter(b=>shelf[b.id]).length,'books on shelf'],[Object.keys(ratings).length,'ratings'],[Object.keys(reviews).length,'reviews written'],[Object.values(rereads).flat().length,'re-reads logged'],[customBooks?.length||0,'custom / imported books']].map(([n,l])=>
              <View key={l as string} style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>{l as string}</Text>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:colors.text2}}>{n as number}</Text>
              </View>)}
          </View>
          <TouchableOpacity style={{backgroundColor:colors.accent,padding:14,alignItems:'center'}} onPress={doExport}>
            <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Export as JSON</Text>
          </TouchableOpacity>
        </View>}

        {tab==='import'&&<View style={{gap:12}}>
          {imported>0&&<View style={{backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent,padding:12}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.accent,textAlign:'center'}}>Imported {imported} books</Text>
          </View>}

          {/* Source toggle */}
          <View style={{flexDirection:'row',gap:8}}>
            {([['goodreads','Goodreads'],['storygraph','The StoryGraph']] as const).map(([k,label])=><TouchableOpacity key={k}
              onPress={()=>{setSource(k);setPreview(null);}}
              style={{flex:1,paddingVertical:10,alignItems:'center',backgroundColor:source===k?colors.accentDim:colors.surface,borderWidth:1,borderColor:source===k?colors.accent:colors.border}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:source===k?colors.accent:colors.text3}}>{label}</Text>
            </TouchableOpacity>)}
          </View>

          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20}}>
            {source==='goodreads'
              ? 'In Goodreads: Account → Settings → Export Library. Paste the CSV below.'
              : 'In The StoryGraph: Profile → Manage Account → Export StoryGraph Library. Paste the CSV below.'}
          </Text>
          <TouchableOpacity onPress={()=>setCsv(sample)} style={{paddingVertical:4}}>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>Load a sample {source==='goodreads'?'Goodreads':'StoryGraph'} export →</Text>
          </TouchableOpacity>
          <TextInput style={{fontFamily:Platform.OS==='ios'?'Courier':'monospace',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:11,paddingHorizontal:12,paddingVertical:10,height:120,textAlignVertical:'top'}}
            placeholder={sample.split('\n').slice(0,3).join('\n')+'…'} placeholderTextColor={colors.text3} value={csv} onChangeText={setCsv} multiline autoCapitalize="none" autoCorrect={false}/>
          <TouchableOpacity style={{backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,padding:14,alignItems:'center'}} onPress={parseCSV}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}}>Preview Import</Text>
          </TouchableOpacity>

          {preview&&<View>
            <Text style={[type.label,{marginVertical:10}]}>{preview.length} books found</Text>
            {preview.slice(0,8).map((p,i)=><View key={i} style={{paddingVertical:8,borderBottomWidth:1,borderBottomColor:colors.border}}>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text}} numberOfLines={1}>{p.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>{p.author} · {p.shelf}{p.rating>0?` · ${p.rating}★`:''}{p.tags&&p.tags.length?` · ${p.tags.length} tag${p.tags.length>1?'s':''}`:''}</Text>
            </View>)}
            {preview.length>8&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,paddingVertical:6}}>… and {preview.length-8} more</Text>}
            <TouchableOpacity style={{backgroundColor:colors.accent,padding:14,alignItems:'center',marginTop:12}} onPress={confirmImport}>
              <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Import {preview.length} Books</Text>
            </TouchableOpacity>
          </View>}
        </View>}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
