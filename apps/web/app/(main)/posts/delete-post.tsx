"use client"

import { Button } from "@workspace/ui/components/button"
import { Trash2Icon } from "lucide-react"
import React, { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/react"

const DeletePost = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false)

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate, status } = useMutation(
    trpc.post.deletePost.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.post.getPosts.queryKey(),
        })
      },
    })
  )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={status === "pending"}
            className="cursor-pointer"
            onClick={e => {
              e.preventDefault()
              mutate(
                { id },
                {
                  onSuccess: () => {
                    toast("Post deleted successfully")
                    setOpen(false)
                  },
                  onError: error => {
                    toast.error(error.message)
                  },
                }
              )
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeletePost
