import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { inngest } from "@/inngest/client"

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await request.json()

  await inngest.send({
    name: "doc/file.embed",
    data: { ...body },
  })

  console.log("Event was sent")

  return NextResponse.json({ message: "Event sent!" })
}
