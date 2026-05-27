/**
 * App.jsx — Éloquence v2.0
 * Navigation par phase (useState) — zéro React Router
 */

import { useState } from "react";
import { COLORS } from "./constants/colors";

// Écrans existants
import HomeScreen      from "./screens/HomeScreen";
import ModuleScreen    from "./screens/ModuleScreen";
import ExerciseScreen  from "./screens/ExerciseScreen";
import VocabScreen     from "./screens/VocabScreen";
import ProfileScreen   from "./screens/ProfileScreen";

// Nouveaux écrans
import RolePlayVocalScreen from "./screens/RolePlayVocalScreen";
import SkillsPathScreen    from "./screens/SkillsPathScreen";

export default function App() {
  const [screen, setScreen]           = useState("home");
  const [xpTotal, setXpTotal]         = useState(0);
  const [skillScores, setSkillScores] = useState({}); // { "P1.3": 80, ... }
  const [selectedModule, setSelectedModule] = useState(null);

  const addXP = (xp) => setXpTotal(prev => prev + xp);

  const updateSkillScore = (skillId, score) => {
    setSkillScores(prev => ({ ...prev, [skillId]: Math.max(prev[skillId] || 0, score) }));
  };

  // ── ROUTING ─────────────────────────────────────────────────────────────────
  if (screen === "roleplay-vocal") return (
    <RolePlayVocalScreen
      onBack={() => setScreen("home")}
      onXPGain={addXP}
    />
  );

  if (screen === "skills-path") return (
    <SkillsPathScreen
      onBack={() => setScreen("home")}
      skillScores={skillScores}
      onSkillScoreUpdate={updateSkillScore}
    />
  );

  if (screen === "module" && selectedModule) return (
    <ModuleScreen
      module={selectedModule}
      onBack={() => setScreen("home")}
      onXPGain={addXP}
    />
  );

  if (screen === "exercise") return (
    <ExerciseScreen
      onBack={() => setScreen("home")}
      onXPGain={addXP}
    />
  );

  if (screen === "vocab") return (
    <VocabScreen
      onBack={() => setScreen("home")}
      onXPGain={addXP}
    />
  );

  if (screen === "profile") return (
    <ProfileScreen
      xpTotal={xpTotal}
      skillScores={skillScores}
      onBack={() => setScreen("home")}
    />
  );

  // ── HOME ─────────────────────────────────────────────────────────────────────
  return (
    <HomeScreen
      xpTotal={xpTotal}
      onNavigate={(target, payload) => {
        if (target === "module" && payload) setSelectedModule(payload);
        setScreen(target);
      }}
    />
  );
}
