export type ShelfStatus = 'reading'|'read'|'want'|'dnf';
export type Format = 'print'|'ebook'|'audio';
export interface Book { id:string;title:string;author:string;year:number;genres:string[];synopsis:string;avgRating:number;readers:number;dist:number[];takes:{t:string;u:string}[];ci:number;isCustom?:boolean;olCoverId?:number|null;pages?:number; }
export interface Friend { id:string;name:string;match:number;bookId:string;status:string;init:string;color:string; }
export interface AuthorInfo { olid:string;wiki:string;born:string;bio:string;awards:string[];books:string[]; }
export const AUTHOR_DATA:Record<string,AuthorInfo> = {
  'Sally Rooney':{olid:'OL7353566A',wiki:'Sally_Rooney',born:'b. 1991, Castlebar, Ireland',
    bio:"Sally Rooney is the defining voice of millennial literary fiction — sharp, political, and quietly devastating. Her novels dissect intimacy, class, and communication with an intelligence that reads as effortless and never is. Normal People made her famous; Intermezzo proved she was building something larger. She writes silence louder than most writers manage with full sentences.",
    awards:['Booker Prize longlisted','Costa Novel Award','Sunday Times Young Writer of the Year'],
    books:['normal-people','intermezzo','conversations-with-friends']},
  'Kazuo Ishiguro':{olid:'OL24060A',wiki:'Kazuo_Ishiguro',born:'b. 1954, Nagasaki, Japan',
    bio:"Kazuo Ishiguro is the master of the unreliable narrator who doesn't know he's unreliable. A Nobel laureate who writes novels about memory, loss, and the things people refuse to say. His prose is so controlled it feels inevitable — and the devastation arrives in retrospect, hours after you've finished. The Remains of the Day is 300 pages of a man refusing to feel anything, and you feel everything.",
    awards:['Nobel Prize in Literature 2017','Booker Prize','CBE'],
    books:['remains-of-the-day']},
  'Cormac McCarthy':{olid:'OL1614185A',wiki:'Cormac_McCarthy',born:'1933–2023, Providence, RI',
    bio:"Cormac McCarthy dispensed with punctuation and sentiment and wrote some of the most harrowing prose in American literature anyway. The Road is a novel about love written in the vocabulary of apocalypse. He decided commas were for cowards and somehow made it work. He died in 2023 having written the definitive book on what literary fiction can do with violence and grief.",
    awards:['Pulitzer Prize','National Book Award','MacArthur Fellowship'],
    books:['the-road']},
  'Min Jin Lee':{olid:'OL3425513A',wiki:'Min_Jin_Lee',born:'b. 1968, Seoul, South Korea',
    bio:"Min Jin Lee spent nearly 30 years researching and writing Pachinko — and you feel every year of it. Her fiction is about what history does to ordinary people, and how identity persists across generations of compromise and survival. She is one of the most important novelists working today.",
    awards:['National Book Award finalist','Medici Book Club Prize','Dayton Literary Peace Prize'],
    books:['pachinko']},
  'Ottessa Moshfegh':{olid:'OL7022750A',wiki:'Ottessa_Moshfegh',born:'b. 1981, Boston, MA',
    bio:"Ottessa Moshfegh writes characters who are repellent, brilliant, and impossible to look away from. My Year of Rest is her signature work: a meditation on numbness, privilege, and what happens when you remove all the noise. Her prose is surgical, deadpan, and funnier than it has any right to be. The horror is that you understand her protagonist completely.",
    awards:['Booker Prize longlisted','PEN/Hemingway Award','Plimpton Prize'],
    books:['my-year-of-rest']},
  'John Williams':{olid:'OL27109A',wiki:'John_Edward_Williams',born:'1922–1994, Clarksville, TX',
    bio:"John Williams published Stoner in 1965 to modest notice and died without knowing it would become one of the most beloved novels in the world. It is the story of an ordinary academic life, rendered with such compassion and precision that it becomes a meditation on what a life is worth. Stoner is the one people press into strangers' hands.",
    awards:["National Book Award","National Book Award finalist (Stoner)"],
    books:['stoner']},
  'Don DeLillo':{olid:'OL1641141A',wiki:'Don_DeLillo',born:'b. 1936, Bronx, NY',
    bio:"Don DeLillo has been diagnosing America's psychic condition since the 1970s with a precision that only becomes more accurate with time. White Noise is his most accessible novel and also his most prophetic: it identified the ambient dread of consumer capitalism forty years before it became the defining mood of the internet.",
    awards:['National Book Award','PEN/Faulkner Award','Jerusalem Prize'],
    books:['white-noise']},
  'Hanya Yanagihara':{olid:'OL7353568A',wiki:'Hanya_Yanagihara',born:'b. 1974, Los Angeles, CA',
    bio:"Hanya Yanagihara writes novels that refuse to make suffering comfortable or redemptive. A Little Life is a 720-page argument about what we owe the people we love, written with an intensity that readers describe as a kind of hazing. She dares you to put it down. Most readers cannot.",
    awards:['Booker Prize finalist','National Book Award finalist','Kirkus Prize finalist'],
    books:['a-little-life']},
  'Barbara Kingsolver':{olid:'OL25705A',wiki:'Barbara_Kingsolver',born:'b. 1955, Annapolis, MD',
    bio:"Barbara Kingsolver is one of the most morally serious novelists working in America. Demon Copperhead — her retelling of David Copperfield as an Appalachian opioid crisis narrative — won the Pulitzer and announced that she was angrier than Dickens and had better reason to be. The kid's voice is one of the great achievements in recent fiction.",
    awards:['Pulitzer Prize','PEN/Bellwether Prize','National Book Award finalist'],
    books:['demon-copperhead']},
  'Percival Everett':{olid:'OL1398580A',wiki:'Percival_Everett',born:'b. 1956, Fort Gordon, GA',
    bio:"Percival Everett has been one of the most formally inventive and intellectually rigorous novelists in America for decades without getting the attention he deserved. James changed that. It won the Pulitzer in 2024, and it is the book that explains why Everett has always mattered — a systematic, brilliant dismantling of American mythology from the inside.",
    awards:['Pulitzer Prize 2024','PEN/Jean Stein Award','Guggenheim Fellowship'],
    books:['james']},
  'Viet Thanh Nguyen':{olid:'OL7115765A',wiki:'Viet_Thanh_Nguyen',born:'b. 1971, Buon Ma Thuot, Vietnam',
    bio:"Viet Thanh Nguyen is a professor of English and American studies at USC and a novelist who refuses to let comfortable narratives stand. The Sympathizer is a Pulitzer Prize-winning novel told from inside a communist spy's confession, simultaneously inhabiting both sides of the Vietnam War.",
    awards:['Pulitzer Prize','Dayton Literary Peace Prize','Edgar Award'],
    books:['the-sympathizer']},
};
export const ISBNS:Record<string,string> = {'normal-people':'9780571334650','conversations-with-friends':'9780571333134','intermezzo':'9780374611996','a-little-life':'9780316301930','stoner':'9781590170014','the-road':'9780307387899','remains-of-the-day':'9780679731726','white-noise':'9780143105985','pachinko':'9781455563937','my-year-of-rest':'9780525522089','demon-copperhead':'9780063251922','james':'9780385550369','the-sympathizer':'9780802123459'};
export const COVER_IDS:Record<string,number> = {'my-year-of-rest':8202400,'stoner':8310729,'intermezzo':14836043};
export const PAGE_COUNTS:Record<string,number> = {'normal-people':273,'conversations-with-friends':321,'intermezzo':384,'a-little-life':720,'stoner':278,'the-road':287,'remains-of-the-day':256,'white-noise':326,'pachinko':496,'my-year-of-rest':304,'demon-copperhead':548,'james':320,'the-sympathizer':371};
export const BOOKS:Book[] = [
  {id:'normal-people',title:'Normal People',author:'Sally Rooney',year:2018,genres:['Literary Fiction','Romance'],synopsis:'Connell and Marianne grow up in the same small town in west Ireland.',avgRating:4.1,readers:842190,dist:[12000,28000,95000,312000,395190],takes:[{t:'Rooney does in 273 pages what most authors fail to do in 800.',u:'Elif'}],ci:0},
  {id:'intermezzo',title:'Intermezzo',author:'Sally Rooney',year:2024,genres:['Literary Fiction'],synopsis:'Two brothers navigate grief and love after their father\'s death.',avgRating:4.3,readers:192840,dist:[5000,12000,35000,72000,68840],takes:[{t:'She just gets better.',u:'Elif'}],ci:1},
  {id:'stoner',title:'Stoner',author:'John Williams',year:1965,genres:['Literary Fiction','Classic'],synopsis:'A quiet, devastating story of a university professor living in mediocrity.',avgRating:4.4,readers:318200,dist:[8000,15000,40000,105000,150200],takes:[{t:'The secret great American novel.',u:'Marcus'}],ci:2},
  {id:'a-little-life',title:'A Little Life',author:'Hanya Yanagihara',year:2015,genres:['Literary Fiction'],synopsis:'Four college friends make their way in New York over decades.',avgRating:4.5,readers:524000,dist:[10000,18000,52000,180000,264000],takes:[{t:'I need to lie down for approximately one year.',u:'Juno'}],ci:3},
  {id:'remains-of-the-day',title:'The Remains of the Day',author:'Kazuo Ishiguro',year:1989,genres:['Literary Fiction','Classic'],synopsis:'An aging English butler reflects on his career and the choices he made.',avgRating:4.4,readers:287450,dist:[7000,14000,38000,98000,130450],takes:[{t:'Repression as a literary device. Ishiguro wins.',u:'Priya'}],ci:4},
  {id:'the-road',title:'The Road',author:'Cormac McCarthy',year:2006,genres:['Literary Fiction','Post-Apocalyptic'],synopsis:'A father and his son walk through burned America.',avgRating:4.2,readers:612300,dist:[15000,22000,60000,210000,305300],takes:[{t:'Bleak kings only.',u:'Marcus'}],ci:5},
  {id:'white-noise',title:'White Noise',author:'Don DeLillo',year:1985,genres:['Literary Fiction','Postmodern'],synopsis:'Jack Gladney lives amid the horrors of American consumer culture.',avgRating:3.9,readers:198700,dist:[12000,25000,55000,65000,41700],takes:[{t:'The anxiety was already there. DeLillo just named it.',u:'Marcus'}],ci:6},
  {id:'pachinko',title:'Pachinko',author:'Min Jin Lee',year:2017,genres:['Historical Fiction'],synopsis:'A Korean woman\'s decision reverberates across four generations.',avgRating:4.6,readers:487200,dist:[8000,12000,35000,152000,280200],takes:[{t:'A saga you will not be able to stop.',u:'Priya'}],ci:7},
  {id:'my-year-of-rest',title:'My Year of Rest and Relaxation',author:'Ottessa Moshfegh',year:2018,genres:['Literary Fiction'],synopsis:'A young woman tries to sleep away an entire year in New York.',avgRating:3.8,readers:324100,dist:[18000,32000,72000,108000,94100],takes:[{t:'I hated her and I wanted to be her.',u:'Juno'}],ci:8},
  {id:'demon-copperhead',title:'Demon Copperhead',author:'Barbara Kingsolver',year:2022,genres:['Literary Fiction','Pulitzer Prize'],synopsis:'A retelling of David Copperfield set in opioid-ravaged Appalachia.',avgRating:4.5,readers:241600,dist:[5000,10000,28000,88000,110600],takes:[{t:'Kingsolver earns every word of the Pulitzer.',u:'Elif'}],ci:9},
  {id:'james',title:'James',author:'Percival Everett',year:2024,genres:['Literary Fiction','Pulitzer Prize'],synopsis:'Huckleberry Finn retold from Jim\'s perspective.',avgRating:4.6,readers:178900,dist:[4000,8000,22000,60000,84900],takes:[{t:'Required reading.',u:'Priya'}],ci:10},
  {id:'the-sympathizer',title:'The Sympathizer',author:'Viet Thanh Nguyen',year:2015,genres:['Literary Fiction','War'],synopsis:'A communist spy navigates life in America after the fall of Saigon.',avgRating:4.1,readers:142800,dist:[6000,14000,38000,52000,32800],takes:[{t:'The prose alone is worth it.',u:'Marcus'}],ci:11},
  {id:'conversations-with-friends',title:'Conversations with Friends',author:'Sally Rooney',year:2017,genres:['Literary Fiction'],synopsis:'A student enters the orbit of a glamorous older couple.',avgRating:3.9,readers:412600,dist:[14000,28000,88000,152000,130600],takes:[{t:'Rooney before she became Rooney.',u:'Elif'}],ci:12},
];
export const FRIENDS:Friend[] = [
  {id:'elif', name:'Elif Şahin',   match:91,bookId:'intermezzo',    status:'reading', init:'E',color:'#3D6B48'},
  {id:'marcus',name:'Marcus Webb', match:67,bookId:'the-road',      status:'finished',init:'M',color:'#7B9EA6'},
  {id:'juno',  name:'Juno Park',   match:84,bookId:'a-little-life', status:'wants',   init:'J',color:'#A67B9E'},
  {id:'priya', name:'Priya Acharya',match:72,bookId:'pachinko',     status:'reading', init:'P',color:'#7BA695'},
];

// ── Curated book metadata (subgenres, tropes, themes, perspective, setting, content warnings) ──
export interface BookTags { subgenres:string[]; tropes:string[]; themes:string[]; perspective:string; setting:string; cw:string[]; }
export const BOOK_TAGS:Record<string,BookTags> = {
  'normal-people':{subgenres:['Contemporary Romance','Coming of Age','Irish Lit'],tropes:['Will They Won\'t They','Class Divide','Childhood Friends','On Again Off Again'],themes:['Identity','Class','Love','Communication'],perspective:'Third Person Limited',setting:'Contemporary Ireland',cw:['Sexual content','Mental health']},
  'the-road':{subgenres:['Post-Apocalyptic','Survival','Literary Horror'],tropes:['Father & Son','End of the World','The Last Good Men','Road Trip'],themes:['Survival','Parenthood','Hope','Morality'],perspective:'Third Person Limited',setting:'Post-apocalyptic America',cw:['Extreme violence','Death','Child in peril']},
  'pachinko':{subgenres:['Family Saga','Historical Fiction','Immigration Lit'],tropes:['Multi-Generational','Forbidden Love','Found Family','Sacrifice for Children'],themes:['Identity','Sacrifice','Discrimination','Legacy'],perspective:'Third Person Omniscient',setting:'Korea & Japan, 1910s–1980s',cw:['Racism','Sexual assault','Death']},
  'my-year-of-rest':{subgenres:['Dark Comedy','Psychological Fiction','Autofiction'],tropes:['Unreliable Narrator','Rich & Miserable','Voluntary Isolation','Deadpan Humour'],themes:['Depression','Privilege','Numbness','Grief'],perspective:'First Person',setting:'New York City, early 2000s',cw:['Drug use','Mental health','Eating disorder']},
  'stoner':{subgenres:['Academic Fiction','Character Study','Quiet Realism'],tropes:['Quiet Tragic Hero','Academic Setting','Failed Marriage','Late Love'],themes:['Regret','Purpose','Endurance','Love'],perspective:'Third Person Limited',setting:'Missouri, early 20th century',cw:[]},
  'white-noise':{subgenres:['Postmodern Satire','Academic Comedy','Domestic Fiction'],tropes:['Death Anxiety','Suburban Nightmare','Media Saturation','Conspiracy'],themes:['Death','Consumerism','Fear','Modern Life'],perspective:'First Person',setting:'Suburban America, 1980s',cw:['Environmental disaster']},
  'remains-of-the-day':{subgenres:['Historical Fiction','Character Study','Unreliable Memoir'],tropes:['Repressed Feelings','Missed Connection','Loyal to a Fault','Road Trip'],themes:['Regret','Dignity','Duty vs Desire','Class'],perspective:'First Person Unreliable',setting:'Post-war England',cw:[]},
  'a-little-life':{subgenres:['Trauma Fiction','Friendship Epic','Urban Literary'],tropes:['Found Family','Dark Past Revealed','Lifelong Friendship','Healing Journey'],themes:['Trauma','Friendship','Love','Recovery'],perspective:'Third Person Limited',setting:'New York City, contemporary',cw:['Extreme abuse','Self-harm','Sexual assault','Suicide']},
  'demon-copperhead':{subgenres:['Social Realism','Coming of Age','Regional Fiction'],tropes:['Orphan Hero','Found Family','System Failure','Against the Odds'],themes:['Addiction','Poverty','Resilience','America'],perspective:'First Person',setting:'Appalachia, 1990s–2000s',cw:['Drug addiction','Child abuse','Death']},
  'james':{subgenres:['Historical Fiction','Retelling','Satirical Fiction'],tropes:['Unreliable Narrator','Race & Language','Escape','New Lens on a Classic'],themes:['Freedom','Race','Language & Power','Humanity'],perspective:'First Person',setting:'Antebellum South, 1840s',cw:['Racism','Slavery','Violence']},
  'intermezzo':{subgenres:['Grief Novel','Contemporary Romance','Irish Lit'],tropes:['Age Gap Romance','Brothers','Grief','Internal Monologue'],themes:['Grief','Love','Family','Recovery'],perspective:'Third Person Multiple',setting:'Contemporary Dublin',cw:['Death','Drug use','Sexual content']},
  'the-sympathizer':{subgenres:['War Fiction','Spy Thriller','Postcolonial Lit'],tropes:['Double Agent','Identity Crisis','War Aftermath','Unreliable Narrator'],themes:['Identity','Loyalty','Colonialism','War'],perspective:'First Person Confessional',setting:'Vietnam War era & Cold War',cw:['Graphic violence','Sexual assault','Torture']},
  'conversations-with-friends':{subgenres:['Contemporary','Irish Lit','Autofiction'],tropes:['Love Triangle','Affair','Female Friendship','Emotional Detachment'],themes:['Intimacy','Class','Communication','Youth'],perspective:'First Person',setting:'Contemporary Dublin',cw:['Sexual content','Mental health','Self-harm']},
};

// ── Reading challenges ──
export interface Challenge { id:string;title:string;desc:string;readers:number;goal:number;featured:boolean;books:string[];done:string[]; }
export const CHALLENGES:Challenge[] = [
  {id:'literary-dozen',title:"Verso's Literary Dozen",desc:"12 novels our editors keep pressing into people's hands. No duds. No filler. No excuses. These are the books that changed how we read everything else.",
    readers:9847,goal:12,featured:true,
    books:['stoner','normal-people','the-road','pachinko','a-little-life','remains-of-the-day','white-noise','demon-copperhead','james','the-sympathizer','intermezzo','conversations-with-friends'],
    done:['stoner','normal-people','a-little-life','the-road']},
  {id:'translated',title:'Lost in Translation (In the Best Way)',desc:"6 books that prove the best stories aren't always written in English. The best literature often emerges from the tension between cultures — and these six know exactly where they live.",
    readers:4201,goal:6,featured:false,
    books:['pachinko','the-sympathizer','remains-of-the-day','my-year-of-rest','normal-people','intermezzo'],
    done:['pachinko','the-sympathizer']},
  {id:'uncomfortable',title:'Books That Will Make You Miss Your Stop',desc:"12 reads so consuming you'll forget you have places to be. Not comfort reads. Not safe picks. These are the books that ruin your weekend in the best possible way.",
    readers:2340,goal:12,featured:false,
    books:['a-little-life','the-road','pachinko','demon-copperhead','the-sympathizer','stoner','my-year-of-rest','normal-people','white-noise','intermezzo','james'],
    done:['a-little-life']},
];

// ── Community mood/pace consensus, weekly activity (trending), reader "vibes" ──
export interface BookVibe { moods:string[]; pace:string; weekly:number; vibes:string[]; }
export const BOOK_VIBES:Record<string,BookVibe> = {
  'normal-people':{moods:['emotional','reflective','sad'],pace:'measured',weekly:847,vibes:['devastating','read in one sitting','quietly brutal']},
  'intermezzo':{moods:['emotional','reflective','hopeful'],pace:'slow burn',weekly:1240,vibes:['tender','grief-soaked','cathartic']},
  'stoner':{moods:['reflective','sad','emotional'],pace:'slow burn',weekly:412,vibes:['quiet','devastating','perfect']},
  'a-little-life':{moods:['dark','emotional','sad'],pace:'measured',weekly:932,vibes:['harrowing','a commitment','cried for days']},
  'remains-of-the-day':{moods:['reflective','sad','emotional'],pace:'slow burn',weekly:388,vibes:['repressed','aching','restrained']},
  'the-road':{moods:['dark','tense','sad'],pace:'propulsive',weekly:602,vibes:['bleak','unforgettable','spare']},
  'pachinko':{moods:['emotional','reflective','hopeful'],pace:'measured',weekly:721,vibes:['sweeping','generational','immersive']},
  'my-year-of-rest':{moods:['dark','funny','reflective'],pace:'measured',weekly:556,vibes:['deadpan','unhinged','strangely cozy']},
  'demon-copperhead':{moods:['emotional','dark','hopeful'],pace:'propulsive',weekly:489,vibes:['furious','tender','unputdownable']},
  'james':{moods:['tense','reflective','adventurous'],pace:'propulsive',weekly:903,vibes:['urgent','brilliant','necessary']},
  'white-noise':{moods:['funny','reflective','tense'],pace:'measured',weekly:201,vibes:['prophetic','wry','uneasy']},
  'the-sympathizer':{moods:['tense','dark','reflective'],pace:'measured',weekly:178,vibes:['cerebral','biting','layered']},
  'conversations-with-friends':{moods:['emotional','reflective'],pace:'measured',weekly:340,vibes:['cool','aching','sharp']},
};

// ── Friends activity feed (most recent first) ──
export interface ActivityItem { id:string; user:string; type:'reading'|'rated'|'hot'|'dnf'|'milestone'; bookId?:string; rating?:number; text?:string; ts:string; }
export const ACTIVITY:ActivityItem[] = [
  {id:'a1',user:'elif',type:'hot',bookId:'intermezzo',text:'Chapter 3 destroyed me. I am not okay and I refuse to recover.',ts:'2h'},
  {id:'a2',user:'juno',type:'rated',bookId:'a-little-life',rating:5,ts:'5h'},
  {id:'a3',user:'marcus',type:'reading',bookId:'the-road',text:'p.142',ts:'8h'},
  {id:'a4',user:'priya',type:'milestone',text:'hit a 40-day reading streak',ts:'1d'},
  {id:'a5',user:'juno',type:'dnf',bookId:'white-noise',text:'Wrong time. I\'ll come back to it. Maybe.',ts:'1d'},
  {id:'a6',user:'elif',type:'rated',bookId:'normal-people',rating:5,ts:'2d'},
  {id:'a7',user:'marcus',type:'hot',bookId:'stoner',text:'The secret great American novel. Fight me in the comments.',ts:'2d'},
  {id:'a8',user:'priya',type:'reading',bookId:'pachinko',text:'p.301',ts:'3d'},
];

// ── Friends' ratings + one-line takes per book ──
export const FRIEND_BOOK:Record<string,Record<string,{r:number;t:string}>> = {
  'normal-people':{elif:{r:5,t:'She does in 273 pages what most can\'t in 800.'},juno:{r:4,t:'Marianne deserved better. Discuss.'}},
  'intermezzo':{elif:{r:5,t:'Chapter 3 destroyed me.'},juno:{r:4,t:'The chess subplot is so good.'}},
  'stoner':{marcus:{r:5,t:'The secret great American novel.'},elif:{r:5,t:'Quiet and total.'}},
  'a-little-life':{juno:{r:5,t:'I need to lie down for a year.'},marcus:{r:3,t:'Brutal. Maybe too brutal.'},priya:{r:4,t:'Devastating, deliberately.'}},
  'the-road':{marcus:{r:5,t:'Bleak kings only.'},priya:{r:4,t:'Carry the fire.'}},
  'pachinko':{priya:{r:5,t:'A saga you can\'t stop.'},elif:{r:4,t:'History happening to people.'}},
  'remains-of-the-day':{priya:{r:5,t:'Repression as a literary device. Ishiguro wins.'},elif:{r:4,t:'The ache is the point.'}},
  'demon-copperhead':{elif:{r:4,t:'Kingsolver earns the Pulitzer.'},priya:{r:4,t:'The kid\'s voice is everything.'}},
  'james':{priya:{r:4,t:'Required reading.'},marcus:{r:4,t:'Everett at the height of it.'}},
  'the-sympathizer':{marcus:{r:4,t:'The prose alone is worth it.'}},
  'my-year-of-rest':{juno:{r:4,t:'I hated her and wanted to be her.'}},
  'white-noise':{marcus:{r:4,t:'The anxiety was already there. DeLillo named it.'}},
};
