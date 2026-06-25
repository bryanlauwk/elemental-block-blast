import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/classic-glass.css";
import "./styles/cube-glass.css";
import "./styles/overhaul-v3.css";
import "./styles/performance.css";
import "./styles/cube-anchor.css";
import "./styles/safe-area.css";
import "@fontsource/abril-fatface/400.css";
import "@fontsource/cabin/400.css";
import "@fontsource/cabin/700.css";

createRoot(document.getElementById("root")!).render(<App />);
