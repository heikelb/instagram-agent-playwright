export default function Badge({ label, color, soft }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 99,
      background: soft,
      border: `1px solid ${color}44`,
      color: color,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "'Inter', sans-serif",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    }}>
      {label}
    </span>
  );
}
