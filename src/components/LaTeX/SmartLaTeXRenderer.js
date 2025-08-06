// components/LaTeX/SmartLaTeXRenderer.js
const SmartLaTeXRenderer = ({ latex, style }) => {
    const [renderMethod, setRenderMethod] = useState('mathjax');
    const [hasError, setHasError] = useState(false);
  
    if (!latex || latex.trim() === '') {
      return (
        <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: Palette.textMuted }}>No LaTeX content</Text>
        </View>
      );
    }
  
    if (renderMethod === 'mathjax' && !hasError) {
      return (
        <LaTeXRenderer 
          latex={latex} 
          style={style}
          onError={() => {
            setHasError(true);
            setRenderMethod('codecogs');
          }}
        />
      );
    }
  
    return <SimpleLaTeXRenderer latex={latex} style={style} />;
  };
  