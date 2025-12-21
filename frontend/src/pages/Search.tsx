import React, { useState } from 'react'
import { theme } from '../styles/theme'
import SearchBar from '../features/search/SearchBar'
import SearchResults from '../features/search/SearchResults'
import { searchService, SearchResults as SearchResultsType } from '../services/search.service'

const Search: React.FC = () => {
  const [results, setResults] = useState<SearchResultsType>({ music: [], video: [] })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const searchResults = await searchService.search(query)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ music: [], video: [] })
    } finally {
      setLoading(false)
    }
  }

  const pageStyle: React.CSSProperties = {
    padding: theme.spacing.xl,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: 700,
    marginBottom: theme.spacing.xl,
    color: theme.colors.textPrimary,
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Rechercher</h1>
      <div style={{ marginBottom: theme.spacing['2xl'] }}>
        <SearchBar onSearch={handleSearch} />
      </div>
      {hasSearched && (
        <SearchResults music={results.music} video={results.video} loading={loading} />
      )}
    </div>
  )
}

export default Search

