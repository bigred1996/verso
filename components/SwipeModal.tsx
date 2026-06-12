import React,{useState,useRef,useEffect} from 'react';
import {Modal,View,Text,TouchableOpacity,SafeAreaView,StatusBar,Animated,PanResponder,Dimensions,Platform,Easing} from 'react-native';
import {colors,spacing,fonts,type,radius,shadow,pastels,pastelText} from '../constants/theme';
import {BOOKS} from '../data/books';
import {useStore} from '../store';
import BookCover from './BookCover';
import {tick,impact,notify} from '../utils/haptics';

const SCREEN_W=Dimensions.get('window').width;
const FLING_X=110, FLING_Y=110;

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
  const total=allBooks.length;
  const done=total-queue.length;

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

  // ── Drag animation ──
  const pan=useRef(new Animated.ValueXY()).current;
  const rotate=pan.x.interpolate({inputRange:[-250,0,250],outputRange:['-14deg','0deg','14deg']});
  const likeOpacity=pan.x.interpolate({inputRange:[30,FLING_X],outputRange:[0,1],extrapolate:'clamp'});
  const nopeOpacity=pan.x.interpolate({inputRange:[-FLING_X,-30],outputRange:[1,0],extrapolate:'clamp'});
  const laterOpacity=pan.y.interpolate({inputRange:[-FLING_Y,-30],outputRange:[1,0],extrapolate:'clamp'});
  const nextScale=pan.x.interpolate({inputRange:[-200,0,200],outputRange:[1,0.94,1],extrapolate:'clamp'});
  const glowLike=pan.x.interpolate({inputRange:[0,FLING_X],outputRange:[0,1],extrapolate:'clamp'});
  const glowNope=pan.x.interpolate({inputRange:[-FLING_X,0],outputRange:[1,0],extrapolate:'clamp'});

  // Light haptic tick the moment a drag crosses a commit threshold — so you
  // feel the card "arm" before you let go. Re-arms once you fall back under.
  const armed=useRef<{x:boolean;y:boolean}>({x:false,y:false});
  useEffect(()=>{
    const onX=pan.x.addListener(({value})=>{
      const past=Math.abs(value)>FLING_X;
      if(past&&!armed.current.x){ armed.current.x=true; tick(); }
      else if(!past&&armed.current.x){ armed.current.x=false; }
    });
    const onY=pan.y.addListener(({value})=>{
      const past=value<-FLING_Y;
      if(past&&!armed.current.y){ armed.current.y=true; tick(); }
      else if(!past&&armed.current.y){ armed.current.y=false; }
    });
    return ()=>{ pan.x.removeListener(onX); pan.y.removeListener(onY); };
  },[]);

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
      Animated.spring(popV,{toValue:1,friction:5,tension:120,useNativeDriver:false}),
      Animated.delay(420),
      Animated.timing(popV,{toValue:0,duration:240,useNativeDriver:false}),
    ]).start(()=>setPopAction(null));
    setSessionCount(c=>c+1);
    countV.setValue(0.6);
    Animated.spring(countV,{toValue:1,friction:4,useNativeDriver:false}).start();
    if(action==='like'){
      confV.setValue(0);
      setBursting(true);
      Animated.timing(confV,{toValue:1,duration:680,easing:Easing.out(Easing.quad),useNativeDriver:false}).start(()=>setBursting(false));
    }
  }

  function commitSwipe(action:Action){
    if(!cur) return;
    recordSwipe(cur.id,action);
    celebrate(action);
    pan.setValue({x:0,y:0});
  }
  function flingOut(action:Action){
    const toX=action==='like'?SCREEN_W+120:action==='dislike'?-(SCREEN_W+120):0;
    const toY=action==='next'?-700:60;
    Animated.timing(pan,{toValue:{x:toX,y:toY},duration:220,useNativeDriver:false}).start(()=>commitSwipe(action));
  }
  // dx/dy = how far the card moved; vx/vy = release velocity. A fast flick
  // commits even when the card hasn't travelled past the distance threshold,
  // so the gesture feels responsive instead of requiring a long drag.
  function settleRelease(dx:number,dy:number,vx=0,vy=0){
    const fastX=Math.abs(vx)>0.4, fastUp=vy<-0.4;
    if(dx>FLING_X||(fastX&&vx>0&&dx>40)) flingOut('like');
    else if(dx<-FLING_X||(fastX&&vx<0&&dx<-40)) flingOut('dislike');
    else if(dy<-FLING_Y||(fastUp&&dy<-40)) flingOut('next');
    else Animated.spring(pan,{toValue:{x:0,y:0},friction:5,useNativeDriver:false}).start();
  }

  const responder=useRef(PanResponder.create({
    onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>6||Math.abs(g.dy)>6,
    onPanResponderMove:Animated.event([null,{dx:pan.x,dy:pan.y}],{useNativeDriver:false}),
    onPanResponderRelease:(_,g)=>settleRelease(g.dx,g.dy,g.vx,g.vy),
  })).current;
  const panHandlers=Platform.OS==='web'?{}:responder.panHandlers;
  // On native a pure tap (no drag) opens the book; a drag is claimed by the
  // PanResponder above and cancels this press. Web handles tap in its own
  // pointerup listener, so leave it undefined there to avoid double-firing.
  const tapToOpen=Platform.OS==='web'?undefined:()=>{ if(cur) onOpenBook(cur.id); };

  // Web: direct pointer listeners; small movement = tap → open the book page
  const cardRef=useRef<any>(null);
  const releaseRef=useRef(settleRelease); releaseRef.current=settleRelease;
  const openRef=useRef(onOpenBook); openRef.current=onOpenBook;
  const curIdRef=useRef(cur?.id); curIdRef.current=cur?.id;
  useEffect(()=>{
    if(Platform.OS!=='web') return;
    const node=cardRef.current as any;
    if(!node||!node.addEventListener) return;
    let sx=0,sy=0,dragging=false;
    const down=(e:PointerEvent)=>{dragging=true;sx=e.clientX;sy=e.clientY;try{node.setPointerCapture?.(e.pointerId);}catch{}};
    const move=(e:PointerEvent)=>{if(!dragging)return;pan.setValue({x:e.clientX-sx,y:e.clientY-sy});};
    const up=(e:PointerEvent)=>{if(!dragging)return;dragging=false;const dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)<6&&Math.abs(dy)<6){ pan.setValue({x:0,y:0}); if(curIdRef.current) openRef.current(curIdRef.current); }
      else releaseRef.current(dx,dy);};
    node.addEventListener('pointerdown',down);
    node.addEventListener('pointermove',move);
    node.addEventListener('pointerup',up);
    node.addEventListener('pointercancel',up);
    return ()=>{node.removeEventListener('pointerdown',down);node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',up);node.removeEventListener('pointercancel',up);};
  },[cur?.id]);

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
      {mode==='swipe'&&<View style={{flex:1,paddingHorizontal:spacing.lg,paddingTop:12}}>
        {/* progress */}
        <View style={{marginBottom:12}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
            <Text style={{fontFamily:fonts.sansMedium,fontSize:11,color:colors.text3}}>{queue.length} left</Text>
            <Animated.Text style={{fontFamily:fonts.sansBold,fontSize:11,color:colors.accent,transform:[{scale:countV}]}}>{sessionCount} swiped this session</Animated.Text>
          </View>
          <View style={{height:5,borderRadius:3,backgroundColor:colors.surface2,overflow:'hidden'}}>
            <View style={{height:5,borderRadius:3,backgroundColor:colors.accent,width:`${Math.round(done/Math.max(1,total)*100)}%` as any}}/>
          </View>
        </View>

        {cur?<View style={{flex:1,alignItems:'center'}}>
          <View style={{width:'100%',flex:1,alignItems:'center',justifyContent:'flex-start'}}>
            {/* next card peeking */}
            {next&&<Animated.View style={{position:'absolute',top:8,alignItems:'center',transform:[{scale:nextScale}],opacity:0.4}}>
              <BookCover bookId={next.id} size="lg"/>
            </Animated.View>}

            {/* draggable card */}
            <Animated.View ref={cardRef} {...panHandlers}
              style={{alignItems:'center',transform:[{translateX:pan.x},{translateY:pan.y},{rotate}],cursor:'grab',touchAction:'none'} as any}>
              <TouchableOpacity activeOpacity={0.92} onPress={tapToOpen}>
                {/* glow ring tinted by drag direction */}
                <Animated.View pointerEvents="none" style={{position:'absolute',top:-4,left:-4,right:-4,bottom:-4,borderRadius:12,borderWidth:3,borderColor:colors.accent,opacity:glowLike}}/>
                <Animated.View pointerEvents="none" style={{position:'absolute',top:-4,left:-4,right:-4,bottom:-4,borderRadius:12,borderWidth:3,borderColor:colors.danger,opacity:glowNope}}/>
                <BookCover bookId={cur.id} size="lg"/>
                {/* verdict stamps */}
                <Animated.View style={{position:'absolute',top:10,left:8,opacity:likeOpacity,borderWidth:3,borderColor:colors.accent,paddingHorizontal:10,paddingVertical:4,borderRadius:8,transform:[{rotate:'-14deg'}],backgroundColor:'rgba(79,122,91,0.18)'}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:18,color:colors.accent,letterSpacing:1.5}}>YES ♥</Text>
                </Animated.View>
                <Animated.View style={{position:'absolute',top:10,right:8,opacity:nopeOpacity,borderWidth:3,borderColor:colors.danger,paddingHorizontal:10,paddingVertical:4,borderRadius:8,transform:[{rotate:'14deg'}],backgroundColor:'rgba(180,101,74,0.18)'}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:18,color:colors.danger,letterSpacing:1.5}}>NOPE ✕</Text>
                </Animated.View>
                <Animated.View style={{position:'absolute',bottom:10,alignSelf:'center',opacity:laterOpacity,borderWidth:3,borderColor:colors.text3,paddingHorizontal:10,paddingVertical:4,borderRadius:8,backgroundColor:'rgba(90,78,58,0.22)'}}>
                  <Text style={{fontFamily:fonts.sansBold,fontSize:15,color:colors.text2,letterSpacing:1.5}}>SKIP ↑</Text>
                </Animated.View>
              </TouchableOpacity>
              <Text style={{fontFamily:fonts.serifBold,fontSize:20,color:colors.text,marginTop:16,textAlign:'center'}}>{cur.title}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:13,color:colors.text3,marginBottom:6,textAlign:'center'}}>{cur.author}</Text>
              <Text style={{fontFamily:fonts.sans,fontSize:11,color:colors.text2,textAlign:'center',maxWidth:280,lineHeight:17}} numberOfLines={3}>{cur.synopsis}</Text>
              <Text style={{fontFamily:fonts.sansMedium,fontSize:10,color:colors.text3,marginTop:8}}>Tap the card for full details ›</Text>
            </Animated.View>

            {/* pop confirmation badge */}
            {pop&&<Animated.View pointerEvents="none" style={{position:'absolute',top:'34%',alignSelf:'center',opacity:popV,transform:[{scale:popV.interpolate({inputRange:[0,1],outputRange:[0.5,1]})}]}}>
              <View style={{backgroundColor:pop.color,paddingHorizontal:22,paddingVertical:12,borderRadius:radius.pill,...shadow.card}}>
                <Text style={{fontFamily:fonts.sansBold,fontSize:18,color:'#fff'}}>{pop.icon} {pop.label}</Text>
              </View>
            </Animated.View>}
            {/* confetti */}
            {bursting&&particles.map((p,i)=><Animated.View key={i} pointerEvents="none" style={{position:'absolute',top:'40%',alignSelf:'center',width:8,height:8,borderRadius:4,backgroundColor:p.color,
              opacity:confV.interpolate({inputRange:[0,0.85,1],outputRange:[1,1,0]}),
              transform:[
                {translateX:confV.interpolate({inputRange:[0,1],outputRange:[0,p.dx*p.dist]})},
                {translateY:confV.interpolate({inputRange:[0,1],outputRange:[0,p.dy*p.dist-40]})},
                {scale:confV.interpolate({inputRange:[0,1],outputRange:[1,0.4]})},
              ]}}/>)}
          </View>

          {/* action buttons = persistent legend */}
          <View style={{flexDirection:'row',justifyContent:'center',gap:20,paddingVertical:spacing.md}}>
            {([['dislike','Not for me'],['next','Skip'],['like','Yes']] as const).map(([act,lbl])=>{const v=VERDICT[act];
              return <View key={act} style={{alignItems:'center',gap:6}}>
                <TouchableOpacity onPress={()=>flingOut(act)} style={[swBtn,{borderColor:v.color}]}>
                  <Text style={{fontSize:act==='like'?26:22,color:v.color}}>{v.icon}</Text>
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
  </Modal>;
}

const swBtn:any={width:62,height:62,borderRadius:31,backgroundColor:colors.surface,borderWidth:2,borderColor:colors.border,alignItems:'center',justifyContent:'center',...shadow.soft};
