"use client"
import AuthForm from "@/components/auth-form"
import { signIn, signUp } from "@workspace/api/auth/client"
import { useRouter } from "next/navigation"
import React from "react"

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
                router.push("/")
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
                router.push("/")
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
