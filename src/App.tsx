import { useState } from "react"
import { Search } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

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
import { LoginFormContent } from "@/components/login-page"
import { LumeNavyGlow } from "@/components/lume-navy-glow"
import { ClinicExportButton } from "@/components/clinic-export-button"
import { ClinicSheetsPage } from "@/components/clinic-sheets-page"
import { NotificationsBell } from "@/components/notifications-bell"
import { NotificationsPage } from "@/components/notifications-page"
import { LoginHeroSlot, ShellLeftRail } from "@/components/shell-left-rail"
import { ClinicDataProvider } from "@/context/clinic-data-provider"
import { PatientsPage } from "@/components/patients-page"
import { ReportsPage } from "@/components/reports-page"
import { RoadmapPage } from "@/components/roadmap-page"
import { UnpaidSessionsPage } from "@/components/unpaid-sessions-page"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { GlobalSearchAction } from "@/lib/global-search"
import {
  LUME_MAIN_SURFACE_CLASS,
  authFadeTransition,
} from "@/lib/motion-layout"
import { cn } from "@/lib/utils"

const user = {
  name: "Jonathan Guerini",
  email: "jonathan.guerini@example.com",
  avatar: "",
}

const fillViewportPages = new Set([
  "Inbox",
  "Agenda",
  "Pacientes",
  "Notifications",
  "Dados",
])

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
  const [openNewPatient, setOpenNewPatient] = useState(false)
  const [openNewSession, setOpenNewSession] = useState(false)
  const [receivablesFilter, setReceivablesFilter] = useState<
    "todas" | "atraso"
  >("todas")
  const [calendarView, setCalendarView] = useState<"mes" | "semana" | "dia">(
    "mes"
  )

  useGlobalSearchShortcut(() => setSearchOpen(true))

  function handleNavigate(page: string) {
    setActiveItem(page)
    setPatientFocus(null)
    setEventFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("mes")
  }

  function handleViewAgendaWeek() {
    setPatientFocus(null)
    setEventFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("semana")
    setActiveItem("Agenda")
  }

  function handleViewReceivables() {
    setPatientFocus(null)
    setEventFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("atraso")
    setActiveItem("A receber")
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
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem("Pacientes")
        break
      case "event":
        setEventFocus(action.eventId)
        setPatientFocus(null)
        setEmailFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem("Agenda")
        break
      case "email":
        setEmailFocus(action.emailId)
        setPatientFocus(null)
        setEventFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem("Inbox")
        break
      case "notification":
        setPatientFocus(null)
        setEventFocus(null)
        setEmailFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem("Notifications")
        break
      case "quick":
        setPatientFocus(null)
        setEventFocus(null)
        setEmailFocus(null)
        if (action.id === "new-patient") {
          setOpenNewSession(false)
          setOpenNewPatient(true)
          setActiveItem("Pacientes")
        } else if (action.id === "new-session") {
          setOpenNewPatient(false)
          setOpenNewSession(true)
          setActiveItem("Agenda")
        }
        break
    }
  }

  function handleLogin() {
    setAuthenticated(true)
  }

  function handleLogout() {
    setAuthenticated(false)
    setActiveItem("Home")
    setPatientFocus(null)
    setEventFocus(null)
    setEmailFocus(null)
    setAccountOpen(false)
    setSearchOpen(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 isolate overflow-hidden bg-sidebar">
        <LumeNavyGlow fixed />
        <ClinicDataProvider>
          <SidebarProvider
            showGlow={false}
            className="relative z-10 h-svh overflow-hidden !bg-transparent"
          >
            <AnimatePresence mode="wait" initial={false}>
              {!authenticated ? (
                <motion.div
                  key="login-shell"
                  className="flex h-svh min-h-0 w-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={authFadeTransition}
                >
                  <ShellLeftRail>
                    <LoginHeroSlot />
                  </ShellLeftRail>
                  <main
                    data-slot="sidebar-inset"
                    className={LUME_MAIN_SURFACE_CLASS}
                  >
                    <LoginFormContent onLogin={handleLogin} />
                  </main>
                </motion.div>
              ) : (
                <motion.div
                  key="app-shell"
                  className="flex h-svh min-h-0 w-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={authFadeTransition}
                >
                  <AppSidebar
                    activeItem={activeItem}
                    onSelect={handleNavigate}
                    onOpenAccount={() => setAccountOpen(true)}
                    onLogout={handleLogout}
                    user={user}
                  />
                  <main
                    data-slot="sidebar-inset"
                    className={LUME_MAIN_SURFACE_CLASS}
                  >
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                      <SidebarTrigger className="-ml-1" />
                      <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                      />
                      <h1 className="text-base font-medium">
                        {activeItem === "Notifications"
                          ? "Notificações"
                          : activeItem}
                      </h1>
                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full border-border bg-card shadow-sm hover:bg-accent/50"
                          onClick={() => setSearchOpen(true)}
                          aria-label="Busca global"
                        >
                          <Search />
                        </Button>
                        <ClinicExportButton
                          onViewSheets={() => handleNavigate("Dados")}
                        />
                        <NotificationsBell
                          onViewAll={() => handleNavigate("Notifications")}
                        />
                      </div>
                    </header>
                    <main
                      className={cn(
                        "flex min-h-0 flex-1 flex-col gap-4 p-4",
                        fillViewportPages.has(activeItem)
                          ? "overflow-hidden"
                          : "overflow-y-auto overscroll-contain"
                      )}
                    >
                      {activeItem === "Home" ? (
                        <HomePage
                          onViewAgenda={() => handleNavigate("Agenda")}
                          onViewPatients={() => handleNavigate("Pacientes")}
                          onViewAgendaWeek={handleViewAgendaWeek}
                          onViewReceivables={handleViewReceivables}
                        />
                      ) : null}
                      {activeItem === "Inbox" ? (
                        <InboxPage initialEmailId={emailFocus} />
                      ) : null}
                      {activeItem === "Agenda" ? (
                        <CalendarPage
                          initialEventId={eventFocus}
                          initialView={calendarView}
                          openNewSession={openNewSession}
                          onNewSessionOpenChange={setOpenNewSession}
                        />
                      ) : null}
                      {activeItem === "Pacientes" ? (
                        <PatientsPage
                          initialPatientId={patientFocus?.id ?? null}
                          initialProfileTab={patientFocus?.tab ?? "overview"}
                          openNewPatient={openNewPatient}
                          onNewPatientOpenChange={setOpenNewPatient}
                        />
                      ) : null}
                      {activeItem === "Financeiro" ? <FinancePage /> : null}
                      {activeItem === "Relatórios" ? <ReportsPage /> : null}
                      {activeItem === "Dados" ? <ClinicSheetsPage /> : null}
                      {activeItem === "A receber" ? (
                        <UnpaidSessionsPage
                          initialFilter={receivablesFilter}
                          onOpenPatient={(patientId) => {
                            setPatientFocus({ id: patientId })
                            setActiveItem("Pacientes")
                          }}
                        />
                      ) : null}
                      {activeItem === "Roadmap" ? <RoadmapPage /> : null}
                      {activeItem === "Notifications" ? (
                        <NotificationsPage />
                      ) : null}
                    </main>
                  </main>

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
                </motion.div>
              )}
            </AnimatePresence>
          </SidebarProvider>
        </ClinicDataProvider>
      </div>
    </MotionConfig>
  )
}

export default App
