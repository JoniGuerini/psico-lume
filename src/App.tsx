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
import {
  ClinicDataProvider,
  type ClinicDataMode,
} from "@/context/clinic-data-provider"
import { PatientsPage } from "@/components/patients-page"
import { ReportsPage } from "@/components/reports-page"
import { RoadmapPage } from "@/components/roadmap-page"
import { UnpaidSessionsPage } from "@/components/unpaid-sessions-page"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { GlobalSearchAction } from "@/lib/global-search"
import {
  authSessionToUser,
  clearAuthSession,
  persistAuthSession,
  readAuthSession,
  type AuthSession,
} from "@/lib/auth-session"
import { persistGuestProfileName, clearGuestLocalData } from "@/lib/guest-clinic-storage"
import {
  LUME_MAIN_SURFACE_CLASS,
  authFadeTransition,
} from "@/lib/motion-layout"
import { APP_PAGE, FILL_VIEWPORT_PAGES, type AppPage } from "@/lib/app-pages"
import { cn } from "@/lib/utils"

export function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    readAuthSession()
  )
  const authenticated = authSession !== null
  const clinicMode: ClinicDataMode =
    authSession?.mode === "guest" ? "guest" : "demo"
  const user = authSession
    ? authSessionToUser(authSession)
    : authSessionToUser({ mode: "demo" })
  const [activeItem, setActiveItem] = useState<AppPage>(APP_PAGE.inicio)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [patientFocus, setPatientFocus] = useState<{
    id: string
    tab?: "overview" | "sessions" | "records"
  } | null>(null)
  const [emailFocus, setEmailFocus] = useState<string | null>(null)
  const [openNewPatient, setOpenNewPatient] = useState(false)
  const [openNewSession, setOpenNewSession] = useState(false)
  const [receivablesFilter, setReceivablesFilter] = useState<
    "todas" | "atraso"
  >("todas")
  const [calendarView, setCalendarView] = useState<"mes" | "semana" | "dia">(
    "mes"
  )
  const [calendarDateFocus, setCalendarDateFocus] = useState<number | null>(
    null
  )

  useGlobalSearchShortcut(() => setSearchOpen(true))

  function handleNavigate(page: AppPage) {
    setActiveItem(page)
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("mes")
    setCalendarDateFocus(null)
  }

  function handleViewAgendaWeek() {
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("semana")
    setActiveItem(APP_PAGE.agenda)
  }

  function handleViewReceivables() {
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("atraso")
    setActiveItem(APP_PAGE.aReceber)
  }

  function handleOpenAgendaDay(date: Date) {
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("dia")
    setCalendarDateFocus(date.getTime())
    setActiveItem(APP_PAGE.agenda)
  }

  function handleSearchSelect(action: GlobalSearchAction) {
    switch (action.type) {
      case "navigate":
        handleNavigate(action.page)
        break
      case "patient":
        setPatientFocus({ id: action.patientId, tab: action.tab })
        setEmailFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem(APP_PAGE.pacientes)
        break
      case "event":
        handleOpenAgendaDay(new Date(action.dateTimestamp))
        break
      case "email":
        setEmailFocus(action.emailId)
        setPatientFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem(APP_PAGE.caixaEntrada)
        break
      case "notification":
        setPatientFocus(null)
        setEmailFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem(APP_PAGE.notificacoes)
        break
      case "quick":
        setPatientFocus(null)
        setEmailFocus(null)
        if (action.id === "new-patient") {
          setOpenNewSession(false)
          setOpenNewPatient(true)
          setActiveItem(APP_PAGE.pacientes)
        } else if (action.id === "new-session") {
          setOpenNewPatient(false)
          setOpenNewSession(true)
          setActiveItem(APP_PAGE.agenda)
        }
        break
    }
  }

  function handleLoginDemo() {
    const session: AuthSession = { mode: "demo" }
    persistAuthSession(session)
    setAuthSession(session)
  }

  function handleLoginGuest(name: string) {
    persistGuestProfileName(name)
    const session: AuthSession = { mode: "guest", name: name.trim() }
    persistAuthSession(session)
    setAuthSession(session)
  }

  function handleLogout() {
    clearAuthSession()
    setAuthSession(null)
    setActiveItem(APP_PAGE.inicio)
    setPatientFocus(null)
    setEmailFocus(null)
    setAccountOpen(false)
    setSearchOpen(false)
  }

  function handleUpdateGuestProfile(name: string) {
    const trimmed = name.trim()
    persistGuestProfileName(trimmed)
    const session: AuthSession = { mode: "guest", name: trimmed }
    persistAuthSession(session)
    setAuthSession(session)
  }

  function handleDeleteGuestProfile() {
    clearGuestLocalData()
    handleLogout()
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 isolate overflow-hidden bg-sidebar">
        <LumeNavyGlow fixed />
        <ClinicDataProvider mode={clinicMode} key={clinicMode}>
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
                    <LoginFormContent
                      onLoginDemo={handleLoginDemo}
                      onLoginGuest={handleLoginGuest}
                    />
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
                      <h1 className="text-base font-medium">{activeItem}</h1>
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
                          onViewSheets={() => handleNavigate(APP_PAGE.dados)}
                        />
                        <NotificationsBell
                          onViewAll={() => handleNavigate(APP_PAGE.notificacoes)}
                        />
                      </div>
                    </header>
                    <main
                      className={cn(
                        "flex min-h-0 flex-1 flex-col p-4 gap-[var(--density-page-gap)]",
                        FILL_VIEWPORT_PAGES.has(activeItem)
                          ? "overflow-hidden"
                          : "overflow-y-auto overscroll-contain"
                      )}
                    >
                      {activeItem === APP_PAGE.inicio ? (
                        <HomePage
                          onViewAgenda={() => handleNavigate(APP_PAGE.agenda)}
                          onViewPatients={() => handleNavigate(APP_PAGE.pacientes)}
                          onViewAgendaWeek={handleViewAgendaWeek}
                          onViewReceivables={handleViewReceivables}
                          onOpenAgendaDay={handleOpenAgendaDay}
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE.pacientes)
                          }}
                        />
                      ) : null}
                      {activeItem === APP_PAGE.caixaEntrada ? (
                        <InboxPage initialEmailId={emailFocus} />
                      ) : null}
                      {activeItem === APP_PAGE.agenda ? (
                        <CalendarPage
                          initialSelectedDateTimestamp={calendarDateFocus}
                          initialView={calendarView}
                          openNewSession={openNewSession}
                          onNewSessionOpenChange={setOpenNewSession}
                        />
                      ) : null}
                      {activeItem === APP_PAGE.pacientes ? (
                        <PatientsPage
                          initialPatientId={patientFocus?.id ?? null}
                          initialProfileTab={patientFocus?.tab ?? "overview"}
                          openNewPatient={openNewPatient}
                          onNewPatientOpenChange={setOpenNewPatient}
                        />
                      ) : null}
                      {activeItem === APP_PAGE.financeiro ? (
                        <FinancePage
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE.pacientes)
                          }}
                        />
                      ) : null}
                      {activeItem === APP_PAGE.relatorios ? (
                        <ReportsPage
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE.pacientes)
                          }}
                        />
                      ) : null}
                      {activeItem === APP_PAGE.dados ? <ClinicSheetsPage /> : null}
                      {activeItem === APP_PAGE.aReceber ? (
                        <UnpaidSessionsPage
                          initialFilter={receivablesFilter}
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE.pacientes)
                          }}
                          onOpenPatient={(patientId) => {
                            setPatientFocus({ id: patientId })
                            setActiveItem(APP_PAGE.pacientes)
                          }}
                        />
                      ) : null}
                      {activeItem === APP_PAGE.roteiro ? <RoadmapPage /> : null}
                      {activeItem === APP_PAGE.notificacoes ? (
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
                    isGuest={authSession?.mode === "guest"}
                    onUpdateGuestProfile={handleUpdateGuestProfile}
                    onDeleteGuestProfile={handleDeleteGuestProfile}
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
