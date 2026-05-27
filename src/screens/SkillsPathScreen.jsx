/**
 * SkillsPathScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Carte des sous-compétences de vente PAP — parcours visuel avec exercices.
 * 6 Piliers × N compétences — quiz + exemples + formules par compétence.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { COLORS } from "../constants/colors";
import { PILLARS, getSkillById } from "../data/salesCurriculum";

export default function SkillsPathScreen({ onBack, skillScores = {}, onSkillScoreUpdate }) {
  const [activePillar, setActivePillar]     = useState(null);
  const [activeSkill, setActiveSkill]       = useState(null);
  const [quizState, setQuizState]           = useState(null); // { questionIdx, answered, selectedIdx }
  const [quizResults, setQuizResults]       = useState({});   // { skillId: { correct, total } }
  const C = COLORS;

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  const getSkillScore = (skillId) => skillScores[skillId] || 0;

  const getSkillMastery = (skillId) => {
    const score = getSkillScore(skillId);
    if (score >= 80) return { label: "Maîtrisé", color: "#22C55E", icon: "⭐" };
    if (score >= 50) return { label: "En progrès", color: "#FFB800", icon: "📈" };
    if (score > 0)   return { label: "Débuté", color: "#3B82F6", icon: "🌱" };
    return { label: "Non commencé", color: C.textDim, icon: "○" };
  };

  const handleQuizAnswer = (skill, questionIdx, selectedIdx) => {
    const question = skill.quiz[questionIdx];
    const isCorrect = selectedIdx === question.correct;

    setQuizState(prev => ({ ...prev, answered: true, selectedIdx, isCorrect }));

    // Mettre à jour les résultats
    setQuizResults(prev => {
      const existing = prev[skill.id] || { correct: 0, total: 0 };
      return {
        ...prev,
        [skill.id]: {
          correct: existing.correct + (isCorrect ? 1 : 0),
          total:   existing.total + 1,
        },
      };
    });

    // Callback pour mettre à jour le score global
    if (onSkillScoreUpdate) {
      const existing = quizResults[skill.id] || { correct: 0, total: 0 };
      const newCorrect = existing.correct + (isCorrect ? 1 : 0);
      const newTotal   = existing.total + 1;
      onSkillScoreUpdate(skill.id, Math.round((newCorrect / newTotal) * 100));
    }
  };

  const nextQuestion = (skill) => {
    const nextIdx = (quizState?.questionIdx || 0) + 1;
    if (nextIdx < skill.quiz.length) {
      setQuizState({ questionIdx: nextIdx, answered: false, selectedIdx: null });
    } else {
      setQuizState({ ...quizState, finished: true });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — LISTE PILIERS
  // ─────────────────────────────────────────────────────────────────────────────
  if (!activePillar) return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.cardBorder}`, background: C.card, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>←</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>🗺️ Compétences Vente</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>6 piliers · {PILLARS.reduce((s, p) => s + p.skills.length, 0)} sous-compétences</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Intro */}
        <div style={{ background: "linear-gradient(135deg,rgba(255,92,53,0.1),rgba(168,85,247,0.06))", border: "1.5px solid rgba(255,92,53,0.2)", borderRadius: 16, padding: "13px 15px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🚀 Pourquoi ces compétences ?</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
            Ces 6 piliers sont les fondations des meilleurs vendeurs PAP. Maîtrise 1 pilier par semaine → en 6 semaines tu es dans le top 5% des commerciaux de ton secteur.
          </div>
        </div>

        {/* Piliers */}
        {PILLARS.map(pillar => {
          const masteredCount = pillar.skills.filter(sk => getSkillScore(sk.id) >= 80).length;
          const startedCount  = pillar.skills.filter(sk => getSkillScore(sk.id) > 0).length;
          const progress      = Math.round((masteredCount / pillar.skills.length) * 100);

          return (
            <div
              key={pillar.id}
              onClick={() => setActivePillar(pillar)}
              style={{
                background: C.card,
                border: `1.5px solid ${pillar.color}22`,
                borderRadius: 18, padding: 16, cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {/* Ligne titre */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: pillar.soft, border: `1px solid ${pillar.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {pillar.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{pillar.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{pillar.subtitle}</div>
                </div>
                <div style={{ fontSize: 22, color: C.textMuted }}>›</div>
              </div>

              {/* Progression */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{masteredCount}/{pillar.skills.length} maîtrisées</span>
                  <span style={{ fontSize: 10, color: pillar.color, fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${pillar.color},${pillar.color}cc)`, borderRadius: 3, transition: "width .5s" }} />
                </div>
              </div>

              {/* Skills preview */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {pillar.skills.map(skill => {
                  const mastery = getSkillMastery(skill.id);
                  return (
                    <div key={skill.id} style={{
                      padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600,
                      background: mastery.color + "15",
                      border: `1px solid ${mastery.color}44`,
                      color: mastery.color,
                    }}>
                      {mastery.icon} {skill.name}
                    </div>
                  );
                })}
              </div>

              {/* Badge niveau */}
              <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700, background: pillar.soft, color: pillar.color, border: `1px solid ${pillar.color}33` }}>
                  Niveau {pillar.level} {pillar.level === 1 ? "— Fondamental" : pillar.level === 2 ? "— Intermédiaire" : "— Expert"}
                </span>
                {startedCount > 0 && (
                  <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700, background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
                    {startedCount} démarrées
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — LISTE SKILLS DU PILIER
  // ─────────────────────────────────────────────────────────────────────────────
  if (activePillar && !activeSkill) return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.cardBorder}`, background: C.card, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setActivePillar(null)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ fontSize: 22 }}>{activePillar.icon}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{activePillar.title}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{activePillar.subtitle}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>

        {activePillar.skills.map((skill, idx) => {
          const mastery = getSkillMastery(skill.id);
          const qr      = quizResults[skill.id];

          return (
            <div
              key={skill.id}
              onClick={() => { setActiveSkill(skill); setQuizState(null); }}
              style={{
                background: C.card,
                border: `1.5px solid ${mastery.color}33`,
                borderRadius: 18, padding: 16, cursor: "pointer",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${activePillar.soft},transparent 70%)`, pointerEvents: "none" }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                {/* Numéro */}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: activePillar.soft, border: `1px solid ${activePillar.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: activePillar.color, flexShrink: 0 }}>
                  {skill.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{skill.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{skill.description}</div>
                </div>
                <div style={{ fontSize: 20 }}>{mastery.icon}</div>
              </div>

              {/* Importance + durée maîtrise */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} style={{ width: 12, height: 4, borderRadius: 2, background: i < skill.importance ? activePillar.color : C.textDim }} />
                  ))}
                  <span style={{ fontSize: 9, color: C.textMuted, marginLeft: 4 }}>Impact</span>
                </div>
              </div>

              {/* Badge maîtrise */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ padding: "2px 10px", borderRadius: 99, fontSize: 9, fontWeight: 700, background: mastery.color + "15", border: `1px solid ${mastery.color}33`, color: mastery.color }}>
                  {mastery.label}
                </div>
                {qr && (
                  <div style={{ fontSize: 10, color: C.textMuted }}>
                    Quiz : {qr.correct}/{qr.total} correct{qr.correct > 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ fontSize: 10, color: C.textMuted }}>⏱ {skill.timeToMaster}</div>
              </div>
            </div>
          );
        })}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — DÉTAIL COMPÉTENCE
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeSkill) {
    const pillar  = activePillar;
    const skill   = activeSkill;
    const qr      = quizResults[skill.id];
    const qs      = quizState;
    const currentQ = qs ? skill.quiz?.[qs.questionIdx] : null;

    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.cardBorder}`, background: C.card, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setActiveSkill(null)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>←</button>
          <div style={{ fontSize: 10, padding: "2px 10px", borderRadius: 99, background: pillar.soft, border: `1px solid ${pillar.color}33`, color: pillar.color, fontWeight: 800 }}>{skill.id}</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{skill.name}</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 13 }}>

          {/* Description + formule */}
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 15 }}>
            <div style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>{skill.description}</div>
            {skill.formula && (
              <div style={{ padding: "10px 13px", background: pillar.soft, borderRadius: 10, border: `1px solid ${pillar.color}33` }}>
                <div style={{ fontSize: 9, color: pillar.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🔑 Formule clé</div>
                <div style={{ fontSize: 12, fontWeight: 700, fontStyle: "italic", lineHeight: 1.6 }}>{skill.formula}</div>
              </div>
            )}
          </div>

          {/* Erreur classique */}
          {skill.commonMistake && (
            <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>⚠️ Erreur typique</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{skill.commonMistake}</div>
            </div>
          )}

          {/* Exemples */}
          {skill.examples && skill.examples.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>✅ Phrases qui marchent</div>
              {skill.examples.map((ex, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: i < skill.examples.length - 1 ? 10 : 0 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", flexShrink: 0, marginTop: 6 }} />
                  <div style={{ fontSize: 12, fontStyle: "italic", lineHeight: 1.6, color: C.text }}>"{ex}"</div>
                </div>
              ))}
            </div>
          )}

          {/* Anti-exemples */}
          {skill.antiExamples && skill.antiExamples.length > 0 && (
            <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🚫 À ne jamais dire</div>
              {skill.antiExamples.map((ex, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: i < skill.antiExamples.length - 1 ? 8 : 0 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#EF4444", flexShrink: 0, marginTop: 6 }} />
                  <div style={{ fontSize: 12, fontStyle: "italic", lineHeight: 1.6, color: C.textMuted }}>"{ex}"</div>
                </div>
              ))}
            </div>
          )}

          {/* Tip spécial */}
          {skill.tip && (
            <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "#FFB800", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>💡 Conseil pro</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{skill.tip}</div>
            </div>
          )}

          {/* Signaux spéciaux (P5.1) */}
          {skill.signals && (
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#A855F7", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🔔 Signaux à détecter</div>
              {skill.signals.map((sig, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#A855F7", flexShrink: 0 }} />
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>{sig}</div>
                </div>
              ))}
            </div>
          )}

          {/* QUIZ */}
          {skill.quiz && skill.quiz.length > 0 && (
            <div style={{ background: C.card, border: `1.5px solid ${pillar.color}33`, borderRadius: 18, padding: 16 }}>
              <div style={{ fontSize: 10, color: pillar.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>🧠 Quiz — Teste ta compréhension</div>

              {!qs && (
                <>
                  {qr && (
                    <div style={{ padding: "8px 12px", background: qr.correct === qr.total ? "rgba(34,197,94,0.1)" : "rgba(255,184,0,0.1)", borderRadius: 10, border: `1px solid ${qr.correct === qr.total ? "rgba(34,197,94,0.3)" : "rgba(255,184,0,0.3)"}`, marginBottom: 12, fontSize: 12, color: qr.correct === qr.total ? "#22C55E" : "#FFB800", fontWeight: 700 }}>
                      {qr.correct === qr.total ? "✅" : "📈"} Résultat précédent : {qr.correct}/{qr.total} correct{qr.correct > 1 ? "s" : ""}
                    </div>
                  )}
                  <button
                    onClick={() => setQuizState({ questionIdx: 0, answered: false, selectedIdx: null })}
                    style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${pillar.color},${pillar.color}cc)`, color: "white", fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                  >
                    {qr ? "🔄 Refaire le quiz" : "🚀 Commencer le quiz"}
                  </button>
                </>
              )}

              {qs && !qs.finished && currentQ && (
                <>
                  <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8 }}>Question {qs.questionIdx + 1}/{skill.quiz.length}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6, marginBottom: 14 }}>{currentQ.question}</div>

                  {currentQ.options.map((opt, i) => {
                    let bg    = C.bg;
                    let border = `1px solid ${C.cardBorder}`;
                    let color  = C.text;
                    if (qs.answered) {
                      if (i === currentQ.correct)      { bg = "rgba(34,197,94,0.12)"; border = "1px solid rgba(34,197,94,0.4)"; color = "#22C55E"; }
                      else if (i === qs.selectedIdx)   { bg = "rgba(239,68,68,0.1)";  border = "1px solid rgba(239,68,68,0.4)"; color = "#EF4444"; }
                    }
                    return (
                      <div
                        key={i}
                        onClick={() => !qs.answered && handleQuizAnswer(skill, qs.questionIdx, i)}
                        style={{ padding: "10px 13px", borderRadius: 10, marginBottom: 8, cursor: qs.answered ? "default" : "pointer", background: bg, border, color, fontSize: 12, lineHeight: 1.5, transition: "all .2s" }}
                      >
                        {qs.answered && i === currentQ.correct && "✅ "}
                        {qs.answered && i === qs.selectedIdx && i !== currentQ.correct && "❌ "}
                        {opt}
                      </div>
                    );
                  })}

                  {qs.answered && (
                    <>
                      <div style={{ padding: "10px 13px", background: "rgba(59,130,246,0.08)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.2)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "#3B82F6", fontWeight: 800, marginBottom: 4 }}>💡 Explication</div>
                        <div style={{ fontSize: 12, lineHeight: 1.6 }}>{currentQ.explanation}</div>
                      </div>
                      <button
                        onClick={() => nextQuestion(skill)}
                        style={{ width: "100%", padding: 12, borderRadius: 11, border: "none", background: `linear-gradient(135deg,${pillar.color},${pillar.color}cc)`, color: "white", fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                      >
                        {qs.questionIdx + 1 < skill.quiz.length ? "Question suivante →" : "Voir le résultat →"}
                      </button>
                    </>
                  )}
                </>
              )}

              {qs?.finished && qr && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{qr.correct === qr.total ? "🏆" : qr.correct > 0 ? "💪" : "📚"}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: qr.correct === qr.total ? "#22C55E" : "#FFB800", marginBottom: 6 }}>
                    {qr.correct}/{qr.total}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
                    {qr.correct === qr.total ? "Parfait ! Compétence validée 🌟" : "Bon effort — relis les exemples et retente."}
                  </div>
                  <button
                    onClick={() => setQuizState(null)}
                    style={{ padding: "10px 24px", borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: C.bg, color: C.textMuted, fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Retour
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ height: 8 }} />
        </div>
      </div>
    );
  }

  return null;
}
