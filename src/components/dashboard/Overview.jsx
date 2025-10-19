import React, { useEffect, useState, useMemo } from 'react'
import { getTotalRevenue, getByCategory } from '../../api/backend'

function IconCash({ className = 'h-6 w-6 text-green-500' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
    </svg>
  )
}

function IconBox({ className = 'h-6 w-6 text-indigo-500' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
    </svg>
  )
}

function IconChart({ className = 'h-6 w-6 text-blue-500' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V9m6 8V5" />
    </svg>
  )
}

export default function Overview() {
  const [total, setTotal] = useState(null)
  const [byCategory, setByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const t = await getTotalRevenue()
        const c = await getByCategory()
        if (!mounted) return
        setTotal(t)
        setByCategory(c)
      } catch (err) {
        setError(err?.message || String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => (mounted = false)
  }, [])

  const summary = useMemo(() => {
    const cats = Object.entries(byCategory || {})
    const totalUnits = cats.reduce((s, [, d]) => s + (d.units ?? d.quantity ?? 0), 0)
    const maxRevenue = cats.reduce((m, [, d]) => Math.max(m, d.revenue ?? 0), 0)
    const top = cats.sort((a, b) => (b[1].revenue ?? 0) - (a[1].revenue ?? 0))[0]
    return {
      totalUnits,
      maxRevenue: maxRevenue || 1,
      topCategory: top ? { id: top[0], ...top[1] } : null,
    }
  }, [byCategory])

  if (loading) return <div className="p-4">Loading overview…</div>
  if (error) return <div className="text-red-600 p-4">{error}</div>

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full">
            <IconCash />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-semibold">Rp {(total?.revenue ?? 0).toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-full">
            <IconBox />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Units Sold</div>
            <div className="text-2xl font-semibold">{summary.totalUnits.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <IconChart />
          </div>
          <div>
            <div className="text-sm text-gray-500">Top Category</div>
            <div className="text-2xl font-semibold">{summary.topCategory?.id ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Category analytics */}
      <section aria-labelledby="analytics-heading" id="analytics">
        <h3 id="analytics-heading" className="text-lg font-medium text-gray-800">Category Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {Object.entries(byCategory || {}).map(([catId, data]) => {
            const revenue = data.revenue ?? 0
            const units = data.units ?? data.quantity ?? 0
            const pct = Math.round((revenue / (summary.maxRevenue || 1)) * 100)
            return (
              <div key={catId} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">{catId}</h4>
                    <p className="mt-1 text-gray-900 font-semibold">Rp {Number(revenue).toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-500 mt-1">Units: {units}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">{pct}%</div>
                </div>

                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
