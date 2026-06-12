import React,{useState,useRef,useLayoutEffect} from 'react';
import {Modal,View,Text,TouchableOpacity,SafeAreaView,StatusBar,Animated,Dimensions,Easing} from 'react-native';
import Reanimated,{useSharedValue,useAnimatedStyle,withSpring,withTiming,runOnJS,interpolate,Extrapolation} from 'react-native-reanimated';
import {Gesture,GestureDetector,GestureHandlerRootView} from 'react-native-gesture-handler';
import {colors,spacing,fonts,type,radius,shadow,pastels,pastelText} from '../constants/theme';
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
  const [muted,setMuted]=useState(false);
  const [showRules,setShowRules]=useState(!seenRules);
  const [sessionCount,setSessionCount]=useState(0);
  const [popAction,setPopAction]=useState<Action|null>(null);
  const [bursting,setBursting]=useState(false);

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

  const cardStyle=useAnimatedStyle(()=>({
    transform:[
      {translateX:tx.value},
      {translateY:ty.value},
      {rotate:`${interpolate(tx.value,[-250,0,250],[-14,0,14],Extrapolation.CLAMP)}deg`},
    ],
  }));
  const yesStyle=useAnimatedStyle(()=>({opacity:interpolate(tx.value,[30,FLING_X],[0,1],Extrapolation.CLAMP)}));
  const nopeStyle=useAnimatedStyle(()=>({opacity:interpolate(tx.value,[-FLING_X,-30],[1,0],Extrapolation.CLAMP)}));
  const skipStyle=useAnimatedStyle(()=>({opacity:interpolate(ty.value,[-FLING_Y,-30],[1,0],Extrapolation.CLAMP)}));

  // Re-centre instantly when a new book becomes current (after a fling), before
  // paint — so the outgoing card never flashes back to centre.
  useLayoutEffect(()=>{ tx.value=0; ty.value=0; },[cur?.id]);

  // ── Pop confirmation + counter bounce ──
  const popV=useRef(new Animated.Value(0)).current;
  const countV=useRef(new Animated.Value(1)).current;
  // ── Confetti (fired on 'like') ──
  const confV=useRef(new Animated.Value(0)).current;
  const particles=useRef(Array.from({length:14},(_,i)=>{
    const a=(i/14)*Math.PI*2+(i%2?0.3:0);
    return {dx:Math.cos(a),dy:Math.sin(a),dist:70+(i%5)*16,color:[colors.accent,pastelText.butter,pastelText.blush,pastelText.sky][i%4]};
  })).current;

  // ── Sound (Web Audio synth) ──
  const audioRef=useRef<any>(null);
  function ac(){
    if(typeof window==='undefined') return null;
    const AC=(window as any).AudioContext||(window as any).webkitAudioContext;
    if(!AC) return null;
    if(!audioRef.current) audioRef.current=new AC();
    if(audioRef.current.state==='suspended') audioRef.current.resume();
    return audioRef.current;
  }
  function beep(freq:number,dur:number,type:OscillatorType,vol:number,when:number){
    const c=ac(); if(!c) return;
    const o=c.createOscillator(),g=c.createGain();
    o.type=type; o.frequency.value=freq; o.connect(g); g.connect(c.destination);
    const t=c.currentTime+when;
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.start(t); o.stop(t+dur);
  }
  function playSound(action:Action){
    if(muted) return;
    try{
      if(action==='like'){ beep(587,0.13,'triangle',0.08,0); beep(880,0.17,'triangle',0.06,0.09); }
      else if(action==='dislike'){ beep(150,0.2,'sawtooth',0.05,0); }
      else { beep(440,0.09,'square',0.045,0); }
    }catch{}
    try{ if(typeof navigator!=='undefined'&&(navigator as any).vibrate) (navigator as any).vibrate(action==='like'?[6,24,6]:8); }catch{}
  }

  function celebrate(action:Action){
    playSound(action);
    if(action==='like') notify('success');
    else if(action==='dislike') impact('heavy');
    else tick();
    setPopAction(action);
    popV.setValue(0);
    Animated.sequence([
      Animated.spring(popV,{toValue:1,friction:5,tension:120,useNativeDriver:true}),
      Animated.delay(420),
      Animated.timing(popV,{toValue:0,duration:240,useNativeDriver:true}),
    ]).start(()=>setPopAction(null));
    setSessionCount(c=>c+1);
    countV.setValue(0.6);
    Animated.spring(countV,{toValue:1,friction:4,useNativeDriver:true}).start();
    if(action==='like'){
      confV.setValue(0);
      setBursting(true);
      Animated.timing(confV,{toValue:1,duration:680,easing:Easing.out(Easing.quad),useNativeDriver:true}).start(()=>setBursting(false));
    }
  }

  function commitSwipe(action:Action){
    if(!cur) return;
    // recordSwipe advances the queue → useLayoutEffect re-centres pan before
    // paint, so we must NOT reset pan here (that would snap the old card back).
    recordSwipe(cur.id,action);
    celebrate(action);
  }
  // Fling the card off-screen, then commit on the JS thread once it's gone.
  // Callable from the gesture (via runOnJS) and from the action buttons.
  function doFling(action:Action){
    const toX=action==='like'?SCREEN_W+140:action==='dislike'?-(SCREEN_W+140):0;
    const toY=action==='next'?-(SCREEN_H+140):60;
    tx.value=withTiming(toX,{duration:200});
    ty.value=withTiming(toY,{duration:200},(finished)=>{ if(finished) runOnJS(commitSwipe)(action); });
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
      else { tx.value=withSpring(0,{damping:20,stiffness:200}); ty.value=withSpring(0,{damping:20,stiffness:200}); }
    });
  const tapGesture=Gesture.Tap().maxDistance(12).onEnd((_e,success)=>{ if(success) runOnJS(openCur)(); });
  const cardGesture=Gesture.Exclusive(panGesture,tapGesture);

  function doVersus(winnerId:string){
    if(pool.length<2) return;
    impact('light');
    updateElo(pool.map(b=>b.id),winnerId);
    setPairIdx(i=>i+1);
    if(!muted) try{ beep(660,0.1,'triangle',0.06,0); beep(990,0.12,'triangle',0.05,0.07); }catch{}
  }

  function dismissRules(){ seenRules=true; setShowRules(false); }

  const pop=popAction?VERDICT[popAction]:null;

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
        <TouchableOpacity onPress={()=>setMuted(m=>!m)} style={{width:34,height:34,borderRadius:17,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:16,color:muted?colors.text3:colors.accent}}>{muted?'🔇':'🔊'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setShowRules(true)} style={{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center',marginLeft:4}}>
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

            {/* pop confirmation badge */}
            {pop&&<Animated.View pointerEvents="none" style={{position:'absolute',opacity:popV,transform:[{scale:popV.interpolate({inputRange:[0,1],outputRange:[0.5,1]})}]}}>
              <View style={{backgroundColor:pop.color,paddingHorizontal:24,paddingVertical:13,borderRadius:radius.pill,...shadow.card}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:19,color:'#fff'}}>{pop.icon} {pop.label}</Text>
              </View>
            </Animated.View>}
            {/* confetti */}
            {bursting&&particles.map((p,i)=><Animated.View key={i} pointerEvents="none" style={{position:'absolute',width:8,height:8,borderRadius:4,backgroundColor:p.color,
              opacity:confV.interpolate({inputRange:[0,0.85,1],outputRange:[1,1,0]}),
              transform:[
                {translateX:confV.interpolate({inputRange:[0,1],outputRange:[0,p.dx*p.dist]})},
                {translateY:confV.interpolate({inputRange:[0,1],outputRange:[0,p.dy*p.dist-40]})},
                {scale:confV.interpolate({inputRange:[0,1],outputRange:[1,0.4]})},
              ]}}/>)}
          </View>

          {/* action buttons */}
          <View style={{flexDirection:'row',justifyContent:'center',alignItems:'flex-end',gap:28,paddingTop:spacing.sm,paddingBottom:spacing.md}}>
            {([['dislike','Nope'],['next','Skip'],['like','Yes']] as const).map(([act,lbl])=>{const v=VERDICT[act];const big=act==='like';
              return <View key={act} style={{alignItems:'center',gap:7}}>
                <TouchableOpacity onPress={()=>doFling(act)} activeOpacity={0.8} style={[swBtn,big&&swBtnBig,{borderColor:v.color}]}>
                  <Text style={{fontSize:big?30:24,color:v.color}}>{v.icon}</Text>
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
      {mode==='versus'&&<View style={{flex:1,padding:spacing.lg,alignItems:'center'}}>
        <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginBottom:spacing.lg,textAlign:'center'}}>Tap the book you prefer · builds your ELO rankings</Text>
        {pool.length>=2?<View style={{flexDirection:'row',gap:16,alignItems:'flex-start',justifyContent:'center'}}>
          {pool.map(b=><TouchableOpacity key={b.id} onPress={()=>doVersus(b.id)} onLongPress={()=>onOpenBook(b.id)} activeOpacity={0.8}
            style={{width:140,alignItems:'center'}}>
            <BookCover bookId={b.id} size="md"/>
            <Text style={{fontFamily:fonts.serifBold,fontSize:14,color:colors.text,marginTop:10,textAlign:'center',lineHeight:19}}>{b.title}</Text>
            <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text3,marginTop:2}}>{b.author}</Text>
            {eloRatings[b.id]?<Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.accent,marginTop:4}}>{eloRatings[b.id]} ELO</Text>:null}
          </TouchableOpacity>)}
        </View>:<Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3}}>Need more books to compare.</Text>}
        <Text style={{fontFamily:fonts.sans,fontSize:10,color:colors.text3,marginTop:10}}>Long-press a cover to open its page</Text>
        <TouchableOpacity onPress={()=>setPairIdx(i=>i+1)} style={{marginTop:spacing.lg,paddingVertical:10}}>
          <Text style={{fontFamily:fonts.sans,fontSize:12,color:colors.text3}}>Skip this pair →</Text>
        </TouchableOpacity>
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

const swBtn:any={width:60,height:60,borderRadius:30,backgroundColor:colors.surface,borderWidth:2,borderColor:colors.border,alignItems:'center',justifyContent:'center',...shadow.card};
const swBtnBig:any={width:72,height:72,borderRadius:36};
const metaChip:any={paddingHorizontal:11,paddingVertical:5,backgroundColor:colors.surface2,borderRadius:radius.pill};
const metaTxt:any={fontFamily:fonts.sansMedium,fontSize:11,color:colors.text2};
