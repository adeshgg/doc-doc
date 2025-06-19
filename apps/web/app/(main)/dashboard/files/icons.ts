import { File } from "@workspace/db/schema"
import { CheckCircle2, CircleIcon, CircleX, Timer } from "lucide-react"

export function getStatusIcon(status: File["status"]) {
  const statusIcons = {
    failed: CircleX,
    indexed: CheckCircle2,
    processing: Timer,
  }

  return statusIcons[status] || CircleIcon
}
