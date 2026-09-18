import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, KeyRound, X } from 'lucide-react'
import { toolAPI } from '../services/api'
import '../styles/modal.css'

export function CredentialsModal({ isOpen, tool, onClose, onSaved }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [savedCredentials, setSavedCredentials] = useState({ username: '', password: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !tool?.id) {
      setIsEditing(false)
      setShowPassword(false)
      setError('')
      return
    }

    let isMounted = true
    const loadCredentials = async () => {
      setIsLoading(true)
      setError('')
      setIsEditing(false)
      setShowPassword(false)
      try {
        const response = await toolAPI.getCredentials(tool.id)
        if (!isMounted) return
        if (response.success) {
          const loaded = {
            username: response.data?.username || '',
            password: response.data?.password || '',
          }
          setCredentials(loaded)
          setSavedCredentials(loaded)
        } else {
          setError(response.error || 'Unable to load credentials')
        }
      } catch (err) {
        if (!isMounted) return
        setError(err.response?.data?.error || 'Unable to load credentials')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCredentials()
    return () => {
      isMounted = false
    }
  }, [isOpen, tool?.id])

  const handleStartEdit = (event) => {
    event?.preventDefault()
    event?.stopPropagation()
    setError('')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setCredentials(savedCredentials)
    setError('')
    setIsEditing(false)
  }

  const saveCredentials = async (event) => {
    event.preventDefault()
    if (!isEditing || !tool?.id) return
    setIsSaving(true)
    setError('')
    try {
      const response = await toolAPI.updateCredentials(tool.id, credentials)
      if (!response.success) {
        setError(response.error || 'Unable to save credentials')
        return
      }
      const updated = {
        username: response.data?.username || '',
        password: response.data?.password || '',
      }
      setCredentials(updated)
      setSavedCredentials(updated)
      setIsEditing(false)
      onSaved?.('Credentials updated successfully')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save credentials')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !tool) return null

  const notConfigured = 'Not configured'
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal credentials-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2><KeyRound size={20} /> {tool.name} Credentials</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close credentials"><X size={20} /></button>
        </div>
        <div className="modal-body">
          {isLoading ? <p>Loading credentials...</p> : (
            <form onSubmit={saveCredentials}>
              {error && <p className="error-text">{error}</p>}
              <div className="form-group">
                <label>Username</label>
                {isEditing ? (
                  <input
                    placeholder="Enter username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    autoComplete="username"
                  />
                ) : (
                  <p className="credential-value">{credentials.username || notConfigured}</p>
                )}
              </div>
              <div className="form-group">
                <label>Password</label>
                {isEditing ? (
                  <div className="credential-password-input">
                    <input
                      placeholder="Enter password"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                ) : (
                  <div className="credential-display-row">
                    <p className="credential-value">{credentials.password ? (showPassword ? credentials.password : '••••••••') : notConfigured}</p>
                    {credentials.password && (
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                {isEditing ? (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} disabled={isSaving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button type="button" className="btn btn-primary" onClick={handleStartEdit}>Edit Credentials</button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
