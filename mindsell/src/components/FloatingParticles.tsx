import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 18;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  riseDuration: number;
  fadeDuration: number;
  delay: number;
}

interface Props {
  color: string;
  active?: boolean;
}

function SingleParticle({
  x,
  y,
  size,
  riseDuration,
  fadeDuration,
  delay,
  color,
}: Particle & { color: string }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-60 - Math.random() * 60, {
            duration: riseDuration,
          }),
          withTiming(0, { duration: 0 }),
        ),
        -1
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.0, { duration: 0 }),
          withTiming(0.7, { duration: fadeDuration * 0.3 }),
          withTiming(0.5, { duration: fadeDuration * 0.4 }),
          withTiming(0.0, { duration: fadeDuration * 0.3 }),
        ),
        -1
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export default function FloatingParticles({ color, active = true }: Props) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * SCREEN_W,
        y: Math.random() * SCREEN_H * 0.8 + SCREEN_H * 0.1,
        size: Math.random() * 3 + 1.5,
        riseDuration: Math.random() * 4000 + 3000,
        fadeDuration: Math.random() * 4000 + 3000,
        delay: Math.random() * 5000,
      })),
    []
  );

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <SingleParticle key={p.id} {...p} color={color} />
      ))}
    </View>
  );
}
