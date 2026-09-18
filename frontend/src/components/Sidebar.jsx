import React from 'react'
import { Plus, Settings, Home, Heart, X } from 'lucide-react'
import '../styles/sidebar.css'

const CATEGORIES = [
  'All Tools',
  'Favorites',
  'Monitoring',
  'Cloud',
  'OpenStack',
  'Network',
  'Storage',
  'Service Desk',
  'Network Lab',
  'Logging',
  'Security',
  'Other',
]

export function Sidebar({
  activeCategory,
  onCategoryChange,
  onAddTool,
  isMobile,
  isOpen,
  onClose,
}) {
  return (
    <>
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isMobile && isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">⚙️</div>
            <div>
              <h1>InfraHub</h1>
              <p>Infrastructure Portal</p>
            </div>
          </div>
          {isMobile && (
            <button className="btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <button className="btn btn-primary sidebar-add-btn" onClick={onAddTool}>
          <Plus size={20} />
          Add New Tool
        </button>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Navigation</h3>
            <ul>
              <li>
                <button
                  className={`nav-link ${activeCategory === 'Dashboard' ? 'active' : ''}`}
                  onClick={() => {
                    onCategoryChange('Dashboard')
                    if (isMobile) onClose()
                  }}
                >
                  <Home size={18} />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  className={`nav-link ${activeCategory === 'All Tools' ? 'active' : ''}`}
                  onClick={() => {
                    onCategoryChange('All Tools')
                    if (isMobile) onClose()
                  }}
                >
                  All Tools
                </button>
              </li>
              <li>
                <button
                  className={`nav-link ${activeCategory === 'Favorites' ? 'active' : ''}`}
                  onClick={() => {
                    onCategoryChange('Favorites')
                    if (isMobile) onClose()
                  }}
                >
                  <Heart size={18} />
                  Favorites
                </button>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-title">Categories</h3>
            <ul>
              {CATEGORIES.filter(cat => cat !== 'All Tools' && cat !== 'Favorites').map(
                (category) => (
                  <li key={category}>
                    <button
                      className={`nav-link ${
                        activeCategory === category ? 'active' : ''
                      }`}
                      onClick={() => {
                        onCategoryChange(category)
                        if (isMobile) onClose()
                      }}
                    >
                      {category}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>
    </>
  )
}
