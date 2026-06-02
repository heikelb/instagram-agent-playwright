/**
 * RolePlayGameScreen.jsx — Mode Immersif PAP
 * Tu es devant une porte. Tu toques. Un prospect ouvre.
 * Tu appliques ton script étape par étape. Chaque étape validée = feedback visuel + XP.
 *
 * Phases : select → door → opening → conversation → debrief
 */

import { useState, useRef, useEffect } from "react";
import { COLORS } from "../constants/colors";

const ELEVENLABS_API_KEY = "sk_a2ec02a4131798d58b43e0418222189295076526697a5728";
const ANTHROPIC_API_KEY  = "-----REMPLACE-PAR-TA-CLÉ-ANTHROPIC-----";
const EL_MODEL           = "eleven_flash_v2_5";

// ─── PERSONNAGES ─────────────────────────────────────────────────────────────

const CHARACTERS = [
  { id: "retraitee", name: "Madame Moreau", age: 67, emoji: "👵", type: "F", color: "#EC4899",
    desc: "Retraitée, chez elle toute la journée. Curieuse mais méfiante des inconnus.",
    voiceId: "XB0fDUnXU5powFXDhCwa", voiceSettings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    personality: "Tu es Mme Moreau, 67 ans, retraitée. Tu es chez toi. Réaction initiale : légère méfiance. Si le script est bien fait tu t'ouvres. 1-2 phrases max. Français naturel.",
  },
  { id: "cadre", name: "M. Leclerc", age: 44, emoji: "👨‍💼", type: "H", color: "#3B82F6",
    desc: "Cadre, télétravail. Pressé mais poli. Peut-être convaincu si vite.",
    voiceId: "TX3LPaxmHKxFdv7VOQHJ", voiceSettings: { stability: 0.5, similarity_boost: 0.75, style: 0.25 },
    personality: "Tu es M. Leclerc, 44 ans, cadre en télétravail. Tu as peu de temps. Si le commercial est professionnel tu écoutes 2 min. 1-2 phrases max.",
  },
  { id: "mefiant", name: "M. Bernard", age: 57, emoji: "👨", type: "H", color: "#FFB800",
    desc: "Artisan à la retraite. A été démarché trop souvent. Résistant par défaut.",
    voiceId: "JBFqnCBsd6RMkjVDRZzb", voiceSettings: { stability: 0.4, similarity_boost: 0.75, style: 0.4 },
    personality: "Tu es M. Bernard, 57 ans, artisan retraité. Tu as été souvent démarché et tu n'aimes pas ça. Résistant mais pas agressif. 1-2 phrases max.",
  },
  { id: "maman", name: "Mme Chen", age: 38, emoji: "👩", type: "F", color: "#22C55E",
    desc: "Maman active, occupée. Ouverte si on va droit au but. Décide vite.",
    voiceId: "EXAVITQu4vr4xnSDxMaL", voiceSettings: { stability: 0.55, similarity_boost: 0.75, style: 0.2 },
    personality: "Tu es Mme Chen, 38 ans, maman active. Tu gères les enfants. Occupée mais pragmatique — si ça vaut son temps tu écoutes. 1-2 phrases max.",
  },
  { id: "hostile", name: "M. Rousseau", age: 63, emoji: "😤", type: "H", color: "#EF4444",
    desc: "Retraité agacé. 'Encore un vendeur.' Mode difficile.",
    voiceId: "JBFqnCBsd6RMkjVDRZzb", voiceSettings: { stability: 0.35, similarity_boost: 0.7, style: 0.5 },
    personality: "Tu es M. Rousseau, 63 ans. Tu es AGACÉ des commerciaux porte-à-porte. Ton ouverture : 'Encore...' ou 'Non merci' direct. Mais si le commercial utilise un script très pro (pas commercial, mission Orange), tu peux t'adoucir. 1-2 phrases max.",
  },
];

// ─── SCÉNARIOS DE JEU ─────────────────────────────────────────────────────────

const GAME_SCENARIOS = [
  {
    id: "deballe",
    icon: "🚪",
    title: "La Première Porte",
    desc: "Valide les 4 déclencheurs du script d'ouverture",
    difficulty: 1,
    color: "#FF5C35",
    soft: "rgba(255,92,53,0.12)",
    xpMax: 60,
    compatibleCharacters: ["retraitee", "cadre", "mefiant", "maman", "hostile"],
    steps: [
      { id: "legitimite",    icon: "🏛️", name: "Légitimité",    desc: "Dire 'Services Orange' ou mission officielle — PAS 'je suis commercial'", xp: 10, hint: "Services Orange / mandaté sur le secteur..." },
      { id: "preuve_sociale",icon: "👥", name: "Preuve Sociale", desc: "Mentionner les voisins déjà vus ce matin", xp: 10, hint: "On a déjà vu plusieurs voisins ce matin..." },
      { id: "urgence",       icon: "⏰", name: "Urgence",        desc: "Créer une deadline — 'avant qu'on finalise les interventions'", xp: 15, hint: "Avant qu'on finalise / ce matin seulement..." },
      { id: "permission",    icon: "🤝", name: "Permission",     desc: "Terminer par une question d'engagement : 'Ça vous va ?'", xp: 15, hint: "Deux questions rapides... ça vous va ?" },
      { id: "entree",        icon: "🚶", name: "Transition",     desc: "Proposer d'entrer sans demander — annoncer + agir", xp: 10, hint: "Je vous enlève les chaussures, on vérifie ensemble..." },
    ],
    coachPrompt: (step, lastSpeech, history) => `Tu es coach PAP expert. L'utilisateur vient de dire : "${lastSpeech}".
L'étape à valider maintenant est : "${step.id}" (${step.name}).
Description : ${step.desc}

Dis si cette étape EST validée par ce qu'il a dit, et donne un feedback court.

Retourne UNIQUEMENT ce JSON :
{
  "validated": <true/false>,
  "score": <1-10 — qualité de l'exécution>,
  "feedback": "<max 10 mots — ce qu'il a bien fait ou ce qui manque>",
  "formule": "<si non validé : exemple exact de ce qu'il faut dire>"
}`,
  },
  {
    id: "hypnotic",
    icon: "🧠",
    title: "HYPNOTIC Terrain",
    desc: "8 étapes de la découverte au closing",
    difficulty: 3,
    color: "#A855F7",
    soft: "rgba(168,85,247,0.12)",
    xpMax: 120,
    compatibleCharacters: ["cadre", "maman"],
    steps: [
      { id: "H", icon: "🔓", name: "Permission (H)", desc: "Éteindre le radar anti-vendeur — 'pas là pour vendre'", xp: 10, hint: "Je suis pas là pour vous vendre quoi que ce soit..." },
      { id: "Y", icon: "🔍", name: "Diagnostic (Y)", desc: "Poser une question sur l'opérateur / la situation actuelle", xp: 10, hint: "Vous êtes sur quel opérateur actuellement ?" },
      { id: "P", icon: "💔", name: "Problème (P)", desc: "Identifier et creuser un problème réel", xp: 15, hint: "Vous avez jamais eu de lenteurs le soir ?" },
      { id: "N", icon: "😨", name: "Néfaste (N)", desc: "Activer la peur de perdre — conséquences de ne pas changer", xp: 15, hint: "Si rien change dans 6 mois vous seriez dans la même situation ?" },
      { id: "O", icon: "✨", name: "Objectif (O)", desc: "Faire imaginer la vie avec le problème résolu", xp: 10, hint: "Si on réglait ça, ça changerait quoi pour vous ?" },
      { id: "T", icon: "🔄", name: "Traduire (T)", desc: "Reformuler avec SES mots exacts — pas les siens", xp: 15, hint: "Donc [ses mots exacts] — c'est bien ça ?" },
      { id: "I", icon: "⚡", name: "Imminence (I)", desc: "Neutraliser 'j'ai besoin de réfléchir' avant qu'il le dise", xp: 10, hint: "À quoi exactement vous auriez besoin de réfléchir ?" },
      { id: "C", icon: "🎯", name: "Clore (C)", desc: "La permission finale — 'seriez-vous contre l'idée que...'", xp: 15, hint: "Seriez-vous contre l'idée que je vous explique comment ça fonctionnerait ?" },
    ],
    coachPrompt: (step, lastSpeech, history) => `Tu es coach PAP. Utilisateur vient de dire : "${lastSpeech}".
Étape à valider : "${step.id}" — ${step.name} : ${step.desc}

Retourne UNIQUEMENT ce JSON :
{
  "validated": <true/false>,
  "score": <1-10>,
  "feedback": "<max 10 mots>",
  "formule": "<si non validé : phrase exacte>"
}`,
  },
  {
    id: "cdd",
    icon: "🛡️",
    title: "CDD — Gestion Objections",
    desc: "Clarifier → Discuter → Dissiper sur 3 objections",
    difficulty: 2,
    color: "#FFB800",
    soft: "rgba(255,184,0,0.12)",
    xpMax: 80,
    compatibleCharacters: ["mefiant", "hostile"],
    steps: [
      { id: "C1", icon: "🔍", name: "Clarifier #1", desc: "Creuser 'pas intéressé' : 'Par quoi exactement ?'", xp: 15, hint: "Pas intéressé par quoi exactement ?" },
      { id: "D1", icon: "☕", name: "Tea Time #1",  desc: "Écouter sa mauvaise expérience sans interrompre", xp: 10, hint: "Ah bon ? Qu'est-ce qui s'était passé ?" },
      { id: "DIS1",icon: "🕊️", name: "Dissiper #1",  desc: "L'aider à se rassurer sans imposer ton offre", xp: 15, hint: "Si après vérification vous avez rien à gagner, je repars — simple." },
      { id: "C2", icon: "🔍", name: "Clarifier #2", desc: "Creuser 'c'est trop cher' : 'Par rapport à quoi ?'", xp: 10, hint: "Cher par rapport à ce que vous payez actuellement ?" },
      { id: "DIS2",icon: "🕊️", name: "Dissiper #2",  desc: "Montrer la valeur sans parler de prix directement", xp: 15, hint: "Le prix c'est une chose — ce qu'on coupe comme galères en est une autre." },
      { id: "I",   icon: "⚡", name: "Imminence",    desc: "Neutraliser 'je réfléchis' avant qu'il arrive", xp: 15, hint: "À quoi exactement vous devriez réfléchir ?" },
    ],
    coachPrompt: (step, lastSpeech, history) => `Tu es coach PAP. Utilisateur vient de dire : "${lastSpeech}".
Étape à valider : "${step.id}" — ${step.name} : ${step.desc}

Retourne UNIQUEMENT ce JSON :
{
  "validated": <true/false>,
  "score": <1-10>,
  "feedback": "<max 10 mots>",
  "formule": "<si non validé : phrase exacte>"
}`,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const callClaude = async (system, messages, maxTokens = 120) => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) throw new Error("Claude " + r.status);
  return (await r.json()).content?.[0]?.text || "";
};

const parseJSON = (text, fallback) => {
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return fallback; }
};

const speakEL = (text, voiceId, settings) =>
  new Promise(async (resolve) => {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
        body: JSON.stringify({ text, model_id: EL_MODEL, language_code: "fr", voice_settings: settings }),
      });
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = new Audio(url);
      a.onended = () => { URL.revokeObjectURL(url); resolve(); };
      a.onerror = () => resolve();
      a.play();
    } catch {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR"; u.rate = 0.92;
      const v = speechSynthesis.getVoices().find(v => v.lang.startsWith("fr"));
      if (v) u.voice = v;
      u.onend = () => resolve();
      speechSynthesis.speak(u);
    }
  });

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export default function RolePlayGameScreen({ onBack, onXPGain }) {
  const [phase, setPhase]         = useState("select");   // select|door|opening|convo|debrief
  const [scenario, setScenario]   = useState(null);
  const [character, setCharacter] = useState(null);
  const [steps, setSteps]         = useState([]);
  const [stepIdx, setStepIdx]     = useState(0);
  const [history, setHistory]     = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [transcript, setTranscript]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [doorOpen, setDoorOpen]       = useState(false);
  const [charVisible, setCharVisible] = useState(false);
  const [flash, setFlash]             = useState(null);   // {type: "success"|"fail", step}
  const [micHint, setMicHint]         = useState("Appuie pour parler 🎙️");
  const [debrief, setDebrief]         = useState(null);
  const [totalXP, setTotalXP]         = useState(0);
  const [knockEffect, setKnockEffect] = useState(false);

  const recRef      = useRef(null);
  const histEndRef  = useRef(null);
  const audioRef    = useRef(null);
  const txRef       = useRef("");
  const claudeHist  = useRef([]);
  const C = COLORS;

  useEffect(() => { histEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);
  useEffect(() => () => { audioRef.current?.pause(); speechSynthesis.cancel(); }, []);

  // ── DÉMARRER UN SCÉNARIO ────────────────────────────────────────────────────
  const startScenario = (sc) => {
    const compatible = CHARACTERS.filter(c => sc.compatibleCharacters.includes(c.id));
    const char = compatible[Math.floor(Math.random() * compatible.length)];
    const initialSteps = sc.steps.map(s => ({ ...s, validated: false, score: 0, feedback: "" }));

    setScenario(sc);
    setCharacter(char);
    setSteps(initialSteps);
    setStepIdx(0);
    setHistory([]);
    setDoorOpen(false);
    setCharVisible(false);
    setFlash(null);
    setDebrief(null);
    setTotalXP(0);
    claudeHist.current = [];
    setPhase("door");
  };

  // ── TOQUER ──────────────────────────────────────────────────────────────────
  const knock = async () => {
    setKnockEffect(true);
    setTimeout(() => setKnockEffect(false), 600);

    // 1s pause puis porte qui s'ouvre
    setTimeout(async () => {
      setDoorOpen(true);
      setTimeout(() => setCharVisible(true), 600);

      // Message d'ouverture du personnage
      await new Promise(r => setTimeout(r, 900));
      const openingOptions = [
        "Oui ?",
        "Bonjour ?",
        "Qu'est-ce que c'est ?",
        "Oui, bonjour.",
        "Oui, j'arrive... c'est quoi ?",
      ];
      let opening = openingOptions[Math.floor(Math.random() * openingOptions.length)];
      try {
        const raw = await callClaude(
          character?.personality || "",
          [{ role: "user", content: "(Tu ouvres la porte. Dis ta phrase d'ouverture naturelle, 3 mots max.)" }],
          40
        );
        if (raw.trim()) opening = raw.trim();
      } catch { /* fallback */ }

      claudeHist.current.push({ role: "assistant", content: opening });
      addBubble("prospect", opening);
      setPhase("convo");
      setMicHint("🎙️ C'est à toi — appuie et parle");
      await speakEL(opening, character.voiceId, character.voiceSettings);
    }, 800);
  };

  // ── MICRO ────────────────────────────────────────────────────────────────────
  const handleMic = () => {
    if (isRecording) { recRef.current?.stop(); return; }
    if (isSpeaking || loading) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Ouvre dans Chrome pour la reconnaissance vocale."); return; }

    const r = new SR();
    r.lang = "fr-FR"; r.continuous = false; r.interimResults = true;
    r.onstart = () => { setIsRecording(true); setMicHint("🔴 Parle..."); txRef.current = ""; setTranscript(""); };
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      txRef.current = t; setTranscript(t);
    };
    r.onend = async () => {
      setIsRecording(false);
      const text = txRef.current.trim();
      if (text.length > 2) await processSpeech(text);
      else setMicHint("Rien capté — réessaie 🎙️");
    };
    r.onerror = () => { setIsRecording(false); setMicHint("Erreur micro — réessaie"); };
    recRef.current = r;
    r.start();
  };

  // ── TRAITEMENT PAROLE ───────────────────────────────────────────────────────
  const processSpeech = async (text) => {
    addBubble("user", text);
    claudeHist.current.push({ role: "user", content: text });
    setLoading(true);
    setMicHint("⏳ Analyse...");

    const currentStep = steps[stepIdx];
    if (!currentStep) { setLoading(false); return; }

    // Évaluation de l'étape courante
    let coachResult = { validated: false, score: 5, feedback: "Continue...", formule: currentStep.hint };
    try {
      const raw = await callClaude(
        "Tu es un coach PAP. Réponds UNIQUEMENT en JSON valide, sans markdown.",
        [{ role: "user", content: scenario.coachPrompt(currentStep, text, claudeHist.current) }],
        150
      );
      coachResult = parseJSON(raw, coachResult);
    } catch { /* fallback */ }

    // Mise à jour des étapes
    setSteps(prev => prev.map((s, i) =>
      i === stepIdx ? { ...s, validated: coachResult.validated, score: coachResult.score, feedback: coachResult.feedback } : s
    ));

    if (coachResult.validated) {
      const xp = currentStep.xp;
      setTotalXP(prev => prev + xp);
      setFlash({ type: "success", stepName: currentStep.name, xp });
      setTimeout(() => setFlash(null), 2500);

      const nextIdx = stepIdx + 1;
      if (nextIdx >= steps.length) {
        // Toutes les étapes validées !
        setLoading(false);
        await new Promise(r => setTimeout(r, 800));
        generateDebrief(steps.map((s, i) => i === stepIdx ? { ...s, validated: true } : s));
        return;
      }
      setStepIdx(nextIdx);

      // Réponse du prospect (réaction positive)
      const prospectPrompt = `L'utilisateur vient de bien faire l'étape "${currentStep.name}". Réagis naturellement et positivement à ce qu'il a dit. 1-2 phrases max, reste dans le personnage.`;
      let reply = "";
      try {
        reply = await callClaude(character.personality, [...claudeHist.current, { role: "user", content: prospectPrompt }], 80);
      } catch { reply = "Ah... d'accord, je vous écoute."; }

      claudeHist.current.push({ role: "assistant", content: reply });
      addBubble("prospect", reply);
      setIsSpeaking(true);
      await speakEL(reply, character.voiceId, character.voiceSettings);
      setIsSpeaking(false);
      setMicHint(`🎯 Étape suivante : ${steps[nextIdx]?.name}`);
    } else {
      // Étape non validée — le prospect réagit, hint donné
      setFlash({ type: "fail", stepName: currentStep.name, formule: coachResult.formule });
      setTimeout(() => setFlash(null), 3000);

      let reply = "";
      try {
        reply = await callClaude(character.personality, [...claudeHist.current], 80);
      } catch { reply = "Hm... je vois."; }

      claudeHist.current.push({ role: "assistant", content: reply });
      addBubble("prospect", reply);
      setIsSpeaking(true);
      await speakEL(reply, character.voiceId, character.voiceSettings);
      setIsSpeaking(false);
      setMicHint(`Réessaie → ${currentStep.hint}`);
    }

    setLoading(false);
    setTranscript("");
  };

  // ── DÉBRIEF ──────────────────────────────────────────────────────────────────
  const generateDebrief = async (finalSteps) => {
    setPhase("debrief");
    const validated = (finalSteps || steps).filter(s => s.validated).length;
    const total = steps.length;
    const stars = validated === total ? 3 : validated >= total * 0.66 ? 2 : validated >= total * 0.33 ? 1 : 0;
    const xpEarned = (finalSteps || steps).filter(s => s.validated).reduce((sum, s) => sum + s.xp, 0);

    setDebrief({ validated, total, stars, xpEarned, steps: finalSteps || steps });
    if (onXPGain) onXPGain(xpEarned);
  };

  const addBubble = (role, text) =>
    setHistory(prev => [...prev, { role, text }]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — SELECT
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "select") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px", background: C.card, borderBottom: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>←</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>🎮 Mode Immersif PAP</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Simulation terrain interactive</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        <div style={{ background: "linear-gradient(135deg,rgba(255,92,53,0.1),rgba(168,85,247,0.06))", border: "1.5px solid rgba(255,92,53,0.25)", borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>🚪 Comment ça marche</div>
          {[
            "Tu arrives devant une porte dans ta rue",
            "Tu toques — un prospect ouvre (homme ou femme)",
            "Tu parles à voix haute — le jeu valide chaque étape de ton script",
            "Chaque étape validée = XP + feedback instantané",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 12, lineHeight: 1.5 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,92,53,0.15)", border: "1px solid rgba(255,92,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#FF5C35", flexShrink: 0 }}>{i + 1}</span>
              {t}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Choisir un niveau</div>

        {GAME_SCENARIOS.map(sc => (
          <div key={sc.id} onClick={() => startScenario(sc)} style={{ background: C.card, border: `1.5px solid ${sc.color}22`, borderRadius: 18, padding: 16, cursor: "pointer", transition: "all .2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: sc.soft, border: `1px solid ${sc.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{sc.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 3 }}>{sc.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{sc.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FFB800" }}>+{sc.xpMax} XP</div>
                <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                  {[0,1,2].map(j => <div key={j} style={{ width: 14, height: 4, borderRadius: 2, background: j < sc.difficulty ? sc.color : C.textDim }} />)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {sc.steps.map(s => (
                <span key={s.id} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: sc.soft, border: `1px solid ${sc.color}33`, color: sc.color, fontWeight: 600 }}>
                  {s.icon} {s.name}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontSize: 11, color: C.textMuted }}>Personnages possibles :</div>
              <div style={{ display: "flex", gap: 4 }}>
                {CHARACTERS.filter(c => sc.compatibleCharacters.includes(c.id)).map(c => (
                  <span key={c.id} title={c.name} style={{ fontSize: 18 }}>{c.emoji}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: 10 }} />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — DOOR (avant de toquer)
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "door" || (phase === "convo" && !charVisible)) return (
    <div style={{ minHeight: "100vh", background: "#0F0F13", fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header minimaliste */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
        <button onClick={() => setPhase("select")} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>← Quitter</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{scenario?.title}</div>
        </div>
        <div style={{ fontSize: 11, color: "#FFB800", fontWeight: 700 }}>⚡ {totalXP} XP</div>
      </div>

      {/* Scène — rue la nuit */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "0 20px 20px" }}>

        {/* Fond de rue */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0a0a12 0%, #14141f 40%, #1a1025 100%)", overflow: "hidden" }}>
          {/* Réverbère */}
          <div style={{ position: "absolute", top: 20, right: "30%", width: 2, height: 80, background: "rgba(255,200,100,0.4)", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: 10, right: "30%", width: 20, height: 6, background: "rgba(255,200,100,0.5)", borderRadius: 10, transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", top: 16, right: "28%", width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,200,100,0.08),transparent 70%)" }} />
          {/* Sol */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.5))" }} />
        </div>

        {/* Immeuble / mur */}
        <div style={{ position: "relative", width: "100%", maxWidth: 340, zIndex: 2 }}>

          {/* Mur */}
          <div style={{ background: "linear-gradient(180deg,#1e1a2e,#161222)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px 16px 0 0", padding: "16px 16px 0", marginBottom: 0 }}>

            {/* Numéro de porte */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>Rue des Lilas</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                N° {Math.floor(Math.random() * 30 + 1) * 2} · {character?.name} · {character?.age} ans
              </div>
            </div>

            {/* LA PORTE */}
            <div style={{ perspective: "900px", perspectiveOrigin: "left center" }}>
              <div style={{
                width: "100%",
                height: 220,
                background: "linear-gradient(180deg,#2d1a4e,#1a1030)",
                border: "3px solid #3a2560",
                borderRadius: "8px 8px 0 0",
                position: "relative",
                transition: "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                transform: doorOpen ? "perspective(900px) rotateY(-65deg)" : "perspective(900px) rotateY(0deg)",
                cursor: !doorOpen ? "pointer" : "default",
                boxShadow: doorOpen ? "none" : "inset -4px 0 12px rgba(0,0,0,0.4)",
              }}>
                {/* Panneaux de porte */}
                <div style={{ position: "absolute", inset: 12, border: "2px solid rgba(255,255,255,0.08)", borderRadius: 4, display: "grid", gridTemplateRows: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 3 }} />
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 3 }} />
                </div>
                {/* Poignée */}
                <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                  <div style={{ width: 8, height: 24, background: "linear-gradient(180deg,#c8a84b,#8b6914)", borderRadius: 4 }} />
                  <div style={{ width: 14, height: 6, background: "linear-gradient(90deg,#c8a84b,#8b6914)", borderRadius: 2, marginTop: 2, marginLeft: -3 }} />
                </div>
                {/* Judas / œil de porte */}
                <div style={{ position: "absolute", right: 20, top: 60, width: 10, height: 10, borderRadius: "50%", background: "radial-gradient(circle,#1a1030,#0a0518)", border: "2px solid rgba(255,255,255,0.15)" }} />
              </div>
            </div>

            {/* Paillasson */}
            <div style={{ height: 14, background: "linear-gradient(90deg,#2a1e3a,#1e1530,#2a1e3a)", borderRadius: "0 0 4px 4px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.15)", letterSpacing: 4, fontWeight: 700 }}>BIENVENUE</div>
            </div>
          </div>

          {/* Sol */}
          <div style={{ height: 30, background: "linear-gradient(180deg,#1a1a28,#0f0f18)", borderRadius: "0 0 12px 12px" }} />
        </div>

        {/* Personnage qui apparaît */}
        {charVisible && (
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-10%)", bottom: 120, zIndex: 5, animation: "slideUp 0.5s ease-out", textAlign: "center" }}>
            <div style={{ fontSize: 72, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.8))" }}>{character?.emoji}</div>
            <div style={{ marginTop: 4, padding: "3px 10px", background: "rgba(0,0,0,0.7)", borderRadius: 99, fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {character?.name}
            </div>
          </div>
        )}

        {/* Bouton TOQUER */}
        {!doorOpen && (
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginTop: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Tu es devant la porte.</div>
            <button
              onClick={knock}
              style={{
                padding: "15px 40px",
                borderRadius: 99,
                border: "2px solid rgba(255,184,0,0.5)",
                background: knockEffect ? "rgba(255,184,0,0.3)" : "rgba(255,184,0,0.12)",
                color: "#FFB800",
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "'Sora',sans-serif",
                transform: knockEffect ? "scale(0.94)" : "scale(1)",
                transition: "all .15s",
                boxShadow: knockEffect ? "0 0 24px rgba(255,184,0,0.4)" : "0 4px 20px rgba(255,184,0,0.15)",
              }}
            >
              🚪 Toquer
            </button>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>Appuie pour frapper à la porte</div>
          </div>
        )}

        {/* Loading après knock */}
        {doorOpen && !charVisible && (
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginTop: 20 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>La porte s'ouvre...</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-10%) translateY(30px); }
          to   { opacity: 1; transform: translateX(-10%) translateY(0); }
        }
      `}</style>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — CONVERSATION
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "convo") return (
    <div style={{ height: "100vh", background: "#0F0F13", fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header — personnage + steps */}
      <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button onClick={() => setPhase("select")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ fontSize: 26 }}>{character?.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{character?.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{character?.desc}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#FFB800" }}>⚡ {totalXP} XP</div>
        </div>

        {/* Barre de progression des étapes */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2 }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, minWidth: 44, height: 36, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: s.validated ? "rgba(34,197,94,0.2)" : i === stepIdx ? `${scenario?.color}22` : "rgba(255,255,255,0.05)",
              border: s.validated ? "1.5px solid rgba(34,197,94,0.4)" : i === stepIdx ? `1.5px solid ${scenario?.color}66` : "1px solid rgba(255,255,255,0.08)",
              transition: "all .3s",
            }}>
              <div style={{ fontSize: 12 }}>{s.validated ? "✅" : i === stepIdx ? s.icon : "○"}</div>
              <div style={{ fontSize: 7, color: s.validated ? "#22C55E" : i === stepIdx ? scenario?.color : "rgba(255,255,255,0.3)", fontWeight: 700, textAlign: "center", lineHeight: 1.2, marginTop: 1 }}>
                {s.name.split(" ")[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Étape courante */}
      {steps[stepIdx] && (
        <div style={{ padding: "8px 14px", background: `${scenario?.color}10`, borderBottom: `1px solid ${scenario?.color}22`, flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: scenario?.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
            🎯 ÉTAPE {stepIdx + 1}/{steps.length} — {steps[stepIdx]?.name}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
            {steps[stepIdx]?.desc}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map((m, i) => (
          <div key={i} style={{
            display: "flex", gap: 8,
            flexDirection: m.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-end",
          }}>
            {m.role === "prospect" && <div style={{ fontSize: 22, flexShrink: 0 }}>{character?.emoji}</div>}
            <div style={{
              maxWidth: "80%",
              padding: "9px 13px",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              fontSize: 13,
              lineHeight: 1.6,
              background: m.role === "user"
                ? `linear-gradient(135deg,${scenario?.color}30,${scenario?.color}15)`
                : "rgba(255,255,255,0.08)",
              border: m.role === "user"
                ? `1px solid ${scenario?.color}44`
                : "1px solid rgba(255,255,255,0.1)",
              color: "white",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={histEndRef} />
      </div>

      {/* Zone micro */}
      <div style={{ padding: "10px 14px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.4)", flexShrink: 0 }}>

        {/* Transcript live */}
        {(isRecording || transcript) && (
          <div style={{ marginBottom: 10, padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 9, color: isRecording ? "#EF4444" : "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 3 }}>
              {isRecording ? "🔴 Enregistrement..." : "Ta voix"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{transcript || "Parle maintenant..."}</div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Bouton micro */}
          <button
            onClick={handleMic}
            disabled={isSpeaking || loading}
            style={{
              width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer",
              fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center",
              background: isRecording
                ? "linear-gradient(135deg,#EF4444,#CC0000)"
                : "linear-gradient(135deg,#FF5C35,#CC2200)",
              boxShadow: isRecording ? "0 0 20px rgba(239,68,68,0.6)" : "0 4px 20px rgba(255,92,53,0.4)",
              opacity: (isSpeaking || loading) ? 0.4 : 1,
              transition: "all .2s",
            }}
          >
            {isRecording ? "⏹️" : isSpeaking ? "👂" : "🎙️"}
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>{micHint}</div>
            {steps[stepIdx] && !isRecording && !loading && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                💡 {steps[stepIdx]?.hint}
              </div>
            )}
          </div>

          <button
            onClick={() => generateDebrief()}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            Finir
          </button>
        </div>
      </div>

      {/* FLASH VALIDATION */}
      {flash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)",
          animation: "fadeIn .15s ease-out",
        }}>
          <div style={{
            padding: "28px 36px",
            borderRadius: 24,
            textAlign: "center",
            background: flash.type === "success"
              ? "linear-gradient(135deg,rgba(34,197,94,0.2),rgba(0,0,0,0.8))"
              : "linear-gradient(135deg,rgba(239,68,68,0.2),rgba(0,0,0,0.8))",
            border: `2px solid ${flash.type === "success" ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.4)"}`,
            boxShadow: `0 0 40px ${flash.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)"}`,
            maxWidth: 300,
          }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>
              {flash.type === "success" ? "✅" : "❌"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "white", marginBottom: 6 }}>
              {flash.type === "success" ? `${flash.stepName} validé !` : `${flash.stepName} — pas encore`}
            </div>
            {flash.type === "success" && (
              <div style={{ fontSize: 20, fontWeight: 900, color: "#FFB800" }}>+{flash.xp} XP ⚡</div>
            )}
            {flash.type === "fail" && flash.formule && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,184,0,0.1)", borderRadius: 10, border: "1px solid rgba(255,184,0,0.3)" }}>
                <div style={{ fontSize: 9, color: "#FFB800", fontWeight: 800, marginBottom: 4 }}>💬 Essaie plutôt</div>
                <div style={{ fontSize: 12, fontStyle: "italic", color: "white" }}>"{flash.formule}"</div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — DEBRIEF
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "debrief" && debrief) {
    const { validated, total, stars, xpEarned, steps: finalSteps } = debrief;
    const starsArr = [0,1,2];

    return (
      <div style={{ minHeight: "100vh", background: "#0F0F13", fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>⚡ Résultats</div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{scenario?.title} · {character?.name}</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>

          {/* Score + étoiles */}
          <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
            <div style={{ fontSize: 56 }}>{character?.emoji}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "16px 0 10px" }}>
              {starsArr.map(i => (
                <div key={i} style={{ fontSize: 40, filter: i < stars ? "none" : "grayscale(1) opacity(0.3)", transition: "all .3s", transitionDelay: `${i * 0.15}s` }}>⭐</div>
              ))}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 6 }}>
              {validated}/{total} étapes validées
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FFB800" }}>+{xpEarned} XP ⚡</div>
          </div>

          {/* Détail étapes */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            {finalSteps.map((s, i) => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderBottom: i < finalSteps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                background: s.validated ? "rgba(34,197,94,0.06)" : "transparent",
              }}>
                <div style={{ fontSize: 20 }}>{s.validated ? "✅" : "❌"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.validated ? "#22C55E" : "rgba(255,255,255,0.5)" }}>{s.icon} {s.name}</div>
                  {s.feedback && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.feedback}</div>}
                </div>
                {s.validated && <div style={{ fontSize: 12, fontWeight: 800, color: "#FFB800" }}>+{s.xp} XP</div>}
              </div>
            ))}
          </div>

          {/* Message selon performance */}
          <div style={{ background: stars === 3 ? "rgba(34,197,94,0.1)" : stars === 2 ? "rgba(255,184,0,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${stars === 3 ? "rgba(34,197,94,0.3)" : stars === 2 ? "rgba(255,184,0,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: stars === 3 ? "#22C55E" : stars === 2 ? "#FFB800" : "#EF4444", marginBottom: 6 }}>
              {stars === 3 ? "🏆 Script parfait !" : stars === 2 ? "💪 Bon travail !" : stars === 1 ? "📚 Continue à t'entraîner" : "🔄 Recommence — c'est comme ça qu'on progresse"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {stars === 3 ? "Toutes les étapes validées — tu maîtrises ce script."
                : stars >= 2 ? "La majorité des étapes passent. Travaille les étapes ratées."
                : "Relis les formules exactes et réessaie — c'est en répétant qu'on ancre."}
            </div>
          </div>

          {/* CTAs */}
          <button onClick={() => startScenario(scenario)} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", background: `linear-gradient(135deg,${scenario?.color},${scenario?.color}cc)`, color: "white", fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 900, cursor: "pointer", marginBottom: 10 }}>
            🔄 Rejouer — autre personnage
          </button>
          <button onClick={() => setPhase("select")} style={{ width: "100%", padding: 13, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
            Choisir un autre scénario
          </button>
          <button onClick={onBack} style={{ width: "100%", padding: 12, borderRadius: 14, border: "none", background: "transparent", color: "rgba(255,255,255,0.3)", fontFamily: "'Sora',sans-serif", fontSize: 12, cursor: "pointer" }}>
            ← Accueil
          </button>
        </div>
      </div>
    );
  }

  return null;
}
