import React,{useState} from 'react';
import {View,Text,TextInput,TouchableOpacity} from 'react-native';
import {colors,spacing,fonts,type} from '../constants/theme';
import {BOOKS} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

export default function ListsView({onOpenBook}:{onOpenBook:(id:string)=>void}){
  const {lists,customBooks,createList,deleteList,toggleListBook}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const [q,setQ]=useState('');
  const [creating,setCreating]=useState(false);
  const [name,setName]=useState('');
  const [desc,setDesc]=useState('');
  const [open,setOpen]=useState<string|null>(null);

  const shown=lists.filter(l=>l.name.toLowerCase().includes(q.toLowerCase()));
  const active=open?lists.find(l=>l.id===open):null;

  if(active){
    return <View style={{padding:spacing.lg}}>
      <TouchableOpacity onPress={()=>setOpen(null)} style={{marginBottom:spacing.md}}><Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3}}>← All lists</Text></TouchableOpacity>
      <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:colors.text,marginBottom:4}}>{active.name}</Text>
      {active.desc?<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20,marginBottom:6}}>{active.desc}</Text>:null}
      <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginBottom:spacing.lg}}>{active.bookIds.length} book{active.bookIds.length!==1?'s':''}</Text>
      {active.bookIds.map(id=>{const b=all.find(x=>x.id===id);if(!b)return null;
        return <View key={id} style={{flexDirection:'row',gap:12,paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border,alignItems:'center'}}>
          <TouchableOpacity onPress={()=>onOpenBook(id)} style={{flexDirection:'row',gap:12,flex:1,alignItems:'center'}}>
            <BookCover bookId={id} size="sm"/>
            <View style={{flex:1}}><Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text}}>{b.title}</Text><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>{b.author}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>toggleListBook(active.id,id)}><Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>Remove</Text></TouchableOpacity>
        </View>;})}
      {active.bookIds.length===0&&<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,paddingVertical:spacing.lg}}>Empty list. Add books from any book's page.</Text>}
      <TouchableOpacity onPress={()=>{deleteList(active.id);setOpen(null);}} style={{marginTop:spacing.lg}}><Text style={{fontFamily:fonts.sans,fontSize:11,color:'#C97B7B'}}>Delete this list</Text></TouchableOpacity>
    </View>;
  }

  return <View style={{padding:spacing.lg}}>
    <TextInput style={inp} placeholder="Search your lists…" placeholderTextColor={colors.text3} value={q} onChangeText={setQ}/>
    {creating?<View style={{marginTop:spacing.md,gap:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:14,borderRadius:16}}>
      <TextInput style={inp} placeholder="List name (e.g. Books that smell like autumn)" placeholderTextColor={colors.text3} value={name} onChangeText={setName}/>
      <TextInput style={inp} placeholder="Description (optional)" placeholderTextColor={colors.text3} value={desc} onChangeText={setDesc}/>
      <View style={{flexDirection:'row',gap:8}}>
        <TouchableOpacity style={{flex:1,backgroundColor:colors.accent,padding:11,alignItems:'center',borderRadius:999}} onPress={()=>{if(name.trim()){createList(name.trim(),desc.trim());setName('');setDesc('');setCreating(false);}}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.bg}}>Create list</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{paddingHorizontal:16,justifyContent:'center'}} onPress={()=>setCreating(false)}><Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Cancel</Text></TouchableOpacity>
      </View>
    </View>:<TouchableOpacity onPress={()=>setCreating(true)} style={{marginTop:spacing.md,padding:13,borderWidth:1,borderColor:colors.border,borderStyle:'dashed',alignItems:'center',borderRadius:12}}>
      <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text2}}>+ New list</Text>
    </TouchableOpacity>}

    <View style={{height:spacing.lg}}/>
    {shown.map(l=><TouchableOpacity key={l.id} onPress={()=>setOpen(l.id)} style={{paddingVertical:14,paddingHorizontal:14,backgroundColor:colors.surface,borderRadius:16,marginBottom:8}}>
      <View style={{flexDirection:'row',marginBottom:8}}>
        {l.bookIds.slice(0,4).map((id,i)=><View key={id} style={{marginLeft:i?-14:0}}><BookCover bookId={id} size="sm"/></View>)}
        {l.bookIds.length===0&&<View style={{width:52,height:76,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border}}/>}
      </View>
      <Text style={{fontFamily:fonts.serifBold,fontSize:16,color:colors.text}}>{l.name}</Text>
      <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2}}>{l.bookIds.length} book{l.bookIds.length!==1?'s':''}{l.desc?` · ${l.desc}`:''}</Text>
    </TouchableOpacity>)}
    {shown.length===0&&<Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:13,color:colors.text3,textAlign:'center',paddingVertical:spacing.xl}}>No lists yet. The first one is the hardest.</Text>}
  </View>;
}
const inp:any={fontFamily:fonts.sans,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:12,paddingVertical:10,borderRadius:12};
