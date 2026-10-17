'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

interface MovieDetail extends Movie {
  Plot: string
  Director: string
  Actors: string
  Genre: string
  imdbRating: string
}

export default function MovieSearchCSR() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  const API_KEY = 'INGRESA_API_AQUI' // Clave provista en tu guía de laboratorio

  // useEffect para buscar películas en tiempo real cuando cambia el input
  useEffect(() => {
    if (query.trim().length < 3) {
      setMovies([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        // 🛠️ CORRECCIÓN: Formato de URL corregido incluyendo www. , /?apikey= y el símbolo \$
        const response = await axios.get(`https://omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`)
        if (response.data.Search) {
          setMovies(response.data.Search)
        } else {
          setMovies([])
        }
      } catch (error) {
        console.error("Error buscando películas:", error)
      } finally {
        setLoading(false)
      }
    }, 500) // Debounce de 500ms para no saturar la API

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  // Función para obtener detalles e inicializar la ventana modal
  const handleOpenModal = async (id: string) => {
    setModalLoading(true)
    try {
      // 🛠️ CORRECCIÓN: Formato de URL corregido para la consulta por ID individual (?apikey= y \$)
      const response = await axios.get(`https://omdbapi.com${API_KEY}&i=${id}`)
      setSelectedMovie(response.data)
    } catch (error) {
      console.error("Error al obtener detalles:", error)
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="mt-12 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 border-4 border-black">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <h2 className="text-3xl font-bold text-gray-800">🔍 Buscador en Tiempo Real (CSR)</h2>
      </div>

      {/* Input de Búsqueda */}
      <input
        type="text"
        placeholder="Escribe al menos 3 caracteres (ej. Avengers, Batman...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-4 mb-6 border-4 border-black text-gray-900 font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 placeholder-gray-500"
      />

      {/* Grid de Resultados */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Buscando en OMDb...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {movies.map((movie) => {
            // Proxy opcional para evadir bloqueos de imágenes de Amazon/OMDb en entornos locales
            const cleanPosterUrl = movie.Poster && movie.Poster !== 'N/A'
              ? `https://weserv.nl{encodeURIComponent(movie.Poster)}`
              : 'https://placehold.co'

            return (
              <div 
                key={movie.imdbID}
                onClick={() => handleOpenModal(movie.imdbID)}
                className="bg-gray-100 rounded-xl p-3 border-2 border-black cursor-pointer hover:scale-105 hover:bg-blue-50 transition transform duration-200 text-left"
              >
                <img 
                  src={cleanPosterUrl} 
                  alt={movie.Title}
                  className="w-full h-48 object-cover rounded-lg border border-black mb-2"
                />
                <h3 className="font-bold text-gray-900 truncate text-sm">{movie.Title}</h3>
                <p className="text-xs text-gray-600 font-semibold">📅 Año: {movie.Year}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Ventana Modal Opcional de Detalles */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black px-3 py-1 rounded-lg"
            >
              X
            </button>
            <div className="flex flex-col md:flex-row gap-6 mt-4 text-left">
              {(() => {
                const modalPosterUrl = selectedMovie.Poster && selectedMovie.Poster !== 'N/A'
                  ? `https://weserv.nl{encodeURIComponent(selectedMovie.Poster)}`
                  : 'https://placehold.co'
                return (
                  <img 
                    src={modalPosterUrl} 
                    alt={selectedMovie.Title}
                    className="w-full md:w-48 h-auto object-cover rounded-xl border-2 border-black mx-auto"
                  />
                )
              })()}
              <div className="text-gray-800 flex-1">
                <h3 className="text-3xl font-black text-black capitalize mb-2">{selectedMovie.Title}</h3>
                <p className="text-sm mb-2"><strong className="text-blue-700">🎬 Género:</strong> {selectedMovie.Genre}</p>
                <p className="text-sm mb-2"><strong className="text-blue-700">📅 Año:</strong> {selectedMovie.Year} | <strong className="text-blue-700">⭐ Rating:</strong> {selectedMovie.imdbRating}</p>
                <p className="text-sm mb-2"><strong className="text-blue-700">👔 Director:</strong> {selectedMovie.Director}</p>
                <p className="text-sm mb-4"><strong className="text-blue-700">👥 Actores:</strong> {selectedMovie.Actors}</p>
                <div className="bg-gray-100 p-3 rounded-lg border border-black">
                  <p className="text-sm italic">"{selectedMovie.Plot}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}