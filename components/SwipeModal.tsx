import React,{useState,useRef,useLayoutEffect} from 'react';
import {Modal,View,Text,TouchableOpacity,SafeAreaView,StatusBar,Animated,Dimensions} from 'react-native';
import Reanimated,{useSharedValue,useAnimatedStyle,withSpring,withTiming,runOnJS,interpolate,Extrapolation} from 'react-native-reanimated';
import {Gesture,GestureDetector,GestureHandlerRootView} from 'react-native-gesture-handler';
import {colors,spacing,fonts,radius,shadow} from '../constants/theme';
import {BOOKS,BOOK_VIBES} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';
import {tick,impact,notify} from '../utils/haptics';

const {width:SCREEN_W,height:SCREEN_H}=Dimensions.get('window');
const FLING_X=110, FLING_Y=110;
// The cover is the hero — size it to fill the screen while staying within the
// 2:3 book aspect, bounded by both width (66%) and height (45%) so it fits on
// small phones too. coverStyle overrides BookCover's preset dimensions.
const COVER_W=Math.round(Math.min(SCREEN_W*0.66, SCREEN_H*0.45*0.66));
const COVER_H=Math.round(COVER_W/0.66);
const coverStyle={width:COVER_W,height:COVER_H,borderRadius:radius.md};
// Versus: two covers flanking a centred VS badge.
const VS_W=Math.round(Math.min((SCREEN_W-spacing.lg*2-50)/2, 150));
const VS_H=Math.round(VS_W/0.66);

// Shown once per app session; re-openable via the ? button.
let seenRules=false;

type Action='like'|'dislike'|'next';
const VERDICT:Record<Action,{label:string;icon:string;color:string;sub:string}>={
  like:{label:'Yes',icon:'♥',color:colors.accent,sub:'Enjoyed it — or want to read it'},
  dislike:{label:'Not for me',icon:'✕',color:colors.danger,sub:"No interest, or read and didn't click"},
  next:{label:'Skip',icon:'↑',color:colors.text2,sub:'No opinion — show me the next'},
};

interface Props { visible:boolean; onClose:()=>void; onOpenBook:(id:string)=>void; }

export default function SwipeModal({visible,onClose,onOpenBook}:Props){
  const {swipeData,eloRatings,updateElo,customBooks,recordSwipe}=useStore();
  const allBooks=[...BOOKS,...(Array.isArray(customBooks)?customBooks:[])];

  const queue=allBooks.filter(b=>!swipeData[b.id]);
  const cur=queue[0];
  const next=queue[1];
  const next2=queue[2];
  const total=allBooks.length;
  const done=total-queue.length;
  const curVibe=cur?BOOK_VIBES[cur.id]:null;

  const [mode,setMode]=useState<'swipe'|'versus'>('swipe');
  const [pairIdx,setPairIdx]=useState(0);
  const [showRules,setShowRules]=useState(!seenRules);
  const [sessionCount,setSessionCount]=useState(0);

  const n=allBooks.length;
  const i1=(pairIdx*2)%n; let i2=(pairIdx*2+1)%n; if(i2===i1) i2=(i2+1)%n;
  const pool=n>=2?[allBooks[i1],allBooks[i2]]:[];

  // ── Drag (UI-thread: react-native-gesture-handler + Reanimated) ──
  // tx/ty are the card's live offset, driven entirely on the UI thread, so the
  // drag stays smooth even in a debug build. armed* gate the threshold haptic.
  const tx=useSharedValue(0);
  const ty=useSharedValue(0);
  const armedX=useSharedValue(false);
  const armedY=useSharedValue(false);
  const enterScale=useSharedValue(1); // brief settle-in when a new card arrives

  const cardStyle=useAnimatedStyle(()=>({
    transform:[
      {translateX:tx.value},
      {translateY:ty.value},
      {scale:enterScale.value},
      {rotate:`${interpolate(tx.value,[-250,0,250],[-14,0,14],Extrapolation.CLAMP)}deg`},
    ],
  }));
  const yesStyle=useAnimatedStyle(()=>({opacity:interpolate(tx.value,[20,FLING_X],[0,1],Extrapolation.CLAMP)}));
  const nopeStyle=useAnimatedStyle(()=>({opacity:interpolate(tx.value,[-FLING_X,-20],[1,0],Extrapolation.CLAMP)}));
  const skipStyle=useAnimatedStyle(()=>({opacity:interpolate(ty.value,[-FLING_Y,-20],[1,0],Extrapolation.CLAMP)}));

  // New book arrives centred (no flash from the outgoing card) and settles in
  // with a quick scale-up, so the deck card promoting to the top feels seamless.
  useLayoutEffect(()=>{
    tx.value=0; ty.value=0;
    enterScale.value=0.94;
    enterScale.value=withTiming(1,{duration:170});
  },[cur?.id]);

  // Subtle bounce on the "swiped this session" counter.
  const countV=useRef(new Animated.Value(1)).current;

  // Advance the queue once the card is gone. useLayoutEffect re-centres the
  // next card before paint, so we must NOT touch tx/ty here.
  function commitSwipe(action:Action){
    if(!cur) return;
    recordSwipe(cur.id,action);
    setSessionCount(c=>c+1);
    countV.setValue(0.7);
    Animated.spring(countV,{toValue:1,friction:5,useNativeDriver:true}).start();
  }
  // Fling the card off-screen, then commit once it's gone. The confirmation
  // haptic fires immediately (the instant you commit), not after the animation,
  // so it feels instant like Tinder. Callable from the gesture and the buttons.
  function doFling(action:Action){
    if(action==='like') notify('success');
    else if(action==='dislike') impact('medium');
    else tick();
    const toX=action==='like'?SCREEN_W+140:action==='dislike'?-(SCREEN_W+140):0;
    const toY=action==='next'?-(SCREEN_H+140):40;
    tx.value=withTiming(toX,{duration:135});
    ty.value=withTiming(toY,{duration:135},(finished)=>{ if(finished) runOnJS(commitSwipe)(action); });
  }
  function openCur(){ if(cur) onOpenBook(cur.id); }

  // Pan runs entirely on the UI thread. activeOffset means a small move is NOT
  // a drag, so the Tap gesture (open the book) wins for taps. vx/vy are px/s.
  const panGesture=Gesture.Pan()
    .activeOffsetX([-12,12]).activeOffsetY([-12,12])
    .onUpdate((e)=>{
      'worklet';
      tx.value=e.translationX; ty.value=e.translationY;
      const pastX=Math.abs(e.translationX)>FLING_X;
      if(pastX&&!armedX.value){ armedX.value=true; runOnJS(tick)(); }
      else if(!pastX&&armedX.value){ armedX.value=false; }
      const pastY=e.translationY<-FLING_Y;
      if(pastY&&!armedY.value){ armedY.value=true; runOnJS(tick)(); }
      else if(!pastY&&armedY.value){ armedY.value=false; }
    })
    .onEnd((e)=>{
      'worklet';
      armedX.value=false; armedY.value=false;
      const dx=e.translationX,dy=e.translationY,vx=e.velocityX,vy=e.velocityY;
      const fastX=Math.abs(vx)>650, fastUp=vy<-650;
      if(dx>FLING_X||(fastX&&vx>0&&dx>40)) runOnJS(doFling)('like');
      else if(dx<-FLING_X||(fastX&&vx<0&&dx<-40)) runOnJS(doFling)('dislike');
      else if(dy<-FLING_Y||(fastUp&&dy<-40)) runOnJS(doFling)('next');
      else { tx.value=withSpring(0,{damping:18,stiffness:260,mass:0.7}); ty.value=withSpring(0,{damping:18,stiffness:260,mass:0.7}); }
    });
  const tapGesture=Gesture.Tap().maxDistance(12).onEnd((_e,success)=>{ if(success) runOnJS(openCur)(); });
  const cardGesture=Gesture.Exclusive(panGesture,tapGesture);

  function doVersus(winnerId:string){
    if(pool.length<2) return;
    impact('light');
    updateElo(pool.map(b=>b.id),winnerId);
    setPairIdx(i=>i+1);
  }

  function dismissRules(){ seenRules=true; setShowRules(false); }

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    {/* A Modal renders in its own native hierarchy, so gestures inside it need
        their own GestureHandlerRootView to work. */}
    <GestureHandlerRootView style={{flex:1}}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="dark-content"/>
      {/* Header */}
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:14}}>
          <Text style={{fontSize:22,color:colors.text3}}>←</Text>
        </TouchableOpacity>
        <Text style={{flex:1,fontFamily:fonts.serifBold,fontSize:18,color:colors.text}}>Book Swipe</Text>
        <TouchableOpacity onPress={()=>setShowRules(true)} style={{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:colors.text2}}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Mode toggle */}
      <View style={{flexDirection:'row',gap:8,paddingHorizontal:spacing.lg,paddingTop:12}}>
        {(['swipe','versus'] as const).map(m=><TouchableOpacity key={m} onPress={()=>setMode(m)}
          style={{flex:1,paddingVertical:9,borderRadius:radius.pill,alignItems:'center',backgroundColor:mode===m?colors.accent:colors.surface,borderWidth:1,borderColor:mode===m?colors.accent:colors.border}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:12,color:mode===m?colors.accentText:colors.text2}}>{m==='swipe'?'Swipe':'Versus'}</Text>
        </TouchableOpacity>)}
      </View>

      {/* ── SWIPE MODE ── */}
      {mode==='swipe'&&<View style={{flex:1,paddingHorizontal:spacing.lg,paddingTop:10}}>
        {/* progress */}
        <View style={{marginBottom:6}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3}}>{queue.length} left</Text>
            <Animated.Text style={{fontFamily:fonts.sansBold,fontSize:11,color:colors.accent,transform:[{scale:countV}]}}>{sessionCount} this session</Animated.Text>
          </View>
          <View style={{height:4,borderRadius:2,backgroundColor:colors.surface2,overflow:'hidden'}}>
            <View style={{height:4,borderRadius:2,backgroundColor:colors.accent,width:`${Math.round(done/Math.max(1,total)*100)}%` as any}}/>
          </View>
        </View>

        {cur?<View style={{flex:1}}>
          {/* card zone — the cover deck dominates */}
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <View style={{width:COVER_W,alignItems:'center'}}>
              {/* deck behind — static (no per-frame animation) gives depth cheaply */}
              {next2&&<View pointerEvents="none" style={{position:'absolute',top:0,transform:[{translateY:-22},{scale:0.9}],opacity:0.4}}>
                <BookCover bookId={next2.id} size="lg" style={coverStyle}/>
              </View>}
              {next&&<View pointerEvents="none" style={{position:'absolute',top:0,transform:[{translateY:-11},{scale:0.95}],opacity:0.75}}>
                <BookCover bookId={next.id} size="lg" style={coverStyle}/>
              </View>}

              {/* active draggable card — gesture + transforms run on the UI thread */}
              <GestureDetector gesture={cardGesture}>
                <Reanimated.View style={[{alignItems:'center'},cardStyle]}>
                  <View style={{borderRadius:radius.md}}>
                    <BookCover bookId={cur.id} size="lg" style={coverStyle}/>
                    {/* verdict stamps */}
                    <Reanimated.View style={[{position:'absolute',top:16,left:14,borderWidth:3,borderColor:colors.accent,paddingHorizontal:12,paddingVertical:5,borderRadius:8,transform:[{rotate:'-14deg'}],backgroundColor:'rgba(79,122,91,0.22)'},yesStyle]}>
                      <Text style={{fontFamily:fonts.sansBold,fontSize:22,color:colors.accent,letterSpacing:1.5}}>YES ♥</Text>
                    </Reanimated.View>
                    <Reanimated.View style={[{position:'absolute',top:16,right:14,borderWidth:3,borderColor:colors.danger,paddingHorizontal:12,paddingVertical:5,borderRadius:8,transform:[{rotate:'14deg'}],backgroundColor:'rgba(180,101,74,0.22)'},nopeStyle]}>
                      <Text style={{fontFamily:fonts.sansBold,fontSize:22,color:colors.danger,letterSpacing:1.5}}>NOPE ✕</Text>
                    </Reanimated.View>
                    <Reanimated.View style={[{position:'absolute',bottom:16,alignSelf:'center',borderWidth:3,borderColor:colors.surface,paddingHorizontal:14,paddingVertical:5,borderRadius:8,backgroundColor:'rgba(38,32,25,0.55)'},skipStyle]}>
                      <Text style={{fontFamily:fonts.sansBold,fontSize:17,color:colors.surface,letterSpacing:1.5}}>SKIP ↑</Text>
                    </Reanimated.View>
                  </View>

                  {/* info block — flies away with the card */}
                  <Text style={{fontFamily:fonts.serifBold,fontSize:21,lineHeight:27,color:colors.text,marginTop:16,textAlign:'center',maxWidth:COVER_W+40}} numberOfLines={2}>{cur.title}</Text>
                  <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,marginTop:2,textAlign:'center'}}>{cur.author}</Text>
                  <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6,marginTop:10}}>
                    {cur.readers>0&&<View style={metaChip}><Text style={metaTxt}>★ {cur.avgRating}</Text></View>}
                    {curVibe?.pace?<View style={metaChip}><Text style={metaTxt}>{curVibe.pace}</Text></View>:null}
                    {cur.pages?<View style={metaChip}><Text style={metaTxt}>{cur.pages}p</Text></View>:null}
                  </View>
                </Reanimated.View>
              </GestureDetector>
            </View>

          </View>

          {/* action buttons — Tinder layout: matching Nope/Yes, smaller Skip in the middle */}
          <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:26,paddingTop:spacing.sm,paddingBottom:spacing.md}}>
            {([['dislike','Nope'],['next','Skip'],['like','Yes']] as const).map(([act,lbl])=>{const v=VERDICT[act];const mid=act==='next';
              return <View key={act} style={{alignItems:'center',gap:8}}>
                <TouchableOpacity onPress={()=>doFling(act)} activeOpacity={0.75} style={[swBtn,mid&&swBtnSmall,{borderColor:v.color}]}>
                  <Text style={{fontSize:mid?22:28,color:v.color}}>{v.icon}</Text>
                </TouchableOpacity>
                <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3}}>{lbl}</Text>
              </View>;})}
          </View>
        </View>:<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontFamily:fonts.serifItalic,fontSize:40,color:colors.accent,marginBottom:16}}>fin.</Text>
          <Text style={{fontFamily:fonts.serifBold,fontSize:18,color:colors.text,marginBottom:8}}>All caught up</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center'}}>You've swiped every book in the catalogue.{'\n'}Try Versus mode to refine your rankings.</Text>
        </View>}
      </View>}

      {/* ── VERSUS MODE ── */}
      {mode==='versus'&&<View style={{flex:1,paddingHorizontal:spacing.lg,justifyContent:'center'}}>
        <Text style={{fontFamily:fonts.serifBold,fontSize:21,color:colors.text,textAlign:'center'}}>Which would you rather read?</Text>
        <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,textAlign:'center',marginTop:4,marginBottom:spacing.xl}}>Tap to pick · builds your rankings</Text>
        {pool.length>=2?<View style={{flexDirection:'row',alignItems:'flex-start',justifyContent:'center'}}>
          {[pool[0],null,pool[1]].map((b,i)=>b===null
            ?<View key="vs" style={{width:50,height:VS_H,alignItems:'center',justifyContent:'center'}}>
              <View style={{width:42,height:42,borderRadius:21,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center',...shadow.soft}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:13,color:colors.accentText,letterSpacing:0.5}}>VS</Text>
              </View>
            </View>
            :<TouchableOpacity key={b.id} onPress={()=>doVersus(b.id)} onLongPress={()=>onOpenBook(b.id)} activeOpacity={0.85} style={{width:VS_W,alignItems:'center'}}>
              <BookCover bookId={b.id} size="lg" style={{width:VS_W,height:VS_H,borderRadius:radius.md,...shadow.card}}/>
              <Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text,marginTop:12,textAlign:'center',lineHeight:19}} numberOfLines={2}>{b.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2,textAlign:'center'}} numberOfLines={1}>{b.author}</Text>
              {eloRatings[b.id]?<View style={{marginTop:6,paddingHorizontal:9,paddingVertical:3,backgroundColor:colors.surface2,borderRadius:radius.pill}}><Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent}}>{eloRatings[b.id]} ELO</Text></View>:null}
            </TouchableOpacity>)}
        </View>:<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,textAlign:'center'}}>Need more books to compare.</Text>}
        <TouchableOpacity onPress={()=>{tick();setPairIdx(i=>i+1);}} style={{marginTop:spacing.xl,alignSelf:'center',paddingVertical:8,paddingHorizontal:16}}>
          <Text style={{fontFamily:fonts.sansMedium,fontSize:13,color:colors.text3}}>Skip this pair →</Text>
        </TouchableOpacity>
        <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,textAlign:'center',marginTop:6}}>Long-press a cover to open it</Text>
      </View>}

      {/* ── RULES OVERLAY ── */}
      {showRules&&<View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(38,32,25,0.55)',alignItems:'center',justifyContent:'center',padding:spacing.lg}}>
        <View style={{backgroundColor:colors.bg,borderRadius:radius.xl,padding:spacing.xl,width:'100%',maxWidth:380,...shadow.card}}>
          <Text style={{fontFamily:fonts.serifBold,fontSize:24,color:colors.text,marginBottom:4}}>How Book Swipe works</Text>
          <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text2,lineHeight:20,marginBottom:20}}>Three ways to react to each book. No wrong answers — every swipe sharpens your recommendations.</Text>
          {(['like','dislike','next'] as const).map(act=>{const v=VERDICT[act];const dir=act==='like'?'Swipe right':act==='dislike'?'Swipe left':'Swipe up';
            return <View key={act} style={{flexDirection:'row',gap:14,alignItems:'center',marginBottom:16}}>
              <View style={[swBtn,{width:48,height:48,borderColor:v.color}]}><Text style={{fontSize:20,color:v.color}}>{v.icon}</Text></View>
              <View style={{flex:1}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:colors.text}}>{dir} · {v.label}</Text>
                <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3,marginTop:1,lineHeight:17}}>{v.sub}</Text>
              </View>
            </View>;})}
          <View style={{backgroundColor:colors.accentDim,borderRadius:radius.md,padding:12,marginTop:4,marginBottom:18}}>
            <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.accent,lineHeight:18}}>This only trains your recommendations — it won't touch your shelves or ratings.</Text>
          </View>
          <TouchableOpacity onPress={dismissRules} style={{backgroundColor:colors.accent,paddingVertical:14,borderRadius:radius.pill,alignItems:'center'}}>
            <Text style={{fontFamily:fonts.sansBold,fontSize:14,color:colors.accentText}}>Start swiping</Text>
          </TouchableOpacity>
        </View>
      </View>}
    </SafeAreaView>
    </GestureHandlerRootView>
  </Modal>;
}

const swBtn:any={width:64,height:64,borderRadius:32,backgroundColor:colors.surface,borderWidth:1.5,borderColor:colors.border,alignItems:'center',justifyContent:'center',...shadow.card};
const swBtnSmall:any={width:52,height:52,borderRadius:26};
const metaChip:any={paddingHorizontal:11,paddingVertical:5,backgroundColor:colors.surface2,borderRadius:radius.pill};
const metaTxt:any={fontFamily:fonts.sansMedium,fontSize:11,color:colors.text2};
