"use client"

import { signUp } from "@workspace/api/auth/client"
import { Button } from "@workspace/ui/components/button"

import React from "react"

const Auth = () => {
  return (
    <>
      <div>Auth</div>
      <Button
        onClick={async () => {
          await signUp.email(
            {
              email: "timber@test.com", // user email address
              password: "timberleepass", // user password -> min 8 characters by default
              name: "timber", // user display name
              // image, // user image url (optional)
              callbackURL: "/", // a url to redirect to after the user verifies their email (optional)
            },
            {
              onRequest: () => {
                //show loading
                console.log("loading...")
              },
              onSuccess: () => {
                //redirect to the dashboard or sign in page
                console.log("success")
              },
              onError: ctx => {
                // display the error message
                console.log("error", ctx.error.message)
                alert(ctx.error.message)
              },
            }
          )
        }}
      >
        Sign me up
      </Button>
    </>
  )
}

export default Auth
