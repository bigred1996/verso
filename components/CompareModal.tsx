import React,{useState} from 'react';
import {Modal,View,Text,TouchableOpacity,ScrollView,SafeAreaView,StatusBar} from 'react-native';
import {colors,spacing} from '../constants/theme';
import {BOOKS,FRIENDS} from '../data/books';
import {useStore} from '../store';

const FRIEND_RATINGS:Record<string,Record<string,number>>={
  elif:{'stoner':5,'normal-people':4,'intermezzo':5,'conversations-with-friends':3,'remains-of-the-day':4,'james':5,'demon-copperhead':4},
  marcus:{'stoner':4,'the-road':5,'white-noise':4,'the-sympathizer':4,'a-little-life':3},
  juno:{'a-little-life':5,'normal-people':4,'my-year-of-rest':4,'conversations-with-friends':4},
  priya:{'remains-of-the-day':5,'pachinko':5,'james':4,'the-sympathizer':3,'demon-copperhead':4},
};
const FRIEND_STATS:Record<string,{books:number;pages:number;avgRating:number;topGenre:string;streak:number}>={
  elif:  {books:31,pages:10340,avgRating:4.4,topGenre:'Literary Fiction',streak:12},
  marcus:{books:24,pages:7800, avgRating:3.8,topGenre:'Post-Apocalyptic',streak:4},
  juno:  {books:19,pages:5680, avgRating:4.2,topGenre:'Literary Fiction',streak:8},
  priya: {books:27,pages:8910, avgRating:4.5,topGenre:'Historical Fiction',streak:6},
};

interface Props { visible:boolean; onClose:()=>void; }

export default function CompareModal({visible,onClose}:Props){
  const {shelf,ratings}=useStore();
  const [friend,setFriend]=useState('elif');
  const fr=FRIENDS.find(f=>f.id===friend)!;
  const fRatings=FRIEND_RATINGS[friend]||{};
  const fStats=FRIEND_STATS[friend];
  const allBooks=[...BOOKS,...(useStore.getState().customBooks||[])];

  // Taste match
  const shared=Object.keys(ratings).filter(id=>fRatings[id]);
  const matchPct=shared.length?Math.round(shared.reduce((sum,id)=>{
    const diff=Math.abs(ratings[id]-(fRatings[id]||3));
    return sum+(1-diff/4);
  },0)/shared.length*100):fr.match;

  // My stats
  const myRead=allBooks.filter(b=>shelf[b.id]==='read');
  const myVals=Object.values(ratings).filter(Number.isFinite) as number[];
  const myAvg=myVals.length?(myVals.reduce((a,b)=>a+b,0)/myVals.length).toFixed(1):'—';

  // Shared books
  const sharedBooks=allBooks.filter(b=>ratings[b.id]&&fRatings[b.id]);

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <StatusBar barStyle="light-content"/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border}}>
        <TouchableOpacity onPress={onClose} style={{paddingRight:16}}><Text style={{fontSize:22,color:colors.text3}}>←</Text></TouchableOpacity>
        <Text style={{flex:1,fontSize:14,color:colors.text,fontWeight:'600'}}>Compare Stats</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Friend picker */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={sec}>Compare with</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:'row',gap:8}}>
              {FRIENDS.map(f=>{
                const active=friend===f.id;
                return <TouchableOpacity key={f.id} onPress={()=>setFriend(f.id)}
                  style={{alignItems:'center',paddingVertical:8,paddingHorizontal:12,backgroundColor:active?colors.accentDim:colors.surface,borderWidth:1,borderColor:active?colors.accent:colors.border}}>
                  <View style={{width:36,height:36,borderRadius:18,backgroundColor:f.color+'28',alignItems:'center',justifyContent:'center',marginBottom:4}}>
                    <Text style={{fontSize:14,fontWeight:'700',color:f.color}}>{f.init}</Text>
                  </View>
                  <Text style={{fontSize:10,color:active?colors.accent:colors.text3}}>{f.name.split(' ')[0]}</Text>
                </TouchableOpacity>;
              })}
            </View>
          </ScrollView>
        </View>

        {/* Match score */}
        <View style={{padding:spacing.lg,alignItems:'center',borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={{fontSize:52,color:colors.accent,fontWeight:'700'}}>{matchPct}%</Text>
          <Text style={{fontSize:13,color:colors.text3,marginTop:4}}>taste match with {fr.name.split(' ')[0]}</Text>
          <Text style={{fontSize:11,color:colors.text3,marginTop:2}}>based on {shared.length||'~'} shared ratings</Text>
        </View>

        {/* Stats comparison table */}
        <View style={{padding:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.border}}>
          <Text style={sec}>Head to Head</Text>
          {[
            {l:'Books read',you:String(myRead.length),them:String(fStats.books)},
            {l:'Avg rating',you:myAvg+'',them:fStats.avgRating.toFixed(1)},
            {l:'Top genre',you:'Literary Fiction',them:fStats.topGenre},
            {l:'Streak',you:'3 days',them:`${fStats.streak} days`},
          ].map(row=><View key={row.l} style={{flexDirection:'row',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={{flex:1,fontSize:12,color:colors.text,fontWeight:'600',textAlign:'center'}}>{row.you}</Text>
            <Text style={{width:100,fontSize:10,color:colors.text3,textAlign:'center',letterSpacing:0.5}}>{row.l}</Text>
            <Text style={{flex:1,fontSize:12,color:fr.color,fontWeight:'600',textAlign:'center'}}>{row.them}</Text>
          </View>)}
          <View style={{flexDirection:'row',marginTop:8}}>
            <Text style={{flex:1,fontSize:10,color:colors.text3,textAlign:'center'}}>You</Text>
            <View style={{width:100}}/>
            <Text style={{flex:1,fontSize:10,color:fr.color,textAlign:'center'}}>{fr.name.split(' ')[0]}</Text>
          </View>
        </View>

        {/* Shared books */}
        {sharedBooks.length>0&&<View style={{padding:spacing.lg}}>
          <Text style={sec}>Books you've both rated</Text>
          {sharedBooks.map(b=><View key={b.id} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <View style={{flex:1}}>
              <Text style={{fontSize:13,color:colors.text,marginBottom:2}} numberOfLines={1}>{b.title}</Text>
              <Text style={{fontSize:11,color:colors.text3}}>{b.author}</Text>
            </View>
            <View style={{flexDirection:'row',gap:16}}>
              <Text style={{fontSize:13,color:colors.text}}>{'★'.repeat(ratings[b.id]||0)}</Text>
              <Text style={{fontSize:13,color:fr.color}}>{'★'.repeat(fRatings[b.id]||0)}</Text>
            </View>
          </View>)}
        </View>}
        {sharedBooks.length===0&&<View style={{padding:spacing.xl,alignItems:'center'}}>
          <Text style={{fontSize:13,color:colors.text3,textAlign:'center'}}>Rate more books to see what you and {fr.name.split(' ')[0]} have in common.</Text>
        </View>}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
const sec:any={fontSize:9,letterSpacing:1.8,textTransform:'uppercase',color:colors.text3,fontWeight:'600',marginBottom:10};
