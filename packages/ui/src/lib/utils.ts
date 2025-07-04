import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string) => {
  if (!name) return "??"
  const nameParts = name.split(" ")

  const firstNameInitial = nameParts[0]?.[0] || ""

  const lastNameInitial =
    nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || "" : ""

  return `${firstNameInitial}${lastNameInitial}`.toUpperCase()
}
