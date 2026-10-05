import { useCallback, useRef, useState } from 'react';

import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Print from 'expo-print';
// import * as FileSystem from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import WebView, {
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';

import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
} from 'react-native-webview/lib/WebViewTypes';

const SITE_URL = 'https://shelj.in';

export default function App() {
  const webViewRef = useRef<WebView>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  /*
   * Android hardware back button
   */
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (canGoBack && webViewRef.current) {
            webViewRef.current.goBack();
            return true;
          }

          return false;
        }
      );

      return () => subscription.remove();
    }, [canGoBack])
  );

  /*
   * Receive HTML from website and print it
   *
   * Your website can send HTML using:
   *
   * window.ReactNativeWebView.postMessage(html);
   */
  const handleMessage = async (event: WebViewMessageEvent) => {
    const html = event.nativeEvent.data;

    try {
      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.log('Print error:', error);
    }
  };

  /*
   * Navigation state
   */
  const handleNavigationStateChange = (
    navState: WebViewNavigation
  ) => {
    setCanGoBack(navState.canGoBack);
  };

  /*
   * WebView loading error
   */
  const handleError = (
    _event: WebViewErrorEvent | WebViewHttpErrorEvent
  ) => {
    setHasError(true);
  };

  /*
   * Retry WebView
   */
  const retry = () => {
    setHasError(false);
    webViewRef.current?.reload();
  };

  /*
   * Handle PDF/file downloads
   *
   * Important:
   * react-native-webview exposes onFileDownload for downloads.
   */

const handleFileDownload = async ({
  nativeEvent,
}: {
  nativeEvent: {
    downloadUrl: string;
  };
}) => {
  const url = nativeEvent.downloadUrl;

  if (!url) {
    console.log('No download URL received');
    return;
  }

  try {
    setIsDownloading(true);

    // Generate filename
    let filename = 'attendance-report.pdf';

    try {
      const decodedUrl = decodeURIComponent(url);

      const urlFilename = decodedUrl
        .split('/')
        .pop()
        ?.split('?')[0];

      if (urlFilename) {
        filename = urlFilename;
      }
    } catch {
      // Keep default filename
    }

    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }

    // Download PDF to temporary cache
    const tempUri = `${FileSystem.cacheDirectory}${filename}`;

    console.log('Downloading PDF:', url);
    console.log('Temporary file:', tempUri);

    const result = await FileSystem.downloadAsync(
      url,
      tempUri
    );

    if (result.status !== 200) {
      throw new Error(
        `Download failed with HTTP status ${result.status}`
      );
    }

    console.log('PDF downloaded:', result.uri);

    // Android: open the system file picker
    if (Platform.OS === 'android') {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        console.log('User cancelled folder selection');
        return;
      }

      const directoryUri = permissions.directoryUri;

      // Read downloaded PDF
      const pdfBase64 =
        await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

      // Create PDF in selected directory
      const destinationUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          filename,
          'application/pdf'
        );

      // Write PDF
      await FileSystem.writeAsStringAsync(
        destinationUri,
        pdfBase64,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      console.log(
        'PDF successfully saved:',
        destinationUri
      );

      alert(`PDF saved successfully as:\n${filename}`);

      // Delete temporary file
      try {
        await FileSystem.deleteAsync(result.uri, {
          idempotent: true,
        });
      } catch {
        // Ignore cleanup errors
      }

      return;
    }

    // iOS
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or share PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      console.log('PDF downloaded to:', result.uri);
    }
  } catch (error) {
    console.error('PDF download error:', error);

    alert(
      'Unable to download the PDF. Please try again.'
    );
  } finally {
    setIsDownloading(false);
  }
};


  /*
   * Error screen
   */
  if (hasError) {
    return (
      <SafeAreaView
        style={styles.center}
        edges={['top', 'bottom']}
      >
        <StatusBar style="auto" />

        <Text style={styles.errorTitle}>
          Couldn&apos;t load the app
        </Text>

        <Text style={styles.errorMessage}>
          Check your internet connection and try again.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={retry}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <StatusBar style="auto" />

      <WebView
        ref={webViewRef}
        style={styles.container}

        source={{
          uri: SITE_URL,
        }}

        javaScriptEnabled={true}
        domStorageEnabled={true}

        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}

        allowsBackForwardNavigationGestures={true}

        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}

        mixedContentMode="compatibility"

        startInLoadingState={true}

        /*
         * PDF/file downloads
         */
        onFileDownload={handleFileDownload}

        /*
         * Print messages from website
         */
        onMessage={handleMessage}

        /*
         * Navigation
         */
        onNavigationStateChange={
          handleNavigationStateChange
        }

        /*
         * Errors
         */
        onError={handleError}
        onHttpError={handleError}

        /*
         * Loading screen
         */
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color="#2563eb"
            />

            <Text style={styles.loadingText}>
              Loading...
            </Text>
          </View>
        )}
      />

      {isDownloading && (
        <View style={styles.downloadOverlay}>
          <ActivityIndicator
            size="large"
            color="#ffffff"
          />

          <Text style={styles.downloadText}>
            Downloading PDF...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },

  downloadOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  downloadText: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});