import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShelfStatus, Format, Book } from '../data/books';
export interface RereadEntry { date:string;rating:number;note:string; }
export interface JournalEntry { date:string;page:number;note:string; }
export interface JournalData  { page:number;entries:JournalEntry[]; }
interface State {
  shelf:Record<string,ShelfStatus>; ratings:Record<string,number>; formats:Record<string,Format>;
  rereads:Record<string,RereadEntry[]>; journal:Record<string,JournalData>; userTags:Record<string,string[]>;
  customBooks:Book[]; follows:Record<string,boolean>; challengeJoined:Record<string,boolean>;
  swipeData:Record<string,'like'|'dislike'|'next'>; eloRatings:Record<string,number>; streakDays:string[];
  clubMessages:Record<string,{user:string;text:string;ts:string}[]>;
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
}
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
  swipeData:{}, eloRatings:{}, streakDays:[], clubMessages:{},
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
  sendClubMessage:(clubId,text)=>set(st=>{
    const msgs=st.clubMessages[clubId]||[];
    const ts=TODAY();
    return {clubMessages:{...st.clubMessages,[clubId]:[...msgs,{user:'You',text,ts}]}};
  }),
}),{name:'verso-storage',storage:createJSONStorage(()=>AsyncStorage)}));
