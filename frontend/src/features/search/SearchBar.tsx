import React, { useState, FormEvent } from 'react'
import { theme } from '../../styles/theme'
import { Input } from '../../components/ui'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Rechercher de la musique, des vidéos...',
}) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
  }

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          fontSize: theme.fontSizes.lg,
          padding: theme.spacing.lg,
        }}
      />
    </form>
  )
}

export default SearchBar






