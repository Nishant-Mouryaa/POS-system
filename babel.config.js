module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      [
        "module:react-native-dotenv",
        {
          "moduleName": "@env",
          "path": ".env",
          "safe": true,
          "allowUndefined": false
        }
      ],
      // Only remove console in production
      process.env.NODE_ENV === 'production' ? 
        ['transform-remove-console', { exclude: ['error', 'warn'] }] : 
        null
    ].filter(Boolean)
  };
};