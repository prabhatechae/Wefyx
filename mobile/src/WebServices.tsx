import React from 'react';
import {Alert, Linking, Pressable, ScrollView, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const pages = [
  ['Our Core Managed IT Services', '/'],
  ['Services', '/services'],
  ['Book support', '/book-support'],
  ['Service bookings and reports', '/my-tickets'],
  ['Shop', '/shop'],
  ['Rent equipment', '/rent'],
  ['Shopping cart', '/cart'],
  ['Data center', '/data-center'],
  ['Annual maintenance contracts', '/amc'],
  ['Solutions', '/solutions'],
  ['Industries', '/industries'],
  ['About Wefyx', '/about'],
  ['Contact and support', '/support'],
  ['Careers', '/careers'],
  ['Become a vendor', '/become-a-vendor'],
  ['Privacy policy', '/privacy-policy'],
  ['Full customer portal', '/portal'],
];

export async function openWebsite(path: string) {
  try { await Linking.openURL(`https://wefyx.pro${path}`); }
  catch { Alert.alert('Unable to open website', 'Please check that a browser is available and try again.'); }
}

export default function WebServices({navigation}: {navigation: {goBack: () => void}}) {
  return <SafeAreaView style={{flex:1, backgroundColor:'#fff'}}>
    <ScrollView contentContainerStyle={{padding:20, gap:12}}>
      <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}><Text style={{color:'#008553', paddingVertical:12}}>Back</Text></Pressable>
      <Text style={{fontSize:24, fontWeight:'700', color:'#073B2E'}}>Explore Wefyx</Text>
      <Text style={{color:'#63796C'}}>These pages open on the Wefyx website in your browser. Sign in there to view your bookings and account.</Text>
      {pages.map(([label, path]) => <Pressable key={path} accessibilityRole="link" onPress={() => openWebsite(path)} style={{padding:16, borderWidth:1, borderColor:'#DCE6E0', borderRadius:12}}>
        <Text style={{fontWeight:'600', color:'#008553'}}>{label}</Text>
        <Text style={{color:'#63796C', marginTop:4}}>Open website</Text>
      </Pressable>)}
    </ScrollView>
  </SafeAreaView>;
}
