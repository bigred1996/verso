import { Platform } from 'react-native';

// Thin, crash-proof wrapper around expo-haptics.
//
// expo-haptics is a NATIVE module: it only fires inside a dev/standalone build
// that was compiled with the package. On web — and on any device binary built
// before the module was added — the import resolves to undefined or throws, so
// every call here is guarded. Haptics are a progressive enhancement: if they
// can't fire, the app behaves exactly as before, just without the buzz.
//
// On web we fall back to navigator.vibrate where the browser supports it.

let H: typeof import('expo-haptics') | null | undefined;
function mod() {
  if (H !== undefined) return H;
  try {
    H = require('expo-haptics');
  } catch {
    H = null;
  }
  return H;
}

function webVibrate(pattern: number | number[]) {
  try {
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    nav?.vibrate?.(pattern);
  } catch {}
}

/** A light tick — selection changes, crossing a threshold, tab switches. */
export function tick() {
  if (Platform.OS === 'web') return webVibrate(6);
  try {
    mod()?.selectionAsync();
  } catch {}
}

/** A medium thump — a committed action (swipe, rating set, button press). */
export function impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (Platform.OS === 'web') return webVibrate(style === 'heavy' ? 16 : style === 'light' ? 6 : 10);
  try {
    const m = mod();
    if (!m) return;
    const map = {
      light: m.ImpactFeedbackStyle.Light,
      medium: m.ImpactFeedbackStyle.Medium,
      heavy: m.ImpactFeedbackStyle.Heavy,
    };
    m.impactAsync(map[style]);
  } catch {}
}

/** A success / warning / error pattern — confirmations and rejections. */
export function notify(type: 'success' | 'warning' | 'error' = 'success') {
  if (Platform.OS === 'web') return webVibrate(type === 'success' ? [6, 24, 6] : 12);
  try {
    const m = mod();
    if (!m) return;
    const map = {
      success: m.NotificationFeedbackType.Success,
      warning: m.NotificationFeedbackType.Warning,
      error: m.NotificationFeedbackType.Error,
    };
    m.notificationAsync(map[type]);
  } catch {}
}

export default { tick, impact, notify };
