"use client"

import { Plus } from "lucide-react"

import { Collapsible } from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"

export default function NewChat() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible
          key={"new-chat"}
          asChild
          defaultOpen={false}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"New Chat"}
              className="cursor-pointer"
              asChild
            >
              <Link href={"/chat"}>
                <Plus />
                <span>{"New Chat"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
