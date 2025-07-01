import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Home, TriangleAlert } from "lucide-react"

export default function LoginFirst({ resource }: { resource: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <TriangleAlert className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">
              Unauthorized Access
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-base">
              Sorry, you need to be logged in to access{" "}
              <span className="font-semibold text-blue-500">{resource}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8">
            <div className="grid gap-4">
              <Button asChild className="w-full py-3 text-base font-semibold">
                <a href="/login">Proceed to Login</a>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center p-8 pt-4">
            <p className="text-muted-foreground text-sm">
              Landed here by mistake?
            </p>
            <Button asChild variant="link" className="mt-2">
              <a href="/">
                <Home className="mr-2 h-4 w-4" /> Go back to Homepage
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
