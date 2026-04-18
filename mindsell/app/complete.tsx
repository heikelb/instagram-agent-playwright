import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

  useEffect(() => {
    if (hasSaved.current || !session) return;
    hasSaved.current = true;
    recordSessionCompletion(session.id).then(setNewStreak);
  }, [session]);

  const iconScale = useRef(new Animated.Value(0)).current;
  const iconGlow = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(iconScale, { toValue: 1, damping: 12, useNativeDriver: true }).start();
    }, 200);
    setTimeout(() => {
      Animated.timing(iconGlow, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 500);
    setTimeout(() => {
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 600);
    setTimeout(() => {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.12, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1.0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    }, 800);

    return () => { pulseRef.current?.stop(); };
  }, []);

  const glowOpacity = iconGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
  const glowScale = pulseScale.interpolate({ inputRange: [1, 1.12], outputRange: [1.8, 2.016] });
  const contentTranslateY = contentOpacity.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  const nextSession = session
    ? SESSIONS[(SESSIONS.indexOf(session) + 1) % SESSIONS.length]
    : SESSIONS[0];

  if (!session) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.iconArea}>
          <Animated.View style={[styles.glowCircle, { backgroundColor: session.color, opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
          <Animated.Text style={[styles.bigIcon, { transform: [{ scale: iconScale }] }]}>
            {session.icon}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.textBlock, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
          <Text style={[styles.congratsLabel, { color: session.color }]}>SESSION COMPLÉTÉE</Text>
          <Text style={styles.sessionTitle}>{session.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: session.color }]}>{formatDuration(durationSec)}</Text>
              <Text style={styles.statLabel}>Durée</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: session.color }]}>{session.affirmations.length}</Text>
              <Text style={styles.statLabel}>Affirmations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: session.color }]}>{newStreak ?? '—'}{newStreak ? ' 🔥' : ''}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>

          <View style={[styles.anchorBox, { borderColor: session.colorDim }]}>
            <Text style={styles.anchorBoxLabel}>Votre ancrage</Text>
            <Text style={[styles.anchorBoxText, { color: session.color }]}>{session.anchorMessage}</Text>
          </View>

          <View style={styles.nextBlock}>
            <Text style={styles.nextLabel}>Session recommandée</Text>
            <Pressable style={[styles.nextCard, { borderColor: nextSession.colorDim }]} onPress={() => router.replace(`/session/${nextSession.id}`)}>
              <Text style={styles.nextIcon}>{nextSession.icon}</Text>
              <View>
                <Text style={styles.nextTitle}>{nextSession.title}</Text>
                <Text style={styles.nextSubtitle}>{nextSession.subtitle}</Text>
              </View>
              <Text style={[styles.nextArrow, { color: nextSession.color }]}>→</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={[styles.cta, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
          <Pressable style={[styles.homeBtn, { backgroundColor: session.colorDim, borderColor: session.color }]} onPress={() => router.replace('/')}>
            <Text style={[styles.homeBtnText, { color: session.color }]}>Retour à l'accueil</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl, gap: SPACING.xl },
  iconArea: { alignItems: 'center', justifyContent: 'center', height: 200, marginTop: SPACING.xl },
  glowCircle: { position: 'absolute', width: 100, height: 100, borderRadius: 50 },
  bigIcon: { fontSize: 80 },
  textBlock: { gap: SPACING.lg, alignItems: 'center' },
  congratsLabel: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 2 },
  sessionTitle: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.text, letterSpacing: 0.5, textAlign: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, alignItems: 'center', width: '100%' },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: FONTS.heading, fontSize: 20, letterSpacing: 0.3 },
  statLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  anchorBox: { width: '100%', borderWidth: 1, borderRadius: 16, padding: SPACING.lg, gap: SPACING.sm, backgroundColor: COLORS.surface },
  anchorBoxLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
  anchorBoxText: { fontFamily: FONTS.headingItalic, fontSize: 18, lineHeight: 28, letterSpacing: 0.3, textAlign: 'center' },
  nextBlock: { width: '100%', gap: SPACING.sm },
  nextLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
  nextCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.surfaceElevated, borderRadius: 12, padding: SPACING.md, borderWidth: 1 },
  nextIcon: { fontSize: 24 },
  nextTitle: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.text },
  nextSubtitle: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textSecondary },
  nextArrow: { fontFamily: FONTS.heading, fontSize: 20, marginLeft: 'auto' },
  cta: { paddingHorizontal: SPACING.xs },
  homeBtn: { paddingVertical: SPACING.md, borderRadius: 40, alignItems: 'center', borderWidth: 1 },
  homeBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 15, letterSpacing: 0.5 },
});
