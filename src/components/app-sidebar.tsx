import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Calendar,
  CircleDollarSign,
  FileSpreadsheet,
  Home,
  Inbox,
  Map,
  Users,
  Wallet,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { useTranslation } from "@/context/locale-provider"
import { APP_PAGE_ID, type AppPageId } from "@/lib/app-pages"
import { TOUR_SIDEBAR_TARGETS } from "@/lib/onboarding-tour"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  id: AppPageId
  icon: LucideIcon
}

type NavGroup = {
  labelKey: "nav.groups.geral" | "nav.groups.atendimento" | "nav.groups.financeiro" | "nav.groups.gestao"
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    labelKey: "nav.groups.geral",
    items: [
      { id: APP_PAGE_ID.inicio, icon: Home },
      { id: APP_PAGE_ID.caixaEntrada, icon: Inbox },
    ],
  },
  {
    labelKey: "nav.groups.atendimento",
    items: [
      { id: APP_PAGE_ID.agenda, icon: Calendar },
      { id: APP_PAGE_ID.pacientes, icon: Users },
    ],
  },
  {
    labelKey: "nav.groups.financeiro",
    items: [
      { id: APP_PAGE_ID.aReceber, icon: CircleDollarSign },
      { id: APP_PAGE_ID.financeiro, icon: Wallet },
      { id: APP_PAGE_ID.relatorios, icon: BarChart3 },
    ],
  },
  {
    labelKey: "nav.groups.gestao",
    items: [
      { id: APP_PAGE_ID.dados, icon: FileSpreadsheet },
      { id: APP_PAGE_ID.roteiro, icon: Map },
    ],
  },
]

type AppSidebarProps = {
  activeItem: AppPageId
  onSelect: (pageId: AppPageId) => void
  onOpenAccount: () => void
  onLogout: () => void
  user: {
    name: string
    email: string
    avatar: string
  }
}

function SidebarNavItem({
  item,
  isActive,
  title,
  onSelect,
}: {
  item: NavItem
  isActive: boolean
  title: string
  onSelect: (pageId: AppPageId) => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={title} isActive={isActive}>
        <a
          href="#"
          data-tour={TOUR_SIDEBAR_TARGETS[item.id]}
          onClick={(event) => {
            event.preventDefault()
            onSelect(item.id)
          }}
        >
          <item.icon />
          <span>{title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({
  activeItem,
  onSelect,
  onOpenAccount,
  onLogout,
  user,
}: AppSidebarProps) {
  const { t, pageLabel } = useTranslation()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={t("nav.brand")}
              className="h-14 gap-2 px-3 data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground group-data-[collapsible=icon]:!size-auto group-data-[collapsible=icon]:!h-auto group-data-[collapsible=icon]:!min-h-0 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:overflow-visible group-data-[collapsible=icon]:justify-center [&_svg]:!size-9"
              onClick={() => onSelect(APP_PAGE_ID.inicio)}
            >
              <span className="inline-flex shrink-0 items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="size-9 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248z"
                    fill="var(--theme-logo-mark)"
                  />
                  <path
                    d="M15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1.001a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.717z"
                    fill="#ffffff"
                    opacity="0.28"
                  />
                </svg>
              </span>
              <span className="truncate font-heading text-lg font-semibold group-data-[collapsible=icon]:hidden">
                {t("nav.brand")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarNavItem
                    key={item.id}
                    item={item}
                    title={pageLabel(item.id)}
                    isActive={activeItem === item.id}
                    onSelect={onSelect}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={user}
          onOpenAccount={onOpenAccount}
          onLogout={onLogout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
