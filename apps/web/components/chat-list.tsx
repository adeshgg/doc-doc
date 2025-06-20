"use client"

import { useTRPC } from "@/trpc/react"
import { useQuery } from "@tanstack/react-query"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"

export function ChatList() {
  const trpc = useTRPC()

  const { data: chats, status } = useQuery(
    trpc.chat.getChatsByUserId.queryOptions()
  )

  if (status === "pending") {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>Loading chats...</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {chats?.map(item => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link href={`/chat/${item.id}`}>
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
