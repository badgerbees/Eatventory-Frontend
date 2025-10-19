import React, { useEffect, useState } from 'react'
import { getCategories, createCategory } from '../api/backend'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const cs = await getCategories()
        if (!mounted) return
        setCategories(cs || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => (mounted = false)
  }, [])

  const handleCreate = async () => {
    if (!name || name.trim().length === 0) return
    try {
      await createCategory({ name: name.trim() })
      const cs = await getCategories()
      setCategories(cs || [])
      setName('')
    } catch (err) {
      console.error(err)
      alert('Gagal membuat kategori')
    }
  }

  if (loading) return <div className="p-6">Memuat kategori…</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
  <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🏷️ Kategori</h2>
          <p className="text-gray-600">Kelola kategori produk</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kategori" className="flex-1 px-4 py-3 rounded-xl border-2 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none" />
            <button onClick={handleCreate} className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold">Tambah</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map(c => (
              <li key={c.id} className="px-4 py-3 border rounded">{c.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
