import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, Dimensions, BackHandler } from 'react-native';
import { Appbar, ActivityIndicator, Button, Text, Card, ProgressBar, Chip } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const LARGE_FILE_SIZE = 10 * 1024 * 1024; 
const VERY_LARGE_FILE_SIZE = 50 * 1024 * 1024; 

const PdfViewerScreen = ({ navigation, route }) => {
  const { pdfUrl, title, disableDownload = false, fileSize } = route.params;
  const [loading, setLoading] = useState(true);
  const [resolvedUrl, setResolvedUrl] = useState(null);
  const [error, setError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);
  const [webViewError, setWebViewError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [pdfFileSize, setPdfFileSize] = useState(fileSize || 0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [useCache, setUseCache] = useState(false);
  const [cachedFilePath, setCachedFilePath] = useState(null);
  const webViewRef = useRef(null);
  const downloadRef = useRef(null);

  // Cache for resolved URLs
  const urlCache = useMemo(() => new Map(), []);

  // Optimized viewers for large files
  const viewers = useMemo(() => {
    const isLargeFile = pdfFileSize > LARGE_FILE_SIZE;
    const isVeryLargeFile = pdfFileSize > VERY_LARGE_FILE_SIZE;

    return [
      // For very large files, prioritize download-first approach
      ...(isVeryLargeFile ? [{
        name: 'download-first',
        label: 'Download & View',
        getUrl: () => null, // Special case - we'll handle this differently
        description: 'Download then view (recommended for large files)',
        priority: 1
      }] : []),
      
      // Google Docs has size limits but works well for medium files
      ...(!isVeryLargeFile ? [{
        name: 'google',
        label: 'Google Docs',
        getUrl: (url) => `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`,
        description: isLargeFile ? 'May be slow for large files' : 'Best compatibility',
        priority: isLargeFile ? 3 : 1
      }] : []),

      // PDF.js is better for large files
      {
        name: 'mozilla',
        label: 'PDF.js',
        getUrl: (url) => `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`,
        description: 'Good for large files',
        priority: isLargeFile ? 1 : 2
      },

      // Office viewer as fallback
      ...(!isVeryLargeFile ? [{
        name: 'office',
        label: 'Office',
        getUrl: (url) => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
        description: 'Microsoft viewer',
        priority: 4
      }] : [])
    ].sort((a, b) => a.priority - b.priority);
  }, [pdfFileSize]);

  // Get file size from URL
  const getFileSize = useCallback(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch (error) {
      console.warn("Could not get file size:", error);
      return 0;
    }
  }, []);

  // Resolve Firebase URL with caching and size detection
  const resolveUrl = useCallback(async (url) => {
    if (urlCache.has(url)) {
      return urlCache.get(url);
    }

    let resolvedUrl = url;
    if (url.startsWith('gs://')) {
      try {
        const storageRef = ref(storage, url);
        resolvedUrl = await getDownloadURL(storageRef);
      } catch (error) {
        throw new Error('Failed to resolve PDF URL from Firebase');
      }
    }

    // Get file size if not provided
    if (!pdfFileSize) {
      const size = await getFileSize(resolvedUrl);
      setPdfFileSize(size);
    }

    urlCache.set(url, resolvedUrl);
    return resolvedUrl;
  }, [urlCache, pdfFileSize, getFileSize]);

  // Check if file is cached locally
  const checkCachedFile = useCallback(async () => {
    try {
      const filename = title ? `${title.replace(/[^a-z0-9\s]/gi, '_').trim()}.pdf` : 'document.pdf';
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.exists) {
        setCachedFilePath(fileUri);
        return fileUri;
      }
    } catch (error) {
      console.warn("Error checking cached file:", error);
    }
    return null;
  }, [title]);

  // Download and cache large files
  const downloadAndCache = useCallback(async (url, showProgress = true) => {
    try {
      const filename = title ? `${title.replace(/[^a-z0-9\s]/gi, '_').trim()}.pdf` : 'document.pdf';
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      if (showProgress) {
        setIsDownloading(true);
        setDownloadProgress(0);
      }

      const downloadResult = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
          progressCallback: showProgress ? (progress) => {
            const progressPercent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
            setDownloadProgress(progressPercent);
            setLoadingProgress(progressPercent);
          } : undefined
        }
      );

      if (downloadResult.status === 200) {
        setCachedFilePath(fileUri);
        return fileUri;
      } else {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error("Download and cache error:", error);
      throw error;
    } finally {
      if (showProgress) {
        setIsDownloading(false);
      }
    }
  }, [title]);

  // Load PDF with smart strategy based on file size
  const loadPdf = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setWebViewError(false);
      setLoadingProgress(0);
      
      const url = await resolveUrl(pdfUrl);
      
      // For very large files, check cache first
      if (pdfFileSize > VERY_LARGE_FILE_SIZE) {
        const cachedPath = await checkCachedFile();
        if (cachedPath) {
          setResolvedUrl(`file://${cachedPath}`);
          setUseCache(true);
          return;
        }
        
        // Prompt user for large file download
        Alert.alert(
          "Large PDF File",
          `This PDF is ${(pdfFileSize / (1024 * 1024)).toFixed(1)}MB. Download for better performance?`,
          [
            {
              text: "View Online",
              onPress: () => {
                setResolvedUrl(url);
                setUseCache(false);
              }
            },
            {
              text: "Download First",
              onPress: async () => {
                try {
                  const cachedPath = await downloadAndCache(url, true);
                  setResolvedUrl(`file://${cachedPath}`);
                  setUseCache(true);
                } catch (error) {
                  setError("Failed to download PDF. Trying online view...");
                  setResolvedUrl(url);
                  setUseCache(false);
                }
              }
            }
          ]
        );
        return;
      }
      
      setResolvedUrl(url);
      setUseCache(false);
      
    } catch (error) {
      console.error("Error loading PDF:", error);
      setError(error.message || "Could not load PDF");
    } finally {
      setLoading(false);
    }
  }, [pdfUrl, resolveUrl, pdfFileSize, checkCachedFile, downloadAndCache]);

  // Try next viewer on failure
  const tryNextViewer = useCallback(() => {
    if (currentViewerIndex < viewers.length - 1) {
      setCurrentViewerIndex(prev => prev + 1);
      setWebViewError(false);
      setLoadAttempts(prev => prev + 1);
    } else {
      setError("All PDF viewers failed. Please download the PDF instead.");
    }
  }, [currentViewerIndex, viewers.length]);

  // Handle back button for large file downloads
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDownloading && downloadRef.current) {
        Alert.alert(
          "Cancel Download?",
          "PDF download is in progress. Cancel and go back?",
          [
            { text: "Continue Download", style: "cancel" },
            { 
              text: "Cancel", 
              onPress: () => {
                // Cancel download if possible
                navigation.goBack();
              }
            }
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isDownloading, navigation]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  // Get current viewer URL
  const viewerUrl = useMemo(() => {
    if (!resolvedUrl) return null;
    
    const currentViewer = viewers[currentViewerIndex];
    
    // Special handling for download-first approach
    if (currentViewer.name === 'download-first') {
      return null; // Will show download UI instead
    }
    
    // Use local file URL for cached files
    if (useCache && resolvedUrl.startsWith('file://')) {
      // For local files, we need a different approach
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(resolvedUrl)}`;
    }
    
    const url = currentViewer.getUrl(resolvedUrl);
    console.log(`Using ${currentViewer.name} viewer for ${(pdfFileSize / (1024 * 1024)).toFixed(1)}MB file:`, url);
    return url;
  }, [resolvedUrl, currentViewerIndex, viewers, useCache, pdfFileSize]);

  // Download PDF for sharing
  const downloadPdf = useCallback(async () => {
    if (isDownloading) return;
    
    try {
      const url = await resolveUrl(pdfUrl);
      await downloadAndCache(url, true);
      
      Alert.alert(
        "Download Complete", 
        "PDF downloaded successfully!",
        [
          {
            text: "Open",
            onPress: async () => {
              if (cachedFilePath && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(cachedFilePath);
              }
            }
          },
          { text: "OK" }
        ]
      );
    } catch (error) {
      Alert.alert("Download Error", error.message || "Could not download PDF");
    }
  }, [pdfUrl, resolveUrl, downloadAndCache, cachedFilePath]);

  // Open externally
  const openExternal = useCallback(async () => {
    try {
      const url = await resolveUrl(pdfUrl);
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this PDF in an external app");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open PDF externally");
    }
  }, [pdfUrl, resolveUrl]);

  // WebView error handlers
  const handleWebViewError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    setWebViewError(true);
    
    // For large files, suggest download instead of trying next viewer
    if (pdfFileSize > LARGE_FILE_SIZE) {
      setError("Large PDF failed to load in viewer. Try downloading instead.");
    } else {
      setTimeout(() => {
        if (loadAttempts < 2) {
          tryNextViewer();
        }
      }, 2000);
    }
  }, [loadAttempts, tryNextViewer, pdfFileSize]);

  const resetAndRetry = useCallback(() => {
    setCurrentViewerIndex(0);
    setLoadAttempts(0);
    setWebViewError(false);
    setError(null);
    loadPdf();
  }, [loadPdf]);

  const currentViewer = viewers[currentViewerIndex];
  const isLargeFile = pdfFileSize > LARGE_FILE_SIZE;
  const isVeryLargeFile = pdfFileSize > VERY_LARGE_FILE_SIZE;

  // Loading state
  if (loading && !resolvedUrl) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={title || 'PDF Viewer'} />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>
            {isDownloading ? 'Downloading PDF...' : 'Preparing PDF...'}
          </Text>
          {pdfFileSize > 0 && (
            <Text style={styles.hintText}>
              File size: {(pdfFileSize / (1024 * 1024)).toFixed(1)}MB
            </Text>
          )}
          {(isDownloading || loadingProgress > 0) && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {Math.round((downloadProgress || loadingProgress) * 100)}%
              </Text>
              <ProgressBar 
                progress={downloadProgress || loadingProgress} 
                style={styles.progressBar}
              />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={title || 'PDF Viewer'} />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          
          {isLargeFile && (
            <Card style={styles.helpCard}>
              <Card.Content>
                <Text style={styles.helpTitle}>Large PDF File</Text>
                <Text style={styles.helpText}>
                  This PDF is {(pdfFileSize / (1024 * 1024)).toFixed(1)}MB. 
                  Large files may not display properly in mobile browsers. 
                  Download for best performance.
                </Text>
              </Card.Content>
            </Card>
          )}

          <View style={styles.buttonGroup}>
            {!disableDownload && (
              <Button 
                mode="contained" 
                onPress={downloadPdf}
                disabled={isDownloading}
                style={styles.actionButton}
                icon="download"
              >
                {isDownloading ? `Downloading ${Math.round(downloadProgress * 100)}%` : 'Download PDF'}
              </Button>
            )}
            <Button 
              mode="outlined" 
              onPress={openExternal}
              style={styles.actionButton}
              icon="open-in-new"
            >
              Open in External App
            </Button>
            <Button 
              mode="text" 
              onPress={resetAndRetry}
              style={styles.actionButton}
              icon="refresh"
            >
              Try Again
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // Special case: download-first viewer
  if (currentViewer.name === 'download-first') {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={title || 'PDF Viewer'} />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text style={styles.statusText}>Large PDF File Detected</Text>
          <Text style={styles.hintText}>
            {(pdfFileSize / (1024 * 1024)).toFixed(1)}MB file
          </Text>
          
          <Card style={styles.helpCard}>
            <Card.Content>
              <Text style={styles.helpTitle}>Recommended: Download First</Text>
              <Text style={styles.helpText}>
                For better performance with large PDFs, download the file first 
                then view it locally or in an external app.
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.buttonGroup}>
            <Button 
              mode="contained" 
              onPress={downloadPdf}
              disabled={isDownloading}
              style={styles.actionButton}
              icon="download"
            >
              {isDownloading ? `Downloading ${Math.round(downloadProgress * 100)}%` : 'Download & View'}
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => tryNextViewer()}
              style={styles.actionButton}
              icon="eye"
            >
              Try Online Viewer
            </Button>
            <Button 
              mode="text" 
              onPress={openExternal}
              style={styles.actionButton}
              icon="open-in-new"
            >
              Open Externally
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title={title || 'PDF Viewer'} 
          subtitle={currentViewer.description}
        />
        {!disableDownload && (
          <Appbar.Action 
            icon={isDownloading ? "loading" : "download"} 
            onPress={downloadPdf}
            disabled={isDownloading}
          />
        )}
        <Appbar.Action 
          icon="open-in-new" 
          onPress={openExternal}
        />
      </Appbar.Header>

      {/* File info and viewer controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.fileInfo}>
          {pdfFileSize > 0 && (
            <Chip 
              icon={isLargeFile ? "alert" : "file-document"}
              style={[styles.sizeChip, isVeryLargeFile && styles.veryLargeChip]}
            >
              {(pdfFileSize / (1024 * 1024)).toFixed(1)}MB
            </Chip>
          )}
          {useCache && (
            <Chip icon="cached" style={styles.cacheChip}>
              Cached
            </Chip>
          )}
        </View>

        {/* Viewer selector */}
        <View style={styles.viewerButtons}>
          {viewers.map((viewer, index) => (
            <Button
              key={viewer.name}
              mode={index === currentViewerIndex ? "contained" : "outlined"}
              onPress={() => setCurrentViewerIndex(index)}
              style={styles.viewerButton}
              compact
              disabled={loading}
            >
              {viewer.label}
            </Button>
          ))}
        </View>
      </View>

      {/* Download progress */}
      {isDownloading && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Downloading... {Math.round(downloadProgress * 100)}%
          </Text>
          <ProgressBar 
            progress={downloadProgress} 
            style={styles.progressBar}
          />
        </View>
      )}

      {/* Large file warning */}
      {isLargeFile && !useCache && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Large file may load slowly. Consider downloading for better performance.
          </Text>
        </View>
      )}
      
      {viewerUrl && (
        <WebView
          ref={webViewRef}
          source={{ uri: viewerUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
          cacheEnabled={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" />
              <Text style={styles.statusText}>Loading PDF viewer...</Text>
              <Text style={styles.hintText}>
                {isLargeFile ? 'Large file - this may take a while' : `Using ${currentViewer.label}`}
              </Text>
            </View>
          )}
          onError={handleWebViewError}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.statusCode >= 400) {
              handleWebViewError(syntheticEvent);
            }
          }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          // Optimizations for large files
          mixedContentMode="always"
          allowsBackForwardNavigationGestures={false}
          bounces={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          // Memory management
          onMemoryWarning={() => {
            console.warn("WebView memory warning - large PDF");
            if (isLargeFile) {
              Alert.alert(
                "Memory Warning",
                "This PDF is using a lot of memory. Consider downloading it instead.",
                [
                  { text: "Continue" },
                  { text: "Download", onPress: downloadPdf }
                ]
              );
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  hintText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#d32f2f',
    paddingHorizontal: 20,
  },
  helpCard: {
    marginBottom: 24,
    marginHorizontal: 20,
    maxWidth: 400,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 20,
  },
  actionButton: {
    marginVertical: 6,
  },
  controlsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  fileInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  sizeChip: {
    marginRight: 8,
  },
  veryLargeChip: {
    backgroundColor: '#ffebee',
  },
  cacheChip: {
    backgroundColor: '#e8f5e8',
  },
  viewerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewerButton: {
    minWidth: 70,
  },
  progressContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e3f2fd',
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#1976d2',
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 4,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
});

export default PdfViewerScreen;