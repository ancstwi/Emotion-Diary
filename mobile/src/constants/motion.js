import { Easing } from 'react-native';

export const MOTION = {
  easingStandard: Easing.bezier(0.25, 0.1, 0.25, 1),
  easingOutDecel: Easing.bezier(0, 0, 0.2, 1),
  backdropInMs: 220,
  backdropOutMs: 170,
  sheetOutMs: 260,
  springSheet: {
    friction: 9,
    tension: 148,
    overshootClamping: false,
  },
  springChip: {
    friction: 8,
    tension: 128,
  },
  chipFadeMs: 200,
};
