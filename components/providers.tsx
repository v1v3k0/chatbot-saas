'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { User } from '@/types/supabase'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: false,
      },
    },
  }))

  const [supabaseClient] = useState(() => createClientComponentClient())

  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true)
      
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      
      if (session?.user && !error) {
        // Fetch user profile
        const { data: userProfile } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userProfile) {
          setUser(userProfile as User)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          const { data: userProfile } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userProfile) {
            setUser(userProfile as User)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabaseClient, setUser, setLoading])

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionContextProvider>
  )
}