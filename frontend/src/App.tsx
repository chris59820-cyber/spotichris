import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { PlayerProvider } from './contexts/PlayerContext'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import WebSocketTest from './pages/WebSocketTest'
import Login from './features/auth/components/LoginForm'
import Register from './features/auth/components/RegisterForm'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="library" element={<Library />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<Admin />} />
                <Route path="websocket-test" element={<WebSocketTest />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

