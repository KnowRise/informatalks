import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  )
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const colors = {
    bg: theme === 'dark' ? '#1a1a1a' : '#efefef',
    cardBg: theme === 'dark' ? '#2d2d2d' : '#efefef',
    border: theme === 'dark' ? '#444' : '#ccc',
    text: theme === 'dark' ? '#efefef' : '#000000',
    inputBg: theme === 'dark' ? '#2d2d2d' : '#efefef',
  }

  useEffect(() => {
    document.body.style.backgroundColor = colors.bg
    document.body.style.color = colors.text
  }, [colors.bg, colors.text])

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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ color: colors.text }}>Admin Login</h1>
      {error && (
        <div
          style={{
            color: '#dc3545',
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            backgroundColor: theme === 'dark' ? '#3d1a1a' : '#f8d7da',
          }}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: colors.text }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              backgroundColor: colors.inputBg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', color: colors.text }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              backgroundColor: colors.inputBg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: loading ? colors.border : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
