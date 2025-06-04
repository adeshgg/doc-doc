"use client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/react"

export function ClientGreeting() {
  const trpc = useTRPC()
  const greeting = useSuspenseQuery(
    trpc.post.hello.queryOptions({ text: "Yess Sir" })
  )

  const users = useQuery(trpc.auth.getUsers.queryOptions())

  console.log("users", users.data)

  return (
    <div>
      <div>{greeting.data.greeting}</div>
    </div>
  )
}
