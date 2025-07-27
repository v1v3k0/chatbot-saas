'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/lib/store'
import { loginSchema, userRegistrationSchema } from '@/lib/validations'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type AuthMode = 'login' | 'register'

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const supabase = createClientComponentClient()
  const { setUser } = useAuthStore()

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const registerForm = useForm({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'borrower' as const,
      firstName: '',
      lastName: '',
      phone: '',
    },
  })

  const onSubmitLogin = async (data: any) => {
    setIsLoading(true)
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (authData.user) {
        // Fetch user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (userProfile) {
          setUser(userProfile)
          toast.success('Welcome back!')
        }
      }
    } catch (error) {
      toast.error('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitRegister = async (data: any) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success('Registration successful! Please check your email to verify your account.')
      setMode('login')
      registerForm.reset()
    } catch (error) {
      toast.error('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-gray-600">
          {mode === 'login' 
            ? 'Welcome back! Please sign in to your account.'
            : 'Join our P2P lending community today.'
          }
        </p>
      </div>

      {mode === 'login' ? (
        <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...loginForm.register('email')}
              className="form-input"
              placeholder="Enter your email"
            />
            {loginForm.formState.errors.email && (
              <p className="form-error">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...loginForm.register('password')}
                className="form-input pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="form-error">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                {...registerForm.register('firstName')}
                className="form-input"
                placeholder="First name"
              />
              {registerForm.formState.errors.firstName && (
                <p className="form-error">{registerForm.formState.errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                {...registerForm.register('lastName')}
                className="form-input"
                placeholder="Last name"
              />
              {registerForm.formState.errors.lastName && (
                <p className="form-error">{registerForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...registerForm.register('email')}
              className="form-input"
              placeholder="Enter your email"
            />
            {registerForm.formState.errors.email && (
              <p className="form-error">{registerForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="form-label">
              I want to
            </label>
            <select
              id="role"
              {...registerForm.register('role')}
              className="form-input"
            >
              <option value="borrower">Borrow Money</option>
              <option value="lender">Lend Money</option>
            </select>
            {registerForm.formState.errors.role && (
              <p className="form-error">{registerForm.formState.errors.role.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="form-label">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              {...registerForm.register('phone')}
              className="form-input"
              placeholder="Enter your phone number"
            />
            {registerForm.formState.errors.phone && (
              <p className="form-error">{registerForm.formState.errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...registerForm.register('password')}
                className="form-input pr-10"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {registerForm.formState.errors.password && (
              <p className="form-error">{registerForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...registerForm.register('confirmPassword')}
                className="form-input pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {registerForm.formState.errors.confirmPassword && (
              <p className="form-error">{registerForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              loginForm.reset()
              registerForm.reset()
            }}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}