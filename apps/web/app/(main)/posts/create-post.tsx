"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { PlusCircleIcon } from "lucide-react"
import MutatePostForm from "./mutate-post-form"
import { useState } from "react"

export default function CreatePost() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircleIcon /> Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <MutatePostForm onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  )
}
