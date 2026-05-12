export default function XPBar({ current, max, color }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: color,
        borderRadius: 99,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 8px ${color}88`,
      }} />
    </div>
  );
}
