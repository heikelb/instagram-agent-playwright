import { useState } from 'react';
import { COLORS } from './constants/colors.js';
import HomeScreen from './screens/HomeScreen.jsx';
import ModuleScreen from './screens/ModuleScreen.jsx';
import ExerciseScreen from './screens/ExerciseScreen.jsx';
import VocabScreen from './screens/VocabScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import BottomNav from './components/BottomNav.jsx';

export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeModule, setActiveModule] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [tab, setTab] = useState("home");

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return <HomeScreen setScreen={setScreen} setActiveModule={setActiveModule} setActiveExercise={setActiveExercise} />;
      case "module":
        return <ModuleScreen module={activeModule} setScreen={setScreen} setActiveExercise={setActiveExercise} />;
      case "exercise":
        return <ExerciseScreen exercise={activeExercise} setScreen={setScreen} />;
      case "vocab":
        return <VocabScreen setScreen={setScreen} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen setScreen={setScreen} setActiveModule={setActiveModule} setActiveExercise={setActiveExercise} />;
    }
  };

  const showNav = screen !== "exercise";

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      fontFamily: "'Inter', sans-serif",
    }}>
      {renderScreen()}
      {showNav && <BottomNav tab={tab} setTab={setTab} setScreen={setScreen} />}
    </div>
  );
}
