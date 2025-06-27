"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Home, Stethoscope } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Format error for display
  const formatError = (error: string) => {
    return error
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const displayError = error ? formatError(error) : "Authentication Error"
  const hasDescription =
    errorDescription &&
    errorDescription !== "undefined" &&
    errorDescription.trim() !== ""

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

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-500">
              {displayError}
            </CardTitle>
            {hasDescription && (
              <CardDescription className="text-muted-foreground">
                {errorDescription}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <p className="text-center text-sm text-muted-foreground">
                Something went wrong during authentication. Please try again or
                contact support if the problem persists.
              </p>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <a href="/login">Try Again</a>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="w-full bg-transparent"
                >
                  <a href="/" className="flex items-center gap-2">
                    <Home className="size-4" />
                    Go Home
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          Need help? <a href="mailto:hi.adeshgg@gmail.com">Contact Support</a>
        </div>
      </div>
    </div>
  )
}
