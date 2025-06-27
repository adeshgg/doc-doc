"use client"

import { cn } from "@workspace/ui/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Icons } from "@workspace/ui/components/icons"
import { UserRound } from "lucide-react"
import { signIn } from "@workspace/api/auth/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleGuestSignIn() {
    const { error } = await signIn.email(
      {
        email: process.env.NEXT_PUBLIC_GUEST_EMAIL!,
        password: process.env.NEXT_PUBLIC_GUEST_PASSWORD!,
      },
      {
        onRequest: () => {
          setIsLoading(true)
        },
        onSuccess: () => {
          setIsLoading(false)
          router.push("/")
        },
        onError: () => {
          setIsLoading(false)
        },
      }
    )

    if (error && error.message) {
      toast.error(error.message)
    }
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    const { error } = await signIn.social({
      provider,
    })

    if (error && error.message) {
      toast.error(error.message)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Github or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleSocialSignIn("github")}
                  disabled={isLoading}
                >
                  <Icons.gitHub />
                  Login with Github
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleSocialSignIn("google")}
                  disabled={isLoading}
                >
                  <Icons.google />
                  Login with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue as
                </span>
              </div>
              <div className="grid gap-6">
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleGuestSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <UserRound />
                      Guest
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {/* By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>. */}
        We highly recommend you to sign in with one of the social provider for
        the complete experience
      </div>
    </div>
  )
}
