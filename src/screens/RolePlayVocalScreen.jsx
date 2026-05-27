/**
 * RolePlayVocalScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * RP Vocal ElevenLabs — Version 2.0
 * Chaque scénario entraîne des compétences DIFFÉRENTES avec un coaching CALIBRÉ.
 *
 * Architecture :
 *   select → brief → vocal → debrief
 *
 * Compétences entraînées par scénario :
 *   Fibre       → P1.3 Question-crochet + P2.1 SPIN + P2.2 Reformulation
 *   Énergie     → P3.2 Chiffres concrets + P3.3 ROI + P4.1 CRAC
 *   Hostile     → P4.3 Désescalade + P2.2 Écoute + P6.2 Silence
 *   Prix        → P4.1 CRAC + P4.2 Boomerang Prix + P3.3 ROI
 *   Cold Call   → P1.1 Impact + P3.1 CAB + P5.1 Signaux
 *   Champion    → P6.2 Miroir + P2.3 Silence + P5.2 Close adaptatif
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { RP_SCENARIOS, getSkillById } from "../data/salesCurriculum";

// ─── CLÉS API ────────────────────────────────────────────────────────────────
const ELEVENLABS_API_KEY = "sk_a2ec02a4131798d58b43e0418222189295076526697a5728";
const ANTHROPIC_API_KEY  = "-----REMPLACE-PAR-TA-CLÉ-ANTHROPIC-----";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const EL_MODEL    = "eleven_flash_v2_5";
const MAX_EXCHANGES = 6;
const CLAUDE_MODEL  = "claude-sonnet-4-20250514";

// ─── DÉBRIEF SYSTEM (générique — le détail est dans coachSystem de chaque scénario) ──
const DEBRIEF_SYSTEM = `Tu es un coach expert vente PAP. Analyse la session vocale complète.
Prends en compte les compétences cibles du scénario.
Retourne UNIQUEMENT ce JSON :
{
  "score_global": <1-10>,
  "titre": "<4 mots max>",
  "verdict": "<1 phrase impactante>",
  "top_3": ["<force 1>","<force 2>","<force 3>"],
  "axe_critique": "<1 priorité concrète>",
  "script_ideal": "<2-3 phrases exactes à dire dans ce scénario>",
  "xp": <nombre entre xpMin et xpMax selon performance>,
  "conseil_vocal": "<conseil précis sur voix/rythme/ton>",
  "skill_progress": "<compétence la plus travaillée + niveau actuel>"
}`;

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function RolePlayVocalScreen({ onBack, onXPGain }) {
  const [phase, setPhase]                     = useState("select"); // select|brief|vocal|debrief
  const [scenario, setScenario]               = useState(null);
  const [isRecording, setIsRecording]         = useState(false);
  const [isProspectSpeaking, setIsProspectSpeaking] = useState(false);
  const [history, setHistory]                 = useState([]);
  const [transcript, setTranscript]           = useState("");
  const [micStatus, setMicStatus]             = useState("Prêt — appuie pour parler");
  const [coachData, setCoachData]             = useState(null);
  const [showCoach, setShowCoach]             = useState(false);
  const [debrief, setDebrief]                 = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [hovered, setHovered]                 = useState(null);
  const [exchangeCount, setExchangeCount]     = useState(0);
  const [showBrief, setShowBrief]             = useState(false);
  const [selectedForBrief, setSelectedForBrief] = useState(null);

  const recognitionRef    = useRef(null);
  const currentAudioRef   = useRef(null);
  const claudeHistRef     = useRef([]);
  const exchangesRef      = useRef([]);
  const coachOpenRef      = useRef(false);
  const exchCountRef      = useRef(0);
  const historyEndRef     = useRef(null);
  const transcriptRef     = useRef("");
  const C = COLORS;

  // ── AUTO-SCROLL ──────────────────────────────────────────────────────────────
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => () => stopAll(), []);

  // ── ELEVENLABS TTS ──────────────────────────────────────────────────────────
  const speakElevenLabs = (text, voiceId, voiceSettings) =>
    new Promise(async (resolve) => {
      setIsProspectSpeaking(true);
      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "xi-api-key":    ELEVENLABS_API_KEY,
              "Content-Type":  "application/json",
              "Accept":        "audio/mpeg",
            },
            body: JSON.stringify({
              text,
              model_id:       EL_MODEL,
              language_code:  "fr",
              voice_settings: voiceSettings,
            }),
          }
        );
        if (!res.ok) throw new Error("EL " + res.status);
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(url); setIsProspectSpeaking(false); resolve(); };
        audio.onerror = () => { setIsProspectSpeaking(false); resolve(); };
        audio.play();
      } catch {
        // Fallback voix navigateur
        const u  = new SpeechSynthesisUtterance(text);
        u.lang   = "fr-FR";
        u.rate   = 0.93;
        const fr = speechSynthesis.getVoices().find(v => v.lang.startsWith("fr"));
        if (fr) u.voice = fr;
        u.onend  = () => { setIsProspectSpeaking(false); resolve(); };
        speechSynthesis.speak(u);
      }
    });

  // ── API ANTHROPIC ───────────────────────────────────────────────────────────
  const callClaude = async ({ system, messages, maxTokens = 150 }) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":   "application/json",
        "x-api-key":      ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });
    if (!res.ok) throw new Error("Claude " + res.status);
    return (await res.json()).content?.[0]?.text || "";
  };

  const parseJSON = (text, fallback) => {
    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return fallback;
    }
  };

  // ── DÉMARRER ─────────────────────────────────────────────────────────────────
  const openBrief = (sc) => {
    setSelectedForBrief(sc);
    setShowBrief(true);
  };

  const startVocal = async (sc) => {
    setShowBrief(false);
    setScenario(sc);
    claudeHistRef.current   = [];
    exchangesRef.current    = [];
    exchCountRef.current    = 0;
    transcriptRef.current   = "";
    setExchangeCount(0);
    setHistory([]);
    setShowCoach(false);
    setDebrief(null);
    setPhase("vocal");
    setMicStatus("⏳ Le prospect arrive...");

    // Bulle de contexte coaching
    const primarySkillData = getSkillById(sc.primarySkill);
    addBubble("coach",
      `🎯 <strong>Compétence entraînée :</strong> ${sc.skillFocus}<br>` +
      `📌 <strong>Objectif :</strong> ${sc.objective}<br>` +
      `💡 <strong>Astuce :</strong> <em>${sc.tip}</em>`
    );

    // Message d'ouverture du prospect
    const openingIdx = Math.floor(Math.random() * sc.openingMessages.length);
    const opening    = sc.openingMessages[openingIdx];

    // Si fallback (pas de vraie IA) : utiliser l'ouverture directement
    let prospectOpening = opening;
    try {
      prospectOpening = await callClaude({
        system:    sc.prospectSystem,
        messages:  [{ role: "user", content: "(Le vendeur arrive à la porte ou appelle. Ouvre avec ta phrase d'ouverture naturelle pour ce scénario.)" }],
        maxTokens: 80,
      });
    } catch {
      // fallback = ouverture définie dans le scénario
    }

    claudeHistRef.current.push({ role: "assistant", content: prospectOpening });
    addBubble("prospect", prospectOpening);
    await speakElevenLabs(prospectOpening, sc.voiceId, sc.voiceSettings);
    setMicStatus("🎙️ À toi — appuie sur le micro");
  };

  // ── MICRO ────────────────────────────────────────────────────────────────────
  const handleMic = () => {
    if (isRecording) recognitionRef.current?.stop();
    else if (!isProspectSpeaking && !loading) startRecording();
  };

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Ouvre dans Chrome (Android ou desktop) pour la reconnaissance vocale.");
      return;
    }
    const r = new SR();
    r.lang            = "fr-FR";
    r.continuous      = false;
    r.interimResults  = true;

    r.onstart = () => {
      setIsRecording(true);
      setMicStatus("🔴 Parle maintenant...");
      transcriptRef.current = "";
      setTranscript("");
    };
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      transcriptRef.current = t;
      setTranscript(t);
    };
    r.onend  = async () => {
      setIsRecording(false);
      const text = transcriptRef.current.trim();
      if (text.length > 2) await processUserSpeech(text);
      else setMicStatus("Rien capté — réessaie 🎙️");
    };
    r.onerror = () => { setIsRecording(false); setMicStatus("Erreur micro — réessaie"); };

    recognitionRef.current = r;
    r.start();
  };

  // ── TRAITEMENT ÉCHANGE ───────────────────────────────────────────────────────
  const processUserSpeech = async (text) => {
    exchCountRef.current++;
    setExchangeCount(exchCountRef.current);

    addBubble("user", text);
    claudeHistRef.current.push({ role: "user", content: text });
    exchangesRef.current.push({ role: "user", text, score: 0 });

    const isLast = exchCountRef.current >= MAX_EXCHANGES;
    setMicStatus("⏳ Analyse...");
    setLoading(true);

    // Appels en parallèle : réponse prospect + coaching live
    const [prospectReply, coachRaw] = await Promise.all([
      isLast
        ? Promise.resolve(null)
        : callClaude({
            system:   scenario.prospectSystem,
            messages: [...claudeHistRef.current],
            maxTokens: 80,
          }).catch(() => "(Le prospect réfléchit...)"),

      callClaude({
        system:   scenario.coachSystem,
        messages: [{
          role:    "user",
          content: buildCoachContext(text),
        }],
        maxTokens: 250,
      }).catch(() => null),
    ]);

    setLoading(false);

    // Afficher coaching live
    if (coachRaw) {
      const coach = parseJSON(coachRaw, defaultCoach());
      exchangesRef.current[exchangesRef.current.length - 1].score = coach.score;
      setCoachData(coach);
      setShowCoach(true);
      coachOpenRef.current = true;
      // Attendre que l'utilisateur dismiss le coach
      await new Promise(res => {
        const t = setInterval(() => {
          if (!coachOpenRef.current) { clearInterval(t); res(); }
        }, 200);
      });
    }

    // Réponse du prospect
    if (!isLast && prospectReply) {
      claudeHistRef.current.push({ role: "assistant", content: prospectReply });
      addBubble("prospect", prospectReply);
      exchangesRef.current.push({ role: "prospect", text: prospectReply });
      setTranscript(prospectReply);
      await speakElevenLabs(prospectReply, scenario.voiceId, scenario.voiceSettings);
      transcriptRef.current = "";
      setTranscript("");
      setMicStatus("🎙️ À toi — appuie sur le micro");
    } else if (isLast) {
      await generateDebrief();
    }
  };

  const buildCoachContext = (lastUserText) => {
    const history = exchangesRef.current
      .map(e => `${e.role === "user" ? "VENDEUR" : "PROSPECT"}: ${e.text}`)
      .join("\n");
    return (
      `Scénario: ${scenario.title} (${scenario.tag})\n` +
      `Compétence cible: ${scenario.skillFocus}\n` +
      `Objectif: ${scenario.objective}\n` +
      `Historique:\n${history}\n` +
      `Dernière intervention VENDEUR: "${lastUserText}"`
    );
  };

  const defaultCoach = () => ({
    score: 5,
    skill_evalued: scenario?.skillFocus || "Technique",
    point_fort:    "Bon effort sur cette intervention",
    point_faible:  "À affiner sur la compétence cible",
    formule_optimale: scenario?.tip || "Continue à t'entraîner",
    emoji: "💪",
    tip_specifique: "Travaille la compétence principale de ce scénario",
  });

  // ── DÉBRIEF FINAL ────────────────────────────────────────────────────────────
  const generateDebrief = async () => {
    setPhase("debrief");
    setLoading(true);

    const ctx = exchangesRef.current
      .map(e => `${e.role === "user" ? "VENDEUR" : "PROSPECT"}: ${e.text}`)
      .join("\n");
    const avgScore = exchangesRef.current
      .filter(e => e.role === "user" && e.score > 0)
      .reduce((sum, e, _, arr) => sum + e.score / arr.length, 0);

    let db = null;
    try {
      const raw = await callClaude({
        system:   DEBRIEF_SYSTEM,
        messages: [{
          role:    "user",
          content: (
            `Scénario: ${scenario.title} (${scenario.tag})\n` +
            `Compétences entraînées: ${scenario.targetSkills.join(", ")}\n` +
            `Objectif: ${scenario.objective}\n` +
            `XP max possible: ${scenario.xpMax}\n` +
            `Score moyen coaching live: ${avgScore.toFixed(1)}/10\n` +
            `Échanges: ${exchCountRef.current}\n\n${ctx}`
          ),
        }],
        maxTokens: 600,
      });
      db = parseJSON(raw, null);
    } catch { /* fallback ci-dessous */ }

    if (!db) {
      db = {
        score_global:  Math.round(avgScore) || 6,
        titre:         "Bon travail",
        verdict:       "Continue à t'entraîner — chaque session compte.",
        top_3:         ["Présence", "Effort", "Persévérance"],
        axe_critique:  `Travailler la compétence : ${scenario.skillFocus}`,
        script_ideal:  scenario.tip,
        xp:            Math.round(scenario.xpMax * 0.6),
        conseil_vocal: "Ralentis — prends le temps de chaque mot. Le silence est ton ami.",
        skill_progress: `${scenario.skillFocus} — niveau intermédiaire`,
      };
    }

    setDebrief(db);
    if (onXPGain && db.xp) onXPGain(db.xp);
    setLoading(false);
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  const stopAll = () => {
    currentAudioRef.current?.pause();
    speechSynthesis.cancel();
    try { recognitionRef.current?.stop(); } catch (e) { /* ignore */ }
    setIsRecording(false);
    setIsProspectSpeaking(false);
  };

  const addBubble = (role, html) =>
    setHistory(prev => [...prev, { role, html }]);

  const dismissCoach = () => {
    setShowCoach(false);
    coachOpenRef.current = false;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — SELECT
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "select") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.cardBorder}`, background: C.card, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>←</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>🎙️ RP Vocal ElevenLabs</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>Chaque scénario = une compétence différente</div>
        </div>
        <div style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 99, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", fontSize: 10, color: "#22C55E", fontWeight: 700 }}>🟢 Live</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Banner pédagogique */}
        <div style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.1),rgba(59,130,246,0.06))", border: "1.5px solid rgba(168,85,247,0.25)", borderRadius: 16, padding: "13px 15px" }}>
          <div style={{ fontSize: 10, color: "#A855F7", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🧠 Comment progresser vite</div>
          {[
            "Chaque scénario entraîne UNE compétence précise",
            "Le coach IA évalue exactement cette compétence en live",
            "Répète le même scénario 3x — tu gagnes une vraie maîtrise",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12, marginBottom: i < 2 ? 7 : 0, lineHeight: 1.5 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              {t}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Choisir un scénario</div>

        {/* Cards scénarios */}
        {RP_SCENARIOS.map(s => (
          <div key={s.id}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === s.id ? `linear-gradient(135deg,${s.soft},${C.card})` : C.card,
              border: `1.5px solid ${hovered === s.id ? s.color + "55" : s.color + "22"}`,
              borderRadius: 18, padding: 16, cursor: "pointer",
              transform: hovered === s.id ? "translateY(-2px)" : "none",
              transition: "all .2s", position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${s.soft},transparent 70%)`, pointerEvents: "none" }} />

            {/* Ligne titre */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: s.soft, border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{s.title}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700, color: s.tagColor, background: s.tagSoft, border: `1px solid ${s.tagColor}44` }}>{s.tag}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{s.emoji} {s.subtitle}</div>
              </div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>+{s.xpMax} XP</div>
            </div>

            {/* Compétence entraînée */}
            <div style={{ padding: "6px 10px", background: s.soft, borderRadius: 8, border: `1px solid ${s.color}22`, marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: s.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: .8 }}>🎯 Compétence entraînée : </span>
              <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{s.skillFocus}</span>
            </div>

            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{s.context}</div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{ width: 14, height: 4, borderRadius: 2, background: j < s.difficulty ? s.color : C.textDim }} />
                ))}
                <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 4 }}>Difficulté</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); openBrief(s); }}
                  style={{ padding: "7px 13px", borderRadius: 99, border: `1px solid ${s.color}44`, background: "transparent", color: s.color, fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  Brief →
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); startVocal(s); }}
                  style={{ padding: "7px 14px", borderRadius: 99, background: `linear-gradient(135deg,${s.color},${s.color}cc)`, border: "none", color: "white", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}
                >
                  🎙️ Simuler
                </button>
              </div>
            </div>
          </div>
        ))}

        <div style={{ height: 8 }} />
      </div>

      {/* BRIEF MODAL */}
      {showBrief && selectedForBrief && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: C.card, borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.cardBorder, margin: "0 auto 16px" }} />
            <div style={{ fontSize: 10, color: selectedForBrief.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>📋 Brief — {selectedForBrief.title}</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 14 }}>{selectedForBrief.subtitle}</div>

            {/* Compétences */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🎯 Compétences entraînées</div>
              {selectedForBrief.targetSkills.map(skillId => {
                const skill = getSkillById(skillId);
                return skill ? (
                  <div key={skillId} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ padding: "2px 8px", borderRadius: 6, background: skill.pillarSoft || "rgba(255,92,53,0.1)", border: `1px solid ${skill.pillarColor}33`, fontSize: 10, fontWeight: 800, color: skill.pillarColor, flexShrink: 0, marginTop: 1 }}>{skillId}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{skill.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{skill.description}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>

            {/* Objectif */}
            <div style={{ background: selectedForBrief.soft, border: `1px solid ${selectedForBrief.color}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: selectedForBrief.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🎯 Objectif</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{selectedForBrief.objective}</div>
            </div>

            {/* Astuce */}
            <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#FFB800", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>💡 Astuce clé</div>
              <div style={{ fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>"{selectedForBrief.tip}"</div>
            </div>

            {/* Erreur classique */}
            {getSkillById(selectedForBrief.primarySkill) && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>⚠️ Erreur à éviter</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{getSkillById(selectedForBrief.primarySkill)?.commonMistake}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowBrief(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: "transparent", color: C.textMuted, fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Retour
              </button>
              <button onClick={() => startVocal(selectedForBrief)} style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${selectedForBrief.color},${selectedForBrief.color}cc)`, color: "white", fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                🎙️ Lancer la simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — VOCAL
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "vocal") return (
    <div style={{ height: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.cardBorder}`, background: C.card, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => { stopAll(); setPhase("select"); }} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ fontSize: 22 }}>{scenario.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>{scenario.subtitle}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>{scenario.skillFocus}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ fontSize: 9, padding: "2px 8px", borderRadius: 99, fontWeight: 700, background: scenario.soft, color: scenario.color, border: `1px solid ${scenario.color}44` }}>🎙️ {scenario.voiceName}</div>
          {/* Barre de progression échanges */}
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: MAX_EXCHANGES }, (_, i) => (
              <div key={i} style={{ width: 18, height: 5, borderRadius: 3, background: i < exchangeCount ? scenario.color : C.textDim, transition: "background .3s" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Historique bulles */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map((m, i) => (
          <div key={i} style={{
            padding: "9px 12px",
            borderRadius: m.role === "user" ? "12px 12px 4px 12px" : m.role === "coach" ? 12 : "12px 12px 12px 4px",
            fontSize: 12, lineHeight: 1.6,
            alignSelf: m.role === "user" ? "flex-end" : m.role === "coach" ? "stretch" : "flex-start",
            maxWidth: m.role === "coach" ? "100%" : "86%",
            background: m.role === "user"
              ? "linear-gradient(135deg,rgba(255,92,53,0.2),rgba(255,92,53,0.08))"
              : m.role === "coach"
              ? "linear-gradient(135deg,rgba(34,197,94,0.07),transparent)"
              : C.card,
            border: m.role === "user"
              ? "1px solid rgba(255,92,53,0.3)"
              : m.role === "coach"
              ? "1px solid rgba(34,197,94,0.18)"
              : `1px solid ${C.cardBorder}`,
          }} dangerouslySetInnerHTML={{ __html: m.html }} />
        ))}
        <div ref={historyEndRef} />
      </div>

      {/* Zone contrôles */}
      <div style={{ padding: "10px 14px 22px", borderTop: `1px solid ${C.cardBorder}`, background: C.card, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

        {/* Transcript */}
        <div style={{ width: "100%", background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "10px 13px", minHeight: 52 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, color: isProspectSpeaking ? scenario.color : isRecording ? "#EF4444" : C.textMuted }}>
            {isProspectSpeaking ? `${scenario.emoji} ${scenario.voiceName} parle...` : isRecording ? "🔴 Enregistrement..." : "🎙️ Ta voix"}
          </div>
          <div style={{ fontSize: 13, color: transcript ? C.text : C.textMuted, fontStyle: !transcript ? "italic" : "normal", lineHeight: 1.55 }}>
            {transcript || (isRecording ? "Parle maintenant..." : isProspectSpeaking ? "..." : "Appuie sur le micro et parle...")}
          </div>
        </div>

        {/* Bouton micro */}
        <div style={{ position: "relative", width: 76, height: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isRecording && [0, 1].map(i => (
            <div key={i} style={{
              position: "absolute", width: 92, height: 92, borderRadius: "50%",
              border: "2px solid #EF4444", opacity: 0.5,
              animation: "ring 1.5s ease-out infinite", animationDelay: `${i * 0.5}s`,
            }} />
          ))}
          <button
            onClick={handleMic}
            disabled={isProspectSpeaking || loading}
            style={{
              width: 68, height: 68, borderRadius: "50%", border: "none", cursor: "pointer",
              fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center",
              background: isRecording
                ? "linear-gradient(135deg,#EF4444,#CC1A1A)"
                : isProspectSpeaking
                ? `linear-gradient(135deg,${scenario.color},${scenario.color}cc)`
                : "linear-gradient(135deg,#FF5C35,#FF3A1A)",
              boxShadow: isRecording ? "0 8px 28px rgba(239,68,68,0.5)" : "0 8px 28px rgba(255,92,53,0.4)",
              opacity: (isProspectSpeaking || loading) ? 0.4 : 1,
              transition: "all .2s",
            }}
          >
            {isRecording ? "⏹️" : isProspectSpeaking ? "👂" : "🎙️"}
          </button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textAlign: "center" }}>{micStatus}</div>

        {/* Boutons secondaires */}
        <div style={{ display: "flex", gap: 9, width: "100%", maxWidth: 320 }}>
          <button
            onClick={() => processUserSpeech("[Le vendeur hésite et reste silencieux]")}
            disabled={isRecording || isProspectSpeaking || loading}
            style={{ flex: 1, padding: 11, borderRadius: 11, border: `1px solid ${C.cardBorder}`, background: C.card, color: C.textMuted, fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: (isRecording || isProspectSpeaking || loading) ? 0.4 : 1 }}
          >
            ⏭ Passer
          </button>
          <button
            onClick={() => { stopAll(); generateDebrief(); }}
            style={{ flex: 1, padding: 11, borderRadius: 11, border: "1px solid rgba(255,92,53,0.3)", background: "rgba(255,92,53,0.1)", color: "#FF5C35", fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Terminer ✓
          </button>
        </div>
      </div>

      {/* COACH PANEL SLIDE-UP */}
      {showCoach && coachData && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: "1.5px solid rgba(34,197,94,0.35)", padding: "14px 18px 30px", zIndex: 100, borderRadius: "16px 16px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.cardBorder, margin: "0 auto 12px" }} />

          {/* Score + compétence */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>⚡ Coach Live</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{coachData.skill_evalued || scenario?.skillFocus}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{coachData.emoji}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: coachData.score >= 7 ? "#22C55E" : coachData.score >= 4 ? "#FFB800" : "#EF4444" }}>
                  {coachData.score}/10
                </div>
                <div style={{ fontSize: 10, color: C.textMuted }}>sur ce critère</div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#22C55E" }}>✅ {coachData.point_fort}</div>
            <div style={{ fontSize: 12, color: "#EF4444" }}>⚠️ {coachData.point_faible}</div>

            <div style={{ padding: "9px 12px", background: "rgba(255,184,0,0.07)", borderRadius: 10, border: "1px solid rgba(255,184,0,0.2)" }}>
              <div style={{ fontSize: 9, color: "#FFB800", fontWeight: 800, textTransform: "uppercase", letterSpacing: .8, marginBottom: 3 }}>💬 Tu aurais dû dire</div>
              <div style={{ fontSize: 12, color: C.text, fontStyle: "italic" }}>"{coachData.formule_optimale}"</div>
            </div>

            {coachData.tip_specifique && (
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55, padding: "6px 10px", background: C.bg, borderRadius: 8, border: `1px solid ${C.cardBorder}` }}>
                🎓 {coachData.tip_specifique}
              </div>
            )}
          </div>

          <button onClick={dismissCoach} style={{ width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: C.bg, color: C.text, fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Continuer la conversation →
          </button>
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — DEBRIEF
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "debrief") {
    const s  = debrief?.score_global || 5;
    const sc = s >= 7 ? "#22C55E" : s >= 4 ? "#FFB800" : "#EF4444";
    const avgScore = exchangesRef.current
      .filter(e => e.role === "user" && e.score > 0)
      .reduce((sum, e, _, arr) => sum + e.score / arr.length, 0);

    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.cardBorder}`, background: C.card, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>⚡ Débrief Vocal</div>
          {scenario && <div style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted }}>{scenario.emoji} {scenario.title}</div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 13 }}>

          {loading || !debrief ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: C.textMuted }}>
              <div style={{ fontSize: 40 }}>🎙️</div>
              <div style={{ marginTop: 14, fontSize: 13 }}>Analyse de ta session...</div>
              <div style={{ fontSize: 11, marginTop: 6, color: C.textDim }}>Compétence : {scenario?.skillFocus}</div>
            </div>
          ) : (
            <>
              {/* Score global */}
              <div style={{ background: `linear-gradient(135deg,${s >= 7 ? "rgba(34,197,94,0.12)" : s >= 4 ? "rgba(255,184,0,0.12)" : "rgba(239,68,68,0.12)"},${C.card})`, border: `1.5px solid ${sc}44`, borderRadius: 20, padding: "22px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>🎙️ {scenario?.voiceName} · {exchangeCount} échanges</div>
                <div style={{ fontSize: 56, fontWeight: 900, color: sc, lineHeight: 1 }}>{s}</div>
                <div style={{ fontSize: 11, color: C.textMuted, margin: "4px 0 10px" }}>/ 10</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{debrief.titre}</div>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{debrief.verdict}</div>
              </div>

              {/* Compétences entraînées */}
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: scenario?.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🎯 Compétences travaillées</div>
                {scenario?.targetSkills.map(skillId => {
                  const skill = getSkillById(skillId);
                  return skill ? (
                    <div key={skillId} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
                      <div style={{ width: 38, padding: "2px 0", borderRadius: 6, background: "rgba(255,92,53,0.1)", fontSize: 9, fontWeight: 800, color: "#FF5C35", textAlign: "center" }}>{skillId}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{skill.name}</div>
                    </div>
                  ) : null;
                })}
                {debrief.skill_progress && (
                  <div style={{ marginTop: 8, fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>📈 {debrief.skill_progress}</div>
                )}
              </div>

              {/* XP */}
              <div style={{ background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.3)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>⚡</div>
                <div>
                  <div style={{ fontSize: 10, color: "#FFB800", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>XP Vocal Gagné</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#FFB800" }}>+{debrief.xp || 40} XP</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.textMuted }}>Score moyen</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: avgScore >= 7 ? "#22C55E" : avgScore >= 4 ? "#FFB800" : "#EF4444" }}>{avgScore.toFixed(1)}/10</div>
                </div>
              </div>

              {/* Points forts */}
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>✅ Tes points forts</div>
                {(debrief.top_3 || []).map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: i < 2 ? 8 : 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", flexShrink: 0, marginTop: 5 }} />
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{p}</div>
                  </div>
                ))}
              </div>

              {/* Axe critique */}
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎯 Priorité n°1</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{debrief.axe_critique}</div>
              </div>

              {/* Conseil vocal */}
              <div style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.08),transparent)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "#EC4899", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎙️ Conseil vocal</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{debrief.conseil_vocal}</div>
              </div>

              {/* Script idéal */}
              <div style={{ background: "linear-gradient(135deg,rgba(255,184,0,0.1),transparent)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: "#FFB800", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>💬 Script idéal — {scenario?.subtitle}</div>
                <div style={{ fontSize: 13, fontStyle: "italic", lineHeight: 1.7, color: C.text }}>"{debrief.script_ideal}"</div>
              </div>

              {/* CTA Rejouer */}
              <button
                onClick={() => { setPhase("select"); setDebrief(null); }}
                style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "white", background: scenario ? `linear-gradient(135deg,${scenario.color},${scenario.color}cc)` : "#FF5C35" }}
              >
                🔄 Rejouer ce scénario
              </button>

              <button
                onClick={onBack}
                style={{ width: "100%", padding: 13, borderRadius: 14, border: `1px solid ${C.cardBorder}`, cursor: "pointer", background: C.card, fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 16 }}
              >
                ← Retour à l'accueil
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
