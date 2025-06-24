"use client"

import { signOut, useSession } from "@workspace/api/auth/client"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  const { data: session, isPending } = useSession()

  const router = useRouter()

  return (
    <nav>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex flex-shrink-0 items-center">
            <Link href="/">
              <h1 className="font-space-grotesk scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                doc-doc.
              </h1>
            </Link>
          </div>
          <div className="ml-6 flex gap-4 items-center">
            <ModeToggle />
            {isPending ? (
              <Skeleton className="h-10 w-20" />
            ) : session?.user ? (
              <Button
                className="cursor-pointer"
                onClick={async () =>
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/login")
                      },
                    },
                  })
                }
              >
                Logout
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
