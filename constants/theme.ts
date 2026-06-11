export const colors = { bg:'#0C0906', surface:'#161009', surface2:'#1E1610', text:'#EAD8B0', text2:'#9A8870', text3:'#5A4E3A', accent:'#3D6B48', accentDim:'rgba(61,107,72,0.15)', border:'rgba(234,216,176,0.10)' };
export const spacing = { xs:4, sm:8, md:16, lg:20, xl:28 };
export const radius = { sm:8, md:12, lg:16, xl:20, pill:999 };
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
  label:{fontFamily:fonts.sansBold,fontSize:9,letterSpacing:1.8,textTransform:'uppercase' as const,color:colors.text3},
  bookTitle:{fontFamily:fonts.serifBold,color:colors.text},
  bookTitleItalic:{fontFamily:fonts.serifItalic,color:colors.text},
  body:{fontFamily:fonts.sans,color:colors.text2},
  bodyMedium:{fontFamily:fonts.sansMedium,color:colors.text},
  statNumber:{fontFamily:fonts.serifBold,color:colors.text},
};
