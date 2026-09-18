import React, { useState, useEffect } from 'react'
import { Menu, RefreshCw } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { SearchBar } from './components/SearchBar'
import { ToolGrid } from './components/ToolGrid'
import { AddToolModal } from './components/AddToolModal'
import { ToolDetailsDrawer } from './components/ToolDetailsDrawer'
import { DeleteConfirmation } from './components/DeleteConfirmation'
import { CredentialsModal } from './components/CredentialsModal'
import { Toast, useToast } from './components/Toast'
import { toolAPI } from './services/api'
import './styles/app.css'

function App() {
  // State
  const [tools, setTools] = useState([])
  const [allTools, setAllTools] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  const [activeCategory, setActiveCategory] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals
  const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingToolId, setEditingToolId] = useState(null)
  const [editingTool, setEditingTool] = useState(null)
  const [credentialTool, setCredentialTool] = useState(null)
  
  // Drawer
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [selectedToolId, setSelectedToolId] = useState(null)
  
  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    toolId: null,
    childCount: 0,
  })
  
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load tools
  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    setIsLoading(true)
    try {
      // Load all tools
      const allResponse = await toolAPI.getTools({ category: 'All Tools' })
      if (allResponse.success) {
        setAllTools(allResponse.data)
      }

      // Load filtered tools based on category
      const filters = {}
      if (searchQuery) {
        filters.search = searchQuery
      }
      if (activeCategory === 'Favorites') {
        filters.favorites = true
      } else if (activeCategory !== 'Dashboard' && activeCategory !== 'All Tools') {
        filters.category = activeCategory
      }

      const response = await toolAPI.getTools(filters)
      if (response.success) {
        setTools(response.data)
      }
    } catch (err) {
      showToast('Failed to load tools', 'error')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Reload on category or search change
  useEffect(() => {
    loadTools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery])

  // Handle add/edit tool
  const handleSubmitTool = async (formData, mode, toolId) => {
    try {
      if (mode === 'edit' && toolId) {
        // Update existing tool
        const response = await toolAPI.updateTool(toolId, formData)
        if (response.success) {
          showToast(`Tool updated successfully`, 'success')
          setIsAddToolModalOpen(false)
          loadTools()
        } else {
          showToast(response.error, 'error')
        }
      } else {
        // Create new tool
        const response = await toolAPI.createTool(formData)
        if (response.success) {
          showToast(response.message, 'success')
          setIsAddToolModalOpen(false)
          loadTools()
        } else {
          showToast(response.error, 'error')
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save tool', 'error')
    }
  }

  // Handle edit tool
  const handleEditTool = (toolId) => {
    const tool = allTools.find(t => t.id === toolId)
    if (tool) {
      setEditingTool(tool)
      setEditingToolId(toolId)
      setIsEditMode(true)
      setIsDetailsDrawerOpen(false)
      setIsAddToolModalOpen(true)
    }
  }

  // Handle delete tool
  const handleDeleteTool = async (toolId) => {
    const tool = allTools.find(t => t.id === toolId)
    if (tool) {
      setDeleteConfirmation({
        isOpen: true,
        toolId,
        childCount: tool.child_count || 0,
      })
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await toolAPI.deleteTool(deleteConfirmation.toolId)
      if (response.success) {
        showToast(response.message, 'success')
        loadTools()
        setDeleteConfirmation({ isOpen: false, toolId: null, childCount: 0 })
      } else {
        showToast(response.error, 'error')
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete tool', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle favorite
  const handleFavorite = async (toolId) => {
    try {
      const response = await toolAPI.toggleFavorite(toolId)
      if (response.success) {
        loadTools()
      }
    } catch (err) {
      showToast('Failed to update favorite', 'error')
    }
  }

  // Handle open tool
  const handleOpenTool = (url) => {
    window.open(url, '_blank')
  }

  const handleViewCredentials = (tool) => {
    setIsDetailsDrawerOpen(false)
    setCredentialTool(tool)
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onAddTool={() => {
          setIsEditMode(false)
          setEditingToolId(null)
          setEditingTool(null)
          setIsAddToolModalOpen(true)
        }}
        isMobile={isMobile}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="header-left">
            {isMobile && (
              <button className="btn-icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={20} />
              </button>
            )}
            <div className="breadcrumb">
              <span>Workspace</span>
              <span>›</span>
              <span>Infrastructure Tools</span>
            </div>
          </div>
          
          <div className="header-right">
            <button className="btn-icon" onClick={loadTools} title="Refresh">
              <RefreshCw size={20} />
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="search-section">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search tools, services..."
          />
        </div>

        {/* Hero Section */}
        {activeCategory === 'Dashboard' && tools.length > 0 && (
          <section className="hero">
            <h2>Everything your infrastructure team needs, in one place</h2>
            <p>One portal for monitoring, cloud, networking, storage, service desk and lab consoles.</p>
          </section>
        )}

        {/* Stats Cards */}
        {activeCategory === 'Dashboard' && (
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-value">{allTools.length}</div>
              <div className="stat-label">Total Tools</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{allTools.filter(t => t.favorite).length}</div>
              <div className="stat-label">Favorites</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{new Set(allTools.map(t => t.category)).size}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{allTools.filter(t => t.child_count > 0).reduce((sum, t) => sum + t.child_count, 0)}</div>
              <div className="stat-label">Sub-tools</div>
            </div>
          </div>
        )}

        {/* Tools Section */}
        <section className="tools-section">
          <div className="tools-header">
            <h3>
              {activeCategory === 'Dashboard' ? 'Tool Catalog' : `${activeCategory}`}
              {tools.length > 0 && <span className="count">({tools.length})</span>}
            </h3>
          </div>

          <ToolGrid
            tools={tools}
            isLoading={isLoading}
            onToolClick={(toolId) => {
              setSelectedToolId(toolId)
              setIsDetailsDrawerOpen(true)
            }}
            onEdit={handleEditTool}
            onDelete={handleDeleteTool}
            onFavorite={handleFavorite}
            onOpenTool={handleOpenTool}
            onViewCredentials={handleViewCredentials}
          />
        </section>
      </main>

      {/* Modals */}
      <AddToolModal
        isOpen={isAddToolModalOpen}
        onClose={() => {
          setIsAddToolModalOpen(false)
          setIsEditMode(false)
          setEditingToolId(null)
          setEditingTool(null)
        }}
        onSubmit={handleSubmitTool}
        allTools={allTools}
        mode={isEditMode ? 'edit' : 'create'}
        initialTool={editingTool}
      />

      <ToolDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        toolId={selectedToolId}
        onClose={() => {
          setIsDetailsDrawerOpen(false)
          setSelectedToolId(null)
        }}
        onEdit={handleEditTool}
        onDelete={handleDeleteTool}
        onFavorite={handleFavorite}
        onViewCredentials={handleViewCredentials}
        onAddChild={(parentId) => {
          // TODO: Implement add child UI
          setIsAddToolModalOpen(true)
        }}
      />

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        title="Delete Tool?"
        message="This action cannot be undone."
        childCount={deleteConfirmation.childCount}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, toolId: null, childCount: 0 })}
        isDeleting={isDeleting}
      />

      <CredentialsModal
        isOpen={Boolean(credentialTool)}
        tool={credentialTool}
        onClose={() => setCredentialTool(null)}
        onSaved={(message) => showToast(message, 'success')}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={toast.duration}
        />
      )}
    </div>
  )
}

export default App
