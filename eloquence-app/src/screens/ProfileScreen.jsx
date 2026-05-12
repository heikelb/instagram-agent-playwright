import { COLORS } from '../constants/colors.js';

const STATS = [
  { label: "XP Total", value: "340", icon: "⚡", color: COLORS.gold, soft: COLORS.goldSoft },
  { label: "Streak", value: "7j", icon: "🔥", color: COLORS.accent, soft: COLORS.accentSoft },
  { label: "Exercices", value: "12", icon: "🎯", color: COLORS.blue, soft: COLORS.blueSoft },
  { label: "Mots acquis", value: "3", icon: "📚", color: COLORS.purple, soft: COLORS.purpleSoft },
];

const BADGES = [
  { icon: "🔥", label: "7 jours de feu", desc: "7 jours consécutifs", earned: true, color: COLORS.accent },
  { icon: "🪞", label: "Le Miroir", desc: "1er exercice miroir", earned: true, color: COLORS.blue },
  { icon: "⚡", label: "Vocabuliste", desc: "10 mots acquis", earned: true, color: COLORS.gold },
  { icon: "🏆", label: "Top 1%", desc: "50 exercices terminés", earned: false, color: COLORS.purple },
  { icon: "🎙️", label: "L'Orateur", desc: "Module oral complété", earned: false, color: COLORS.blue },
  { icon: "🛡️", label: "Inébranlable", desc: "Module objections complété", earned: false, color: COLORS.purple },
];

export default function ProfileScreen() {
  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Avatar + nom */}
      <div style={{ padding: "32px 20px 24px", textAlign: "center", borderBottom: `1px solid ${COLORS.cardBorder}` }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 99,
          background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.gold} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          fontWeight: 800,
          fontFamily: "'Sora', sans-serif",
          color: "#fff",
          margin: "0 auto 14px",
          boxShadow: `0 8px 32px ${COLORS.accent}44`,
        }}>
          H
        </div>
        <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
          Heikel
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
          Commercial terrain · Fibre optique
        </div>
        <div style={{ marginTop: 8, display: "inline-block", background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}44`, borderRadius: 99, padding: "4px 14px" }}>
          <span style={{ color: COLORS.accent, fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
            🎯 Niveau Challenger
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
          Statistiques
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: `linear-gradient(135deg, ${s.color}14 0%, ${COLORS.card} 100%)`,
              border: `1.5px solid ${s.color}33`,
              borderRadius: 18,
              padding: "18px 16px",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                {s.value}
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
          Badges
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {BADGES.map(b => (
            <div key={b.label} style={{
              background: b.earned
                ? `linear-gradient(135deg, ${b.color}18 0%, ${COLORS.card} 100%)`
                : COLORS.card,
              border: `1.5px solid ${b.earned ? b.color + "44" : COLORS.cardBorder}`,
              borderRadius: 14,
              padding: "14px 10px",
              textAlign: "center",
              opacity: b.earned ? 1 : 0.45,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6, filter: b.earned ? "none" : "grayscale(1)" }}>
                {b.earned ? b.icon : "🔒"}
              </div>
              <div style={{ color: b.earned ? b.color : COLORS.textDim, fontSize: 10, fontWeight: 700, fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>
                {b.label}
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 10, fontFamily: "'Inter', sans-serif", marginTop: 3, lineHeight: 1.3 }}>
                {b.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
