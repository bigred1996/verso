import React,{useState,useEffect} from 'react';
import {Modal,View,Text,ScrollView,TouchableOpacity,Image,SafeAreaView,StatusBar,StyleSheet} from 'react-native';
import {colors,spacing,fonts,type,radius,shadow} from '../constants/theme';
import {BOOKS,AUTHOR_DATA,AUTHOR_STYLE,BOOK_VIBES} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

interface Props { author:string|null; onClose:()=>void; onOpenBook:(id:string)=>void; }

export default function AuthorModal({author,onClose,onOpenBook}:Props){
  const {customBooks,ratings}=useStore();
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
  const styleTags=author?AUTHOR_STYLE[author]||[]:[];
  const totalReaders=books.reduce((sum,b)=>sum+(b.readers||0),0);

  return <Modal visible={!!author} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="dark-content"/>

      {/* Header */}
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16,paddingVertical:4}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifItalic,fontSize:16,color:colors.text}} numberOfLines={1}>{author}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Photo hero */}
        <View style={{height:320,backgroundColor:colors.surface2,alignItems:'center',justifyContent:'center'}}>
          {photo
            ? <Image source={{uri:photo}} style={StyleSheet.absoluteFill} resizeMode="cover"/>
            : <Text style={{fontFamily:fonts.serifItalic,fontSize:96,color:colors.text3}}>{initials}</Text>}
          <View style={{position:'absolute',left:0,right:0,bottom:0,height:180,backgroundColor:'#1A140E',opacity:0.55}} pointerEvents="none"/>
          <View style={{position:'absolute',left:0,right:0,bottom:0,padding:spacing.lg}} pointerEvents="none">
            <Text style={{fontFamily:fonts.serifItalic,fontSize:32,lineHeight:42,color:'#fff',marginBottom:4}}>{author}</Text>
            {a&&<Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:'rgba(255,255,255,0.8)',letterSpacing:1.2,textTransform:'uppercase'}}>{a.born}</Text>}
          </View>
        </View>

        {/* Stats row */}
        {totalReaders>0&&<View style={{flexDirection:'row',marginHorizontal:spacing.lg,marginTop:spacing.md,marginBottom:spacing.sm,gap:spacing.sm}}>
          <View style={{flex:1,backgroundColor:colors.surface,borderRadius:radius.lg,padding:14,alignItems:'center',...shadow.soft}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:colors.accent}}>{books.length}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2}}>books on Verso</Text>
          </View>
          <View style={{flex:1,backgroundColor:colors.surface,borderRadius:radius.lg,padding:14,alignItems:'center',...shadow.soft}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:colors.accent}}>{totalReaders>=1000000?(totalReaders/1000000).toFixed(1)+'M':totalReaders>=1000?Math.round(totalReaders/1000)+'k':totalReaders}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2}}>total readers</Text>
          </View>
          {a&&a.awards.length>0&&<View style={{flex:1,backgroundColor:colors.surface,borderRadius:radius.lg,padding:14,alignItems:'center',...shadow.soft}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:22,color:colors.accent}}>{a.awards.length}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2}}>awards</Text>
          </View>}
        </View>}

        <View style={{padding:spacing.lg,paddingTop:spacing.md}}>

          {/* Awards */}
          {a&&a.awards.length>0&&<View style={{marginBottom:20}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.9,textTransform:'uppercase',marginBottom:10}}>Recognition</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
              {a.awards.map(aw=><View key={aw} style={{paddingHorizontal:11,paddingVertical:6,backgroundColor:colors.accentDim,borderRadius:radius.pill}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:10,color:colors.accent,letterSpacing:0.6,textTransform:'uppercase'}}>{aw}</Text>
              </View>)}
            </View>
          </View>}

          {/* Writing style tags */}
          {styleTags.length>0&&<View style={{marginBottom:20}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.9,textTransform:'uppercase',marginBottom:10}}>Writing Style</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
              {styleTags.map(tag=><View key={tag} style={{paddingHorizontal:11,paddingVertical:6,backgroundColor:colors.surface2,borderWidth:1,borderColor:colors.border,borderRadius:999}}>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text2}}>{tag}</Text>
              </View>)}
            </View>
          </View>}

          {/* Bio */}
          {a
            ?<Text style={{fontFamily:fonts.sans,fontSize:14,color:colors.text2,lineHeight:25,marginBottom:28}}>{a.bio}</Text>
            :<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,marginBottom:24}}>Author profile coming soon.</Text>}

          {/* Books section */}
          <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,letterSpacing:0.9,textTransform:'uppercase',marginBottom:14}}>
            On Verso · {books.length} {books.length===1?'book':'books'}
          </Text>
          {books.map(b=>{
            const vibe=BOOK_VIBES[b.id];
            const rat=ratings[b.id];
            return <TouchableOpacity key={b.id} onPress={()=>onOpenBook(b.id)}
              style={{flexDirection:'row',gap:14,padding:16,marginBottom:10,backgroundColor:colors.surface,borderRadius:radius.lg,alignItems:'flex-start',...shadow.soft}}>
              <BookCover bookId={b.id} size="sm"/>
              <View style={{flex:1}}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:15,color:colors.text,marginBottom:2}}>{b.title}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginBottom:6}}>{b.year}</Text>
                {b.synopsis?<Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,lineHeight:18,marginBottom:8}} numberOfLines={2}>{b.synopsis}</Text>:null}
                <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                  {b.readers>0&&<Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.accent}}>★ {b.avgRating} · {b.readers>=1000?Math.round(b.readers/1000)+'k':b.readers} readers</Text>}
                  {rat&&<Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3}}>Your rating: {rat}★</Text>}
                </View>
                {vibe&&vibe.vibes.length>0&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:8}}>
                  {vibe.vibes.slice(0,2).map(v=><View key={v} style={{paddingHorizontal:8,paddingVertical:3,backgroundColor:colors.surface2,borderRadius:999,borderWidth:1,borderColor:colors.border}}>
                    <Text style={{fontFamily:fonts.serifItalic,fontSize:11,color:colors.text3}}>"{v}"</Text>
                  </View>)}
                </View>}
              </View>
              <Text style={{color:colors.text3,fontSize:18,alignSelf:'center',marginLeft:4}}>›</Text>
            </TouchableOpacity>;
          })}
        </View>

        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
