import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface Props {
  color: string;
  size?: number;
  active?: boolean;
}

const BASE_SIZE = 160;

export default function BreathingCircle({ color, size = BASE_SIZE, active = true }: Props) {
  const scale = useRef(new Animated.Value(1.0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (animRef.current) animRef.current.stop();

    if (!active) {
      Animated.timing(scale, { toValue: 1.0, duration: 600, useNativeDriver: true }).start();
      return;
    }

    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.5, duration: 4000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 2000, useNativeDriver: true }),
      ])
    );
    animRef.current.start();

    return () => { animRef.current?.stop(); };
  }, [active]);

  const innerOpacity = scale.interpolate({ inputRange: [1.0, 1.5], outputRange: [0.35, 0.7] });
  const outerOpacity = scale.interpolate({ inputRange: [1.0, 1.5], outputRange: [0.08, 0.25] });
  const glowScale = scale.interpolate({ inputRange: [1.0, 1.5], outputRange: [1.3, 1.95] });
  const haloScale = scale.interpolate({ inputRange: [1.0, 1.5], outputRange: [1.7, 2.55] });

  const r = size / 2;

  return (
    <View style={[styles.container, { width: size * 2.2, height: size * 2.2 }]}>
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: color, opacity: outerOpacity, transform: [{ scale: haloScale }] }]} />
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: color, opacity: innerOpacity, transform: [{ scale: glowScale }] }]} />
      <Animated.View style={[styles.core, { width: size, height: size, borderRadius: r, backgroundColor: color, shadowColor: color, transform: [{ scale }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1 },
  core: { opacity: 0.9, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
});
