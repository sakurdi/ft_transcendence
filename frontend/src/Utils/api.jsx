export const BASE = '/api'

/**
 * Helper to ensure the path has the correct /api prefix without doubling up.
 * Correctly handles edge cases like /api-keys vs /api/users
 */
function normalizePath(path) {
	if (path.startsWith(BASE + '/') || path === BASE) {
		return path
	}
	// Ensure we don't end up with // if the path already starts with /
	const cleanPath = path.startsWith('/') ? path : `/${path}`
	return `${BASE}${cleanPath}`
}

export default async function api(path, options = {}) {
	try {
		const route = normalizePath(path)
		const res = await fetch(route, {
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			...options,
		})
		if (!res.ok)
			throw (res.status)
		try {
			const json = await res.json()
			return { ok: json.success == true, status: json.message, json: json.data }
		} catch(err) {
			return { ok: true, status: "Success", json: undefined }
		}
	} catch (errorStatus) {
		return { ok: false, status: errorStatus, json: undefined }
	}
}

export async function apiGet(path, options = {}) {
	return api(path, { ...options, method: 'GET' })
}

export async function apiPost(path, options = {}) {
	return api(path, { ...options, method: 'POST' })
}

export async function apiPut(path, options = {}) {
	return api(path, { ...options, method: 'PUT' })
}

export async function apiDelete(path, options = {}) {
	return api(path, { ...options, method: 'DELETE' })
}

export async function apiFormData(path, options = {}) {
	try {
		const route = normalizePath(path)
		const res = await fetch(route, {
			credentials: "include",
			...options,
		})
		if (!res.ok)
			throw (res.status)
		try {
			const json = await res.json()
			return { ok: json.success == true, status: json.message, json: json.data }
		} catch(err) {
			return { ok: true, status: "Success", json: undefined }
		}
	} catch (errorStatus) {
		return { ok: false, status: errorStatus, json: undefined }
	}
}

export async function apiPostFormData(path, options = {}) {
	return apiFormData(path, { ...options, method: 'POST' })
}
