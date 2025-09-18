import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetchCart = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/cart/')
      setCart(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load cart Login to view cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (itemId, quantity) => {
    setUpdating(true)
    try {
      await api.patch('/cart/', { item_id: itemId, quantity })
      fetchCart()
    } catch {
      alert('Failed to update quantity')
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this item?')) return
    try {
      await api.delete('/cart/', { data: { item_id: itemId } })
      fetchCart()
    } catch {
      alert('Failed to remove item')
    }
  }

  const checkout = async () => {
    if (!window.confirm('Complete your order?')) return
    try {
      await api.put('/cart/')
      alert('Order completed!')
      fetchCart()
    } catch {
      alert('Checkout failed')
    }
  }

  if (loading) return <p className="text-blue-600 text-center mt-4">Loading cart...</p>
  if (error) return <p className="text-red-600 text-center mt-4">{error}</p>
  if (!cart || !cart.items.length)
    return <p className="text-gray-600 text-center mt-4">🛒 Your cart is empty.</p>

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 shadow-md p-6 rounded-xl max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-purple-700 border-b-2 border-purple-300 pb-2">
        🛍️ Your Shopping Cart
      </h2>

      <ul className="divide-y divide-purple-300">
        {cart.items.map((item) => (
          <li key={item.id} className="py-4 flex justify-between items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800">{item.product_name}</h3>
              <p className="text-sm text-gray-500">Unit Price: ₹{item.unit_price}</p>
              <div className="flex items-center mt-2 gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  disabled={updating}
                  className="w-20 px-2 py-1 border border-purple-400 rounded text-sm bg-white shadow-sm"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
            <div className="text-right font-semibold text-lg text-green-700">
              ₹{parseFloat(item.subtotal).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between items-center border-t pt-4 border-purple-300">
        <div className="text-xl font-semibold text-gray-700">Total:</div>
        <div className="text-2xl font-bold text-green-700">₹{cart.total_amount}</div>
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={checkout}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-full shadow-md transition duration-200"
        >
          ✅ Checkout Now
        </button>
      </div>
    </div>
  )
}
