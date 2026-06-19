import { useState } from "react"
import { Search } from "lucide-react"

import { AccountDialog } from "@/components/account-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { CalendarPage } from "@/components/calendar-page"
import { FinancePage } from "@/components/finance-page"
import {
  GlobalSearchDialog,
  useGlobalSearchShortcut,
} from "@/components/global-search-dialog"
import { HomePage } from "@/components/home-page"
import { InboxPage } from "@/components/inbox-page"
import { LoginPage } from "@/components/login-page"
import { ClinicExportButton } from "@/components/clinic-export-button"
import { NotificationsBell } from "@/components/notifications-bell"
import { NotificationsPage } from "@/components/notifications-page"
import { ClinicDataProvider } from "@/context/clinic-data-provider"
import { PatientsPage } from "@/components/patients-page"
import { RoadmapPage } from "@/components/roadmap-page"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { GlobalSearchAction } from "@/lib/global-search"

const user = {
  name: "Jonathan Guerini",
  email: "jonathan.guerini@example.com",
  avatar: "",
}

export function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [activeItem, setActiveItem] = useState("Home")
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [patientFocus, setPatientFocus] = useState<{
    id: string
    tab?: "overview" | "sessions" | "records"
  } | null>(null)
  const [eventFocus, setEventFocus] = useState<string | null>(null)
  const [emailFocus, setEmailFocus] = useState<string | null>(null)

  useGlobalSearchShortcut(() => setSearchOpen(true))

  function handleNavigate(page: string) {
    setActiveItem(page)
    setPatientFocus(null)
    setEventFocus(null)
    setEmailFocus(null)
  }

  function handleSearchSelect(action: GlobalSearchAction) {
    switch (action.type) {
      case "navigate":
        handleNavigate(action.page)
        break
      case "patient":
        setPatientFocus({ id: action.patientId, tab: action.tab })
        setEventFocus(null)
        setEmailFocus(null)
        setActiveItem("Pacientes")
        break
      case "event":
        setEventFocus(action.eventId)
        setPatientFocus(null)
        setEmailFocus(null)
        setActiveItem("Agenda")
        break
      case "email":
        setEmailFocus(action.emailId)
        setPatientFocus(null)
        setEventFocus(null)
        setActiveItem("Inbox")
        break
      case "notification":
        setPatientFocus(null)
        setEventFocus(null)
        setEmailFocus(null)
        setActiveItem("Notifications")
        break
    }
  }

  function handleLogout() {
    setAuthenticated(false)
    setActiveItem("Home")
    setPatientFocus(null)
    setEventFocus(null)
    setEmailFocus(null)
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />
  }

  return (
    <ClinicDataProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        <AppSidebar
          activeItem={activeItem}
          onSelect={handleNavigate}
          onOpenAccount={() => setAccountOpen(true)}
          onLogout={handleLogout}
          user={user}
        />
        <SidebarInset className="overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">
              {activeItem === "Notifications" ? "Notificações" : activeItem}
            </h1>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="hidden border-border bg-card shadow-sm hover:bg-accent/50 sm:flex"
                onClick={() => setSearchOpen(true)}
              >
                <Search />
                <span className="text-muted-foreground">Buscar...</span>
                <kbd className="pointer-events-none hidden rounded-md border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline-block">
                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl+"}K
                </kbd>
              </Button>
              <ClinicExportButton />
              <NotificationsBell
                onViewAll={() => handleNavigate("Notifications")}
              />
            </div>
          </header>
          <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
            {activeItem === "Home" ? (
              <HomePage onViewAgenda={() => handleNavigate("Agenda")} />
            ) : null}
            {activeItem === "Inbox" ? (
              <InboxPage initialEmailId={emailFocus} />
            ) : null}
            {activeItem === "Agenda" ? (
              <CalendarPage initialEventId={eventFocus} />
            ) : null}
            {activeItem === "Pacientes" ? (
              <PatientsPage
                initialPatientId={patientFocus?.id ?? null}
                initialProfileTab={patientFocus?.tab ?? "overview"}
              />
            ) : null}
            {activeItem === "Financeiro" ? <FinancePage /> : null}
            {activeItem === "Roadmap" ? <RoadmapPage /> : null}
            {activeItem === "Notifications" ? <NotificationsPage /> : null}
          </main>
        </SidebarInset>

        <GlobalSearchDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSelect={handleSearchSelect}
        />

        <AccountDialog
          user={user}
          open={accountOpen}
          onOpenChange={setAccountOpen}
        />
      </SidebarProvider>
    </ClinicDataProvider>
  )
}

export default App
