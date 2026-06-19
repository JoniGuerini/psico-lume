import { useState } from "react"

import { AccountDialog } from "@/components/account-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { CalendarPage } from "@/components/calendar-page"
import { FinancePage } from "@/components/finance-page"
import { HomePage } from "@/components/home-page"
import { InboxPage } from "@/components/inbox-page"
import { LoginPage } from "@/components/login-page"
import { NotificationsBell } from "@/components/notifications-bell"
import { NotificationsPage } from "@/components/notifications-page"
import { ClinicDataProvider } from "@/context/clinic-data-provider"
import { PatientsPage } from "@/components/patients-page"
import { RoadmapPage } from "@/components/roadmap-page"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const user = {
  name: "Jonathan Guerini",
  email: "jonathan.guerini@example.com",
  avatar: "",
}

export function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [activeItem, setActiveItem] = useState("Home")
  const [accountOpen, setAccountOpen] = useState(false)

  function handleLogout() {
    setAuthenticated(false)
    setActiveItem("Home")
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />
  }

  return (
    <ClinicDataProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        <AppSidebar
          activeItem={activeItem}
          onSelect={setActiveItem}
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
              <NotificationsBell
                onViewAll={() => setActiveItem("Notifications")}
              />
            </div>
          </header>
          <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
            {activeItem === "Home" ? (
              <HomePage onViewAgenda={() => setActiveItem("Agenda")} />
            ) : null}
            {activeItem === "Inbox" ? <InboxPage /> : null}
            {activeItem === "Agenda" ? <CalendarPage /> : null}
            {activeItem === "Pacientes" ? <PatientsPage /> : null}
            {activeItem === "Financeiro" ? <FinancePage /> : null}
            {activeItem === "Roadmap" ? <RoadmapPage /> : null}
            {activeItem === "Notifications" ? <NotificationsPage /> : null}
          </main>
        </SidebarInset>

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
