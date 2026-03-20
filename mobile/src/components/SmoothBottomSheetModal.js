import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Animated,
  Pressable,
  StyleSheet,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { MOTION } from '../constants/motion';

const winH = Dimensions.get('window').height;

export default function SmoothBottomSheetModal({
  visible,
  onRequestClose,
  children,
  statusBarTranslucent,
}) {
  const [rendered, setRendered] = useState(visible);
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(winH)).current;

  useEffect(() => {
    if (visible) setRendered(true);
  }, [visible]);

  useEffect(() => {
    if (!rendered) return;

    if (visible) {
      fade.setValue(0);
      translateY.setValue(winH);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: MOTION.backdropInMs,
          easing: MOTION.easingStandard,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          ...MOTION.springSheet,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: MOTION.backdropOutMs,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: winH,
          duration: MOTION.sheetOutMs,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible, rendered]);

  if (!rendered) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
      statusBarTranslucent={statusBarTranslucent}
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose}>
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.backdropFill, { opacity: fade }]}
          />
        </Pressable>
        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>{children}</Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdropFill: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrap: {
    width: '100%',
    zIndex: 2,
  },
});
