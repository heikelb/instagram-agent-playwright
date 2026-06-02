/**
 * HomeScreen.jsx — Éloquence v2.1
 * Bible PAP intégrée — navigation vers les 6 méthodes
 */

import { useState } from "react";
import { COLORS } from "../constants/colors";
import { getLevelForXP, PILLARS } from "../data/salesCurriculum";

const MODULES = [
  {
    id: "deballe",
    icon: "🚪",
    title: "01 — Déballe Définitive",
    subtitle: "Le script PAP validé · Les 4 déclencheurs",
    color: "#FF5C35",
    soft: "rgba(255,92,53,0.12)",
    xp: 50,
    lessons: 4,
    badge: "⭐ Priorité 1",
    badgeColor: "#FF5C35",
  },
  {
    id: "hypnotic",
    icon: "🧠",
    title: "02 — H.Y.P.N.O.T.I.C.",
    subtitle: "8 étapes · Ce n'est plus toi qui vends",
    color: "#A855F7",
    soft: "rgba(168,85,247,0.12)",
    xp: 80,
    lessons: 8,
    badge: "⭐⭐ Priorité 2",
    badgeColor: "#A855F7",
  },
  {
    id: "cdd",
    icon: "🛡️",
    title: "03 — Méthode C.D.D.",
    subtitle: "Clarifier · Discuter · Dissiper — objections",
    color: "#FFB800",
    soft: "rgba(255,184,0,0.12)",
    xp: 70,
    lessons: 5,
    badge: "⭐⭐ Priorité 2",
    badgeColor: "#FFB800",
  },
  {
    id: "intonations",
    icon: "🎙️",
    title: "04 — Les 4 Intonations",
    subtitle: "Secrète · Taquine · Compassion · Confuse",
    color: "#EC4899",
    soft: "rgba(236,72,153,0.12)",
    xp: 50,
    lessons: 5,
    badge: "⭐ Priorité 1",
    badgeColor: "#EC4899",
  },
  {
    id: "mots",
    icon: "🚫",
    title: "05 — Mots Interdits",
    subtitle: "7 expressions qui sabotent tes ventes",
    color: "#EF4444",
    soft: "rgba(239,68,68,0.12)",
    xp: 30,
    lessons: 1,
    badge: "⭐ Priorité 1",
    badgeColor: "#EF4444",
  },
  {
    id: "mental",
    icon: "🧘",
    title: "06 — État Mental T.R.U.S.T.",
    subtitle: "Protocole série noire · Mantra terrain",
    color: "#22C55E",
    soft: "rgba(34,197,94,0.12)",
    xp: 40,
    lessons: 3,
    badge: "⭐ Priorité 1",
    badgeColor: "#22C55E",
  },
];

// Conseil du jour — rotatif selon le jour de la semaine
const DAILY_TIPS = [
  { tip: "\"Je ne dérange pas. J'apporte une information que cette personne n'a pas et dont elle a besoin.\"", source: "Mantra Terrain — avant chaque porte" },
  { tip: "\"Seriez-vous contre l'idée que je vous explique exactement comment ça fonctionnerait pour vous ?\"", source: "Étape C — H.Y.P.N.O.T.I.C." },
  { tip: "Ne réponds jamais directement à une objection. Creuse derrière. La vraie objection est toujours différente.", source: "Principe CDD" },
  { tip: "Silence après ta question = projecteur. Silence après sa réponse = il va aller plus loin. Ne comble pas.", source: "Règles des Silences" },
  { tip: "\"Pas intéressé par quoi exactement ?\" — puis silence complet jusqu'à sa réponse.", source: "CDD — Clarifier" },
  { tip: "Baisser la voix force le prospect à se rapprocher. Physiquement plus proche = psychologiquement plus engagé.", source: "Intonation Secrète" },
  { tip: "Persuader ≠ Convaincre. Convaincre c'est t'imposer. Persuader c'est l'aider à se rassurer lui-même.", source: "Principe Fondamental CDD" },
];

export default function HomeScreen({ xpTotal = 0, onNavigate }) {
  const [hovered, setHovered] = useState(null);
  const C = COLORS;
  const level = getLevelForXP(xpTotal);
  const xpProgress = level.maxXP === Infinity
    ? 100
    : Math.round(((xpTotal - level.minXP) / (level.maxXP - level.minXP)) * 100);

  const today = new Date().getDay(); // 0-6
  const dailyTip = DAILY_TIPS[today % DAILY_TIPS.length];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "16px 16px 12px", background: C.card, borderBottom: `1px solid ${C.cardBorder}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Éloquence</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Bible PAP Orange · Coach IA</div>
          </div>
          <div
            onClick={() => onNavigate("profile")}
            style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${level.color},#16161A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", border: `1px solid ${level.color}44` }}
          >
            {level.icon}
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "2px 10px", borderRadius: 99, background: level.color + "20", border: `1px solid ${level.color}44`, fontSize: 10, fontWeight: 800, color: level.color, whiteSpace: "nowrap" }}>
            {level.icon} {level.name}
          </div>
          <div style={{ flex: 1, height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${xpProgress}%`, background: `linear-gradient(90deg,#FF5C35,#A855F7)`, borderRadius: 3, transition: "width .5s" }} />
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, whiteSpace: "nowrap" }}>{xpTotal} XP</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Conseil du Jour */}
        <div style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.1),rgba(255,92,53,0.06))", border: "1.5px solid rgba(168,85,247,0.2)", borderRadius: 16, padding: "13px 15px" }}>
          <div style={{ fontSize: 9, color: "#A855F7", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>💡 Mantra du jour</div>
          <div style={{ fontSize: 13, fontStyle: "italic", lineHeight: 1.65, marginBottom: 6, color: C.text }}>"{dailyTip.tip}"</div>
          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700 }}>— {dailyTip.source}</div>
        </div>

        {/* ─── HERO 0 : Mode Immersif (NOUVEAU) ─── */}
        <div
          onClick={() => onNavigate("roleplay-game")}
          onMouseEnter={() => setHovered("game")}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: "linear-gradient(135deg,#0F0F13,#1a102e,#0F0F13)",
            border: `2px solid ${hovered === "game" ? "rgba(255,184,0,0.7)" : "rgba(255,184,0,0.35)"}`,
            borderRadius: 20, padding: "18px 18px 16px", cursor: "pointer",
            transform: hovered === "game" ? "translateY(-3px)" : "none",
            transition: "all .2s",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,184,0,0.12),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 36 }}>🚪</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#FFB800", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>🎮 NOUVEAU — Mode Immersif Terrain</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "white" }}>Simulation PAP Interactive</div>
            </div>
            <div style={{ padding: "4px 10px", borderRadius: 99, background: "rgba(255,184,0,0.15)", border: "1px solid rgba(255,184,0,0.4)", fontSize: 10, fontWeight: 800, color: "#FFB800" }}>NEW</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 14 }}>
            Tu arrives devant une porte → tu toques → un prospect ouvre → tu valides chaque étape de ton script en temps réel
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["👵","👨‍💼","😤","👩","👨"].map((e, i) => <span key={i} style={{ fontSize: 18 }}>{e}</span>)}
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>5 personnages</span>
            </div>
            <button style={{ padding: "10px 20px", borderRadius: 99, background: "linear-gradient(135deg,#FFB800,#FF8C00)", border: "none", color: "#0F0F13", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              Jouer →
            </button>
          </div>
        </div>

        {/* ─── HERO 1 : RP Vocal ─── */}
        <div
          onClick={() => onNavigate("roleplay-vocal")}
          onMouseEnter={() => setHovered("rp")}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: "linear-gradient(135deg, rgba(255,92,53,0.15), rgba(168,85,247,0.08), #16161A)",
            border: `1.5px solid ${hovered === "rp" ? "rgba(255,92,53,0.6)" : "rgba(255,92,53,0.3)"}`,
            borderRadius: 18, padding: 18, cursor: "pointer",
            transform: hovered === "rp" ? "translateY(-2px)" : "none",
            transition: "all .2s",
          }}
        >
          <div style={{ fontSize: 10, color: "#FF5C35", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            🎙️ Entraînement Vocal · IA + ElevenLabs
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 5 }}>RP Vocal — 6 Scénarios Terrain</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
            Tu parles · Le prospect IA répond en voix humaine · Le coach évalue <strong>ta méthode exacte</strong> (Déballe, HYPNOTIC, CDD...)
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Déballe", "HYPNOTIC", "CDD", "Intonations"].map(tag => (
                <span key={tag} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: "rgba(255,92,53,0.12)", border: "1px solid rgba(255,92,53,0.3)", color: "#FF5C35", fontWeight: 700 }}>{tag}</span>
              ))}
            </div>
            <button style={{ padding: "9px 18px", borderRadius: 99, background: "linear-gradient(135deg,#FF5C35,#A855F7)", border: "none", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              Simuler →
            </button>
          </div>
        </div>

        {/* ─── HERO 2 : Carte des Méthodes ─── */}
        <div
          onClick={() => onNavigate("skills-path")}
          onMouseEnter={() => setHovered("skills")}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(59,130,246,0.06), #16161A)",
            border: `1.5px solid ${hovered === "skills" ? "rgba(34,197,94,0.5)" : "rgba(34,197,94,0.2)"}`,
            borderRadius: 18, padding: 18, cursor: "pointer",
            transform: hovered === "skills" ? "translateY(-2px)" : "none",
            transition: "all .2s",
          }}
        >
          <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            🗺️ Bible Complète · 6 Méthodes
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 5 }}>Carte des Sous-compétences</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
            Quiz + formules + exemples terrain + erreurs à éviter — chemin vers l'inconscient compétent
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PILLARS.map(p => (
              <div key={p.id} title={p.title} style={{ width: 32, height: 32, borderRadius: 9, background: p.soft, border: `1px solid ${p.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                {p.icon}
              </div>
            ))}
          </div>
        </div>

        {/* ─── MODULES ─── */}
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>
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
            <div style={{ width: 46, height: 46, borderRadius: 13, background: m.soft, border: `1px solid ${m.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {m.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>{m.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{m.subtitle}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: m.soft, color: m.color, fontWeight: 700, border: `1px solid ${m.color}33` }}>📚 {m.lessons} leçons</span>
                <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: "rgba(255,184,0,0.1)", color: "#FFB800", fontWeight: 700, border: "1px solid rgba(255,184,0,0.3)" }}>⚡ +{m.xp} XP</span>
                <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: m.badgeColor + "15", color: m.badgeColor, fontWeight: 700, border: `1px solid ${m.badgeColor}33` }}>{m.badge}</span>
              </div>
            </div>
            <div style={{ fontSize: 18, color: C.textMuted, flexShrink: 0 }}>›</div>
          </div>
        ))}

        {/* Livres recommandés */}
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: "13px 15px" }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📚 Livres Recommandés</div>
          {[
            { title: "Influence et Manipulation", author: "Cialdini", note: "18/20", tip: "Lire en PREMIER — le pourquoi du oui" },
            { title: "Et tes clients te diront oui", author: "Pélissier", note: "15/20", tip: "Déclencher l'envie sans forcer" },
            { title: "Vente : la méthode qui fait mouche", author: "Cabrera", note: "17/20", tip: "Le plus applicable au PAP" },
            { title: "Le Loup de Wall Street", author: "Belfort", note: "16/20", tip: "Tonalité et certitude vocale" },
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 3 ? 10 : 0, paddingBottom: i < 3 ? 10 : 0, borderBottom: i < 3 ? `1px solid ${C.cardBorder}` : "none" }}>
              <div style={{ padding: "2px 7px", borderRadius: 99, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.3)", fontSize: 10, fontWeight: 800, color: "#FFB800", whiteSpace: "nowrap" }}>{b.note}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{b.title} <span style={{ color: C.textMuted, fontWeight: 400 }}>— {b.author}</span></div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{b.tip}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 10 }} />
      </div>
    </div>
  );
}
