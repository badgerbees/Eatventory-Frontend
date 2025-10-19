import React, { useEffect, useState } from 'react'
import { getTotalRevenue, getByCategory, getDaily, getItems, getCategories } from '../api/backend'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ items: 0, stock: 0, revenue: 0, categories: 0 })
  const [chartData, setChartData] = useState([])
  const [byCategory, setByCategory] = useState({})
  const [recentSales, setRecentSales] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const [totalRes, byCatRes, itemsRes, catsRes] = await Promise.all([
          getTotalRevenue().catch(() => null),
          getByCategory().catch(() => ({})),
          getItems().catch(() => []),
          getCategories().catch(() => []),
        ])

        if (!mounted) return

        const itemsCount = (itemsRes || []).length
        const categoriesCount = (catsRes || []).length
        const stockTotal = (itemsRes || []).reduce((s, it) => s + (Number(it.stock) || 0), 0)
        const revenueTotal = (totalRes && (totalRes.revenue ?? totalRes.total ?? totalRes.amount)) || 0

        setStats({ items: itemsCount, stock: `${stockTotal} pcs`, revenue: revenueTotal ? `Rp ${Number(revenueTotal).toLocaleString('id-ID')}` : 'Rp 0', categories: categoriesCount })
        setByCategory(byCatRes || {})

        // Build chart for last 7 days using getDaily(datePrefix)
        const days = []
        const now = new Date()
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(now.getDate() - i)
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          days.push({ label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], date: `${yyyy}-${mm}-${dd}` })
        }

        const dailyPromises = days.map(d => getDaily(d.date).catch(() => null))
        const dailyResults = await Promise.all(dailyPromises)
        if (!mounted) return

        // Build chart values in THOUSANDS (K) and compute relative pct using raw values
        const rawValues = dailyResults.map(res => Number((res && (res.revenue ?? res.total ?? res.amount ?? res.sum)) || 0))
        const maxRaw = Math.max(...rawValues, 1)
        const chart = days.map((d, idx) => {
          const raw = rawValues[idx] || 0
          const valueK = Number((raw / 1000).toFixed(1)) // value in thousands
          const pct = Math.round((raw / maxRaw) * 100) || 0
          return { day: d.label, raw, valueK, pct }
        })

        setChartData(chart)

        // recent sales: try to extract from today's daily response if it contains sales list
        const todayIdx = days.length - 1
        const todayRes = dailyResults[todayIdx]
        let recent = []

        // Build lookup maps for items and categories from fetched lists
        const itemsById = (itemsRes || []).reduce((m, it) => {
          const key = it.id || it._id || it.item_id || it.uid || it.name
          if (key) m[key] = it
          return m
        }, {})
        const catsById = (catsRes || []).reduce((m, c) => {
          const key = c.id || c._id || c.category_id || c.uid
          if (key) m[key] = c
          return m
        }, {})

        if (todayRes && Array.isArray(todayRes.sales) && todayRes.sales.length > 0) {
          const todayDate = days[todayIdx]?.date || ''
          recent = todayRes.sales.slice(0, 10).map(s => {
            // Many sale documents store an `items` array with item_id, quantity, price
            const first = Array.isArray(s.items) && s.items.length > 0 ? s.items[0] : null
            let itemName = 'Unknown item'
            let categoryName = '-'
            let qty = 0
            let itemTotal = 0

            if (first) {
              qty = first.quantity ?? first.qty ?? first.units ?? 0
              const itemDoc = itemsById[first.item_id] || itemsById[first.id] || null
              if (itemDoc) {
                itemName = itemDoc.name || itemDoc.title || itemDoc.item_name || itemName
                // category might be stored as id on itemDoc
                const catId = itemDoc.category_id || itemDoc.category || itemDoc.cat_id
                if (catId && catsById[catId]) categoryName = catsById[catId].name || categoryName
                else if (itemDoc.category && typeof itemDoc.category === 'string') categoryName = itemDoc.category
              } else {
                // fallback to any name on the sale item entry
                itemName = first.name || first.item_name || itemName
              }
              itemTotal = (first.price ?? 0) * (Number(qty) || 0)
            }

            // If there are multiple items, compute overall qty and total from items
            if (!first && Array.isArray(s.items) && s.items.length > 0) {
              qty = s.items.reduce((acc, it) => acc + (Number(it.quantity ?? it.qty ?? it.units ?? 0) || 0), 0)
            }

            // final total: prefer sale-level stored total, otherwise compute sum of items
            const totalVal = s.total ?? s.total_amount ?? s.revenue ?? null
            const total = totalVal !== null && totalVal !== undefined && totalVal !== 0
              ? (typeof totalVal === 'number' ? `Rp ${Number(totalVal).toLocaleString('id-ID')}` : totalVal)
              : `Rp ${Number(itemTotal || 0).toLocaleString('id-ID')}`

            // Format date/time for display (fall back to original string if parsing fails)
            const rawDate = s.timestamp || s.date || todayDate || ''
            let dateDisplay = rawDate
            try {
              const dt = new Date(rawDate)
              if (!isNaN(dt.getTime())) {
                // Format as YYYY-MM-DD HH:MM
                const pad = (n) => String(n).padStart(2, '0')
                dateDisplay = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
              }
            } catch (e) {
              // keep rawDate
            }

            // If itemName looks like an ISO timestamp (happens when sale had no items), replace with a neutral label
            const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:?/.test(String(itemName))
            if (isoLike) itemName = 'Sale'

            return {
              item: itemName,
              category: categoryName,
              qty: qty || 0,
              total,
              date: dateDisplay,
            }
          })
        } else {
          // fallback: list most recently updated items (from itemsRes) as placeholders
          recent = (itemsRes || []).slice(0, 5).map(it => ({ item: it.name, category: (it.category && it.category.name) || it.category_id || '-', qty: it.sold ?? 0, total: `Rp ${Number(it.price || 0).toLocaleString('id-ID')}`, date: it.updated_at || '' }))
        }

        setRecentSales(recent)
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setError(err.message || String(err))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()
    return () => (mounted = false)
  }, [])

  if (loading) return <div className="p-6">Memuat dashboard…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-violet-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-[fadeIn_0.6s_ease-in]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 via-orange-300 to-violet-400 rounded-2xl shadow-lg p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🍽️ Eatventory Dashboard</h1>
          <p className="text-white/90 text-sm md:text-base">Monitor your canteen's performance at a glance</p>
        </div>

  {/* Stats Cards */}
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div className={`bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl shadow-md p-6 text-white`}>
            <div className="text-4xl mb-3">🍔</div>
            <div className="text-sm opacity-90 mb-1">Items</div>
            <div className="text-2xl md:text-3xl font-bold">{stats.items}</div>
          </div>

          <div className={`bg-gradient-to-br from-lime-400 to-green-400 rounded-xl shadow-md p-6 text-white`}>
            <div className="text-4xl mb-3">📦</div>
            <div className="text-sm opacity-90 mb-1">Stock</div>
            <div className="text-2xl md:text-3xl font-bold">{stats.stock}</div>
          </div>

          <div className={`bg-gradient-to-br from-teal-400 to-blue-400 rounded-xl shadow-md p-6 text-white`}>
            <div className="text-4xl mb-3">💸</div>
            <div className="text-sm opacity-90 mb-1">Revenue</div>
            <div className="text-2xl md:text-3xl font-bold">{stats.revenue}</div>
          </div>

          <div className={`bg-gradient-to-br from-purple-400 to-violet-400 rounded-xl shadow-md p-6 text-white`}>
            <div className="text-4xl mb-3">🏷️</div>
            <div className="text-sm opacity-90 mb-1">Categories</div>
            <div className="text-2xl md:text-3xl font-bold">{stats.categories}</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-pink-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📈</span>
            <span>Sales Overview</span>
          </h2>
          <div className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-xl p-4 sm:p-6">
            <div className="flex items-end justify-around h-40 sm:h-64 gap-2">
              {chartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-[36px]">
                  <div className="text-xs font-semibold text-gray-700 mb-2">{data.valueK}K</div>
                  <div className="w-full bg-gradient-to-t from-teal-400 to-blue-400 rounded-t-lg transition-all duration-500 shadow-md" style={{ height: `${24 + (data.pct || 0) * 0.8}px` }} />
                  <div className="text-xs font-medium text-gray-600 mt-2">{data.day}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">Revenue</div>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-100">
          <div className="bg-gradient-to-r from-teal-400 to-blue-400 text-white px-6 py-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><span>🧾</span><span>Recent Sales</span></h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] md:min-w-full">
              <thead className="bg-gradient-to-r from-teal-100 to-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, idx) => (
                  <tr key={idx} className={`${idx % 2 === 0 ? 'bg-pink-50' : 'bg-violet-50'} hover:bg-orange-100 transition-colors duration-200`}>
                    <td className="px-3 sm:px-6 py-3 text-sm font-medium text-gray-800">{sale.item}</td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-gray-600">{sale.category}</td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-gray-600">{sale.qty}</td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-semibold text-teal-600">{sale.total}</td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-gray-600">{sale.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-sm text-gray-500">Eatventory © 2025 — Smart Canteen Management</div>
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