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
          "hidden md:block [mask-image:radial-gradient(600px_circle_at_center,white,transparent)] opacity-30"
        )}
      />
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col h-[calc(100dvh-4rem)]">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-space-grotesk">
              A Digital Organizer For Medical Reports
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
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
                Chat <MessageCircle className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
