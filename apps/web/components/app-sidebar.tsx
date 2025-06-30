"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { ChatList } from "./chat-list"
import { NavUser } from "./nav-user"
import NewChat from "./new-chat"
import { SidebarHead } from "./sidebar-header"
import { useSession } from "@workspace/api/auth/client"
import { GuestChatList } from "./guest-chat-list"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useSession()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHead />
      </SidebarHeader>
      <SidebarContent>
        <NewChat />
        {data?.user.isGuest ? <GuestChatList /> : <ChatList />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
