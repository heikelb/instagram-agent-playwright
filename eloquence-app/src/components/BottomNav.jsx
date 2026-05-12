import { COLORS } from '../constants/colors.js';

const TABS = [
  { id: "home", icon: "🏠", label: "Accueil" },
  { id: "vocab", icon: "⚡", label: "Vocab" },
  { id: "profile", icon: "👤", label: "Profil" },
];

export default function BottomNav({ tab, setTab, setScreen }) {
  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: COLORS.card,
      borderTop: `1px solid ${COLORS.cardBorder}`,
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0 20px",
      zIndex: 100,
    }}>
      {TABS.map(t => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setScreen(t.id === "home" ? "home" : t.id); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: active ? 1 : 0.4,
              color: active ? COLORS.accent : COLORS.text,
              transition: "opacity 0.2s",
              padding: "4px 16px",
            }}
          >
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
