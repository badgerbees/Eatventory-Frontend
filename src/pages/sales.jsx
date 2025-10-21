import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getItems, getCategories as fetchCategories, recordSale, updateItem } from '../api/backend'

export default function SalesPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSaleId, setActiveSaleId] = useState(null)
  const [saleQty, setSaleQty] = useState(1)
  const [counters, setCounters] = useState({})
  const [loading, setLoading] = useState(true)
  const [submittingCommit, setSubmittingCommit] = useState(false)
  const { idToken: authIdToken, user } = useAuth()
  const [idToken, setIdToken] = useState('')

  function uidFromToken(token) {
    if (!token) return null
    try {
      const parts = token.split('.')
      if (parts.length < 2) return null
      const payload = parts[1]
      // base64url decode
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const json = decodeURIComponent(atob(b64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      const obj = JSON.parse(json)
      return obj.sub || obj.user_id || obj.uid || null
    } catch (e) {
      return null
    }
  }

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
        // load today's counters from localStorage
        const today = new Date().toISOString().slice(0, 10)
        const raw = localStorage.getItem(`sales_${today}`)
        if (raw) {
          try {
            setCounters(JSON.parse(raw))
          } catch (e) {
            setCounters({})
          }
        }
      } catch (e) {
        console.error('Failed to load items:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    // read saved id token (if any) or prefer AuthContext
    try {
      const stored = authIdToken || (typeof localStorage !== 'undefined' && (localStorage.getItem('idToken') || localStorage.getItem('firebase_id_token') || localStorage.getItem('token')))
      if (stored) setIdToken(stored)
    } catch (e) {
      // ignore
    }
    return () => (mounted = false)
  }, [])

  const startSale = (it) => { setActiveSaleId(it.id); setSaleQty(1) }
  const cancelSale = () => { setActiveSaleId(null); setSaleQty(1) }

  const doSale = async (it) => {
    // legacy single-item sale (kept for direct Jual action)
    if (!saleQty || saleQty <= 0) return alert('Masukkan jumlah penjualan yang valid')
    if (it.stock < saleQty) return alert('Stok tidak cukup')
    try {
      const effectiveToken = authIdToken || idToken
      const cashierId = (user && user.uid) || uidFromToken(effectiveToken)
      if (!cashierId) return alert('Anda harus masuk untuk merekam penjualan (atau paste ID token).')
      const payload = { items: [{ item_id: it.id, quantity: Number(saleQty) }], cashier_id: cashierId }
      await recordSale(payload, effectiveToken)
      await updateItem(it.id, { stock: Number(it.stock) - Number(saleQty) })
      const its = await getItems()
      setItems(its || [])
      cancelSale()
      // also update today's counters in storage
      const today = new Date().toISOString().slice(0, 10)
      const next = { ...(counters || {}) }
      next[it.id] = (next[it.id] || 0) + Number(saleQty)
      setCounters(next)
      localStorage.setItem(`sales_${today}`, JSON.stringify(next))
    } catch (err) {
      console.error('Failed to record sale:', err)
      alert('Gagal mencatat penjualan: ' + (err?.message || String(err)))
    }
  }

  const getCategoryName = (it) => (it.category && it.category.name) || (categories.find(c => c.id === it.category_id)?.name) || it.category_id

  if (loading) return <div className="p-6">Memuat data…</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-8 animate-[fadeIn_0.6s_ease-in]">
        <div className="bg-gradient-to-r from-yellow-50 via-pink-50 to-indigo-50 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">🧾 Rekam Penjualan</h2>
          <div className="mb-4 flex items-center gap-3 justify-end">
            {authIdToken ? (
              <div className="flex items-center gap-2">
                {/* Signed-in email intentionally hidden on this page for privacy */}
                <button onClick={() => { localStorage.removeItem('idToken'); localStorage.removeItem('firebase_id_token'); localStorage.removeItem('token'); setIdToken('') }} className="text-xs text-gray-500 underline">Remove</button>
              </div>
            ) : idToken ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600">Auth: saved</span>
                <button onClick={() => { localStorage.removeItem('idToken'); localStorage.removeItem('firebase_id_token'); localStorage.removeItem('token'); setIdToken('') }} className="text-xs text-gray-500 underline">Remove</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input value={idToken} onChange={e => setIdToken(e.target.value)} placeholder="Paste ID token" className="px-3 py-1 rounded border" />
                <button onClick={() => { try { localStorage.setItem('idToken', idToken); alert('Token saved') } catch (e) { alert('Failed to save token') } }} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Save</button>
              </div>
            )}
          </div>

          {/* Minimal: only Commit button */}
          <div className="mb-6 flex justify-end">
            <button disabled={submittingCommit} onClick={async () => {
              // commit all counters: build payload with items that have qty>0
              const today = new Date().toISOString().slice(0,10)
              const saleItems = Object.entries(counters || {}).filter(([id, q]) => Number(q) > 0).map(([id,q]) => ({ item_id: id, quantity: Number(q) }))
              if (saleItems.length === 0) return alert('Tidak ada penjualan untuk dikommit')
              try {
                setSubmittingCommit(true)
                // generate a client-side idempotency key to avoid duplicate commits on double-click
                const idempotencyKey = `${new Date().toISOString()}_${Math.random().toString(36).slice(2,10)}`
                const effectiveToken = authIdToken || idToken
                const cashierId = (user && user.uid) || uidFromToken(effectiveToken)
                if (!cashierId) return alert('Anda harus masuk untuk merekam penjualan (atau paste ID token).')
                await recordSale({ items: saleItems, cashier_id: cashierId }, effectiveToken, idempotencyKey)
                // decrement stock for each
                for (const [id, q] of Object.entries(counters || {})) {
                  const qty = Number(q || 0)
                  if (qty <= 0) continue
                  const it = items.find(x => x.id === id)
                  if (!it) continue
                  await updateItem(id, { stock: Number(it.stock) - qty })
                }
                const its = await getItems()
                setItems(its || [])
                setCounters({});
                localStorage.removeItem(`sales_${today}`)
                alert('Penjualan hari ini berhasil dicatat')
              } catch (err) {
                console.error('Failed to commit sales:', err)
                alert('Gagal mencatat penjualan hari ini')
              }
              finally {
                setSubmittingCommit(false)
              }
            }} className="bg-red-500 text-white px-4 py-2 rounded">Commit Hari Ini</button>
          </div>

          <div className="mb-6">
            {/* Filters: stacked on small screens, inline on md+ */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-auto">
                <option value="">Semua kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari nama item..." className="w-full md:w-96 px-3 py-2 border rounded" />
              <div className="flex gap-2 items-center">
                <button onClick={() => { setSelectedCategory(''); setSearchQuery('') }} className="text-sm text-gray-500 underline">Reset</button>
              </div>
            </div>
          </div>

          {/* Desktop table (hidden on small screens) */}
          <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="table-auto w-full">
              <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">📦 Nama</th>
                  <th className="px-6 py-4 text-left font-bold">🏷️ Kategori</th>
                  <th className="px-6 py-4 text-left font-bold">💰 Harga</th>
                  <th className="px-6 py-4 text-left font-bold">📊 Stok</th>
                  <th className="px-6 py-4 text-left font-bold">⚙️ Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter(it => {
                    if (selectedCategory && String(it.category_id) !== String(selectedCategory)) return false
                    if (searchQuery && !String(it.name).toLowerCase().includes(searchQuery.toLowerCase())) return false
                    return true
                  })
                  .map((it, idx) => (
                    <React.Fragment key={it.id}>
                      <tr className={`${idx % 2 === 0 ? 'bg-pink-50' : 'bg-blue-50'} hover:bg-yellow-100 transition-all duration-300 transform hover:scale-[1.01]`}>
                        <td className="px-6 py-4 font-semibold text-gray-800">{it.name}</td>
                        <td className="px-6 py-4"><span className="rounded-full px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold">{getCategoryName(it)}</span></td>
                        <td className="px-6 py-4">Rp {Number(it.price).toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">{it.stock}</td>
                        <td className="px-6 py-4">
                          {activeSaleId === it.id ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSaleQty(Math.max(1, saleQty - 1))} className="px-3 py-1 rounded bg-gray-100">-</button>
                              <input type="number" value={saleQty} onChange={e => setSaleQty(Number(e.target.value))} className="w-20 px-2 py-1 rounded border-2 border-gray-200" />
                              <button onClick={() => setSaleQty(saleQty + 1)} className="px-3 py-1 rounded bg-gray-100">+</button>
                              <button onClick={() => doSale(it)} className="bg-gradient-to-r from-red-500 to-orange-400 text-white px-3 py-1 rounded">Jual</button>
                              <button onClick={cancelSale} className="text-sm text-gray-500">Batal</button>
                            </div>
                          ) : (
                            <button onClick={() => startSale(it)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded">Rekam Jual</button>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card/list view */}
          <div className="sm:hidden space-y-3">
            {items
              .filter(it => {
                if (selectedCategory && String(it.category_id) !== String(selectedCategory)) return false
                if (searchQuery && !String(it.name).toLowerCase().includes(searchQuery.toLowerCase())) return false
                return true
              })
              .map(it => (
                <div key={it.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{it.name}</div>
                      <div className="text-xs text-gray-500">{getCategoryName(it)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">Rp {Number(it.price).toLocaleString('id-ID')}</div>
                      <div className="text-xs text-gray-500">Stok: {it.stock}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      {activeSaleId === it.id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSaleQty(Math.max(1, saleQty - 1))} className="w-10 h-10 rounded bg-gray-100">-</button>
                          <input type="number" value={saleQty} onChange={e => setSaleQty(Number(e.target.value))} className="w-full px-2 py-2 rounded border-2 border-gray-200 text-center" />
                          <button onClick={() => setSaleQty(saleQty + 1)} className="w-10 h-10 rounded bg-gray-100">+</button>
                        </div>
                      ) : (
                        <button onClick={() => startSale(it)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded">Rekam Jual</button>
                      )}
                    </div>
                    <div>
                      {activeSaleId === it.id ? (
                        <div className="flex flex-col gap-2">
                          <button onClick={() => doSale(it)} className="w-full bg-gradient-to-r from-red-500 to-orange-400 text-white px-3 py-2 rounded">Jual</button>
                          <button onClick={cancelSale} className="w-full text-sm text-gray-500">Batal</button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">&nbsp;</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
