import axios from 'axios'

const browserBackendOrigin = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : 'http://localhost:5000'
const envApiUrl = import.meta.env.VITE_API_URL?.trim()
const isLocalOnlyApi = (value) => /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(value || '')
const API_URL = envApiUrl && !isLocalOnlyApi(envApiUrl)
  ? envApiUrl
  : `${browserBackendOrigin}/api`

const BACKEND_BASE_URL = API_URL.replace(/\/api\/?$/, '')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper function to get the correct backend URL for uploaded files
export const getAssetUrl = (path) => {
  if (!path) return null
  
  // If path already starts with http, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Construct full backend URL
  return `${BACKEND_BASE_URL}/${cleanPath}`
}

// Tool API endpoints
export const toolAPI = {
  // Get all tools (top-level)
  getTools: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.favorites) params.append('favorites', 'true')
    
    const response = await api.get('/tools', { params })
    return response.data
  },

  // Get a specific tool
  getTool: async (id) => {
    const response = await api.get(`/tools/${id}`)
    return response.data
  },

  // Get children of a tool
  getChildren: async (parentId) => {
    const response = await api.get(`/tools/${parentId}/children`)
    return response.data
  },

  // Create a new tool
  createTool: async (formData) => {
    const response = await api.post('/tools', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update a tool
  updateTool: async (id, formData) => {
    const response = await api.put(`/tools/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Credentials are deliberately kept out of normal tool responses.
  getCredentials: async (id) => {
    const response = await api.get(`/tools/${id}/credentials`)
    return response.data
  },

  updateCredentials: async (id, credentials) => {
    const response = await api.put(`/tools/${id}/credentials`, credentials)
    return response.data
  },

  // Delete a tool
  deleteTool: async (id) => {
    const response = await api.delete(`/tools/${id}`)
    return response.data
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await api.patch(`/tools/${id}/favorite`)
    return response.data
  },

  // Health check
  health: async () => {
    const response = await api.get('/health')
    return response.data
  },
}
