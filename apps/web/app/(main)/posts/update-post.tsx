"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { PencilIcon } from "lucide-react"
import MutatePostForm from "./mutate-post-form"
import { useState } from "react"
import { selectPostBuildSchema } from "@workspace/db/schema"
// import { selectPostBuildSchema } from '@/db/schema'

export default function UpdatePost({
  post,
}: {
  post: Zod.infer<typeof selectPostBuildSchema>
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <MutatePostForm onOpenChange={setOpen} post={post} />
      </DialogContent>
    </Dialog>
  )
}
