import MaxWidthWrapper from "@/components/max-width-wrapper"
import React from "react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthWrapper className="flex h-screen items-center justify-center">
      {children}
    </MaxWidthWrapper>
  )
}

export default AuthLayout
