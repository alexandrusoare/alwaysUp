import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isRegister && !gender) {
      setError('Please select your gender')
      setLoading(false)
      return
    }

    const { error } = isRegister
      ? await signUp(email, password, gender)
      : await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (isRegister) {
        setError('Check your email for confirmation link!')
      } else {
        navigate('/')
      }
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container pixel-border">
        <h1 className="login-title">AlwaysUp</h1>
        <p className="login-subtitle">Real Life Trophies</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pixel-input"
              placeholder="warrior@quest.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pixel-input"
              placeholder="******"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Gender</label>
              <div className="gender-selector">
                <button
                  type="button"
                  className={`gender-btn male ${gender === 'male' ? 'selected' : ''}`}
                  onClick={() => setGender('male')}
                >
                  <div className="pixel-male-symbol" />
                </button>
                <button
                  type="button"
                  className={`gender-btn female ${gender === 'female' ? 'selected' : ''}`}
                  onClick={() => setGender('female')}
                >
                  <div className="pixel-female-symbol" />
                </button>
              </div>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="pixel-btn login-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <button
          className="toggle-auth-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  )
}
