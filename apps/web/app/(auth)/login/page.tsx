"use client"
import AuthForm from "@/components/auth-form"
import { signIn, signUp } from "@workspace/api/auth/client"
import { useRouter } from "next/navigation"
import React from "react"

// Here the Login component says I will pass you the onSubmit function
// and auth-form you pass me the data, and the things to do onRequest, onSuccess, onError
// and I will create the user and call functions when the time comes

const Login = () => {
  const router = useRouter()
  return (
    <AuthForm
      onSubmit={(data, { onRequest, onSuccess, onError }) => {
        if ("name" in data) {
          // Sign up the user
          signUp.email(
            {
              email: data.email,
              name: data.name,
              password: data.password,
              // Add any additional options like callbackURL if needed
            },
            {
              onRequest: () => {
                onRequest()
              },
              onSuccess: () => {
                onSuccess()
                // Additional success handling like redirection
                router.push("/dashboard")
              },
              onError: ctx => {
                onError(new Error(ctx.error.message))
              },
            }
          )
        } else {
          // Sign in the user
          signIn.email(
            {
              email: data.email,
              password: data.password,
            },
            {
              onRequest: () => {
                onRequest()
              },
              onSuccess: () => {
                onSuccess()
                // Additional success handling like redirection
                router.push("/dashboard")
              },
              onError: ctx => {
                onError(new Error(ctx.error.message))
              },
            }
          )
        }
      }}
      onForgotPassword={(email, { onRequest, onError }) => {
        // Handle password reset
        // Assuming authClient has a forgotPassword method
        // If not, you'll need to implement your own logic
        try {
          onRequest()
          // Example implementation (replace with your actual auth client method)
          // authClient.forgotPassword.email(
          //   { email },
          //   {
          //     onRequest: () => {
          //       // Already called onRequest above
          //     },
          //     onSuccess: (ctx) => {
          //       onSuccess()
          //       // Additional success handling
          //     },
          //     onError: (ctx) => {
          //       onError(new Error(ctx.error.message))
          //     },
          //   }
          // )
        } catch (error) {
          onError(
            error instanceof Error ? error : new Error("Unknown error occurred")
          )
        }
      }}
    />
  )
}

export default Login
