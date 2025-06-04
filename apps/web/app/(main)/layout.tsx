import MaxWidthWrapper from "@/components/max-width-wrapper"
import Navbar from "@/components/navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </>
  )
}
