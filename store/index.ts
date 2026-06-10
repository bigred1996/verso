import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShelfStatus, Format, Book } from '../data/books';
export interface RereadEntry { date:string;rating:number;note:string; }
export interface Review { hotTake?:string; overall?:string; best?:string; forWhom?:string; date:string; }
export interface BuddyRead { bookId:string; partner:string; myPage:number; theirPage:number; note:string; }
export interface BookList { id:string; name:string; desc:string; bookIds:string[]; }
export interface UserClub { id:string; name:string; bookId:string; }
export interface UserChallenge { id:string; title:string; desc:string; goal:number; }
export interface JournalEntry { date:string;page:number;note:string; }
export interface JournalData  { page:number;entries:JournalEntry[]; }
interface State {
  shelf:Record<string,ShelfStatus>; ratings:Record<string,number>; formats:Record<string,Format>;
  rereads:Record<string,RereadEntry[]>; journal:Record<string,JournalData>; userTags:Record<string,string[]>;
  customBooks:Book[]; follows:Record<string,boolean>; challengeJoined:Record<string,boolean>;
  swipeData:Record<string,'like'|'dislike'|'next'>; eloRatings:Record<string,number>; streakDays:string[];
  clubMessages:Record<string,{user:string;text:string;ts:string}[]>;
  reviews:Record<string,Review>;
  buddyReads:BuddyRead[];
  favorites:string[];
  dnfReasons:Record<string,{reason:string;page:number}>;
  annualGoal:number;
  authorFollows:Record<string,boolean>;
  bookMoods:Record<string,{moods:string[];pace:string}>; // current user's post-rating tally
  lists:BookList[];
  userClubs:UserClub[];
  userChallenges:UserChallenge[];
  statsHidden:Record<string,boolean>;
  setShelf:(id:string,s:ShelfStatus|null)=>void;
  setRating:(id:string,v:number)=>void;
  setFormat:(id:string,f:Format|null)=>void;
  addCustomBook:(b:Book)=>void;
  setCustomBooks:(books:Book[])=>void;
  logToday:()=>void;
  addReread:(id:string,e:RereadEntry)=>void;
  updateJournal:(id:string,page:number)=>void;
  addJournalEntry:(id:string,e:JournalEntry)=>void;
  updateElo:(ids:string[],winner:string)=>void;
  sendClubMessage:(clubId:string,text:string)=>void;
  setUserTags:(id:string,tags:string[])=>void;
  setReview:(id:string,r:Partial<Review>)=>void;
  startBuddyRead:(bookId:string,partner:string)=>void;
  endBuddyRead:(bookId:string)=>void;
  joinChallenge:(id:string)=>void;
  toggleFavorite:(id:string)=>void;
  setDnfReason:(id:string,reason:string,page:number)=>void;
  setAnnualGoal:(n:number)=>void;
  toggleAuthorFollow:(name:string)=>void;
  setBookMoods:(id:string,moods:string[],pace:string)=>void;
  createList:(name:string,desc?:string)=>void;
  toggleListBook:(listId:string,bookId:string)=>void;
  deleteList:(listId:string)=>void;
  createClub:(name:string,bookId:string)=>void;
  createChallenge:(title:string,desc:string,goal:number)=>void;
  toggleStat:(key:string)=>void;
}
export const MOODS=['dark','emotional','reflective','tense','mysterious','funny','hopeful','adventurous','lighthearted','inspiring','sad'];
export const PACES=['slow burn','measured','propulsive'];
export const DNF_REASONS=['Not for me','Wrong time','Life happened','Actively bad','Too slow','Too fast'];
const TODAY=()=>{const d=new Date(2026,5,9);return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate();};
const ELO_K=32;
function calcElo(a:number,b:number,aWon:boolean){
  const ea=1/(1+Math.pow(10,(b-a)/400));
  const eb=1-ea;
  return [Math.round(a+ELO_K*(( aWon?1:0)-ea)),Math.round(b+ELO_K*((!aWon?1:0)-eb))];
}
export const useStore = create<State>()(persist((set)=>({
  shelf:{'remains-of-the-day':'reading','stoner':'read','a-little-life':'want','demon-copperhead':'want'},
  ratings:{stoner:4.5}, formats:{}, rereads:{},
  journal:{'remains-of-the-day':{page:184,entries:[{date:'Jun 6',page:48,note:"Stevens is already insufferable."},{date:'Jun 7',page:112,note:"The repression is doing something to me."},{date:'Jun 8',page:184,note:"I am not okay."}]}},
  userTags:{}, customBooks:[], follows:{}, challengeJoined:{'literary-dozen':true},
  swipeData:{}, eloRatings:{}, streakDays:[], clubMessages:{}, reviews:{},
  buddyReads:[{bookId:'intermezzo',partner:'elif',myPage:67,theirPage:103,note:"She's winning. As always."}],
  favorites:['stoner','remains-of-the-day','pachinko'],
  dnfReasons:{}, annualGoal:30, authorFollows:{'Sally Rooney':true,'Kazuo Ishiguro':true}, bookMoods:{},
  lists:[{id:'comfort',name:'Comfort Re-reads',desc:'For when the world is too much.',bookIds:['stoner','remains-of-the-day','gilead']},{id:'gut-punch',name:'Books That Wrecked Me',desc:'Read at your own risk.',bookIds:['a-little-life','never-let-me-go','beloved']}],
  userClubs:[], userChallenges:[], statsHidden:{},
  setShelf:(id,s)=>set(st=>{ const sh={...st.shelf}; if(s===null) delete sh[id]; else sh[id]=s; return {shelf:sh}; }),
  setRating:(id,v)=>set(st=>({ratings:{...st.ratings,[id]:v}})),
  setFormat:(id,f)=>set(st=>{ const fm={...st.formats}; if(f===null) delete fm[id]; else fm[id]=f; return {formats:fm}; }),
  addCustomBook:(b)=>set(st=>({customBooks:[...st.customBooks,b]})),
  setCustomBooks:(books)=>set(()=>({customBooks:books})),
  logToday:()=>set(st=>{const l=TODAY();return st.streakDays.includes(l)?{}:{streakDays:[...st.streakDays,l]};}),
  addReread:(id,e)=>set(st=>({rereads:{...st.rereads,[id]:[...(st.rereads[id]||[]),e]}})),
  updateJournal:(id,page)=>set(st=>({journal:{...st.journal,[id]:{...(st.journal[id]||{entries:[]}),page}}})),
  addJournalEntry:(id,e)=>set(st=>{const j=st.journal[id]||{page:0,entries:[]};return {journal:{...st.journal,[id]:{...j,entries:[...j.entries,e]}}};}),
  updateElo:(ids,winner)=>set(st=>{
    const a=ids[0],b=ids[1];
    const ra=st.eloRatings[a]??1000, rb=st.eloRatings[b]??1000;
    const [na,nb]=calcElo(ra,rb,winner===a);
    return {eloRatings:{...st.eloRatings,[a]:na,[b]:nb}};
  }),
  setUserTags:(id,tags)=>set(st=>({userTags:{...st.userTags,[id]:tags}})),
  setReview:(id,r)=>set(st=>{const cur=st.reviews[id]||{date:''};const ts=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][5]+' 9';return {reviews:{...st.reviews,[id]:{...cur,...r,date:ts}}};}),
  startBuddyRead:(bookId,partner)=>set(st=>({buddyReads:[...st.buddyReads.filter(b=>b.bookId!==bookId),{bookId,partner,myPage:0,theirPage:0,note:'Just getting started.'}]})),
  endBuddyRead:(bookId)=>set(st=>({buddyReads:st.buddyReads.filter(b=>b.bookId!==bookId)})),
  joinChallenge:(id)=>set(st=>({challengeJoined:{...st.challengeJoined,[id]:!st.challengeJoined[id]}})),
  toggleFavorite:(id)=>set(st=>{const has=st.favorites.includes(id);if(has)return {favorites:st.favorites.filter(f=>f!==id)};return {favorites:[...st.favorites,id]};}),
  setDnfReason:(id,reason,page)=>set(st=>({dnfReasons:{...st.dnfReasons,[id]:{reason,page}}})),
  setAnnualGoal:(n)=>set(()=>({annualGoal:Math.max(1,n)})),
  toggleAuthorFollow:(name)=>set(st=>({authorFollows:{...st.authorFollows,[name]:!st.authorFollows[name]}})),
  setBookMoods:(id,moods,pace)=>set(st=>({bookMoods:{...st.bookMoods,[id]:{moods,pace}}})),
  createList:(name,desc)=>set(st=>({lists:[{id:'list-'+st.lists.length+'-'+name.replace(/\s+/g,'-').toLowerCase().slice(0,16),name,desc:desc||'',bookIds:[]},...st.lists]})),
  toggleListBook:(listId,bookId)=>set(st=>({lists:st.lists.map(l=>l.id!==listId?l:{...l,bookIds:l.bookIds.includes(bookId)?l.bookIds.filter(b=>b!==bookId):[...l.bookIds,bookId]})})),
  deleteList:(listId)=>set(st=>({lists:st.lists.filter(l=>l.id!==listId)})),
  createClub:(name,bookId)=>set(st=>({userClubs:[{id:'club-'+st.userClubs.length+'-'+name.replace(/\s+/g,'-').toLowerCase().slice(0,16),name,bookId},...st.userClubs]})),
  createChallenge:(title,desc,goal)=>set(st=>({userChallenges:[{id:'ch-'+st.userChallenges.length+'-'+title.replace(/\s+/g,'-').toLowerCase().slice(0,16),title,desc,goal},...st.userChallenges]})),
  toggleStat:(key)=>set(st=>({statsHidden:{...st.statsHidden,[key]:!st.statsHidden[key]}})),
  sendClubMessage:(clubId,text)=>set(st=>{
    const msgs=st.clubMessages[clubId]||[];
    const ts=TODAY();
    return {clubMessages:{...st.clubMessages,[clubId]:[...msgs,{user:'You',text,ts}]}};
  }),
}),{name:'verso-storage',storage:createJSONStorage(()=>AsyncStorage)}));
