import { Stethoscope } from "lucide-react"

import { LoginForm } from "@/components/auth-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href="/"
          className="flex font-space-grotesk items-center gap-2 self-center font-medium"
        >
          <div className="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
            <Stethoscope className="size-4 stroke-[2.5px]" />
          </div>
          doc-doc.
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
