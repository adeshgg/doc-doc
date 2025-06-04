import { caller } from "@/trpc/server"

const ServerComponent = async () => {
  const data = await caller.post.hello({ text: "Server Component" })

  return <div>ServerComponent: {data.greeting}</div>
}

export default ServerComponent
