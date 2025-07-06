"use client"

import { signOut, useSession } from "@workspace/api/auth/client"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@workspace/ui/components/navigation-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { Icons } from "@workspace/ui/components/icons"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { LogOut } from "lucide-react"
import { getInitials } from "@workspace/ui/lib/utils"

const navigationLinks = [
  { href: "/files", label: "Files" },
  { href: "/chat", label: "Chat" },
  { href: "https://github.com/adeshgg/doc-doc", label: "GitHub" },
]

export default function Navbar() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:pl-16">
        {/* Left Side: Logo and Desktop Navigation */}
        <div className="flex items-center gap-6">
          {/* Mobile Menu Trigger (Hamburger Icon) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <Icons.hamburger />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1 md:hidden">
              <nav className="flex flex-col gap-1">
                {navigationLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium"
                    // Add target="_blank" for external links like GitHub
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </PopoverContent>
          </Popover>

          <Link href="/" className="flex flex-shrink-0 items-center">
            <h1 className="font-space-grotesk scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              doc-doc.
            </h1>
          </Link>

          {/* Desktop Navigation Menu */}
          <NavigationMenu className="max-md:hidden">
            <NavigationMenuList className="gap-2">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      // Add target="_blank" for external links
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side: Theme Toggle and Auth Buttons from original navbar */}
        <div className="ml-6 flex items-center gap-4">
          <ModeToggle />
          {isPending ? (
            <Skeleton className="h-10 w-20" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-9 w-9 rounded-md">
                    <AvatarImage
                      src={session.user.image!}
                      alt={session.user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={session.user.image!}
                        alt={session.user.name}
                      />
                      <AvatarFallback className="rounded-lg">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () =>
                    await signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/login")
                        },
                      },
                    })
                  }
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
