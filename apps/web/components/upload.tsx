// /components/FileUploadDemo.tsx

"use client"

import { useTRPC } from "@/trpc/react"
import { useMutation } from "@tanstack/react-query"
import { upload } from "@vercel/blob/client"
// import { useSession } from "next-auth/react"; // To get user email for the pathname
import { Button } from "@workspace/ui/components/button"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
  // ... other ui imports
} from "@workspace/ui/components/file-upload"
import { UploadCloud, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

export function FileUploadDemo({
  userEmail,
}: {
  userEmail: string | undefined
}) {
  const [files, setFiles] = React.useState<File[]>([])
  const trpc = useTRPC()

  const { mutate: saveFile, isPending: isSaving } = useMutation({
    ...trpc.file.uploadFile.mutationOptions({
      onSuccess: async newFile => {
        console.log("newFile", newFile)
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
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    })
  }, [])

  async function handleUpload() {
    const file = files[0]
    if (!file || !userEmail) {
      toast.error("No file selected or you are not logged in.")
      return
    }

    setIsUploading(true)

    try {
      // The pathname must be constructed on the client
      // It will be validated on the server in `onBeforeGenerateToken`
      const pathname = `${userEmail}/${file.name}`

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
      toast.error("Upload failed.", { description: (error as Error).message })
    } finally {
      setIsUploading(false)
    }
  }

  const isPending = isUploading || isSaving

  return (
    <div>
      <FileUpload
        maxFiles={1}
        maxSize={4 * 1024 * 1024} // 4MB
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
  )
}
