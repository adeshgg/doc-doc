import { File } from "@workspace/db/schema"
import { CheckCircle2, CircleIcon, CircleX, Timer } from "lucide-react"

export function getFileStatusIcon(status: File["status"]) {
  const statusIcons = {
    failed: CircleX,
    indexed: CheckCircle2,
    processing: Timer,
  }

  return statusIcons[status] || CircleIcon
}

export function getFileStatusToolTip(status: File["status"]) {
  const tipMap = {
    indexed: "Your file is indexed, you can start chating with it now",
    failed: "There was an error indexing the file",
    processing: "Processing file. It can take a few minutes to process file",
  }

  return tipMap[status]
}
