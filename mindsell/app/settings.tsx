import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING } from '../src/constants/theme';
import { useNotifications } from '../src/hooks/useNotifications';
import { useSettings } from '../src/hooks/useSettings';
import { getUserName, resetStreak, setUserName } from '../src/utils/storage';

export default function SettingsScreen() {
  const { settings, update } = useSettings();
  const { scheduleDaily, cancelReminder, requestPermission } = useNotifications();
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);

  useEffect(() => {
    getUserName().then((n) => {
      setName(n);
      setSavedName(n);
    });
  }, []);

  useEffect(() => {
    setReminderTime(settings.reminderTime);
  }, [settings.reminderTime]);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await setUserName(trimmed);
    setSavedName(trimmed);
  };

  const handleToggleSound = async (val: boolean) => {
    await update({ soundEnabled: val });
  };

  const handleToggleReminder = async (val: boolean) => {
    if (val) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permissions requises',
          'Autorisez les notifications dans les réglages de votre appareil.'
        );
        return;
      }
      const id = await scheduleDaily(reminderTime);
      if (id) {
        await update({ reminderEnabled: true, reminderTime, reminderNotificationId: id });
      }
    } else {
      await cancelReminder();
      await update({ reminderEnabled: false, reminderNotificationId: null });
    }
  };

  const handleTimeChange = async (time: string) => {
    // Validate HH:MM format
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setReminderTime(time);
      return;
    }
    setReminderTime(time);
    if (settings.reminderEnabled) {
      const id = await scheduleDaily(time);
      if (id) {
        await update({ reminderTime: time, reminderNotificationId: id });
      }
    } else {
      await update({ reminderTime: time });
    }
  };

  const handleResetStreak = () => {
    Alert.alert(
      'Réinitialiser le streak',
      'Êtes-vous sûr ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            await resetStreak();
            Alert.alert('Streak réinitialisé', 'Retour à zéro. C\'est reparti !');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>Réglages</Text>
        </View>

        {/* ── Profile ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Votre prénom</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Champion"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <Pressable
                style={[
                  styles.saveBtn,
                  name.trim() === savedName && styles.saveBtnDisabled,
                ]}
                onPress={handleSaveName}
                disabled={name.trim() === savedName}
              >
                <Text style={styles.saveBtnText}>
                  {name.trim() === savedName ? '✓' : 'Sauver'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Audio ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Sons de fond</Text>
                <Text style={styles.rowSubtitle}>
                  Bruit brun et battements binauraux
                </Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: COLORS.border, true: COLORS.goldDim }}
                thumbColor={settings.soundEnabled ? COLORS.gold : COLORS.textMuted}
              />
            </View>
          </View>
        </View>

        {/* ── Notifications ────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rappel quotidien</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Activer le rappel</Text>
                <Text style={styles.rowSubtitle}>
                  Notification quotidienne
                </Text>
              </View>
              <Switch
                value={settings.reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: COLORS.border, true: COLORS.goldDim }}
                thumbColor={settings.reminderEnabled ? COLORS.gold : COLORS.textMuted}
              />
            </View>

            {settings.reminderEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>Heure</Text>
                    <Text style={styles.rowSubtitle}>Format HH:MM (ex: 07:30)</Text>
                  </View>
                  <TextInput
                    style={styles.timeInput}
                    value={reminderTime}
                    onChangeText={handleTimeChange}
                    placeholder="08:00"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── Danger zone ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <View style={styles.card}>
            <Pressable style={styles.dangerRow} onPress={handleResetStreak}>
              <View style={styles.rowText}>
                <Text style={styles.dangerTitle}>Réinitialiser le streak</Text>
                <Text style={styles.rowSubtitle}>Remet le compteur à zéro</Text>
              </View>
              <Text style={styles.dangerArrow}>→</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Footer ──────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>MindSell v1.0</Text>
          <Text style={styles.footerText}>
            Reprogrammez votre subconscient. Dominez le terrain.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.xl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontFamily: FONTS.body,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    color: COLORS.text,
    letterSpacing: 0.3,
  },

  section: { gap: SPACING.sm },
  sectionTitle: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.text,
  },
  rowSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },

  fieldLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    height: 44,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  saveBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.background,
  },
  timeInput: {
    width: 80,
    height: 44,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.mono,
    fontSize: 16,
    color: COLORS.gold,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
  },

  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  dangerTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: '#E87C7C',
  },
  dangerArrow: {
    color: '#E87C7C',
    fontSize: 18,
    fontFamily: FONTS.body,
  },

  footer: {
    alignItems: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.md,
  },
  footerText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
