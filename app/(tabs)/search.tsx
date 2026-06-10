import React,{useState} from 'react';
import {View,Text,TextInput,FlatList,TouchableOpacity,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing} from '../../constants/theme';
import {BOOKS} from '../../data/books';
import {useStore} from '../../store';
import BookCover from '../../components/BookCover';
import BookDetailModal from '../../components/BookDetailModal';
import AddBookModal from '../../components/AddBookModal';

export default function SearchScreen(){
  const [q,setQ]=useState('');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [showAdd,setShowAdd]=useState(false);
  const {customBooks,shelf}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const results=q.trim()?all.filter(b=>b.title.toLowerCase().includes(q.toLowerCase())||b.author.toLowerCase().includes(q.toLowerCase())):all;

  return <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
    <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
    <View style={{padding:spacing.lg,paddingBottom:8,flexDirection:'row',gap:8}}>
      <TextInput style={{flex:1,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:14,paddingHorizontal:14,paddingVertical:11}} placeholder="Search by title or author…" placeholderTextColor={colors.text3} value={q} onChangeText={setQ} autoCorrect={false} autoCapitalize="none"/>
      <TouchableOpacity onPress={()=>setShowAdd(true)} style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,justifyContent:'center'}}>
        <Text style={{fontSize:18,color:colors.text3}}>+</Text>
      </TouchableOpacity>
    </View>
    <FlatList data={results} keyExtractor={b=>b.id} renderItem={({item:b})=>{
      const sh=shelf[b.id];
      return <TouchableOpacity style={{flexDirection:'row',padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border,gap:12}} activeOpacity={0.75} onPress={()=>setDetailId(b.id)}>
        <BookCover bookId={b.id} size="sm"/>
        <View style={{flex:1}}>
          <Text style={{fontSize:14,color:colors.text,fontWeight:'600',marginBottom:3}} numberOfLines={1}>{b.title}</Text>
          <Text style={{fontSize:12,color:colors.text3}}>{b.author} · {b.year||'—'}</Text>
          <Text style={{fontSize:11,color:colors.text3,marginTop:2}}>★ {b.avgRating||'—'} · {b.readers?b.readers.toLocaleString():'custom'}</Text>
          {b.takes[0]&&<Text style={{fontSize:11,color:colors.text2,fontStyle:'italic',marginTop:4}} numberOfLines={1}>"{b.takes[0].t}"</Text>}
        </View>
        {sh&&<View style={{alignSelf:'center',paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.accentDim,borderWidth:1,borderColor:colors.accent}}>
          <Text style={{fontSize:10,color:colors.accent,textTransform:'capitalize'}}>{sh}</Text>
        </View>}
      </TouchableOpacity>;
    }}
    contentContainerStyle={{paddingBottom:32}} showsVerticalScrollIndicator={false}/>
    <BookDetailModal bookId={detailId} onClose={()=>setDetailId(null)}/>
    {showAdd&&<AddBookModal visible onClose={()=>setShowAdd(false)}/>}
  </SafeAreaView>;
}
