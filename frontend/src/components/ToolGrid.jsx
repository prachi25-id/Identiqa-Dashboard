import React from 'react'
import { ToolCard } from './ToolCard'
import '../styles/toolgrid.css'

export function ToolGrid({
  tools,
  isLoading,
  onToolClick,
  onEdit,
  onDelete,
  onFavorite,
  onOpenTool,
  onViewCredentials,
}) {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading tools...</span>
      </div>
    )
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>No tools found</h3>
        <p>Try adjusting your search or filter to find what you&apos;re looking for.</p>
      </div>
    )
  }

  return (
    <div className="tool-grid">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onClick={() => tool.child_count > 0 && onToolClick(tool.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onFavorite={onFavorite}
          onOpenTool={onOpenTool}
          onViewCredentials={onViewCredentials}
        />
      ))}
    </div>
  )
}
