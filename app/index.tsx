// import { WebView } from 'react-native-webview';
// import Constants from 'expo-constants';
// import { StyleSheet } from 'react-native';

// export default function App() {
//   return (
//     <WebView
//       style={styles.container}
//       source={{ uri: 'https://mobile.plsofttech.com' }}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: Constants.statusBarHeight,
//   },
// });

import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';
import * as Print from 'expo-print';

export default function App() {
  const handleMessage = async (event: any) => {
    const html = event.nativeEvent.data;

    try {
      await Print.printAsync({
        html,
      });
    } catch (err) {
      console.log('Print error:', err);
    }
  };

  return (
    <WebView
      style={styles.container}
      source={{ uri: 'https://mobile.plsofttech.com' }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={handleMessage}
      injectedJavaScript={`
        if (window.location.href.includes('/sales/invoice/')) {
          window.ReactNativeWebView.postMessage(
            document.documentElement.outerHTML
          );
        }
        true;
      `}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
