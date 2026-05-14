'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  async function handleLogin() {

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({

      email,
      password

    })

    if (error) {

      alert(error.message)

      setLoading(false)

      return

    }

    router.push('/dashboard')

  }

  return (

    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center p-5'>

      <div className='w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl'>

        <h1 className='text-4xl font-bold text-white mb-2'>
          Client Login
        </h1>

        <p className='text-gray-400 mb-8'>
          Access your lead dashboard
        </p>

        <div className='space-y-5'>

          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-400 outline-none'
          />

          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-400 outline-none'
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 transition-all py-4 rounded-2xl text-white font-semibold'
          >

            {loading ? 'Logging in...' : 'Login'}

          </button>

        </div>

      </div>

    </main>

  )

}