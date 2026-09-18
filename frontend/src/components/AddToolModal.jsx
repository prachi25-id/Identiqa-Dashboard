import React, { useState, useEffect } from 'react'
import { X, Upload, AlertCircle } from 'lucide-react'
import { getAssetUrl } from '../services/api'
import '../styles/modal.css'

export function AddToolModal({ isOpen, onClose, onSubmit, allTools = [], mode = 'create', initialTool = null }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'Monitoring',
    description: '',
    username: '',
    password: '',
    parent_id: null,
    favorite: false,
  })
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-populate form when editing
  useEffect(() => {
    if (mode === 'edit' && initialTool) {
      setFormData({
        name: initialTool.name || '',
        url: initialTool.url || '',
        category: initialTool.category || 'Monitoring',
        description: initialTool.description || '',
        username: '',
        password: '',
        parent_id: initialTool.parent_id || null,
        favorite: initialTool.favorite || false,
      })
      // Set existing logo as preview if it exists
      if (initialTool.logo) {
        setLogoPreview(getAssetUrl(initialTool.logo))
        setLogo(null) // Don't upload existing logo unless user changes it
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        url: '',
        category: 'Monitoring',
        description: '',
        username: '',
        password: '',
        parent_id: null,
        favorite: false,
      })
      setLogo(null)
      setLogoPreview(null)
    }
    setErrors({})
  }, [mode, initialTool, isOpen])

  const CATEGORIES = [
    'Monitoring',
    'Cloud',
    'Network',
    'Storage',
    'Service Desk',
    'Network Lab',
    'Logging',
    'Security',
    'Other',
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleParentChange = (e) => {
    const value = e.target.value
    setFormData({
      ...formData,
      parent_id: value ? parseInt(value) : null,
    })
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
      // Clear error
      if (errors.logo) {
        setErrors({ ...errors, logo: null })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('name', formData.name.trim())
      formDataObj.append('url', formData.url.trim())
      formDataObj.append('category', formData.category)
      if (formData.description) {
        formDataObj.append('description', formData.description.trim())
      }
      if (formData.username.trim()) {
        formDataObj.append('username', formData.username.trim())
      }
      if (formData.password) {
        formDataObj.append('password', formData.password)
      }
      if (formData.parent_id) {
        formDataObj.append('parent_id', formData.parent_id)
      }
      formDataObj.append('favorite', formData.favorite)
      if (logo) {
        formDataObj.append('logo', logo)
      }

      // Pass mode and toolId to the parent handler
      await onSubmit(formDataObj, mode, initialTool?.id)
      
      // Reset form
      setFormData({
        name: '',
        url: '',
        category: 'Monitoring',
        description: '',
        username: '',
        password: '',
        parent_id: null,
        favorite: false,
      })
      setLogo(null)
      setLogoPreview(null)
      onClose()
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit Tool' : 'Add New Tool'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Tool Name */}
            <div className="form-group">
              <label>
                Tool Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Prometheus"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Target URL */}
            <div className="form-group">
              <label>
                Target URL <span className="required">*</span>
              </label>
              <input
                type="url"
                name="url"
                placeholder="e.g., http://192.168.1.163:9090"
                value={formData.url}
                onChange={handleInputChange}
                className={errors.url ? 'input-error' : ''}
              />
              {errors.url && <span className="error-text">{errors.url}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label>
                Category <span className="required">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'input-error' : ''}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="error-text">{errors.category}</span>
              )}
            </div>

            {/* Parent Tool */}
            <div className="form-group">
              <label>Parent Tool (Optional)</label>
              <select value={formData.parent_id || ''} onChange={handleParentChange}>
                <option value="">Standalone Tool</option>
                {allTools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                name="description"
                placeholder="Brief description of the tool..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Logo Upload */}
            <div className="form-group">
              <label>Logo (Optional)</label>
              <div className="logo-upload-area">
                {logoPreview ? (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Logo preview" />
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => {
                        setLogo(null)
                        setLogoPreview(null)
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="logo-upload-label">
                    <Upload size={24} />
                    <span>Click to upload or drag and drop</span>
                    <small>PNG, JPG, JPEG, SVG, WEBP up to 5MB</small>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Optional credentials */}
            <div className="form-group">
              <label>Username (Optional)</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Password (Optional)</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
              />
            </div>

            {/* Favorite */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="favorite"
                  checked={formData.favorite}
                  onChange={handleInputChange}
                />
                Add to Favorites
              </label>
            </div>

            {/* Submit Button */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Add to Dashboard')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
