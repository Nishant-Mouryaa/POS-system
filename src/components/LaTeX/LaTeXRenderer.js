/ components/LaTeX/LaTeXRenderer.js
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { Palette } from '../../theme/colors';

const LaTeXRenderer = ({ latex, style }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!latex || latex.trim() === '') {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Palette.textMuted }}>No LaTeX content</Text>
      </View>
    );
  }

  const cleanLatex = latex.replace(/^\$+|\$+$/g, '').trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>LaTeX Renderer</title>
      
      <script>
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\$', '\\\$']],
            displayMath: [['$$', '$$'], ['\\\$\$', '\\\$\$']],
            processEscapes: true,
            processEnvironments: true,
            tags: 'none'
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            ignoreHtmlClass: 'tex2jax_ignore'
          },
          startup: {
            pageReady: () => {
              return MathJax.startup.defaultPageReady().then(() => {
                console.log('MathJax initialization complete');
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('mathjax-ready');
              });
            }
          }
        };
      </script>
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: transparent;
          color: #333;
          font-size: 16px;
          line-height: 1.5;
        }
        .math-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50px;
          width: 100%;
          padding: 8px;
        }
        .math-content { text-align: center; width: 100%; }
        .loading { color: #666; font-size: 14px; text-align: center; }
        .error {
          color: #d32f2f;
          font-size: 14px;
          text-align: center;
          padding: 8px;
          background: #ffebee;
          border-radius: 4px;
        }
        .MathJax { font-size: 1.1em !important; }
        mjx-container { overflow-x: auto; overflow-y: hidden; }
      </style>
    </head>
    <body>
      <div class="math-container">
        <div class="math-content">
          <div class="loading" id="loading">Loading math...</div>
          <div id="math-display" style="display: none;">
            $$${cleanLatex}$$
          </div>
        </div>
      </div>
      
      <script>
        let renderAttempts = 0;
        const maxAttempts = 10;
        
        function showError(message) {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('math-display').innerHTML = 
            '<div class="error">LaTeX Error: ' + message + '</div>';
          document.getElementById('math-display').style.display = 'block';
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('error:' + message);
        }
        
        function showMath() {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('math-display').style.display = 'block';
        }
        
        function attemptRender() {
          renderAttempts++;
          
          if (renderAttempts > maxAttempts) {
            showError('Max render attempts exceeded');
            return;
          }
          
          if (typeof MathJax === 'undefined' || !MathJax.typesetPromise) {
            setTimeout(attemptRender, 200);
            return;
          }
          
          try {
            MathJax.typesetPromise([document.getElementById('math-display')])
              .then(() => {
                console.log('MathJax render successful');
                showMath();
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('render-success');
              })
              .catch((error) => {
                console.error('MathJax render error:', error);
                showError(error.message || 'Render failed');
              });
          } catch (error) {
            console.error('MathJax error:', error);
            showError(error.message || 'Unknown error');
          }
        }
        
        setTimeout(attemptRender, 100);
        
        setTimeout(() => {
          if (document.getElementById('loading').style.display !== 'none') {
            showError('Render timeout');
          }
        }, 5000);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[style, { minHeight: 60 }]}>
      <WebView
        source={{ html: htmlContent }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          console.log('WebView message:', message);
          
          if (message === 'render-success') {
            setIsLoading(false);
            setHasError(false);
          } else if (message === 'mathjax-ready') {
            setIsLoading(false);
          } else if (message.startsWith('error:')) {
            setIsLoading(false);
            setHasError(true);
          }
        }}
        onError={(syntheticEvent) => {
          console.error('WebView error:', syntheticEvent.nativeEvent);
          setHasError(true);
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          console.error('WebView HTTP error:', syntheticEvent.nativeEvent);
          setHasError(true);
          setIsLoading(false);
        }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => {
          // Don't set loading to false here, wait for MathJax message
        }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.mathLoadingOverlay}>
          <ActivityIndicator size="small" color={Palette.primary} />
          <Text style={styles.mathLoadingText}>Rendering math...</Text>
        </View>
      )}
      
      {/* Error fallback */}
      {hasError && (
        <View style={styles.mathErrorContainer}>
          <Text style={styles.mathErrorText}>LaTeX: {cleanLatex}</Text>
        </View>
      )}
    </View>
  );
};
