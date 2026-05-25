const API_BASE = '/api'

export class ApiError extends Error {
  constructor(message, details = null, status = null) {
    super(message)
    this.name = 'ApiError'
    this.details = details
    this.status = status
  }
}

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))

  return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : ''
}

function getFirstError(payload, fallback) {
  if (payload && typeof payload === 'object') {
    const firstError = Object.values(payload).flat().find(Boolean)

    if (firstError) {
      return String(firstError)
    }
  }

  return fallback
}

export async function getCsrfToken() {
  let csrfToken = getCookie('csrftoken')

  if (!csrfToken) {
    await fetch(`${API_BASE}/`, {
      credentials: 'include',
    })
    csrfToken = getCookie('csrftoken')
  }

  return csrfToken
}

async function requestJson(path, { method = 'GET', body, headers = {}, csrf = false } = {}) {
  const finalHeaders = { ...headers }
  let requestBody = body

  if (csrf) {
    finalHeaders['X-CSRFToken'] = await getCsrfToken()
  }

  if (body instanceof FormData) {
    requestBody = body
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: requestBody,
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(getFirstError(payload, 'No se pudo completar la solicitud.'), payload, response.status)
  }

  return payload
}

export async function fetchCurrentUser() {
  return requestJson('/me/')
}

export async function loginUser(credentials) {
  return requestJson('/login/', {
    method: 'POST',
    body: credentials,
    csrf: true,
  })
}

export async function registerUser(payload) {
  return requestJson('/register/', {
    method: 'POST',
    body: payload,
    csrf: true,
  })
}

export async function logoutUser() {
  return requestJson('/logout/', {
    method: 'POST',
    csrf: true,
  })
}

export async function getCategories() {
  return requestJson('/categories/')
}

export async function getPublicationsFeed({ filter = 'new', category = '' } = {}) {
  const params = new URLSearchParams()

  params.set('filter', filter)

  if (category) {
    params.set('category', category)
  }

  return requestJson(`/publications/all/?${params.toString()}`)
}

export async function getPublication(listingId) {
  return requestJson(`/publications/${listingId}/`)
}

export async function getMyPublications() {
  return requestJson('/publications/')
}

export async function createPublication({ title, price, category, location, description, images = [] }) {
  const formPayload = new FormData()

  formPayload.append('title', title)
  formPayload.append('price', price)
  formPayload.append('category', category)
  formPayload.append('location', location)
  formPayload.append('description', description)

  images.forEach((imageFile) => {
    formPayload.append('images', imageFile)
  })

  return requestJson('/publications/', {
    method: 'POST',
    body: formPayload,
    csrf: true,
  })
}

export async function updatePublication(listingId, payload) {
  return requestJson(`/publications/${listingId}/`, {
    method: 'PATCH',
    body: payload,
    csrf: true,
  })
}

export async function setPublicationPaused(listingId, isPaused) {
  return requestJson(`/publications/${listingId}/`, {
    method: 'PATCH',
    body: { is_paused: isPaused },
    csrf: true,
  })
}

export async function createPublicationQuestion(listingId, body) {
  return requestJson(`/publications/${listingId}/questions/`, {
    method: 'POST',
    body: { body },
    csrf: true,
  })
}

export async function createQuestionAnswer(questionId, body) {
  return requestJson(`/questions/${questionId}/answers/`, {
    method: 'POST',
    body: { body },
    csrf: true,
  })
}

export async function getAdminPublications({ range, query = '', ordering = '-created_at', page = 1, pageSize = 20 }) {
  const params = new URLSearchParams()

  params.set('range', range)
  if (query) params.set('q', query)
  if (ordering) params.set('ordering', ordering)
  params.set('page', String(page))
  params.set('page_size', String(pageSize))

  return requestJson(`/admin/publications/?${params.toString()}`)
}