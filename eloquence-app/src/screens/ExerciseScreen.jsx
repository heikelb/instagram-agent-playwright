import { useState, useRef, useEffect } from 'react';
import { COLORS } from '../constants/colors.js';

function pad(n) { return String(n).padStart(2, "0"); }

export default function ExerciseScreen({ exercise, setScreen }) {
  const [phase, setPhase] = useState("intro"); // intro | active | done
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const total = exercise.durationSecs;

  useEffect(() => {
    if (phase === "active" && !paused) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          if (e + 1 >= total) {
            clearInterval(intervalRef.current);
            setPhase("done");
            return total;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase, paused, total]);

  const remaining = total - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = elapsed / total;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - progress);

  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 20px", paddingBottom: 100, display: "flex", flexDirection: "column" }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", padding: 0, marginBottom: 24, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6 }}>
          ← Retour
        </button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{exercise.icon}</div>
          <div style={{ color: COLORS.text, fontSize: 26, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>
            {exercise.title}
          </div>
          <span style={{ color: exercise.color, fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif", background: `${exercise.color}18`, border: `1px solid ${exercise.color}44`, borderRadius: 99, padding: "4px 12px" }}>
            {exercise.duration} · +{exercise.xp} XP
          </span>
        </div>

        <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.cardBorder}`, borderRadius: 18, padding: "20px", marginBottom: 16 }}>
          <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 16 }}>
            {exercise.description}
          </div>
          <div style={{ background: `${exercise.color}12`, border: `1.5px solid ${exercise.color}33`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ color: exercise.color, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Phrase / Sujet
            </div>
            <div style={{ color: COLORS.text, fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.6, fontStyle: "italic" }}>
              {exercise.phrase}
            </div>
          </div>
        </div>

        <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.cardBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 28 }}>
          <div style={{ color: COLORS.gold, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            💡 Conseil pro
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
            {exercise.tip}
          </div>
        </div>

        <button
          onClick={() => setPhase("active")}
          style={{
            background: exercise.color,
            color: "#fff",
            border: "none",
            borderRadius: 99,
            padding: "16px",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Sora', sans-serif",
            cursor: "pointer",
            boxShadow: `0 8px 24px ${exercise.color}44`,
            transition: "transform 0.2s",
            width: "100%",
          }}
        >
          🚀 Lancer l'exercice
        </button>
      </div>
    );
  }

  if (phase === "active") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 20px", paddingBottom: 100, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
            {exercise.icon} {exercise.title}
          </div>
          <span style={{ color: exercise.color, fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
            +{exercise.xp} XP
          </span>
        </div>

        {/* Circular timer */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke={COLORS.cardBorder} strokeWidth="6" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={exercise.color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 6px ${exercise.color}88)` }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: COLORS.text, fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
              {pad(mins)}:{pad(secs)}
            </div>
          </div>
        </div>

        {/* Phrase */}
        <div style={{ background: `${exercise.color}12`, border: `1.5px solid ${exercise.color}33`, borderRadius: 18, padding: "18px 20px", width: "100%", marginBottom: 24 }}>
          <div style={{ color: COLORS.text, fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.7, fontStyle: "italic", textAlign: "center" }}>
            {exercise.phrase}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button
            onClick={() => setPaused(p => !p)}
            style={{
              flex: 1,
              background: COLORS.card,
              border: `1.5px solid ${COLORS.cardBorder}`,
              borderRadius: 99,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: COLORS.text,
              cursor: "pointer",
            }}
          >
            {paused ? "▶ Reprendre" : "⏸ Pause"}
          </button>
          <button
            onClick={() => { clearInterval(intervalRef.current); setPhase("done"); }}
            style={{
              flex: 1,
              background: exercise.color,
              border: "none",
              borderRadius: 99,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 8px 24px ${exercise.color}44`,
            }}
          >
            ✓ Terminé
          </button>
        </div>
      </div>
    );
  }

  // done phase
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 20px", paddingBottom: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
        <div style={{ color: COLORS.text, fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>
          Exercice terminé !
        </div>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: COLORS.goldSoft,
          border: `1.5px solid ${COLORS.gold}44`,
          borderRadius: 99,
          padding: "8px 20px",
          marginTop: 8,
        }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ color: COLORS.gold, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            +{exercise.xp} XP
          </span>
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.cardBorder}`, borderRadius: 18, padding: "20px", width: "100%", marginBottom: 24 }}>
        <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          🎯 Applique ça aujourd'hui
        </div>
        <div style={{ color: COLORS.text, fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
          {exercise.tip}
        </div>
        <div style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
          Répète cet exercice 2× de suite pour ancrer le réflexe. La première fois tu apprends, la deuxième tu maîtrises.
        </div>
      </div>

      <button
        onClick={() => setScreen("home")}
        style={{
          background: COLORS.accent,
          color: "#fff",
          border: "none",
          borderRadius: 99,
          padding: "16px",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "'Sora', sans-serif",
          cursor: "pointer",
          boxShadow: `0 8px 24px ${COLORS.accent}44`,
          width: "100%",
        }}
      >
        🏠 Retour à l'accueil
      </button>
    </div>
  );
}
