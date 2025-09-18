import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../lib/api'

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      onSuccess?.()
    } catch (err) {
      console.error(err);
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Login</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="mb-3">
        <label className="block text-sm mb-1">Username</label>
        <input className="w-full border rounded px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
      </div>
      <div className="mb-4">
        <label className="block text-sm mb-1">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
      </div>
      <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 disabled:opacity-60">
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p className="text-sm text-center mt-3">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
    </form>
  )
}