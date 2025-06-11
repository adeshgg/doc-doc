import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { inngest } from "@/inngest/client"

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const body = await request.json()

  if (!session || !session.user || !session.user.email) {
    throw new Error("Not authenticated")
  }

  await inngest.send({
    name: "test/hello.world",
    data: { ...body },
  })

  console.log("Event was sent")

  return NextResponse.json({ message: "Event sent!" })
}
