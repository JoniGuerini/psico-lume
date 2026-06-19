import { Calendar, Home, Inbox, Map, Users, Wallet } from "lucide-react"
import { motion } from "motion/react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  shellChromeEnterTransition,
  shellChromeExitTransition,
  shellChromeSidebarHidden,
  shellChromeVisible,
} from "@/lib/motion-layout"

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Agenda", url: "#", icon: Calendar },
  { title: "Pacientes", url: "#", icon: Users },
  { title: "Financeiro", url: "#", icon: Wallet },
  { title: "Roadmap", url: "#", icon: Map },
]

type AppSidebarProps = {
  activeItem: string
  onSelect: (title: string) => void
  onOpenAccount: () => void
  onLogout: () => void
  chromeEnter?: boolean
  chromeExiting?: boolean
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function AppSidebar({
  activeItem,
  onSelect,
  onOpenAccount,
  onLogout,
  chromeEnter = true,
  chromeExiting = false,
  user,
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <motion.div
        className="flex min-h-0 flex-1 flex-col"
        initial={false}
        animate={
          chromeExiting
            ? shellChromeSidebarHidden
            : chromeEnter
              ? shellChromeVisible
              : shellChromeSidebarHidden
        }
        transition={
          chromeExiting
            ? shellChromeExitTransition
            : shellChromeEnterTransition
        }
      >
        <SidebarHeader className="group-data-[collapsible=icon]:px-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="default"
                tooltip="Lume"
                className="h-14 gap-2 px-3 data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground group-data-[collapsible=icon]:overflow-visible group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center [&_svg]:!size-9"
                onClick={() => onSelect("Home")}
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center group-data-[collapsible=icon]:translate-x-px">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-9 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248z"
                      fill="#a8d5ba"
                    />
                    <path
                      d="M15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1.001a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.717z"
                      fill="#ffffff"
                      opacity="0.28"
                    />
                  </svg>
                </span>
                <span className="truncate font-heading text-lg font-semibold group-data-[collapsible=icon]:hidden">
                  Lume
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={activeItem === item.title}
                    >
                      <a
                        href={item.url}
                        onClick={(event) => {
                          event.preventDefault()
                          onSelect(item.title)
                        }}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={user}
            onOpenAccount={onOpenAccount}
            onLogout={onLogout}
          />
        </SidebarFooter>
      </motion.div>
    </Sidebar>
  )
}
