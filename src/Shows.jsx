import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from './SiteFooter';

const SHOWS_API =
  'https://retrieve-shows-api.azurewebsites.net/api/Shows?code=AmVc4bApim9xtR3Jl7y4FisknIJSgTrRHC4pPeB_q_9GAzFu1tILDg==';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
    month: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
    day: d.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' }),
    year: d.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' }),
  };
}

function Shows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(SHOWS_API)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data
          .filter((s) => s.band?.toLowerCase() === 'droplift')
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setShows(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav bar */}
      <header className="border-b border-gray-800 px-6 py-4 grid grid-cols-3 items-center bg-gradient-to-r from-red-700 to-brand-orange">
        <Link to="/" className="text-white font-black text-2xl tracking-widest uppercase">
          Droplift
        </Link>
        <nav className="flex items-center justify-center gap-6">
          <Link to="/about" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
            About
          </Link>
          <Link to="/shows" className="text-white text-sm uppercase tracking-wider">
            Shows
          </Link>
          <Link to="/store" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
            Store
          </Link>
          <Link to="/contact" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
            Contact
          </Link>
        </nav>
        <div />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl text-brand-orange tracking-wider mb-10" style={{ fontFamily: "'Special Elite', cursive" }}>
          Shows
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading shows...</p>
        ) : shows.length === 0 ? (
          <div className="border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">No shows planned at this time.</p>
            <p className="text-gray-600 text-sm">
              Contact us for booking:{' '}
              <a
                href="https://www.facebook.com/dropliftband/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-orange hover:underline"
              >
                Message us on Facebook
              </a>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {shows.map((show) => {
              const { weekday, month, day, year } = formatDate(show.date);
              return (
                <div
                  key={show.id}
                  className="flex flex-col sm:flex-row gap-6 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                >
                  {/* Date block */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-900 px-6 py-5 sm:w-28 text-center">
                    <span className="text-brand-orange text-xs uppercase tracking-widest">{weekday}</span>
                    <span className="text-white font-black text-4xl leading-none">{day}</span>
                    <span className="text-gray-400 text-sm uppercase tracking-wider">{month} {year}</span>
                  </div>

                  {/* Promo image */}
                  {show.promo && (
                    <div className="sm:w-32 flex-shrink-0">
                      <img
                        src={show.promo}
                        alt={show.name}
                        className="w-full h-full object-cover sm:h-full max-h-40 sm:max-h-none"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex flex-col justify-center gap-1 px-4 pb-5 pt-0 sm:py-5 flex-1 min-w-0">
                    <h2 className="text-white font-bold text-lg leading-snug">{show.name}</h2>
                    <p className="text-brand-orange text-sm font-semibold">{show.venue}</p>
                    <p className="text-gray-400 text-sm">{show.address}</p>

                    <div className="flex flex-wrap gap-3 mt-3">
                      {show.googlE_MAPS_LINK && (
                        <a
                          href={show.googlE_MAPS_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          Directions
                        </a>
                      )}
                      {show.facebooK_LINK && (
                        <a
                          href={show.facebooK_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook Event
                        </a>
                      )}
                      {show.tickeT_LINK && (
                        <a
                          href={show.tickeT_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-orange text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-brand-orange-light transition-colors"
                        >
                          Get Tickets
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default Shows;
