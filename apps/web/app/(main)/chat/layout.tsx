import { AppSidebar } from "@/components/app-sidebar"
import { LoginForm } from "@/components/auth-form"
import { auth } from "@workspace/api/auth"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { headers } from "next/headers"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <LoginForm isUnauthorized redirectTo="chat" resource="Chat" />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 md:-ml-20" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="font-bold">Chats</div>
          </div>
        </header>
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
