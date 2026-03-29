import { Link } from 'react-router-dom';
import SiteFooter from './SiteFooter';

function App() {

  return (
    <div className="relative min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Nav bar */}
      <header className="relative z-20 border-b border-gray-800 px-6 py-4 grid grid-cols-3 items-center bg-gradient-to-r from-red-700 to-brand-orange">
        <span className="text-white font-black text-2xl tracking-widest uppercase">Droplift</span>
        <nav className="flex items-center justify-center gap-6">
          <Link
            to="/about"
            className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors"
          >
            About
          </Link>
          <Link
            to="/shows"
            className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors"
          >
            Shows
          </Link>
          <Link
            to="/store"
            className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors"
          >
            Store
          </Link>
          <Link
            to="/contact"
            className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors"
          >
            Contact
          </Link>
        </nav>
        <div />
      </header>

      {/* Background video loop (muted, no controls = acts like a GIF) */}
      <video
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] object-contain opacity-40 -translate-x-1/2 -translate-y-1/2"
        src="/undone-canvas.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center py-12">
        {/* New single announcement */}
        <h1 className="text-2xl md:text-3xl text-white tracking-widest drop-shadow-lg mb-12" style={{ fontFamily: "'Special Elite', cursive" }}>
          New single &ldquo;Undone&rdquo; out now
        </h1>

        {/* Looping canvas video */}
        <div className="mb-6 w-full max-w-xs rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <img
            src="https://squarespacemusic.blob.core.windows.net/$web/Droplift_-_Undone (1).png"
            alt="Undone single artwork"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Streaming platform buttons */}
        <div className="flex flex-col items-stretch w-full max-w-xs gap-3 mb-10">
          {/* Spotify */}
          <a
            href="https://open.spotify.com/track/7A3Q5jod99jExmwl1tNost?si=9a277201130d43d9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white font-bold text-sm uppercase tracking-wider hover:border-gray-500 hover:bg-gray-800 transition-all"
          >
            <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
          </a>

          {/* Apple Music */}
          <a
            href="https://music.apple.com/us/album/undone/1882234025?i=1882234028"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white font-bold text-sm uppercase tracking-wider hover:border-gray-500 hover:bg-gray-800 transition-all"
          >
            <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.878 13.677c-1.59.546-2.668 2.032-2.668 3.697 0 1.804 1.289 2.626 2.803 2.626 1.514 0 2.514-.76 2.935-2.27l.019-.054V6.18l5.47-1.578v6.84c-1.59.546-2.668 2.032-2.668 3.697 0 1.804 1.289 2.626 2.803 2.626s2.514-.76 2.935-2.27l.019-.054V2.527L8.878 5.086v8.591z"/>
            </svg>
            Apple Music
          </a>

          {/* YouTube */}
          <a
            href="https://youtu.be/9A2jUPzl_aI?si=5UTB8RuGAF8zH1Tv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white font-bold text-sm uppercase tracking-wider hover:border-gray-500 hover:bg-gray-800 transition-all"
          >
            <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube
          </a>
        </div>

      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[5]" />
      <SiteFooter />
    </div>
  );
}

export default App;
