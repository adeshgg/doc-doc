import MaxWidthWrapper from "@/components/max-width-wrapper"
import Navbar from "@/components/navbar"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NuqsAdapter>
      <Navbar />
      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </NuqsAdapter>
  )
}
