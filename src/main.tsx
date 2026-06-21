import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/context/theme-provider"
import { ToastProvider } from "@/context/toast-provider"
import { bootstrapThemeFromStorage } from "@/lib/theme"

bootstrapThemeFromStorage()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
)
