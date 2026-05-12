import { useState } from 'react';
import { COLORS } from '../constants/colors.js';
import { EXERCISES } from '../constants/exercises.js';
import XPBar from '../components/XPBar.jsx';
import Badge from '../components/Badge.jsx';

const KEY_PRINCIPLES = {
  vocab: "Un vocabulaire riche est une arme silencieuse. Chaque mot choisi avec précision ajoute 10% de persuasion. Remplace les mots ternes par des mots qui bougent.",
  pitch: "Le pitch parfait ne vend pas un produit — il vend une transformation. Ton prospect achète l'image de lui-même après la décision.",
  oral: "Ta voix est ton outil le plus puissant. La vitesse dit la confiance. Le grave dit l'autorité. Le silence dit la force.",
  objections: "Une objection est une demande déguisée d'information. Celui qui accueille le 'non' avec calme est celui qui finit par entendre 'oui'.",
};

export default function ModuleScreen({ module, setScreen, setActiveExercise }) {
  const [hovered, setHovered] = useState(null);

  const exerciseForLesson = (lessonId) => {
    const map = { v1: "e2", v2: "e1", v3: "e4", p1: "e1", p2: "e2", p3: "e1", o1: "e3", o2: "e3", o3: "e4", obj1: "e1", obj2: "e2", obj3: "e1" };
    return EXERCISES.find(e => e.id === (map[lessonId] || "e1"));
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${module.color}22 0%, ${COLORS.bg} 100%)`,
        padding: "24px 20px 20px",
        borderBottom: `1px solid ${COLORS.cardBorder}`,
      }}>
        <button
          onClick={() => setScreen("home")}
          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Retour
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 40 }}>{module.icon}</span>
          <div>
            <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
              {module.title}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              {module.subtitle}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Badge label={`Niveau ${module.level}`} color={module.color} soft={module.colorSoft} />
          <Badge label={`${module.xp} / ${module.maxXp} XP`} color={module.color} soft={module.colorSoft} />
        </div>
        <div style={{ marginTop: 12 }}>
          <XPBar current={module.xp} max={module.maxXp} color={module.color} />
        </div>
      </div>

      {/* Leçons */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
          Leçons
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {module.lessons.map((lesson, i) => (
            <div
              key={lesson.id}
              style={{
                background: lesson.done
                  ? `linear-gradient(135deg, ${module.color}20 0%, ${COLORS.card} 100%)`
                  : COLORS.card,
                border: `1.5px solid ${lesson.done ? module.color + "55" : COLORS.cardBorder}`,
                borderRadius: 14,
                padding: "16px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "transform 0.2s",
                transform: hovered === lesson.id ? "translateY(-2px)" : "none",
                opacity: i > 0 && !module.lessons[i - 1].done && !lesson.done ? 0.5 : 1,
              }}
              onMouseEnter={() => setHovered(lesson.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                const ex = exerciseForLesson(lesson.id);
                setActiveExercise(ex);
                setScreen("exercise");
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                background: lesson.done ? module.color : COLORS.cardBorder,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}>
                {lesson.done ? "✓" : (i + 1)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: lesson.done ? module.color : COLORS.text, fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
                  {lesson.title}
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
                  {lesson.xp} XP
                </div>
              </div>
              <span style={{ color: COLORS.textDim, fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Principe clé */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{
          background: `linear-gradient(135deg, ${module.color}12 0%, ${COLORS.card} 100%)`,
          border: `1.5px solid ${module.color}33`,
          borderRadius: 18,
          padding: "18px 20px",
        }}>
          <div style={{ color: module.color, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            💡 Principe clé
          </div>
          <div style={{ color: COLORS.text, fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
            {KEY_PRINCIPLES[module.id]}
          </div>
        </div>
      </div>
    </div>
  );
}
