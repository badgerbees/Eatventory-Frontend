import React, { useEffect, useState } from 'react'
import { getByCategory } from '../api/backend'

export default function AnalyticsPage() {
  const [byCategory, setByCategory] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await getByCategory()
        if (!mounted) return
        setByCategory(res || {})
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => (mounted = false)
  }, [])

  if (loading) return <div className="p-6">Memuat analitik…</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
  <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📊 Analitik</h2>
          <p className="text-gray-600">Ringkasan revenue dan unit per kategori</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(byCategory || {}).map(([cat, data]) => (
            <div key={cat} className="bg-white rounded-2xl p-4 shadow">
              <h3 className="font-medium text-gray-800">{cat}</h3>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-lg font-semibold mt-1">Rp {data.revenue ?? 0}</p>
              <p className="text-sm text-gray-500 mt-2">Unit terjual: {data.units ?? data.quantity ?? 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
