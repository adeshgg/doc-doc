import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import React from "react"

const PostSkeleton = () => {
  return (
    <div className="mx-auto max-w-xl space-y-2 px-4 py-10">
      {[1, 2, 3, 4, 5].map(item => (
        <Card key={item}>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default PostSkeleton
