import React,{useState} from 'react';
import {View,Image,StyleSheet} from 'react-native';
import {ISBNS,COVER_IDS} from '../data/books';
const G=['#2C1810','#1A2435','#1E2818','#2A1A2E','#2E2418','#181E2E','#1E1E1E','#2E1A18','#181E1E','#1E1818','#1A1E14','#1E1A14','#14181E'];
const SZ={sm:{width:52,height:76},md:{width:80,height:116},lg:{width:120,height:174}};
// Single source of truth for a book's Open Library cover URL, so callers can
// warm the cache with Image.prefetch using the exact same URI the <Image> uses.
export function coverUri(bookId:string,olCoverId?:number|null):string|null{
  const cid=olCoverId??COVER_IDS[bookId]; const isbn=ISBNS[bookId];
  return cid?`https://covers.openlibrary.org/b/id/${cid}-M.jpg`:isbn?`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`:null;
}
interface Props{bookId:string;size?:'sm'|'md'|'lg';style?:object;olCoverId?:number|null;}
export default function BookCover({bookId,size='sm',style,olCoverId}:Props){
  const [f,setF]=useState(false);
  const d=SZ[size];
  const src=coverUri(bookId,olCoverId);
  const bg=G[bookId.split('').reduce((n,c)=>n+c.charCodeAt(0),0)%G.length];
  return <View style={[d,{backgroundColor:bg,overflow:'hidden',flexShrink:0,borderRadius:8},style]}><View style={[StyleSheet.absoluteFill,{backgroundColor:'#000',opacity:0.3}]}/>{src&&!f&&<Image source={{uri:src}} style={StyleSheet.absoluteFill} resizeMode="cover" onError={()=>setF(true)}/>}</View>;
}
