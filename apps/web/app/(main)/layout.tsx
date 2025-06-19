import { AppSidebar } from "@/components/app-sidebar"
import MaxWidthWrapper from "@/components/max-width-wrapper"
import Navbar from "@/components/navbar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SidebarProvider className="flex h-screen w-screen flex-col">
        <AppSidebar />
        <NuqsAdapter>
          <Navbar />
          <MaxWidthWrapper>
            <SidebarInset>
              <SidebarTrigger className="md:-ml-12" />
            </SidebarInset>
            {children}
          </MaxWidthWrapper>
        </NuqsAdapter>
      </SidebarProvider>
    </>
  )
}
