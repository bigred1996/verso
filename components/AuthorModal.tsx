import React,{useState,useEffect} from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,Image,SafeAreaView,StatusBar,StyleSheet} from 'react-native';
import {colors,spacing,fonts,type,radius,shadow} from '../constants/theme';
import {BOOKS,AUTHOR_DATA} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

interface Props { author:string|null; onClose:()=>void; onOpenBook:(id:string)=>void; }

export default function AuthorModal({author,onClose,onOpenBook}:Props){
  const {customBooks}=useStore();
  const all=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];
  const a=author?AUTHOR_DATA[author]:null;
  const [photo,setPhoto]=useState<string|null>(null);

  useEffect(()=>{
    setPhoto(null);
    if(!a?.wiki) return;
    let live=true;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(a.wiki)}`)
      .then(r=>r.json())
      .then(d=>{
        if(!live) return;
        const src=d.thumbnail?.source||d.originalimage?.source;
        if(src) setPhoto(src.replace(/\/\d+px-/,'/400px-'));
      }).catch(()=>{});
    return ()=>{live=false;};
  },[author]);

  if(!author) return null;
  const initials=author.split(' ').map(w=>w[0]).join('').slice(0,2);
  const books=(a?.books||all.filter(b=>b.author===author).map(b=>b.id))
    .map(id=>all.find(b=>b.id===id)).filter(Boolean) as typeof BOOKS;

  return <Modal visible={!!author} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="dark-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifItalic,fontSize:16,color:colors.text}} numberOfLines={1}>{author}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo hero with name overlaid */}
        <View style={{height:300,backgroundColor:colors.surface2,alignItems:'center',justifyContent:'center'}}>
          {photo
            ? <Image source={{uri:photo}} style={StyleSheet.absoluteFill} resizeMode="cover"/>
            : <Text style={{fontFamily:fonts.serifItalic,fontSize:96,color:colors.text3}}>{initials}</Text>}
          {/* bottom gradient-ish fade */}
          <View style={{position:'absolute',left:0,right:0,bottom:0,height:150,backgroundColor:'#1A140E',opacity:0.5}} pointerEvents="none"/>
          <View style={{position:'absolute',left:0,right:0,bottom:0,padding:spacing.lg}} pointerEvents="none">
            <Text style={{fontFamily:fonts.serifItalic,fontSize:30,color:'#fff',marginBottom:3}}>{author}</Text>
            {a&&<Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:'rgba(255,255,255,0.85)',letterSpacing:1.2,textTransform:'uppercase'}}>{a.born}</Text>}
          </View>
        </View>
        <View style={{padding:spacing.lg}}>
          {a&&a.awards.length>0&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:16}}>
            {a.awards.map(aw=><View key={aw} style={{paddingHorizontal:11,paddingVertical:5,backgroundColor:colors.accentDim,borderRadius:radius.pill}}>
              <Text style={{fontFamily:fonts.sansBold,fontSize:9,color:colors.accent,letterSpacing:0.6,textTransform:'uppercase'}}>{aw}</Text>
            </View>)}
          </View>}
          {a
            ? <Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:25,marginBottom:24}}>{a.bio}</Text>
            : <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,marginBottom:24}}>Author profile coming soon.</Text>}

          <Text style={[type.label,{marginBottom:12}]}>On Verso · {books.length} {books.length===1?'book':'books'}</Text>
          {books.map(b=><TouchableOpacity key={b.id} onPress={()=>onOpenBook(b.id)}
            style={{flexDirection:'row',gap:14,padding:14,marginBottom:10,backgroundColor:colors.surface,borderRadius:radius.lg,alignItems:'center',...shadow.soft}}>
            <BookCover bookId={b.id} size="sm"/>
            <View style={{flex:1}}>
              <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text}}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:2}}>{b.year}</Text>
              {b.readers>0&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent,marginTop:6}}>★ {b.avgRating} · {b.readers.toLocaleString()} readers</Text>}
            </View>
            <Text style={{color:colors.text3,fontSize:18,alignSelf:'center'}}>›</Text>
          </TouchableOpacity>)}
        </View>
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
