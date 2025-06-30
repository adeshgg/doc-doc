import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export default async function Home() {
  return (
    <div className="flex justify-center items-center gap-4 h-dvh">
      <Button asChild>
        <Link href={"/files"}>Files</Link>
      </Button>
      <Button asChild>
        <Link href={"/chat"}>Chat</Link>
      </Button>
    </div>
  )
}
