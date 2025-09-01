// components/Auth/Login.tsx
// This component handles user login functionality for the Vivo Sales Dashboard application.
// It allows users to enter their username and password, and upon successful login, redirects them to the dashboard.
'use client'

import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { VIVO_LOGO } from '@/lib/constants'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { loginUser } from './login-service'

interface LoginFormData {
  Bitsn_UserName: string
  password: string
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<LoginFormData>({
    Bitsn_UserName: '',
    password: ''
  })

  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (!formData.Bitsn_UserName.trim() || !formData.password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)

    try {
      // Ensure loginUser uses HTTPS in production
      await loginUser(formData.Bitsn_UserName, formData.password)

      setSuccess('Login successful')
      setTimeout(() => {
        router.push('/dashboard/record-sales')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="md:max-w-xl my-4 p-4 mx-auto shadow-lg border">
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      <Image
        src={VIVO_LOGO}
        alt="VIVO Logo"
        width={200}
        height={200}
        className="rounded-full mx-auto mb-2"
        priority
      />

      <h2 className="text-4xl text-primary font-bold mb-2 text-center">
        Hello, Welcome
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="Bitsn_UserName">Enter Username</Label>
          <Input
            id="Bitsn_UserName"
            type="text"
            name="Bitsn_UserName"
            value={formData.Bitsn_UserName}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>

        <div>
          <Label htmlFor="password">Enter Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <h3 className="font-semibold text-primary text-center my-2 cursor-pointer hover:underline">
          Forgot password?
        </h3>

        <Button type="submit" variant="default" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </Card>
  )
}

export default Login
