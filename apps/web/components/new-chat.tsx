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
              className="bg-primary cursor-pointer text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground/90"
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
