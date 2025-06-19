"use client"

import type { Row } from "@tanstack/react-table"
import { Loader, Trash } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { File } from "@workspace/db/schema"
import { useTRPC } from "@/trpc/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface DeleteFilesDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  files: Row<File>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export function DeleteFilesDialog({
  files,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteFilesDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)")

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate, status } = useMutation(
    trpc.file.deleteFiles.mutationOptions({
      onSuccess: () => {
        onSuccess?.()
        props.onOpenChange?.(false)
        queryClient.invalidateQueries({
          // queryKey: trpc.file.getFiles.queryKey(),
          predicate: query => {
            // The queryKey from tRPC is an array, e.g., [['file', 'getFiles'], { ... }]
            // We check if the first element of the key is an array,
            // and if its first element is 'file'.
            return (
              Array.isArray(query.queryKey[0]) &&
              query.queryKey[0][0] === "file"
            )
          },
        })
      },
    })
  )

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    mutate(
      {
        ids: files.map(file => file.id),
      },
      {
        onSuccess: async () => {
          await Promise.all(
            files.map(file =>
              fetch(`/api/blob/delete?fileurl=${file.url}`, {
                method: "DELETE",
              })
            )
          )
          toast(`${files.length > 1 ? "Files" : "File"} deleted successfully`)
        },
      }
    )
  }

  if (isDesktop) {
    return (
      <Dialog {...props}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-fit">
              <Trash className="mr-2 size-4" aria-hidden="true" />
              Delete ({files.length})
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your{" "}
              <span className="font-medium">{files.length}</span>
              {files.length === 1 ? " file" : " files"} from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              aria-label="Delete selected rows"
              variant="destructive"
              onClick={handleDelete}
              disabled={status === "pending"}
            >
              {status === "pending" && (
                <Loader
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer {...props}>
      {showTrigger ? (
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Delete ({files.length})
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>
            This action cannot be undone. This will permanently delete your{" "}
            <span className="font-medium">{files.length}</span>
            {files.length === 1 ? " task" : " tasks"} from our servers.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-2 sm:space-x-0">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            aria-label="Delete selected rows"
            variant="destructive"
            onClick={handleDelete}
            disabled={status === "pending"}
          >
            {status === "pending" && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Delete
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
