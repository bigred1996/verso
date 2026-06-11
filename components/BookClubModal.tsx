import React,{useState,useRef,useEffect} from 'react';
import {Modal,View,Text,TouchableOpacity,ScrollView,TextInput,KeyboardAvoidingView,Platform,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing,fonts,radius,shadow} from '../constants/theme';
import {BOOKS} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

interface Club {
  id:string; name:string; bookId:string; members:string[];
  progress:Record<string,number>; goal:number;
  chat:{user:string;text:string;ts:string;page?:number}[];
}
const DEFAULT_CLUBS:Club[]=[
  {id:'lit-salon',name:'The Lit Salon',bookId:'intermezzo',members:['Elif','Juno'],
   progress:{You:67,Elif:103,Juno:45},goal:384,
   chat:[{user:'Elif',text:'Chapter 3 destroyed me.',ts:'Jun 7',page:40},{user:'Juno',text:'The chess subplot is so good!',ts:'Jun 8',page:55},{user:'You',text:'Finally caught up. Peter is a disaster but I love him.',ts:'Jun 8',page:60},{user:'Elif',text:'Wait until the ending. I can\'t say more.',ts:'Jun 9',page:300}]},
  {id:'dark-reads',name:'Dark & Dense',bookId:'a-little-life',members:['Marcus','Priya'],
   progress:{You:0,Marcus:210,Priya:88},goal:720,
   chat:[{user:'Priya',text:'I warned everyone this would be painful.',ts:'Jun 5',page:1},{user:'Marcus',text:'Three chapters in and I already need therapy.',ts:'Jun 6',page:60},{user:'Marcus',text:'The midpoint reveal. I have to lie down.',ts:'Jun 7',page:380}]},
];

interface Props { visible:boolean; onClose:()=>void; onOpenBook:(id:string)=>void; initialClubId?:string|null; }

export default function BookClubModal({visible,onClose,onOpenBook,initialClubId}:Props){
  const {sendClubMessage,clubMessages,userClubs,customBooks}=useStore();
  const [activeClub,setActiveClub]=useState<string|null>(null);
  const [msg,setMsg]=useState('');
  const scrollRef=useRef<ScrollView>(null);
  const allBooks=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  // Merge seeded clubs with user-created ones
  const CLUBS:Club[]=[...DEFAULT_CLUBS,...userClubs.map(c=>({id:c.id,name:c.name,bookId:c.bookId,members:[] as string[],progress:{You:0},goal:allBooks.find(b=>b.id===c.bookId)?.pages||400,chat:[] as Club['chat']}))];
  useEffect(()=>{ if(visible&&initialClubId) setActiveClub(initialClubId); },[visible,initialClubId]);

  const club=activeClub?CLUBS.find(c=>c.id===activeClub):null;
  const book=club?allBooks.find(b=>b.id===club.bookId):null;

  // Merge static chat with store messages
  const chat:{user:string;text:string;ts:string;page?:number}[]=club?[...club.chat,...(clubMessages[club.id]||[])]:[];
  const myPage=club?club.progress.You||0:0;

  function send(){
    if(!msg.trim()||!activeClub) return;
    sendClubMessage(activeClub,msg.trim());
    setMsg('');
    setTimeout(()=>scrollRef.current?.scrollToEnd({animated:true}),100);
  }

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>{setActiveClub(null);onClose();}}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="dark-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={()=>{if(activeClub)setActiveClub(null);else onClose();}} style={{paddingRight:16}}>
          <Text style={{fontSize:22,color:colors.text3}}>{activeClub?'←':'←'}</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:16,color:colors.text}}>{club?club.name:'Book Clubs'}</Text>
      </View>

      {!activeClub&&<ScrollView contentContainerStyle={{padding:spacing.lg,gap:12}}>
        <Text style={sec}>Your Clubs</Text>
        {CLUBS.map(c=>{
          const b=allBooks.find(x=>x.id===c.bookId);
          const myProg=c.progress.You||0;
          const pct=Math.round(myProg/c.goal*100);
          return <TouchableOpacity key={c.id} onPress={()=>setActiveClub(c.id)}
            style={{backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.lg,...shadow.soft}}>
            <View style={{flexDirection:'row',gap:12,marginBottom:12}}>
              {b&&<BookCover bookId={b.id} size="sm"/>}
              <View style={{flex:1}}>
                <Text style={{fontSize:15,color:colors.text,fontWeight:'700',marginBottom:3}}>{c.name}</Text>
                <Text style={{fontSize:12,color:colors.text3,marginBottom:2}}>{b?.title} · {b?.author}</Text>
                <Text style={{fontSize:11,color:colors.text3}}>{c.members.join(', ')}</Text>
              </View>
            </View>
            {/* Progress bars */}
            {Object.entries(c.progress).map(([user,pg])=>{
              const p=Math.min(100,Math.round(pg/c.goal*100));
              const isYou=user==='You';
              return <View key={user} style={{marginBottom:6}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:3}}>
                  <Text style={{fontSize:10,color:isYou?colors.text:colors.text3}}>{user}</Text>
                  <Text style={{fontSize:10,color:colors.text3}}>p.{pg} · {p}%</Text>
                </View>
                <View style={{height:5,borderRadius:radius.pill,backgroundColor:colors.surface2,overflow:'hidden'}}>
                  <View style={{width:`${p}%`,height:5,borderRadius:radius.pill,backgroundColor:isYou?colors.accent:'#7B9EA6'}}/>
                </View>
              </View>;
            })}
          </TouchableOpacity>;
        })}
        <View style={{height:40}}/>
      </ScrollView>}

      {club&&book&&<KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        {/* Book header */}
        <TouchableOpacity onPress={()=>onOpenBook(book.id)}
          style={{flexDirection:'row',padding:spacing.lg,gap:10,borderBottomWidth:1,borderBottomColor:colors.border,alignItems:'center'}}>
          <BookCover bookId={book.id} size="sm"/>
          <View style={{flex:1}}>
            <Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text}}>{book.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3}}>You're on p.{myPage} · posts unlock as you read</Text>
          </View>
        </TouchableOpacity>
        {/* Chat — progress-gated */}
        <ScrollView ref={scrollRef} style={{flex:1}} contentContainerStyle={{padding:spacing.lg,gap:10}}>
          {chat.map((m,i)=>{
            const isYou=m.user==='You';
            const locked=!isYou&&typeof m.page==='number'&&m.page>myPage;
            if(locked) return <View key={i} style={{alignItems:'flex-start',marginBottom:8}}>
              <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginBottom:3}}>{m.user} · {m.ts}</Text>
              <View style={{maxWidth:'78%',padding:12,borderRadius:radius.lg,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderStyle:'dashed'}}>
                <Text style={{fontFamily:fonts.serif,fontStyle:'italic',fontSize:12,color:colors.text3}}>Hidden until p.{m.page} — no spoilers.</Text>
              </View>
            </View>;
            return <View key={i} style={{alignItems:isYou?'flex-end':'flex-start',marginBottom:8}}>
              {!isYou&&<Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginBottom:3}}>{m.user} · {m.ts}</Text>}
              <View style={{maxWidth:'78%',padding:12,backgroundColor:isYou?colors.accent:colors.surface,borderRadius:radius.lg,borderBottomRightRadius:isYou?4:radius.lg,borderBottomLeftRadius:isYou?radius.lg:4,...shadow.soft}}>
                <Text style={{fontFamily:fonts.sans,fontSize:13,color:isYou?colors.accentText:colors.text,lineHeight:18}}>{m.text}</Text>
              </View>
              {isYou&&<Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:3}}>{m.ts}</Text>}
            </View>;
          })}
          <View style={{height:20}}/>
        </ScrollView>
        {/* Input */}
        <View style={{flexDirection:'row',padding:spacing.md,gap:8,borderTopWidth:1,borderTopColor:colors.border,alignItems:'center'}}>
          <TextInput style={{flex:1,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:13,paddingHorizontal:16,paddingVertical:11,borderRadius:radius.pill}}
            placeholder="Message…" placeholderTextColor={colors.text3} value={msg} onChangeText={setMsg} returnKeyType="send" onSubmitEditing={send}/>
          <TouchableOpacity onPress={send} style={{backgroundColor:colors.accent,width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:colors.accentText,fontWeight:'600',fontSize:18}}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>}
    </SafeAreaView>
  </Modal>;
}
const sec:any={fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:10};
