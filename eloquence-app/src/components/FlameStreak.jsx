import { COLORS } from '../constants/colors.js';

export default function FlameStreak({ count }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Sora', sans-serif" }}>
      <span style={{ fontSize: 18 }}>🔥</span>
      <span style={{ color: COLORS.gold, fontWeight: 800, fontSize: 16 }}>{count}</span>
    </span>
  );
}
