import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface Props {
  affirmation: string;
  color: string;
  scriptLine?: string;
}

export default function AffirmationDisplay({ affirmation, color, scriptLine }: Props) {
  const [displayed, setDisplayed] = useState(affirmation);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const prevRef = useRef(affirmation);

  useEffect(() => {
    if (prevRef.current === affirmation) return;
    prevRef.current = affirmation;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setDisplayed(affirmation);
      translateY.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    });
  }, [affirmation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
        <View style={[styles.line, { backgroundColor: color }]} />
        <Text style={[styles.affirmation, { color: COLORS.text }]}>{displayed}</Text>
      </Animated.View>
      {scriptLine ? (
        <Text style={styles.script} numberOfLines={2}>{scriptLine}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: SPACING.lg, paddingHorizontal: SPACING.lg },
  card: { alignItems: 'center', gap: SPACING.md },
  line: { width: 32, height: 1.5, borderRadius: 2, opacity: 0.7 },
  affirmation: { fontFamily: FONTS.headingItalic, fontSize: 26, textAlign: 'center', lineHeight: 36, letterSpacing: 0.3 },
  script: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, letterSpacing: 0.2, paddingHorizontal: SPACING.xl },
});
