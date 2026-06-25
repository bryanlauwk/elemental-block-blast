import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/classic-glass.css";
import "./styles/overhaul-v3.css";
import "./styles/performance.css";
import "./styles/safe-area.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";

createRoot(document.getElementById("root")!).render(<App />);
