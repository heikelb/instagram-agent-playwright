import { useState } from 'react';
import { COLORS } from '../constants/colors.js';
import { VOCAB_WORDS } from '../constants/vocabulary.js';
import Badge from '../components/Badge.jsx';

export default function VocabScreen({ setScreen }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState([]);
  const [review, setReview] = useState([]);

  const word = VOCAB_WORDS[index];
  const total = VOCAB_WORDS.length;

  const handleNext = (action) => {
    if (action === "mastered") setMastered(m => [...m, word.word]);
    else setReview(r => [...r, word.word]);
    if (index + 1 < total) {
      setIndex(i => i + 1);
      setFlipped(false);
    } else {
      setIndex(total); // done
    }
  };

  if (index >= total) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 20px", paddingBottom: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
        <div style={{ color: COLORS.text, fontSize: 24, fontWeight: 800, fontFamily: "'Sora', sans-serif", textAlign: "center", marginBottom: 8 }}>
          Session terminée !
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, fontFamily: "'Inter', sans-serif", textAlign: "center", marginBottom: 24 }}>
          {mastered.length} mot{mastered.length > 1 ? "s" : ""} acquis · {review.length} à revoir
        </div>
        <button
          onClick={() => { setIndex(0); setFlipped(false); setMastered([]); setReview([]); }}
          style={{ background: COLORS.gold, color: "#fff", border: "none", borderRadius: 99, padding: "14px 32px", fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: "pointer", boxShadow: `0 8px 24px ${COLORS.gold}44`, marginBottom: 12 }}
        >
          🔄 Recommencer
        </button>
        <button
          onClick={() => setScreen("home")}
          style={{ background: "none", border: `1.5px solid ${COLORS.cardBorder}`, borderRadius: 99, padding: "14px 32px", fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif", color: COLORS.textMuted, cursor: "pointer" }}
        >
          Retour accueil
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 20px", paddingBottom: 100 }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", padding: 0 }}>
          ←
        </button>
        <div style={{ flex: 1, height: 6, background: COLORS.cardBorder, borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${((index) / total) * 100}%`, background: COLORS.gold, borderRadius: 99, transition: "width 0.4s", boxShadow: `0 0 8px ${COLORS.gold}88` }} />
        </div>
        <span style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>{index + 1}/{total}</span>
      </div>

      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 20 }}>
        Mots Percutants
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          background: flipped
            ? `linear-gradient(135deg, ${COLORS.gold}18 0%, ${COLORS.card} 100%)`
            : COLORS.card,
          border: `1.5px solid ${flipped ? COLORS.gold + "55" : COLORS.cardBorder}`,
          borderRadius: 22,
          padding: "32px 24px",
          minHeight: 280,
          cursor: "pointer",
          transition: "background 0.3s, border-color 0.3s",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: 20,
          userSelect: "none",
        }}
      >
        {!flipped ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 12 }}>
              <Badge label={word.category} color={COLORS.gold} soft={COLORS.goldSoft} />
            </div>
            <div style={{ color: COLORS.text, fontSize: 34, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
              {word.word}
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
              Touche pour révéler
            </div>
          </div>
        ) : (
          <div>
            <div style={{ color: COLORS.gold, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>
              {word.word}
            </div>
            <div style={{ color: COLORS.text, fontSize: 15, fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 16 }}>
              {word.definition}
            </div>
            <div style={{ background: COLORS.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Exemple terrain
              </div>
              <div style={{ color: COLORS.text, fontSize: 13, fontFamily: "'Inter', sans-serif", fontStyle: "italic", lineHeight: 1.5 }}>
                {word.example}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ color: COLORS.gold, fontSize: 12, fontFamily: "'Inter', sans-serif', fontWeight: 600", fontWeight: 600 }}>
                {word.power}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons — only visible after flip */}
      {flipped && (
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => handleNext("review")}
            style={{
              flex: 1,
              background: COLORS.card,
              border: `1.5px solid ${COLORS.cardBorder}`,
              borderRadius: 99,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: COLORS.textMuted,
              cursor: "pointer",
            }}
          >
            🔄 À revoir
          </button>
          <button
            onClick={() => handleNext("mastered")}
            style={{
              flex: 1,
              background: COLORS.green,
              border: "none",
              borderRadius: 99,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 8px 24px ${COLORS.green}44`,
            }}
          >
            ✓ Acquis →
          </button>
        </div>
      )}
    </div>
  );
}
