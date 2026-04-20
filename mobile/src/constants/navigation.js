import { Platform } from 'react-native';

export function getNativeStackScreenOptions(contentBackground) {
  return {
    headerShown: false,
    animation: 'default',
    gestureEnabled: true,
    fullScreenGestureEnabled: Platform.OS === 'ios',
    contentStyle: { backgroundColor: contentBackground },
  };
}
