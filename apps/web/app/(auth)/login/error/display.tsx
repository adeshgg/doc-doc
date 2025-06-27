"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Home } from "lucide-react"

export function ErrorDisplay() {
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-red-500">{displayError}</CardTitle>
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

            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href="/" className="flex items-center gap-2">
                <Home className="size-4" />
                Go Home
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
