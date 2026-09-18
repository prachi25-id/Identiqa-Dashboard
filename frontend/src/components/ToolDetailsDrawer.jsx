import React, { useState, useEffect } from 'react'
import { X, ExternalLink, Plus, Edit2, Trash2, Heart, KeyRound } from 'lucide-react'
import { toolAPI, getAssetUrl } from '../services/api'
import '../styles/drawer.css'

export function ToolDetailsDrawer({
  isOpen,
  toolId,
  onClose,
  onEdit,
  onDelete,
  onFavorite,
  onAddChild,
  onViewCredentials,
}) {
  const [tool, setTool] = useState(null)
  const [children, setChildren] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && toolId) {
      loadToolDetails()
    }
  }, [isOpen, toolId])

  const loadToolDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await toolAPI.getTool(toolId)
      if (response.success) {
        setTool(response.data)
        setChildren(response.data.children || [])
      }
    } catch (err) {
      setError('Failed to load tool details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenTool = () => {
    if (tool?.url) {
      window.open(tool.url, '_blank')
    }
  }

  const handleEditClick = () => {
    onEdit(tool.id)
    onClose()
  }

  const handleDeleteClick = () => {
    onDelete(tool.id)
    onClose()
  }

  const handleFavoriteClick = () => {
    onFavorite(tool.id)
    setTool({ ...tool, favorite: !tool.favorite })
  }

  const handleAddChildClick = () => {
    onAddChild(tool.id)
    onClose()
  }

  const handleOpenChild = (url) => {
    window.open(url, '_blank')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading tool details...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--error-color)' }}>
            {error}
          </div>
        ) : tool ? (
          <>
            <div className="drawer-header">
              <h2>{tool.name}</h2>
              <button className="btn-icon" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Logo */}
              {tool.logo && (
                <div className="drawer-logo">
                  <img
                    src={getAssetUrl(tool.logo)}
                    alt={tool.name}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Info */}
              <div className="drawer-info">
                <div className="info-group">
                  <label>Category</label>
                  <p>{tool.category}</p>
                </div>

                {tool.description && (
                  <div className="info-group">
                    <label>Description</label>
                    <p>{tool.description}</p>
                  </div>
                )}

                <div className="info-group">
                  <label>URL</label>
                  <p className="tool-url">{tool.url}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="drawer-actions">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleOpenTool}
                >
                  <ExternalLink size={18} />
                  Open Tool
                </button>
                <button
                  className={`btn btn-icon ${tool.favorite ? 'active' : ''}`}
                  onClick={handleFavoriteClick}
                  title={tool.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={18} fill={tool.favorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  className="btn btn-icon"
                  onClick={handleEditClick}
                  title="Edit tool"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="btn btn-icon"
                  onClick={() => onViewCredentials(tool)}
                  title="View credentials"
                >
                  <KeyRound size={18} />
                </button>
                <button
                  className="btn btn-icon btn-danger"
                  onClick={handleDeleteClick}
                  title="Delete tool"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Children */}
              {children.length > 0 && (
                <div className="drawer-section">
                  <div className="section-header">
                    <h3>Sub-tools & Services ({children.length})</h3>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleAddChildClick}
                    >
                      <Plus size={16} />
                      Add Sub-tool
                    </button>
                  </div>

                  <div className="children-list">
                    {children.map((child) => {
                      const childLogo = child.logo ? getAssetUrl(child.logo) : null

                      return (
                        <div key={child.id} className="child-item card">
                          <div className="child-header">
                            <div className="child-title-row">
                              {childLogo && (
                                <img
                                  src={childLogo}
                                  alt={child.name}
                                  className="child-logo"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              )}
                              <div>
                                <h4>{child.name}</h4>
                                <p className="child-description">{child.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="child-actions">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleOpenChild(child.url)
                            }}
                          >
                            <ExternalLink size={14} />
                            Open
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={(event) => {
                              event.stopPropagation()
                              onViewCredentials(child)
                            }}
                            title="View credentials"
                          >
                            <KeyRound size={14} />
                            Credentials
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={(event) => {
                              event.stopPropagation()
                              onEdit(child.id)
                            }}
                            title="Edit sub-tool"
                          >
                            Edit
                          </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(event) => {
                                event.stopPropagation()
                                onDelete(child.id)
                              }}
                              title="Delete sub-tool"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {children.length === 0 && (
                <div className="drawer-section">
                  <div className="section-header">
                    <h3>Sub-tools & Services</h3>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleAddChildClick}
                    >
                      <Plus size={16} />
                      Add Sub-tool
                    </button>
                  </div>
                  <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    No sub-tools yet. Add one to get started.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}
