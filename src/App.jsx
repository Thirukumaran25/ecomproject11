import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import api, { getTokens, logout } from './lib/api'
import Login from './components/Login'
import Register from './components/Register'
import Cart from './pages/Cart'

function App() {
  const isAuthed = !!getTokens().access

  return (
      <div className="min-h-screen bg-red-200 text-gray-900">
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">E-Commerce</h1>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-sm text-blue-600">Home</Link>
              <Link to="/cart" className="text-sm text-blue-600">Cart</Link>
              {isAuthed ? (
                <button onClick={() => { logout(); window.location.reload() }} className="text-sm text-red-600">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-green-600">Login</Link>
                  <Link to="/register" className="text-sm text-green-600">Register</Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login onSuccess={() => window.location.reload()} />} />
            <Route path="/register" element={<Register onSuccess={() => window.location.reload()} />} />
          </Routes>
        </main>
      </div>
  )
}



function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthed = !!getTokens().access;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await api.get('/products/');
        setProducts(data.results ?? data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  async function addToCart(productId) {
    if (!isAuthed) {
      alert('You must be logged in to add items to the cart.');
      return;
    }
    try {
      await api.post('/cart/', { product_id: productId, quantity: 1 });
      alert('Product added to cart!');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-7xl bg-blue-300 mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🛍️ Available Products</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 hover:shadow-lg transition duration-200 flex flex-col"
          >
            {p.image && (
              <img
                src={
                  p.image.startsWith('http')
                    ? p.image
                    : `${import.meta.env.VITE_API_URL}${p.image}`
                }
                alt={p.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}

            <h3 className="text-lg font-semibold text-gray-800 mb-1">{p.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">{p.description}</p>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-green-600 font-bold text-lg">₹{p.price}</span>
              <button
                onClick={() => addToCart(p.id)}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-3 py-1.5 text-sm rounded-md hover:from-indigo-600 hover:to-blue-600 transition"
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default App