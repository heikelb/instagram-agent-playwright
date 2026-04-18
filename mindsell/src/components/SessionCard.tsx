import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import type { Session } from '../constants/sessions';

interface Props {
  session: Session;
  isCompleted?: boolean;
  onPress: () => void;
}

export default function SessionCard({ session, isCompleted = false, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Pressable
        style={styles.pressable}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, damping: 15, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, damping: 15, useNativeDriver: true }).start()}
        onPress={onPress}
      >
        <View style={[styles.accentBar, { backgroundColor: session.color }]} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.icon}>{session.icon}</Text>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{session.title}</Text>
              <Text style={styles.subtitle}>{session.subtitle}</Text>
            </View>
            {isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: session.colorDim }]}>
                <Text style={[styles.completedText, { color: session.color }]}>✓</Text>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <View style={[styles.durationPill, { backgroundColor: session.colorDim }]}>
              <Text style={[styles.duration, { color: session.color }]}>
                {session.durationMinutes} min
              </Text>
            </View>
            <View style={styles.dotsRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i < session.affirmations.length / 2 ? session.color : COLORS.border },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
  },
  accentBar: {
    width: 3,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 28,
    width: 36,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  duration: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
