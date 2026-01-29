import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure global exists in browser for libs that expect Node's global
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
	(window as any).global = window;
}

createRoot(document.getElementById("root")!).render(<App />);
