import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface Props {
  text: string;
  speed?: number; // ms per character
  style?: TextStyle;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 35,
  style,
  onComplete,
}: Props) {
  const [displayed, setDisplayed] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Reset
    if (timerRef.current) clearInterval(timerRef.current);
    indexRef.current = 0;
    setDisplayed('');

    timerRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  return (
    <Text style={[styles.text, style]}>
      {displayed}
      <Text style={styles.cursor}>|</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.headingLight,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.5,
  },
  cursor: {
    color: 'rgba(240,234,224,0.4)',
    fontFamily: FONTS.body,
  },
});
