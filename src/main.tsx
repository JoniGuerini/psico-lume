import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/context/theme-provider"
import { ToastProvider } from "@/context/toast-provider"
import { bootstrapThemeFromStorage } from "@/lib/theme"
import { bootstrapLocaleFromStorage } from "@/lib/locale"
import { LocaleProvider } from "@/context/locale-provider"
import { NotificationPreferencesProvider } from "@/context/notification-preferences-provider"

bootstrapThemeFromStorage()
bootstrapLocaleFromStorage()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleProvider>
      <ThemeProvider>
        <ToastProvider>
          <NotificationPreferencesProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </NotificationPreferencesProvider>
        </ToastProvider>
      </ThemeProvider>
    </LocaleProvider>
  </StrictMode>
)
