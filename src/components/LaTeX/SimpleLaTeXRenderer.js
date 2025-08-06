

// components/LaTeX/SimpleLaTeXRenderer.js
const SimpleLaTeXRenderer = ({ latex, style }) => {
    if (!latex || latex.trim() === '') {
      return (
        <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: Palette.textMuted }}>No LaTeX content</Text>
        </View>
      );
    }
  
    const cleanLatex = latex.replace(/^\$+|\$+$/g, '').trim();
    const encodedLatex = encodeURIComponent(cleanLatex);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: transparent;
            color: #333;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60px;
          }
          .math-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }
          .math-image {
            max-width: 100%;
            height: auto;
            vertical-align: middle;
          }
          .error-message {
            color: #d32f2f;
            font-size: 12px;
            text-align: center;
            padding: 8px;
            background: #ffebee;
            border-radius: 4px;
          }
          .loading {
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="math-container">
          <div class="loading" id="loading">Loading...</div>
          <img 
            src="https://latex.codecogs.com/svg.latex?\\dpi{120}&space;${encodedLatex}" 
            alt="LaTeX" 
            class="math-image"
            style="display: none;"
            onload="
              document.getElementById('loading').style.display = 'none';
              this.style.display = 'block';
            "
            onerror="
              document.getElementById('loading').style.display = 'none';
              this.parentElement.innerHTML = '<div class=\\'error-message\\'>LaTeX: ${cleanLatex}</div>';
            "
          >
        </div>
      </body>
      </html>
    `;
  
    return (
      <WebView
        source={{ html: htmlContent }}
        style={[style, { minHeight: 60 }]}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
      />
    );
  };
  
  