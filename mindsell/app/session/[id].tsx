import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AffirmationDisplay from '../../src/components/AffirmationDisplay';
import BreathingCircle from '../../src/components/BreathingCircle';
import FloatingParticles from '../../src/components/FloatingParticles';
import TypewriterText from '../../src/components/TypewriterText';
import {
  BREATHING_CYCLE_DURATION,
  BREATHING_PATTERN,
  PHASE_DURATIONS,
  SESSIONS,
  getReprogrammingDuration,
  type Session,
} from '../../src/constants/sessions';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useAudio } from '../../src/hooks/useAudio';
import { useSettings } from '../../src/hooks/useSettings';

// ── Types ────────────────────────────────────────────────────────────────────

type Phase = 'induction' | 'deepening' | 'reprogramming' | 'anchoring';

const PHASE_ORDER: Phase[] = ['induction', 'deepening', 'reprogramming', 'anchoring'];

const PHASE_LABELS: Record<Phase, string> = {
  induction: 'Induction',
  deepening: 'Approfondissement',
  reprogramming: 'Reprogrammation',
  anchoring: 'Ancrage',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function padTwo(n: number) {
  return String(Math.floor(n)).padStart(2, '0');
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${padTwo(m)}:${padTwo(s)}`;
}

function getBreathingLabel(elapsed: number): string {
  const t = elapsed % BREATHING_CYCLE_DURATION;
  if (t < BREATHING_PATTERN[0].seconds) return BREATHING_PATTERN[0].label;
  if (t < BREATHING_PATTERN[0].seconds + BREATHING_PATTERN[1].seconds)
    return BREATHING_PATTERN[1].label;
  if (
    t <
    BREATHING_PATTERN[0].seconds +
      BREATHING_PATTERN[1].seconds +
      BREATHING_PATTERN[2].seconds
  )
    return BREATHING_PATTERN[2].label;
  return BREATHING_PATTERN[3].label;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SessionPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session: Session | undefined = SESSIONS.find((s) => s.id === Number(id));

  const { settings } = useSettings();
  const audio = useAudio();

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('induction');
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [typewriterKey, setTypewriterKey] = useState(0);

  const phaseRef = useRef<Phase>('induction');
  const phaseElapsedRef = useRef(0);
  const isPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  phaseRef.current = phase;
  phaseElapsedRef.current = phaseElapsed;
  isPausedRef.current = isPaused;

  if (!session) {
    return null;
  }

  const reprogramDuration = getReprogrammingDuration(session);

  const phaseDuration: Record<Phase, number> = {
    induction: PHASE_DURATIONS.induction,
    deepening: PHASE_DURATIONS.deepening,
    reprogramming: reprogramDuration,
    anchoring: PHASE_DURATIONS.anchoring,
  };

  const totalDuration = session.durationMinutes * 60;

  // ── Derived values ─────────────────────────────────────────────────────────

  const affirmationIndex = Math.floor(
    (phaseElapsed / 5) % session.affirmations.length
  );

  const breathingLabel = getBreathingLabel(phaseElapsed);

  const scriptLineIndex = Math.min(
    Math.floor(
      (phaseElapsed / phaseDuration.deepening) * session.deepeningScript.length
    ),
    session.deepeningScript.length - 1
  );

  // ── Audio ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (settings.soundEnabled) {
      audio.play(session.audioType, 0.35);
    }
    return () => {
      audio.stop();
    };
  }, []);

  // ── AppState — pause on background ────────────────────────────────────────

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        isPausedRef.current = true;
        setIsPaused(true);
        audio.pause();
      } else if (nextState === 'active') {
        // Don't auto-resume — let user decide
      }
    });
    return () => sub.remove();
  }, []);

  // ── Main 1-second tick ────────────────────────────────────────────────────

  const advancePhase = useCallback(() => {
    const current = phaseRef.current;
    const idx = PHASE_ORDER.indexOf(current);

    if (idx >= PHASE_ORDER.length - 1) {
      // Session complete — navigate to completion screen
      if (timerRef.current) clearInterval(timerRef.current);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace({
        pathname: '/complete',
        params: {
          sessionId: String(session.id),
          actualDuration: String(totalDuration),
        },
      });
      return;
    }

    const next = PHASE_ORDER[idx + 1];
    phaseRef.current = next;
    setPhase(next);
    setPhaseElapsed(0);
    phaseElapsedRef.current = 0;
    setScriptIndex(0);
    setTypewriterKey((k) => k + 1);

    if (next === 'anchoring' && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [session.id, totalDuration]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      setPhaseElapsed((prev) => {
        const next = prev + 1;
        phaseElapsedRef.current = next;

        const duration = phaseDuration[phaseRef.current];
        if (next >= duration) {
          advancePhase();
          return 0;
        }

        // Advance deepening script index
        if (phaseRef.current === 'deepening') {
          const newIdx = Math.min(
            Math.floor(
              (next / phaseDuration.deepening) * session.deepeningScript.length
            ),
            session.deepeningScript.length - 1
          );
          setScriptIndex((prev) => {
            if (newIdx !== prev) {
              setTypewriterKey((k) => k + 1);
              return newIdx;
            }
            return prev;
          });
        }

        return next;
      });

      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advancePhase, phaseDuration, session.deepeningScript.length]);

  // ── Haptic pulse every 16s during anchoring ───────────────────────────────

  useEffect(() => {
    if (phase !== 'anchoring' || Platform.OS === 'web') return;
    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [phase]);

  // ── Pause / resume ────────────────────────────────────────────────────────

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    isPausedRef.current = next;
    if (next) {
      audio.pause();
    } else {
      audio.resume();
    }
  };

  // ── Quit ──────────────────────────────────────────────────────────────────

  const quit = () => {
    audio.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    router.back();
  };

  // ── Progress ──────────────────────────────────────────────────────────────

  const progressFraction = Math.min(totalElapsed / totalDuration, 1);
  const timeLeft = Math.max(totalDuration - totalElapsed, 0);
  const phaseTimeLeft = Math.max(phaseDuration[phase] - phaseElapsed, 0);
  const phaseProgress = phaseElapsed / phaseDuration[phase];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Background particles only during reprogramming */}
      <FloatingParticles
        color={session.color}
        active={phase === 'reprogramming' && !isPaused}
      />

      {/* ── Top bar ───────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable onPress={quit} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕</Text>
        </Pressable>

        <View style={styles.phaseBlock}>
          <Text style={styles.phaseLabel}>{PHASE_LABELS[phase]}</Text>
          <Text style={styles.phaseTime}>{formatTime(phaseTimeLeft)}</Text>
        </View>

        <View style={styles.totalTime}>
          <Text style={styles.totalTimeText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* ── Global progress bar ───────────────────────────────── */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressFraction * 100}%` as `${number}%`,
              backgroundColor: session.color,
            },
          ]}
        />
      </View>

      {/* ── Phase dots ────────────────────────────────────────── */}
      <View style={styles.phaseDots}>
        {PHASE_ORDER.map((p, i) => (
          <View
            key={p}
            style={[
              styles.phaseDot,
              {
                backgroundColor:
                  p === phase
                    ? session.color
                    : PHASE_ORDER.indexOf(phase) > i
                    ? `${session.color}88`
                    : COLORS.border,
                width: p === phase ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>

      {/* ── Main content area ─────────────────────────────────── */}
      <View style={styles.main}>
        {/* PHASE 1 — Induction (breathing) */}
        {phase === 'induction' && (
          <View style={styles.centered}>
            <BreathingCircle color={session.color} active={!isPaused} />
            <View style={styles.breathingLabelBlock}>
              <Text style={[styles.breathingLabel, { color: session.color }]}>
                {breathingLabel}
              </Text>
              <Text style={styles.breathingHint}>4 · 4 · 6 · 2</Text>
            </View>
          </View>
        )}

        {/* PHASE 2 — Deepening */}
        {phase === 'deepening' && (
          <View style={styles.deepeningContainer}>
            {/* Subtle descending dots */}
            <View style={styles.descentDots}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.descentDot,
                    {
                      opacity: i <= scriptIndex ? 0.7 : 0.15,
                      backgroundColor: session.color,
                      transform: [{ scale: 1 - i * 0.12 }],
                    },
                  ]}
                />
              ))}
            </View>

            <TypewriterText
              key={typewriterKey}
              text={session.deepeningScript[scriptIndex]}
              speed={30}
              style={styles.deepeningText}
            />

            <Text style={styles.deepeningCount}>
              {scriptIndex + 1} / {session.deepeningScript.length}
            </Text>
          </View>
        )}

        {/* PHASE 3 — Reprogramming */}
        {phase === 'reprogramming' && (
          <View style={styles.centered}>
            <AffirmationDisplay
              affirmation={session.affirmations[affirmationIndex]}
              color={session.color}
            />

            {/* Affirmation counter */}
            <View style={styles.affirmCounter}>
              {session.affirmations.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.affirmDot,
                    {
                      backgroundColor:
                        i === affirmationIndex ? session.color : COLORS.border,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Phase timer */}
            <Text style={styles.phaseTimerLabel}>
              {formatTime(phaseTimeLeft)} restant
            </Text>
          </View>
        )}

        {/* PHASE 4 — Anchoring */}
        {phase === 'anchoring' && (
          <View style={styles.centered}>
            <Text style={styles.anchorIcon}>{session.icon}</Text>
            <View style={styles.anchorGlow} />
            <Text style={[styles.anchorMessage, { color: session.color }]}>
              {session.anchorMessage}
            </Text>
            <Text style={styles.anchorHint}>
              Respirez profondément et ancrez cet état
            </Text>
          </View>
        )}
      </View>

      {/* ── Bottom controls ───────────────────────────────────── */}
      <View style={styles.controls}>
        <Pressable
          style={[
            styles.pauseBtn,
            { borderColor: session.color },
            isPaused && { backgroundColor: session.colorDim },
          ]}
          onPress={togglePause}
        >
          <Text style={[styles.pauseIcon, { color: session.color }]}>
            {isPaused ? '▶' : '⏸'}
          </Text>
          <Text style={[styles.pauseLabel, { color: session.color }]}>
            {isPaused ? 'Reprendre' : 'Pause'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quitText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  phaseBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  phaseLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  phaseTime: {
    fontFamily: FONTS.mono,
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  totalTime: {
    width: 60,
    alignItems: 'flex-end',
  },
  totalTimeText: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // ── Progress bar
  progressBarBg: {
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
  progressBarFill: {
    height: 2,
    borderRadius: 2,
  },

  // ── Phase dots
  phaseDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: SPACING.sm,
  },
  phaseDot: {
    height: 4,
    borderRadius: 2,
  },

  // ── Main content
  main: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    gap: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },

  // ── Induction
  breathingLabelBlock: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  breathingLabel: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    letterSpacing: 1,
  },
  breathingHint: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 3,
  },

  // ── Deepening
  deepeningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  descentDots: {
    gap: 10,
    alignItems: 'center',
  },
  descentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deepeningText: {
    fontFamily: FONTS.headingLight,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.5,
  },
  deepeningCount: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  // ── Reprogramming
  affirmCounter: {
    flexDirection: 'row',
    gap: 6,
  },
  affirmDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  phaseTimerLabel: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  // ── Anchoring
  anchorIcon: {
    fontSize: 72,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  anchorGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
  },
  anchorMessage: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.5,
  },
  anchorHint: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── Controls
  controls: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 40,
    borderWidth: 1,
  },
  pauseIcon: {
    fontSize: 16,
  },
  pauseLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
