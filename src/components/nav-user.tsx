import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
  onOpenAccount: () => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function NavUser({ user, onOpenAccount }: NavUserProps) {
  const initials = getInitials(user.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={user.name}
          data-tour="nav-account"
          className="group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!gap-0 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center"
          onClick={onOpenAccount}
        >
          <Avatar className="size-8 shrink-0 rounded-lg after:rounded-lg">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              className="rounded-lg"
            />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight transition-[opacity,width] duration-200 ease-out group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:min-w-0 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden">
            <span className="truncate font-semibold whitespace-nowrap">
              {user.name}
            </span>
            <span className="truncate text-xs whitespace-nowrap text-sidebar-foreground/70">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
