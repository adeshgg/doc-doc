import React, { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Separator } from "@workspace/ui/components/separator"
import { Icons } from "@workspace/ui/components/icons"
import { signIn } from "@workspace/api/auth/client"

// Form variants
type AuthFormVariant = "signin" | "signup"

// Data type definitions
interface BaseAuthData {
  email: string
  password: string
}

interface SignInData extends BaseAuthData {
  // Sign-in only needs email and password from base
}

interface SignUpData extends BaseAuthData {
  name: string
}

type AuthData = SignInData | SignUpData

interface AuthFormProps {
  variant?: AuthFormVariant
  onSubmit: (
    data: AuthData,
    callbacks: {
      onRequest: () => void
      onSuccess: () => void
      onError: (error: Error) => void
    }
  ) => void
  onForgotPassword?: (
    email: string,
    callbacks: {
      onRequest: () => void
      onSuccess: () => void
      onError: (error: Error) => void
    }
  ) => void
}

const AuthForm: React.FC<AuthFormProps> = ({
  variant = "signin",
  onSubmit,
  onForgotPassword = (email, { onRequest, onSuccess }) => {
    onRequest()
    console.log("Forgot password for:", email)
    onSuccess()
  },
}) => {
  const [activeTab, setActiveTab] = useState<AuthFormVariant>(variant)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const callbacks = {
      onRequest: () => {
        setIsLoading(true)
      },
      onSuccess: () => {
        setIsLoading(false)
        console.log("Aap mumbai aa sakte hai :)")
        // Reset form on success if needed
        // resetForm()
      },
      onError: (error: Error) => {
        setIsLoading(false)
        setError(error.message)
      },
    }

    if (activeTab === "signup") {
      const signUpData: SignUpData = { name, email, password }
      onSubmit(signUpData, callbacks)
    } else {
      const signInData: SignInData = { email, password }
      onSubmit(signInData, callbacks)
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const callbacks = {
      onRequest: () => {
        setIsLoading(true)
      },
      onSuccess: () => {
        setIsLoading(false)
        // Show success message or navigate away
      },
      onError: (error: Error) => {
        setIsLoading(false)
        setError(error.message)
      },
    }

    onForgotPassword(email, callbacks)
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    const { error } = await signIn.social({
      provider,
    })
    // Show an error toast
    console.log("error", error)
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setError(null)
  }

  // const handleForgotPasswordClick = (e: React.MouseEvent) => {
  //   e.preventDefault()
  //   setShowForgotPassword(true)
  //   setError(null)
  // }

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {error && <div className="text-sm text-red-500 pt-1">{error}</div>}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full"
            onClick={() => {
              setShowForgotPassword(false)
              setError(null)
            }}
            type="button"
          >
            Back to login
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {activeTab === "signin" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription className="text-center">
          {activeTab === "signin"
            ? "Enter your credentials to sign in to your account"
            : "Fill in your details to create a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={variant}
          value={activeTab}
          onValueChange={value => {
            setActiveTab(value as AuthFormVariant)
            resetForm()
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 h-11">
            <TabsTrigger value="signin" className="h-full cursor-pointer">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="h-full cursor-pointer">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  {/* Not implementing now: need resend */}
                  {/* <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={handleForgotPasswordClick}
                    type="button"
                  >
                    Forgot password?
                  </Button> */}
                </div>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Not implementing right now */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialSignIn("google")}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialSignIn("github")}
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuthForm
