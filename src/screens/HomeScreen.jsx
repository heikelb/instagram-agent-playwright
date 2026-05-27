/**
 * HomeScreen.jsx — Éloquence v2.0
 * Hero cards + modules + navigation
 */

import { useState } from "react";
import { COLORS } from "../constants/colors";
import { getLevelForXP, PILLARS } from "../data/salesCurriculum";

// Modules de contenu (remplace par tes vrais modules)
const MODULES = [
  {
    id: "accroche",
    icon: "⚡",
    title: "Accroche & 1ère Impression",
    subtitle: "Maîtriser les 30 premières secondes",
    color: "#FF5C35",
    soft: "rgba(255,92,53,0.12)",
    xp: 50,
    lessons: 4,
    linkedSkills: ["P1.1", "P1.2", "P1.3"],
  },
  {
    id: "decouverte",
    icon: "🔍",
    title: "Découverte & Écoute",
    subtitle: "SPIN Selling + Reformulation",
    color: "#3B82F6",
    soft: "rgba(59,130,246,0.12)",
    xp: 60,
    lessons: 5,
    linkedSkills: ["P2.1", "P2.2", "P2.3"],
  },
  {
    id: "pitch",
    icon: "🎯",
    title: "Pitch & Valeur",
    subtitle: "CAB + Preuves + ROI en 10s",
    color: "#22C55E",
    soft: "rgba(34,197,94,0.12)",
    xp: 55,
    lessons: 4,
    linkedSkills: ["P3.1", "P3.2", "P3.3"],
  },
  {
    id: "objections",
    icon: "🛡️",
    title: "Gestion des Objections",
    subtitle: "CRAC + Boomerang Prix + Désescalade",
    color: "#FFB800",
    soft: "rgba(255,184,0,0.12)",
    xp: 70,
    lessons: 6,
    linkedSkills: ["P4.1", "P4.2", "P4.3"],
  },
  {
    id: "closing",
    icon: "🏆",
    title: "Closing & Signature",
    subtitle: "Signaux d'achat + Close Assumptif",
    color: "#A855F7",
    soft: "rgba(168,85,247,0.12)",
    xp: 75,
    lessons: 5,
    linkedSkills: ["P5.1", "P5.2", "P5.3"],
  },
  {
    id: "vocal",
    icon: "🎙️",
    title: "Excellence Vocale",
    subtitle: "Rythme · Ton · Silence stratégique",
    color: "#EC4899",
    soft: "rgba(236,72,153,0.12)",
    xp: 40,
    lessons: 3,
    linkedSkills: ["P6.1", "P6.2", "P6.3"],
  },
];

export default function HomeScreen({ xpTotal = 0, onNavigate }) {
  const [hovered, setHovered] = useState(null);
  const C = COLORS;
  const level = getLevelForXP(xpTotal);
  const xpToNext = level.maxXP === Infinity ? xpTotal : level.maxXP;
  const xpProgress = level.maxXP === Infinity ? 100 : Math.round(((xpTotal - level.minXP) / (level.maxXP - level.minXP)) * 100);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "16px 16px 12px", background: C.card, borderBottom: `1px solid ${C.cardBorder}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Éloquence</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Vente PAP · Coach IA</div>
          </div>
          <div
            onClick={() => onNavigate("profile")}
            style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#FF5C35,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}
          >
            {level.icon}
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "2px 9px", borderRadius: 99, background: level.color + "20", border: `1px solid ${level.color}44`, fontSize: 10, fontWeight: 800, color: level.color }}>
            {level.icon} {level.name}
          </div>
          <div style={{ flex: 1, height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${xpProgress}%`, background: `linear-gradient(90deg,#FF5C35,#A855F7)`, borderRadius: 3, transition: "width .5s" }} />
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700 }}>{xpTotal} XP</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ─── HERO 1 : RP Vocal ElevenLabs ─── */}
        <div
          onClick={() => onNavigate("roleplay-vocal")}
          onMouseEnter={() => setHovered("rp")}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.08), #16161A)",
            border: `1.5px solid ${hovered === "rp" ? "rgba(168,85,247,0.6)" : "rgba(168,85,247,0.35)"}`,
            borderRadius: 18, padding: 18, cursor: "pointer",
            transform: hovered === "rp" ? "translateY(-2px)" : "none",
            transition: "all .2s",
          }}
        >
          <div style={{ fontSize: 10, color: "#A855F7", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            🎙️ IA Vocale · ElevenLabs
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 5 }}>RP Vocal — 6 Scénarios</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
            Tu parles · Le prospect répond avec une vraie voix humaine · Le coach analyse ta technique <strong>précisément</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Accroche", "CRAC", "Hostile", "Cold Call"].map(tag => (
                <span key={tag} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", color: "#A855F7", fontWeight: 700 }}>{tag}</span>
              ))}
            </div>
            <button style={{ padding: "9px 18px", borderRadius: 99, background: "linear-gradient(135deg,#A855F7,#8B5CF6)", border: "none", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              Simuler →
            </button>
          </div>
        </div>

        {/* ─── HERO 2 : Carte des Compétences ─── */}
        <div
          onClick={() => onNavigate("skills-path")}
          onMouseEnter={() => setHovered("skills")}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: "linear-gradient(135deg, rgba(255,92,53,0.12), rgba(255,184,0,0.06), #16161A)",
            border: `1.5px solid ${hovered === "skills" ? "rgba(255,92,53,0.5)" : "rgba(255,92,53,0.25)"}`,
            borderRadius: 18, padding: 18, cursor: "pointer",
            transform: hovered === "skills" ? "translateY(-2px)" : "none",
            transition: "all .2s",
          }}
        >
          <div style={{ fontSize: 10, color: "#FF5C35", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            🗺️ Curriculum Complet
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 5 }}>Carte des Sous-compétences</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
            6 piliers · {PILLARS.reduce((s, p) => s + p.skills.length, 0)} techniques · Quiz + formules + exemples réels
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PILLARS.map(p => (
              <div key={p.id} title={p.title} style={{ width: 30, height: 30, borderRadius: 9, background: p.soft, border: `1px solid ${p.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {p.icon}
              </div>
            ))}
          </div>
        </div>

        {/* ─── MODULES ─── */}
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
          Modules de formation
        </div>

        {MODULES.map(m => (
          <div
            key={m.id}
            onClick={() => onNavigate("module", m)}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === m.id ? `linear-gradient(135deg,${m.soft},${C.card})` : C.card,
              border: `1.5px solid ${hovered === m.id ? m.color + "44" : m.color + "18"}`,
              borderRadius: 16, padding: "14px 16px", cursor: "pointer",
              transform: hovered === m.id ? "translateY(-1px)" : "none",
              transition: "all .2s",
              display: "flex", alignItems: "center", gap: 13,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: m.soft, border: `1px solid ${m.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>{m.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{m.subtitle}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: m.soft, color: m.color, fontWeight: 700, border: `1px solid ${m.color}33` }}>📚 {m.lessons} leçons</span>
                <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: "rgba(255,184,0,0.1)", color: "#FFB800", fontWeight: 700, border: "1px solid rgba(255,184,0,0.3)" }}>⚡ +{m.xp} XP</span>
              </div>
            </div>
            <div style={{ fontSize: 18, color: C.textMuted }}>›</div>
          </div>
        ))}

        <div style={{ height: 10 }} />
      </div>
    </div>
  );
}
