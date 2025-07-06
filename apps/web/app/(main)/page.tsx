import { Button } from "@workspace/ui/components/button"
import { DotPattern } from "@workspace/ui/components/dot-pattern"
import { AnimatedShinyText } from "@workspace/ui/components/shinytext"
import { cn } from "@workspace/ui/lib/utils"
import { ExternalLink, FileText, MessageCircle } from "lucide-react"
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
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-muted group cursor-pointer rounded-full">
              <Link
                href={"https://www.adeshgg.in/blog/doc-doc"}
                target="_blank"
              >
                <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-200">
                  <span>✨ Read the annoucement blog</span>
                  <ExternalLink className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </AnimatedShinyText>
              </Link>
            </div>
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
