import { useState } from 'react';
import { Link } from 'react-router-dom';

const splashVideo = '/droplift-splash.mov';

function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage("You're on the list.");
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Connection failed. Try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-end overflow-hidden">
      {/* Background video loop (muted, no controls = acts like a GIF) */}
      <video
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] object-contain opacity-40 -translate-x-1/2 -translate-y-1/2"
        src={splashVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center pb-12">
        {/* Teaser text */}
        <h1 className="text-2xl md:text-4xl text-white tracking-widest drop-shadow-lg mb-12" style={{ fontFamily: "'Special Elite', cursive" }}>
          Something&apos;s Coming Undone... March 20, 2026
        </h1>

        {/* Email signup */}
        <div className="w-full max-w-md">
          {status === 'success' ? (
            <div className="border border-brand-orange rounded-lg p-6">
              <p className="text-brand-orange text-lg font-semibold">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-black/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
                disabled={status === 'submitting'}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-6 py-3 bg-brand-orange text-black font-bold uppercase tracking-wider rounded-lg hover:bg-brand-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? '...' : 'Sign Up'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="mt-3 text-red-500 text-sm">{message}</p>
          )}
        </div>

        {/* Contact */}
        {/* Contact & Store links */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
          <a
            href="https://www.facebook.com/dropliftband/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-orange transition-colors text-sm uppercase tracking-widest"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Message us on Facebook
          </a>
          <span className="hidden sm:inline text-gray-600">|</span>
          <Link
            to="/store"
            className="text-gray-400 hover:text-brand-orange transition-colors text-sm uppercase tracking-widest"
          >
            Store
          </Link>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[5]" />
    </div>
  );
}

export default App;
