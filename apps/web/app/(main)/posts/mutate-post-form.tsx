"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { useTRPC } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { selectPostBuildSchema } from "@workspace/db/schema"

const formSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
})

const MutatePostForm = ({
  onOpenChange,
  post,
}: {
  onOpenChange: (open: boolean) => void
  post?: Zod.infer<typeof selectPostBuildSchema>
}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: createPost, status: createStatus } = useMutation(
    trpc.post.createPost.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.post.getPosts.queryKey(),
        })
      },
    })
  )

  const { mutate: updatePost, status: updateStatus } = useMutation(
    trpc.post.updatePost.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.post.getPosts.queryKey(),
        })
      },
    })
  )

  const isLoading = createStatus === "pending" || updateStatus === "pending"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post ? post.title : "",
      description: post ? post.description : "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (post) {
      updatePost(
        { id: post.id, ...values },
        {
          onSuccess: () => {
            toast("Post updated successfully")
            form.reset()
            onOpenChange(false)
          },
          onError: error => {
            toast.error(error.message)
          },
        }
      )
    } else {
      createPost(
        { ...values },
        {
          onSuccess: () => {
            toast("Post created successfully")
            form.reset()
            onOpenChange(false)
          },
          onError: error => {
            toast.error(error.message)
          },
        }
      )
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{post ? "Update" : "Create"} Post</DialogTitle>
        <DialogDescription>
          Add you post details here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-4 pt-5"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="How to exit from vim"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the title for the post
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Bla, bla, bla, bla" {...field} />
                </FormControl>
                <FormDescription>
                  This is the description for the post
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? post
                  ? "Updating..."
                  : "Creating..."
                : post
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  )
}

export default MutatePostForm
