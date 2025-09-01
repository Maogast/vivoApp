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



const Login = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [formData, setFormData] = useState<{ Bitsn_UserName: string, password: string }>({
    Bitsn_UserName: '',
    password: ''
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    setLoading(true);
    setError('');

    try {
      await loginUser(formData.Bitsn_UserName, formData.password);
      setSuccess('Login successful');
      setTimeout(() => {
        setSuccess('');
        router.push(`/dashboard/record-sales`)
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }


  return (
    <Card className='md:max-w-xl my-4 p-4 mx-auto shadow-lg border'>
      {error && <p className='text-red-500 text-center'>{error}</p>}
      {success && <p className='text-green-500 text-center'>{success}</p>}
      <Image
        src={VIVO_LOGO}
        alt="VIVO Logo"
        width={200}
        height={200}
        className="rounded-full mx-auto mb-2"
      />
      <h2 className="text-4xl text-primary font-bold mb-2 text-center">Hello, Welcome</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
     
        <div>
          <Label>Enter User name</Label>
          <Input
            type="text"
            value={formData.Bitsn_UserName}
            name='Bitsn_UserName'
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Enter password</Label>
          <Input
            type="password"
            value={formData.password}
            name='password'
            onChange={handleChange}
          />
        </div>

        <h3 className=' font-semibold text-primary text-center my-2'>Forgot password ? </h3>
        <Button
          type="submit"
          variant={"default"}

        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Card>
  )
}

export default Login
