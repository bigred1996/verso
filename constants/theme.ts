// Verso — warm light theme. White + pastel cards floating on a warm-grey base.
export const colors = {
  bg:'#F1ECE3',        // warm greige base
  surface:'#FFFFFF',   // white cards — pop against the bg
  surface2:'#ECE6DA',  // subtle warm fill / progress tracks
  text:'#262019',      // near-black warm
  text2:'#6E6357',     // muted body
  text3:'#A99E8E',     // light captions
  accent:'#4F7A5B',    // refined forest green
  accentText:'#FFFFFF',// text on accent fills
  accentDim:'rgba(79,122,91,0.14)',
  border:'rgba(38,32,25,0.08)',
  danger:'#B4654A',
};

// Pastel tints for hero cards, stat cells, and section accents.
export const pastels = {
  sage:'#DDE7D6',
  blush:'#F1DEDB',
  butter:'#F4EBCD',
  sky:'#DBE6EC',
  lavender:'#E4DEEC',
  clay:'#EFE0D3',
};
export const pastelText = {
  sage:'#3E5A40',
  blush:'#8C5147',
  butter:'#7A6326',
  sky:'#3D5C6B',
  lavender:'#574B72',
  clay:'#7A5238',
};

export const spacing = { xs:4, sm:8, md:16, lg:20, xl:28, xxl:36 };
export const radius = { sm:10, md:14, lg:18, xl:24, pill:999 };

// Soft elevation — renders as boxShadow on web, native shadow on iOS.
export const shadow = {
  card:{ shadowColor:'#3A2E1E', shadowOpacity:0.06, shadowRadius:14, shadowOffset:{width:0,height:6}, elevation:2 },
  soft:{ shadowColor:'#3A2E1E', shadowOpacity:0.04, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:1 },
};

export const fonts = {
  serif:'PlayfairDisplay_400Regular',
  serifBold:'PlayfairDisplay_700Bold',
  serifItalic:'PlayfairDisplay_700Bold_Italic',
  sans:'DMSans_400Regular',
  sansMedium:'DMSans_500Medium',
  sansBold:'DMSans_700Bold',
};
// Shared text styles matching the HTML prototype
export const type = {
  label:{fontFamily:fonts.sansBold,fontSize:11,letterSpacing:1.4,textTransform:'uppercase' as const,color:colors.text3},
  bookTitle:{fontFamily:fonts.serifBold,color:colors.text},
  bookTitleItalic:{fontFamily:fonts.serifItalic,color:colors.text},
  body:{fontFamily:fonts.sans,color:colors.text2},
  bodyMedium:{fontFamily:fonts.sansMedium,color:colors.text},
  statNumber:{fontFamily:fonts.serifBold,color:colors.text},
};
