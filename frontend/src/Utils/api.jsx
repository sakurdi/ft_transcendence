export const BASE = '/api'

export default async function api(path, options = {}) {
	try {
		const route = path.startsWith(BASE) ? path : `${BASE}/${path}`
		const res = await fetch(route, {
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			...options,
		})
		if (!res.ok)
			throw (res.status)
		try {
			const json = await res.json()
			if (json?.success === false)
				return { ok: false, status: "json.success == false", json: undefined }
			return { ok: true, status: "Success", json: json }
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
