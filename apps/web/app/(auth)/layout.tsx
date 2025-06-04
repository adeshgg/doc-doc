import MaxWidthWrapper from "@/components/max-width-wrapper"
import React from "react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthWrapper className="flex justify-center h-screen items-center">
      {children}
    </MaxWidthWrapper>
  )
}

export default AuthLayout
