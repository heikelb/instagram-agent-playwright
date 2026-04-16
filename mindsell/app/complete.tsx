import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SESSIONS } from '../src/constants/sessions';
import { COLORS, FONTS, SPACING } from '../src/constants/theme';
import { recordSessionCompletion } from '../src/utils/storage';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} s`;
}

export default function CompleteScreen() {
  const { sessionId, actualDuration } = useLocalSearchParams<{
    sessionId: string;
    actualDuration: string;
  }>();

  const session = SESSIONS.find((s) => s.id === Number(sessionId));
  const durationSec = Number(actualDuration) || 0;

  const [newStreak, setNewStreak] = useState<number | null>(null);
  const hasSaved = useRef(false);

  // ── Save streak on mount (once) ───────────────────────────────────────────
  useEffect(() => {
    if (hasSaved.current || !session) return;
    hasSaved.current = true;
    recordSessionCompletion(session.id).then(setNewStreak);
  }, [session]);

  // ── Entrance animations ───────────────────────────────────────────────────
  const iconScale = useSharedValue(0);
  const iconGlow = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    iconScale.value = withDelay(200, withSpring(1, { damping: 12 }));
    iconGlow.value = withDelay(500, withTiming(1, { duration: 600 }));
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    pulseScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: iconGlow.value * 0.4,
    transform: [{ scale: pulseScale.value * 1.8 }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: (1 - contentOpacity.value) * 20 }],
  }));

  // ── Suggest next session ──────────────────────────────────────────────────
  const nextSession = session
    ? SESSIONS[(SESSIONS.indexOf(session) + 1) % SESSIONS.length]
    : SESSIONS[0];

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Icon celebration ─────────────────────────────────── */}
        <View style={styles.iconArea}>
          {/* Glow circle */}
          <Animated.View
            style={[
              styles.glowCircle,
              { backgroundColor: session.color },
              glowStyle,
            ]}
          />
          <Animated.Text style={[styles.bigIcon, iconStyle]}>
            {session.icon}
          </Animated.Text>
        </View>

        {/* ── Content ──────────────────────────────────────────── */}
        <Animated.View style={[styles.textBlock, contentStyle]}>
          <Text style={[styles.congratsLabel, { color: session.color }]}>
            SESSION COMPLÉTÉE
          </Text>
          <Text style={styles.sessionTitle}>{session.title}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: session.color }]}>
                {formatDuration(durationSec)}
              </Text>
              <Text style={styles.statLabel}>Durée</Text>
            </View>
            <View style={[styles.statDivider]} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: session.color }]}>
                {session.affirmations.length}
              </Text>
              <Text style={styles.statLabel}>Affirmations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: session.color }]}>
                {newStreak ?? '—'}
                {newStreak ? ' 🔥' : ''}
              </Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>

          {/* Anchor reminder */}
          <View style={[styles.anchorBox, { borderColor: session.colorDim }]}>
            <Text style={styles.anchorBoxLabel}>Votre ancrage</Text>
            <Text style={[styles.anchorBoxText, { color: session.color }]}>
              {session.anchorMessage}
            </Text>
          </View>

          {/* Next session suggestion */}
          <View style={styles.nextBlock}>
            <Text style={styles.nextLabel}>Session recommandée</Text>
            <Pressable
              style={[styles.nextCard, { borderColor: nextSession.colorDim }]}
              onPress={() => {
                router.replace(`/session/${nextSession.id}`);
              }}
            >
              <Text style={styles.nextIcon}>{nextSession.icon}</Text>
              <View>
                <Text style={styles.nextTitle}>{nextSession.title}</Text>
                <Text style={styles.nextSubtitle}>{nextSession.subtitle}</Text>
              </View>
              <Text style={[styles.nextArrow, { color: nextSession.color }]}>→</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <Animated.View style={[styles.cta, contentStyle]}>
          <Pressable
            style={[styles.homeBtn, { backgroundColor: session.colorDim, borderColor: session.color }]}
            onPress={() => router.replace('/')}
          >
            <Text style={[styles.homeBtnText, { color: session.color }]}>
              Retour à l'accueil
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.xl,
  },

  // ── Icon area
  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginTop: SPACING.xl,
  },
  glowCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  bigIcon: {
    fontSize: 80,
  },

  // ── Text block
  textBlock: {
    gap: SPACING.lg,
    alignItems: 'center',
  },
  congratsLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 2,
  },
  sessionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.text,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // ── Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },

  // ── Anchor box
  anchorBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  anchorBoxLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  anchorBoxText: {
    fontFamily: FONTS.headingItalic,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ── Next session
  nextBlock: {
    width: '100%',
    gap: SPACING.sm,
  },
  nextLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
  },
  nextIcon: { fontSize: 24 },
  nextTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text,
  },
  nextSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  nextArrow: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    marginLeft: 'auto',
  },

  // ── CTA
  cta: {
    paddingHorizontal: SPACING.xs,
  },
  homeBtn: {
    paddingVertical: SPACING.md,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
  },
  homeBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
