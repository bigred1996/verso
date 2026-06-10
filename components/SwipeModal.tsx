import React,{useState,useRef,useEffect} from 'react';
import {Modal,View,Text,TouchableOpacity,SafeAreaView,StatusBar,Animated,PanResponder,Dimensions,Platform} from 'react-native';
import {colors,spacing,fonts,type} from '../constants/theme';
import {BOOKS} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';

const SCREEN_W=Dimensions.get('window').width;
const FLING_X=110, FLING_Y=110;

interface Props { visible:boolean; onClose:()=>void; onOpenBook:(id:string)=>void; }

export default function SwipeModal({visible,onClose,onOpenBook}:Props){
  const {swipeData,eloRatings,updateElo,customBooks,setRating}=useStore();
  const allBooks=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  // Swipe queue: derived from swipeData, so the top card is always queue[0]
  const queue=allBooks.filter(b=>!swipeData[b.id]);
  const cur=queue[0];
  const next=queue[1];

  const [mode,setMode]=useState<'swipe'|'versus'>('swipe');
  const [lastAction,setLastAction]=useState<string|null>(null);
  const [pairIdx,setPairIdx]=useState(0);

  // Versus pairs: deterministic walk over the catalogue so every tap gives a fresh pair
  const n=allBooks.length;
  const i1=(pairIdx*2)%n; let i2=(pairIdx*2+1)%n; if(i2===i1) i2=(i2+1)%n;
  const pool=n>=2?[allBooks[i1],allBooks[i2]]:[];

  // --- Drag animation state ---
  const pan=useRef(new Animated.ValueXY()).current;
  const rotate=pan.x.interpolate({inputRange:[-250,0,250],outputRange:['-14deg','0deg','14deg']});
  const likeOpacity=pan.x.interpolate({inputRange:[30,FLING_X],outputRange:[0,1],extrapolate:'clamp'});
  const nopeOpacity=pan.x.interpolate({inputRange:[-FLING_X,-30],outputRange:[1,0],extrapolate:'clamp'});
  const laterOpacity=pan.y.interpolate({inputRange:[-FLING_Y,-30],outputRange:[1,0],extrapolate:'clamp'});
  const nextScale=pan.x.interpolate({inputRange:[-200,0,200],outputRange:[1,0.94,1],extrapolate:'clamp'});

  function commitSwipe(action:'like'|'dislike'|'next'){
    if(!cur) return;
    const id=cur.id;
    useStore.setState(st=>({swipeData:{...st.swipeData,[id]:action}}));
    if(action==='like') setRating(id,4);
    setLastAction(action==='like'?'❤️ Liked':(action==='dislike'?'✕ Passed':'↑ Later'));
    setTimeout(()=>setLastAction(null),800);
    pan.setValue({x:0,y:0});
  }

  function flingOut(action:'like'|'dislike'|'next'){
    const toX=action==='like'?SCREEN_W+120:action==='dislike'?-(SCREEN_W+120):0;
    const toY=action==='next'?-700:60;
    Animated.timing(pan,{toValue:{x:toX,y:toY},duration:220,useNativeDriver:false}).start(()=>commitSwipe(action));
  }

  function settleRelease(dx:number,dy:number){
    if(dx>FLING_X) flingOut('like');
    else if(dx<-FLING_X) flingOut('dislike');
    else if(dy<-FLING_Y) flingOut('next');
    else Animated.spring(pan,{toValue:{x:0,y:0},friction:5,useNativeDriver:false}).start();
  }

  // Native: standard PanResponder
  const responder=useRef(PanResponder.create({
    onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>6||Math.abs(g.dy)>6,
    onPanResponderMove:Animated.event([null,{dx:pan.x,dy:pan.y}],{useNativeDriver:false}),
    onPanResponderRelease:(_,g)=>settleRelease(g.dx,g.dy),
  })).current;
  const panHandlers=Platform.OS==='web'?{}:responder.panHandlers;

  // Web: direct DOM pointer listeners on the card node (RNW responder system is
  // unreliable for drags in the browser; this guarantees mouse + touch dragging)
  const cardRef=useRef<any>(null);
  const releaseRef=useRef(settleRelease); releaseRef.current=settleRelease;
  useEffect(()=>{
    if(Platform.OS!=='web') return;
    const node=cardRef.current as any;
    if(!node||!node.addEventListener) return;
    let sx=0,sy=0,dragging=false;
    const down=(e:PointerEvent)=>{dragging=true;sx=e.clientX;sy=e.clientY;try{node.setPointerCapture?.(e.pointerId);}catch{}};
    const move=(e:PointerEvent)=>{if(!dragging)return;pan.setValue({x:e.clientX-sx,y:e.clientY-sy});};
    const up=(e:PointerEvent)=>{if(!dragging)return;dragging=false;releaseRef.current(e.clientX-sx,e.clientY-sy);};
    node.addEventListener('pointerdown',down);
    node.addEventListener('pointermove',move);
    node.addEventListener('pointerup',up);
    node.addEventListener('pointercancel',up);
    return ()=>{node.removeEventListener('pointerdown',down);node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',up);node.removeEventListener('pointercancel',up);};
  },[cur?.id]);

  function doVersus(winnerId:string){
    if(pool.length<2) return;
    updateElo(pool.map(b=>b.id),winnerId);
    setPairIdx(i=>i+1);
    setLastAction('Ranked!');
    setTimeout(()=>setLastAction(null),800);
  }

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:16,color:colors.text}}>Rate Books</Text>
        <View style={{flexDirection:'row',gap:2}}>
          {(['swipe','versus'] as const).map(m=><TouchableOpacity key={m} onPress={()=>setMode(m)}
            style={{paddingHorizontal:12,paddingVertical:6,backgroundColor:mode===m?colors.accentDim:colors.surface,borderWidth:1,borderColor:mode===m?colors.accent:colors.border}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:mode===m?colors.accent:colors.text3}}>{m==='swipe'?'Swipe':'Versus'}</Text>
          </TouchableOpacity>)}
        </View>
      </View>

      {lastAction&&<View style={{position:'absolute',top:80,alignSelf:'center',zIndex:10,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.accent,paddingHorizontal:20,paddingVertical:10}}>
        <Text style={{fontFamily:fonts.sansMedium,fontSize:15,color:colors.text}}>{lastAction}</Text>
      </View>}

      {mode==='swipe'&&<View style={{flex:1,padding:spacing.lg}}>
        <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginBottom:spacing.md,textAlign:'center'}}>{queue.length} books left · drag the card or use the buttons</Text>
        {cur?<View style={{flex:1,alignItems:'center'}}>
          <View style={{width:'100%',flex:1,alignItems:'center',justifyContent:'flex-start'}}>
            {/* Next card peeking behind — cover only, so its title never bleeds through */}
            {next&&<Animated.View style={{position:'absolute',top:8,alignItems:'center',transform:[{scale:nextScale}],opacity:0.4}}>
              <BookCover bookId={next.id} size="lg"/>
            </Animated.View>}
            {/* Draggable top card */}
            <Animated.View ref={cardRef} {...panHandlers}
              style={{alignItems:'center',transform:[{translateX:pan.x},{translateY:pan.y},{rotate}],cursor:'grab',touchAction:'none'} as any}>
              <View>
                <BookCover bookId={cur.id} size="lg"/>
                {/* verdict overlays */}
                <Animated.View style={{position:'absolute',top:10,left:8,opacity:likeOpacity,borderWidth:2,borderColor:'#3D6B48',paddingHorizontal:8,paddingVertical:3,transform:[{rotate:'-14deg'}],backgroundColor:'rgba(61,107,72,0.18)'}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:16,color:'#5FA873',letterSpacing:1.5}}>LIKE</Text>
                </Animated.View>
                <Animated.View style={{position:'absolute',top:10,right:8,opacity:nopeOpacity,borderWidth:2,borderColor:'#A65A5A',paddingHorizontal:8,paddingVertical:3,transform:[{rotate:'14deg'}],backgroundColor:'rgba(166,90,90,0.18)'}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:16,color:'#C97B7B',letterSpacing:1.5}}>NOPE</Text>
                </Animated.View>
                <Animated.View style={{position:'absolute',bottom:10,alignSelf:'center',opacity:laterOpacity,borderWidth:2,borderColor:colors.text3,paddingHorizontal:8,paddingVertical:3,backgroundColor:'rgba(90,78,58,0.25)'}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:colors.text2,letterSpacing:1.5}}>LATER</Text>
                </Animated.View>
              </View>
              <TouchableOpacity onPress={()=>onOpenBook(cur.id)} activeOpacity={0.8}>
                <Text style={{fontFamily:fonts.serifBold,fontSize:20,color:colors.text,marginTop:16,textAlign:'center'}}>{cur.title}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,marginBottom:6,textAlign:'center'}}>{cur.author}</Text>
              </TouchableOpacity>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2,textAlign:'center',maxWidth:280,lineHeight:17}}>{cur.synopsis}</Text>
            </Animated.View>
          </View>
          <View style={{flexDirection:'row',gap:14,paddingVertical:spacing.md}}>
            <TouchableOpacity onPress={()=>flingOut('dislike')} style={[swBtn,{borderColor:'#A65A5A'}]}>
              <Text style={{fontSize:24}}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>flingOut('next')} style={swBtn}>
              <Text style={{fontSize:24}}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>flingOut('like')} style={[swBtn,{borderColor:colors.accent}]}>
              <Text style={{fontSize:24}}>❤️</Text>
            </TouchableOpacity>
          </View>
        </View>:<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:32,marginBottom:16}}>🎉</Text>
          <Text style={{fontFamily:fonts.serifBold,fontSize:18,color:colors.text,marginBottom:8}}>All caught up!</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center'}}>You've rated every book in the catalogue.{'\n'}Try Versus mode to refine your rankings.</Text>
        </View>}
      </View>}

      {mode==='versus'&&<View style={{flex:1,padding:spacing.lg,alignItems:'center'}}>
        <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginBottom:spacing.lg,textAlign:'center'}}>Tap the book you prefer · builds your ELO rankings</Text>
        {pool.length>=2?<View style={{flexDirection:'row',gap:16,alignItems:'flex-start',justifyContent:'center'}}>
          {pool.map(b=><TouchableOpacity key={b.id} onPress={()=>doVersus(b.id)} activeOpacity={0.8}
            style={{width:140,alignItems:'center'}}>
            <BookCover bookId={b.id} size="md"/>
            <Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text,marginTop:10,textAlign:'center',lineHeight:19}}>{b.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2}}>{b.author}</Text>
            {eloRatings[b.id]?<Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent,marginTop:4}}>{eloRatings[b.id]} ELO</Text>:null}
          </TouchableOpacity>)}
        </View>:<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3}}>Need more books to compare.</Text>}
        <TouchableOpacity onPress={()=>setPairIdx(i=>i+1)} style={{marginTop:spacing.xl,paddingVertical:10}}>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Skip this pair →</Text>
        </TouchableOpacity>
      </View>}
    </SafeAreaView>
  </Modal>;
}

const swBtn:any={width:64,height:64,borderRadius:32,backgroundColor:colors.surface,borderWidth:2,borderColor:colors.border,alignItems:'center',justifyContent:'center'};
