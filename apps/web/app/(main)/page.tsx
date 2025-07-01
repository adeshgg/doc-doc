import { Button } from "@workspace/ui/components/button"
import { DotPattern } from "@workspace/ui/components/dot-pattern"
import { cn } from "@workspace/ui/lib/utils"
import { FileText, MessageCircle } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  return (
    <div className="w-full">
      <DotPattern
        className={cn(
          "hidden opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)] md:block"
        )}
      />
      <div className="container mx-auto">
        <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-8 py-20 lg:py-40">
          <div className="flex flex-col gap-4">
            <h1 className="font-space-grotesk max-w-2xl text-center text-5xl tracking-tighter md:text-7xl">
              A Digital Organizer For Medical Reports
            </h1>
            <p className="text-muted-foreground max-w-2xl text-center text-lg leading-relaxed tracking-tight md:text-xl">
              Focus on healing. We handle the paperwork. Your doctor gets the
              clear, organized medical history they need to best care for you.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline" asChild>
              <Link href={"/files"}>
                Upload Files <FileText />
              </Link>
            </Button>
            <Button size="lg" className="gap-4" asChild>
              <Link href={"/chat"}>
                Chat <MessageCircle className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
