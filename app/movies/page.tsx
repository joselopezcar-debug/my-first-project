import axios from 'axios'
import MovieSearchCSR from './MovieSearchCSR'

// 🛠️ SOLUCIÓN PARA NEXT.JS 16: Desactiva la validación estática del build para permitir datos dinámicos asíncronos en servidor
export const instant = false

interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

// Función asíncrona del servidor para obtener películas populares (SSR)
async function getPopularMovies() {
  const API_KEY = 'INGRESA_API_AQUI'
  try {
    // 🛠️ CORRECCIÓN DE SINTAXIS: Se añade www. , el /?apikey= y el símbolo \$ antes de las llaves
    const response = await axios.get(`https://omdbapi.com/?apikey=${API_KEY}&s=marvel&type=movie`)
    return response.data.Search ? (response.data.Search.slice(0, 4) as Movie[]) : []
  } catch (error) {
    console.error("Error fetching popular movies in Server:", error);
    return [];
  }
}

export default async function MoviesPage() {
  const popularMovies = await getPopularMovies()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-center text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-2 tracking-tight drop-shadow-md">
          🎬 Galería de Películas y Series
        </h1>
        <p className="text-gray-300 font-medium mb-8">Estrategias Combinadas de Next.js (SSR + CSR)</p>

        {/* Sección SSR */}
        <div className="bg-white/10 backdrop-blur rounded-2xl shadow-2xl p-6 border-4 border-dashed border-green-500 text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-3xl font-bold">⚡ Películas Destacadas (SSR)</h2>
          </div>
          <p className="text-sm text-green-300 mb-4 font-semibold">
            ✅ Renderizado en Servidor: Estos datos vienen directamente estructurados desde el backend de Next.js. ¡Revisa el código fuente!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularMovies.length === 0 ? (
              <div className="col-span-full bg-red-950/40 border-2 border-red-500 text-red-200 p-4 rounded-xl font-medium text-center">
                ❌ No se encontraron datos. Verifica la conexión con el servidor.
              </div>
            ) : (
              popularMovies.map((movie) => {
                // 🛠️ OPTIMIZACIÓN: Proxy de imágenes weserv para asegurar que los posters carguen siempre en localhost sin bloqueos de IMDb
                const cleanPosterUrl = movie.Poster && movie.Poster !== 'N/A'
                  ? `https://weserv.nl{encodeURIComponent(movie.Poster)}`
                  : 'https://placehold.co'

                return (
                  <div key={movie.imdbID} className="bg-black/40 rounded-xl p-3 border-2 border-green-500/50 hover:border-green-400 transition">
                    <img 
                      src={cleanPosterUrl} 
                      alt={movie.Title} 
                      className="w-full h-56 object-cover rounded-lg border border-black mb-2"
                    />
                    <h3 className="font-bold text-white truncate text-sm">{movie.Title}</h3>
                    <p className="text-xs text-gray-400">Año: {movie.Year}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Sección CSR - Buscador */}
        <MovieSearchCSR />

      </div>
    </div>
  )
}