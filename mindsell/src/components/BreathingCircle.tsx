import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  color: string;
  size?: number;
  active?: boolean;
}

const BASE_SIZE = 160;

export default function BreathingCircle({ color, size = BASE_SIZE, active = true }: Props) {
  const scale = useSharedValue(1.0);
  const innerOpacity = useSharedValue(0.4);
  const outerOpacity = useSharedValue(0.12);

  useEffect(() => {
    if (!active) {
      scale.value = withTiming(1.0, { duration: 600 });
      return;
    }

    // 4-4-6-2 breathing pattern (16s cycle)
    scale.value = withRepeat(
      withSequence(
        // Inspire: grow over 4s
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        // Retiens: hold at 1.5 for 4s
        withTiming(1.5, { duration: 4000, easing: Easing.linear }),
        // Expire: shrink over 6s
        withTiming(1.0, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        // Pause: hold at 1.0 for 2s
        withTiming(1.0, { duration: 2000, easing: Easing.linear }),
      ),
      -1,
      false
    );

    innerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 4000 }),
        withTiming(0.7, { duration: 4000 }),
        withTiming(0.35, { duration: 6000 }),
        withTiming(0.35, { duration: 2000 }),
      ),
      -1,
      false
    );

    outerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 4000 }),
        withTiming(0.25, { duration: 4000 }),
        withTiming(0.08, { duration: 6000 }),
        withTiming(0.08, { duration: 2000 }),
      ),
      -1,
      false
    );
  }, [active, scale, innerOpacity, outerOpacity]);

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: innerOpacity.value,
    transform: [{ scale: scale.value * 1.3 }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: outerOpacity.value,
    transform: [{ scale: scale.value * 1.7 }],
  }));

  const r = size / 2;

  return (
    <View style={[styles.container, { width: size * 2.2, height: size * 2.2 }]}>
      {/* Outer halo */}
      <Animated.View
        style={[
          styles.ring,
          haloStyle,
          {
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: size * 0.9,
            borderColor: color,
          },
        ]}
      />
      {/* Inner glow ring */}
      <Animated.View
        style={[
          styles.ring,
          glowStyle,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size * 0.65,
            borderColor: color,
          },
        ]}
      />
      {/* Core circle */}
      <Animated.View
        style={[
          styles.core,
          coreStyle,
          {
            width: size,
            height: size,
            borderRadius: r,
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0.2,
  },
  core: {
    opacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
});
