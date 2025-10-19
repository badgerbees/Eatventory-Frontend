import React, { useEffect, useState } from 'react'
import { getItems, createItem, getCategories as fetchCategories, createCategory, updateItem } from '../api/backend'

export default function ItemsPage() {
  // State untuk item dan kategori
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '', unit: '', stock: '' })

  // Form lokal (UI-only) untuk menambah item/kategori
  const [newCategoryName, setNewCategoryName] = useState('')
  const [form, setForm] = useState({ name: '', price: '', category: '', unit: 'pcs', stock: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const its = await getItems()
        const cats = await fetchCategories()
        if (!mounted) return
        setItems(its || [])
        setCategories(cats || [])
      } catch (err) {
        console.error('Gagal memuat data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => (mounted = false)
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategoryName || newCategoryName.trim().length === 0) return
    try {
      // Backend's CategoryCreate currently requires a description field,
      // so include an empty description to satisfy validation.
      await createCategory({ name: newCategoryName.trim(), description: '' })
      const cs = await fetchCategories()
      setCategories(cs || [])
      setNewCategoryName('')
    } catch (err) {
      console.error('Gagal membuat kategori:', err)
      alert('Terjadi kesalahan saat membuat kategori')
    }
  }

  const handleCreateItem = async () => {
    if (!form.name || !form.category || !form.price) {
      alert('Lengkapi nama, kategori, dan harga item')
      return
    }
    try {
      await createItem({ name: form.name, price: Number(form.price), category_id: form.category, stock: Number(form.stock || 0), unit: form.unit })
      const its = await getItems()
      setItems(its || [])
      setForm({ name: '', price: '', category: '', unit: 'pcs', stock: '' })
    } catch (err) {
      console.error('Gagal membuat item:', err)
      alert('Terjadi kesalahan saat membuat item')
    }
  }

  const startEdit = (it) => {
    setEditingId(it.id)
    setEditForm({ name: it.name || '', price: it.price || '', category: it.category_id || it.category?.id || '', unit: it.unit || 'pcs', stock: it.stock ?? 0 })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', price: '', category: '', unit: '', stock: '' })
  }

  const saveEdit = async (itemId) => {
    try {
      const payload = {
        name: editForm.name,
        price: Number(editForm.price),
        category_id: editForm.category,
        unit: editForm.unit,
        stock: Number(editForm.stock)
      }
      await updateItem(itemId, payload)
      const its = await getItems()
      setItems(its || [])
      cancelEdit()
    } catch (err) {
      console.error('Gagal menyimpan perubahan item:', err)
      alert('Gagal menyimpan perubahan item')
    }
  }

  // quick stock updates removed; use Edit button to change stock and other fields

  const categoryColors = {
    'Minuman': 'bg-blue-200 text-blue-800',
    'Camilan': 'bg-yellow-200 text-yellow-800',
    'Makanan Utama': 'bg-orange-200 text-orange-800',
    'Pencuci Mulut': 'bg-pink-200 text-pink-800'
  }
  const getCategoryColor = (name) => categoryColors[name] || 'bg-green-200 text-green-800'

  if (loading) return <div className="p-6">Memuat data…</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
  <div className="max-w-6xl mx-auto px-6 py-8 animate-[fadeIn_0.6s_ease-in]">
  {/* Bagian Kategori */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-6 border-4 border-transparent bg-clip-padding backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">🍱 Kategori</h2>

          <div className="flex gap-3 mb-4">
            <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreateCategory()} placeholder="Nama kategori baru..." className="flex-1 px-4 py-3 rounded-xl border-2 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-300" />
            <button onClick={handleCreateCategory} className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 shadow-lg">Tambah Kategori</button>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <span key={cat.id} className={`${getCategoryColor(cat.name)} rounded-full px-4 py-2 font-semibold text-sm shadow-md transform hover:scale-110 transition-all duration-300 cursor-default`}>{cat.name}</span>
            ))}
          </div>
        </div>

        {/* Bagian Item */}
        <div className="bg-gradient-to-r from-yellow-50 via-pink-50 to-indigo-50 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">🧁 Daftar Produk</h2>

          {/* Form Tambah Item */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <input type="text" placeholder="Nama item" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300" />

              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 bg-white">
                <option value="">Pilih kategori</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>

              <input type="number" placeholder="Harga (Rp)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300" />

              <input type="number" placeholder="Stok" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300" />

              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 bg-white">
                <option value="pcs">pcs</option>
                <option value="pack">pack</option>
                <option value="bottle">bottle</option>
              </select>

              <button onClick={handleCreateItem} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg">Tambah Item</button>
            </div>
          </div>

          {/* Filter & Search - styled like the add-item form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white outline-none transition-all">
                  <option value="">Semua kategori</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari nama item..." className="w-full md:w-80 px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all" />
                <button onClick={() => { setSelectedCategory(''); setSearchQuery('') }} className="text-sm text-gray-500 underline">Reset</button>
              </div>
            </div>
          </div>

          {/* Tabel Item */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="table-auto w-full">
              <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">📦 Nama</th>
                  <th className="px-6 py-4 text-left font-bold">🏷️ Kategori</th>
                  <th className="px-6 py-4 text-left font-bold">💰 Harga</th>
                  <th className="px-6 py-4 text-left font-bold">📊 Stok</th>
                  <th className="px-6 py-4 text-left font-bold">📏 Satuan</th>
                  <th className="px-6 py-4 text-left font-bold">⚙️ Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-lg">Belum ada produk. Tambahkan produk pertama Anda! 🎉</td>
                  </tr>
                ) : (
                  // Apply client-side filters: category and name search (case-insensitive)
                  items
                    .filter(it => {
                      if (selectedCategory && String(it.category_id) !== String(selectedCategory)) return false
                      if (searchQuery && !String(it.name).toLowerCase().includes(searchQuery.toLowerCase())) return false
                      return true
                    })
                    .map((it, idx) => (
                    <React.Fragment key={it.id}>
                    <tr className={`${idx % 2 === 0 ? 'bg-pink-50' : 'bg-blue-50'} hover:bg-yellow-100 transition-all duration-300 transform hover:scale-[1.01]`}>
                      <td className="px-6 py-4 font-semibold text-gray-800">{it.name}</td>
                          <td className="px-6 py-4">
                            {(() => {
                              // Prefer populated category object, fall back to name lookup by id from categories state,
                              // otherwise show the raw id as a last resort.
                              const catName = (it.category && it.category.name) || (categories.find(c => c.id === it.category_id)?.name) || it.category_id
                              return <span className={`${getCategoryColor(catName)} rounded-full px-3 py-1 text-xs font-semibold`}>{catName}</span>
                            })()}
                          </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">Rp {Number(it.price).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        {editingId === it.id ? (
                          <div className="flex items-center gap-2">
                            <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className="w-24 px-2 py-1 rounded border-2 border-gray-200" />
                            <button onClick={() => saveEdit(it.id)} className="text-sm text-green-600 font-semibold">Simpan</button>
                            <button onClick={cancelEdit} className="text-sm text-gray-500">Batal</button>
                          </div>
                        ) : (
                          <span className={`${it.stock > 20 ? 'text-green-600' : it.stock > 10 ? 'text-orange-600' : 'text-red-600'} font-bold`}>{it.stock}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{it.unit}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => startEdit(it)} className="text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-md">Edit</button>
                      </td>
                    </tr>
                    {editingId === it.id && (
                      <tr className="bg-white">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                            <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="px-3 py-2 rounded border-2 border-gray-200" />
                            <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="px-3 py-2 rounded border-2 border-gray-200" />
                            <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="px-3 py-2 rounded border-2 border-gray-200">
                              <option value="">Pilih kategori</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="flex items-center gap-2">
                              <select value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })} className="px-3 py-2 rounded border-2 border-gray-200">
                                <option value="pcs">pcs</option>
                                <option value="pack">pack</option>
                                <option value="bottle">bottle</option>
                              </select>
                              <button onClick={() => saveEdit(it.id)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded">Simpan Perubahan</button>
                              <button onClick={cancelEdit} className="text-sm text-gray-500">Batal</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
    </div>
  )
}
