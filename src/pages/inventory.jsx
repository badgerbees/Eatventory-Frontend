import React, { useState } from 'react'
import { adjustInventory } from '../api/backend'

export default function InventoryPage() {
  const [itemId, setItemId] = useState('')
  const [amount, setAmount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
  <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔧 Koreksi Inventaris</h2>
          <p className="text-gray-600">Sesuaikan stok item secara manual</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex gap-3">
            <input value={itemId} onChange={e => setItemId(e.target.value)} placeholder="ID item" className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-300 outline-none flex-1" />
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="Jumlah (+/-)" className="px-4 py-3 rounded-lg border-2 border-gray-200 w-40" />
            <button onClick={async () => {
              try {
                const res = await adjustInventory({ item_id: itemId, amount, reason: 'correction' }, null)
                alert(`Stok baru: ${res.new_stock}`)
              } catch (err) { alert(err.message || err) }
            }} className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold">Koreksi</button>
          </div>
        </div>
      </div>
    </div>
  )
}
