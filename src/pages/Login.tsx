import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        navigate('/dashboard')
      }
    }
    checkSession()
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Check if ?admin query param exists
    if (!searchParams.has('admin')) {
      setError('Access denied. Invalid URL.')
      return
    }

    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (loginError) {
      setError(loginError.message)
      return
    }

    if (data.session) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Admin Login</h1>
        {error && (
          <div className="text-red-700 mb-4 p-3 border border-red-700 rounded bg-red-100 dark:bg-red-900/30">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 text-gray-900 dark:text-gray-100">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 text-gray-900 dark:text-gray-100">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2.5 text-base text-white border-none rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 bg-indigo-500 hover:bg-indigo-600"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
