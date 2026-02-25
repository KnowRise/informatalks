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
      if (data.session && searchParams.has('admin')) {
        navigate('/dashboard')
      }
    }
    checkSession()
  }, [navigate, searchParams])

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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Admin Login</h1>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', border: '1px solid red' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', fontSize: '16px' }}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
