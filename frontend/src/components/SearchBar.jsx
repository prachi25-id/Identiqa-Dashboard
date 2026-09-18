import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import '../styles/searchbar.css'

export function SearchBar({ onSearch, placeholder = 'Search tools...' }) {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch(newValue)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="search-input"
      />
      {value && (
        <button onClick={handleClear} className="btn-icon search-clear">
          <X size={18} />
        </button>
      )}
    </div>
  )
}
