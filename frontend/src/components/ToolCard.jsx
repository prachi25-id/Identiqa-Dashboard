import React from 'react'
import { Heart, Edit2, Trash2, ExternalLink, KeyRound } from 'lucide-react'
import { getAssetUrl } from '../services/api'
import '../styles/toolcard.css'

export function ToolCard({
  tool,
  onClick,
  onEdit,
  onDelete,
  onFavorite,
  onOpenTool,
  onViewCredentials,
}) {
  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    onFavorite(tool.id)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    onEdit(tool.id)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    onDelete(tool.id)
  }

  const handleOpenClick = (e) => {
    e.stopPropagation()
    onOpenTool(tool.url)
  }

  const handleCredentialsClick = (e) => {
    e.stopPropagation()
    onViewCredentials(tool)
  }

  // Get the correct backend URL for the logo
  const logoUrl = tool.logo ? getAssetUrl(tool.logo) : null

  return (
    <div className="tool-card card" onClick={onClick}>
      {/* Logo */}
      <div className="tool-card-logo">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={tool.name}
            className="tool-logo-image"
            onError={(e) => {
              // Fallback to placeholder on error
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="logo-placeholder" style={{ display: logoUrl ? 'none' : 'flex' }}>
          🔧
        </div>
      </div>

      {/* Content */}
      <div className="tool-card-content">
        <div className="tool-header">
          <div>
            <h3 className="tool-name">{tool.name}</h3>
            <p className="tool-category">{tool.category}</p>
          </div>
          <button
            className={`btn-favorite ${tool.favorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={tool.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={tool.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <p className="tool-description">{tool.description}</p>

        {tool.child_count > 0 && (
          <p className="tool-children">
            {tool.child_count} {tool.child_count === 1 ? 'sub-tool' : 'sub-tools'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="tool-card-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={handleOpenClick}
          title="Open tool in new tab"
        >
          <ExternalLink size={16} />
          Open
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={handleCredentialsClick}
          title="View credentials"
        >
          <KeyRound size={16} />
          Credentials
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={handleEditClick}
          title="Edit tool"
        >
          <Edit2 size={16} />
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={handleDeleteClick}
          title="Delete tool"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
