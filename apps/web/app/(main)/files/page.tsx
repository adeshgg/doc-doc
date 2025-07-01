import LoginFirst from "@/components/login-first"
import { SearchParams, searchParamsCache } from "@/lib/types"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"
import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"
import { FilesTableWrapper } from "./fileWrapper"

interface FilesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function FilesPage(props: FilesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return <LoginFirst resource="Files" />
  }

  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  prefetch(trpc.file.getFiles.queryOptions(search))
  prefetch(trpc.file.getFileStatusCounts.queryOptions())
  prefetch(trpc.file.getFileTypeCounts.queryOptions())

  return (
    <HydrateClient>
      <FilesTableWrapper />
    </HydrateClient>
  )
}
