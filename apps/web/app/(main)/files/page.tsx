import { SearchParams, searchParamsCache } from "@/lib/types"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"
import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"
import { FilesTableWrapper } from "./fileWrapper"
import { LoginForm } from "@/components/auth-form"

interface FilesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function FilesPage(props: FilesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <LoginForm isUnauthorized redirectTo="files" resource="Files" />
        </div>
      </div>
    )
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
