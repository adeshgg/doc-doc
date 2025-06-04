import { ClientGreeting } from "./client-greeting"
import React, { Suspense } from "react"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
export default async function Home() {
  prefetch(trpc.post.hello.queryOptions({ text: "Yess Sir" }))

  return (
    <HydrateClient>
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        This is going to be <span className="text-primary">great</span>
      </h1>

      <Suspense fallback={<>Loading bro...</>}>
        <ClientGreeting />
      </Suspense>

      <div className="flex flex-row gap-4 mt-4">
        <Button asChild variant={"outline"}>
          <Link href={"/dashboard"}>Go to Dashboard</Link>
        </Button>
        <Button asChild variant={"outline"}>
          <Link href={"/posts"}>Go to Posts</Link>
        </Button>
      </div>
    </HydrateClient>
  )
}
