import { FileUploadDemo } from "@/components/upload"
import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div>
      <div>Hi {session?.user.name}</div>
      <div>Your Email was: {session?.user.email}</div>
      <FileUploadDemo />
    </div>
  )
}

export default Dashboard
