import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SessionCard from '../src/components/SessionCard';
import { SESSIONS } from '../src/constants/sessions';
import { COLORS, FONTS, SPACING } from '../src/constants/theme';
import { getDailyQuote } from '../src/constants/quotes';
import { useStreak } from '../src/hooks/useStreak';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Bonjour, ${name} 🌅`;
  if (hour < 18) return `Bon après-midi, ${name} ☀️`;
  return `Bonsoir, ${name} 🌙`;
}

export default function HomeScreen() {
  const { streak, completedTodayIds, userName, isLoading, refresh } = useStreak();
  const quote = getDailyQuote();

  // Refresh data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={COLORS.gold}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>{getGreeting(userName)}</Text>
              <Text style={styles.subGreeting}>
                {completedTodayIds.length === 0
                  ? 'Commencez votre session du jour'
                  : completedTodayIds.length === SESSIONS.length
                  ? 'Toutes les sessions complétées 🏆'
                  : `${completedTodayIds.length}/${SESSIONS.length} sessions aujourd'hui`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </View>

          {/* Streak badge */}
          <View style={styles.streakRow}>
            <View style={styles.streakCard}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <View>
                <Text style={styles.streakLabel}>JOURS</Text>
                <Text style={styles.streakLabel}>CONSÉCUTIFS</Text>
              </View>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>

            {/* Today progress dots */}
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Aujourd'hui</Text>
              <View style={styles.progressDots}>
                {SESSIONS.map((s) => (
                  <View
                    key={s.id}
                    style={[
                      styles.progressDot,
                      completedTodayIds.includes(s.id)
                        ? { backgroundColor: s.color }
                        : { backgroundColor: COLORS.border },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ── Sessions ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessions</Text>
          {SESSIONS.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCompleted={completedTodayIds.includes(session.id)}
              onPress={() => router.push(`/session/${session.id}`)}
            />
          ))}
        </View>

        {/* ── Daily Quote ────────────────────────────────────────── */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteAccent} />
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // ── Header
  header: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingBlock: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  subGreeting: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // ── Streak row
  streakRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  streakCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakNumber: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: COLORS.gold,
    lineHeight: 40,
  },
  streakLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1,
    lineHeight: 13,
  },
  streakEmoji: {
    fontSize: 22,
    marginLeft: 'auto',
  },
  progressCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  // ── Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.text,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },

  // ── Quote
  quoteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quoteAccent: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    marginBottom: SPACING.xs,
    opacity: 0.6,
  },
  quoteText: {
    fontFamily: FONTS.headingItalic,
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  quoteAuthor: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});
