import { useState } from 'react';
import { COLORS } from '../constants/colors.js';
import { MODULES } from '../constants/modules.js';
import { EXERCISES } from '../constants/exercises.js';
import { VOCAB_WORDS } from '../constants/vocabulary.js';
import FlameStreak from '../components/FlameStreak.jsx';
import XPBar from '../components/XPBar.jsx';

const TOTAL_XP = 340;
const STREAK = 7;
const WORD_OF_DAY = VOCAB_WORDS[0];

export default function HomeScreen({ setScreen, setActiveModule, setActiveExercise }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Bonjour 👋</div>
            <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.2 }}>
              Heikel
            </div>
          </div>
          <FlameStreak count={STREAK} />
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <XPBar current={TOTAL_XP % 500} max={500} color={COLORS.gold} />
          </div>
          <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif" }}>
            {TOTAL_XP} XP
          </span>
        </div>
      </div>

      {/* Défi du jour */}
      <div style={{ margin: "20px 20px 0" }}>
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.accent}22 0%, ${COLORS.card} 100%)`,
          border: `1.5px solid ${COLORS.accent}55`,
          borderRadius: 18,
          padding: "18px 20px",
          cursor: "pointer",
          transition: "transform 0.2s",
          transform: hovered === "defi" ? "translateY(-2px)" : "none",
        }}
          onMouseEnter={() => setHovered("defi")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => { setActiveExercise(EXERCISES[0]); setScreen("exercise"); }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                🎯 Défi du jour
              </div>
              <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                Le Miroir
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
                3 min — Répète jusqu'à la perfection
              </div>
            </div>
            <div style={{
              background: COLORS.accent,
              color: "#fff",
              borderRadius: 99,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              boxShadow: `0 8px 24px ${COLORS.accent}44`,
              whiteSpace: "nowrap",
            }}>
              +30 XP
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
          Modules
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MODULES.map(mod => {
            const doneLessons = mod.lessons.filter(l => l.done).length;
            const pct = Math.round((doneLessons / mod.lessons.length) * 100);
            return (
              <div
                key={mod.id}
                style={{
                  background: `linear-gradient(135deg, ${mod.color}18 0%, ${COLORS.card} 100%)`,
                  border: `1.5px solid ${mod.color}${hovered === mod.id ? "55" : "22"}`,
                  borderRadius: 18,
                  padding: "16px 18px",
                  cursor: "pointer",
                  transition: "transform 0.2s, border-color 0.2s",
                  transform: hovered === mod.id ? "translateY(-2px)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
                onMouseEnter={() => setHovered(mod.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { setActiveModule(mod); setScreen("module"); }}
              >
                <span style={{ fontSize: 28 }}>{mod.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15, fontFamily: "'Sora', sans-serif" }}>
                      {mod.title}
                    </div>
                    <span style={{ color: mod.color, fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                      {doneLessons}/{mod.lessons.length}
                    </span>
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
                    {mod.subtitle}
                  </div>
                  <XPBar current={doneLessons} max={mod.lessons.length} color={mod.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exercices rapides */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
          Exercices rapides
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {EXERCISES.map(ex => (
            <div
              key={ex.id}
              style={{
                background: `linear-gradient(135deg, ${ex.color}18 0%, ${COLORS.card} 100%)`,
                border: `1.5px solid ${ex.color}${hovered === ex.id ? "55" : "22"}`,
                borderRadius: 14,
                padding: "14px",
                cursor: "pointer",
                transition: "transform 0.2s",
                transform: hovered === ex.id ? "scale(1.02)" : "none",
              }}
              onMouseEnter={() => setHovered(ex.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { setActiveExercise(ex); setScreen("exercise"); }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{ex.icon}</div>
              <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif", marginBottom: 2 }}>
                {ex.title}
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: "'Inter', sans-serif" }}>
                {ex.duration}
              </div>
              <div style={{ color: ex.color, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
                +{ex.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mot du jour */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
          Mot du jour
        </div>
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.gold}18 0%, ${COLORS.card} 100%)`,
            border: `1.5px solid ${COLORS.gold}${hovered === "word" ? "55" : "22"}`,
            borderRadius: 18,
            padding: "18px 20px",
            cursor: "pointer",
            transition: "transform 0.2s",
            transform: hovered === "word" ? "translateY(-2px)" : "none",
          }}
          onMouseEnter={() => setHovered("word")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setScreen("vocab")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: COLORS.gold, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                {WORD_OF_DAY.word}
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif", marginTop: 4, maxWidth: 240 }}>
                {WORD_OF_DAY.definition}
              </div>
            </div>
            <span style={{ fontSize: 10, color: COLORS.gold, background: COLORS.goldSoft, border: `1px solid ${COLORS.gold}44`, borderRadius: 99, padding: "3px 10px", fontWeight: 700, fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}>
              {WORD_OF_DAY.category}
            </span>
          </div>
          <div style={{ marginTop: 10, color: COLORS.textDim, fontSize: 12, fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}>
            {WORD_OF_DAY.example}
          </div>
        </div>
      </div>
    </div>
  );
}
