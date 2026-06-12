module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-worklets/plugin powers Reanimated 4 worklets and MUST be
    // listed last. Without it, useAnimatedStyle / Gesture worklets silently
    // fall back to the JS thread (or throw).
    plugins: ['react-native-worklets/plugin'],
  };
};
