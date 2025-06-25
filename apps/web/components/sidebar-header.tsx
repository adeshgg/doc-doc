"use client"

import { Stethoscope } from "lucide-react"

import { SidebarMenu, SidebarMenuItem } from "@workspace/ui/components/sidebar"

export function SidebarHead() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-2 mt-4">
          <div className="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
            <Stethoscope className="size-4 stroke-[2.5px]" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium font-space-grotesk ">
              doc-doc.
            </span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
