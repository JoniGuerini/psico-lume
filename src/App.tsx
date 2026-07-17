import { useState } from "react"
import { Search } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { AccountDialog } from "@/components/account-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { CalendarPage, SESSION_FORM_DOCK_COLUMN_CLASS, SESSION_FORM_DOCK_PREVIEW_EXTRA_CLASS } from "@/components/calendar-page"
import { FinancePage } from "@/components/finance-page"
import {
  GlobalSearchDialog,
} from "@/components/global-search-dialog"
import { HomePage } from "@/components/home-page"
import { InboxPage } from "@/components/inbox-page"
import { LoginFormContent } from "@/components/login-page"
import { LumeNavyGlow } from "@/components/lume-navy-glow"
import { ClinicSheetsPage } from "@/components/clinic-sheets-page"
import { NotificationsBell } from "@/components/notifications-bell"
import { NotificationsPage } from "@/components/notifications-page"
import { OnboardingTourOverlay } from "@/components/onboarding-tour"
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
import {
  APP_PAGE_ID,
  FILL_VIEWPORT_PAGE_IDS,
  IS_ROADMAP_VISIBLE,
  type AppPageId,
} from "@/lib/app-pages"
import { useTranslation } from "@/context/locale-provider"
import { OnboardingTourProvider } from "@/context/onboarding-tour-provider"
import { useGlobalSearchShortcut } from "@/hooks/use-global-search-shortcut"
import { cn } from "@/lib/utils"

export function App() {
  const { pageLabel, t } = useTranslation()
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    readAuthSession()
  )
  const authenticated = authSession !== null
  const clinicMode: ClinicDataMode =
    authSession?.mode === "guest" ? "guest" : "demo"
  const user = authSession
    ? authSessionToUser(authSession)
    : authSessionToUser({ mode: "demo" })
  const [activeItem, setActiveItem] = useState<AppPageId>(APP_PAGE_ID.inicio)
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
    "semana"
  )
  const [calendarDateFocus, setCalendarDateFocus] = useState<number | null>(
    null
  )
  const [sessionFormDocked, setSessionFormDocked] = useState(false)
  const [sessionFormDockPreview, setSessionFormDockPreview] = useState(false)

  useGlobalSearchShortcut(() => setSearchOpen(true))

  function handleNavigate(page: AppPageId) {
    setActiveItem(page)
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("semana")
    setCalendarDateFocus(null)
    setSessionFormDocked(false)
    setSessionFormDockPreview(false)
  }

  function handleViewAgendaWeek() {
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("semana")
    setActiveItem(APP_PAGE_ID.agenda)
  }

  function handleViewReceivables() {
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("atraso")
    setActiveItem(APP_PAGE_ID.aReceber)
  }

  function handleOpenAgendaDay(date: Date) {
    setPatientFocus(null)
    setEmailFocus(null)
    setOpenNewPatient(false)
    setOpenNewSession(false)
    setReceivablesFilter("todas")
    setCalendarView("dia")
    setCalendarDateFocus(date.getTime())
    setActiveItem(APP_PAGE_ID.agenda)
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
        setActiveItem(APP_PAGE_ID.pacientes)
        break
      case "event":
        handleOpenAgendaDay(new Date(action.dateTimestamp))
        break
      case "email":
        setEmailFocus(action.emailId)
        setPatientFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem(APP_PAGE_ID.caixaEntrada)
        break
      case "notification":
        setPatientFocus(null)
        setEmailFocus(null)
        setOpenNewPatient(false)
        setOpenNewSession(false)
        setActiveItem(APP_PAGE_ID.notificacoes)
        break
      case "quick":
        setPatientFocus(null)
        setEmailFocus(null)
        if (action.id === "new-patient") {
          setOpenNewSession(false)
          setOpenNewPatient(true)
          setActiveItem(APP_PAGE_ID.pacientes)
        } else if (action.id === "new-session") {
          setOpenNewPatient(false)
          setOpenNewSession(true)
          setActiveItem(APP_PAGE_ID.agenda)
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
    setActiveItem(APP_PAGE_ID.inicio)
    setPatientFocus(null)
    setEmailFocus(null)
    setAccountOpen(false)
    setSearchOpen(false)
    setSessionFormDocked(false)
    setSessionFormDockPreview(false)
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
                <OnboardingTourProvider
                  activePage={activeItem}
                  authenticated={authenticated}
                  onNavigate={handleNavigate}
                  onCloseAccount={() => setAccountOpen(false)}
                >
                <motion.div
                  key="app-shell"
                  className="flex h-svh min-h-0 w-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={authFadeTransition}
                >
                  {sessionFormDocked ? (
                    <div
                      data-session-form-dock-slot
                      className={cn(
                        "hidden shrink-0 md:block",
                        SESSION_FORM_DOCK_COLUMN_CLASS
                      )}
                      aria-hidden
                    />
                  ) : (
                    <>
                      <div
                        className={cn(
                          "hidden shrink-0 md:block",
                          "transition-opacity duration-200 ease-out",
                          sessionFormDockPreview &&
                            "pointer-events-none opacity-0"
                        )}
                      >
                        <AppSidebar
                          activeItem={activeItem}
                          onSelect={handleNavigate}
                          onOpenAccount={() => setAccountOpen(true)}
                          user={user}
                        />
                      </div>
                      <div
                        data-session-form-dock-slot={
                          sessionFormDockPreview ? "" : undefined
                        }
                        className={cn(
                          "hidden shrink-0 overflow-hidden md:block",
                          "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          sessionFormDockPreview
                            ? SESSION_FORM_DOCK_PREVIEW_EXTRA_CLASS
                            : "w-0"
                        )}
                        aria-hidden
                      />
                    </>
                  )}
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
                      <h1 className="text-base font-medium">{pageLabel(activeItem)}</h1>
                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          data-tour="header-search"
                          className="rounded-full border-border bg-card shadow-sm hover:bg-accent/50"
                          onClick={() => setSearchOpen(true)}
                          aria-label={t("common.globalSearch")}
                        >
                          <Search />
                        </Button>
                        <NotificationsBell
                          onViewAll={() => handleNavigate(APP_PAGE_ID.notificacoes)}
                        />
                      </div>
                    </header>
                    <main
                      className={cn(
                        "flex min-h-0 flex-1 flex-col p-4 gap-[var(--density-page-gap)]",
                        FILL_VIEWPORT_PAGE_IDS.has(activeItem)
                          ? "overflow-hidden"
                          : "overflow-x-hidden overflow-y-auto overscroll-contain"
                      )}
                    >
                      {activeItem === APP_PAGE_ID.inicio ? (
                        <HomePage
                          onViewAgenda={() => handleNavigate(APP_PAGE_ID.agenda)}
                          onViewPatients={() => handleNavigate(APP_PAGE_ID.pacientes)}
                          onViewAgendaWeek={handleViewAgendaWeek}
                          onViewReceivables={handleViewReceivables}
                          onOpenAgendaDay={handleOpenAgendaDay}
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE_ID.pacientes)
                          }}
                        />
                      ) : null}
                      {activeItem === APP_PAGE_ID.caixaEntrada ? (
                        <InboxPage
                          key={emailFocus ?? "inbox"}
                          initialEmailId={emailFocus}
                        />
                      ) : null}
                      {activeItem === APP_PAGE_ID.agenda ? (
                        <CalendarPage
                          key={`${calendarView}-${calendarDateFocus ?? "today"}`}
                          initialSelectedDateTimestamp={calendarDateFocus}
                          initialView={calendarView}
                          openNewSession={openNewSession}
                          onNewSessionOpenChange={(open) => {
                            setOpenNewSession(open)
                            if (!open) {
                              setSessionFormDocked(false)
                              setSessionFormDockPreview(false)
                            }
                          }}
                          onSessionFormDockedChange={setSessionFormDocked}
                          onSessionFormDockPreviewChange={
                            setSessionFormDockPreview
                          }
                        />
                      ) : null}
                      {activeItem === APP_PAGE_ID.pacientes ? (
                        <PatientsPage
                          key={`${patientFocus?.id ?? "list"}-${patientFocus?.tab ?? "overview"}`}
                          initialPatientId={patientFocus?.id ?? null}
                          initialProfileTab={patientFocus?.tab ?? "overview"}
                          openNewPatient={openNewPatient}
                          onNewPatientOpenChange={setOpenNewPatient}
                        />
                      ) : null}
                      {activeItem === APP_PAGE_ID.financeiro ? (
                        <FinancePage
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE_ID.pacientes)
                          }}
                        />
                      ) : null}
                      {activeItem === APP_PAGE_ID.relatorios ? (
                        <ReportsPage
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE_ID.pacientes)
                          }}
                        />
                      ) : null}
                      {activeItem === APP_PAGE_ID.dados ? <ClinicSheetsPage /> : null}
                      {activeItem === APP_PAGE_ID.aReceber ? (
                        <UnpaidSessionsPage
                          key={receivablesFilter}
                          initialFilter={receivablesFilter}
                          onNewPatient={() => {
                            setOpenNewPatient(true)
                            setActiveItem(APP_PAGE_ID.pacientes)
                          }}
                          onOpenPatient={(patientId) => {
                            setPatientFocus({ id: patientId })
                            setActiveItem(APP_PAGE_ID.pacientes)
                          }}
                        />
                      ) : null}
                      {IS_ROADMAP_VISIBLE && activeItem === APP_PAGE_ID.roteiro ? (
                        <RoadmapPage />
                      ) : null}
                      {activeItem === APP_PAGE_ID.notificacoes ? (
                        <NotificationsPage />
                      ) : null}
                    </main>
                  </main>

                  <GlobalSearchDialog
                    open={searchOpen}
                    onOpenChange={setSearchOpen}
                    onSelect={handleSearchSelect}
                  />

                  {accountOpen ? (
                    <AccountDialog
                      user={user}
                      open
                      onOpenChange={setAccountOpen}
                      isGuest={authSession?.mode === "guest"}
                      onUpdateGuestProfile={handleUpdateGuestProfile}
                      onDeleteGuestProfile={handleDeleteGuestProfile}
                      onLogout={handleLogout}
                    />
                  ) : null}

                  <OnboardingTourOverlay />
                </motion.div>
                </OnboardingTourProvider>
              )}
            </AnimatePresence>
          </SidebarProvider>
        </ClinicDataProvider>
      </div>
    </MotionConfig>
  )
}

export default App
