import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 12;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  riseDuration: number;
  delay: number;
}

interface Props {
  color: string;
  active?: boolean;
}

function SingleParticle({ x, y, size, riseDuration, delay, color }: Particle & { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: riseDuration / 2, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: riseDuration / 2, useNativeDriver: true }),
        ])
      );
      animRef.current.start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      animRef.current?.stop();
    };
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.7, 0.5, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
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
        delay: Math.random() * 3000,
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
