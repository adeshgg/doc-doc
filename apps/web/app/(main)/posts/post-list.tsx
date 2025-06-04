"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import Link from "next/link"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/react"
import { cn } from "@workspace/ui/lib/utils"
import UpdatePost from "./update-post"
import DeletePost from "./delete-post"

const PostList = ({ userId }: { userId: string | undefined }) => {
  const trpc = useTRPC()
  const { data, status } = useSuspenseQuery(trpc.post.getPosts.queryOptions())

  if (status === "error") {
    return <div>Error</div>
  }

  return (
    <div className="mx-auto max-w-xl space-y-2 px-4 py-10">
      <div className={cn("flex flex-col gap-2")}>
        {data.map(post => (
          <Card key={post.id}>
            <CardContent className="flex justify-between p-6">
              <Link
                // href={`/posts/${post.id}?p=${page}`}
                href={"#"}
                // onMouseEnter={() => {
                //   queryClient.prefetchQuery(getPostQueryOptions(post.id))
                // }}
                className="cursor-pointer"
              >
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  {post.title}
                </h3>
                <p className="leading-7">
                  {post.description.slice(0, 20)}{" "}
                  {post.description.length > 20 && "..."}
                </p>
              </Link>
              {userId === post.authorId ? (
                <div className="flex gap-2 self-center">
                  <DeletePost id={post.id} />
                  <UpdatePost post={post} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PostList
