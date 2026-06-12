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
    books:['remains-of-the-day','never-let-me-go']},
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
export const ISBNS:Record<string,string> = {'normal-people':'9780571334650','conversations-with-friends':'9780571333134','intermezzo':'9780374611996','a-little-life':'9780316301930','stoner':'9781590170014','the-road':'9780307387899','remains-of-the-day':'9780679731726','white-noise':'9780143105985','pachinko':'9781455563937','my-year-of-rest':'9780525522089','demon-copperhead':'9780063251922','james':'9780385550369','the-sympathizer':'9780802123459','crime-and-punishment':'9780140449136','the-brothers-karamazov':'9780374528379','anna-karenina':'9780143035008','one-hundred-years':'9780060883287','beloved':'9781400033416','lolita':'9780679723165','the-great-gatsby':'9780743273565','to-kill-a-mockingbird':'9780061120084','nineteen-eighty-four':'9780451524935','brave-new-world':'9780060850524','the-bell-jar':'9780061148514','mrs-dalloway':'9780156628709','blood-meridian':'9780679728757','gilead':'9780312424404','middlemarch':'9780141439549','jane-eyre':'9780141441146','wuthering-heights':'9780141439556','the-secret-history':'9781400031702','the-goldfinch':'9780316055445','never-let-me-go':'9781400078776','the-corrections':'9780312421274','the-overstory':'9780393356687','cloud-atlas':'9780375507250','lincoln-in-the-bardo':'9780812995343'};
export const COVER_IDS:Record<string,number> = {'my-year-of-rest':8202400,'stoner':8310729,'intermezzo':14836043,'a-little-life':14841606,'the-goldfinch':7267111};
export const PAGE_COUNTS:Record<string,number> = {'normal-people':273,'conversations-with-friends':321,'intermezzo':384,'a-little-life':720,'stoner':278,'the-road':287,'remains-of-the-day':256,'white-noise':326,'pachinko':496,'my-year-of-rest':304,'demon-copperhead':548,'james':320,'the-sympathizer':371,'crime-and-punishment':671,'the-brothers-karamazov':796,'anna-karenina':864,'one-hundred-years':417,'beloved':324,'lolita':336,'the-great-gatsby':180,'to-kill-a-mockingbird':336,'nineteen-eighty-four':328,'brave-new-world':288,'the-bell-jar':244,'mrs-dalloway':194,'blood-meridian':351,'gilead':247,'middlemarch':904,'jane-eyre':532,'wuthering-heights':416,'the-secret-history':559,'the-goldfinch':771,'never-let-me-go':288,'the-corrections':568,'the-overstory':502,'cloud-atlas':509,'lincoln-in-the-bardo':343};
export const BOOKS:Book[] = [
  {id:'normal-people',title:'Normal People',author:'Sally Rooney',year:2018,genres:['Literary Fiction','Romance'],synopsis:"Connell and Marianne grow up in the same small town in the west of Ireland but occupy entirely different social worlds — he's popular, she's not. When something starts between them at her mother's house (where his mother works as a cleaner), they set in motion years of near-misses, wrong timing, and enormous harm done with genuine feeling. Rooney traces their relationship across Ireland and Italy, through college and adulthood, in prose so clean it reads as inevitable. A novel about the power two people can hold over each other — and what it costs both of them.",avgRating:4.1,readers:842190,dist:[12000,28000,95000,312000,395190],takes:[{t:'Rooney does in 273 pages what most authors fail to do in 800.',u:'Elif'}],ci:0},
  {id:'intermezzo',title:'Intermezzo',author:'Sally Rooney',year:2024,genres:['Literary Fiction'],synopsis:"After their father dies, two brothers must figure out who they are to each other through separate grief. Peter, a Dublin solicitor in his thirties, is unravelling between two women and the pharmaceutical help he uses to feel nothing. Ivan, twenty-two and a chess prodigy, falls into an unexpected relationship with an older woman in the country. Rooney moves between their interior monologues — Peter's controlled and fractured, Ivan's open and unsettled — with the precision of a novelist who has found something genuinely new to say about grief and love. Her most ambitious novel, and for many readers, her best.",avgRating:4.3,readers:192840,dist:[5000,12000,35000,72000,68840],takes:[{t:'She just gets better.',u:'Elif'}],ci:1},
  {id:'stoner',title:'Stoner',author:'John Williams',year:1965,genres:['Literary Fiction','Classic'],synopsis:"William Stoner grows up on a Missouri farm and goes to the state university to study agriculture. He discovers literature by accident and never recovers from it. He becomes a professor, marries the wrong woman, loves the wrong woman later, fights the wrong battles. Nothing spectacular happens. John Williams renders this ordinary academic life — its failures, its small dignities, and its quiet endurance — with such compassion and formal control that the novel becomes a meditation on what any life is for. The book that people press into strangers' hands.",avgRating:4.4,readers:318200,dist:[8000,15000,40000,105000,150200],takes:[{t:'The secret great American novel.',u:'Marcus'}],ci:2},
  {id:'a-little-life',title:'A Little Life',author:'Hanya Yanagihara',year:2015,genres:['Literary Fiction'],synopsis:"Four friends from a Massachusetts college — Willem, JB, Malcolm, and Jude — move to New York to begin their adult lives. Over decades, Yanagihara follows them through success, failure, and the accumulated weight of history, centering on Jude, whose past is gradually and devastatingly revealed. The novel is a 720-page argument about what love can and cannot do: whether friendship is enough, whether recovery is real, and what we owe the people we cannot save. Relentless, formally meticulous, and unlike anything else in American fiction. You will need to lie down when it's over.",avgRating:4.5,readers:524000,dist:[10000,18000,52000,180000,264000],takes:[{t:'I need to lie down for approximately one year.',u:'Juno'}],ci:3},
  {id:'remains-of-the-day',title:'The Remains of the Day',author:'Kazuo Ishiguro',year:1989,genres:['Literary Fiction','Classic'],synopsis:"Stevens, a butler of impeccable dignity, is motoring through the English countryside on a rare holiday granted by his new American employer. He is driving west to visit Miss Kenton, a former housekeeper he once worked alongside for years, and as the miles pass he reflects on his decades of service to Lord Darlington — on the choices he made in the name of duty and professional decorum, and on what was quietly, irrevocably lost in the making of them. Ishiguro's most devastating novel works entirely through restraint: what Stevens refuses to say is more present than anything he admits. One of the great postwar English novels.",avgRating:4.4,readers:287450,dist:[7000,14000,38000,98000,130450],takes:[{t:'Repression as a literary device. Ishiguro wins.',u:'Priya'}],ci:4},
  {id:'the-road',title:'The Road',author:'Cormac McCarthy',year:2006,genres:['Literary Fiction','Post-Apocalyptic'],synopsis:"An unnamed man and his young son walk south through a burned, gray America in the years after some unspecified catastrophe. They carry what they can in a shopping cart. They are the good guys, the man tells his son — and that phrase becomes their entire theology. McCarthy stripped his prose down to something that reads like damaged scripture: almost no punctuation, no names, no weather that isn't ash. What remains is love in its most reduced and essential form — a father inventing a world worth inhabiting from almost nothing. The bleakest book on this list, and the one most people describe as a love story.",avgRating:4.2,readers:612300,dist:[15000,22000,60000,210000,305300],takes:[{t:'Bleak kings only.',u:'Marcus'}],ci:5},
  {id:'white-noise',title:'White Noise',author:'Don DeLillo',year:1985,genres:['Literary Fiction','Postmodern'],synopsis:"Jack Gladney, professor of Hitler studies at a small midwestern college, lives amid the ambient dread of American consumer culture: supermarkets, television, pharmaceutical haze, and a family that talks constantly without saying anything. When a chemical spill forces his town to evacuate, Jack's theoretical preoccupation with death becomes something immediate and unmanageable. DeLillo wrote White Noise in 1985 as satire. It has become more accurate with every decade that passes — a prophetic novel about the noise we make to avoid silence, and the silence underneath everything.",avgRating:3.9,readers:198700,dist:[12000,25000,55000,65000,41700],takes:[{t:'The anxiety was already there. DeLillo just named it.',u:'Marcus'}],ci:6},
  {id:'pachinko',title:'Pachinko',author:'Min Jin Lee',year:2017,genres:['Historical Fiction'],synopsis:"In 1910s Korea, a young woman's decision — to keep a child that will mark her family as disgraced — sets in motion a story that unfolds across four generations and nearly a century. Min Jin Lee traces one family's passage through Japanese occupation, emigration, relentless discrimination, and hard-won survival, rendering history through the texture of ordinary days and private choices. The novel accumulates its power slowly, the way sagas do, until the weight of all those years arrives at once. One of the essential novels of this century, and the one that proves the family saga is not an exhausted form.",avgRating:4.6,readers:487200,dist:[8000,12000,35000,152000,280200],takes:[{t:'A saga you will not be able to stop.',u:'Priya'}],ci:7},
  {id:'my-year-of-rest',title:'My Year of Rest and Relaxation',author:'Ottessa Moshfegh',year:2018,genres:['Literary Fiction'],synopsis:"Our narrator — unnamed, beautiful, recently orphaned, and profoundly hollowed out — decides to sleep for an entire year. She lives in a Manhattan apartment she doesn't need to afford, enlists a spectacularly irresponsible psychiatrist to prescribe her into oblivion, and waits for something to change in the blank space she's making of herself. What looks like satire about privilege is also a portrait of dissociation so precise it becomes uncomfortable. Moshfegh writes with deadpan clarity, making her narrator simultaneously impossible to sympathize with and impossible to look away from. Funnier than it has any right to be. Stranger than you expect.",avgRating:3.8,readers:324100,dist:[18000,32000,72000,108000,94100],takes:[{t:'I hated her and I wanted to be her.',u:'Juno'}],ci:8},
  {id:'demon-copperhead',title:'Demon Copperhead',author:'Barbara Kingsolver',year:2022,genres:['Literary Fiction','Pulitzer Prize'],synopsis:"Demon Copperhead tells the story of a boy born in a Lee County, Virginia trailer park in the 1990s, navigating foster care, addiction, football, and the collapse of an Appalachian community drowned in opioids — all in a voice so alive and irreverent it carries you through the worst of what it depicts. Kingsolver built the structure on David Copperfield and earned the comparison: this is social realism that works because its moral fury is equaled entirely by its love for its characters. The voice is one of the great achievements in recent American fiction. The Pulitzer was correct.",avgRating:4.5,readers:241600,dist:[5000,10000,28000,88000,110600],takes:[{t:'Kingsolver earns every word of the Pulitzer.',u:'Elif'}],ci:9},
  {id:'james',title:'James',author:'Percival Everett',year:2024,genres:['Literary Fiction','Pulitzer Prize'],synopsis:"Jim — the escaped slave from Huckleberry Finn — is reimagined here as James, a man of extraordinary intelligence who has spent his life performing ignorance for survival. Percival Everett retells the classic American story from inside Jim's point of view, dismantling the original text and the myths it encoded about race, freedom, and who gets to be the hero. The result is formally brilliant, morally serious, and genuinely funny in the way that only the sharpest satire can be. One of the few novels in recent years that actually earns the word necessary.",avgRating:4.6,readers:178900,dist:[4000,8000,22000,60000,84900],takes:[{t:'Required reading.',u:'Priya'}],ci:10},
  {id:'the-sympathizer',title:'The Sympathizer',author:'Viet Thanh Nguyen',year:2015,genres:['Literary Fiction','War'],synopsis:"A communist spy narrates his life — in the form of a forced written confession — from the fall of Saigon through his years as a refugee in America. He is a man of two faces and two irreconcilable allegiances, and his confession is the portrait of a consciousness caught permanently between worlds. Nguyen's prose moves between comedy and horror without warning, and the novel's formal audacity — it is simultaneously a spy thriller, a satirical war novel, and a meditation on identity — makes it unlike anything else in American literature. The opening line alone will stay with you.",avgRating:4.1,readers:142800,dist:[6000,14000,38000,52000,32800],takes:[{t:'The prose alone is worth it.',u:'Marcus'}],ci:11},
  {id:'conversations-with-friends',title:'Conversations with Friends',author:'Sally Rooney',year:2017,genres:['Literary Fiction'],synopsis:"Frances, a Dublin student and aspiring poet, meets a glamorous older couple and falls into an affair with the husband — with the tacit, complicated awareness of her best friend and former girlfriend Bobbi. Rooney's debut is quieter and more interior than what followed: less concerned with plot than with the experience of being young, intelligent, and not yet sure how much of yourself to withhold from the world. The prose is already fully formed. The emotional precision is already merciless. A novel about the performance of control, and everything it conceals.",avgRating:3.9,readers:412600,dist:[14000,28000,88000,152000,130600],takes:[{t:'Rooney before she became Rooney.',u:'Elif'}],ci:12},
  {id:'crime-and-punishment',title:'Crime and Punishment',author:'Fyodor Dostoevsky',year:1866,genres:['Classic','Russian Literature'],synopsis:'A destitute student murders a pawnbroker and unravels under his own conscience.',avgRating:4.3,readers:721000,dist:[12000,30000,90000,260000,329000],takes:[],ci:13},
  {id:'the-brothers-karamazov',title:'The Brothers Karamazov',author:'Fyodor Dostoevsky',year:1880,genres:['Classic','Russian Literature'],synopsis:'Three brothers, a murdered father, and the question of whether God exists.',avgRating:4.4,readers:402000,dist:[9000,18000,55000,140000,180000],takes:[],ci:14},
  {id:'anna-karenina',title:'Anna Karenina',author:'Leo Tolstoy',year:1878,genres:['Classic','Russian Literature'],synopsis:'A married aristocrat risks everything for love in imperial Russia.',avgRating:4.2,readers:528000,dist:[14000,36000,110000,200000,168000],takes:[],ci:15},
  {id:'one-hundred-years',title:'One Hundred Years of Solitude',author:'Gabriel García Márquez',year:1967,genres:['Magical Realism','Classic'],synopsis:'Seven generations of the Buendía family rise and fall in the mythical town of Macondo.',avgRating:4.1,readers:612000,dist:[22000,48000,120000,210000,212000],takes:[],ci:16},
  {id:'beloved',title:'Beloved',author:'Toni Morrison',year:1987,genres:['Literary Fiction','Historical Fiction'],synopsis:'A formerly enslaved woman in Ohio is haunted — literally — by the daughter she lost.',avgRating:4.0,readers:388000,dist:[16000,34000,92000,140000,106000],takes:[],ci:17},
  {id:'lolita',title:'Lolita',author:'Vladimir Nabokov',year:1955,genres:['Classic','Literary Fiction'],synopsis:'A monstrous narrator confesses, in dazzling prose, to an unforgivable obsession.',avgRating:3.9,readers:441000,dist:[40000,52000,90000,130000,129000],takes:[],ci:18},
  {id:'the-great-gatsby',title:'The Great Gatsby',author:'F. Scott Fitzgerald',year:1925,genres:['Classic','Literary Fiction'],synopsis:'A bootlegger throws lavish parties for a love that was never his to keep.',avgRating:3.9,readers:1240000,dist:[60000,120000,260000,400000,400000],takes:[],ci:19},
  {id:'to-kill-a-mockingbird',title:'To Kill a Mockingbird',author:'Harper Lee',year:1960,genres:['Classic','Literary Fiction'],synopsis:'A girl watches her father defend a Black man in the Jim Crow South.',avgRating:4.3,readers:1510000,dist:[40000,80000,220000,520000,650000],takes:[],ci:20},
  {id:'nineteen-eighty-four',title:'1984',author:'George Orwell',year:1949,genres:['Classic','Dystopian'],synopsis:'A man rebels, quietly, against a state that watches everything.',avgRating:4.2,readers:1380000,dist:[44000,90000,250000,460000,536000],takes:[],ci:21},
  {id:'brave-new-world',title:'Brave New World',author:'Aldous Huxley',year:1932,genres:['Classic','Dystopian'],synopsis:'A society engineered for happiness has quietly abolished the soul.',avgRating:3.9,readers:702000,dist:[30000,70000,180000,230000,192000],takes:[],ci:22},
  {id:'the-bell-jar',title:'The Bell Jar',author:'Sylvia Plath',year:1963,genres:['Literary Fiction','Classic'],synopsis:'A brilliant young woman descends into mental illness one summer in New York.',avgRating:4.0,readers:498000,dist:[18000,42000,110000,170000,158000],takes:[],ci:23},
  {id:'mrs-dalloway',title:'Mrs Dalloway',author:'Virginia Woolf',year:1925,genres:['Modernist','Classic'],synopsis:'A single June day in London, rendered in the full weather of consciousness.',avgRating:3.8,readers:286000,dist:[20000,38000,78000,90000,60000],takes:[],ci:24},
  {id:'blood-meridian',title:'Blood Meridian',author:'Cormac McCarthy',year:1985,genres:['Literary Fiction','Western'],synopsis:'A boy rides with a scalp-hunting gang through a biblical, blood-soaked frontier.',avgRating:4.2,readers:312000,dist:[18000,28000,62000,98000,106000],takes:[],ci:25},
  {id:'gilead',title:'Gilead',author:'Marilynne Robinson',year:2004,genres:['Literary Fiction','Pulitzer Prize'],synopsis:'A dying preacher writes a long letter to the young son he will not see grow up.',avgRating:4.1,readers:184000,dist:[8000,16000,40000,62000,58000],takes:[],ci:26},
  {id:'middlemarch',title:'Middlemarch',author:'George Eliot',year:1871,genres:['Classic','Literary Fiction'],synopsis:'Provincial English lives interlace in the great novel of marriage and ambition.',avgRating:4.0,readers:241000,dist:[12000,26000,58000,80000,65000],takes:[],ci:27},
  {id:'jane-eyre',title:'Jane Eyre',author:'Charlotte Brontë',year:1847,genres:['Classic','Gothic'],synopsis:'A governess refuses to be small in a house full of secrets.',avgRating:4.1,readers:892000,dist:[24000,52000,150000,310000,356000],takes:[],ci:28},
  {id:'wuthering-heights',title:'Wuthering Heights',author:'Emily Brontë',year:1847,genres:['Classic','Gothic'],synopsis:'A love that curdles into vengeance haunts the Yorkshire moors for generations.',avgRating:3.9,readers:781000,dist:[42000,78000,160000,250000,251000],takes:[],ci:29},
  {id:'the-secret-history',title:'The Secret History',author:'Donna Tartt',year:1992,genres:['Literary Fiction','Thriller'],synopsis:'A clique of classics students commit a murder and rot from the inside out.',avgRating:4.2,readers:512000,dist:[16000,34000,88000,180000,194000],takes:[],ci:30},
  {id:'the-goldfinch',title:'The Goldfinch',author:'Donna Tartt',year:2013,genres:['Literary Fiction','Pulitzer Prize'],synopsis:'A boy survives a bombing and clings to a stolen painting through a wrecked life.',avgRating:3.9,readers:624000,dist:[34000,68000,150000,200000,172000],takes:[],ci:31},
  {id:'never-let-me-go',title:'Never Let Me Go',author:'Kazuo Ishiguro',year:2005,genres:['Literary Fiction','Dystopian'],synopsis:'Three friends raised at a strange English boarding school learn what they are for.',avgRating:4.1,readers:498000,dist:[14000,32000,96000,170000,186000],takes:[],ci:32},
  {id:'the-corrections',title:'The Corrections',author:'Jonathan Franzen',year:2001,genres:['Literary Fiction'],synopsis:'A Midwestern mother wants one last Christmas with her scattered, failing family.',avgRating:3.9,readers:268000,dist:[16000,30000,70000,86000,66000],takes:[],ci:33},
  {id:'the-overstory',title:'The Overstory',author:'Richard Powers',year:2018,genres:['Literary Fiction','Pulitzer Prize'],synopsis:'Nine strangers are drawn together by trees and the fight to save them.',avgRating:4.0,readers:301000,dist:[18000,32000,72000,96000,83000],takes:[],ci:34},
  {id:'cloud-atlas',title:'Cloud Atlas',author:'David Mitchell',year:2004,genres:['Literary Fiction','Speculative'],synopsis:'Six nested stories echo across centuries, from the Pacific past to a ruined future.',avgRating:4.0,readers:356000,dist:[22000,40000,84000,108000,102000],takes:[],ci:35},
  {id:'lincoln-in-the-bardo',title:'Lincoln in the Bardo',author:'George Saunders',year:2017,genres:['Literary Fiction','Booker Prize'],synopsis:'In a graveyard limbo, the ghosts argue while Lincoln grieves his dead son.',avgRating:3.8,readers:198000,dist:[20000,34000,60000,52000,32000],takes:[],ci:36},
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
  'crime-and-punishment':{moods:['dark','tense','reflective'],pace:'measured',weekly:430,vibes:['feverish','moral','relentless']},
  'the-brothers-karamazov':{moods:['reflective','dark','emotional'],pace:'slow burn',weekly:268,vibes:['monumental','spiritual','demanding']},
  'anna-karenina':{moods:['emotional','reflective','sad'],pace:'measured',weekly:312,vibes:['sweeping','tragic','alive']},
  'one-hundred-years':{moods:['reflective','mysterious','emotional'],pace:'slow burn',weekly:389,vibes:['dreamlike','sprawling','magical']},
  'beloved':{moods:['dark','emotional','sad'],pace:'measured',weekly:241,vibes:['haunting','lyrical','devastating']},
  'lolita':{moods:['dark','tense','reflective'],pace:'measured',weekly:276,vibes:['dazzling','queasy','virtuosic']},
  'the-great-gatsby':{moods:['reflective','sad','emotional'],pace:'propulsive',weekly:980,vibes:['glittering','hollow','perfect']},
  'to-kill-a-mockingbird':{moods:['emotional','hopeful','reflective'],pace:'measured',weekly:1120,vibes:['warm','righteous','enduring']},
  'nineteen-eighty-four':{moods:['dark','tense','reflective'],pace:'propulsive',weekly:1340,vibes:['chilling','prophetic','airless']},
  'brave-new-world':{moods:['dark','reflective','funny'],pace:'measured',weekly:540,vibes:['eerie','satirical','prescient']},
  'the-bell-jar':{moods:['dark','emotional','sad'],pace:'measured',weekly:420,vibes:['piercing','intimate','raw']},
  'mrs-dalloway':{moods:['reflective','emotional','sad'],pace:'slow burn',weekly:188,vibes:['luminous','interior','fleeting']},
  'blood-meridian':{moods:['dark','tense','adventurous'],pace:'measured',weekly:360,vibes:['apocalyptic','biblical','savage']},
  'gilead':{moods:['reflective','hopeful','emotional'],pace:'slow burn',weekly:150,vibes:['tender','luminous','quiet']},
  'middlemarch':{moods:['reflective','emotional'],pace:'slow burn',weekly:140,vibes:['wise','expansive','humane']},
  'jane-eyre':{moods:['emotional','tense','hopeful'],pace:'measured',weekly:610,vibes:['fierce','gothic','romantic']},
  'wuthering-heights':{moods:['dark','tense','emotional'],pace:'measured',weekly:520,vibes:['stormy','obsessive','wild']},
  'the-secret-history':{moods:['dark','tense','mysterious'],pace:'propulsive',weekly:870,vibes:['intoxicating','elite','dread']},
  'the-goldfinch':{moods:['emotional','dark','reflective'],pace:'measured',weekly:540,vibes:['immersive','grief-soaked','sprawling']},
  'never-let-me-go':{moods:['sad','reflective','emotional'],pace:'slow burn',weekly:600,vibes:['quiet','devastating','restrained']},
  'the-corrections':{moods:['funny','dark','reflective'],pace:'measured',weekly:210,vibes:['acerbic','sprawling','sharp']},
  'the-overstory':{moods:['reflective','hopeful','emotional'],pace:'slow burn',weekly:300,vibes:['expansive','urgent','green']},
  'cloud-atlas':{moods:['adventurous','reflective','mysterious'],pace:'measured',weekly:340,vibes:['intricate','playful','epic']},
  'lincoln-in-the-bardo':{moods:['sad','reflective','funny'],pace:'measured',weekly:180,vibes:['inventive','choral','tender']},
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

// ── Recommendation engine (content-based) ──
// Scores every candidate book against the user's "liked" seed set by shared
// genre / mood / pace / trope / theme / author signal. Returns the best matches
// with the seed book that earned each pick, so the UI can say "Because you loved X".
// Backed by the same data a real recsys would use; swap for a server call later.
export function recommendBooks(
  seedIds:string[], allBooks:Book[], exclude:Set<string>, limit=8
):{id:string;reasonId:string;score:number}[]{
  const seeds=seedIds.map(id=>allBooks.find(b=>b.id===id)).filter(Boolean) as Book[];
  if(!seeds.length) return [];
  const out:{id:string;reasonId:string;score:number}[]=[];
  for(const cand of allBooks){
    if(exclude.has(cand.id)||seedIds.includes(cand.id)) continue;
    let best:Book|null=null, bestScore=0;
    for(const s of seeds){
      let sc=cand.genres.filter(g=>s.genres.includes(g)).length*2;
      const cv=BOOK_VIBES[cand.id], sv=BOOK_VIBES[s.id];
      if(cv&&sv){ sc+=cv.moods.filter(m=>sv.moods.includes(m)).length; if(cv.pace===sv.pace) sc+=1; }
      const ct=BOOK_TAGS[cand.id], st=BOOK_TAGS[s.id];
      if(ct&&st){ sc+=ct.tropes.filter(t=>st.tropes.includes(t)).length*2; sc+=ct.themes.filter(t=>st.themes.includes(t)).length; }
      if(cand.author===s.author) sc+=4;
      if(sc>bestScore){ bestScore=sc; best=s; }
    }
    if(best&&bestScore>0) out.push({id:cand.id,reasonId:best.id,score:bestScore});
  }
  out.sort((a,b)=>b.score-a.score||(allBooks.find(x=>x.id===b.id)?.readers||0)-(allBooks.find(x=>x.id===a.id)?.readers||0));
  return out.slice(0,limit);
}

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

// ── Memorable quotes from the books ──
export interface BookQuote { q:string; ctx?:string; }
export const BOOK_QUOTES:Record<string,BookQuote[]> = {
  'normal-people':[
    {q:"She had a long history of getting over Connell, and she told herself this was just the same.",ctx:"Chapter 16"},
    {q:"What a strange life they had lived together, she thought. And yet somehow it had always felt like the only possible life.",ctx:"Chapter 24"},
    {q:"I'm sorry I was ever cruel to you.",ctx:"Connell"},
  ],
  'stoner':[
    {q:"He was forty-two years old, and he could see nothing before him that he wished to grasp; nothing behind him that he wished to take back.",ctx:"Part II"},
    {q:"It's the love of the work. Don't ever forget that.",ctx:"Archer Sloane"},
    {q:"He had come to that moment in his age when there occurred to him, with increasing intensity, a question of such overwhelming simplicity that he had no means to face it.",ctx:"Part V"},
  ],
  'a-little-life':[
    {q:"Wasn't friendship its own kind of miracle — the finding of another person who made the entire lonely world seem somehow less lonely?",ctx:"Book II"},
    {q:"How many times can a person be rebuilt? How much scaffolding can a person take before the structure buckles under the weight of it?",ctx:"Book V"},
    {q:"He would not let them help him. He would not let them in.",ctx:"Book IV"},
  ],
  'remains-of-the-day':[
    {q:"I can't even say I made my own mistakes. Really — one has to ask oneself — what dignity is there in that?",ctx:"Stevens"},
    {q:"There's no turning back the clock now. I should adopt a more positive outlook and try to make the best of what remains of my day.",ctx:"Stevens"},
  ],
  'the-road':[
    {q:"You have to carry the fire.",ctx:"The man"},
    {q:"He knew only that the child was his warrant. He said: If he is not the word of God God never spoke.",ctx:""},
    {q:"There is no God and we are his prophets.",ctx:"Ely"},
  ],
  'intermezzo':[
    {q:"Love was not a decision you made once. It was something you kept making, against your better judgement, against everything that was practical and reasonable.",ctx:"Peter"},
    {q:"He was tired of being the version of himself that existed in other people's expectations.",ctx:"Ivan"},
  ],
  'pachinko':[
    {q:"History has failed us, but no matter.",ctx:"Opening line"},
    {q:"There are few things in the world as dangerous as the desperate. But there are fewer things as stubborn as someone who has decided to survive.",ctx:"Sunja"},
  ],
  'my-year-of-rest':[
    {q:"Sleep felt productive. Something was getting done even if I wasn't doing anything.",ctx:""},
    {q:"I didn't want to find meaning in anything. I just wanted to sleep, and in sleeping, become a different kind of person.",ctx:""},
    {q:"I was trying to get somewhere, and sleeping was the fastest way to get through the distance.",ctx:""},
  ],
  'demon-copperhead':[
    {q:"First thing you learn in foster care: people will lie to your face while looking you dead in the eye.",ctx:"Demon"},
    {q:"Nobody's born knowing how to drown. That's something they have to teach you.",ctx:"Demon"},
  ],
  'james':[
    {q:"White folks cannot know us. And so we must know them.",ctx:"Jim"},
    {q:"Freedom was not a place I was going. It was a condition I was slowly, painfully learning to carry inside myself.",ctx:"James"},
  ],
  'the-sympathizer':[
    {q:"I am a spy, a sleeper, a spook, a man of two faces.",ctx:"Opening line"},
    {q:"Nothing was more American than seeing the world from one's own point of view.",ctx:"The Sympathizer"},
  ],
  'white-noise':[
    {q:"All plots tend to move deathward. This is the nature of plots.",ctx:"Murray Siskind"},
    {q:"The family is the cradle of the world's misinformation.",ctx:"Jack Gladney"},
  ],
  'conversations-with-friends':[
    {q:"I was a person who felt things very strongly, and I had learned, over time, to make that fact invisible.",ctx:"Frances"},
    {q:"Did I really believe in intimacy? Or did I just want to feel something real for once?",ctx:"Frances"},
  ],
};

// ── Author writing style tags ──
export const AUTHOR_STYLE:Record<string,string[]> = {
  'Sally Rooney':['Interior monologue','Dialogue-driven','Class politics','Contemporary realism'],
  'Kazuo Ishiguro':['Unreliable narrator','Memory & regret','Restrained prose','Post-war melancholy'],
  'Cormac McCarthy':['Biblical prose','No punctuation','Existential violence','American gothic'],
  'Min Jin Lee':['Generational saga','Historical research','Immigrant experience','Third-person omniscient'],
  'Ottessa Moshfegh':['Deadpan wit','Unreliable narrator','Psychological depth','Dark comedy'],
  'John Williams':['Quiet realism','Academic setting','Compassionate observation','Controlled prose'],
  'Don DeLillo':['Postmodern satire','Media critique','Philosophical dialogue','Consumer culture'],
  'Hanya Yanagihara':['Trauma fiction','Maximalist prose','Long form','Urban friendship'],
  'Barbara Kingsolver':['Social realism','Regional voice','Political engagement','First-person vernacular'],
  'Percival Everett':['Formal experimentation','Satirical deconstruction','Race & language','Metafiction'],
  'Viet Thanh Nguyen':['Confessional structure','Postcolonial lens','War & identity','Double consciousness'],
};
