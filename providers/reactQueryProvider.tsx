'use client'
import {

    QueryClient,
    QueryClientProvider,
  } from '@tanstack/react-query'

  
  // Create a client
  const queryClient = new QueryClient()
  
export function ReactQueryProvider({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      // Provide the client to your App
      <QueryClientProvider client={queryClient}>
            {children}
      </QueryClientProvider>
    )
  }
  