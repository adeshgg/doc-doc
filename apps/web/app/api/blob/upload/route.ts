import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      // The pathname is constructed on the client and validated here.
      // The client will send `pathname: 'user.email/filename.ext'`
      onBeforeGenerateToken: async pathname => {
        if (!session || !session.user || !session.user.email) {
          throw new Error("Not authenticated")
        }

        // Check if the client-provided pathname starts with the user's email
        // This prevents one user from uploading files into another user's "folder"
        const userEmail = session.user.email
        if (!pathname.startsWith(`${userEmail}/`)) {
          throw new Error("Invalid pathname")
        }

        return {
          // You can add additional metadata to the blob here
          allowedContentTypes: ["image/*", "application/pdf"],
          tokenPayload: JSON.stringify({
            userId: session.user.id, // Pass user ID to the completion callback
          }),
        }
      },
      // This callback runs after the file is successfully uploaded to Vercel Blob
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // You could do something here, but we will save to DB from the client
        // to provide immediate feedback to the user.
        console.log("Blob upload completed", blob, tokenPayload)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5xx status codes
    )
  }
}
