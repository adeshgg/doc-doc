"use client"

import { useTRPC } from "@/trpc/react"
import { useMutation } from "@tanstack/react-query"
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
} from "@workspace/ui/components/file-upload"
import { Upload, UploadCloud, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

export function FileUploadDemo() {
  const trpc = useTRPC()
  const { mutate, isPending } = useMutation(
    trpc.file.uploadFile.mutationOptions()
  )

  const [files, setFiles] = React.useState<File[]>([])

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    })
  }, [])

  function handleUpload() {
    console.log("files", files)
    if (files.length > 0) {
      mutate({
        file: files[0]!,
      })
    }
  }

  return (
    <div>
      <FileUpload
        maxFiles={1}
        maxSize={2 * 1024 * 1024}
        className="w-full max-w-md"
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        //   multiple
      >
        <FileUploadDropzone className="p-0 w-fit border-none">
          {/* <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (max 2 files, up to 5MB each)
          </p>
        </div> */}
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Browse files
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
      {/* Upload files */}
      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          size={"sm"}
          variant={"outline"}
          className="mt-4"
        >
          <UploadCloud /> Upload
        </Button>
      )}
    </div>
  )
}
