// Use VITE_API_URL (recommended) or fall back to legacy VITE_BACKEND_URL or localhost for development
const BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

import { auth } from '../firebase'

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Resolve token by preferring a fresh token from firebase auth.currentUser when available.
// Fallback to common localStorage keys for backward compatibility.
async function resolveToken(token) {
  if (token) return token
  try {
    if (auth && auth.currentUser && typeof auth.currentUser.getIdToken === 'function') {
      const t = await auth.currentUser.getIdToken()
      if (typeof localStorage !== 'undefined') localStorage.setItem('idToken', t)
      return t
    }
  } catch (e) {
    // ignore and fall back to localStorage
    console.debug('[backend.resolveToken] failed to get token from auth.currentUser:', e)
  }
  return (typeof localStorage !== 'undefined' && (localStorage.getItem('idToken') || localStorage.getItem('firebase_id_token') || localStorage.getItem('token'))) || null
}

export async function getTotalRevenue() {
  const resolvedToken = await resolveToken()
  const headers = { ...authHeader(resolvedToken) }
  const res = await fetch(`${BASE}/reports/total_revenue`, { headers })
  if (!res.ok) throw new Error('Failed to fetch total revenue')
  return res.json()
}

export async function getByCategory() {
  const resolvedToken = await resolveToken()
  const headers = { ...authHeader(resolvedToken) }
  const res = await fetch(`${BASE}/reports/by_category`, { headers })
  if (!res.ok) throw new Error('Failed to fetch by category')
  return res.json()
}

export async function getDaily(datePrefix) {
  const resolvedToken = await resolveToken()
  const headers = { ...authHeader(resolvedToken) }
  const res = await fetch(`${BASE}/reports/daily/${datePrefix}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch daily sales')
  return res.json()
}

// Items
export async function getItems() {
  const resolvedToken = await resolveToken()
  const headers = { ...authHeader(resolvedToken) }
  // DEBUG: show whether Authorization header is present
  try { console.debug('[backend.getItems] resolvedToken present:', !!resolvedToken, 'headers:', headers) } catch (e) {}
  const res = await fetch(`${BASE}/items/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

export async function createItem(payload) {
  const resolvedToken = await resolveToken()
  const headers = { 'Content-Type': 'application/json', ...authHeader(resolvedToken) }
  const res = await fetch(`${BASE}/items/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create item')
  return res.json()
}

export async function updateItem(itemId, payload) {
  const resolvedToken = await resolveToken()
  const headers = { ...authHeader(resolvedToken) }
  // Fetch existing item to produce a complete payload (defensive: some backends expect full object)
  const getRes = await fetch(`${BASE}/items/${itemId}`, { headers })
  if (!getRes.ok) {
    const t = await getRes.text().catch(() => '')
    throw new Error(t || `Failed to fetch existing item ${itemId}`)
  }
  const existing = await getRes.json()
  const merged = {
    name: payload.name ?? existing.name,
    category_id: payload.category_id ?? existing.category_id,
    price: payload.price ?? existing.price,
    stock: payload.stock ?? existing.stock,
    unit: payload.unit ?? existing.unit,
  }
  const reqHeaders = { 'Content-Type': 'application/json', ...headers }
  const res = await fetch(`${BASE}/items/${itemId}`, {
    method: 'PATCH',
    headers: reqHeaders,
    body: JSON.stringify(merged),
  })
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || ''
    let bodyText = ''
    try {
      if (contentType.includes('application/json')) {
        const data = await res.json()
        bodyText = JSON.stringify(data)
      } else {
        bodyText = await res.text()
      }
    } catch (e) {
      bodyText = `Failed to update item (status ${res.status})`
    }
    throw new Error(bodyText || `Failed to update item (status ${res.status})`)
  }
  return res.json()
}

// Categories
export async function getCategories() {
  const resolvedToken = await resolveToken()
  const headers = { ...authHeader(resolvedToken) }
  const res = await fetch(`${BASE}/categories/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createCategory(payload) {
  const resolvedToken = await resolveToken()
  const headers = { 'Content-Type': 'application/json', ...authHeader(resolvedToken) }
  try { console.debug('[backend.createCategory] resolvedToken present:', !!resolvedToken, 'headers:', headers) } catch (e) {}
  const res = await fetch(`${BASE}/categories/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    // Attempt to parse JSON error details first, but don't read the body more than once.
    // Use a single read and inspect content-type to decide how to present the error.
    const contentType = res.headers.get('content-type') || ''
    let bodyText = ''
    try {
      if (contentType.includes('application/json')) {
        const data = await res.json()
        bodyText = JSON.stringify(data)
      } else {
        bodyText = await res.text()
      }
    } catch (e) {
      // If parsing fails, fall back to a generic message
      bodyText = `Failed to create category (status ${res.status})`
    }
    throw new Error(bodyText || `Failed to create category (status ${res.status})`)
  }
  return res.json()
}

// Inventory adjust
export async function adjustInventory(payload, token) {
  // if token not passed explicitly, try common localStorage keys (idToken/firebase_id_token)
  const resolvedToken = token || await resolveToken()
  const headers = { 'Content-Type': 'application/json', ...authHeader(resolvedToken) }
  const res = await fetch(`${BASE}/inventory/adjust`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to adjust inventory')
  }
  return res.json()
}

// Sales
export async function recordSale(payload, token) {
  // if token not passed explicitly, try common localStorage keys (idToken/firebase_id_token)
  const resolvedToken = token || await resolveToken()
  const headers = { 'Content-Type': 'application/json', ...authHeader(resolvedToken) }
  const res = await fetch(`${BASE}/sales/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to record sale')
  }
  return res.json()
}
