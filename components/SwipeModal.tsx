import React,{useState} from 'react';
import {Modal,View,Text,TouchableOpacity,SafeAreaView,StatusBar,Animated} from 'react-native';
import {colors,spacing} from '../constants/theme';
import {BOOKS} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

interface Props { visible:boolean; onClose:()=>void; onOpenBook:(id:string)=>void; }

export default function SwipeModal({visible,onClose,onOpenBook}:Props){
  const {shelf,swipeData,eloRatings,updateElo}=useStore();
  const store=useStore();
  const allBooks=[...BOOKS,...(store.customBooks||[])];

  // For ELO: pick two books from shelf or all
  const rated=allBooks.filter(b=>eloRatings[b.id]);
  const unrated=allBooks.filter(b=>!eloRatings[b.id]);
  const pool=unrated.length>0?[unrated[0],...rated.slice(0,1)]:allBooks.slice(0,2);
  const [pairIdx,setPairIdx]=useState(0);

  // Swipe queue: books not yet swiped. Swiping adds to swipeData, which removes
  // the book from this derived queue — so the next card is always queue[0].
  const queue=allBooks.filter(b=>!swipeData[b.id]);
  const [mode,setMode]=useState<'swipe'|'versus'>('swipe');
  const [lastAction,setLastAction]=useState<string|null>(null);

  const cur=queue[0];

  function doSwipe(action:'like'|'dislike'|'next'){
    if(!cur) return;
    useStore.setState(st=>({swipeData:{...st.swipeData,[cur.id]:action}}));
    if(action==='like') store.setRating(cur.id,4);
    setLastAction(action==='like'?'❤️ Liked':(action==='dislike'?'✕ Passed':'→ Later'));
    setTimeout(()=>setLastAction(null),900);
  }

  function doVersus(winnerId:string){
    const ids=pool.map(b=>b.id);
    updateElo(ids,winnerId);
    setPairIdx(i=>i+1);
    setLastAction('Ranked!');
    setTimeout(()=>setLastAction(null),900);
  }

  const remaining=queue.length;

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontSize:14,color:colors.text,fontWeight:'600'}}>Rate Books</Text>
        <View style={{flexDirection:'row',gap:2}}>
          {(['swipe','versus'] as const).map(m=><TouchableOpacity key={m} onPress={()=>setMode(m)}
            style={{paddingHorizontal:12,paddingVertical:6,backgroundColor:mode===m?colors.accentDim:colors.surface,borderWidth:1,borderColor:mode===m?colors.accent:colors.border}}>
            <Text style={{fontSize:11,color:mode===m?colors.accent:colors.text3}}>{m==='swipe'?'Swipe':'Versus'}</Text>
          </TouchableOpacity>)}
        </View>
      </View>

      {lastAction&&<View style={{position:'absolute',top:80,alignSelf:'center',zIndex:10,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.accent,paddingHorizontal:20,paddingVertical:10}}>
        <Text style={{fontSize:16,color:colors.text}}>{lastAction}</Text>
      </View>}

      {mode==='swipe'&&<View style={{flex:1,padding:spacing.lg}}>
        <Text style={{fontSize:11,color:colors.text3,marginBottom:spacing.lg,textAlign:'center'}}>{remaining} books left to rate</Text>
        {cur?<View style={{alignItems:'center',flex:1}}>
          <TouchableOpacity onPress={()=>onOpenBook(cur.id)} activeOpacity={0.9}>
            <BookCover bookId={cur.id} size="lg"/>
          </TouchableOpacity>
          <Text style={{fontSize:18,color:colors.text,fontWeight:'700',marginTop:spacing.lg,textAlign:'center'}}>{cur.title}</Text>
          <Text style={{fontSize:13,color:colors.text3,marginBottom:4}}>{cur.author}</Text>
          <Text style={{fontSize:11,color:colors.text2,textAlign:'center',maxWidth:280,lineHeight:17,marginBottom:spacing.xl}}>{cur.synopsis}</Text>
          <View style={{flexDirection:'row',gap:12,marginTop:'auto'}}>
            <TouchableOpacity onPress={()=>doSwipe('dislike')} style={[swBtn,{borderColor:'#A65A5A'}]}>
              <Text style={{fontSize:26}}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>doSwipe('next')} style={swBtn}>
              <Text style={{fontSize:26}}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>doSwipe('like')} style={[swBtn,{borderColor:colors.accent}]}>
              <Text style={{fontSize:26}}>❤️</Text>
            </TouchableOpacity>
          </View>
        </View>:<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:32,marginBottom:16}}>🎉</Text>
          <Text style={{fontSize:16,color:colors.text,fontWeight:'600',marginBottom:8}}>All caught up!</Text>
          <Text style={{fontSize:13,color:colors.text3,textAlign:'center'}}>You've rated all available books.</Text>
        </View>}
      </View>}

      {mode==='versus'&&<View style={{flex:1,padding:spacing.lg,alignItems:'center'}}>
        <Text style={{fontSize:11,color:colors.text3,marginBottom:spacing.lg,textAlign:'center'}}>Tap the book you prefer to build ELO rankings</Text>
        {pool.length>=2?<View style={{flexDirection:'row',gap:16,alignItems:'flex-start',justifyContent:'center'}}>
          {pool.slice(0,2).map(b=><TouchableOpacity key={b.id} onPress={()=>doVersus(b.id)} activeOpacity={0.8}
            style={{width:140,alignItems:'center'}}>
            <BookCover bookId={b.id} size="md"/>
            <Text style={{fontSize:13,color:colors.text,fontWeight:'600',marginTop:10,textAlign:'center',lineHeight:18}}>{b.title}</Text>
            <Text style={{fontSize:11,color:colors.text3,marginTop:2}}>{b.author}</Text>
            {eloRatings[b.id]&&<Text style={{fontSize:10,color:colors.accent,marginTop:4}}>{eloRatings[b.id]} ELO</Text>}
          </TouchableOpacity>)}
        </View>:<Text style={{fontSize:13,color:colors.text3}}>Need more books to compare.</Text>}
        <TouchableOpacity onPress={()=>setPairIdx(i=>i+1)} style={{marginTop:spacing.xl,paddingVertical:10}}>
          <Text style={{fontSize:12,color:colors.text3}}>Skip this pair →</Text>
        </TouchableOpacity>
      </View>}
    </SafeAreaView>
  </Modal>;
}

const swBtn:any={width:70,height:70,borderRadius:35,backgroundColor:colors.surface,borderWidth:2,borderColor:colors.border,alignItems:'center',justifyContent:'center'};
