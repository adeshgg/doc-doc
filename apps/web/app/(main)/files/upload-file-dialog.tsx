"use client"

import { CloudUpload, UploadCloud, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { useMediaQuery } from "@/hooks/use-media-query"
import { useTRPC } from "@/trpc/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { upload } from "@vercel/blob/client"
import { useSession } from "@workspace/api/auth/client"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@workspace/ui/components/file-upload"
import { MAX_FILE_SIZE } from "@/lib/const"

interface UploadFileDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  onSuccess?: () => void
}

export function UploadFileDialog({
  onSuccess,
  ...props
}: UploadFileDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const [files, setFiles] = React.useState<File[]>([])
  const [open, setOpen] = React.useState(false)

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: session } = useSession()

  const { mutate: saveFile, isPending: isSaving } = useMutation({
    ...trpc.file.uploadFile.mutationOptions({
      onSuccess: async newFile => {
        onSuccess?.()
        setOpen(false)
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
        toast.success("File saved, now processing...")

        fetch("/api/embed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newFile), // Send the newFile data
        })
        setFiles([]) // Clear the file list on success or after embed attempt
      },
      onError: error => {
        toast.error("Failed to save file.", { description: error.message })
      },
    }),
  })

  // State to track the blob upload progress
  const [isUploading, setIsUploading] = React.useState(false)

  // ... onFileReject callback remains the same ...
  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.warning(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    })
  }, [])

  async function handleUpload() {
    const file = files[0]
    if (!file || !session?.user.email) {
      toast.error("No file selected or you are not logged in.")
      return
    }

    setIsUploading(true)

    try {
      // The pathname must be constructed on the client
      // It will be validated on the server in `onBeforeGenerateToken`
      const pathname = `${session.user.email}/${file.name}`

      const newBlob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      })

      saveFile({
        url: newBlob.url,
        pathname: newBlob.pathname,
        name: file.name,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("blob already exists")
      ) {
        toast.error("A file with this name already exists.", {
          description: "Please rename your file or delete the existing one.",
        })
      } else {
        toast.error("Upload failed.", {
          description: (error as Error).message,
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  const isPending = isUploading || isSaving

  if (isDesktop) {
    return (
      <Dialog {...props} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="w-fit">
            <CloudUpload className="mr-2 size-4" aria-hidden="true" />
            Upload
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload a file to the system. Supported formats: PDF, images (PNG,
              JPG) Max File Size: {MAX_FILE_SIZE}MB
            </DialogDescription>
          </DialogHeader>
          <div>
            <FileUpload
              maxFiles={1}
              maxSize={MAX_FILE_SIZE * 1024 * 1024}
              className="w-full max-w-md"
              value={files}
              onValueChange={setFiles}
              onFileReject={onFileReject}
              disabled={isPending}
              accept="application/pdf, image/*"
            >
              <FileUploadDropzone className="p-0 border-none w-fit">
                <FileUploadTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isPending}>
                    Browse file
                  </Button>
                </FileUploadTrigger>
              </FileUploadDropzone>
              <FileUploadList>
                {files.map((file, index) => (
                  <FileUploadItem key={index} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <X />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>

            {files.length > 0 && (
              <Button
                onClick={handleUpload}
                size={"sm"}
                variant={"outline"}
                className="mt-4"
                disabled={isPending}
              >
                {isUploading ? (
                  "Uploading to storage..."
                ) : isSaving ? (
                  "Saving file..."
                ) : (
                  <>
                    {" "}
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload File{" "}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer {...props} open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" className="w-fit">
          <CloudUpload className="mr-2 size-4" aria-hidden="true" />
          Upload
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[50vh]">
        <DialogHeader>
          <DialogTitle className="mt-8">Upload File</DialogTitle>
          <DialogDescription>
            Upload a file to the system.
            <div className="mt-2">
              Supported formats: PDF, images (PNG, JPG)
            </div>
            <div className="mt-2">Max File Size: {MAX_FILE_SIZE}MB</div>
          </DialogDescription>
        </DialogHeader>
        <div>
          <FileUpload
            maxFiles={1}
            maxSize={MAX_FILE_SIZE * 1024 * 1024}
            className="w-full max-w-md"
            value={files}
            onValueChange={setFiles}
            onFileReject={onFileReject}
            disabled={isPending}
            accept="application/pdf, image/*"
          >
            <FileUploadDropzone className="border-none w-fit mx-auto">
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" disabled={isPending}>
                  Browse file
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {files.map((file, index) => (
                <FileUploadItem key={index} value={file}>
                  <FileUploadItemPreview />
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <X />
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>

          {files.length > 0 && (
            <Button
              onClick={handleUpload}
              size={"sm"}
              variant={"outline"}
              className="mt-4"
              disabled={isPending}
            >
              {isUploading ? (
                "Uploading to storage..."
              ) : isSaving ? (
                "Saving file..."
              ) : (
                <>
                  {" "}
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload File{" "}
                </>
              )}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
