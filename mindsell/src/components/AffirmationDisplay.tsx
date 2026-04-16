import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface Props {
  affirmation: string;
  color: string;
  /** Subtle background script text shown below the main affirmation */
  scriptLine?: string;
}

export default function AffirmationDisplay({ affirmation, color, scriptLine }: Props) {
  const [displayed, setDisplayed] = useState(affirmation);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const prevRef = useRef(affirmation);

  useEffect(() => {
    if (prevRef.current === affirmation) return;
    prevRef.current = affirmation;

    // Fade + slide out
    opacity.value = withTiming(0, { duration: 400 });
    translateY.value = withTiming(-10, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(setDisplayed)(affirmation);
        translateY.value = withTiming(0, { duration: 0 });
        translateY.value = withTiming(0, { duration: 600 });
        opacity.value = withTiming(1, { duration: 600 });
      }
    });
  }, [affirmation, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, animStyle]}>
        {/* Decorative line */}
        <View style={[styles.line, { backgroundColor: color }]} />

        <Text style={[styles.affirmation, { color: COLORS.text }]}>{displayed}</Text>
      </Animated.View>

      {scriptLine ? (
        <Text style={styles.script} numberOfLines={2}>
          {scriptLine}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  line: {
    width: 32,
    height: 1.5,
    borderRadius: 2,
    opacity: 0.7,
  },
  affirmation: {
    fontFamily: FONTS.headingItalic,
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  script: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
    paddingHorizontal: SPACING.xl,
  },
});
