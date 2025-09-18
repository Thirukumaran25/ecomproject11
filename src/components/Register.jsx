import { useState } from 'react'
import { Link } from 'react-router-dom'
import { register, login } from '../lib/api'

export default function Register({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register({ username, email, password })
      await login(username, password)
      onSuccess?.()
    } catch (err) {
      const detail = err?.response?.data?.detail
      const data = err?.response?.data
      let msg = 'Registration failed'
      if (Array.isArray(detail)) msg = detail.join(', ')
      else if (typeof detail === 'string') msg = detail
      else if (data && typeof data === 'object') {
        const parts = []
        for (const [k, v] of Object.entries(data)) {
          if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`)
          else if (typeof v === 'string') parts.push(`${k}: ${v}`)
        }
        if (parts.length) msg = parts.join(' | ')
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Register</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="mb-3">
        <label className="block text-sm mb-1">Username</label>
        <input className="w-full border rounded px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
      </div>
      <div className="mb-3">
        <label className="block text-sm mb-1">Email (optional)</label>
        <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
      </div>
      <div className="mb-4">
        <label className="block text-sm mb-1">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
      </div>
      <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 disabled:opacity-60">
        {loading ? 'Creating...' : 'Create account'}
      </button>
    </form>
  )
}