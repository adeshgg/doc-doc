import "dotenv/config"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        isGuest: {
          type: "boolean",
        },
      },
    }),
  ],
  /** the base url of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
})

export const { signIn, signUp, useSession, signOut } = authClient
