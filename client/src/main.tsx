import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

const App = lazy(() => import("./App.tsx"));

// Ensure global exists in browser for libs that expect Node's global
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
	(window as any).global = window;
}

const requiredEnvVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;
const missingEnvVars = requiredEnvVars.filter((key) => !import.meta.env[key]);

const MissingEnvScreen = ({ missing }: { missing: readonly string[] }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Configuration required</h1>
      <p className="text-gray-700 mb-4">
        This deployment is missing required environment variables. Add these in your hosting
        provider and redeploy.
      </p>
      <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
        {missing.map((key) => (
          <li key={key}>{key}</li>
        ))}
      </ul>
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  missingEnvVars.length > 0 ? (
    <MissingEnvScreen missing={missingEnvVars} />
  ) : (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </ErrorBoundary>
  )
);
