import React, { Suspense } from "react"
import CreatePost from "./create-post"
import PostList from "./post-list"
import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"
import PostSkeleton from "./post-skeleton"

const Post = async () => {
  // get the current user
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  prefetch(trpc.post.getPosts.queryOptions())
  return (
    <div>
      <div className="flex justify-between py-10">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl">
          Posts
        </h1>
        <CreatePost />
      </div>
      <HydrateClient>
        <Suspense fallback={<PostSkeleton />}>
          <PostList userId={session?.user.id} />
        </Suspense>
      </HydrateClient>
    </div>
  )
}

export default Post
